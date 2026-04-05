import { JobProvider, ProviderConfig } from "../types";
import { JobProviderInterface } from "./types";
import { AdzunaProvider } from "./adzuna";
import { USAJobsProvider } from "./usajobs";
import { JSearchProvider } from "./jsearch";

const providers: Record<JobProvider, JobProviderInterface> = {
  adzuna: new AdzunaProvider(),
  usajobs: new USAJobsProvider(),
  jsearch: new JSearchProvider(),
};

export function getProvider(id: JobProvider): JobProviderInterface {
  const provider = providers[id];
  if (!provider) {
    throw new Error(`Unknown provider: ${id}`);
  }
  return provider;
}

export function getAllProviders(): ProviderConfig[] {
  return Object.values(providers).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    configured: p.isConfigured(),
    envVars: p.envVars,
  }));
}

export function getConfiguredProviders(): ProviderConfig[] {
  return getAllProviders().filter((p) => p.configured);
}

export function getFirstConfiguredProvider(): JobProviderInterface | null {
  for (const p of Object.values(providers)) {
    if (p.isConfigured()) return p;
  }
  return null;
}
