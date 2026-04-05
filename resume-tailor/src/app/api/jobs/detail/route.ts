import { NextRequest, NextResponse } from "next/server";
import { JobProvider } from "@/lib/types";
import { getProvider } from "@/lib/providers";

const VALID_PROVIDERS: JobProvider[] = ["adzuna", "usajobs", "jsearch"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("id") || "";
  const providerParam = searchParams.get("provider") || "adzuna";

  if (!jobId) {
    return NextResponse.json(
      { error: "Job ID (id) is required" },
      { status: 400 }
    );
  }

  if (!VALID_PROVIDERS.includes(providerParam as JobProvider)) {
    return NextResponse.json(
      { error: `Invalid provider. Valid: ${VALID_PROVIDERS.join(", ")}` },
      { status: 400 }
    );
  }

  const providerId = providerParam as JobProvider;

  try {
    const provider = getProvider(providerId);

    if (!provider.isConfigured()) {
      return NextResponse.json(
        {
          error: `${provider.name} is not configured. Set environment variables: ${provider.envVars.join(", ")}`,
          envVars: provider.envVars,
        },
        { status: 422 }
      );
    }

    const detail = await provider.getJobDetail(jobId);

    if (!detail) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(detail);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch job details";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
