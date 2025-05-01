import { useEffect, useState } from "react";
import { useMyceliumStore } from "./MyceliumStore";
import GrowthHistoryList from "./GrowthHistoryList";
import useFungusDiscovery from "./useFungusDiscovery";
import "./MyceliumGrowth.css";
import { Fungus } from "./MyceliumStore";
import WikipediaFungusImage from "./WikipediaFungusImage";

export interface GrowthParameters {
  温度: number;
  湿度: number;
  栄養: number;
  pH: number;
}

export type GrowthStage =
  | "spore(胞子)"
  | "hyphae(菌糸)"
  | "mycelium(菌糸体)"
  | "fruiting(子実体形成)"
  | "mature(成熟)";

export type GrowthHistoryEntry = {
  stage: GrowthStage;
  params: GrowthParameters;
  timestamp: Date;
};

const MyceliumGrowth = () => {
  const { data, setParameter, grow, reset } = useMyceliumStore();
  const [fungusInfo, setFungusInfo] = useState<{
    name: string;
    image: string;
    description: string;
    englishDescription: string;
  } | null>(null);
  const [discoveredFungus, setDiscoveredFungus] = useState<Fungus | null>(null);
  const [growthHistory, setGrowthHistory] = useState<GrowthHistoryEntry[]>([]);

  useFungusDiscovery(data.currentStage, setDiscoveredFungus);

  const fetchFungusInfoByName = async (fungusName: string) => {
    try {
      const pageRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=&explaintext=&titles=${encodeURIComponent(
          fungusName
        )}&format=json&origin=*`
      );
      const pageData = await pageRes.json();
      const pages = pageData.query.pages;

      if (!pages || Object.keys(pages).length === 0) {
        console.error("No page data found.");
        return;
      }

      const pageKey = Object.keys(pages)[0];
      const pageDetails = pages[pageKey];

      const englishExtract =
        pageDetails.extract || "No English description found.";
      const image = pageDetails.thumbnail?.source || "";

      setFungusInfo({
        name: fungusName,
        image,
        description: englishExtract,
        englishDescription: englishExtract,
      });
    } catch (err) {
      console.error("Wikipediaの取得エラー:", err);
    }
  };

  useEffect(() => {
    if (data.currentStage === "mature(成熟)") return;
    const intervalId = setInterval(() => {
      grow();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [data.currentStage, grow]);

  useEffect(() => {
    if (discoveredFungus) {
      fetchFungusInfoByName(discoveredFungus.name);
    }
  }, [data.currentStage, discoveredFungus]);

  const handleReset = () => {
    reset();
    setFungusInfo(null);
    setDiscoveredFungus(null);
  };

  return (
    <div className="mycelium-growth-container">
      <h1>菌類を育てよう</h1>
      <h2>現在のステージ: {data.currentStage}</h2>

      <section>
        <h3>成長パラメーター</h3>
        {Object.keys(data.parameters).map((paramKey) => {
          const param = paramKey as keyof GrowthParameters;
          const label = `${param} : ${data.parameters[param]}`;
          return (
            <div key={param}>
              <label>{label}</label>
              <input
                type="range"
                min={param === "pH" ? 0 : 0}
                max={param === "pH" ? 14 : 100}
                step={param === "pH" ? 0.1 : 1}
                value={data.parameters[param]}
                onChange={(e) => setParameter(param, Number(e.target.value))}
              />
            </div>
          );
        })}

        {data.currentStage === "mature(成熟)" && (
          <button onClick={handleReset}>リセット</button>
        )}
      </section>

      {fungusInfo && (
        <section>
          <h3>🍄 発見されたキノコ</h3>
          <p>
            <strong>名前:</strong> {fungusInfo.name}
          </p>
          <WikipediaFungusImage name={fungusInfo.name} src={fungusInfo.image} />
          <p>
            <strong>日本語の説明:</strong>
            {fungusInfo.description
              ? fungusInfo.description
              : "説明はありません"}
          </p>
          <p>
            <strong>English Summary:</strong>
            {fungusInfo.englishDescription}
          </p>
        </section>
      )}

      <GrowthHistoryList history={growthHistory} />
    </div>
  );
};

export default MyceliumGrowth;
