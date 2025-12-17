import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Shield, Ban, CheckCircle, XCircle, AlertTriangle, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  details: string;
  context: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  reporter_name?: string;
  reported_user_name?: string;
  reported_user_banned?: boolean;
}

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadReports();
    }
  }, [isAdmin, filterStatus]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (error || !roles) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/main");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin access:", error);
      toast.error("Access denied");
      navigate("/main");
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      let query = supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch reporter and reported user names
      const reportsWithNames = await Promise.all(
        (data || []).map(async (report) => {
          const [reporterProfile, reportedProfile] = await Promise.all([
            supabase
              .from("profiles")
              .select("name")
              .eq("user_id", report.reporter_id)
              .single(),
            supabase
              .from("profiles")
              .select("name, banned")
              .eq("user_id", report.reported_user_id)
              .single(),
          ]);

          return {
            ...report,
            reporter_name: reporterProfile.data?.name || "Unknown",
            reported_user_name: reportedProfile.data?.name || "Unknown",
            reported_user_banned: reportedProfile.data?.banned || false,
          };
        })
      );

      setReports(reportsWithNames);
    } catch (error) {
      console.error("Error loading reports:", error);
      toast.error("Failed to load reports");
    }
  };

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setAdminNotes(report.admin_notes || "");
  };

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status: newStatus,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;

      toast.success(`Report marked as ${newStatus}`);
      setSelectedReport(null);
      loadReports();
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("Failed to update report");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBanUser = async (userId: string, reportId: string) => {
    if (!confirm("Are you sure you want to ban this user? This action will prevent them from using the app.")) {
      return;
    }

    setActionLoading(true);
    try {
      // Ban the user
      const { error: banError } = await supabase
        .from("profiles")
        .update({ banned: true })
        .eq("user_id", userId);

      if (banError) throw banError;

      // Update report status
      const { error: reportError } = await supabase
        .from("reports")
        .update({
          status: "resolved",
          admin_notes: `${adminNotes}\n\n[User banned on ${new Date().toISOString()}]`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (reportError) throw reportError;

      toast.success("User banned successfully");
      setSelectedReport(null);
      loadReports();
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error("Failed to ban user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (!confirm("Are you sure you want to unban this user?")) {
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ banned: false })
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("User unbanned successfully");
      loadReports();
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error("Failed to unban user");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      pending: { variant: "secondary", icon: AlertTriangle },
      under_review: { variant: "default", icon: Shield },
      resolved: { variant: "outline", icon: CheckCircle },
      dismissed: { variant: "outline", icon: XCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/main")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Admin Panel</h1>
            </div>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{reports.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">
                {reports.filter((r) => r.status === "pending").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Under Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {reports.filter((r) => r.status === "under_review").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {reports.filter((r) => r.status === "resolved").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No reports found
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id} className="hover:bg-secondary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="font-semibold">{report.reason}</span>
                        {report.reported_user_banned && (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="h-3 w-3" />
                            Banned
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Reporter: <strong>{report.reporter_name}</strong> • 
                        Reported: <strong>{report.reported_user_name}</strong> • 
                        {new Date(report.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(report.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(report)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {report.details || "No additional details provided"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Context: {report.context}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Report Details Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Report Details
              {selectedReport?.reported_user_banned && (
                <Badge variant="destructive" className="gap-1">
                  <Ban className="h-3 w-3" />
                  User Banned
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Submitted on {selectedReport && new Date(selectedReport.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Reason</h4>
                <p className="text-sm">{selectedReport.reason}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Details</h4>
                <p className="text-sm">{selectedReport.details || "No details provided"}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Context</h4>
                <p className="text-sm">{selectedReport.context}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Reporter</h4>
                <p className="text-sm">{selectedReport.reporter_name}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Reported User</h4>
                <p className="text-sm">{selectedReport.reported_user_name}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Status</h4>
                {getStatusBadge(selectedReport.status)}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Admin Notes</h4>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this report..."
                  rows={4}
                />
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                {!selectedReport.reported_user_banned ? (
                  <Button
                    variant="destructive"
                    onClick={() => handleBanUser(selectedReport.reported_user_id, selectedReport.id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Ban className="h-4 w-4 mr-2" />
                    )}
                    Ban User
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => handleUnbanUser(selectedReport.reported_user_id)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Unban User
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus(selectedReport.id, "under_review")}
                  disabled={actionLoading || selectedReport.status === "under_review"}
                >
                  Mark Under Review
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus(selectedReport.id, "dismissed")}
                  disabled={actionLoading || selectedReport.status === "dismissed"}
                >
                  Dismiss
                </Button>

                <Button
                  onClick={() => handleUpdateStatus(selectedReport.id, "resolved")}
                  disabled={actionLoading || selectedReport.status === "resolved"}
                >
                  Mark Resolved
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
