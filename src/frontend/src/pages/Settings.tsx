import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const [secretKey, setSecretKey] = useState("");
  const [allowedCountries, setAllowedCountries] = useState("US");
  const [showKey, setShowKey] = useState(false);

  const { data: isAdmin, isLoading: isAdminLoading } = useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && isLoggedIn,
  });

  const {
    data: isConfigured,
    isLoading: isCheckingStatus,
    refetch,
  } = useQuery<boolean>({
    queryKey: ["isStripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching && isAdmin === true,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      if (!secretKey.startsWith("sk_") && !secretKey.startsWith("rk_"))
        throw new Error("Secret key must start with sk_ or rk_");
      const countries = allowedCountries
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await actor.setStripeConfiguration({
        secretKey,
        allowedCountries: countries,
      });
    },
    onSuccess: () => {
      toast.success("Stripe configuration saved successfully!");
      refetch();
      setSecretKey("");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save configuration.");
    },
  });

  // Loading state while checking admin
  if (!isLoggedIn || (isAdminLoading && isFetching)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2
          className="w-6 h-6 animate-spin text-muted-foreground"
          data-ocid="settings.loading_state"
        />
      </div>
    );
  }

  // Access denied for non-admins
  if (!isAdminLoading && isAdmin !== true) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card
          className="max-w-sm w-full text-center border-border shadow-sm"
          data-ocid="settings.card"
        >
          <CardContent className="pt-10 pb-8 px-8">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-destructive" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">
              Access Denied
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              This page is only accessible to admins.
            </p>
            <Button
              variant="outline"
              onClick={onBack}
              data-ocid="settings.cancel_button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Back nav */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          data-ocid="settings.link"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </button>

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Settings
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Configure payment processing for your Resume Builder.
          </p>
        </div>

        {/* Stripe Configuration Card */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Stripe Payments
                </CardTitle>
                <CardDescription className="text-sm mt-0.5">
                  Connect your Stripe account to accept payments.
                </CardDescription>
              </div>
              {isCheckingStatus ? (
                <div data-ocid="settings.loading_state">
                  <Badge variant="outline" className="text-xs gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking…
                  </Badge>
                </div>
              ) : isConfigured ? (
                <div data-ocid="settings.success_state">
                  <Badge className="text-xs gap-1.5 bg-success/15 text-success border-success/30 hover:bg-success/15">
                    <CheckCircle2 className="w-3 h-3" />
                    Configured
                  </Badge>
                </div>
              ) : (
                <div data-ocid="settings.error_state">
                  <Badge
                    variant="outline"
                    className="text-xs gap-1.5 text-warning border-warning/40 bg-warning/10"
                  >
                    <XCircle className="w-3 h-3" />
                    Not configured
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6 space-y-5">
            {/* Secret Key */}
            <div className="space-y-2">
              <Label
                htmlFor="stripe-secret-key"
                className="text-sm font-medium"
              >
                Stripe Secret Key
              </Label>
              <div className="relative">
                <Input
                  id="stripe-secret-key"
                  type={showKey ? "text" : "password"}
                  placeholder="sk_live_…, sk_test_…, or rk_…"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="pr-10 font-mono text-sm"
                  data-ocid="settings.input"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Found in your{" "}
                <a
                  href="https://dashboard.stripe.com/apikeys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Stripe Dashboard → API keys
                </a>
                . Never share this key.
              </p>
            </div>

            {/* Allowed Countries */}
            <div className="space-y-2">
              <Label
                htmlFor="allowed-countries"
                className="text-sm font-medium"
              >
                Allowed Countries
              </Label>
              <Input
                id="allowed-countries"
                type="text"
                placeholder="US, CA, GB"
                value={allowedCountries}
                onChange={(e) => setAllowedCountries(e.target.value)}
                className="text-sm"
                data-ocid="settings.input"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated ISO country codes (e.g. US, CA, GB).
              </p>
            </div>

            {/* Save */}
            <div className="pt-2">
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !secretKey}
                className="w-full sm:w-auto"
                data-ocid="settings.save_button"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Configuration"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info box */}
        <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">How it works</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Users pay $9.99 to unlock PDF export and premium templates.</li>
            <li>Payments are processed securely through Stripe Checkout.</li>
            <li>
              Use a{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                sk_test_
              </code>{" "}
              key while testing.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
