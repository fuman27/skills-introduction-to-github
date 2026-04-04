"use client";

import { AppStep } from "@/lib/types";

const STEPS: { key: AppStep; label: string; icon: string }[] = [
  { key: "resume", label: "Your Resume", icon: "1" },
  { key: "job", label: "Job Description", icon: "2" },
  { key: "preview", label: "Tailored Resume", icon: "3" },
];

interface StepperProps {
  currentStep: AppStep;
  onStepClick: (step: AppStep) => void;
  canAdvance: Record<AppStep, boolean>;
}

export default function Stepper({ currentStep, onStepClick, canAdvance }: StepperProps) {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep);

  return (
    <nav className="flex items-center justify-center gap-2 sm:gap-4 py-6 px-4">
      {STEPS.map((step, index) => {
        const isActive = step.key === currentStep;
        const isCompleted = index < currentIndex;
        const isClickable = canAdvance[step.key] || isCompleted || isActive;

        return (
          <div key={step.key} className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => isClickable && onStepClick(step.key)}
              disabled={!isClickable}
              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : isCompleted
                  ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  isActive
                    ? "bg-white text-indigo-600"
                    : isCompleted
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {isCompleted ? "✓" : step.icon}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {index < STEPS.length - 1 && (
              <div
                className={`w-8 sm:w-16 h-0.5 ${
                  index < currentIndex ? "bg-indigo-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
