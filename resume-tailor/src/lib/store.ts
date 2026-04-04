import { Resume } from "./types";

const STORAGE_KEY = "resume-tailor-data";

export function getDefaultResume(): Resume {
  return {
    contact: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
  };
}

export function saveResume(resume: Resume): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
  } catch {
    // Storage full or unavailable
  }
}

export function loadResume(): Resume | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {
    // Corrupted data
  }
  return null;
}

export function getSampleResume(): Resume {
  return {
    contact: {
      fullName: "Alex Johnson",
      email: "alex.johnson@email.com",
      phone: "(555) 123-4567",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/alexjohnson",
      website: "alexjohnson.dev",
    },
    summary:
      "Full-stack software engineer with 5+ years of experience building scalable web applications. Passionate about clean code, performance optimization, and delivering exceptional user experiences.",
    experience: [
      {
        id: "exp-1",
        company: "TechCorp Inc.",
        title: "Senior Software Engineer",
        startDate: "2022-01",
        endDate: "Present",
        bullets: [
          "Led development of a React/TypeScript dashboard serving 50K+ daily users, improving page load times by 40%",
          "Designed and implemented RESTful APIs using Node.js and Express, handling 10M+ requests/day",
          "Mentored 4 junior developers and conducted code reviews, improving team velocity by 25%",
          "Implemented CI/CD pipelines with GitHub Actions, reducing deployment time from 2 hours to 15 minutes",
          "Architected microservices migration from monolith, improving system reliability to 99.9% uptime",
        ],
      },
      {
        id: "exp-2",
        company: "StartupXYZ",
        title: "Software Engineer",
        startDate: "2019-06",
        endDate: "2021-12",
        bullets: [
          "Built responsive web applications using React, Redux, and TypeScript for an e-commerce platform",
          "Developed Python data processing pipelines with pandas, reducing report generation time by 60%",
          "Managed PostgreSQL and MongoDB databases, optimizing queries that reduced response times by 50%",
          "Collaborated with product and design teams in an Agile/Scrum environment",
        ],
      },
    ],
    education: [
      {
        id: "edu-1",
        institution: "University of California, Berkeley",
        degree: "Bachelor of Science",
        field: "Computer Science",
        graduationDate: "2019-05",
        gpa: "3.7",
      },
    ],
    skills: [
      "JavaScript",
      "TypeScript",
      "Python",
      "React",
      "Node.js",
      "Express",
      "Next.js",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "Docker",
      "AWS",
      "Git",
      "CI/CD",
      "REST APIs",
      "GraphQL",
      "Agile",
      "Leadership",
    ],
  };
}

export function getSampleJobDescription(): string {
  return `Senior Frontend Engineer at Acme Corp

About Acme Corp:
We're building the next generation of developer tools. Our platform helps thousands of engineering teams ship better software faster.

Role:
We're looking for a Senior Frontend Engineer to lead the development of our web application. You'll work closely with our design and product teams to create beautiful, performant user interfaces.

Required Qualifications:
- 5+ years of experience in frontend development
- Expert-level knowledge of React and TypeScript
- Experience with Next.js or similar SSR frameworks
- Strong understanding of HTML, CSS, and responsive design
- Experience with REST APIs and GraphQL
- Proficiency with Git and modern CI/CD practices
- Strong problem-solving and communication skills

Preferred Qualifications:
- Experience with Node.js backend development
- Familiarity with AWS or other cloud platforms
- Experience with testing frameworks (Jest, Cypress)
- Knowledge of performance optimization techniques
- Experience mentoring junior developers
- Contributions to open-source projects

What We Offer:
- Competitive salary and equity
- Remote-first culture
- Professional development budget
- Health, dental, and vision insurance`;
}
