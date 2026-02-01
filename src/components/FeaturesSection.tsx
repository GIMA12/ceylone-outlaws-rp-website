import { Crosshair, BookOpen, Users2, Gavel, Map, MessageSquare } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Deep Roleplay",
    description:
      "Immerse yourself in character-driven stories with detailed lore and dynamic events.",
  },
  {
    icon: Users2,
    title: "Active Community",
    description:
      "Join a welcoming community of passionate roleplayers from around the world.",
  },
  {
    icon: Crosshair,
    title: "Custom Systems",
    description:
      "Experience unique gameplay mechanics, jobs, and activities built for roleplay.",
  },
  {
    icon: Gavel,
    title: "Fair Moderation",
    description:
      "Our experienced staff ensures a safe and enjoyable environment for everyone.",
  },
  {
    icon: Map,
    title: "Expanded World",
    description:
      "Explore custom interiors, ranches, and settlements across the frontier.",
  },
  {
    icon: MessageSquare,
    title: "Voice Chat RP",
    description:
      "Engage in immersive roleplay using proximity voice chat for authentic interactions.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-card/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-western text-3xl md:text-4xl font-bold text-gradient-gold mb-4">
            Why Choose Us
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Redemption RP offers an unparalleled western roleplay experience with
            features designed for serious roleplayers.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-lg border border-border bg-gradient-to-br from-card to-background hover:border-gold/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                <feature.icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-western text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
