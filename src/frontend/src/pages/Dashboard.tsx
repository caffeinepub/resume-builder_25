import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Edit3,
  FileText,
  LayoutTemplate,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ResumeTemplate } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllResumes, useDeleteResume } from "../hooks/useQueries";

interface DashboardProps {
  onEdit: (id: number) => void;
  onNew: () => void;
}

const templateLabels: Record<ResumeTemplate, string> = {
  [ResumeTemplate.classic]: "Classic",
  [ResumeTemplate.modern]: "Modern",
  [ResumeTemplate.minimal]: "Minimal",
};

const templateColors: Record<ResumeTemplate, string> = {
  [ResumeTemplate.classic]: "bg-secondary text-secondary-foreground",
  [ResumeTemplate.modern]: "bg-green-soft text-primary",
  [ResumeTemplate.minimal]: "bg-muted text-muted-foreground",
};

export default function Dashboard({ onEdit, onNew }: DashboardProps) {
  const { identity, login } = useInternetIdentity();
  const { data: resumes = [], isLoading } = useAllResumes();
  const { mutateAsync: deleteResume, isPending: isDeleting } =
    useDeleteResume();
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    try {
      await deleteResume(deleteTarget);
      toast.success("Resume deleted.");
    } catch {
      toast.error("Failed to delete resume.");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
            My Resumes
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {identity
              ? `${resumes.length} resume${resumes.length !== 1 ? "s" : ""} saved`
              : "Sign in to save and manage your resumes"}
          </p>
        </div>
        <Button
          size="lg"
          onClick={identity ? onNew : login}
          className="shrink-0 bg-primary hover:bg-primary/90 font-semibold"
          data-ocid="dashboard.primary_button"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Resume
        </Button>
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <div
          className="flex items-center justify-center py-24"
          data-ocid="dashboard.loading_state"
        >
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && identity && resumes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center text-center py-20 px-6"
          data-ocid="dashboard.empty_state"
        >
          <div className="w-56 h-56 mb-8 overflow-hidden rounded-2xl shadow-elevated">
            <img
              src="/assets/generated/resume-hero.dim_800x600.png"
              alt="Resume illustration"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl font-display font-bold mb-2">
            No resumes yet
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs mb-6">
            Create your first resume in minutes. Pick a template, fill in your
            details, and download a polished PDF.
          </p>
          <Button
            onClick={onNew}
            className="bg-primary hover:bg-primary/90"
            data-ocid="dashboard.primary_button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create your first resume
          </Button>
        </motion.div>
      )}

      {/* Not logged in empty state */}
      {!isLoading && !identity && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center text-center py-20 px-6"
          data-ocid="dashboard.empty_state"
        >
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <FileText className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-display font-bold mb-2">
            Sign in to save resumes
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs mb-6">
            You can still build a resume without an account — just sign in to
            save and access it later.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onNew}>
              Build without account
            </Button>
            <Button onClick={login} className="bg-primary hover:bg-primary/90">
              Sign in
            </Button>
          </div>
        </motion.div>
      )}

      {/* Resume Grid */}
      {!isLoading && resumes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence>
            {resumes.map((resume, i) => (
              <motion.div
                key={resume.title + resume.personalInfo.name + String(i)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className="group bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-elevated transition-shadow"
                data-ocid={`dashboard.item.${i + 1}`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-soft flex items-center justify-center shrink-0">
                    <LayoutTemplate className="w-5 h-5 text-primary" />
                  </div>
                  <Badge
                    className={`text-xs font-semibold border-0 ${templateColors[resume.template]}`}
                  >
                    {templateLabels[resume.template]}
                  </Badge>
                </div>

                {/* Title & Info */}
                <h3 className="font-display font-bold text-base mb-1 truncate">
                  {resume.title || "Untitled Resume"}
                </h3>
                <p className="text-xs text-muted-foreground truncate mb-1">
                  {resume.personalInfo.name || "—"}
                </p>
                {resume.personalInfo.email && (
                  <p className="text-xs text-muted-foreground truncate">
                    {resume.personalInfo.email}
                  </p>
                )}

                <div className="mt-2 mb-4 text-xs text-muted-foreground">
                  {resume.workExperience.length} job
                  {resume.workExperience.length !== 1 ? "s" : ""} ·{" "}
                  {resume.skills.length} skill
                  {resume.skills.length !== 1 ? "s" : ""}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => onEdit(i)}
                    data-ocid={`dashboard.edit_button.${i + 1}`}
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-destructive hover:text-destructive hover:bg-destructive/5 border-border"
                    onClick={() => setDeleteTarget(i)}
                    data-ocid={`dashboard.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Premium callout */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mt-14 rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-light flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="font-display font-bold text-base">
                Upgrade to Premium
              </p>
              <p className="text-sm text-muted-foreground">
                Unlock PDF export &amp; all templates for a one-time $9.99
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="shrink-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={onNew}
            data-ocid="upgrade.open_modal_button"
          >
            <Crown className="w-4 h-4 mr-2" />
            Learn more
          </Button>
        </motion.div>
      )}

      {/* Delete confirm dialog */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="dashboard.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resume?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The resume will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="dashboard.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="dashboard.confirm_button"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
