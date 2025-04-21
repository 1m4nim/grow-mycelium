import { useMyceliumStore } from "./MyceliumStore";
import "./MyceliumGrowth.css";
import { useEffect, useState } from "react";
import GrowthHistoryButton from "./GrowthHistoryButton";
import WikipediaFungusImage from "./WikipediaFungusImage";
import { useRef } from "react";
import useFungusDiscovery from "./useFungusDiscovery";
import { Fungus } from "./MyceliumStore";

// GrowthParameters型の定義
export interface GrowthParameters {
  温度: number;
  湿度: number;
  栄養: number;
  pH: number;
}

// GrowthStage型の定義
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

// MyceliumGrowthコンポーネント
const MyceliumGrowth = () => {
  const { data, setParameter, grow, reset } = useMyceliumStore();
  const [fungusInfo, setFungusInfo] = useState<{
    image: string;
    description: string;
  } | null>(null);

  const [discoveredFungus, setDiscoveredFungus] = useState<Fungus | null>(null);
  useFungusDiscovery(data.currentStage, setDiscoveredFungus); // 正しい場所で呼び出し

  const [growthHistory, setGrowthHistory] = useState<GrowthHistoryEntry[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (data.currentStage === "mature(成熟)") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      const interval = setInterval(() => {
        grow();
      }, 5000);
      intervalRef.current = interval;

      return () => clearInterval(interval);
    }
  }, [data.currentStage, grow]);

  const handleParameterChange = (
    param: keyof typeof data.parameters,
    value: number
  ) => {
    setParameter(param, value);
  };

  const handleGrow = () => {
    grow();
    setGrowthHistory((prevHistory) => [
      ...prevHistory,
      {
        stage: data.currentStage,
        params: data.parameters,
        timestamp: new Date(),
      },
    ]);
  };

  const handleReset = () => {
    reset();
  };

  useEffect(() => {
    if (data.currentStage === "fruiting(子実体形成)") {
      const fetchFungusInfo = async () => {
        try {
          const response = await fetch(
            `https://ja.wikipedia.org/w/api.php?action=query&list=search&srsearch=${data.discoveredFungus?.name}&format=json&origin=*`
          );
          const json = await response.json();
          if (json.query.search.length > 0) {
            const pageTitle = json.query.search[0].title;
            const pageResponse = await fetch(
              `https://ja.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=&explaintext=&titles=${pageTitle}&format=json&origin=*`
            );
            const pageJson = await pageResponse.json();
            const page =
              pageJson.query.pages[Object.keys(pageJson.query.pages)[0]];
            const extract = page.extract || "情報なし";
            const image = page.thumbnail?.source || "";
            setFungusInfo({ image, description: extract });
          }
        } catch (error) {
          console.error("Wikipediaから情報の取得に失敗しました:", error);
        }
      };

      fetchFungusInfo();
    }
  }, [data.currentStage, data.discoveredFungus]);

  return (
    <div className="mycelium-growth-container">
      <h1>菌類を育てよう</h1>
      {/* 現在のステージ */}
      <div>
        <h2>現在のステージ: {data.currentStage}</h2>
      </div>

      {/* パラメータ */}
      <div>
        <h3>成長パラメーター</h3>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            🌡️ 温度: {data.parameters.温度}℃
          </label>
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            value={data.parameters.温度}
            onChange={(e) =>
              handleParameterChange("温度", Number(e.target.value))
            }
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            💧 湿度: {data.parameters.湿度}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={data.parameters.湿度}
            onChange={(e) =>
              handleParameterChange("湿度", Number(e.target.value))
            }
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            🍽️ 栄養: {data.parameters.栄養}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={data.parameters.栄養}
            onChange={(e) =>
              handleParameterChange("栄養", Number(e.target.value))
            }
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            ⚗️ pH: {data.parameters.pH}
          </label>
          <input
            type="range"
            min={0}
            max={14}
            step={0.1}
            value={data.parameters.pH}
            onChange={(e) =>
              handleParameterChange("pH", Number(e.target.value))
            }
            style={{ width: "100%" }}
          />
        </div>

        {/* 成長とリセットボタン */}
        <div>
          <button onClick={handleGrow} style={{ fontSize: "42px" }}>
            成長中
          </button>
          {data.currentStage === "mature(成熟)" && (
            <button onClick={handleReset} style={{ marginTop: "1rem" }}>
              🔁 リセット
            </button>
          )}
        </div>

        {/* 発見されたキノコ情報 */}
        {data.discoveredFungus && (
          <div>
            <h3>発見されたキノコ</h3>
            <p>名前: {data.discoveredFungus.name}</p>
            <p>説明: {data.discoveredFungus.imageUrl}</p>
            <WikipediaFungusImage name={data.discoveredFungus.name} />
          </div>
        )}

        {/* 子実体形成のタイミングでWikipedia情報を表示 */}
        {(data.currentStage === "fruiting(子実体形成)" ||
          data.currentStage === "mature(成熟)") &&
          fungusInfo && (
            <div>
              <h3>Wikipediaからの情報</h3>
              {fungusInfo.image && (
                <img
                  src={fungusInfo.image}
                  alt="キノコの画像"
                  style={{ width: "200px", height: "200px" }}
                />
              )}
              <p>{fungusInfo.description}</p>
            </div>
          )}

        <div style={{ marginTop: "2rem" }}></div>
      </div>
    </div>
  );
};

export default MyceliumGrowth;
