import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Crown, FileText, LogIn, LogOut, Settings, User } from "lucide-react";
import { navigate } from "../App";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface HeaderProps {
  isPremium: boolean;
}

export default function Header({ isPremium }: HeaderProps) {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching } = useActor();
  const isLoggedIn = !!identity;
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}…${principal.slice(-3)}`
    : "";

  const { data: isAdmin } = useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && isLoggedIn,
  });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 group"
          data-ocid="nav.link"
        >
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-base tracking-tight hidden sm:block">
            ResumeForge
          </span>
          {isPremium && (
            <Badge
              variant="secondary"
              className="text-xs hidden sm:flex items-center gap-1 bg-amber-light text-accent-foreground border-0"
            >
              <Crown className="w-3 h-3" />
              Premium
            </Badge>
          )}
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/settings")}
                  className="text-muted-foreground hover:text-foreground w-8 h-8"
                  aria-label="Settings"
                  data-ocid="nav.link"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-full px-3 py-1">
                <User className="w-3 h-3" />
                {shortPrincipal}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="text-muted-foreground hover:text-foreground"
                data-ocid="nav.button"
              >
                <LogOut className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              data-ocid="nav.primary_button"
            >
              <LogIn className="w-4 h-4 mr-1.5" />
              {isLoggingIn ? "Signing in…" : "Sign in"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
