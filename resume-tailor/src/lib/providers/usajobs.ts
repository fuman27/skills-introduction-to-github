import { JobListing, JobDetail } from "../types";
import { JobProviderInterface, SearchParams, SearchResponse } from "./types";

const USAJOBS_BASE = "https://data.usajobs.gov/api";

interface USAJobsPosition {
  MatchedObjectId: string;
  MatchedObjectDescriptor: {
    PositionTitle: string;
    OrganizationName: string;
    PositionLocationDisplay: string;
    PositionLocation: Array<{
      LocationName: string;
      CityName: string;
      CountrySubDivisionCode: string;
    }>;
    QualificationSummary: string;
    PositionRemuneration: Array<{
      MinimumRange: string;
      MaximumRange: string;
      RateIntervalCode: string;
    }>;
    PublicationStartDate: string;
    PositionURI: string;
    UserArea: {
      Details: {
        MajorDuties?: string[];
        JobSummary?: string;
      };
    };
    DepartmentName: string;
    JobCategory: Array<{ Name: string }>;
    PositionSchedule: Array<{ Name: string }>;
    PositionOfferingType: Array<{ Name: string }>;
  };
}

interface USAJobsSearchResponse {
  SearchResult: {
    SearchResultCount: number;
    SearchResultCountAll: number;
    SearchResultItems: Array<{
      MatchedObjectId: string;
      MatchedObjectDescriptor: USAJobsPosition["MatchedObjectDescriptor"];
    }>;
  };
}

export class USAJobsProvider implements JobProviderInterface {
  id = "usajobs" as const;
  name = "USAJobs";
  description = "Official US government job board. Free API with email-based auth.";
  envVars = ["USAJOBS_API_KEY", "USAJOBS_EMAIL"];

  private get apiKey(): string {
    return process.env.USAJOBS_API_KEY || "";
  }

  private get email(): string {
    return process.env.USAJOBS_EMAIL || "";
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.email);
  }

  async search(params: SearchParams): Promise<SearchResponse> {
    const page = params.page || 1;
    const url = new URL(`${USAJOBS_BASE}/search`);
    url.searchParams.set("Keyword", params.query);
    if (params.location) {
      url.searchParams.set("LocationName", params.location);
    }
    url.searchParams.set("ResultsPerPage", "15");
    url.searchParams.set("Page", String(page));

    const res = await fetch(url.toString(), {
      headers: {
        "Authorization-Key": this.apiKey,
        "User-Agent": this.email,
        Host: "data.usajobs.gov",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `USAJobs API error (${res.status}): ${text.substring(0, 200)}`
      );
    }

    const data: USAJobsSearchResponse = await res.json();
    const items = data.SearchResult?.SearchResultItems || [];

    const jobs: JobListing[] = items.map((item) => {
      const desc = item.MatchedObjectDescriptor;
      let salary = "";
      const pay = desc.PositionRemuneration?.[0];
      if (pay) {
        const min = formatUSD(pay.MinimumRange);
        const max = formatUSD(pay.MaximumRange);
        const interval = pay.RateIntervalCode === "PA" ? "/yr" : `/${pay.RateIntervalCode}`;
        salary = min === max ? `${min}${interval}` : `${min} – ${max}${interval}`;
      }

      return {
        id: item.MatchedObjectId,
        title: desc.PositionTitle || "Unknown Position",
        company: desc.OrganizationName || desc.DepartmentName || "US Government",
        location: desc.PositionLocationDisplay || "",
        snippet: (desc.QualificationSummary || "").substring(0, 300),
        salary,
        datePosted: formatDate(desc.PublicationStartDate),
        url: desc.PositionURI || "",
        provider: "usajobs",
      };
    });

    return {
      jobs,
      totalResults: `${(data.SearchResult?.SearchResultCountAll || jobs.length).toLocaleString()} government jobs found`,
    };
  }

  async getJobDetail(jobId: string): Promise<JobDetail | null> {
    const url = `${USAJOBS_BASE}/search?MatchedObjectId=${jobId}`;

    const res = await fetch(url, {
      headers: {
        "Authorization-Key": this.apiKey,
        "User-Agent": this.email,
        Host: "data.usajobs.gov",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return null;

    const data: USAJobsSearchResponse = await res.json();
    const item = data.SearchResult?.SearchResultItems?.[0];
    if (!item) return null;

    const desc = item.MatchedObjectDescriptor;
    let salary = "";
    const pay = desc.PositionRemuneration?.[0];
    if (pay) {
      const min = formatUSD(pay.MinimumRange);
      const max = formatUSD(pay.MaximumRange);
      const interval = pay.RateIntervalCode === "PA" ? "/yr" : `/${pay.RateIntervalCode}`;
      salary = `${min} – ${max}${interval}`;
    }

    const duties = desc.UserArea?.Details?.MajorDuties || [];
    const summary = desc.UserArea?.Details?.JobSummary || "";

    const description = [
      desc.PositionTitle,
      `at ${desc.OrganizationName || desc.DepartmentName}`,
      desc.PositionLocationDisplay ? `Location: ${desc.PositionLocationDisplay}` : "",
      salary ? `Salary: ${salary}` : "",
      desc.PositionSchedule?.[0]?.Name ? `Schedule: ${desc.PositionSchedule[0].Name}` : "",
      desc.PositionOfferingType?.[0]?.Name ? `Type: ${desc.PositionOfferingType[0].Name}` : "",
      "",
      summary ? `Summary:\n${summary}` : "",
      "",
      duties.length > 0
        ? `Major Duties:\n${duties.map((d) => `• ${d}`).join("\n")}`
        : "",
      "",
      desc.QualificationSummary
        ? `Qualifications:\n${desc.QualificationSummary}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    return {
      title: desc.PositionTitle || "Unknown Position",
      company: desc.OrganizationName || desc.DepartmentName || "US Government",
      location: desc.PositionLocationDisplay || "",
      salary,
      description,
      url: desc.PositionURI || "",
      provider: "usajobs",
    };
  }
}

function formatUSD(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return `$${num.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
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
