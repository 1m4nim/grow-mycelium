import { useEffect, useState, useRef } from "react";
import { useMyceliumStore } from "./MyceliumStore";
import GrowthHistoryList from "./GrowthHistoryList";
import useFungusDiscovery from "./useFungusDiscovery";
import "./MyceliumGrowth.css";
import { Fungus } from "./MyceliumStore";

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

const paramRange: Record<
  keyof GrowthParameters,
  { min: number; max: number; step: number }
> = {
  温度: { min: 0, max: 50, step: 1 },
  湿度: { min: 0, max: 100, step: 1 },
  栄養: { min: 0, max: 100, step: 1 },
  pH: { min: 0, max: 14, step: 0.1 },
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 自動成長のタイマー制御
  useEffect(() => {
    if (data.currentStage === "mature(成熟)") {
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
      return;
    }
    const interval = setInterval(grow, 5000);
    intervalRef.current = interval;
    return () => clearInterval(interval);
  }, [data.currentStage, grow]);

  useFungusDiscovery(data.currentStage, setDiscoveredFungus);

  // 成長手動トリガー & 履歴保存
  const handleGrow = () => {
    grow();
    setGrowthHistory((prev) => [
      ...prev,
      {
        stage: data.currentStage,
        params: data.parameters,
        timestamp: new Date(),
      },
    ]);
  };

  // Wikipediaから菌類の情報を取得
  useEffect(() => {
    if (data.currentStage === "fruiting(子実体形成)" && !fungusInfo) {
      const fetchFungusInfo = async () => {
        try {
          // WikipediaのFungiカテゴリ内のページをランダムに取得
          const randomPageRes = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:Fungi&cmlimit=10&format=json&origin=*`
          );
          const randomPageData = await randomPageRes.json();
          const randomPages = randomPageData.query.categorymembers;

          // ランダムに1つのページを選択
          const randomIndex = Math.floor(Math.random() * randomPages.length);
          const randomTitle = randomPages[randomIndex]?.title;

          if (randomTitle) {
            const pageRes = await fetch(
              `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=&explaintext=&titles=${randomTitle}&format=json&origin=*`
            );
            const pageData = await pageRes.json();
            const pages = pageData.query.pages;
            const pageKey = Object.keys(pages)[0];
            const page = pages[pageKey];

            const englishExtract =
              page.extract || "No English description found.";
            const image = page.thumbnail?.source || "";

            const jaSearchRes = await fetch(
              `https://ja.wikipedia.org/w/api.php?action=query&list=search&srsearch=${randomTitle}&format=json&origin=*`
            );
            const jaSearchData = await jaSearchRes.json();
            let jaDescription = "日本語での説明は見つかりませんでした。";

            if (jaSearchData.query.search.length > 0) {
              const jaTitle = jaSearchData.query.search[0].title;
              const jaPageRes = await fetch(
                `https://ja.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=&explaintext=&titles=${jaTitle}&format=json&origin=*`
              );
              const jaPageData = await jaPageRes.json();
              const jaPages = jaPageData.query.pages;
              const jaPageKey = Object.keys(jaPages)[0];
              const jaPage = jaPages[jaPageKey];
              jaDescription = jaPage.extract || jaDescription;
            }

            // ここでセットした内容はランダムに選ばれたキノコの情報
            setFungusInfo({
              name: randomTitle,
              image,
              description: jaDescription,
              englishDescription: englishExtract,
            });
          }
        } catch (err) {
          console.error("Wikipediaの取得エラー:", err);
        }
      };

      fetchFungusInfo();
    }
  }, [data.currentStage, fungusInfo]);

  return (
    <div className="mycelium-growth-container">
      <h1>菌類を育てよう</h1>
      <h2>現在のステージ: {data.currentStage}</h2>

      <section>
        <h3>成長パラメーター</h3>
        {Object.keys(paramRange).map((key) => {
          const param = key as keyof GrowthParameters;
          const label =
            param === "温度"
              ? `🌡️ 温度: ${data.parameters[param]}℃`
              : param === "湿度"
              ? `💧 湿度: ${data.parameters[param]}%`
              : param === "栄養"
              ? `🍽️ 栄養: ${data.parameters[param]}`
              : `⚗️ pH: ${data.parameters[param]}`;

          return (
            <div key={param} style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                {label}
              </label>
              <input
                type="range"
                {...paramRange[param]}
                value={data.parameters[param]}
                onChange={(e) => setParameter(param, Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
          );
        })}

        <button onClick={handleGrow} style={{ fontSize: "42px" }}>
          {!(
            fungusInfo &&
            ["fruiting(子実体形成)", "mature(成熟)"].includes(data.currentStage)
          )
            ? "成長中"
            : ""}
        </button>

        {data.currentStage === "mature(成熟)" && (
          <button
            onClick={reset}
            style={{ marginTop: "1rem", fontSize: "24px" }}
          >
            🔁 リセット
          </button>
        )}
      </section>

      {fungusInfo &&
        ["fruiting(子実体形成)", "mature(成熟)"].includes(
          data.currentStage
        ) && (
          <section>
            <h3>🍄 発見されたキノコ</h3>
            <p>
              <strong>名前:</strong> {fungusInfo.name}
            </p>
            {fungusInfo.image && (
              <img
                src={fungusInfo.image}
                alt={fungusInfo.name}
                style={{ maxWidth: "300px" }}
              />
            )}
            <p>
              <strong>日本語の説明:</strong>
            </p>
            <p>{fungusInfo.description}</p>
            <p>
              <strong>English Summary:</strong>
            </p>
            <p>{fungusInfo.englishDescription}</p>
          </section>
        )}

      <GrowthHistoryList history={growthHistory} />
    </div>
  );
};

export default MyceliumGrowth;
