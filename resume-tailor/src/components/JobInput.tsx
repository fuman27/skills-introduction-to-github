"use client";

import { useState } from "react";
import { JobAnalysis } from "@/lib/types";
import { getSampleJobDescription } from "@/lib/store";
import JobSearch from "@/components/JobSearch";

type JobTab = "paste" | "search";

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
  const [activeTab, setActiveTab] = useState<JobTab>("paste");

  const loadSample = () => {
    onJobDescriptionChange(getSampleJobDescription());
  };

  const handleImportFromSearch = (description: string) => {
    onJobDescriptionChange(description);
    setActiveTab("paste");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Description</h2>
          <p className="text-gray-500 mt-1">
            Search real job boards or paste a description to analyze against your resume.
          </p>
        </div>
        {activeTab === "paste" && (
          <button
            onClick={loadSample}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Load Sample
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("paste")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "paste"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Paste Description
        </button>
        <button
          onClick={() => setActiveTab("search")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "search"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search Job Boards
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "paste" && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <textarea
              value={jobDescription}
              onChange={e => onJobDescriptionChange(e.target.value)}
              placeholder={`Paste the full job description here...\n\nExample:\nSenior Software Engineer at TechCo\n\nRequired:\n- 5+ years of experience with React/TypeScript\n- Experience with cloud platforms (AWS/GCP)\n...`}
              rows={16}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 resize-none font-mono text-sm"
            />
          </div>

          {analysis && <AnalysisPanel analysis={analysis} />}
        </>
      )}

      {activeTab === "search" && (
        <>
          <JobSearch onImportJob={handleImportFromSearch} />

          {jobDescription && analysis && (
            <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      analysis.matchScore >= 70
                        ? "bg-green-500"
                        : analysis.matchScore >= 40
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm font-medium text-indigo-900">
                    Current job loaded: {analysis.title} at {analysis.company} ({analysis.matchScore}% match)
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab("paste")}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View Analysis →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AnalysisPanel({ analysis }: { analysis: JobAnalysis }) {
  return (
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
  );
}
