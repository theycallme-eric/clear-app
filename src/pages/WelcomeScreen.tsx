import { ArrowRight } from "lucide-react";
import { CTAButton } from "@/components/CTAButton";

interface WelcomeScreenProps {
  onSignIn: () => void;
  onCreateAccount: () => void;
}

export const WelcomeScreen = ({ onSignIn, onCreateAccount }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen grain-overlay flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Logo */}
        <h1 className="font-display text-6xl font-bold tracking-wider text-foreground mb-4">
          CLEAR
        </h1>

        {/* Tagline */}
        <p className="text-lg text-foreground/70 mb-12">
          Strength training, simplified.
        </p>

        {/* Buttons */}
        <div className="w-full space-y-4">
          <CTAButton
            onClick={onCreateAccount}
            size="lg"
            fullWidth
            iconRight={<ArrowRight size={20} />}
          >
            Create Account
          </CTAButton>

          <CTAButton
            onClick={onSignIn}
            variant="secondary"
            size="lg"
            fullWidth
          >
            Sign In
          </CTAButton>
        </div>
      </div>
    </div>
  );
};
