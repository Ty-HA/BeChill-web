import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const filterType = req.nextUrl.searchParams.get("filterType") || "slug";
  const filterValue = req.nextUrl.searchParams.get("filterValue") || "solana";
  const tag = req.nextUrl.searchParams.get("tag");
  const sort = req.nextUrl.searchParams.get("sort") || "-datetime";

  const baseUrl = "http://37.187.141.70:8070/items/historical";

  const params = new URLSearchParams();
  params.append(`filter[${filterType}][_eq]`, filterValue);

  if (tag) {
    params.append("filter[tags][_contains]", tag);
  }

  if (sort) {
    params.append("sort", sort);
  }

  const url = `${baseUrl}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erreur brute Directus:", errorText);
      return NextResponse.json(
        { error: "Erreur Directus", detail: errorText },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erreur côté Directus" },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur réseau ou CORS" },
      { status: 500 }
    );
  }
}
