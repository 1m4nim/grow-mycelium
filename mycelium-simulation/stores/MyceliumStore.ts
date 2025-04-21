import { create } from "zustand";
import { persist } from "zustand/middleware";

// 成長パラメータの型
export type GrowthParameters = {
  temperature: number;
  humidity: number;
  nutrition: number;
  pH: number;
};

// 成長ステージの型
export type GrowthStage =
  | "spore(胞子)"
  | "hyphae(菌糸)"
  | "mycelium(菌糸体)"
  | "fruiting(子実体形成)"
  | "mature(成熟)";

// 菌類の情報
type FungusInfo = {
  name: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  description: string;
  imageUrl: string;
};

// 成長データ
type MyceliumData = {
  currentStage: GrowthStage;
  parameters: GrowthParameters;
  discoveredFungus?: FungusInfo;
};

// 成長履歴のエントリ型
export type GrowthEntry = {
  stage: GrowthStage;
  params: GrowthParameters;
  timestamp: Date;
};

type MyceliumStore = {
  data: MyceliumData;
  log: string;
  growthHistory: GrowthEntry[];
  setParameter: (key: keyof GrowthParameters, value: number) => void;
  grow: () => void;
  reset: () => void;
  setLog: (msg: string) => void;
};

// 理想条件判定
const isIdealCondition = (params: GrowthParameters): boolean => {
  return (
    params.temperature >= 20 &&
    params.temperature <= 30 &&
    params.humidity >= 60 &&
    params.humidity <= 90 &&
    params.nutrition >= 40 &&
    params.pH >= 6 &&
    params.pH <= 8
  );
};

export const useMyceliumStore = create<MyceliumStore>()(
  persist(
    (set, get) => ({
      data: {
        currentStage: "spore(胞子)",
        parameters: {
          temperature: 25,
          humidity: 70,
          nutrition: 50,
          pH: 7,
        },
        discoveredFungus: undefined,
      },
      log: "育成スタート 🍄",
      growthHistory: [],

      setParameter: (key, value) =>
        set((state) => ({
          ...state,
          data: {
            ...state.data,
            parameters: {
              ...state.data.parameters,
              [key]: value,
            },
          },
        })),

      setLog: (msg) => set((state) => ({ ...state, log: msg })),

      grow: async () => {
        const { data } = get();

        if (!isIdealCondition(data.parameters)) {
          set({ log: "成長条件が不適切です❌" });
          return;
        }

        const stageOrder: GrowthStage[] = [
          "spore(胞子)",
          "hyphae(菌糸)",
          "mycelium(菌糸体)",
          "fruiting(子実体形成)",
          "mature(成熟)",
        ];
        const currentIndex = stageOrder.indexOf(data.currentStage);

        if (currentIndex < stageOrder.length - 1) {
          const nextStage = stageOrder[currentIndex + 1];

          const addGrowthHistory = (stage: GrowthStage) => {
            const newEntry: GrowthEntry = {
              stage,
              params: { ...data.parameters },
              timestamp: new Date(),
            };
            set((state) => ({
              growthHistory: [...state.growthHistory, newEntry],
            }));
          };

          if (nextStage === "fruiting(子実体形成)") {
            try {
              const response = await fetch("/api/identify", {
                method: "POST",
                body: JSON.stringify({ enviroment: data.parameters }),
                headers: {
                  "Content-Type": "application/json",
                },
              });

              const result = await response.json();
              const top = result?.suggestions?.[0];

              const getRarity = () => {
                const prob = top?.probability || 0;
                if (prob > 0.9) return "common";
                if (prob > 0.7) return "uncommon";
                if (prob > 0.4) return "rare";
                return "legendary";
              };

              set((state) => ({
                data: {
                  ...state.data,
                  currentStage: nextStage,
                  discoveredFungus: {
                    name: top?.name || "Unknown Fungus",
                    description: top?.details?.description || "説明なし",
                    imageUrl: top?.details?.image?.url || "/fallback.png",
                    rarity: getRarity(),
                  },
                },
                log: "🍄 子実体が形成されました！",
              }));

              addGrowthHistory(nextStage);
            } catch (error) {
              set({ log: "識別APIの呼び出しに失敗しました" });
            }
          } else {
            set((state) => ({
              data: {
                ...state.data,
                currentStage: nextStage,
              },
              log: `✅ ${nextStage} に成長しました`,
            }));

            addGrowthHistory(nextStage);
          }
        } else {
          set({ log: "✨ 成熟段階に到達しました" });
        }
      },

      reset: () =>
        set(() => ({
          data: {
            currentStage: "spore(胞子)",
            parameters: {
              temperature: 25,
              humidity: 70,
              nutrition: 50,
              pH: 7,
            },
            discoveredFungus: undefined,
          },
          log: "リセットしました 🔁",
          growthHistory: [],
        })),
    }),
    {
      name: "mycelium-storage",
      partialize: (state) => ({
        data: state.data,
        log: state.log,
        growthHistory: state.growthHistory,
      }),
    }
  )
);
