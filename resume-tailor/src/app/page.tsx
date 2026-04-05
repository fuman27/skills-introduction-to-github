"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import Stepper from "@/components/Stepper";
import ResumeForm from "@/components/ResumeForm";
import JobInput from "@/components/JobInput";
import ResumePreview from "@/components/ResumePreview";
import { Resume, AppStep, JobAnalysis, TailoredResume, TailoredExperience } from "@/lib/types";
import { getDefaultResume, saveResume, loadResume } from "@/lib/store";
import { analyzeJob, tailorResume } from "@/lib/analyzer";

function getInitialResume(): Resume {
  const saved = loadResume();
  return saved ?? getDefaultResume();
}

export default function Home() {
  const [step, setStep] = useState<AppStep>("resume");
  const [resume, setResumeState] = useState<Resume>(getInitialResume);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null);
  const [tailoring, setTailoring] = useState(false);
  const loaded = useRef(true);

  const setResume = useCallback((updated: Resume) => {
    setResumeState(updated);
    if (loaded.current) saveResume(updated);
  }, []);

  const handleResumeChange = useCallback((updated: Resume) => {
    setResume(updated);
  }, [setResume]);

  const handleJobDescriptionChange = useCallback(
    (value: string) => {
      setJobDescription(value);
      if (value.trim().length > 50) {
        const result = analyzeJob(value, resume);
        setAnalysis(result);
      } else {
        setAnalysis(null);
      }
    },
    [resume]
  );

  const resumeIsValid = useMemo(() => {
    return (
      resume.contact.fullName.trim() !== "" &&
      (resume.experience.length > 0 || resume.skills.length > 0)
    );
  }, [resume]);

  const canAdvance: Record<AppStep, boolean> = useMemo(
    () => ({
      resume: true,
      job: resumeIsValid,
      preview: resumeIsValid && !!analysis,
    }),
    [resumeIsValid, analysis]
  );

  const generateTailoredResume = useCallback(
    async (currentResume: Resume, currentJd: string, currentAnalysis: JobAnalysis) => {
      setTailoring(true);

      const ruleBasedResult = tailorResume(currentResume, currentJd, currentAnalysis);

      try {
        const statusRes = await fetch("/api/tailor/status");
        const statusData = await statusRes.json();

        if (!statusData.configured) {
          setTailoredResume(ruleBasedResult);
          return;
        }

        toast.loading("AI is tailoring your resume...", { id: "ai-tailor" });

        const res = await fetch("/api/tailor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume: currentResume,
            jobDescription: currentJd,
          }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          toast.dismiss("ai-tailor");
          toast.error("AI unavailable, using smart rule engine");
          setTailoredResume(ruleBasedResult);
          return;
        }

        const aiExperiences: TailoredExperience[] = currentResume.experience.map(
          (origExp, idx) => {
            const aiExp = data.experiences?.[idx];
            const aiBullets = aiExp?.bullets || origExp.bullets;
            return {
              ...origExp,
              bullets: aiBullets,
              originalBullets: origExp.bullets,
            };
          }
        );

        const aiResult: TailoredResume = {
          contact: { ...currentResume.contact },
          summary: data.summary || ruleBasedResult.summary,
          originalSummary: currentResume.summary,
          experience: aiExperiences,
          education: [...currentResume.education],
          skills:
            data.skills && data.skills.length > 0
              ? data.skills
              : ruleBasedResult.skills,
          highlights: [
            "AI-powered rewrite tailored to this specific role",
            ...(data.improvementsMade || []).slice(0, 4),
          ],
          atsScore: ruleBasedResult.atsScore,
          atsTips: ruleBasedResult.atsTips,
          aiPowered: true,
          keywordMatches: data.keywordMatches || ruleBasedResult.keywordMatches,
          improvementsMade: data.improvementsMade || [],
        };

        toast.dismiss("ai-tailor");
        toast.success("Resume tailored by AI strategist");
        setTailoredResume(aiResult);
      } catch {
        toast.dismiss("ai-tailor");
        setTailoredResume(ruleBasedResult);
      } finally {
        setTailoring(false);
      }
    },
    []
  );

  const goToStep = useCallback(
    (target: AppStep) => {
      if (target === "job" && !resumeIsValid) {
        toast.error("Please add your name and at least one experience or skill.");
        return;
      }
      if (target === "preview") {
        if (!analysis) {
          toast.error("Please paste a job description first.");
          return;
        }
        generateTailoredResume(resume, jobDescription, analysis);
      }
      setStep(target);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [resumeIsValid, analysis, resume, jobDescription, generateTailoredResume]
  );

  const nextStep = useCallback(() => {
    if (step === "resume") goToStep("job");
    else if (step === "job") goToStep("preview");
  }, [step, goToStep]);

  const prevStep = useCallback(() => {
    if (step === "preview") goToStep("job");
    else if (step === "job") goToStep("resume");
  }, [step, goToStep]);

  return (
    <>
      <Toaster position="top-center" />

      {/* Header */}
      <header
        id="app-header"
        className="bg-white border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Resume Tailor</h1>
              <p className="text-xs text-gray-500">Customize for every application</p>
            </div>
          </div>
          {analysis && step !== "resume" && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
              <div
                className={`w-2 h-2 rounded-full ${
                  analysis.matchScore >= 70
                    ? "bg-green-500"
                    : analysis.matchScore >= 40
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray-600">
                Match: <span className="font-semibold">{analysis.matchScore}%</span>
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Stepper */}
      <div id="app-stepper" className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <Stepper currentStep={step} onStepClick={goToStep} canAdvance={canAdvance} />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {step === "resume" && <ResumeForm resume={resume} onChange={handleResumeChange} />}
        {step === "job" && (
          <JobInput
            jobDescription={jobDescription}
            onJobDescriptionChange={handleJobDescriptionChange}
            analysis={analysis}
          />
        )}
        {step === "preview" && tailoring && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">AI is rewriting your resume</p>
              <p className="text-sm text-gray-500 mt-1">
                Analyzing job description, mirroring keywords, strengthening bullets...
              </p>
            </div>
          </div>
        )}
        {step === "preview" && !tailoring && tailoredResume && analysis && (
          <ResumePreview tailoredResume={tailoredResume} analysis={analysis} />
        )}

        {/* Navigation */}
        <div id="app-nav" className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={tailoring}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
              step === "resume"
                ? "invisible"
                : "text-gray-700 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Back
          </button>
          <button
            onClick={nextStep}
            disabled={step === "preview" || tailoring}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
              step === "preview"
                ? "invisible"
                : "text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            }`}
          >
            {step === "resume" ? "Next: Job Description" : "Generate Tailored Resume"}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-gray-200 py-4 text-center text-sm text-gray-400">
        Resume Tailor — Customize your resume for every job application
      </footer>
    </>
  );
}
