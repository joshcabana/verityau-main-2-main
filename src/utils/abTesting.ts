import { supabase } from "@/integrations/supabase/client";

export interface ABTest {
  id: string;
  name: string;
  description: string | null;
  variants: Record<string, { weight: number; config: any }>;
  active: boolean;
}

export async function getAssignedVariant(
  testName: string,
  userId: string
): Promise<string | null> {
  try {
    // Get the test
    const { data: test } = await supabase
      .from("ab_tests")
      .select("*")
      .eq("name", testName)
      .eq("active", true)
      .single();

    if (!test) return null;

    // Check if user already has an assignment
    const { data: existing } = await supabase
      .from("ab_test_assignments")
      .select("variant")
      .eq("test_id", test.id)
      .eq("user_id", userId)
      .single();

    if (existing) return existing.variant;

    // Assign a variant based on weights
    const variants = test.variants as Record<string, { weight: number; config: any }>;
    const variant = assignVariant(variants);

    // Save assignment
    await supabase.from("ab_test_assignments").insert({
      test_id: test.id,
      user_id: userId,
      variant,
    });

    return variant;
  } catch (error) {
    console.error("A/B test assignment error:", error);
    return null;
  }
}

function assignVariant(
  variants: Record<string, { weight: number; config: any }>
): string {
  const totalWeight = Object.values(variants).reduce(
    (sum, v) => sum + v.weight,
    0
  );
  let random = Math.random() * totalWeight;

  for (const [name, { weight }] of Object.entries(variants)) {
    random -= weight;
    if (random <= 0) return name;
  }

  return Object.keys(variants)[0]; // Fallback
}

export async function getTestConfig(
  testName: string,
  userId: string
): Promise<any | null> {
  try {
    const variant = await getAssignedVariant(testName, userId);
    if (!variant) return null;

    const { data: test } = await supabase
      .from("ab_tests")
      .select("variants")
      .eq("name", testName)
      .single();

    if (!test?.variants) return null;
    const variants = test.variants as Record<string, { weight: number; config: any }>;
    return variants[variant]?.config || null;
  } catch (error) {
    console.error("Error getting test config:", error);
    return null;
  }
}
