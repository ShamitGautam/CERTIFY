import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addCertificate, generateCertificateId } from "@/lib/blockchain";
import { CheckCircle, Copy } from "lucide-react";

const IssueCertificate = () => {
  const navigate = useNavigate();
  const [issuedId, setIssuedId] = useState<string | null>(null);
  const [issuedHash, setIssuedHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    studentName: "",
    certificateTitle: "",
    organisationName: "",
    courseName: "",
    institution: "",
    dateIssued: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentName || !form.certificateTitle || !form.organisationName || !form.courseName || !form.institution || !form.dateIssued) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const certificateId = generateCertificateId();
      const block = await addCertificate({ ...form, certificateId });
      setIssuedId(certificateId);
      setIssuedHash(block.hash);
      toast.success("Certificate issued and stored on blockchain!");
    } catch {
      toast.error("Failed to issue certificate");
    } finally {
      setLoading(false);
    }
  };

  const copyId = () => {
    if (issuedId) {
      navigator.clipboard.writeText(issuedId);
      toast.success("Certificate ID copied!");
    }
  };

  if (issuedId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <div className="glass-card rounded-xl p-10">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">Certificate Issued!</h2>
            <p className="text-muted-foreground mb-6">
              The certificate has been successfully stored on the blockchain.
            </p>
            <div className="bg-secondary rounded-lg p-4 mb-4">
              <Label className="text-xs text-muted-foreground">Certificate ID</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-primary font-mono text-sm flex-1 break-all">{issuedId}</code>
                <button onClick={copyId} className="text-muted-foreground hover:text-primary transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="bg-secondary rounded-lg p-4 mb-8">
              <Label className="text-xs text-muted-foreground">Block Hash</Label>
              <code className="text-accent font-mono text-xs block mt-1 break-all">{issuedHash}</code>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => { setIssuedId(null); setIssuedHash(null); setForm({ studentName: "", certificateTitle: "", organisationName: "", courseName: "", institution: "", dateIssued: "" }); }}>
                Issue Another
              </Button>
              <Button variant="outline" onClick={() => navigate("/verify")}>
                Verify a Certificate
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-lg mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold text-foreground mb-2">Issue Certificate</h1>
        <p className="text-muted-foreground mb-10">
          Fill in the certificate details. A unique hash will be generated and stored on the blockchain.
        </p>
        <form onSubmit={handleSubmit} className="glass-card rounded-xl p-8 space-y-6">
          <div>
            <Label htmlFor="studentName">Student Name</Label>
            <Input
              id="studentName"
              placeholder="John Doe"
              value={form.studentName}
              onChange={(e) => setForm({ ...form, studentName: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="certificateTitle">Certificate Title</Label>
            <Input
              id="certificateTitle"
              placeholder="Certificate of Completion"
              value={form.certificateTitle}
              onChange={(e) => setForm({ ...form, certificateTitle: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="organisationName">Organisation Name</Label>
            <Input
              id="organisationName"
              placeholder="Acme Corp"
              value={form.organisationName}
              onChange={(e) => setForm({ ...form, organisationName: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="courseName">Course / Degree</Label>
            <Input
              id="courseName"
              placeholder="B.Sc. Computer Science"
              value={form.courseName}
              onChange={(e) => setForm({ ...form, courseName: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              placeholder="MIT"
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dateIssued">Date Issued</Label>
            <Input
              id="dateIssued"
              type="date"
              value={form.dateIssued}
              onChange={(e) => setForm({ ...form, dateIssued: e.target.value })}
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Issuing..." : "Issue Certificate"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default IssueCertificate;
