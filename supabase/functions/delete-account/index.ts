import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    const errors: string[] = [];

    console.log(`Starting account deletion for user: ${userId}`);

    // Cancel any active Stripe subscription first
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_product_id")
        .eq("user_id", userId)
        .single();

      if (profile?.subscription_product_id) {
        // Note: In production, you'd call Stripe API to cancel the subscription
        console.log("User has active subscription - should cancel via Stripe");
      }
    } catch (e) {
      console.log("No subscription to cancel");
    }

    // Delete in order (respecting foreign keys)
    // Messages must be deleted before matches (foreign key on match_id)
    const deletionOrder = [
      { table: "messages", conditions: [{ column: "sender_id", value: userId }] },
      { table: "verity_dates", conditions: [], note: "Deleted via cascade from matches" },
      { table: "matches", conditions: [
        { column: "user1", value: userId },
        { column: "user2", value: userId }
      ]},
      { table: "likes", conditions: [
        { column: "liker_id", value: userId },
        { column: "liked_id", value: userId }
      ]},
      { table: "notifications", conditions: [{ column: "user_id", value: userId }] },
      { table: "reports", conditions: [{ column: "reporter_id", value: userId }] },
      { table: "blocked_users", conditions: [
        { column: "blocker_id", value: userId },
        { column: "blocked_id", value: userId }
      ]},
      { table: "preferences", conditions: [{ column: "user_id", value: userId }] },
      { table: "profiles", conditions: [{ column: "user_id", value: userId }] },
    ];

    for (const { table, conditions, note } of deletionOrder) {
      if (conditions.length === 0) {
        console.log(`Skipping ${table}: ${note || "no direct conditions"}`);
        continue;
      }

      for (const { column, value } of conditions) {
        try {
          const { error } = await supabase
            .from(table)
            .delete()
            .eq(column, value);

          if (error) {
            console.error(`Error deleting from ${table} where ${column}=${value}:`, error);
            errors.push(`${table}.${column}: ${error.message}`);
          } else {
            console.log(`Deleted from ${table} where ${column}=${value}`);
          }
        } catch (e) {
          console.error(`Exception deleting from ${table}:`, e);
          errors.push(`${table}: ${e.message}`);
        }
      }
    }

    // Delete storage files (photos and videos)
    const storageBuckets = ["photos", "videos", "verification-videos"];
    
    for (const bucket of storageBuckets) {
      try {
        const { data: files, error: listError } = await supabase.storage
          .from(bucket)
          .list(userId);

        if (listError) {
          console.log(`Could not list files in ${bucket}:`, listError.message);
          continue;
        }

        if (files && files.length > 0) {
          const filePaths = files.map(f => `${userId}/${f.name}`);
          const { error: removeError } = await supabase.storage
            .from(bucket)
            .remove(filePaths);

          if (removeError) {
            console.error(`Error removing files from ${bucket}:`, removeError);
            errors.push(`storage.${bucket}: ${removeError.message}`);
          } else {
            console.log(`Removed ${files.length} files from ${bucket}`);
          }
        }
      } catch (e) {
        console.log(`Bucket ${bucket} may not exist:`, e.message);
      }
    }

    // Finally, delete the auth user
    try {
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId);
      
      if (deleteUserError) {
        console.error("Error deleting auth user:", deleteUserError);
        errors.push(`auth: ${deleteUserError.message}`);
      } else {
        console.log("Auth user deleted successfully");
      }
    } catch (e) {
      console.error("Exception deleting auth user:", e);
      errors.push(`auth: ${e.message}`);
    }

    if (errors.length > 0) {
      console.log("Account deletion completed with errors:", errors);
      return new Response(
        JSON.stringify({ 
          success: true, 
          partial: true,
          message: "Account deleted with some errors",
          errors 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Account deletion completed successfully");
    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error in delete-account:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

