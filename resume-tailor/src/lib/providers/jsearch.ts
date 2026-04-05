import { JobListing, JobDetail } from "../types";
import { JobProviderInterface, SearchParams, SearchResponse } from "./types";

const JSEARCH_BASE = "https://jsearch.p.rapidapi.com";

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  job_city: string;
  job_state: string;
  job_country: string;
  job_description: string;
  job_highlights?: {
    Qualifications?: string[];
    Responsibilities?: string[];
    Benefits?: string[];
  };
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string;
  job_salary_period: string;
  job_posted_at_datetime_utc: string;
  job_apply_link: string;
  job_employment_type: string;
  job_is_remote: boolean;
}

interface JSearchSearchResponse {
  status: string;
  request_id: string;
  data: JSearchJob[];
}

interface JSearchDetailResponse {
  status: string;
  data: JSearchJob[];
}

export class JSearchProvider implements JobProviderInterface {
  id = "jsearch" as const;
  name = "JSearch";
  description = "Aggregated job search via RapidAPI. Free tier: 200 requests/month.";
  envVars = ["RAPIDAPI_KEY"];

  private get apiKey(): string {
    return process.env.RAPIDAPI_KEY || "";
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  private get headers() {
    return {
      "x-rapidapi-key": this.apiKey,
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
    };
  }

  async search(params: SearchParams): Promise<SearchResponse> {
    const page = params.page || 1;
    const query = params.location
      ? `${params.query} in ${params.location}`
      : params.query;

    const url = new URL(`${JSEARCH_BASE}/search`);
    url.searchParams.set("query", query);
    url.searchParams.set("page", String(page));
    url.searchParams.set("num_pages", "1");
    url.searchParams.set("date_posted", "month");

    const res = await fetch(url.toString(), {
      headers: this.headers,
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `JSearch API error (${res.status}): ${text.substring(0, 200)}`
      );
    }

    const data: JSearchSearchResponse = await res.json();

    const jobs: JobListing[] = (data.data || []).map((j) => {
      const locationParts = [j.job_city, j.job_state, j.job_country].filter(Boolean);
      let loc = locationParts.join(", ");
      if (j.job_is_remote) loc = loc ? `${loc} (Remote)` : "Remote";

      let salary = "";
      if (j.job_min_salary && j.job_max_salary) {
        const currency = j.job_salary_currency || "USD";
        const period = j.job_salary_period === "YEAR" ? "/yr" : `/${j.job_salary_period || "yr"}`;
        salary =
          j.job_min_salary === j.job_max_salary
            ? `${formatCurrency(j.job_min_salary, currency)}${period}`
            : `${formatCurrency(j.job_min_salary, currency)} – ${formatCurrency(j.job_max_salary, currency)}${period}`;
      }

      const snippetParts: string[] = [];
      if (j.job_highlights?.Qualifications) {
        snippetParts.push(...j.job_highlights.Qualifications.slice(0, 2));
      }
      if (snippetParts.length === 0 && j.job_description) {
        snippetParts.push(j.job_description.substring(0, 300));
      }

      return {
        id: j.job_id,
        title: j.job_title || "Unknown Position",
        company: j.employer_name || "Unknown Company",
        location: loc,
        snippet: snippetParts.join(". ").substring(0, 300),
        salary,
        datePosted: formatDate(j.job_posted_at_datetime_utc),
        url: j.job_apply_link || "",
        provider: "jsearch",
      };
    });

    return {
      jobs,
      totalResults: `${jobs.length} jobs found`,
    };
  }

  async getJobDetail(jobId: string): Promise<JobDetail | null> {
    const url = new URL(`${JSEARCH_BASE}/job-details`);
    url.searchParams.set("job_id", jobId);

    const res = await fetch(url.toString(), {
      headers: this.headers,
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return null;

    const data: JSearchDetailResponse = await res.json();
    const j = data.data?.[0];
    if (!j) return null;

    const locationParts = [j.job_city, j.job_state, j.job_country].filter(Boolean);
    let loc = locationParts.join(", ");
    if (j.job_is_remote) loc = loc ? `${loc} (Remote)` : "Remote";

    let salary = "";
    if (j.job_min_salary && j.job_max_salary) {
      const currency = j.job_salary_currency || "USD";
      const period = j.job_salary_period === "YEAR" ? "/yr" : `/${j.job_salary_period || "yr"}`;
      salary = `${formatCurrency(j.job_min_salary, currency)} – ${formatCurrency(j.job_max_salary, currency)}${period}`;
    }

    const sections: string[] = [
      j.job_title || "",
      j.employer_name ? `at ${j.employer_name}` : "",
      loc ? `Location: ${loc}` : "",
      salary ? `Salary: ${salary}` : "",
      j.job_employment_type ? `Type: ${j.job_employment_type}` : "",
      "",
    ];

    if (j.job_description) {
      sections.push(j.job_description);
    }

    if (j.job_highlights?.Qualifications?.length) {
      sections.push("", "Qualifications:");
      j.job_highlights.Qualifications.forEach((q) => sections.push(`• ${q}`));
    }

    if (j.job_highlights?.Responsibilities?.length) {
      sections.push("", "Responsibilities:");
      j.job_highlights.Responsibilities.forEach((r) => sections.push(`• ${r}`));
    }

    if (j.job_highlights?.Benefits?.length) {
      sections.push("", "Benefits:");
      j.job_highlights.Benefits.forEach((b) => sections.push(`• ${b}`));
    }

    return {
      title: j.job_title || "Unknown Position",
      company: j.employer_name || "Unknown Company",
      location: loc,
      salary,
      description: sections.filter(Boolean).join("\n"),
      url: j.job_apply_link || "",
      provider: "jsearch",
    };
  }
}

function formatCurrency(value: number, currency: string): string {
  const symbol = currency === "USD" ? "$" : currency;
  return `${symbol}${Math.round(value).toLocaleString("en-US")}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}
