import { useMyceliumStore } from "./MyceliumStore";
import "./MyceliumGrowth.css";
import { useEffect } from "react";
import GrowthHistoryButton from "./GrowthHistoryButton";
import WikipediaFungusImage from "./WikipediaFungusImage";

// GrowthParameters型の定義
export interface GrowthParameters {
  temperature: number;
  humidity: number;
  nutrition: number;
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

// 成長履歴の初期化（空）
export const growthHistory: GrowthHistoryEntry[] = [];

// MyceliumGrowthコンポーネント
const MyceliumGrowth = () => {
  const { data, setParameter, grow, reset } = useMyceliumStore();

  useEffect(() => {
    const interval = setInterval(() => {
      grow();
    }, 5000); // 例えば5秒ごとに成長

    return () => clearInterval(interval);
  }, [grow]);

  // パラメータを変更するハンドラー
  const handleParameterChange = (
    param: keyof typeof data.parameters,
    value: number
  ) => {
    setParameter(param, value);
  };

  const handleGrow = () => {
    grow();
    // 成長後に履歴を追加
    growthHistory.push({
      stage: data.currentStage,
      params: data.parameters,
      timestamp: new Date(),
    });
  };

  const handleReset = () => {
    reset();
  };

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
            🌡️ 温度: {data.parameters.temperature}℃
          </label>
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            value={data.parameters.temperature}
            onChange={(e) =>
              handleParameterChange("temperature", Number(e.target.value))
            }
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            💧 湿度: {data.parameters.humidity}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={data.parameters.humidity}
            onChange={(e) =>
              handleParameterChange("humidity", Number(e.target.value))
            }
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            🍽️ 栄養: {data.parameters.nutrition}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={data.parameters.nutrition}
            onChange={(e) =>
              handleParameterChange("nutrition", Number(e.target.value))
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
          <button onClick={handleGrow}>成長中</button>
          {data.currentStage.includes("mature") && (
            <button onClick={reset} style={{ marginTop: "1rem" }}>
              🔁 リセット
            </button>
          )}
        </div>

        {/* 発見されたキノコ情報 */}
        {data.discoveredFungus && (
          <div>
            <h3> 発見されたキノコ</h3>
            <p>名前: {data.discoveredFungus.name}</p>
            <p>レア度: {data.discoveredFungus.rarity}</p>
            <p>説明: {data.discoveredFungus.imageUrl}</p>
            <WikipediaFungusImage name={data.discoveredFungus.name} />
          </div>
        )}

        <div style={{ marginTop: "2rem" }}>
          <GrowthHistoryButton />
        </div>
      </div>
    </div>
  );
};

export default MyceliumGrowth;
