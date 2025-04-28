"use client";

import { useEffect, useState } from "react";
import MyceliumGrowth from "../mycelium-simulation/stores/MyceliumGrowth";
import GrowthHistory from "../mycelium-simulation/stores/GrowthHistoryButton";
import {
  generateKeywordFromEnv,
  searchWikiMushroom,
  fetchWikiInfo,
} from "../mycelium-simulation/utils/WikiFetcher";

interface WikiMushroomInfo {
  title: string;
  description: string;
  imageUrl: string;
}

// Google Translate APIの関数（翻訳用）
const translateToJapanese = async (text: string) => {
  try {
    const response = await fetch(
      "https://translation.googleapis.com/language/translate/v2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_GOOGLE_API_KEY}`,
        },
        body: JSON.stringify({
          q: text,
          target: "ja",
        }),
      }
    );
    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error("翻訳エラー:", error);
    return text; // 翻訳失敗時は元のテキストを返す
  }
};

const fetchRandomFungusDataFromCategory = async (
  category: string,
  attempts = 5
): Promise<any> => {
  try {
    if (attempts <= 0) return null;

    const language = Math.random() < 0.5 ? "ja" : "en";

    // Wikipedia APIを使用してカテゴリに基づくページを取得
    const categoryPages = await searchWikiCategory(category, language);
    if (!categoryPages || categoryPages.length === 0) {
      return fetchRandomFungusDataFromCategory(category, attempts - 1); // 取れなかったらリトライ
    }

    // カテゴリ内のランダムなページを選ぶ
    const randomTitle =
      categoryPages[Math.floor(Math.random() * categoryPages.length)];

    // 詳細情報を取得
    const fungusInfo = await fetchWikiInfo(randomTitle, language);

    // 日本語の説明がなければ英語の説明を和訳
    let description = fungusInfo.description;
    if (!description) {
      // 説明が見つからない場合、代わりに "説明なし" を使う
      description = await translateToJapanese("No description available");
    }

    return {
      title: fungusInfo.title,
      content: description,
      imageUrl: fungusInfo.imageUrl,
    };
  } catch (error) {
    console.error("Wikipedia APIエラー:", error);
    return null;
  }
};

// カテゴリ名からそのカテゴリに関連するページを検索する関数
const searchWikiCategory = async (category: string, language: string) => {
  try {
    const response = await fetch(
      `https://${language}.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtitle=Category:${category}&cmlimit=5`
    );
    const data = await response.json();
    return data.query.categorymembers.map((member: any) => member.title);
  } catch (error) {
    console.error("カテゴリ情報取得エラー:", error);
    return [];
  }
};

const Page = () => {
  const [fungus, setFungus] = useState<any>(null);
  const [isFruiting, setIsFruiting] = useState(false); // 子実体形成したかどうか

  // 子実体が形成されたら呼び出される関数
  const onFruitingBodyFormed = async () => {
    const data = await fetchRandomFungusDataFromCategory("Fungi"); // Fungiカテゴリを指定
    setFungus(data);
  };

  // 子実体形成を検知したらきのこ情報をロードする
  useEffect(() => {
    if (isFruiting) {
      onFruitingBodyFormed();
    }
  }, [isFruiting]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>きのこ識別</h1>
      {fungus ? (
        <div style={{ marginTop: "1rem" }}>
          <h2>{fungus.title}</h2>
          {fungus.imageUrl && <img src={fungus.imageUrl} alt={fungus.title} />}
          <p>{fungus.content}</p>
        </div>
      ) : (
        <p></p>
      )}
      <MyceliumGrowth />
      <GrowthHistory />
    </div>
  );
};

export default Page;
