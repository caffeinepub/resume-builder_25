import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Header from "./components/Header";
import { useActor } from "./hooks/useActor";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";

export type AppView =
  | { page: "dashboard" }
  | { page: "editor"; id?: number }
  | { page: "stripe-success"; sessionId: string };

function parseRoute(): AppView {
  const hash = window.location.hash.slice(1) || "/";
  const [path, queryStr] = hash.split("?");
  const params = new URLSearchParams(queryStr || "");

  if (path.startsWith("/editor")) {
    const parts = path.split("/");
    const id =
      parts[2] !== undefined ? Number.parseInt(parts[2], 10) : undefined;
    return { page: "editor", id: Number.isNaN(id) ? undefined : id };
  }
  if (path === "/stripe-success") {
    const sessionId = params.get("session_id") || "";
    return { page: "stripe-success", sessionId };
  }
  return { page: "dashboard" };
}

export function navigate(path: string) {
  window.location.hash = path;
}

export default function App() {
  const [view, setView] = useState<AppView>(parseRoute);
  const [isPremium, setIsPremium] = useState(
    () => localStorage.getItem("resume_premium") === "true",
  );
  const { actor } = useActor();

  useEffect(() => {
    const onHashChange = () => setView(parseRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Handle Stripe success redirect
  useEffect(() => {
    if (view.page === "stripe-success" && actor && view.sessionId) {
      actor
        .getStripeSessionStatus(view.sessionId)
        .then((status) => {
          if (status.__kind__ === "completed") {
            localStorage.setItem("resume_premium", "true");
            setIsPremium(true);
            toast.success("🎉 Premium unlocked! You can now export PDFs.");
          } else {
            toast.error("Payment could not be verified. Please try again.");
          }
        })
        .catch(() => toast.error("Error verifying payment."))
        .finally(() => navigate("/"));
    }
  }, [view, actor]);

  const grantPremium = () => {
    localStorage.setItem("resume_premium", "true");
    setIsPremium(true);
  };

  if (view.page === "stripe-success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground font-sans">Verifying payment…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isPremium={isPremium} />
      <main className="flex-1">
        {view.page === "dashboard" && (
          <Dashboard
            onEdit={(id) => navigate(`/editor/${id}`)}
            onNew={() => navigate("/editor")}
          />
        )}
        {view.page === "editor" && (
          <Editor
            resumeId={view.id}
            isPremium={isPremium}
            onGrantPremium={grantPremium}
            onBack={() => navigate("/")}
          />
        )}
      </main>
      <footer className="border-t border-border py-4 px-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
      <Toaster richColors position="top-right" />
    </div>
  );
}
