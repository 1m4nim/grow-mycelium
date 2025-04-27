import {
  generateKeywordFromEnv,
  searchWikiMushroom,
  fetchWikiInfo,
} from "../utils/WikiFetcher";

const fetchRandomFungusData = async (attempts = 5): Promise<any> => {
  try {
    if (attempts <= 0) return null;

    const language = Math.random() < 0.5 ? "ja" : "en";

    // まずはランダムな「キノコ」タイトルを取得
    const randomTitle = await searchWikiMushroom("キノコ", language);
    if (!randomTitle) {
      return fetchRandomFungusData(attempts - 1); // 取れなかったらリトライ
    }

    // タイトルに "mushroom" か "キノコ" が含まれているかチェック
    if (
      randomTitle.toLowerCase().includes("mushroom") ||
      randomTitle.includes("キノコ")
    ) {
      // 詳細情報を取得
      const fungusInfo = await fetchWikiInfo(randomTitle, language);
      return {
        title: fungusInfo.title,
        content: fungusInfo.description,
        imageUrl: fungusInfo.imageUrl,
      };
    } else {
      return fetchRandomFungusData(attempts - 1); // 違ったらリトライ
    }
  } catch (error) {
    console.error("Wikipedia APIエラー:", error);
    return null;
  }
};
