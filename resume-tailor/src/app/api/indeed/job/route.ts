import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobKey = searchParams.get("jk");

  if (!jobKey) {
    return NextResponse.json(
      { error: "Job key (jk) is required" },
      { status: 400 }
    );
  }

  const url = `https://www.indeed.com/viewjob?jk=${encodeURIComponent(jobKey)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Indeed returned status ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $("h1.jobsearch-JobInfoHeader-title, .jobsearch-JobInfoHeader-title-container h1")
      .first()
      .text()
      .trim();

    const company = $(
      "[data-testid='inlineHeader-companyName'] a, .jobsearch-InlineCompanyRating-companyHeader a, [data-company-name='true']"
    )
      .first()
      .text()
      .trim();

    const location = $(
      "[data-testid='inlineHeader-companyLocation'], [data-testid='job-location'], .jobsearch-JobInfoHeader-subtitle > div:last-child"
    )
      .first()
      .text()
      .trim();

    const descriptionEl = $(
      "#jobDescriptionText, .jobsearch-JobComponent-description, .jobsearch-jobDescriptionText"
    ).first();

    let descriptionText = "";

    if (descriptionEl.length) {
      descriptionEl.find("br").replaceWith("\n");
      descriptionEl.find("li").each((_i, li) => {
        $(li).prepend("• ");
        $(li).append("\n");
      });
      descriptionEl.find("p, div, h1, h2, h3, h4, h5, h6").each((_i, el) => {
        $(el).append("\n");
      });
      descriptionText = descriptionEl.text().replace(/\n{3,}/g, "\n\n").trim();
    }

    const salary = $(
      "#salaryInfoAndJobType, [data-testid='attribute_snippet_testid']"
    )
      .first()
      .text()
      .trim();

    const fullDescription = [
      title ? `${title}` : "",
      company ? `at ${company}` : "",
      location ? `Location: ${location}` : "",
      salary ? `Salary: ${salary}` : "",
      "",
      descriptionText,
    ]
      .filter(Boolean)
      .join("\n");

    return NextResponse.json({
      title: title || "Unknown Position",
      company: company || "Unknown Company",
      location,
      salary,
      description: fullDescription,
      url,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch job details";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
