import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-crimson/5 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold/50" />
            <div className="w-2 h-2 rotate-45 border border-gold/50" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold/50" />
          </div>

          <h2 className="font-western text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Begin Your{" "}
            <span className="text-gradient-gold">Journey?</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Submit your whitelist application today and become part of our
            growing community of outlaws, sheriffs, and frontier pioneers.
          </p>

          <Button variant="gold" size="xl" asChild className="group">
            <Link to="/apply">
              Apply for Whitelist
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
