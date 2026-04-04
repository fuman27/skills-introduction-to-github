"use client";

import { JobAnalysis } from "@/lib/types";
import { getSampleJobDescription } from "@/lib/store";

interface JobInputProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  analysis: JobAnalysis | null;
}

export default function JobInput({
  jobDescription,
  onJobDescriptionChange,
  analysis,
}: JobInputProps) {
  const loadSample = () => {
    onJobDescriptionChange(getSampleJobDescription());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Description</h2>
          <p className="text-gray-500 mt-1">
            Paste the job description and we&apos;ll analyze it against your resume.
          </p>
        </div>
        <button
          onClick={loadSample}
          className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          Load Sample
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <textarea
          value={jobDescription}
          onChange={e => onJobDescriptionChange(e.target.value)}
          placeholder={`Paste the full job description here...\n\nExample:\nSenior Software Engineer at TechCo\n\nRequired:\n- 5+ years of experience with React/TypeScript\n- Experience with cloud platforms (AWS/GCP)\n...`}
          rows={16}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 resize-none font-mono text-sm"
        />
      </div>

      {analysis && (
        <div className="space-y-4">
          {/* Match Score */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Analysis</h3>
            <div className="flex items-center gap-6 mb-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={analysis.matchScore >= 70 ? "#22c55e" : analysis.matchScore >= 40 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="8"
                    strokeDasharray={`${(analysis.matchScore / 100) * 264} 264`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{analysis.matchScore}%</span>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  {analysis.matchScore >= 70
                    ? "Strong Match"
                    : analysis.matchScore >= 40
                    ? "Good Match"
                    : "Partial Match"}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {analysis.title} at {analysis.company}
                </p>
                <p className="text-gray-400 text-sm">
                  Experience level: {analysis.experienceLevel}
                </p>
              </div>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Matched Skills ({analysis.matchedSkills.length})
              </h4>
              {analysis.matchedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.matchedSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No skill matches found</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full" />
                Missing Skills ({analysis.missingSkills.length})
              </h4>
              {analysis.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded-full border border-orange-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No skill gaps identified</p>
              )}
            </div>
          </div>

          {/* Required vs Preferred */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Required Skills</h4>
              {analysis.requiredSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.requiredSkills.map((skill, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1 text-sm rounded-full border ${
                        analysis.matchedSkills.includes(skill)
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Could not parse required skills</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Preferred Skills</h4>
              {analysis.preferredSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.preferredSkills.map((skill, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1 text-sm rounded-full border ${
                        analysis.matchedSkills.includes(skill)
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No preferred skills listed</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
