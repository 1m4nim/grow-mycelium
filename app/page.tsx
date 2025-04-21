"use client";

import React, { useEffect, useState } from "react";
import MyceliumGrowth from "../mycelium-simulation/stores/MyceliumGrowth";
//import GrowthHistory from "../mycelium-simulation/stores/GrowthHistoryButton";

type FungusInfo = {
  name: string;
  imageUrl: string;
  description: string;
  jaTranslation?: string;
};

export default function Home() {
  const [fungus, setFungus] = useState<FungusInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFungus = async () => {
      try {
        // GETリクエストに変更
        const res = await fetch("/api/identify");
        const data = await res.json();

        if (data.fungus) {
          setFungus(data.fungus);
        } else {
          setFungus({
            name: "見つからないよ！",
            imageUrl: "/fallback.png",
            description: "画像が存在しないため表示できません。",
          });
        }
      } catch (err) {
        console.error("API呼び出しエラー:", err);
        setFungus({
          name: "エラー",
          imageUrl: "/fallback.png",
          description: "菌の識別に失敗しました。",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFungus();
  }, []);

  return (
    <main style={{ padding: "1rem" }}>
      <MyceliumGrowth />
      {/* <GrowthHistory /> */}
      <br />

      {loading ? (
        <p>菌を識別中...</p>
      ) : (
        fungus && (
          <div style={{ marginTop: "2rem" }}>
            <h3>{fungus.name}</h3>
            <img
              src={fungus.imageUrl}
              alt={fungus.name}
              style={{ maxWidth: "300px", borderRadius: "10px" }}
            />
            <p>{fungus.description}</p>
            {fungus.jaTranslation && (
              <p style={{ color: "gray" }}>和訳: {fungus.jaTranslation}</p>
            )}
          </div>
        )
      )}
    </main>
  );
}
