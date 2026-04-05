export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa: string;
}

export interface Resume {
  contact: ContactInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

export interface JobAnalysis {
  title: string;
  company: string;
  requiredSkills: string[];
  preferredSkills: string[];
  keywords: string[];
  experienceLevel: string;
  matchedSkills: string[];
  missingSkills: string[];
  matchScore: number;
}

export interface TailoredResume {
  contact: ContactInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  highlights: string[];
}

export type JobProvider = "adzuna" | "usajobs" | "jsearch";

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  snippet: string;
  salary: string;
  datePosted: string;
  url: string;
  provider: JobProvider;
}

export interface JobSearchResult {
  jobs: JobListing[];
  totalResults: string;
  query: string;
  location: string;
  provider: JobProvider;
}

export interface JobDetail {
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  url: string;
  provider: JobProvider;
}

export interface ProviderConfig {
  id: JobProvider;
  name: string;
  description: string;
  configured: boolean;
  envVars: string[];
}

export type AppStep = "resume" | "job" | "preview";
