import type { NextApiRequest, NextApiResponse } from "next";

// 仮翻訳関数（本番ではDeepLやGoogle翻訳APIと連携可能）
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

// 言語別に菌情報を取得する
async function getFungusInfoWithLang(lang: "ja" | "en") {
  const title = await getRandomFungusTitle(lang);
  if (!title) return null;

  const res = await fetch(
    `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      title
    )}`
  );
  const data = await res.json();

  const image = data?.thumbnail?.source || null;
  if (!image) return null; // 画像がないページはスキップ

  const translatedDescription =
    lang === "en" ? await translateToJapanese(data.extract) : null;

  return {
    name: data.title,
    lang,
    imageUrl: image,
    description: data.extract,
    jaTranslation: translatedDescription,
  };
}

// POSTメソッドとGETメソッドの処理を分ける
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      // POSTリクエストが来たときの処理（必要な場合のみ追加）
      return res
        .status(405)
        .json({ message: "POSTメソッドはサポートされていません。" });
    } else if (req.method === "GET") {
      // GETリクエストが来たときの処理
      const langs: ("ja" | "en")[] = ["ja", "en"];
      const randomLang = langs[Math.floor(Math.random() * langs.length)];

      let fungus = await getFungusInfoWithLang(randomLang);
      if (!fungus && randomLang === "ja") {
        fungus = await getFungusInfoWithLang("en");
      } else if (!fungus && randomLang === "en") {
        fungus = await getFungusInfoWithLang("ja");
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
