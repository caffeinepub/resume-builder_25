import type { Resume } from "../backend";
import { ResumeTemplate } from "../backend";

interface ResumePreviewProps {
  resume: Resume;
  printRef?: React.Ref<HTMLDivElement>;
}

export default function ResumePreview({
  resume,
  printRef,
}: ResumePreviewProps) {
  if (resume.template === ResumeTemplate.classic) {
    return <ClassicTemplate resume={resume} printRef={printRef} />;
  }
  if (resume.template === ResumeTemplate.modern) {
    return <ModernTemplate resume={resume} printRef={printRef} />;
  }
  return <MinimalTemplate resume={resume} printRef={printRef} />;
}

function ClassicTemplate({
  resume,
  printRef,
}: {
  resume: Resume;
  printRef?: React.Ref<HTMLDivElement>;
}) {
  const {
    personalInfo: p,
    summary,
    workExperience,
    education,
    skills,
  } = resume;
  return (
    <div
      ref={printRef}
      className="print-target bg-white text-[#1a1a1a] font-serif"
      style={{
        width: "794px",
        minHeight: "1122px",
        padding: "64px 72px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "2px solid #1a1a1a",
          paddingBottom: "16px",
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            letterSpacing: "-0.5px",
            marginBottom: "6px",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          {p.name || "Your Name"}
        </h1>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "12px",
            color: "#555",
          }}
        >
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.website && <span>{p.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: "20px" }}>
          <SectionTitle>Professional Summary</SectionTitle>
          <p style={{ fontSize: "13px", lineHeight: 1.6, color: "#333" }}>
            {summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {workExperience.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <SectionTitle>Work Experience</SectionTitle>
          {workExperience.map((job) => (
            <div key={job.title + job.company} style={{ marginBottom: "14px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: 700 }}>
                  {job.title || "Job Title"}
                </span>
                <span style={{ fontSize: "11px", color: "#666" }}>
                  {job.dates}
                </span>
              </div>
              <div
                style={{ fontSize: "12px", color: "#555", marginBottom: "4px" }}
              >
                {job.company}
              </div>
              <p style={{ fontSize: "12px", lineHeight: 1.55, color: "#444" }}>
                {job.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <SectionTitle>Education</SectionTitle>
          {education.map((edu) => (
            <div key={edu.degree + edu.school} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "14px", fontWeight: 700 }}>
                  {edu.degree}
                </span>
                <span style={{ fontSize: "11px", color: "#666" }}>
                  {edu.dates}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "#555" }}>
                {edu.school}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <SectionTitle>Skills</SectionTitle>
          <p style={{ fontSize: "12px", color: "#333", lineHeight: 1.6 }}>
            {skills.join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        borderBottom: "1px solid #ccc",
        paddingBottom: "4px",
        marginBottom: "10px",
        color: "#1a1a1a",
        fontFamily: "Georgia, serif",
      }}
    >
      {children}
    </div>
  );
}

function ModernTemplate({
  resume,
  printRef,
}: {
  resume: Resume;
  printRef?: React.Ref<HTMLDivElement>;
}) {
  const {
    personalInfo: p,
    summary,
    workExperience,
    education,
    skills,
  } = resume;
  const accent = "#2d6e52"; // forest green

  return (
    <div
      ref={printRef}
      className="print-target bg-white text-[#1a1a1a]"
      style={{
        width: "794px",
        minHeight: "1122px",
        display: "flex",
        boxSizing: "border-box",
      }}
    >
      {/* Left accent bar */}
      <div style={{ width: "8px", background: accent, flexShrink: 0 }} />

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: "56px 60px",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: accent,
              marginBottom: "6px",
            }}
          >
            {p.name || "Your Name"}
          </h1>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              fontSize: "12px",
              color: "#555",
            }}
          >
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
            {p.website && <span style={{ color: accent }}>{p.website}</span>}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div style={{ marginBottom: "24px" }}>
            <ModernSectionTitle accent={accent}>About</ModernSectionTitle>
            <p style={{ fontSize: "13px", lineHeight: 1.65, color: "#444" }}>
              {summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {workExperience.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <ModernSectionTitle accent={accent}>Experience</ModernSectionTitle>
            {workExperience.map((job) => (
              <div
                key={job.title + job.company}
                style={{ marginBottom: "16px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <span
                    style={{ fontSize: "14px", fontWeight: 700, color: "#111" }}
                  >
                    {job.title}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      background: `${accent}18`,
                      color: accent,
                      padding: "2px 8px",
                      borderRadius: "20px",
                    }}
                  >
                    {job.dates}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: accent,
                    fontWeight: 600,
                    marginBottom: "3px",
                  }}
                >
                  {job.company}
                </div>
                <p
                  style={{ fontSize: "12px", lineHeight: 1.55, color: "#555" }}
                >
                  {job.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <ModernSectionTitle accent={accent}>Education</ModernSectionTitle>
            {education.map((edu, eduIdx) => (
              <div
                key={edu.school + edu.degree + String(eduIdx)}
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700 }}>
                    {edu.degree}
                  </div>
                  <div
                    style={{ fontSize: "12px", color: accent, fontWeight: 600 }}
                  >
                    {edu.school}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#777",
                    alignSelf: "flex-start",
                  }}
                >
                  {edu.dates}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <ModernSectionTitle accent={accent}>Skills</ModernSectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {skills.map((s) => (
                <span
                  key={s}
                  style={{
                    fontSize: "11px",
                    padding: "3px 10px",
                    background: `${accent}12`,
                    color: accent,
                    borderRadius: "4px",
                    fontWeight: 600,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModernSectionTitle({
  children,
  accent,
}: { children: React.ReactNode; accent: string }) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontWeight: 800,
        letterSpacing: "2px",
        textTransform: "uppercase",
        color: accent,
        marginBottom: "10px",
        paddingLeft: "8px",
        borderLeft: `3px solid ${accent}`,
      }}
    >
      {children}
    </div>
  );
}

function MinimalTemplate({
  resume,
  printRef,
}: {
  resume: Resume;
  printRef?: React.Ref<HTMLDivElement>;
}) {
  const {
    personalInfo: p,
    summary,
    workExperience,
    education,
    skills,
  } = resume;

  return (
    <div
      ref={printRef}
      className="print-target bg-white text-[#1a1a1a]"
      style={{
        width: "794px",
        minHeight: "1122px",
        padding: "80px 88px",
        boxSizing: "border-box",
        fontFamily: "'General Sans', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "48px" }}>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 300,
            letterSpacing: "-1px",
            color: "#111",
            marginBottom: "12px",
          }}
        >
          {p.name || "Your Name"}
        </h1>
        <div
          style={{
            display: "flex",
            gap: "20px",
            fontSize: "12px",
            color: "#888",
            fontFamily: "'Geist Mono', monospace",
          }}
        >
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.website && <span>{p.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div style={{ marginBottom: "40px" }}>
          <p
            style={{
              fontSize: "13px",
              lineHeight: 1.8,
              color: "#444",
              maxWidth: "560px",
            }}
          >
            {summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {workExperience.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <MinimalSectionTitle>Work</MinimalSectionTitle>
          {workExperience.map((job, jobIdx) => (
            <div
              key={job.title + job.company + String(jobIdx)}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#999",
                  fontFamily: "'Geist Mono', monospace",
                  paddingTop: "2px",
                  lineHeight: 1.4,
                }}
              >
                {job.dates}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "2px",
                  }}
                >
                  {job.title}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    marginBottom: "6px",
                  }}
                >
                  {job.company}
                </div>
                <p style={{ fontSize: "12px", lineHeight: 1.6, color: "#555" }}>
                  {job.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <MinimalSectionTitle>Education</MinimalSectionTitle>
          {education.map((edu, eduIdx) => (
            <div
              key={edu.school + edu.degree + String(eduIdx)}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                gap: "16px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#999",
                  fontFamily: "'Geist Mono', monospace",
                  paddingTop: "2px",
                }}
              >
                {edu.dates}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                  {edu.degree}
                </div>
                <div style={{ fontSize: "12px", color: "#888" }}>
                  {edu.school}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <MinimalSectionTitle>Skills</MinimalSectionTitle>
          <p
            style={{
              fontSize: "12px",
              color: "#555",
              fontFamily: "'Geist Mono', monospace",
              lineHeight: 2,
            }}
          >
            {skills.join("  /  ")}
          </p>
        </div>
      )}
    </div>
  );
}

function MinimalSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "3px",
        textTransform: "uppercase",
        color: "#aaa",
        marginBottom: "16px",
        fontFamily: "'Geist Mono', monospace",
      }}
    >
      {children}
    </div>
  );
}
