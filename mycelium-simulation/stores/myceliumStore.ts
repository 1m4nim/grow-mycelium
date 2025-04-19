import { create } from "zustand";
import { persist } from "zustand/middleware";

type GrowthParameters = {
  temperature: number;
  humidity: number;
  nutrition: number;
  pH: number;
};

type GrowthStage =
  | "spore(胞子)"
  | "hyphae(菌糸)"
  | "mycelium(菌糸体)"
  | "fruiting(子実体形成)"
  | "mature(成熟)";

type FungusInfo = {
  name: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  description: string;
  imageUrl: string;
};

type MyceliumData = {
  currentStage: GrowthStage;
  parameters: GrowthParameters;
  discoveredFungus?: FungusInfo;
};

type MyceliumStore = {
  data: MyceliumData;
  setParameter: (key: keyof GrowthParameters, value: number) => void;
  grow: () => void;
  reset: () => void;
};

export const useMyceliumStore = create<MyceliumStore>()(
  persist<MyceliumStore>(
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

      setParameter: (key: keyof GrowthParameters, value: number) =>
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

      grow: async () => {
        const stageOrder: GrowthStage[] = [
          "spore(胞子)",
          "hyphae(菌糸)",
          "mycelium(菌糸体)",
          "fruiting(子実体形成)",
          "mature(成熟)",
        ];
        const currentStage = get().data.currentStage;
        const currentIndex = stageOrder.indexOf(currentStage);

        if (currentIndex < stageOrder.length - 1) {
          const nextStage = stageOrder[currentIndex + 1];

          // 「fruiting」に到達したらAPIを叩く
          if (nextStage === "fruiting(子実体形成)") {
            try {
              const response = await fetch("/api/identify", {
                body: JSON.stringify({ enviroment: get().data.parameters }),
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
                ...state,
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
              }));
            } catch (error) {
              console.log("識別失敗:", error);
            }
          } else {
            set((state) => ({
              ...state,
              data: {
                ...state.data,
                currentStage: nextStage,
              },
            }));
          }
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
        })),
    }),
    {
      name: "mycelium-storage",
    }
  )
);
