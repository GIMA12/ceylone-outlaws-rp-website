import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Users, MessageSquare, Ban, AlertTriangle, Heart, Swords, Scale, Skull, Car, Clock, MessageCircle, UserCheck, Stethoscope, Bug, Camera, Lock, Gavel, Disc } from "lucide-react";
import { Button } from "@/components/ui/button";

const rulesSections = [
  {
    icon: Shield,
    title: "📜 1. General Rules",
    rules: [
      "Server එකට join වෙද්දී මේ rules accept කරනවා කියලා සලකනවා",
      "Admin / Moderator instructions අනිවාර්යයෙන්ම follow කරන්න",
      "Bugs / exploits intentionally use කිරීම strictly forbidden",
      "Toxic behavior, harassment, hate speech ඉඩ නැහැ"
    ]
  },
  {
    icon: Users,
    title: "🎭 2. Roleplay Rules (Serious RP)",
    rules: [
      "Always In-Character (IC) – IC / OOC mix කරන්න එපා",
      "Unrealistic actions RP break ලෙස සලකනවා",
      "Character fear value (Gun, death threats) respect කරන්න",
      "Powergaming / Metagaming ban-worthy offense"
    ]
  },
  {
    icon: Swords,
    title: "🔫 3. Combat & Crime Rules",
    rules: [],
    subsections: [
      {
        type: "forbidden",
        title: "❌ Forbidden",
        items: [
          "RDM (Random Death Match)",
          "VDM (Vehicle Death Match)",
          "Combat logging",
          "Revenge killing (NLR break)"
        ]
      },
      {
        type: "allowed",
        title: "✅ Allowed (With RP)",
        items: [
          "Crime only with valid RP reason",
          "Robbery / kidnapping realistic RP flow එකකින්",
          "Fear RP ignore කරන්නේ ban reason"
        ]
      }
    ]
  },
  {
    icon: Skull,
    title: "🚑 4. New Life Rule (NLR)",
    rules: [
      "Death එකෙන් පස්සේ 15 minutes previous situation remember කරන්න බෑ",
      "Death scene එකට return වෙන්න බෑ"
    ]
  },
  {
    icon: MessageCircle,
    title: "💬 5. OOC / Chat Rules",
    rules: [
      "IC chat එක OOC use කරන්න එපා",
      "OOC chat minimal use කරන්න",
      "Admin chat misuse = warning / mute"
    ]
  },
  {
    icon: UserCheck,
    title: "🧑‍⚖️ 6. Law Enforcement Rules",
    rules: [
      "Police roleplay realistic විය යුතුයි",
      "Abuse of power strictly forbidden",
      "Corruption only if server lore allow කරන්නේ නම්"
    ]
  },
  {
    icon: Stethoscope,
    title: "🏥 7. Medical Roleplay",
    rules: [
      "Injuries properly RP කරන්න",
      "Instant heal / unrealistic revive forbidden",
      "Doctors & Medics RP value respect කරන්න"
    ]
  },
  {
    icon: Bug,
    title: "🚫 8. Exploits & Cheats",
    rules: [
      "Hacks / Mods / Macros = Permanent Ban",
      "Duplication glitches = Ban",
      "FPS / graphic advantage exploits = punishable"
    ]
  },
  {
    icon: Camera,
    title: "📷 9. Evidence & Reports",
    rules: [
      "Reports proof (video / screenshots) එක්ක submit කරන්න",
      "Fake reports = punishment | ban"
    ]
  },
  {
    icon: Lock,
    title: "🔒 10. Whitelist Rules",
    rules: [
      "Whitelist bypass attempt = Permanent ban",
      "One whitelist = one person",
      "Fake info = whitelist revoke"
    ]
  },
  {
    icon: Gavel,
    title: "⚖️ 11. Punishment System",
    rules: [
      "1st: Warning",
      "2nd: Kick / Temporary ban",
      "3rd: Permanent ban",
      "(Admin decision final)"
    ]
  }
];

const Rules = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="western-heading text-xl text-gradient-gold">Server Rules</h1>
          <div className="w-24" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Scale className="h-16 w-16 text-accent mx-auto mb-6 animate-pulse-slow" />
          <h1 className="western-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-gradient-gold">Server Rules</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Join වෙන්න කලින් මේ rules හොඳින් කියවන්න. Rules break කිරීම warnings, kicks, හෝ permanent bans වලට හේතු වෙන්න පුළුවන්.
          </p>
        </div>
      </section>

      {/* Rules Grid */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:gap-8 max-w-4xl mx-auto">
            {rulesSections.map((section, index) => (
              <div
                key={index}
                className="card-western p-6 md:p-8 group hover:border-accent/50 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4 md:gap-6">
                  <div className="flex-shrink-0 p-3 rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                    <section.icon className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="western-heading text-xl md:text-2xl font-semibold text-foreground mb-4">
                      {section.title}
                    </h3>

                    {section.rules.length > 0 && (
                      <ul className="space-y-2">
                        {section.rules.map((rule, ruleIndex) => (
                          <li key={ruleIndex} className="flex items-start gap-2 text-muted-foreground">
                            <span className="text-accent mt-1">•</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.subsections && (
                      <div className="space-y-4">
                        {section.subsections.map((subsection, subIndex) => (
                          <div key={subIndex}>
                            <h4 className={`font-semibold mb-2 ${subsection.type === 'forbidden' ? 'text-destructive' : 'text-green-500'
                              }`}>
                              {subsection.title}
                            </h4>
                            <ul className="space-y-1 ml-4">
                              {subsection.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-start gap-2 text-muted-foreground">
                                  <span className={subsection.type === 'forbidden' ? 'text-destructive' : 'text-green-500'}>
                                    {subsection.type === 'forbidden' ? '✗' : '✓'}
                                  </span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Final Note */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="card-western p-6 md:p-8 border-accent/50 bg-accent/5">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-8 w-8 text-accent flex-shrink-0" />
                <div>
                  <h3 className="western-heading text-xl font-semibold text-foreground mb-2">
                    ✅ Final Note
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Server rules update වෙන්න පුළුවන්</li>
                    <li>• Rules නොදැනීම excuse එකක් නෙමෙයි</li>
                    <li>• Server එකට join වීමෙන් මෙම rules accept කළා ලෙස සලකනු ලැබේ</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link to="/apply">
              <Button className="btn-gold px-8 py-6 text-lg rounded-lg">
                I Understand - Apply Now
              </Button>
            </Link>
            <Button asChild variant="outline" className="ml-4 px-8 py-6 text-lg rounded-lg border-gold/30 hover:border-gold hover:bg-gold/10 text-foreground gap-2">
              <a href="https://discord.gg/fSNbnXE3" target="_blank" rel="noopener noreferrer">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 fill-current"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.5382-9.674-2.3421-13.6693a.0694.0694 0 00-.032-.0277zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
                </svg>
                Join Discord
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 RedM Oath. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Rules;
