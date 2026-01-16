import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="w-full border-t border-primary bg-primary/10 mt-auto">
      <div className="container flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
        <p className="text-sm text-muted-foreground">
          © 2025 QuizTank
        </p>
        <nav className="flex items-center gap-6">
          <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            About Us
          </Link>
          <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Contact Us
          </Link>
          <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Terms of Use
          </Link>
          <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
