import { Resume, JobAnalysis, TailoredResume, TailoredExperience, Experience, AtsTip } from "./types";

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

// ─── Strong action verbs categorized by impact ───────────────────────────────

const ACTION_VERBS: Record<string, string[]> = {
  leadership: ["Spearheaded", "Directed", "Orchestrated", "Championed", "Drove", "Pioneered"],
  creation: ["Architected", "Engineered", "Designed", "Developed", "Built", "Launched"],
  improvement: ["Accelerated", "Optimized", "Streamlined", "Elevated", "Transformed", "Modernized"],
  delivery: ["Delivered", "Shipped", "Executed", "Implemented", "Deployed", "Released"],
  growth: ["Scaled", "Expanded", "Increased", "Grew", "Amplified", "Maximized"],
  reduction: ["Reduced", "Eliminated", "Cut", "Decreased", "Minimized", "Consolidated"],
  analysis: ["Identified", "Diagnosed", "Analyzed", "Evaluated", "Assessed", "Uncovered"],
  collaboration: ["Partnered", "Aligned", "Coordinated", "United", "Integrated", "Mobilized"],
};

const WEAK_STARTS = [
  /^(responsible for|helped|assisted|worked on|was involved|participated|contributed to|supported|aided)\b/i,
  /^(tasked with|in charge of|duties included|handled)\b/i,
];

const FILLER_WORDS = [
  /\b(very|really|just|basically|simply|actually|literally|extremely|incredibly|highly|greatly)\b/gi,
  /\b(various|numerous|several|multiple|many different)\b/gi,
  /\b(in order to)\b/gi,
  /\b(etc\.?|and so on|and more)\b/gi,
];

const CLICHES = [
  /\b(hardworking|team player|self-starter|go-getter|detail-oriented|fast learner|passionate about)\b/gi,
  /\b(think outside the box|hit the ground running|wear many hats|synergy|leverage)\b/gi,
  /\b(results-oriented|driven individual|proven track record of success)\b/gi,
];

// ─── Text utilities ──────────────────────────────────────────────────────────

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
    if (matches) matches.forEach(m => keywords.add(m.toLowerCase()));
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
    if (w.length > 2 && !stopWords.has(w)) keywords.add(w);
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
      if (normalizeText(section).includes(skill.toLowerCase())) skills.push(skill);
    }
    return skills;
  };

  if (requiredSection) required.push(...extractFromSection(requiredSection[1]));
  if (preferredSection) preferred.push(...extractFromSection(preferredSection[1]));

  if (required.length === 0 && preferred.length === 0) {
    required.push(...extractFromSection(normalized));
  }

  return { required, preferred };
}

function detectExperienceLevel(text: string): string {
  const normalized = normalizeText(text);
  for (const [level, indicators] of Object.entries(EXPERIENCE_LEVELS)) {
    for (const indicator of indicators) {
      if (normalized.includes(indicator)) return level;
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
        if (match[2]) { title = match[1].trim(); company = match[2].trim(); }
        else { title = match[1].trim(); }
        break;
      }
    }
    if (title) break;
  }

  if (!title && lines.length > 0) title = lines[0].trim().substring(0, 100);

  if (!company) {
    for (const line of lines.slice(0, 10)) {
      const match = line.match(/(?:company|employer|organization)[:\s]*(.+)/i)
        || line.match(/(?:about|at)\s+([A-Z][A-Za-z\s&.]+)/);
      if (match) { company = match[1].trim(); break; }
    }
  }

  return { title: title || "Position", company: company || "Company" };
}

// ─── Job analysis (unchanged API) ────────────────────────────────────────────

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
    if (resumeSkillsNormalized.includes(skillLower) || resumeText.includes(skillLower)) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const totalSkills = allJobSkills.length || 1;
  const matchScore = Math.round((matched.length / totalSkills) * 100);

  return {
    title, company, requiredSkills: required, preferredSkills: preferred,
    keywords, experienceLevel, matchedSkills: matched, missingSkills: missing,
    matchScore: Math.min(matchScore, 100),
  };
}

// ─── Expert resume tailoring engine ──────────────────────────────────────────

export function tailorResume(
  resume: Resume,
  _jobDescription: string,
  analysis: JobAnalysis
): TailoredResume {
  const tailoredSummary = craftExpertSummary(resume, analysis);
  const tailoredExperience = rewriteExperience(resume.experience, analysis);
  const tailoredSkills = prioritizeSkills(resume.skills, analysis);
  const atsScore = calculateAtsScore(tailoredSummary, tailoredExperience, tailoredSkills, analysis);
  const atsTips = generateAtsTips(resume, tailoredExperience, analysis, atsScore);
  const highlights = generateHighlights(analysis, atsScore, tailoredExperience);

  return {
    contact: { ...resume.contact },
    summary: tailoredSummary,
    originalSummary: resume.summary,
    experience: tailoredExperience,
    education: [...resume.education],
    skills: tailoredSkills,
    highlights,
    atsScore,
    atsTips,
    aiPowered: false,
    keywordMatches: analysis.matchedSkills.map(s => capitalizeSkill(s)),
    improvementsMade: [],
  };
}

// ─── Summary: Write like a top-tier strategist ───────────────────────────────

function craftExpertSummary(resume: Resume, analysis: JobAnalysis): string {
  const matchedSkills = analysis.matchedSkills;
  const topSkills = matchedSkills.slice(0, 4);
  const level = analysis.experienceLevel;

  const yearsMatch = resume.summary.match(/(\d+)\+?\s*years?/i);
  const years = yearsMatch ? yearsMatch[1] : null;

  const levelWord = level === "senior" || level === "executive"
    ? "Senior" : level === "entry-level" ? "" : "";

  const roleFocus = analysis.title.toLowerCase().includes("frontend")
    ? "frontend architecture and user-facing product development"
    : analysis.title.toLowerCase().includes("backend")
    ? "backend systems and scalable API design"
    : analysis.title.toLowerCase().includes("full")
    ? "end-to-end product development"
    : analysis.title.toLowerCase().includes("data")
    ? "data engineering and analytical systems"
    : analysis.title.toLowerCase().includes("devops") || analysis.title.toLowerCase().includes("sre")
    ? "infrastructure automation and reliability engineering"
    : analysis.title.toLowerCase().includes("product")
    ? "product strategy and cross-functional delivery"
    : "high-impact software delivery";

  const techCluster = topSkills.length > 0
    ? topSkills.map(s => capitalizeSkill(s)).join(", ")
    : "modern technologies";

  const quantifier = years ? `${years}+ years` : "extensive experience";

  const impactPhrase = pickImpactPhrase(resume);

  const parts: string[] = [];

  if (levelWord) {
    parts.push(`${levelWord} engineer with ${quantifier} in ${roleFocus}.`);
  } else {
    parts.push(`Software engineer with ${quantifier} specializing in ${roleFocus}.`);
  }

  parts.push(`Core expertise in ${techCluster}.`);

  if (impactPhrase) {
    parts.push(impactPhrase);
  }

  if (analysis.company && analysis.company !== "Company") {
    parts.push(`Seeking to drive measurable outcomes at ${analysis.company}.`);
  }

  return parts.join(" ");
}

function pickImpactPhrase(resume: Resume): string {
  const allBullets = resume.experience.flatMap(e => e.bullets);
  const metrics: string[] = [];

  for (const b of allBullets) {
    const percentMatch = b.match(/(\d+)%/);
    const userMatch = b.match(/(\d+[KkMm]?\+?)\s*(?:daily\s*)?users/i);
    const reqMatch = b.match(/(\d+[KkMm]?\+?)\s*requests/i);
    if (percentMatch) metrics.push(`${percentMatch[1]}% performance gains`);
    if (userMatch) metrics.push(`products serving ${userMatch[1]}+ users`);
    if (reqMatch) metrics.push(`systems handling ${reqMatch[1]}+ requests`);
  }

  if (metrics.length >= 2) {
    return `Track record includes ${metrics[0]} and ${metrics[1]}.`;
  } else if (metrics.length === 1) {
    return `Proven track record delivering ${metrics[0]}.`;
  }
  return "";
}

function capitalizeSkill(skill: string): string {
  const specialCases: Record<string, string> = {
    "javascript": "JavaScript", "typescript": "TypeScript", "node.js": "Node.js",
    "nodejs": "Node.js", "next.js": "Next.js", "nextjs": "Next.js",
    "react": "React", "graphql": "GraphQL", "postgresql": "PostgreSQL",
    "mongodb": "MongoDB", "aws": "AWS", "gcp": "GCP", "css": "CSS",
    "html": "HTML", "ci/cd": "CI/CD", "rest": "REST", "sql": "SQL",
    "docker": "Docker", "kubernetes": "Kubernetes", "redis": "Redis",
    "git": "Git", "jest": "Jest", "cypress": "Cypress",
    "python": "Python", "java": "Java", "ruby": "Ruby", "go": "Go",
    "angular": "Angular", "vue": "Vue", "svelte": "Svelte",
    "agile": "Agile", "scrum": "Scrum",
  };
  return specialCases[skill.toLowerCase()] || skill.charAt(0).toUpperCase() + skill.slice(1);
}

// ─── Bullet rewriting engine ─────────────────────────────────────────────────

function rewriteBullet(bullet: string, analysis: JobAnalysis): string {
  let result = bullet.trim();
  if (!result) return result;

  result = removeFiller(result);
  result = removeCliches(result);
  result = strengthenOpening(result, analysis);
  result = injectKeywords(result, analysis);
  result = ensureEndsCleanly(result);

  return result;
}

function removeFiller(text: string): string {
  let result = text;
  for (const pattern of FILLER_WORDS) {
    result = result.replace(pattern, "");
  }
  return result.replace(/\s{2,}/g, " ").trim();
}

function removeCliches(text: string): string {
  let result = text;
  for (const pattern of CLICHES) {
    result = result.replace(pattern, "");
  }
  return result.replace(/\s{2,}/g, " ").trim();
}

function strengthenOpening(text: string, analysis: JobAnalysis): string {
  for (const pattern of WEAK_STARTS) {
    if (pattern.test(text)) {
      const cleaned = text.replace(pattern, "").trim();
      const verb = pickStrongVerb(cleaned, analysis);
      const firstChar = cleaned.charAt(0).toLowerCase();
      return `${verb} ${firstChar}${cleaned.slice(1)}`;
    }
  }

  const firstWord = text.split(" ")[0];
  if (firstWord && !firstWord.match(/^[A-Z][a-z]+ed$|^[A-Z][a-z]+d$/)) {
    const pastTense = text.match(/^([A-Z][a-z]+)\s/);
    if (pastTense) {
      const word = pastTense[1].toLowerCase();
      const weakVerbs = ["used", "made", "did", "got", "had", "went", "put", "took", "came", "gave"];
      if (weakVerbs.includes(word)) {
        const rest = text.slice(pastTense[0].length);
        const verb = pickStrongVerb(rest, analysis);
        return `${verb} ${rest}`;
      }
    }
  }

  return text;
}

function pickStrongVerb(context: string, analysis: JobAnalysis): string {
  const lower = context.toLowerCase();

  if (lower.includes("team") || lower.includes("mentor") || lower.includes("lead"))
    return pickRandom(ACTION_VERBS.leadership);
  if (lower.includes("built") || lower.includes("creat") || lower.includes("design") || lower.includes("architect"))
    return pickRandom(ACTION_VERBS.creation);
  if (lower.includes("improv") || lower.includes("optim") || lower.includes("refactor") || lower.includes("upgrad"))
    return pickRandom(ACTION_VERBS.improvement);
  if (lower.includes("reduc") || lower.includes("cut") || lower.includes("eliminat") || lower.includes("decreas"))
    return pickRandom(ACTION_VERBS.reduction);
  if (lower.includes("scal") || lower.includes("grow") || lower.includes("increas") || lower.includes("expand"))
    return pickRandom(ACTION_VERBS.growth);
  if (lower.includes("analyz") || lower.includes("identif") || lower.includes("debug") || lower.includes("diagnos"))
    return pickRandom(ACTION_VERBS.analysis);
  if (lower.includes("collaborat") || lower.includes("partner") || lower.includes("cross-functional"))
    return pickRandom(ACTION_VERBS.collaboration);

  if (analysis.experienceLevel === "senior" || analysis.experienceLevel === "executive")
    return pickRandom(ACTION_VERBS.leadership);

  return pickRandom(ACTION_VERBS.delivery);
}

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function injectKeywords(text: string, analysis: JobAnalysis): string {
  const lower = text.toLowerCase();

  const highValueKeywords = analysis.matchedSkills
    .filter(s => !lower.includes(s.toLowerCase()));

  if (highValueKeywords.length === 0) return text;

  const keyword = highValueKeywords[0];
  const capitalized = capitalizeSkill(keyword);

  if (text.includes("technologies") || text.includes("tools") || text.includes("stack")) {
    return text.replace(/(technologies|tools|stack)/i, `$1 including ${capitalized}`);
  }

  return text;
}

function ensureEndsCleanly(text: string): string {
  let result = text.trim();
  result = result.replace(/[,;]\s*$/, "");
  if (!result.match(/[.!?%)\d]$/)) {
    // leave as-is, no period needed for bullet points
  }
  return result;
}

// ─── Experience: rewrite, reorder, prioritize ────────────────────────────────

function rewriteExperience(
  experiences: Experience[],
  analysis: JobAnalysis
): TailoredExperience[] {
  return experiences
    .map(exp => {
      const rewrittenBullets = exp.bullets.map(b => rewriteBullet(b, analysis));
      const scoredBullets = rewrittenBullets.map((bullet, i) => ({
        bullet,
        original: exp.bullets[i],
        score: scoreBullet(bullet, analysis),
      }));
      scoredBullets.sort((a, b) => b.score - a.score);

      return {
        ...exp,
        bullets: scoredBullets.map(b => b.bullet),
        originalBullets: scoredBullets.map(b => b.original),
      };
    })
    .sort((a, b) => scoreExperience(b, analysis) - scoreExperience(a, analysis));
}

function scoreBullet(text: string, analysis: JobAnalysis): number {
  const lower = normalizeText(text);
  let score = 0;

  for (const skill of analysis.matchedSkills) {
    if (lower.includes(skill.toLowerCase())) score += 5;
  }
  for (const skill of analysis.requiredSkills) {
    if (lower.includes(skill.toLowerCase())) score += 3;
  }
  for (const keyword of analysis.keywords) {
    if (lower.includes(keyword.toLowerCase())) score += 1;
  }

  if (text.match(/\d+%/)) score += 4;
  if (text.match(/\d+[xX]/)) score += 4;
  if (text.match(/\$[\d,]+|\d+[KkMm]\+?/)) score += 3;
  if (text.match(/\d+\+?\s*(users|customers|clients|requests|teams)/i)) score += 3;

  const firstWord = text.split(" ")[0];
  const strongVerbs = Object.values(ACTION_VERBS).flat().map(v => v.toLowerCase());
  if (strongVerbs.includes(firstWord.toLowerCase())) score += 2;

  return score;
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

// ─── Skills: prioritize by job relevance ─────────────────────────────────────

function prioritizeSkills(skills: string[], analysis: JobAnalysis): string[] {
  const matchedSet = new Set(analysis.matchedSkills.map(s => s.toLowerCase()));
  const requiredSet = new Set(analysis.requiredSkills.map(s => s.toLowerCase()));
  const keywordSet = new Set(analysis.keywords.map(k => k.toLowerCase()));

  return [...skills].sort((a, b) => {
    const aL = a.toLowerCase();
    const bL = b.toLowerCase();
    const aScore = (matchedSet.has(aL) ? 4 : 0) + (requiredSet.has(aL) ? 3 : 0) + (keywordSet.has(aL) ? 1 : 0);
    const bScore = (matchedSet.has(bL) ? 4 : 0) + (requiredSet.has(bL) ? 3 : 0) + (keywordSet.has(bL) ? 1 : 0);
    return bScore - aScore;
  });
}

// ─── ATS score calculation ───────────────────────────────────────────────────

function calculateAtsScore(
  summary: string,
  experience: TailoredExperience[],
  skills: string[],
  analysis: JobAnalysis
): number {
  let score = 0;
  const fullText = normalizeText([
    summary,
    ...experience.flatMap(e => [e.title, ...e.bullets]),
    ...skills,
  ].join(" "));

  const requiredHits = analysis.requiredSkills.filter(s => fullText.includes(s.toLowerCase()));
  const requiredCoverage = analysis.requiredSkills.length
    ? (requiredHits.length / analysis.requiredSkills.length) * 40
    : 20;
  score += requiredCoverage;

  const preferredHits = analysis.preferredSkills.filter(s => fullText.includes(s.toLowerCase()));
  const preferredCoverage = analysis.preferredSkills.length
    ? (preferredHits.length / analysis.preferredSkills.length) * 15
    : 10;
  score += preferredCoverage;

  const allBullets = experience.flatMap(e => e.bullets);
  const quantifiedBullets = allBullets.filter(b => b.match(/\d+/));
  const quantifiedRatio = allBullets.length
    ? (quantifiedBullets.length / allBullets.length) * 15
    : 0;
  score += quantifiedRatio;

  const strongVerbs = Object.values(ACTION_VERBS).flat().map(v => v.toLowerCase());
  const strongStartCount = allBullets.filter(b => {
    const first = b.split(" ")[0]?.toLowerCase();
    return strongVerbs.includes(first);
  }).length;
  const verbRatio = allBullets.length
    ? (strongStartCount / allBullets.length) * 10
    : 0;
  score += verbRatio;

  if (summary.length >= 50 && summary.length <= 400) score += 5;

  const skillKeywordHits = skills.filter(s =>
    analysis.matchedSkills.map(m => m.toLowerCase()).includes(s.toLowerCase())
  ).length;
  const skillBonus = analysis.matchedSkills.length
    ? (skillKeywordHits / analysis.matchedSkills.length) * 15
    : 10;
  score += skillBonus;

  return Math.min(Math.round(score), 100);
}

// ─── ATS tips: actionable advice ─────────────────────────────────────────────

function generateAtsTips(
  resume: Resume,
  experience: TailoredExperience[],
  analysis: JobAnalysis,
  atsScore: number
): AtsTip[] {
  const tips: AtsTip[] = [];

  const missingRequired = analysis.requiredSkills.filter(s => {
    const lower = s.toLowerCase();
    const inSkills = resume.skills.some(rs => rs.toLowerCase() === lower);
    const inBullets = resume.experience.some(e =>
      e.bullets.some(b => normalizeText(b).includes(lower))
    );
    return !inSkills && !inBullets;
  });

  if (missingRequired.length > 0) {
    tips.push({
      category: "keyword",
      message: `Add missing required skills to your Skills section: ${missingRequired.map(s => capitalizeSkill(s)).join(", ")}`,
      priority: "high",
    });
  }

  const allBullets = experience.flatMap(e => e.bullets);
  const unquantified = allBullets.filter(b => !b.match(/\d/));
  if (unquantified.length > allBullets.length * 0.5) {
    tips.push({
      category: "impact",
      message: `${unquantified.length} of ${allBullets.length} bullets lack metrics. Add numbers: revenue, users, %, time saved, team size`,
      priority: "high",
    });
  }

  if (analysis.missingSkills.length > 0 && analysis.missingSkills.length <= 3) {
    tips.push({
      category: "strategy",
      message: `Consider adding transferable experience for: ${analysis.missingSkills.map(s => capitalizeSkill(s)).join(", ")}`,
      priority: "medium",
    });
  }

  if (atsScore < 60) {
    tips.push({
      category: "keyword",
      message: "Mirror more exact phrases from the job description in your bullet points",
      priority: "high",
    });
  }

  const longBullets = allBullets.filter(b => b.length > 150);
  if (longBullets.length > 0) {
    tips.push({
      category: "format",
      message: `${longBullets.length} bullets exceed 150 characters. Shorter bullets scan better in ATS and by recruiters`,
      priority: "low",
    });
  }

  if (resume.summary.length > 300) {
    tips.push({
      category: "format",
      message: "Trim your summary to 2-3 sentences. Recruiters spend ~6 seconds on first scan",
      priority: "medium",
    });
  }

  if (!resume.contact.linkedin) {
    tips.push({
      category: "format",
      message: "Add a LinkedIn URL. Most ATS systems and recruiters look for it",
      priority: "low",
    });
  }

  return tips.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

// ─── Highlights: human-readable summary of changes ───────────────────────────

function generateHighlights(
  analysis: JobAnalysis,
  atsScore: number,
  experience: TailoredExperience[]
): string[] {
  const highlights: string[] = [];

  highlights.push(
    atsScore >= 80
      ? `ATS Score: ${atsScore}/100 — Strong optimization for ${analysis.title}`
      : atsScore >= 60
      ? `ATS Score: ${atsScore}/100 — Good baseline, see tips to improve`
      : `ATS Score: ${atsScore}/100 — Needs work, follow the tips below`
  );

  const rewrittenCount = experience.reduce((count, exp) => {
    return count + exp.bullets.filter((b, i) => b !== exp.originalBullets[i]).length;
  }, 0);
  if (rewrittenCount > 0) {
    highlights.push(`Strengthened ${rewrittenCount} bullet points with action verbs and impact-driven language`);
  }

  if (analysis.matchedSkills.length > 0) {
    highlights.push(`Skills prioritized to lead with job-relevant keywords: ${analysis.matchedSkills.slice(0, 5).map(s => capitalizeSkill(s)).join(", ")}`);
  }

  highlights.push("Summary rewritten to target this specific role and company");

  if (analysis.missingSkills.length > 0) {
    highlights.push(`Gap analysis: ${analysis.missingSkills.map(s => capitalizeSkill(s)).join(", ")} — consider adding if you have this experience`);
  }

  return highlights;
}
