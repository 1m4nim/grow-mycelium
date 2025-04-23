import { NextApiRequest, NextApiResponse } from "next";
import { describe } from "node:test";

const JA_CATEGORIES = ["Category:食用キノコ", "Category:毒キノコ"];
const EN_CATEGORIES = [
  "Category:Edible_mushrooms",
  "Category:Poisonous_mushrooms",
];

const getTitlesFromCategory = async (lang: "en" | "ja", category: string) => {
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(
    category
  )}&cmlimit=50&format=json&origin=*`;

  const res = await fetch(url);
  const data = await res.json();

  return data.query?.categorymembers?.map((entry: any) => entry.title) ?? [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const lang = Math.random() < 0.5 ? "ja" : "en";
    const categoryPool = lang === "ja" ? JA_CATEGORIES : EN_CATEGORIES;
    const category =
      categoryPool[Math.floor(Math.random() * categoryPool.length)];

    const titles = await getTitlesFromCategory(lang, category);
    if (!titles.length)
      throw new Error("カテゴリから記事を取得できませんでした");

    const randomTitle = titles[Math.floor(Math.random() * titles.length)];

    const summaryRes = await fetch(
      `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        randomTitle
      )}`
    );

    if (!summaryRes.ok) throw new Error("Wikipedia summary 取得に失敗");

    const summary = await summaryRes.json();
    const imageUrl = summary.thumbnail?.source || "/fallback.png";
    const description = summary.extract || "説明が見つかりません。";

    let jaTranslation;

    if (lang === "en") {
      const langLinkRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&prop=langlinks&titles=${encodeURIComponent(
          randomTitle
        )}&lllang=ja&format=json&origin=*`
      );

      const langLinksData = await langLinkRes.json();
      const page =
        langLinksData.query.pages[Object.keys(langLinksData.pages)[0]];
      const jaTitle = page.langLinks?.[0]?.["*"];

      if (jaTitle) {
        const jaSummaryRes = await fetch(
          `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
            jaTitle
          )}`
        );

        if (jaSummaryRes.ok) {
          const jaSummaryData = await jaSummaryRes.json();
          jaTranslation = jaSummaryData.extract;
        }
      }
    }

    res.status(200).json({
      fungus: {
        name: randomTitle,
        imageUrl,
        description,
        jaTranslation,
      },
    });
  } catch (err) {
    console.error("API error", err);
    res.status(500).json({ error: "キノコの情報取得に失敗しました。" });
  }
}
