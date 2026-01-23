import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface SignInScreenProps {
  onBack: () => void;
  onSuccess: (onboardingComplete: boolean) => void;
  onForgotPassword: () => void;
}

export const SignInScreen = ({ onBack, onSuccess, onForgotPassword }: SignInScreenProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Sign in failed", {
          description: error.message,
        });
        return;
      }

      if (data.user) {
        // Check if onboarding is complete
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", data.user.id)
          .single();

        const onboardingComplete = profile?.onboarding_completed ?? false;

        toast.success("Welcome back!");
        onSuccess(onboardingComplete);
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grain-overlay flex flex-col px-6 py-8">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={20} />
        <span className="font-body">Back</span>
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        {/* Title */}
        <h1 className="font-display text-4xl font-bold tracking-wider text-foreground mb-2">
          Sign In
        </h1>
        <p className="text-foreground/60 mb-8">
          Welcome back to CLEAR
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground/80">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="glass-input w-full h-12 px-4 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-foreground/80">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="glass-input w-full h-12 px-4 pr-12 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            Forgot password?
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="glow-button w-full h-14 font-display text-lg font-bold uppercase tracking-wider text-foreground flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
