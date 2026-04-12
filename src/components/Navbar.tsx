import { Link, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const { user, role } = useAuth();

  const linkClass = (path: string) =>
    `transition-colors duration-300 ${
      location.pathname === path
        ? "text-primary font-semibold"
        : "text-muted-foreground hover:text-primary"
    }`;

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary" />
          <span className="text-xl font-bold text-foreground tracking-tight">CertiLink</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className={linkClass("/")}>Home</Link>
          <Link to="/verify" className={linkClass("/verify")}>Verify</Link>
          {role === "admin" && (
            <Link to="/explorer" className={linkClass("/explorer")}>Explorer</Link>
          )}
          {user ? (
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90`}
            >
              {role === "admin" ? "Admin Panel" : "My Dashboard"}
            </Link>
          ) : (
            <Link
              to="/auth"
              className={`px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90`}
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
