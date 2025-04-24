"use client";

import React, { useEffect, useState } from "react";
import MyceliumGrowth from "../mycelium-simulation/stores/MyceliumGrowth";
import GrowthHistory from "../mycelium-simulation/stores/GrowthHistoryButton";

// WikipediaのAPIからランダムなきのこの情報を取得する関数
const fetchRandomFungusData = async (attempts = 5): Promise<any> => {
  try {
    if (attempts <= 0) return null;

    const language = Math.random() < 0.5 ? "ja" : "en";
    const url = `https://${language}.wikipedia.org/w/api.php`;

    const res = await fetch(`/api/fetchWikipedia?title=キノコ`);

    const data = await res.json();

    const pageId = data.query.random[0].id;
    const pageTitle = data.query.random[0].title;

    const pageDetailsRes = await fetch(
      `${url}?action=query&format=json&prop=extracts|pageimages&exintro&explaintext&pageids=${pageId}&piprop=thumbnail&pithumbsize=300&origin=*`
    );
    const pageDetailsData = await pageDetailsRes.json();

    const page = pageDetailsData.query.pages[pageId];
    const pageContent = page.extract;
    const pageImage = page?.thumbnail?.source || "";

    if (
      pageTitle.toLowerCase().includes("mushroom") ||
      pageTitle.includes("キノコ")
    ) {
      return { title: pageTitle, content: pageContent, imageUrl: pageImage };
    } else {
      return fetchRandomFungusData(attempts - 1);
    }
  } catch (error) {
    console.error("Wikipedia APIエラー:", error);
    return null;
  }
};

// 👇 これが React コンポーネントとしての Page 本体
const Page = () => {
  const [fungus, setFungus] = useState<any>(null);

  useEffect(() => {
    const loadFungus = async () => {
      const data = await fetchRandomFungusData();
      setFungus(data);
    };
    loadFungus();
  }, []);

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
        <p>きのこの情報を読み込んでいます...</p>
      )}

      <MyceliumGrowth />
      <GrowthHistory />
    </div>
  );
};

export default Page;
