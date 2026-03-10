import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Crown,
  Download,
  Loader2,
  Lock,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ResumeTemplate } from "../backend";
import type { Education, Job, Resume } from "../backend";
import ResumePreview from "../components/ResumePreview";
import UpgradeDialog from "../components/UpgradeDialog";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateResume,
  useGetResume,
  useUpdateResume,
} from "../hooks/useQueries";

interface EditorProps {
  resumeId?: number;
  isPremium: boolean;
  onGrantPremium: () => void;
  onBack: () => void;
}

const defaultResume: Resume = {
  title: "",
  template: ResumeTemplate.classic,
  personalInfo: {
    name: "",
    email: "",
    phone: "",
    location: "",
    website: "",
  },
  summary: "",
  workExperience: [],
  education: [],
  skills: [],
};

const defaultJob: Job = {
  company: "",
  title: "",
  dates: "",
  description: "",
};

const defaultEducation: Education = {
  school: "",
  degree: "",
  dates: "",
};

const templateOptions = [
  {
    value: ResumeTemplate.classic,
    label: "Classic",
    desc: "Traditional serif layout — trusted by recruiters",
    free: true,
  },
  {
    value: ResumeTemplate.modern,
    label: "Modern",
    desc: "Clean with a green accent bar — stands out in tech",
    free: false,
  },
  {
    value: ResumeTemplate.minimal,
    label: "Minimal",
    desc: "Ultra-clean with monospace accents — for designers",
    free: false,
  },
];

export default function Editor({
  resumeId,
  isPremium,
  onGrantPremium: _onGrantPremium,
  onBack,
}: EditorProps) {
  const { identity } = useInternetIdentity();
  const { data: existingResume, isLoading } = useGetResume(resumeId);
  const { mutateAsync: createResume, isPending: isCreating } =
    useCreateResume();
  const { mutateAsync: updateResume, isPending: isUpdating } =
    useUpdateResume();

  const [resume, setResume] = useState<Resume>(defaultResume);
  const [skillInput, setSkillInput] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.6);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewWrapperRef = useRef<HTMLDivElement>(null);

  // Load existing resume
  useEffect(() => {
    if (existingResume) {
      setResume(existingResume);
    }
  }, [existingResume]);

  // Auto-scale preview
  useEffect(() => {
    const updateScale = () => {
      if (previewWrapperRef.current) {
        const w = previewWrapperRef.current.offsetWidth;
        setPreviewScale(Math.min((w - 16) / 794, 1));
      }
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (previewWrapperRef.current) observer.observe(previewWrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const set = useCallback(
    <K extends keyof Resume>(key: K, value: Resume[K]) =>
      setResume((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const setPersonal = useCallback(
    <K extends keyof Resume["personalInfo"]>(
      key: K,
      value: Resume["personalInfo"][K],
    ) =>
      setResume((prev) => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, [key]: value },
      })),
    [],
  );

  const handleSave = async () => {
    if (!identity) {
      toast.error("Please sign in to save your resume.");
      return;
    }
    if (!resume.title.trim()) {
      toast.error("Please add a title for your resume.");
      return;
    }
    try {
      if (resumeId !== undefined) {
        await updateResume({ index: resumeId, resume });
        toast.success("Resume updated!");
      } else {
        await createResume(resume);
        toast.success("Resume saved!");
        onBack();
      }
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  };

  const handleExport = () => {
    if (!isPremium) {
      setShowUpgrade(true);
      return;
    }
    window.print();
  };

  const addJob = () =>
    set("workExperience", [...resume.workExperience, { ...defaultJob }]);

  const removeJob = (i: number) =>
    set(
      "workExperience",
      resume.workExperience.filter((_, idx) => idx !== i),
    );

  const updateJob = <K extends keyof Job>(i: number, key: K, value: Job[K]) =>
    set(
      "workExperience",
      resume.workExperience.map((j, idx) =>
        idx === i ? { ...j, [key]: value } : j,
      ),
    );

  const addEducation = () =>
    set("education", [...resume.education, { ...defaultEducation }]);

  const removeEducation = (i: number) =>
    set(
      "education",
      resume.education.filter((_, idx) => idx !== i),
    );

  const updateEducation = <K extends keyof Education>(
    i: number,
    key: K,
    value: Education[K],
  ) =>
    set(
      "education",
      resume.education.map((e, idx) =>
        idx === i ? { ...e, [key]: value } : e,
      ),
    );

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || resume.skills.includes(s)) return;
    set("skills", [...resume.skills, s]);
    setSkillInput("");
  };

  const removeSkill = (s: string) =>
    set(
      "skills",
      resume.skills.filter((sk) => sk !== s),
    );

  const isSaving = isCreating || isUpdating;

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="editor.loading_state"
      >
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-57px)] flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-border bg-card px-4 sm:px-6 h-12 flex items-center gap-3 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground -ml-1"
          data-ocid="editor.button"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Resumes</span>
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <Input
          value={resume.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Resume title…"
          className="h-8 text-sm border-0 bg-transparent shadow-none px-0 font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-0 w-48 sm:w-64"
          data-ocid="editor.input"
        />
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="text-xs hidden sm:flex items-center gap-1.5"
          data-ocid="export.primary_button"
        >
          {isPremium ? (
            <Download className="w-3.5 h-3.5" />
          ) : (
            <Lock className="w-3.5 h-3.5" />
          )}
          Export PDF
        </Button>
        {!isPremium && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUpgrade(true)}
            className="text-xs hidden sm:flex items-center gap-1.5 text-accent-foreground border-amber-light hover:bg-amber-light"
            data-ocid="upgrade.open_modal_button"
          >
            <Crown className="w-3.5 h-3.5" />
            Upgrade
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-xs"
          data-ocid="editor.save_button"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1.5" />
          )}
          Save
        </Button>
      </div>

      {/* Body: split panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Form Panel */}
        <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 border-r border-border flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-4 sm:p-5">
              <Tabs defaultValue="personal">
                <TabsList className="w-full grid grid-cols-3 h-auto gap-0.5 p-0.5 mb-4">
                  {[
                    "personal",
                    "summary",
                    "experience",
                    "education",
                    "skills",
                    "template",
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="text-[11px] capitalize py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      data-ocid="editor.tab"
                    >
                      {tab === "experience"
                        ? "Exp."
                        : tab === "education"
                          ? "Edu."
                          : tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Personal Info */}
                <TabsContent
                  value="personal"
                  className="space-y-3 animate-fade-in"
                >
                  <h3 className="text-sm font-semibold mb-3">
                    Personal Information
                  </h3>
                  {(
                    [
                      ["name", "Full Name", "text"],
                      ["email", "Email Address", "email"],
                      ["phone", "Phone Number", "tel"],
                      ["location", "Location", "text"],
                      ["website", "Website / LinkedIn", "url"],
                    ] as const
                  ).map(([field, label]) => (
                    <div key={field}>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        {label}
                      </Label>
                      <Input
                        value={resume.personalInfo[field]}
                        onChange={(e) => setPersonal(field, e.target.value)}
                        placeholder={label}
                        className="h-8 text-sm"
                        data-ocid="editor.input"
                      />
                    </div>
                  ))}
                </TabsContent>

                {/* Summary */}
                <TabsContent value="summary" className="animate-fade-in">
                  <h3 className="text-sm font-semibold mb-3">
                    Professional Summary
                  </h3>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Write 2-4 sentences about your background and goals.
                  </Label>
                  <Textarea
                    value={resume.summary}
                    onChange={(e) => set("summary", e.target.value)}
                    placeholder="Results-driven software engineer with 5+ years of experience…"
                    className="text-sm resize-none min-h-[140px]"
                    data-ocid="editor.textarea"
                  />
                </TabsContent>

                {/* Work Experience */}
                <TabsContent
                  value="experience"
                  className="animate-fade-in space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Work Experience</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addJob}
                      className="text-xs h-7"
                      data-ocid="editor.add_button"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Job
                    </Button>
                  </div>
                  {resume.workExperience.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No jobs added yet. Click "Add Job" to get started.
                    </p>
                  )}
                  {resume.workExperience.map((job, i) => (
                    <motion.div
                      key={job.company + job.title + String(i)}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Job {i + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeJob(i)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          data-ocid="editor.delete_button"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      {(["title", "company", "dates"] as const).map((f) => (
                        <Input
                          key={f}
                          value={job[f]}
                          onChange={(e) => updateJob(i, f, e.target.value)}
                          placeholder={
                            f === "title"
                              ? "Job Title"
                              : f === "company"
                                ? "Company Name"
                                : "Dates (e.g. Jan 2022 – Present)"
                          }
                          className="h-7 text-xs"
                          data-ocid="editor.input"
                        />
                      ))}
                      <Textarea
                        value={job.description}
                        onChange={(e) =>
                          updateJob(i, "description", e.target.value)
                        }
                        placeholder="Describe your role and key achievements…"
                        className="text-xs resize-none min-h-[72px]"
                        data-ocid="editor.textarea"
                      />
                    </motion.div>
                  ))}
                </TabsContent>

                {/* Education */}
                <TabsContent
                  value="education"
                  className="animate-fade-in space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Education</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addEducation}
                      className="text-xs h-7"
                      data-ocid="editor.add_button"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Entry
                    </Button>
                  </div>
                  {resume.education.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No education entries yet.
                    </p>
                  )}
                  {resume.education.map((edu, i) => (
                    <motion.div
                      key={edu.school + edu.degree + String(i)}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Entry {i + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(i)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          data-ocid="editor.delete_button"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      {(["degree", "school", "dates"] as const).map((f) => (
                        <Input
                          key={f}
                          value={edu[f]}
                          onChange={(e) =>
                            updateEducation(i, f, e.target.value)
                          }
                          placeholder={
                            f === "degree"
                              ? "Degree / Certificate"
                              : f === "school"
                                ? "School / Institution"
                                : "Dates (e.g. 2018 – 2022)"
                          }
                          className="h-7 text-xs"
                          data-ocid="editor.input"
                        />
                      ))}
                    </motion.div>
                  ))}
                </TabsContent>

                {/* Skills */}
                <TabsContent value="skills" className="animate-fade-in">
                  <h3 className="text-sm font-semibold mb-3">Skills</h3>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="Type a skill and press Enter…"
                      className="h-8 text-sm flex-1"
                      data-ocid="editor.input"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addSkill}
                      className="h-8 shrink-0"
                      data-ocid="editor.add_button"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  {resume.skills.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No skills added yet.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {resume.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs py-1 pl-2.5 pr-1 flex items-center gap-1 bg-secondary hover:bg-secondary/80"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-0.5 hover:text-destructive transition-colors"
                          data-ocid="editor.delete_button"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </TabsContent>

                {/* Template */}
                <TabsContent value="template" className="animate-fade-in">
                  <h3 className="text-sm font-semibold mb-3">
                    Choose Template
                  </h3>
                  <div className="space-y-2">
                    {templateOptions.map((opt) => {
                      const locked = !opt.free && !isPremium;
                      const isSelected = resume.template === opt.value;
                      return (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => {
                            if (locked) {
                              setShowUpgrade(true);
                              return;
                            }
                            set("template", opt.value);
                          }}
                          className={`w-full text-left rounded-lg border-2 p-3 transition-all ${
                            isSelected
                              ? "border-primary bg-secondary/50"
                              : "border-border hover:border-primary/40"
                          } ${locked ? "opacity-60" : ""}`}
                          data-ocid="editor.select"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">
                              {opt.label}
                            </span>
                            {locked ? (
                              <span className="flex items-center gap-1 text-xs text-accent-foreground bg-amber-light px-2 py-0.5 rounded-full">
                                <Crown className="w-3 h-3" />
                                Premium
                              </span>
                            ) : isSelected ? (
                              <span className="text-xs text-primary font-semibold">
                                Selected
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {opt.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>

          {/* Mobile export / upgrade buttons */}
          <div className="sm:hidden border-t border-border p-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex-1 text-xs"
              data-ocid="export.primary_button"
            >
              {isPremium ? (
                <Download className="w-3.5 h-3.5 mr-1.5" />
              ) : (
                <Lock className="w-3.5 h-3.5 mr-1.5" />
              )}
              Export PDF
            </Button>
            {!isPremium && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpgrade(true)}
                className="flex-1 text-xs text-accent-foreground border-amber-light"
                data-ocid="upgrade.open_modal_button"
              >
                <Crown className="w-3.5 h-3.5 mr-1.5" />
                Upgrade
              </Button>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="hidden lg:flex flex-1 flex-col bg-muted/30 overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-card/60 flex items-center justify-between shrink-0">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">
              Live Preview
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {Math.round(previewScale * 100)}% scale
            </span>
          </div>
          <ScrollArea className="flex-1">
            <div
              className="p-6"
              ref={previewWrapperRef}
              data-ocid="preview.panel"
            >
              <motion.div
                key={resume.template}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                  width: "794px",
                  height: `${Math.round(1122 * previewScale)}px`,
                  overflow: "hidden",
                }}
              >
                <div ref={previewRef} className="shadow-elevated">
                  <ResumePreview resume={resume} />
                </div>
              </motion.div>
            </div>
          </ScrollArea>
        </div>
      </div>

      <UpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
}
