import { JobListing, JobDetail, JobProvider } from "../types";

export interface SearchParams {
  query: string;
  location: string;
  page?: number;
}

export interface SearchResponse {
  jobs: JobListing[];
  totalResults: string;
}

export interface JobProviderInterface {
  id: JobProvider;
  name: string;
  description: string;
  envVars: string[];
  isConfigured(): boolean;
  search(params: SearchParams): Promise<SearchResponse>;
  getJobDetail(jobId: string): Promise<JobDetail | null>;
}
