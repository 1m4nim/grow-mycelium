import { useMyceliumStore } from "./MyceliumStore";
import "./MyceliumGrowth.css";
import { useEffect, useState, useRef } from "react";
import GrowthHistoryButton from "./GrowthHistoryButton";
import WikipediaFungusImage from "./WikipediaFungusImage";
import useFungusDiscovery from "./useFungusDiscovery";
import { Fungus } from "./MyceliumStore";
import GrowthHistoryList from "./GrowthHistoryList";

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
  } | null>(null);

  const [discoveredFungus, setDiscoveredFungus] = useState<Fungus | null>(null);
  useFungusDiscovery(data.currentStage, setDiscoveredFungus);

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
      return () => {
        clearInterval(interval);
      };
    }
  }, [data.currentStage, grow]);

  const handleParameterChange = (
    param: keyof GrowthParameters,
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
    if (data.currentStage === "fruiting(子実体形成)" && data.discoveredFungus) {
      const fetchFungusInfo = async () => {
        try {
          const response = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&format=json&origin=*`
          );
          const json = await response.json();
          const pageTitle = json.query.random[0].title;

          const pageResponse = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=&explaintext=&titles=${pageTitle}&format=json&origin=*`
          );
          const pageJson = await pageResponse.json();
          const page =
            pageJson.query.pages[Object.keys(pageJson.query.pages)[0]];

          const englishExtract = page.extract || "No description available.";
          const image = page.thumbnail?.source || "";

          const translated = await fetch(
            `https://ja.wikipedia.org/w/api.php?action=query&list=search&srsearch=${pageTitle}&format=json&origin=*`
          )
            .then((res) => res.json())
            .then(async (jaJson) => {
              if (jaJson.query.search.length > 0) {
                const jaTitle = jaJson.query.search[0].title;
                const jaPageRes = await fetch(
                  `https://ja.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=&explaintext=&titles=${jaTitle}&format=json&origin=*`
                );
                const jaPageJson = await jaPageRes.json();
                const jaPage =
                  jaPageJson.query.pages[
                    Object.keys(jaPageJson.query.pages)[0]
                  ];
                return jaPage.extract || "翻訳が見つかりませんでした。";
              }
              return "翻訳が見つかりませんでした。";
            });

          setFungusInfo({
            name: pageTitle,
            image,
            description: translated + "\n\n" + englishExtract,
          });
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

      <div>
        <h2>現在のステージ: {data.currentStage}</h2>
      </div>

      <div>
        <h3>成長パラメーター</h3>
        {["温度", "湿度", "栄養", "pH"].map((param) => (
          <div style={{ marginBottom: "1rem" }} key={param}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              {param === "温度" && `🌡️ 温度: ${data.parameters.温度}℃`}
              {param === "湿度" && `💧 湿度: ${data.parameters.湿度}%`}
              {param === "栄養" && `🍽️ 栄養: ${data.parameters.栄養}`}
              {param === "pH" && `⚗️ pH: ${data.parameters.pH}`}
            </label>
            <input
              type="range"
              min={param === "pH" ? 0 : 0}
              max={param === "温度" ? 50 : param === "pH" ? 14 : 100}
              step={param === "pH" ? 0.1 : 1}
              value={data.parameters[param as keyof GrowthParameters]}
              onChange={(e) =>
                handleParameterChange(
                  param as keyof GrowthParameters,
                  Number(e.target.value)
                )
              }
              style={{ width: "100%" }}
            />
          </div>
        ))}

        <div>
          <button onClick={handleGrow} style={{ fontSize: "42px" }}>
            {!(
              fungusInfo &&
              (data.currentStage === "fruiting(子実体形成)" ||
                data.currentStage === "mature(成熟)")
            ) && "成長中"}
          </button>
          {data.currentStage === "mature(成熟)" && (
            <button onClick={handleReset} style={{ marginTop: "1rem" }}>
              🔁 リセット
            </button>
          )}
        </div>

        {(data.currentStage === "fruiting(子実体形成)" ||
          data.currentStage === "mature(成熟)") &&
          fungusInfo && (
            <div>
              <h3>発見されたキノコ</h3>
              <p>名前: {fungusInfo.name}</p>
              <p>説明: {fungusInfo.description}</p>
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {fungusInfo.description}
              </pre>
              <WikipediaFungusImage name={fungusInfo.name} />
            </div>
          )}

        {/* 成長履歴の表示 */}
        <GrowthHistoryList history={growthHistory} />

        <div style={{ marginTop: "2rem" }}></div>
      </div>
    </div>
  );
};

export default MyceliumGrowth;
