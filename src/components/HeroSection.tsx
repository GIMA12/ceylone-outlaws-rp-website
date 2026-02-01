import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Shield, Users, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-western.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Western frontier landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 pt-24 pb-12">
        <div className="max-w-3xl mx-auto text-center animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-sm text-gold tracking-wide">
              Applications Open
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-western text-5xl md:text-7xl lg:text-8xl font-bold tracking-wide mb-6">
            <span className="text-gradient-gold">Ceylone Outlaws</span>
            <br />
            <span className="text-foreground">RP</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience the untamed frontier. Craft your legend in a world where
            every choice shapes your destiny. Join our immersive RedM roleplay
            community.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              variant="gold"
              size="xl"
              asChild
              className="group"
            >
              <Link to="/apply">
                Apply for Whitelist
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              variant="westernOutline"
              size="lg"
              asChild
            >
              <a href="#features">Learn More</a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-gold" />
              </div>
              <div className="text-2xl md:text-3xl font-western font-bold text-foreground">
                500+
              </div>
              <div className="text-sm text-muted-foreground">Active Players</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-gold" />
              </div>
              <div className="text-2xl md:text-3xl font-western font-bold text-foreground">
                24/7
              </div>
              <div className="text-sm text-muted-foreground">Moderation</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <MapPin className="w-5 h-5 text-gold" />
              </div>
              <div className="text-2xl md:text-3xl font-western font-bold text-foreground">
                100+
              </div>
              <div className="text-sm text-muted-foreground">Custom Locations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-muted-foreground tracking-widest uppercase">
          Scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-gold to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;
