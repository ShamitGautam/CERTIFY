import { Link } from "react-router-dom";
import { Shield, Zap, TrendingDown } from "lucide-react";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 gradient-text">
            Instantaneous Certificate Verification.
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Leverage blockchain's immutable ledger for secure, tamper-proof, and lightning-fast verification of academic credentials.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg glow-primary transition-all duration-300 hover:scale-105"
            >
              Login
            </Link>
            <Link
              to="/verify"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-secondary border border-border text-secondary-foreground font-semibold text-lg transition-colors duration-300 hover:bg-muted"
            >
              Verify Certificate
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center text-foreground mb-16">
          Why CertiLink?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Tamper-Proof",
              desc: "Immutably recorded on blockchain. Any alteration attempt is instantly detected.",
            },
            {
              icon: Zap,
              title: "Fast Verification",
              desc: "Verify credentials in seconds, not days. Instant, decentralized lookup.",
            },
            {
              icon: TrendingDown,
              title: "Reduced Fraud",
              desc: "Eliminate counterfeit credentials with verifiable, immutable records.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="glass-card rounded-xl p-8 text-center transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <f.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center text-foreground mb-16">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Upload", desc: "Admin uploads certificate details into the system." },
            { step: "2", title: "Hash & Store", desc: "System generates a cryptographic hash and stores it on the blockchain." },
            { step: "3", title: "Verify", desc: "Anyone can verify a certificate by entering its unique ID." },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                {s.step}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 text-center text-muted-foreground text-sm">
        © 2026 CertiLink. Student Certificate Verification System using Blockchain.
      </footer>
    </div>
  );
};

export default Index;
