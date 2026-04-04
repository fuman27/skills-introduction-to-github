"use client";

import { TailoredResume, JobAnalysis } from "@/lib/types";
import { useRef, useCallback } from "react";

interface ResumePreviewProps {
  tailoredResume: TailoredResume;
  analysis: JobAnalysis;
}

export default function ResumePreview({ tailoredResume, analysis }: ResumePreviewProps) {
  const resumeRef = useRef<HTMLDivElement>(null);

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
  }, [tailoredResume]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tailored Resume</h2>
          <p className="text-gray-500 mt-1">
            Optimized for: {analysis.title} at {analysis.company}
          </p>
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
        <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4">
          <h4 className="font-semibold text-indigo-900 mb-2">Tailoring Highlights</h4>
          <ul className="space-y-1">
            {tailoredResume.highlights.map((h, i) => (
              <li key={i} className="text-sm text-indigo-700 flex items-start gap-2">
                <span className="mt-0.5">→</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
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

        {/* Summary */}
        {tailoredResume.summary && (
          <section className="mb-5">
            <SectionTitle>Professional Summary</SectionTitle>
            <p className="text-sm text-gray-700 leading-relaxed">{tailoredResume.summary}</p>
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

        {/* Experience */}
        {tailoredResume.experience.length > 0 && (
          <section className="mb-5">
            <SectionTitle>Professional Experience</SectionTitle>
            <div className="space-y-4">
              {tailoredResume.experience.map((exp) => (
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
                </div>
              ))}
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
