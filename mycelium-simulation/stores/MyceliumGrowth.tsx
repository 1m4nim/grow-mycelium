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
  const [growthHistory, setGrowthHistory] = useState<GrowthHistoryEntry[]>([]);

  // useFungusDiscoveryフックを利用
  const { discoveredFungus, fetchFungusFromWikipedia } = useFungusDiscovery();

  useEffect(() => {
    if (data.currentStage === "mature(成熟)") return;

    const intervalId = setInterval(() => {
      grow();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [data.currentStage, grow]);

  // 成長ステージが「子実体形成」の場合にWikipediaからキノコ情報を取得
  useEffect(() => {
    if (data.currentStage === "fruiting(子実体形成)") {
      fetchFungusFromWikipedia();
    }
  }, [data.currentStage, fetchFungusFromWikipedia]);

  // リセットボタン処理
  const handleReset = () => {
    reset();
  };

  return (
    <div className="mycelium-growth-container">
      <h1>菌類を育てよう</h1>
      <h2>現在のステージ: {data.currentStage}</h2>

      {/* 成長パラメーター */}
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

      {/* 発見されたキノコの情報 */}
      {discoveredFungus && (
        <section>
          <h3>🍄 発見されたキノコ</h3>
          <p>
            <strong>名前:</strong> {discoveredFungus.name}
          </p>
          <WikipediaFungusImage
            name={discoveredFungus.name}
            src={discoveredFungus.imageUrl || ""} // imageUrlがundefinedの場合には空文字を渡す
          />
          <p>
            <strong>日本語の説明:</strong>
            {discoveredFungus.descriptionJa || "説明はありません"}
          </p>
          <p>
            <strong>English Summary:</strong>
            {discoveredFungus.description}
          </p>
        </section>
      )}

      <GrowthHistoryList history={growthHistory} />
    </div>
  );
};

export default MyceliumGrowth;
