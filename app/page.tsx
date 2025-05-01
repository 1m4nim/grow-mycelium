"use client";

import React, { useEffect, useState } from "react";
import MyceliumGrowth from "../mycelium-simulation/stores/MyceliumGrowth";
import GrowthHistory from "../mycelium-simulation/stores/GrowthHistoryButton";

// WikipediaのAPIからランダムなきのこの情報を取得する関数
const fetchRandomFungusData = async () => {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=random&rnlimit=1&format=json&origin=*`
    );
    const data = await res.json();

    // randomが存在するかどうかの確認
    if (!data.query || !data.query.random || !data.query.random[0]) {
      throw new Error("ランダムページの取得に失敗しました。");
    }

    const randomPage = data.query.random[0].title;
    // 取得したページ情報を元に次の処理を行う
    console.log(randomPage);
  } catch (error) {
    console.error("Wikipedia APIエラー:", error);
  }
};

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
        <p></p>
      )}

      <MyceliumGrowth />
      <GrowthHistory />
    </div>
  );
};

export default Page;
