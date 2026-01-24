import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const SignInBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Hide banner if user is already logged in
  if (user) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border px-4 py-3 md:hidden z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <Gift className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Sign in for better sourcing experience
          </p>
        </div>

        <Button
          size="sm"
          className="rounded-full"
          onClick={() => navigate("/auth")}
        >
          Sign in
        </Button>
      </div>
    </div>
  );
};
