"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "react-hot-toast";
import { JobListing, JobProvider, ProviderConfig } from "@/lib/types";

interface JobSearchProps {
  onImportJob: (description: string) => void;
}

const PROVIDER_ICONS: Record<JobProvider, { label: string; color: string }> = {
  adzuna: { label: "Adzuna", color: "text-[#6fbe44]" },
  usajobs: { label: "USAJobs", color: "text-[#112e51]" },
  jsearch: { label: "JSearch", color: "text-[#0066ff]" },
};

export default function JobSearch({ onImportJob }: JobSearchProps) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [provider, setProvider] = useState<JobProvider>("adzuna");
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingJob, setLoadingJob] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    fetch("/api/jobs/providers")
      .then((res) => res.json())
      .then((data) => {
        const list: ProviderConfig[] = data.providers || [];
        setProviders(list);
        const configured = list.find((p) => p.configured);
        if (configured) setProvider(configured.id);
      })
      .catch(() => {})
      .finally(() => setLoadingProviders(false));
  }, []);

  const configuredProviders = providers.filter((p) => p.configured);
  const unconfiguredProviders = providers.filter((p) => !p.configured);

  const searchJobs = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!query.trim()) {
        toast.error("Please enter a job title or keyword");
        return;
      }

      setSearching(true);
      setHasSearched(true);
      setExpandedJob(null);

      try {
        const params = new URLSearchParams({
          q: query,
          l: location,
          provider,
        });
        const res = await fetch(`/api/jobs/search?${params}`);
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Search failed");
          setJobs([]);
          return;
        }

        setJobs(data.jobs || []);
        setTotalResults(data.totalResults || "");

        if (data.jobs?.length === 0) {
          toast("No jobs found. Try different keywords or location.", {
            icon: "🔍",
          });
        }
      } catch {
        toast.error("Failed to connect to search. Please try again.");
        setJobs([]);
      } finally {
        setSearching(false);
      }
    },
    [query, location, provider]
  );

  const importJobDescription = useCallback(
    async (job: JobListing) => {
      setLoadingJob(job.id);

      try {
        const params = new URLSearchParams({
          id: job.id,
          provider: job.provider,
        });
        const res = await fetch(`/api/jobs/detail?${params}`);
        const data = await res.json();

        if (!res.ok) {
          const fallbackDesc = [
            job.title,
            `at ${job.company}`,
            job.location ? `Location: ${job.location}` : "",
            job.salary ? `Salary: ${job.salary}` : "",
            "",
            job.snippet,
          ]
            .filter(Boolean)
            .join("\n");
          onImportJob(fallbackDesc);
          toast.success(`Imported "${job.title}" basic info`);
          return;
        }

        onImportJob(data.description);
        toast.success(
          `Imported "${data.title}" from ${PROVIDER_ICONS[job.provider].label}`
        );
      } catch {
        const fallbackDesc = `${job.title}\nat ${job.company}\nLocation: ${job.location}\n${job.salary ? `Salary: ${job.salary}\n` : ""}\n${job.snippet}`;
        onImportJob(fallbackDesc);
        toast.success(`Imported "${job.title}" basic info`);
      } finally {
        setLoadingJob(null);
      }
    },
    [onImportJob]
  );

  if (loadingProviders) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Provider Selector */}
      {configuredProviders.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Source
          </label>
          <div className="flex flex-wrap gap-2">
            {configuredProviders.map((p) => (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  provider === p.id
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <span className={PROVIDER_ICONS[p.id]?.color || ""}>
                  {p.name}
                </span>
              </button>
            ))}
          </div>
          {configuredProviders.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              {providers.find((p) => p.id === provider)?.description}
            </p>
          )}
        </div>
      )}

      {/* Setup prompt when no providers configured */}
      {configuredProviders.length === 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="font-semibold text-amber-900">
                No job search APIs configured
              </h4>
              <p className="text-sm text-amber-700 mt-1">
                Add API keys as environment variables to enable job search.
                All providers offer free tiers:
              </p>
              <div className="mt-3 space-y-3">
                {unconfiguredProviders.map((p) => (
                  <div key={p.id} className="bg-white rounded-lg border border-amber-200 p-3">
                    <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.envVars.map((v) => (
                        <code
                          key={v}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono"
                        >
                          {v}
                        </code>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-amber-600 mt-3">
                You can still paste job descriptions manually using the &quot;Paste Description&quot; tab.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Form */}
      {configuredProviders.length > 0 && (
        <form onSubmit={searchJobs} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title or Keywords
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Software Engineer, Product Manager..."
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 text-sm"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or Remote"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 text-sm"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={searching}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {searching ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Search Jobs"
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Results */}
      {hasSearched && (
        <div className="space-y-3">
          {totalResults && (
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-gray-500">{totalResults}</p>
              <span className={`text-xs font-medium ${PROVIDER_ICONS[provider]?.color || "text-gray-500"}`}>
                via {PROVIDER_ICONS[provider]?.label || provider}
              </span>
            </div>
          )}

          {jobs.length === 0 && !searching && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-500 font-medium">No jobs found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try different keywords, broaden your location, or switch providers
              </p>
            </div>
          )}

          {jobs.map((job) => (
            <div
              key={`${job.provider}-${job.id}`}
              className="bg-white rounded-xl border border-gray-200 hover:border-indigo-200 transition-colors overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-base leading-snug">
                      {job.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-0.5">{job.company}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                      {job.location && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {job.location}
                        </span>
                      )}
                      {job.salary && (
                        <span className="text-xs text-green-600 font-medium">
                          {job.salary}
                        </span>
                      )}
                      {job.datePosted && (
                        <span className="text-xs text-gray-400">{job.datePosted}</span>
                      )}
                      <span className={`text-xs ${PROVIDER_ICONS[job.provider]?.color || "text-gray-400"}`}>
                        {PROVIDER_ICONS[job.provider]?.label || job.provider}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => importJobDescription(job)}
                      disabled={loadingJob === job.id}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                    >
                      {loadingJob === job.id ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Use This Job
                        </>
                      )}
                    </button>
                    <button
                      onClick={() =>
                        setExpandedJob(expandedJob === job.id ? null : job.id)
                      }
                      className="px-4 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {expandedJob === job.id ? "Less" : "More"}
                    </button>
                  </div>
                </div>

                {job.snippet && expandedJob !== job.id && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {job.snippet}
                  </p>
                )}

                {expandedJob === job.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600 whitespace-pre-line">
                      {job.snippet}
                    </p>
                    {job.url && (
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mt-2"
                      >
                        View full listing
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attribution */}
      {configuredProviders.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-2 text-xs text-gray-400">
          <span>Powered by</span>
          {configuredProviders.map((p, i) => (
            <span key={p.id}>
              <span className={`font-semibold ${PROVIDER_ICONS[p.id]?.color || ""}`}>
                {p.name}
              </span>
              {i < configuredProviders.length - 1 && (
                <span className="mx-1">·</span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
