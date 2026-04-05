import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
];

function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const location = searchParams.get("l") || "";
  const start = searchParams.get("start") || "0";

  if (!query.trim()) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({
    q: query,
    l: location,
    start,
    fromage: "14",
  });

  const url = `https://www.indeed.com/jobs?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": randomUA(),
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          error: `Indeed returned status ${res.status}. This may be due to rate limiting — try again in a moment.`,
        },
        { status: 502 }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const jobs: {
      id: string;
      title: string;
      company: string;
      location: string;
      snippet: string;
      salary: string;
      datePosted: string;
      url: string;
    }[] = [];

    $(".job_seen_beacon, .tapItem, .resultContent").each((_i, el) => {
      const $el = $(el);

      const titleEl =
        $el.find("h2.jobTitle a, a.jcs-JobTitle, .jobTitle > a").first();
      const title = titleEl.text().trim() || $el.find("h2").first().text().trim();
      const jobKey =
        titleEl.attr("data-jk") ||
        $el.closest("[data-jk]").attr("data-jk") ||
        $el.find("[data-jk]").attr("data-jk") ||
        titleEl.attr("href")?.match(/jk=([^&]+)/)?.[1] ||
        "";

      const company = $el
        .find("[data-testid='company-name'], .companyName, .company")
        .first()
        .text()
        .trim();
      const loc = $el
        .find("[data-testid='text-location'], .companyLocation, .location")
        .first()
        .text()
        .trim();
      const snippet = $el
        .find(".job-snippet, .underShelfFooter, .heading6, ul li")
        .first()
        .text()
        .trim();
      const salary = $el
        .find(
          "[data-testid='attribute_snippet_testid'], .salary-snippet-container, .metadata .attribute_snippet"
        )
        .first()
        .text()
        .trim();
      const datePosted = $el
        .find(".date, .myJobsStateDate, span.css-qvloho")
        .first()
        .text()
        .trim();

      if (title && (company || jobKey)) {
        jobs.push({
          id: jobKey || `indeed-${_i}`,
          title,
          company: company || "Unknown Company",
          location: loc || location,
          snippet: snippet.substring(0, 300),
          salary,
          datePosted,
          url: jobKey
            ? `https://www.indeed.com/viewjob?jk=${jobKey}`
            : "",
        });
      }
    });

    const countText = $(".jobsearch-JobCountAndSortPane-jobCount, #searchCountPages")
      .first()
      .text()
      .trim();

    return NextResponse.json({
      jobs,
      totalResults: countText || `${jobs.length} jobs found`,
      query,
      location,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to search Indeed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
