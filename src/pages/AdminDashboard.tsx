import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { addCertificate, generateCertificateId } from "@/lib/blockchain";
import { CheckCircle, XCircle, Clock, Shield } from "lucide-react";

interface CertRequest {
  id: string;
  student_name: string;
  certificate_title: string;
  organisation_name: string;
  course_name: string;
  institution: string;
  date_completed: string;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  certificate_id: string | null;
  block_hash: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CertRequest[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("certificate_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setRequests(data as CertRequest[]);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (req: CertRequest) => {
    setProcessingId(req.id);
    try {
      const certId = generateCertificateId();
      const block = await addCertificate({
        studentName: req.student_name,
        certificateTitle: req.certificate_title,
        organisationName: req.organisation_name,
        courseName: req.course_name,
        institution: req.institution,
        dateIssued: req.date_completed,
        certificateId: certId,
      });

      const { error } = await supabase
        .from("certificate_requests")
        .update({
          status: "approved" as const,
          certificate_id: certId,
          block_hash: block.hash,
          admin_notes: notes[req.id] || null,
        })
        .eq("id", req.id);

      if (error) throw error;
      toast.success("Certificate approved and stored on blockchain!");
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (req: CertRequest) => {
    setProcessingId(req.id);
    try {
      const { error } = await supabase
        .from("certificate_requests")
        .update({
          status: "rejected" as const,
          admin_notes: notes[req.id] || null,
        })
        .eq("id", req.id);

      if (error) throw error;
      toast.success("Certificate request rejected.");
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject");
    } finally {
      setProcessingId(null);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-4 h-4 text-primary" />;
      case "rejected": return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const statusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "approved": return "default";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  const pending = requests.filter((r) => r.status === "pending");
  const processed = requests.filter((r) => r.status !== "pending");

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Review and approve student certificate requests</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>

        {/* Pending */}
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Pending Requests ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center mb-8">
            <p className="text-muted-foreground">No pending requests.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-10">
            {pending.map((req) => (
              <div key={req.id} className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{req.certificate_title}</h3>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> pending
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-4">
                  <div><span className="text-muted-foreground">Student:</span> <span className="text-foreground">{req.student_name}</span></div>
                  <div><span className="text-muted-foreground">Organisation:</span> <span className="text-foreground">{req.organisation_name}</span></div>
                  <div><span className="text-muted-foreground">Course:</span> <span className="text-foreground">{req.course_name}</span></div>
                  <div><span className="text-muted-foreground">Institution:</span> <span className="text-foreground">{req.institution}</span></div>
                  <div><span className="text-muted-foreground">Completed:</span> <span className="text-foreground">{req.date_completed}</span></div>
                  <div><span className="text-muted-foreground">Submitted:</span> <span className="text-foreground">{new Date(req.created_at).toLocaleDateString()}</span></div>
                </div>
                <Textarea
                  placeholder="Admin notes (optional)..."
                  value={notes[req.id] || ""}
                  onChange={(e) => setNotes({ ...notes, [req.id]: e.target.value })}
                  className="mb-4"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(req)}
                    disabled={processingId === req.id}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {processingId === req.id ? "Processing..." : "Approve & Issue"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(req)}
                    disabled={processingId === req.id}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Processed */}
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Processed ({processed.length})
        </h2>
        {processed.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-muted-foreground">No processed requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {processed.map((req) => (
              <div key={req.id} className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">{req.certificate_title}</h3>
                  <Badge variant={statusVariant(req.status)} className="flex items-center gap-1">
                    {statusIcon(req.status)} {req.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Student:</span> <span className="text-foreground">{req.student_name}</span></div>
                  <div><span className="text-muted-foreground">Course:</span> <span className="text-foreground">{req.course_name}</span></div>
                  <div><span className="text-muted-foreground">Institution:</span> <span className="text-foreground">{req.institution}</span></div>
                </div>
                {req.certificate_id && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">Certificate ID: </span>
                    <code className="text-primary font-mono text-sm">{req.certificate_id}</code>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
