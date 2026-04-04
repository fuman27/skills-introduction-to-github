import { Resume, JobAnalysis, TailoredResume, Experience } from "./types";

const COMMON_TECH_SKILLS = [
  "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "go",
  "rust", "swift", "kotlin", "php", "scala", "r", "sql", "nosql",
  "react", "angular", "vue", "svelte", "next.js", "nextjs", "nuxt",
  "node.js", "nodejs", "express", "django", "flask", "spring", "rails",
  "fastapi", ".net", "laravel",
  "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform",
  "jenkins", "ci/cd", "github actions", "gitlab",
  "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "dynamodb",
  "cassandra", "sqlite",
  "html", "css", "sass", "tailwind", "bootstrap", "material ui",
  "git", "rest", "graphql", "grpc", "websockets", "microservices",
  "agile", "scrum", "kanban", "jira", "confluence",
  "machine learning", "deep learning", "nlp", "computer vision", "tensorflow",
  "pytorch", "data science", "data analysis", "pandas", "numpy",
  "figma", "sketch", "adobe", "photoshop", "illustrator",
  "linux", "bash", "powershell", "nginx", "apache",
  "testing", "jest", "cypress", "selenium", "pytest", "junit",
  "security", "oauth", "jwt", "authentication", "authorization",
  "devops", "sre", "monitoring", "logging", "observability",
  "product management", "project management", "leadership", "communication",
  "problem solving", "analytical", "strategic", "collaboration",
];

const EXPERIENCE_LEVELS: Record<string, string[]> = {
  "entry-level": ["junior", "entry level", "entry-level", "0-2 years", "new grad", "associate", "intern"],
  "mid-level": ["mid-level", "mid level", "3-5 years", "2-5 years", "3+ years", "intermediate"],
  "senior": ["senior", "5+ years", "5-10 years", "lead", "principal", "staff", "experienced"],
  "executive": ["director", "vp", "vice president", "c-level", "cto", "ceo", "cfo", "head of", "executive"],
};

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s+#./]/g, " ").replace(/\s+/g, " ").trim();
}

function extractKeywords(text: string): string[] {
  const normalized = normalizeText(text);
  const words = normalized.split(" ");

  const keywords: Set<string> = new Set();

  for (const skill of COMMON_TECH_SKILLS) {
    if (normalized.includes(skill.toLowerCase())) {
      keywords.add(skill.toLowerCase());
    }
  }

  const importantPatterns = [
    /\b\d+\+?\s*years?\b/gi,
    /\b(?:bachelor|master|phd|doctorate|mba)\b/gi,
    /\b(?:certified|certification)\b/gi,
  ];

  for (const pattern of importantPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(m => keywords.add(m.toLowerCase()));
    }
  }

  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "shall", "can", "this", "that",
    "these", "those", "i", "you", "we", "they", "he", "she", "it",
    "my", "your", "our", "their", "its", "me", "us", "them", "him", "her",
    "not", "no", "nor", "so", "if", "then", "than", "too", "very",
    "just", "about", "above", "after", "again", "all", "also", "am", "as",
    "each", "etc", "get", "got", "into", "more", "most", "must", "new",
    "now", "only", "other", "own", "per", "some", "such", "up", "out",
    "over", "who", "what", "when", "where", "which", "while", "why", "how",
  ]);

  words.forEach(w => {
    if (w.length > 2 && !stopWords.has(w)) {
      keywords.add(w);
    }
  });

  return Array.from(keywords);
}

function extractSkillsFromSection(text: string): { required: string[]; preferred: string[] } {
  const normalized = normalizeText(text);
  const required: string[] = [];
  const preferred: string[] = [];

  const requiredSection = text.match(
    /(?:required|must have|minimum|essential|qualifications)[:\s]*([\s\S]*?)(?=(?:preferred|nice to have|bonus|desired|additional|\n\n|$))/i
  );
  const preferredSection = text.match(
    /(?:preferred|nice to have|bonus|desired|additional)[:\s]*([\s\S]*?)(?=\n\n|$)/i
  );

  const extractFromSection = (section: string): string[] => {
    const skills: string[] = [];
    for (const skill of COMMON_TECH_SKILLS) {
      if (normalizeText(section).includes(skill.toLowerCase())) {
        skills.push(skill);
      }
    }
    return skills;
  };

  if (requiredSection) {
    required.push(...extractFromSection(requiredSection[1]));
  }
  if (preferredSection) {
    preferred.push(...extractFromSection(preferredSection[1]));
  }

  if (required.length === 0 && preferred.length === 0) {
    const allSkills = extractFromSection(normalized);
    required.push(...allSkills);
  }

  return { required, preferred };
}

function detectExperienceLevel(text: string): string {
  const normalized = normalizeText(text);
  for (const [level, indicators] of Object.entries(EXPERIENCE_LEVELS)) {
    for (const indicator of indicators) {
      if (normalized.includes(indicator)) {
        return level;
      }
    }
  }
  return "mid-level";
}

function extractCompanyAndTitle(text: string): { title: string; company: string } {
  const lines = text.split("\n").filter(l => l.trim());

  let title = "";
  let company = "";

  const titlePatterns = [
    /(?:job\s*title|position|role)[:\s]*(.+)/i,
    /^(.+?)\s*(?:at|@|-)\s*(.+)$/i,
  ];

  for (const line of lines.slice(0, 5)) {
    for (const pattern of titlePatterns) {
      const match = line.match(pattern);
      if (match) {
        if (match[2]) {
          title = match[1].trim();
          company = match[2].trim();
        } else {
          title = match[1].trim();
        }
        break;
      }
    }
    if (title) break;
  }

  if (!title && lines.length > 0) {
    title = lines[0].trim().substring(0, 100);
  }

  const companyPatterns = [
    /(?:company|employer|organization)[:\s]*(.+)/i,
    /(?:about|at)\s+([A-Z][A-Za-z\s&.]+)/,
  ];

  if (!company) {
    for (const line of lines.slice(0, 10)) {
      for (const pattern of companyPatterns) {
        const match = line.match(pattern);
        if (match) {
          company = match[1].trim();
          break;
        }
      }
      if (company) break;
    }
  }

  return { title: title || "Position", company: company || "Company" };
}

export function analyzeJob(jobDescription: string, resume: Resume): JobAnalysis {
  const { title, company } = extractCompanyAndTitle(jobDescription);
  const { required, preferred } = extractSkillsFromSection(jobDescription);
  const keywords = extractKeywords(jobDescription);
  const experienceLevel = detectExperienceLevel(jobDescription);

  const resumeSkillsNormalized = resume.skills.map(s => s.toLowerCase());
  const resumeText = normalizeText([
    resume.summary,
    ...resume.experience.flatMap(e => [e.title, e.company, ...e.bullets]),
    ...resume.education.map(e => `${e.degree} ${e.field} ${e.institution}`),
  ].join(" "));

  const allJobSkills = [...new Set([...required, ...preferred])];
  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of allJobSkills) {
    const skillLower = skill.toLowerCase();
    if (
      resumeSkillsNormalized.includes(skillLower) ||
      resumeText.includes(skillLower)
    ) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const totalSkills = allJobSkills.length || 1;
  const matchScore = Math.round((matched.length / totalSkills) * 100);

  return {
    title,
    company,
    requiredSkills: required,
    preferredSkills: preferred,
    keywords,
    experienceLevel,
    matchedSkills: matched,
    missingSkills: missing,
    matchScore: Math.min(matchScore, 100),
  };
}

export function tailorResume(
  resume: Resume,
  jobDescription: string,
  analysis: JobAnalysis
): TailoredResume {
  const tailoredSummary = generateTailoredSummary(resume, analysis);
  const tailoredExperience = reorderAndTailorExperience(resume.experience, analysis);
  const tailoredSkills = reorderSkills(resume.skills, analysis);
  const highlights = generateHighlights(analysis);

  return {
    contact: { ...resume.contact },
    summary: tailoredSummary,
    experience: tailoredExperience,
    education: [...resume.education],
    skills: tailoredSkills,
    highlights,
  };
}

function generateTailoredSummary(resume: Resume, analysis: JobAnalysis): string {
  if (!resume.summary) {
    const topSkills = analysis.matchedSkills.slice(0, 5).join(", ");
    return `Results-driven professional with expertise in ${topSkills || "relevant technologies"}. Seeking to leverage proven skills as a ${analysis.title} at ${analysis.company}.`;
  }

  let summary = resume.summary;
  const topMatched = analysis.matchedSkills.slice(0, 3);
  if (topMatched.length > 0) {
    const skillMention = topMatched.join(", ");
    if (!normalizeText(summary).includes(normalizeText(skillMention))) {
      summary = summary.replace(/\.$/, "") + `, with particular strength in ${skillMention}.`;
    }
  }

  return summary;
}

function scoreExperience(exp: Experience, analysis: JobAnalysis): number {
  const text = normalizeText([exp.title, exp.company, ...exp.bullets].join(" "));
  let score = 0;

  for (const skill of analysis.matchedSkills) {
    if (text.includes(skill.toLowerCase())) score += 3;
  }
  for (const keyword of analysis.keywords) {
    if (text.includes(keyword.toLowerCase())) score += 1;
  }

  return score;
}

function reorderAndTailorExperience(
  experiences: Experience[],
  analysis: JobAnalysis
): Experience[] {
  return experiences
    .map(exp => ({
      ...exp,
      bullets: reorderBullets(exp.bullets, analysis),
    }))
    .sort((a, b) => scoreExperience(b, analysis) - scoreExperience(a, analysis));
}

function reorderBullets(bullets: string[], analysis: JobAnalysis): string[] {
  return [...bullets].sort((a, b) => {
    const aText = normalizeText(a);
    const bText = normalizeText(b);
    let aScore = 0;
    let bScore = 0;

    for (const skill of analysis.matchedSkills) {
      if (aText.includes(skill.toLowerCase())) aScore += 3;
      if (bText.includes(skill.toLowerCase())) bScore += 3;
    }
    for (const keyword of analysis.keywords) {
      if (aText.includes(keyword.toLowerCase())) aScore += 1;
      if (bText.includes(keyword.toLowerCase())) bScore += 1;
    }

    return bScore - aScore;
  });
}

function reorderSkills(skills: string[], analysis: JobAnalysis): string[] {
  const matched = new Set(analysis.matchedSkills.map(s => s.toLowerCase()));
  const jobKeywords = new Set(analysis.keywords.map(k => k.toLowerCase()));

  return [...skills].sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    const aMatched = matched.has(aLower) ? 2 : jobKeywords.has(aLower) ? 1 : 0;
    const bMatched = matched.has(bLower) ? 2 : jobKeywords.has(bLower) ? 1 : 0;
    return bMatched - aMatched;
  });
}

function generateHighlights(analysis: JobAnalysis): string[] {
  const highlights: string[] = [];

  if (analysis.matchScore >= 80) {
    highlights.push(`Strong match (${analysis.matchScore}%) — Your skills closely align with this role`);
  } else if (analysis.matchScore >= 50) {
    highlights.push(`Good match (${analysis.matchScore}%) — You have many of the required skills`);
  } else {
    highlights.push(`Partial match (${analysis.matchScore}%) — Consider highlighting transferable skills`);
  }

  if (analysis.matchedSkills.length > 0) {
    highlights.push(`Matched skills: ${analysis.matchedSkills.join(", ")}`);
  }

  if (analysis.missingSkills.length > 0) {
    highlights.push(`Skills to develop or highlight differently: ${analysis.missingSkills.join(", ")}`);
  }

  return highlights;
}
