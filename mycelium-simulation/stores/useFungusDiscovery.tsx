import { useState } from "react";
import { Fungus } from "./MyceliumStore";

const useFungusDiscovery = () => {
  const [discoveredFungus, setDiscoveredFungus] = useState<Fungus | null>(null);

  const fetchFungusFromWikipedia = async () => {
    const searchTerm = "mushroom";

    try {
      const searchRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchTerm}&format=json&origin=*`
      );

      if (!searchRes.ok) {
        throw new Error("Wikipediaの検索APIからのレスポンスが無効です");
      }

      const searchData = await searchRes.json();
      const page = searchData.query?.search?.[0];

      if (!page) {
        console.log("ページが見つかりませんでした");
        return;
      }

      const title = page.title;

      const detailRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro&titles=${title}&format=json&pithumbsize=500&origin=*`
      );

      if (!detailRes.ok) {
        throw new Error("Wikipediaの詳細情報APIからのレスポンスが無効です");
      }

      const detailData = await detailRes.json();
      const pageDetail =
        detailData.query.pages[Object.keys(detailData.query.pages)[0]];

      if (!pageDetail) {
        console.log("ページ詳細が見つかりませんでした");
        return;
      }

      const englishDescription =
        pageDetail.extract || "No English description found.";
      const imageUrl = pageDetail.thumbnail?.source || "";

      const deeplRes = await fetch("https://api-free.deepl.com/v2/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `DeepL-Auth-Key ${import.meta.env.VITE_DEEPL_API_KEY}`,
        },
        body: new URLSearchParams({
          text: englishDescription,
          target_lang: "JA",
        }),
      });

      console.log(import.meta.env.VITE_DEEPL_API_KEY);

      if (!deeplRes.ok) {
        throw new Error("DeepL APIからのレスポンスが無効です");
      }

      const deeplData = await deeplRes.json();
      const japaneseDescription =
        deeplData.translations?.[0]?.text || "翻訳なし";

      const fungus: Fungus = {
        name: title,
        description: englishDescription,
        descriptionJa: japaneseDescription,
        imageUrl: imageUrl,
      };

      setDiscoveredFungus(fungus);
    } catch (error) {
      console.error("キノコ情報の取得または翻訳に失敗:", error);
    }
  };

  return {
    discoveredFungus,
    fetchFungusFromWikipedia,
  };
};

export default useFungusDiscovery;
