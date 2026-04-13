import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { getAllCertificates, verifyChainIntegrity, type Block } from "@/lib/blockchain";
import { CheckCircle, AlertTriangle, Blocks } from "lucide-react";

const BlockExplorer = () => {
  const { user, role, loading } = useAuth();
  const [chain, setChain] = useState<Block[]>([]);
  const [valid, setValid] = useState(true);

  useEffect(() => {
    if (loading || !user || role !== "admin") {
      return;
    }

    setChain(getAllCertificates());
    verifyChainIntegrity().then(setValid);
  }, [loading, user, role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (role !== "admin") return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Block Explorer</h1>
            <p className="text-muted-foreground">View all certificates stored on the blockchain.</p>
          </div>
          <div className="flex items-center gap-2">
            {valid ? (
              <>
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-primary text-sm font-medium">Chain Valid</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <span className="text-destructive text-sm font-medium">Chain Tampered</span>
              </>
            )}
          </div>
        </div>

        {chain.length === 0 ? (
          <div className="glass-card rounded-xl p-16 text-center">
            <Blocks className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No certificates have been issued yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...chain].reverse().map((block) => (
              <div key={block.hash} className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                    Block #{block.index}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(block.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Student</span>
                    <p className="text-foreground font-medium">{block.data.studentName}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Course</span>
                    <p className="text-foreground font-medium">{block.data.courseName}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Institution</span>
                    <p className="text-foreground font-medium">{block.data.institution}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Certificate ID</span>
                    <p className="text-primary font-mono text-sm">{block.data.certificateId}</p>
                  </div>
                </div>
                <div className="border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">Hash: </span>
                  <span className="text-accent font-mono text-xs break-all">{block.hash}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockExplorer;
