import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Crown,
  FileDown,
  Loader2,
  Palette,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateCheckoutSession } from "../hooks/useQueries";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const features = [
  { icon: FileDown, text: "Export as PDF with one click" },
  { icon: Palette, text: "Modern & Minimal premium templates" },
  { icon: Zap, text: "Unlimited resumes saved forever" },
  { icon: Crown, text: "Priority support & future features" },
];

export default function UpgradeDialog({
  open,
  onOpenChange,
}: UpgradeDialogProps) {
  const { mutateAsync: createSession, isPending } = useCreateCheckoutSession();
  const { identity, login } = useInternetIdentity();
  const [redirecting, setRedirecting] = useState(false);

  const handleCheckout = async () => {
    if (!identity) {
      login();
      return;
    }
    try {
      setRedirecting(true);
      const successUrl = `${window.location.origin}/#/stripe-success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/#/`;
      const checkoutUrl = await createSession({ successUrl, cancelUrl });
      window.location.href = checkoutUrl;
    } catch {
      setRedirecting(false);
      toast.error("Could not start checkout. Please try again.");
    }
  };

  const loading = isPending || redirecting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md animate-fade-in"
        data-ocid="upgrade.dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg bg-amber-light flex items-center justify-center">
              <Crown className="w-5 h-5 text-accent-foreground" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-display font-bold">
            Unlock Premium
          </DialogTitle>
          <DialogDescription className="text-base">
            One-time payment. No subscriptions. Export beautiful PDFs that get
            you hired.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-3 my-4">
          {features.map((f) => (
            <li key={f.text} className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm">{f.text}</span>
            </li>
          ))}
        </ul>

        <div className="rounded-xl border border-border bg-muted/50 p-4 mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-display font-bold">$9.99</span>
            <span className="text-muted-foreground text-sm">one-time</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Lifetime access. Pay once, use forever.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            data-ocid="upgrade.cancel_button"
          >
            Maybe later
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={handleCheckout}
            disabled={loading}
            data-ocid="upgrade.primary_button"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-2" /> Upgrade — $9.99
              </>
            )}
          </Button>
        </div>
        {!identity && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            You'll be asked to sign in before checkout.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
