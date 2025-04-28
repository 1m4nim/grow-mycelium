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

// DeepL翻訳API
const translateToJapanese = async (text: string): Promise<string> => {
  const apiKey = "8ded8e94-0948-4df3-996f-08e80de9dcaf:fx";
  const response = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `DeepL-Auth-Key ${apiKey}`,
    },
    body: `text=${encodeURIComponent(text)}&target_lang=JA`,
  });

  const data = await response.json();
  return data.translations[0].text;
};

// テキスト要約関数
const summarizeText = (text: string): string => {
  // とりあえず最初の200文字だけ返す簡易版
  return text.length > 200 ? text.slice(0, 200) + "..." : text;
};

const MyceliumGrowth = () => {
  const { data, setParameter, grow, reset } = useMyceliumStore();
  const [fungusInfo, setFungusInfo] = useState<{
    name: string;
    image: string;
    description: string;
    englishDescription: string;
    englishExtract: string;
    japaneseExtract: string;
    imageJa: string;
  } | null>(null);
  const [discoveredFungus, setDiscoveredFungus] = useState<Fungus | null>(null);
  const [growthHistory, setGrowthHistory] = useState<GrowthHistoryEntry[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [translatedSummary, setTranslatedSummary] = useState<string>("");

  // 自動成長のタイマー
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

  // 成長ステージに応じたキノコ発見
  useFungusDiscovery(data.currentStage, setDiscoveredFungus);

  // 成長ボタン
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

  // Wikipediaからランダムな菌類情報を取得
  const fetchFungusInfo = async () => {
    try {
      // 1. 「Fungi」カテゴリからサブカテゴリも含めて取得
      const categoryRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:Fungi&cmtype=subcat&cmlimit=500&format=json&origin=*`
      );
      const categoryData = await categoryRes.json();
      const subcategories = categoryData.query.categorymembers;

      // サブカテゴリからランダムに選ぶ
      const randomCategory =
        subcategories[Math.floor(Math.random() * subcategories.length)];

      console.log("選ばれたサブカテゴリ:", randomCategory.title);

      // 2. サブカテゴリ内のページを取得
      const pagesRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${randomCategory.title}&cmlimit=10&format=json&origin=*`
      );
      const pagesData = await pagesRes.json();
      const pages = pagesData.query.categorymembers;

      // ランダムに1つのページを選ぶ
      const randomPage = pages[Math.floor(Math.random() * pages.length)];
      console.log("選ばれたページ:", randomPage.title);

      // 3. Wikipediaページの詳細を取得
      const pageRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=&explaintext=&titles=${randomPage.title}&format=json&origin=*`
      );
      const pageData = await pageRes.json();
      const pageKey = Object.keys(pageData.query.pages)[0];
      const page = pageData.query.pages[pageKey];

      const englishExtract = page.extract || "No English description found.";
      const image = page.thumbnail?.source || "";

      // 4. 日本語版Wikipediaにアクセス
      const pageJaRes = await fetch(
        `https://ja.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=&explaintext=&titles=${randomPage.title}&format=json&origin=*`
      );
      const pageJaData = await pageJaRes.json();
      const pageJaKey = Object.keys(pageJaData.query.pages)[0];
      const pageJa = pageJaData.query.pages[pageJaKey];

      const japaneseExtract =
        pageJa.extract || "日本語の説明が見つかりませんでした。";
      const imageJa = pageJa.thumbnail?.source || "";

      // 5. 結果を表示
      setFungusInfo({
        name: randomPage.title,
        image,
        description: japaneseExtract,
        englishDescription: englishExtract,
        englishExtract,
        japaneseExtract,
        imageJa,
      });
    } catch (err) {
      console.error("Wikipedia取得エラー:", err);
    }
  };

  useEffect(() => {
    fetchFungusInfo(); // コンポーネントが初めてマウントされたときに最初のキノコ情報を取得
  }, []); // 最初のマウント時のみ実行

  // リセット時にキノコ情報をリセット
  const handleReset = () => {
    reset();
    setFungusInfo(null); // リセットしてキノコ情報を初期化
    fetchFungusInfo(); // 新しいキノコ情報を取得
  };

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
            onClick={handleReset}
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
          </section>
        )}

      <GrowthHistoryList history={growthHistory} />
    </div>
  );
};

export default MyceliumGrowth;
