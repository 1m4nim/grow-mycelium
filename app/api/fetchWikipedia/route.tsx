import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "キノコ"; // もし title がないなら "キノコ" に

  const language = searchParams.get("lang") || "ja"; // 言語もオプションで指定できるように

  const wikipediaUrl = `https://${language}.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&exintro=true&explaintext=true&titles=${encodeURIComponent(
    title
  )}&piprop=thumbnail&pithumbsize=400&origin=*`;

  try {
    const wikipediaResponse = await fetch(wikipediaUrl);
    const data = await wikipediaResponse.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Wikipedia APIエラー:", error);
    return new Response(JSON.stringify({ error: "Wikipedia APIエラー" }), {
      status: 500,
    });
  }
}
