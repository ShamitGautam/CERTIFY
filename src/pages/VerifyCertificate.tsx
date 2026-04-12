import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyCertificate, type Block } from "@/lib/blockchain";
import { CheckCircle, XCircle, Search } from "lucide-react";

const VerifyCertificate = () => {
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState<Block | null | undefined>(undefined);
  const [searched, setSearched] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) return;
    const found = verifyCertificate(certificateId.trim());
    setResult(found);
    setSearched(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-lg mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold text-foreground mb-2">Verify Certificate</h1>
        <p className="text-muted-foreground mb-10">
          Enter a certificate ID to check its authenticity against the blockchain.
        </p>
        <form onSubmit={handleVerify} className="glass-card rounded-xl p-8 space-y-6">
          <div>
            <Label htmlFor="certId">Certificate ID</Label>
            <Input
              id="certId"
              placeholder="CERT-XXXXX-XXXXXX"
              value={certificateId}
              onChange={(e) => { setCertificateId(e.target.value); setSearched(false); }}
              className="mt-1 font-mono"
            />
          </div>
          <Button type="submit" className="w-full">
            <Search className="w-4 h-4 mr-2" /> Verify
          </Button>
        </form>

        {searched && result && (
          <div className="mt-8 glass-card rounded-xl p-8 border-primary/30 border">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold text-primary">Valid Certificate</h2>
            </div>
            <div className="space-y-4">
              {[
                ["Student Name", result.data.studentName],
                ["Course", result.data.courseName],
                ["Institution", result.data.institution],
                ["Date Issued", result.data.dateIssued],
                ["Certificate ID", result.data.certificateId],
              ].map(([label, value]) => (
                <div key={label}>
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <p className="text-foreground font-medium">{value}</p>
                </div>
              ))}
              <div>
                <span className="text-xs text-muted-foreground">Block Hash</span>
                <p className="text-accent font-mono text-xs break-all">{result.hash}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Block #</span>
                <p className="text-foreground font-medium">{result.index}</p>
              </div>
            </div>
          </div>
        )}

        {searched && !result && (
          <div className="mt-8 glass-card rounded-xl p-8 border-destructive/30 border">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-8 h-8 text-destructive" />
              <h2 className="text-2xl font-bold text-destructive">Not Found</h2>
            </div>
            <p className="text-muted-foreground">
              No certificate with this ID exists on the blockchain. The certificate may be fake or the ID is incorrect.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;
