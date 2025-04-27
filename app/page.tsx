"use client";

import React, { useEffect, useState } from "react";
import MyceliumGrowth from "../mycelium-simulation/stores/MyceliumGrowth";
import GrowthHistory from "../mycelium-simulation/stores/GrowthHistoryButton";
import {
  fetchWikiInfo,
  searchWikiMushroom,
} from "../mycelium-simulation/utils/WikiFetcher";

// ランダムなキノコ情報を取得する関数
const fetchRandomFungusData = async (attempts = 5): Promise<any> => {
  try {
    if (attempts <= 0) return null;

    const language = Math.random() < 0.5 ? "ja" : "en";

    // "キノコ"に関連するページを検索
    const randomTitle = await searchWikiMushroom("キノコ", language);
    if (!randomTitle) {
      return fetchRandomFungusData(attempts - 1); // 取れなかったらリトライ
    }

    // タイトルに "mushroom" か "キノコ" が含まれているか確認
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
      // きのこ関連の情報が取れなければリトライ
      return fetchRandomFungusData(attempts - 1);
    }
  } catch (error) {
    console.error("Wikipedia APIエラー:", error);
    return null;
  }
};

const Page = () => {
  const [fungus, setFungus] = useState<any>(null);
  const [isFruiting, setIsFruiting] = useState(false); // 子実体形成したかどうか

  // 子実体が形成された時に呼ばれる関数
  const onFruitingBodyFormed = async () => {
    const data = await fetchRandomFungusData();
    setFungus(data);
  };

  // 子実体が形成されたときにきのこ情報を取得
  useEffect(() => {
    if (isFruiting) {
      onFruitingBodyFormed();
    }
  }, [isFruiting]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>きのこ識別</h1>

      {/* きのこ情報が存在する場合に表示 */}
      {fungus ? (
        <div style={{ marginTop: "1rem" }}>
          <h2>{fungus.title}</h2>
          {fungus.imageUrl && (
            <img
              src={fungus.imageUrl}
              alt={fungus.title}
              style={{ maxWidth: "300px", marginBottom: "1rem" }}
            />
          )}
          <p>{fungus.content}</p>
        </div>
      ) : (
        <p></p>
      )}

      {/* 子実体形成をボタンでトリガーできる */}
      <button onClick={() => setIsFruiting(true)}></button>

      {/* MyceliumGrowthとGrowthHistoryコンポーネント */}
      <MyceliumGrowth />
      <GrowthHistory />
    </div>
  );
};

export default Page;
