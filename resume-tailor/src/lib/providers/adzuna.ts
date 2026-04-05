import { JobListing, JobDetail } from "../types";
import { JobProviderInterface, SearchParams, SearchResponse } from "./types";

const ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs";

interface AdzunaResult {
  id: string;
  title: string;
  description: string;
  redirect_url: string;
  created: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  salary_min?: number;
  salary_max?: number;
  contract_time?: string;
  category?: { label?: string };
}

interface AdzunaSearchResponse {
  results: AdzunaResult[];
  count: number;
  mean: number;
}

export class AdzunaProvider implements JobProviderInterface {
  id = "adzuna" as const;
  name = "Adzuna";
  description = "Global job search across 16+ countries. Free tier: 250 requests/month.";
  envVars = ["ADZUNA_APP_ID", "ADZUNA_APP_KEY"];

  private get appId(): string {
    return process.env.ADZUNA_APP_ID || "";
  }

  private get appKey(): string {
    return process.env.ADZUNA_APP_KEY || "";
  }

  isConfigured(): boolean {
    return Boolean(this.appId && this.appKey);
  }

  async search(params: SearchParams): Promise<SearchResponse> {
    const page = params.page || 1;
    const country = "us";

    const url = new URL(`${ADZUNA_BASE}/${country}/search/${page}`);
    url.searchParams.set("app_id", this.appId);
    url.searchParams.set("app_key", this.appKey);
    url.searchParams.set("what", params.query);
    if (params.location) {
      url.searchParams.set("where", params.location);
    }
    url.searchParams.set("results_per_page", "15");
    url.searchParams.set("content-type", "application/json");

    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Adzuna API error (${res.status}): ${text.substring(0, 200)}`
      );
    }

    const data: AdzunaSearchResponse = await res.json();

    const jobs: JobListing[] = (data.results || []).map((r) => {
      let salary = "";
      if (r.salary_min && r.salary_max) {
        salary =
          r.salary_min === r.salary_max
            ? `$${Math.round(r.salary_min).toLocaleString()}`
            : `$${Math.round(r.salary_min).toLocaleString()} – $${Math.round(r.salary_max).toLocaleString()}`;
      } else if (r.salary_min) {
        salary = `From $${Math.round(r.salary_min).toLocaleString()}`;
      }

      return {
        id: String(r.id),
        title: r.title || "Unknown Position",
        company: r.company?.display_name || "Unknown Company",
        location: r.location?.display_name || "",
        snippet: stripHtml(r.description || "").substring(0, 300),
        salary,
        datePosted: formatDate(r.created),
        url: r.redirect_url || "",
        provider: "adzuna",
      };
    });

    return {
      jobs,
      totalResults: `${data.count?.toLocaleString() || jobs.length} jobs found`,
    };
  }

  async getJobDetail(jobId: string): Promise<JobDetail | null> {
    const country = "us";
    const url = new URL(`${ADZUNA_BASE}/${country}/search/1`);
    url.searchParams.set("app_id", this.appId);
    url.searchParams.set("app_key", this.appKey);
    url.searchParams.set("what_exclude", "");
    url.searchParams.set("results_per_page", "1");

    const searchUrl = `${ADZUNA_BASE}/${country}/search/1?app_id=${this.appId}&app_key=${this.appKey}&what=${jobId}&results_per_page=1`;

    const res = await fetch(searchUrl, {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return null;

    const data: AdzunaSearchResponse = await res.json();
    const r = data.results?.[0];
    if (!r) return null;

    let salary = "";
    if (r.salary_min && r.salary_max) {
      salary = `$${Math.round(r.salary_min).toLocaleString()} – $${Math.round(r.salary_max).toLocaleString()}`;
    }

    const description = [
      r.title,
      r.company?.display_name ? `at ${r.company.display_name}` : "",
      r.location?.display_name ? `Location: ${r.location.display_name}` : "",
      salary ? `Salary: ${salary}` : "",
      r.contract_time ? `Type: ${r.contract_time}` : "",
      "",
      stripHtml(r.description || ""),
    ]
      .filter(Boolean)
      .join("\n");

    return {
      title: r.title || "Unknown Position",
      company: r.company?.display_name || "Unknown Company",
      location: r.location?.display_name || "",
      salary,
      description,
      url: r.redirect_url || "",
      provider: "adzuna",
    };
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}
