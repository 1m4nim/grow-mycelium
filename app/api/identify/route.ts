import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

async function translateToJapanese(text: string): Promise<string> {
  return "（和訳）" + text;
}

// ランダムにWikipediaカテゴリ内のタイトルを取得する
async function getRandomFungusTitle(lang: "ja" | "en"): Promise<string | null> {
  const categoryName =
    lang === "ja" ? "Category:%E8%8F%8C%E9%A1%9E" : "Category:Fungi";

  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${categoryName}&cmlimit=100&format=json&origin=*`;
  const res = await fetch(url);
  const json = await res.json();

  const pages = json?.query?.categorymembers || [];
  if (pages.length === 0) return null;

  const randomPage = pages[Math.floor(Math.random() * pages.length)];
  return randomPage.title;
}

// 画像付きの菌情報を取得するまで再試行する関数
async function getFungusInfoWithLangUntilImage(
  lang: "ja" | "en",
  maxRetries = 5
) {
  for (let i = 0; i < maxRetries; i++) {
    const title = await getRandomFungusTitle(lang);
    if (!title) continue;

    const res = await fetch(
      `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        title
      )}`
    );
    const data = await res.json();
    const image = data?.thumbnail?.source;
    const description = data?.extract;

    if (!image || !description) continue;

    const translatedDescription =
      lang === "en" ? await translateToJapanese(description) : null;

    return {
      name: data.title,
      lang,
      imageUrl: image,
      description,
      jaTranslation: translatedDescription,
    };
  }

  return null; // 最後まで見つからなければ null
}

// メインのハンドラー
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      return res
        .status(405)
        .json({ message: "POSTメソッドはサポートされていません。" });
    } else if (req.method === "GET") {
      const langs: ("ja" | "en")[] = ["ja", "en"];
      const randomLang = langs[Math.floor(Math.random() * langs.length)];

      let fungus = await getFungusInfoWithLangUntilImage(randomLang);
      if (!fungus && randomLang === "ja") {
        fungus = await getFungusInfoWithLangUntilImage("en");
      } else if (!fungus && randomLang === "en") {
        fungus = await getFungusInfoWithLangUntilImage("ja");
      }

      if (!fungus) {
        return res.status(404).json({ message: "見つからないよ！" });
      }

      return res.status(200).json({ fungus });
    } else {
      res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("識別APIエラー:", error);
    res.status(500).json({ message: "サーバーエラー" });
  }
}
