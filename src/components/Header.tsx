import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Settings } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const { user, isAdmin, signOut, isLoading } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center shadow-[0_0_20px_hsl(38_70%_45%/0.3)]">
              <span className="text-background font-western font-bold text-lg">C</span>
            </div>
            <span className="font-western text-xl tracking-wider text-gradient-gold">
              Ceylone Outlaws RP
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={cn(
                "text-sm tracking-wide transition-colors duration-200",
                location.pathname === "/"
                  ? "text-gold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Home
            </Link>
            <Link
              to="/rules"
              className={cn(
                "text-sm tracking-wide transition-colors duration-200",
                location.pathname === "/rules"
                  ? "text-gold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Rules
            </Link>
            <Link
              to="/apply"
              className={cn(
                "text-sm tracking-wide transition-colors duration-200",
                location.pathname === "/apply"
                  ? "text-gold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Apply
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "text-sm tracking-wide transition-colors duration-200 flex items-center gap-1",
                  location.pathname === "/admin"
                    ? "text-gold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {!isLoading && (
              <>
                {user ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut()}
                    className="border-gold/30 hover:border-gold hover:bg-gold/10 text-foreground"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <Link to="/auth">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gold/30 hover:border-gold hover:bg-gold/10 text-foreground"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
