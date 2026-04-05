"use client";

import { TailoredResume, JobAnalysis } from "@/lib/types";
import { useRef, useCallback, useState } from "react";

interface ResumePreviewProps {
  tailoredResume: TailoredResume;
  analysis: JobAnalysis;
}

export default function ResumePreview({ tailoredResume, analysis }: ResumePreviewProps) {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [showOriginal, setShowOriginal] = useState<Record<string, boolean>>({});

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleCopyText = useCallback(() => {
    const lines: string[] = [];
    const r = tailoredResume;

    lines.push(r.contact.fullName.toUpperCase());
    const contactParts = [r.contact.email, r.contact.phone, r.contact.location].filter(Boolean);
    lines.push(contactParts.join(" | "));
    const linkParts = [r.contact.linkedin, r.contact.website].filter(Boolean);
    if (linkParts.length) lines.push(linkParts.join(" | "));
    lines.push("");

    if (r.summary) {
      lines.push("PROFESSIONAL SUMMARY");
      lines.push(r.summary);
      lines.push("");
    }

    if (r.skills.length > 0) {
      lines.push("SKILLS");
      lines.push(r.skills.join(", "));
      lines.push("");
    }

    if (r.experience.length > 0) {
      lines.push("EXPERIENCE");
      for (const exp of r.experience) {
        lines.push(`${exp.title} | ${exp.company}`);
        lines.push(`${exp.startDate} - ${exp.endDate}`);
        for (const bullet of exp.bullets) {
          lines.push(`  • ${bullet}`);
        }
        lines.push("");
      }
    }

    if (r.education.length > 0) {
      lines.push("EDUCATION");
      for (const edu of r.education) {
        lines.push(`${edu.degree} in ${edu.field} | ${edu.institution}`);
        const parts = [edu.graduationDate, edu.gpa ? `GPA: ${edu.gpa}` : ""].filter(Boolean);
        if (parts.length) lines.push(parts.join(" | "));
        lines.push("");
      }
    }

    navigator.clipboard.writeText(lines.join("\n"));
    // toast handled by parent
  }, [tailoredResume]);

  const toggleOriginal = (expId: string) => {
    setShowOriginal(prev => ({ ...prev, [expId]: !prev[expId] }));
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tailored Resume</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-500">
              Optimized for: {analysis.title} at {analysis.company}
            </p>
            {tailoredResume.aiPowered && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                AI-Powered
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopyText}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Copy Text
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Highlights */}
      {tailoredResume.highlights.length > 0 && (
        <div className={`rounded-xl border p-4 ${tailoredResume.aiPowered ? "bg-purple-50 border-purple-200" : "bg-indigo-50 border-indigo-200"}`}>
          <h4 className={`font-semibold mb-2 ${tailoredResume.aiPowered ? "text-purple-900" : "text-indigo-900"}`}>
            {tailoredResume.aiPowered ? "AI Strategist Highlights" : "Tailoring Highlights"}
          </h4>
          <ul className="space-y-1">
            {tailoredResume.highlights.map((h, i) => (
              <li key={i} className={`text-sm flex items-start gap-2 ${tailoredResume.aiPowered ? "text-purple-700" : "text-indigo-700"}`}>
                <span className="mt-0.5">→</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Keyword Matches + Improvements — side by side */}
      {(tailoredResume.keywordMatches.length > 0 || tailoredResume.improvementsMade.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
          {tailoredResume.keywordMatches.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Keywords Incorporated ({tailoredResume.keywordMatches.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {tailoredResume.keywordMatches.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200 font-medium"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tailoredResume.improvementsMade.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                Improvements Made
              </h4>
              <ul className="space-y-1.5">
                {tailoredResume.improvementsMade.map((imp, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5 shrink-0">✓</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ATS Tips */}
      {tailoredResume.atsTips.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 no-print">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-amber-500">⚡</span>
            ATS Optimization Tips
          </h4>
          <div className="space-y-2">
            {tailoredResume.atsTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span
                  className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    tip.priority === "high"
                      ? "bg-red-100 text-red-600"
                      : tip.priority === "medium"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tip.priority === "high" ? "!" : tip.priority === "medium" ? "~" : "·"}
                </span>
                <div>
                  <span className="text-sm text-gray-700">{tip.message}</span>
                  <span className="ml-2 text-xs text-gray-400 uppercase">{tip.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resume Document */}
      <div
        ref={resumeRef}
        id="resume-print"
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12 max-w-[800px] mx-auto print:shadow-none print:border-none print:p-0 print:max-w-none"
      >
        {/* Header */}
        <header className="text-center mb-6 pb-4 border-b-2 border-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 tracking-wide">
            {tailoredResume.contact.fullName}
          </h1>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
            {tailoredResume.contact.email && <span>{tailoredResume.contact.email}</span>}
            {tailoredResume.contact.phone && <span>{tailoredResume.contact.phone}</span>}
            {tailoredResume.contact.location && <span>{tailoredResume.contact.location}</span>}
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 mt-1 text-sm text-indigo-600">
            {tailoredResume.contact.linkedin && <span>{tailoredResume.contact.linkedin}</span>}
            {tailoredResume.contact.website && <span>{tailoredResume.contact.website}</span>}
          </div>
        </header>

        {/* Summary with before/after */}
        {tailoredResume.summary && (
          <section className="mb-5">
            <SectionTitle>Professional Summary</SectionTitle>
            <p className="text-sm text-gray-700 leading-relaxed">{tailoredResume.summary}</p>
            {tailoredResume.originalSummary &&
              tailoredResume.summary !== tailoredResume.originalSummary && (
                <button
                  onClick={() => setShowOriginal(prev => ({ ...prev, summary: !prev.summary }))}
                  className="text-xs text-indigo-500 hover:text-indigo-700 mt-1 no-print"
                >
                  {showOriginal.summary ? "Hide original" : "Show original"}
                </button>
              )}
            {showOriginal.summary && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 no-print">
                <p className="text-xs text-gray-400 mb-1 font-medium uppercase">Original</p>
                <p className="text-sm text-gray-500 leading-relaxed line-through decoration-gray-300">
                  {tailoredResume.originalSummary}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Skills */}
        {tailoredResume.skills.length > 0 && (
          <section className="mb-5">
            <SectionTitle>Technical Skills</SectionTitle>
            <div className="flex flex-wrap gap-x-1 gap-y-0.5 text-sm text-gray-700">
              {tailoredResume.skills.map((skill, i) => {
                const isMatched = analysis.matchedSkills
                  .map(s => s.toLowerCase())
                  .includes(skill.toLowerCase());
                return (
                  <span key={i}>
                    <span className={isMatched ? "font-semibold text-gray-900" : ""}>
                      {skill}
                    </span>
                    {i < tailoredResume.skills.length - 1 && (
                      <span className="text-gray-400 mx-1">•</span>
                    )}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* Experience with before/after */}
        {tailoredResume.experience.length > 0 && (
          <section className="mb-5">
            <SectionTitle>Professional Experience</SectionTitle>
            <div className="space-y-4">
              {tailoredResume.experience.map((exp) => {
                const hasChanges = exp.originalBullets?.some(
                  (ob, i) => ob !== exp.bullets[i]
                );
                const isExpanded = showOriginal[exp.id];

                return (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="font-semibold text-gray-900">{exp.title}</span>
                        <span className="text-gray-500"> | </span>
                        <span className="text-gray-700">{exp.company}</span>
                      </div>
                      <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                        {exp.startDate} – {exp.endDate}
                      </span>
                    </div>
                    <ul className="mt-1.5 space-y-1">
                      {exp.bullets.filter(Boolean).map((bullet, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5 shrink-0">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    {hasChanges && (
                      <button
                        onClick={() => toggleOriginal(exp.id)}
                        className="text-xs text-indigo-500 hover:text-indigo-700 mt-1.5 no-print"
                      >
                        {isExpanded ? "Hide original bullets" : "Compare with original"}
                      </button>
                    )}
                    {isExpanded && exp.originalBullets && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 no-print">
                        <p className="text-xs text-gray-400 mb-1.5 font-medium uppercase">Original Bullets</p>
                        <ul className="space-y-1">
                          {exp.originalBullets.map((ob, i) => (
                            <li key={i} className="text-sm text-gray-500 flex items-start gap-2">
                              <span className="text-gray-300 mt-0.5 shrink-0">•</span>
                              <span className={ob !== exp.bullets[i] ? "line-through decoration-gray-300" : ""}>
                                {ob}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Education */}
        {tailoredResume.education.length > 0 && (
          <section>
            <SectionTitle>Education</SectionTitle>
            <div className="space-y-2">
              {tailoredResume.education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-semibold text-gray-900">
                      {edu.degree} in {edu.field}
                    </span>
                    <span className="text-gray-500"> | </span>
                    <span className="text-gray-700">{edu.institution}</span>
                    {edu.gpa && (
                      <span className="text-gray-500 text-sm"> | GPA: {edu.gpa}</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                    {edu.graduationDate}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 pb-1 border-b border-gray-300">
      {children}
    </h2>
  );
}
