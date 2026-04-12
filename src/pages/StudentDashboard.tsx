import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, CheckCircle, XCircle } from "lucide-react";

interface CertRequest {
  id: string;
  student_name: string;
  certificate_title: string;
  organisation_name: string;
  course_name: string;
  institution: string;
  date_completed: string;
  status: "pending" | "approved" | "rejected";
  certificate_id: string | null;
  block_hash: string | null;
  created_at: string;
}

const StudentDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CertRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    studentName: "",
    certificateTitle: "",
    organisationName: "",
    courseName: "",
    institution: "",
    dateCompleted: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("certificate_requests").insert({
        student_id: user.id,
        student_name: form.studentName,
        certificate_title: form.certificateTitle,
        organisation_name: form.organisationName,
        course_name: form.courseName,
        institution: form.institution,
        date_completed: form.dateCompleted,
      });
      if (error) throw error;
      toast.success("Certificate request submitted!");
      setShowForm(false);
      setForm({ studentName: "", certificateTitle: "", organisationName: "", courseName: "", institution: "", dateCompleted: "" });
      fetchRequests();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request");
    } finally {
      setLoading(false);
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

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
            <p className="text-muted-foreground">Submit and track your certificate requests</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" /> New Request
            </Button>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="glass-card rounded-xl p-8 space-y-5 mb-8">
            <h2 className="text-xl font-semibold text-foreground">Submit Certificate for Approval</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Your Name</Label>
                <Input placeholder="John Doe" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} className="mt-1" required />
              </div>
              <div>
                <Label>Certificate Title</Label>
                <Input placeholder="Certificate of Completion" value={form.certificateTitle} onChange={(e) => setForm({ ...form, certificateTitle: e.target.value })} className="mt-1" required />
              </div>
              <div>
                <Label>Organisation Name</Label>
                <Input placeholder="Acme Corp" value={form.organisationName} onChange={(e) => setForm({ ...form, organisationName: e.target.value })} className="mt-1" required />
              </div>
              <div>
                <Label>Course / Degree</Label>
                <Input placeholder="B.Sc. Computer Science" value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} className="mt-1" required />
              </div>
              <div>
                <Label>Institution</Label>
                <Input placeholder="MIT" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} className="mt-1" required />
              </div>
              <div>
                <Label>Date Completed</Label>
                <Input type="date" value={form.dateCompleted} onChange={(e) => setForm({ ...form, dateCompleted: e.target.value })} className="mt-1" required />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Request"}</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        )}

        {requests.length === 0 ? (
          <div className="glass-card rounded-xl p-16 text-center">
            <p className="text-muted-foreground text-lg">No certificate requests yet. Click "New Request" to submit one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">{req.certificate_title}</h3>
                  <Badge variant={statusVariant(req.status)} className="flex items-center gap-1">
                    {statusIcon(req.status)} {req.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Student:</span> <span className="text-foreground">{req.student_name}</span></div>
                  <div><span className="text-muted-foreground">Organisation:</span> <span className="text-foreground">{req.organisation_name}</span></div>
                  <div><span className="text-muted-foreground">Course:</span> <span className="text-foreground">{req.course_name}</span></div>
                  <div><span className="text-muted-foreground">Institution:</span> <span className="text-foreground">{req.institution}</span></div>
                  <div><span className="text-muted-foreground">Completed:</span> <span className="text-foreground">{req.date_completed}</span></div>
                  <div><span className="text-muted-foreground">Submitted:</span> <span className="text-foreground">{new Date(req.created_at).toLocaleDateString()}</span></div>
                </div>
                {req.status === "approved" && req.certificate_id && (
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

export default StudentDashboard;
