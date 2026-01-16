const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-6 md:py-8 mt-6 md:mt-8">
      <div className="container px-4">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span>© 2025 QuizTank</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <a 
              href="#" 
              className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              About Us
            </a>
            <a 
              href="#" 
              className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Contact Us
            </a>
            <a 
              href="#" 
              className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Use
            </a>
            <a 
              href="#" 
              className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
