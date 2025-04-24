"use client";

import React, { useEffect, useState } from "react";
import MyceliumGrowth from "../mycelium-simulation/stores/MyceliumGrowth";
import GrowthHistory from "../mycelium-simulation/stores/GrowthHistoryButton";

// WikipediaのAPIからランダムなきのこの情報を取得する
const fetchRandomFungusData = async (attempts = 5): Promise<any> => {
  try {
    if (attempts <= 0) return null; // 再試行回数がゼロに達した場合、再帰を停止

    // 日本語版か英語版をランダムで選択
    const language = Math.random() < 0.5 ? "ja" : "en";
    const url = `https://${language}.wikipedia.org/w/api.php`;

    // ランダムなページを取得
    const res = await fetch(
      `${url}?action=query&format=json&list=random&rnlimit=1&rnnamespace=0`
    );
    const data = await res.json();

    const pageId = data.query.random[0].id;
    const pageTitle = data.query.random[0].title;

    // Wikipediaのページ詳細を取得
    const pageDetailsRes = await fetch(
      `${url}?action=query&format=json&prop=extracts&exintro&explaintext&pageids=${pageId}`
    );
    const pageDetailsData = await pageDetailsRes.json();

    const pageContent = pageDetailsData.query.pages[pageId].extract;
    const pageImage =
      pageDetailsData.query.pages[pageId]?.thumbnail?.source || "";

    // キノコ関連ページの判定（タイトルに「キノコ」が含まれているか）
    if (
      pageTitle.toLowerCase().includes("mushroom") ||
      pageTitle.includes("キノコ")
    ) {
      return { title: pageTitle, content: pageContent, imageUrl: pageImage };
    } else {
      // キノコに関連しないページが返された場合、再度ランダムに取得
      return fetchRandomFungusData(attempts - 1); // 再試行
    }
  } catch (error) {
    console.error("Wikipedia APIエラー:", error);
    return null;
  }
};

type FungusInfo = {
  name: string;
  imageUrl: string;
  description: string;
};

export default function Home() {
  const [fungus, setFungus] = useState<FungusInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const getRandomFungus = async () => {
      try {
        const data = await fetchRandomFungusData();
        if (data) {
          setFungus({
            name: data.title,
            imageUrl: data.imageUrl || "/default.png", // 画像がない場合のデフォルト画像
            description: data.content,
          });
        } else {
          throw new Error("きのこの情報の取得に失敗しました。");
        }
      } catch (err) {
        console.error("エラー:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    getRandomFungus();
  }, []);

  return (
    <main style={{ padding: "1rem" }}>
      {/* <MyceliumGrowth /> */}
      {/* <GrowthHistory /> */}
      <br />

      {loading ? (
        <p>菌を識別中...</p>
      ) : error ? (
        <div style={{ marginTop: "2rem" }}>
          <h3>エラー</h3>
          <img
            src="/fallback.png"
            alt="エラー画像"
            style={{ maxWidth: "300px", borderRadius: "10px" }}
          />
          <p>菌の識別に失敗しました。</p>
        </div>
      ) : fungus ? (
        <div style={{ marginTop: "2rem" }}>
          <h3>{fungus.name}</h3>
          <img
            src={fungus.imageUrl}
            alt={fungus.name}
            style={{ maxWidth: "300px", borderRadius: "10px" }}
          />
        </div>
      ) : null}
    </main>
  );
}
