import { NextRequest, NextResponse } from "next/server";
import { JobProvider } from "@/lib/types";
import { getProvider } from "@/lib/providers";

const VALID_PROVIDERS: JobProvider[] = ["adzuna", "usajobs", "jsearch"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const location = searchParams.get("l") || "";
  const providerParam = searchParams.get("provider") || "adzuna";
  const page = parseInt(searchParams.get("page") || "1", 10);

  if (!query.trim()) {
    return NextResponse.json(
      { error: "Search query (q) is required" },
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

    const result = await provider.search({ query, location, page });

    return NextResponse.json({
      jobs: result.jobs,
      totalResults: result.totalResults,
      query,
      location,
      provider: providerId,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
