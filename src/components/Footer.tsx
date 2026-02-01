import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center">
              <span className="text-background font-western font-bold text-sm">R</span>
            </div>
            <span className="font-western text-sm tracking-wider text-muted-foreground">
              Redemption RP
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2024 Redemption RP. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a
              href="https://discord.gg/fSNbnXE3"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-gold transition-colors"
            >
              Discord
            </a>
            <Link
              to="/rules"
              className="text-sm text-muted-foreground hover:text-gold transition-colors"
            >
              Rules
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
