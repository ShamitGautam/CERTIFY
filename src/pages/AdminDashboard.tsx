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
import { CheckCircle, XCircle, Clock, Shield, FileText } from "lucide-react";

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

type CertificateMeta = {
  pdfName?: string;
  pdfDataUrl?: string;
  adminNote?: string;
};

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

  const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : "Something went wrong");

  const parseCertificateMeta = (value: string | null): CertificateMeta => {
    if (!value) return {};

    try {
      const parsed = JSON.parse(value) as CertificateMeta;
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      return { adminNote: value };
    }

    return {};
  };

  const buildCertificateMeta = (existing: string | null, note: string): string => {
    const current = parseCertificateMeta(existing);
    return JSON.stringify({
      pdfName: current.pdfName,
      pdfDataUrl: current.pdfDataUrl,
      adminNote: note || current.adminNote || "",
    });
  };

  const openPdfInNewTab = (pdfDataUrl: string) => {
    const [header, encodedData] = pdfDataUrl.split(",");

    if (!encodedData) {
      toast.error("Unable to open the uploaded PDF.");
      return;
    }

    const mimeTypeMatch = header.match(/data:(.*?);base64/);
    const mimeType = mimeTypeMatch?.[1] || "application/pdf";
    const binaryString = window.atob(encodedData);
    const binaryLength = binaryString.length;
    const bytes = new Uint8Array(binaryLength);

    for (let index = 0; index < binaryLength; index += 1) {
      bytes[index] = binaryString.charCodeAt(index);
    }

    const blobUrl = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
    const popup = window.open(blobUrl, "_blank", "noopener,noreferrer");

    if (!popup) {
      URL.revokeObjectURL(blobUrl);
      toast.error("Popup blocked. Allow popups to view the PDF.");
      return;
    }

    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
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
          admin_notes: buildCertificateMeta(req.admin_notes, notes[req.id] || ""),
        })
        .eq("id", req.id);

      if (error) throw error;
      toast.success("Certificate approved and stored on blockchain!");
      fetchRequests();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || "Failed to approve");
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
          admin_notes: buildCertificateMeta(req.admin_notes, notes[req.id] || ""),
        })
        .eq("id", req.id);

      if (error) throw error;
      toast.success("Certificate request rejected.");
      fetchRequests();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || "Failed to reject");
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

  const renderCertificateMeta = (value: string | null) => parseCertificateMeta(value);

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
                {renderCertificateMeta(req.admin_notes).pdfDataUrl && (
                  <div className="mb-4 rounded-lg border border-border bg-background/50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Uploaded PDF</p>
                          <p className="text-xs text-muted-foreground">
                            {renderCertificateMeta(req.admin_notes).pdfName || "Certificate PDF"}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" type="button" onClick={() => openPdfInNewTab(renderCertificateMeta(req.admin_notes).pdfDataUrl!)}>
                        Open PDF
                      </Button>
                    </div>
                    <iframe
                      title={`Certificate PDF for ${req.student_name}`}
                      src={renderCertificateMeta(req.admin_notes).pdfDataUrl!}
                      className="mt-4 h-[420px] w-full rounded-md border border-border bg-background"
                    />
                  </div>
                )}
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
