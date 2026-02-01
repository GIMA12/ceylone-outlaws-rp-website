import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Loader2, Send, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const applicationSchema = z.object({
  discordUsername: z
    .string()
    .min(2, "Discord username must be at least 2 characters")
    .max(32, "Discord username must be less than 32 characters"),
  discordId: z
    .string()
    .regex(/^\d{17,19}$/, "Discord ID must be a valid 17-19 digit number"),
  age: z
    .string()
    .min(1, "Age is required")
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return num >= 16 && num <= 99;
      },
      { message: "You must be at least 16 years old" }
    ),
  timezone: z.string().min(1, "Please select your timezone"),
  characterName: z
    .string()
    .min(3, "Character name must be at least 3 characters")
    .max(50, "Character name must be less than 50 characters"),
  characterBackstory: z
    .string()
    .min(100, "Backstory must be at least 100 characters")
    .max(2000, "Backstory must be less than 2000 characters"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const timezones = [
  "UTC-12:00",
  "UTC-11:00",
  "UTC-10:00",
  "UTC-09:00",
  "UTC-08:00 (PST)",
  "UTC-07:00 (MST)",
  "UTC-06:00 (CST)",
  "UTC-05:00 (EST)",
  "UTC-04:00",
  "UTC-03:00",
  "UTC-02:00",
  "UTC-01:00",
  "UTC+00:00 (GMT)",
  "UTC+01:00 (CET)",
  "UTC+02:00 (EET)",
  "UTC+03:00",
  "UTC+04:00",
  "UTC+05:00",
  "UTC+05:30 (IST)",
  "UTC+06:00",
  "UTC+07:00",
  "UTC+08:00",
  "UTC+09:00",
  "UTC+10:00 (AEST)",
  "UTC+11:00",
  "UTC+12:00",
];

const Apply = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);

    try {
      const { data: response, error } = await supabase.functions.invoke('submit-application', {
        body: data,
      });

      if (error) {
        throw new Error(error.message || "Failed to submit application");
      }

      if (!response?.success) {
        throw new Error(response?.error || "Failed to submit application");
      }

      setIsSubmitted(true);
      toast({
        title: "Application Submitted!",
        description:
          "Your whitelist application has been sent to Discord. Check Discord for updates.",
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-8 animate-fade-in">
                <CheckCircle2 className="w-10 h-10 text-gold" />
              </div>
              <h1 className="font-western text-4xl md:text-5xl font-bold text-foreground mb-4 animate-slide-up">
                Application <span className="text-gradient-gold">Submitted</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 animate-slide-up">
                Thank you for applying to Redemption RP! Our team will review
                your application and notify you via Discord within 24-48 hours.
              </p>
              <div className="p-6 rounded-lg border border-border bg-card animate-slide-up">
                <h3 className="font-western text-lg font-semibold text-foreground mb-2">
                  What happens next?
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-gold mt-0.5">•</span>
                    Your application will be reviewed by our staff team
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold mt-0.5">•</span>
                    You'll receive a notification in Discord with the result
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold mt-0.5">•</span>
                    If accepted, you'll gain access to our server
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="font-western text-4xl md:text-5xl font-bold text-foreground mb-4">
                Whitelist <span className="text-gradient-gold">Application</span>
              </h1>
              <p className="text-muted-foreground">
                Fill out the form below to apply for access to Redemption RP.
                Please be thorough and honest in your responses.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Discord Info Section */}
              <div className="p-6 rounded-lg border border-border bg-card space-y-6">
                <h2 className="font-western text-xl font-semibold text-gold">
                  Discord Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="discordUsername">Discord Username</Label>
                    <Input
                      id="discordUsername"
                      placeholder="username"
                      className="input-western"
                      {...register("discordUsername")}
                    />
                    {errors.discordUsername && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.discordUsername.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discordId">Discord ID</Label>
                    <Input
                      id="discordId"
                      placeholder="123456789012345678"
                      className="input-western"
                      {...register("discordId")}
                    />
                    {errors.discordId && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.discordId.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Info Section */}
              <div className="p-6 rounded-lg border border-border bg-card space-y-6">
                <h2 className="font-western text-xl font-semibold text-gold">
                  Personal Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="16"
                      max="99"
                      placeholder="18"
                      className="input-western"
                      {...register("age")}
                    />
                    {errors.age && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.age.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select onValueChange={(value) => setValue("timezone", value)}>
                      <SelectTrigger className="input-western">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.timezone && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.timezone.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Character Info Section */}
              <div className="p-6 rounded-lg border border-border bg-card space-y-6">
                <h2 className="font-western text-xl font-semibold text-gold">
                  Character Information
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="characterName">Character Name</Label>
                  <Input
                    id="characterName"
                    placeholder="John Marston"
                    className="input-western"
                    {...register("characterName")}
                  />
                  {errors.characterName && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.characterName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="characterBackstory">
                    Character Backstory{" "}
                    <span className="text-muted-foreground font-normal">
                      (min. 100 characters)
                    </span>
                  </Label>
                  <Textarea
                    id="characterBackstory"
                    placeholder="Write your character's backstory here. Include their history, motivations, personality traits, and what brought them to the frontier..."
                    className="input-western min-h-[200px] resize-none"
                    {...register("characterBackstory")}
                  />
                  {errors.characterBackstory && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.characterBackstory.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  variant="gold"
                  size="xl"
                  disabled={isSubmitting}
                  className="min-w-[200px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-center text-muted-foreground">
                By submitting this application, you agree to follow our server
                rules and community guidelines. False information may result in
                application denial.
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Apply;
