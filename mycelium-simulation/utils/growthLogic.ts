import "./growthLogic.css";

type GrowthParameters = {
  tempreture: number;
  humidity: number;
  nutrition: number;
  pH: number; // pHを追加
};

type GrowthStage =
  | "spore(胞子)"
  | "hyphae(菌糸)"
  | "mycelium(菌糸体)"
  | "fruiting(子実体形成)"
  | "complete(成熟)";

// 成長段階の配列（順序付き）
export const stages: GrowthStage[] = [
  "spore(胞子)",
  "hyphae(菌糸)",
  "mycelium(菌糸体)",
  "fruiting(子実体形成)",
  "complete(成熟)",
];

// 各段階に必要な条件
export const stageConditions: Record<
  GrowthStage,
  {
    temperature: [number, number];
    humidity: [number, number];
    nutrition: [number, number];
    pH: [number, number]; // pHの範囲を追加
  }
> = {
  "spore(胞子)": {
    temperature: [20, 25],
    humidity: [80, 90],
    nutrition: [0, 20],
    pH: [5.5, 6.5], // pH範囲
  },
  "hyphae(菌糸)": {
    temperature: [22, 28],
    humidity: [85, 95],
    nutrition: [20, 50],
    pH: [5.5, 6.5], // pH範囲
  },
  "mycelium(菌糸体)": {
    temperature: [24, 30],
    humidity: [85, 100],
    nutrition: [50, 80],
    pH: [5.5, 6.5], // pH範囲
  },
  "fruiting(子実体形成)": {
    temperature: [18, 24],
    humidity: [90, 100],
    nutrition: [80, 100],
    pH: [5.5, 6.5], // pH範囲
  },
  "complete(成熟)": {
    temperature: [0, 100],
    humidity: [0, 100],
    nutrition: [0, 100],
    pH: [0, 100], // pH範囲
  },
};

// 成長履歴
export const growthHistory: { stage: GrowthStage; params: GrowthParameters }[] =
  [];

// 指定された段階に進めるかどうかを判定
export const canAdvanceStage = (
  stage: GrowthStage,
  params: GrowthParameters
): boolean => {
  const cond = stageConditions[stage];
  return (
    params.tempreture >= cond.temperature[0] &&
    params.tempreture <= cond.temperature[1] &&
    params.humidity >= cond.humidity[0] &&
    params.humidity <= cond.humidity[1] &&
    params.nutrition >= cond.nutrition[0] &&
    params.nutrition <= cond.nutrition[1] &&
    params.pH >= cond.pH[0] &&
    params.pH <= cond.pH[1]
  );
};

// 自動で次の段階に進めるか判定して返す
export const autoAdvanceStage = (
  currentStage: GrowthStage,
  params: GrowthParameters
): GrowthStage => {
  const currentIndex = stages.indexOf(currentStage);
  const nextStage = stages[currentIndex + 1];

  // 現在の段階を履歴に保存
  growthHistory.push({ stage: currentStage, params });

  if (nextStage && canAdvanceStage(nextStage, params)) {
    // 次の段階に進む場合も履歴に保存
    growthHistory.push({ stage: nextStage, params });
    return nextStage;
  }

  return currentStage;
};
