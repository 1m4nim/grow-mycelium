// Wikipedia API からキノコ情報を取得する

export type WikiMushroomInfo = {
  title: string;
  description: string;
  imageUrl: string;
};

// Wikipediaの言語を指定する
type Language = "ja" | "en";

// 環境条件から検索用キーワードを決める（例：熱帯性、高温 など）
export const generateKeywordFromEnv = (params: {
  temperature: number;
  humidity: number;
  nutrition: number;
  pH: number;
}): string => {
  const { temperature, humidity, nutrition } = params;

  if (temperature > 28 && humidity > 80) return "熱帯 キノコ";
  if (temperature < 10) return "寒冷地 キノコ";
  if (nutrition > 70) return "高級 キノコ";
  return "キノコ";
};

// Wikipediaでキノコを検索し、タイトルを取得する（日本語または英語対応）
export const searchWikiMushroom = async (
  query: string,
  language: Language = "ja"
): Promise<string | null> => {
  const url = `https://${language}.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=${encodeURIComponent(
    query
  )}&origin=*`;
  const response = await fetch(url);
  const data = await response.json();
  const results = data.query.search;
  if (!results.length) return null;
  const random = results[Math.floor(Math.random() * results.length)];
  return random.title;
};

// Wikipediaページから画像と説明を取得する（日本語または英語対応）
export const fetchWikiInfo = async (
  title: string,
  language: Language = "ja"
): Promise<WikiMushroomInfo> => {
  const url = `https://${language}.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&exintro=true&explaintext=true&titles=${encodeURIComponent(
    title
  )}&piprop=thumbnail&pithumbsize=400&origin=*`;

  const res = await fetch(url);
  const json = await res.json();
  const pages = json.query.pages;
  const page = Object.values(pages)[0] as any;

  return {
    title: page.title,
    description: page.extract || "説明が見つかりません",
    imageUrl: page.thumbnail?.source || "/fallback.png",
  };
};

// すべてを統合して、環境パラメータからWikipedia情報を取得する（日本語または英語対応）
export const getMushroomFromWikipedia = async (
  params: {
    temperature: number;
    humidity: number;
    nutrition: number;
    pH: number;
  },
  language: Language = "ja"
): Promise<WikiMushroomInfo | null> => {
  const keyword = generateKeywordFromEnv(params);
  const title = await searchWikiMushroom(keyword, language);
  if (!title) return null;
  const info = await fetchWikiInfo(title, language);
  return info;
};
