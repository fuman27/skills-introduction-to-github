import { NextRequest, NextResponse } from "next/server";
import { Resume } from "@/lib/types";

interface TailorRequest {
  resume: Resume;
  jobDescription: string;
}

interface ParsedAIResponse {
  summary: string;
  experiences: { company: string; title: string; bullets: string[] }[];
  skills: string[];
  keywordMatches: string[];
  improvementsMade: string[];
}

function serializeResume(resume: Resume): string {
  const lines: string[] = [];

  lines.push(`Name: ${resume.contact.fullName}`);
  if (resume.contact.email) lines.push(`Email: ${resume.contact.email}`);
  if (resume.contact.phone) lines.push(`Phone: ${resume.contact.phone}`);
  if (resume.contact.location) lines.push(`Location: ${resume.contact.location}`);
  if (resume.contact.linkedin) lines.push(`LinkedIn: ${resume.contact.linkedin}`);
  if (resume.contact.website) lines.push(`Website: ${resume.contact.website}`);
  lines.push("");

  if (resume.summary) {
    lines.push("SUMMARY:");
    lines.push(resume.summary);
    lines.push("");
  }

  if (resume.skills.length > 0) {
    lines.push("SKILLS:");
    lines.push(resume.skills.join(", "));
    lines.push("");
  }

  for (const exp of resume.experience) {
    lines.push(`EXPERIENCE: ${exp.title} at ${exp.company} (${exp.startDate} – ${exp.endDate})`);
    for (const b of exp.bullets) {
      lines.push(`• ${b}`);
    }
    lines.push("");
  }

  for (const edu of resume.education) {
    lines.push(`EDUCATION: ${edu.degree} in ${edu.field}, ${edu.institution} (${edu.graduationDate})${edu.gpa ? ` GPA: ${edu.gpa}` : ""}`);
  }

  return lines.join("\n");
}

function buildPrompt(resume: string, jobDescription: string): string {
  return `You are an elite resume strategist and hiring expert.

Your job is to transform a candidate's resume so it is highly tailored to a specific job description and maximizes the chances of getting an interview.

You DO NOT write generic resumes.

You:
- prioritize clarity, impact, and results
- mirror the language and keywords from the job description
- remove fluff, filler, and weak phrasing
- make every bullet point sound purposeful and results-driven
- maintain honesty (do not fabricate experience or invent metrics not present in the original)
- optimize for ATS (Applicant Tracking Systems)

Your tone:
- confident, professional, and concise
- natural and human (never robotic or overly verbose)
- strong action verbs
- no clichés like "hardworking" or "team player"

Output must feel like it was written by a top-tier resume expert, not AI.

Here is the candidate's current resume:

${resume}

Here is the job description:

${jobDescription}

Your task:

1. Rewrite the resume to strongly match the job description
2. Prioritize relevant experience and de-emphasize irrelevant content
3. Rewrite bullet points to:
   - start with strong action verbs
   - include measurable impact when possible
   - align with job requirements
4. Integrate important keywords naturally from the job description
5. Improve clarity, flow, and professionalism
6. Keep it concise (no unnecessary length)

You MUST respond in EXACTLY this format with these exact section headers:

=== TAILORED RESUME ===

SUMMARY:
(rewritten professional summary — 2-3 sentences max)

SKILLS:
(comma-separated list of skills, ordered by relevance to the job)

EXPERIENCE: [Job Title] at [Company]
• bullet point
• bullet point
(repeat for each position, keep same companies/titles as original)

=== KEYWORD MATCH ===
(list 10–20 important keywords/skills from the job description that were incorporated, one per line, prefixed with "- ")

=== IMPROVEMENTS MADE ===
(short bullet list explaining what was improved and why, one per line, prefixed with "- ")`;
}

function parseAIResponse(text: string, resume: Resume): ParsedAIResponse {
  const result: ParsedAIResponse = {
    summary: "",
    experiences: [],
    skills: [],
    keywordMatches: [],
    improvementsMade: [],
  };

  const resumeSection = text.match(
    /=== TAILORED RESUME ===([\s\S]*?)(?==== KEYWORD MATCH ===|$)/
  );
  const keywordSection = text.match(
    /=== KEYWORD MATCH ===([\s\S]*?)(?==== IMPROVEMENTS MADE ===|$)/
  );
  const improvementsSection = text.match(
    /=== IMPROVEMENTS MADE ===([\s\S]*?)$/
  );

  if (resumeSection) {
    const content = resumeSection[1].trim();

    const summaryMatch = content.match(
      /SUMMARY:\s*([\s\S]*?)(?=\n\s*(?:SKILLS:|EXPERIENCE:)|$)/i
    );
    if (summaryMatch) {
      result.summary = summaryMatch[1].trim();
    }

    const skillsMatch = content.match(
      /SKILLS:\s*([\s\S]*?)(?=\n\s*EXPERIENCE:|$)/i
    );
    if (skillsMatch) {
      result.skills = skillsMatch[1]
        .trim()
        .split(/,\s*/)
        .map(s => s.trim())
        .filter(Boolean);
    }

    const expBlocks = content.split(/EXPERIENCE:\s*/i).slice(1);
    for (const block of expBlocks) {
      const lines = block.trim().split("\n");
      const headerLine = lines[0] || "";

      const headerMatch = headerLine.match(/^(.+?)\s+at\s+(.+?)$/i);
      let title = headerMatch ? headerMatch[1].trim() : "";
      let company = headerMatch ? headerMatch[2].trim() : "";

      if (!title && !company) {
        const altMatch = headerLine.match(/^(.+?)\s*\|\s*(.+?)$/);
        if (altMatch) {
          title = altMatch[1].trim();
          company = altMatch[2].trim();
        }
      }

      const bullets = lines
        .slice(1)
        .map(l => l.replace(/^[•\-–]\s*/, "").trim())
        .filter(l => l.length > 10);

      if (bullets.length > 0) {
        result.experiences.push({
          title: title || "Position",
          company: company || "Company",
          bullets,
        });
      }
    }

    if (result.experiences.length === 0 && resume.experience.length > 0) {
      const allBullets = content.match(/^[•\-–]\s*.+$/gm);
      if (allBullets && allBullets.length > 0) {
        const bulletsPerExp = Math.ceil(allBullets.length / resume.experience.length);
        for (let i = 0; i < resume.experience.length; i++) {
          const start = i * bulletsPerExp;
          const end = Math.min(start + bulletsPerExp, allBullets.length);
          const bullets = allBullets.slice(start, end).map(b =>
            b.replace(/^[•\-–]\s*/, "").trim()
          );
          result.experiences.push({
            title: resume.experience[i].title,
            company: resume.experience[i].company,
            bullets,
          });
        }
      }
    }
  }

  if (keywordSection) {
    result.keywordMatches = keywordSection[1]
      .trim()
      .split("\n")
      .map(l => l.replace(/^[-•\d.)\s]+/, "").trim())
      .filter(l => l.length > 0 && l.length < 100);
  }

  if (improvementsSection) {
    result.improvementsMade = improvementsSection[1]
      .trim()
      .split("\n")
      .map(l => l.replace(/^[-•\d.)\s]+/, "").trim())
      .filter(l => l.length > 0 && l.length < 300);
  }

  return result;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured", configured: false },
      { status: 422 }
    );
  }

  let body: TailorRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { resume, jobDescription } = body;
  if (!resume || !jobDescription) {
    return NextResponse.json(
      { error: "Both resume and jobDescription are required" },
      { status: 400 }
    );
  }

  const serialized = serializeResume(resume);
  const prompt = buildPrompt(serialized, jobDescription);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are an elite resume strategist. Follow the output format exactly. Do not add any text outside the specified sections.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `AI API error (${res.status}): ${errText.substring(0, 200)}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Empty response from AI" },
        { status: 502 }
      );
    }

    const parsed = parseAIResponse(content, resume);

    return NextResponse.json({
      summary: parsed.summary,
      experiences: parsed.experiences,
      skills: parsed.skills,
      keywordMatches: parsed.keywordMatches,
      improvementsMade: parsed.improvementsMade,
      raw: content,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
