import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import { StateCreator } from "zustand";

export type GrowthStage =
  | "spore(胞子)"
  | "hyphae(菌糸)"
  | "mycelium(菌糸体)"
  | "fruiting(子実体形成)"
  | "mature(成熟)";

export type Parameters = {
  温度: number;
  湿度: number;
  栄養: number;
  pH: number;
};

export type Fungus = {
  name: string;
  description: string;
  imageUrl?: string;
};

export type GrowthEntry = {
  stage: GrowthStage;
  params: {
    温度: number;
    湿度: number;
    栄養: number;
    pH: number;
  };
  timestamp: Date;
};

export type MyceliumStore = {
  data: {
    currentStage: GrowthStage;
    parameters: Parameters;
    discoveredFungus?: Fungus;
    autoGrow: boolean;
    autoGrowIntervalId?: number;
    startAutoGrow: (intervalMinutes: number) => void;
    stopAutoGrow: () => void;
    setDiscoveredFungus: (fungus: Fungus) => void;
  };
  log: string;
  growthHistory: GrowthEntry[];

  setParameter: (key: keyof Parameters, value: number) => void;
  setLog: (msg: string) => void;
  grow: () => Promise<void>;
  reset: () => void;

  // 履歴削除用関数
  deleteGrowthHistory: (timestamp: Date) => void;
};

export const fetchFungusData = async (): Promise<Fungus> => {
  const categoryUrl = "https://en.wikipedia.org/w/api.php";
  const categoryParams = new URLSearchParams({
    action: "query",
    format: "json",
    list: "categorymembers",
    cmtitle: "Category:Edible_mushrooms", // エディブルキノコのカテゴリを指定
    cmlimit: "50", // 最大50件のページを取得
  });

  const categoryEndpoint = `${categoryUrl}?${categoryParams.toString()}`;

  try {
    const res = await fetch(categoryEndpoint);
    const data = await res.json();

    const fungusTitles: string[] = data.query.categorymembers.map(
      (item: { title: string }) => item.title
    );

    const randomName =
      fungusTitles[Math.floor(Math.random() * fungusTitles.length)];

    const pageUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      randomName
    )}`;
    const pageRes = await fetch(pageUrl);
    const pageData = await pageRes.json();

    return {
      name: pageData.title,
      description: pageData.extract,
      imageUrl: pageData.thumbnail?.source || "",
    };
  } catch (error) {
    console.error("Wikipediaカテゴリ取得エラー:", error);

    return {
      name: "不明なキノコ",
      description: "情報を取得できませんでした。",
      imageUrl: "",
    };
  }
};

// persist に型付け
type MyceliumPersist = (
  config: StateCreator<MyceliumStore>,
  options: PersistOptions<MyceliumStore, Partial<MyceliumStore>>
) => StateCreator<MyceliumStore>;

// Zustand + persist ストア
export const useMyceliumStore = create<MyceliumStore>(
  (persist as MyceliumPersist)(
    (set, get) => ({
      data: {
        currentStage: "spore(胞子)",
        parameters: {
          温度: 25,
          湿度: 70,
          栄養: 50,
          pH: 7,
        },
        discoveredFungus: undefined,
        autoGrow: false,
        autoGrowIntervalId: undefined,
        startAutoGrow: (intervalMinutes: number) => {
          const interval = intervalMinutes * 60 * 1000;
          const intervalId = setInterval(async () => {
            try {
              await get().grow();
              const currentStage = get().data.currentStage;
              if (currentStage === "mature(成熟)") {
                get().data.stopAutoGrow();
                clearInterval(intervalId);
              }
            } catch (error) {
              console.error("Error during grow process:", error);
              clearInterval(intervalId);
            }
          }, interval);

          set((state: any) => ({
            data: {
              ...state.data,
              autoGrow: true,
              autoGrowIntervalId: intervalId,
            },
          }));
        },
        stopAutoGrow: () => {
          const intervalId = get().data.autoGrowIntervalId;
          if (intervalId) clearInterval(intervalId);
          set((state) => ({
            data: {
              ...state.data,
              autoGrow: false,
              autoGrowIntervalId: undefined,
            },
          }));
        },
        setDiscoveredFungus: (fungus: Fungus) => {
          set((state) => ({
            data: {
              ...state.data,
              discoveredFungus: fungus,
            },
          }));
        },
      },

      log: "育成スタート 🍄 Start Growing!",
      growthHistory: [],

      setParameter: (key, value) => {
        set((state) => ({
          data: {
            ...state.data,
            parameters: {
              ...state.data.parameters,
              [key]: value,
            },
          },
        }));
      },

      setLog: (msg) => {
        set((state) => ({
          ...state,
          log: msg,
        }));
      },

      grow: async () => {
        const data = get().data;
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
            setTimeout(async () => {
              const randomFungus = await fetchFungusData();
              set((state) => ({
                data: {
                  ...state.data,
                  currentStage: nextStage,
                  discoveredFungus: randomFungus,
                },
                log: `🍄 子実体形成 (Fruiting Stage)! 発見: ${randomFungus.name}`,
              }));
              addGrowthHistory(nextStage);
            }, 60000);
          } else {
            set((state) => ({
              data: {
                ...state.data,
                currentStage: nextStage,
              },
              log: `✅ 成長ステージ: ${nextStage} (Grew to ${nextStage})`,
            }));
            addGrowthHistory(nextStage);
          }
        } else {
          set(() => ({
            log: "✨ 成熟段階に到達しました (Fully Matured!)",
          }));
        }
      },

      reset: () => {
        set(() => ({
          data: {
            currentStage: "spore(胞子)",
            parameters: {
              温度: 25,
              湿度: 70,
              栄養: 50,
              pH: 7,
            },
            discoveredFungus: undefined,
            autoGrow: false,
            autoGrowIntervalId: undefined,
            startAutoGrow: get().data.startAutoGrow,
            stopAutoGrow: get().data.stopAutoGrow,
            setDiscoveredFungus: get().data.setDiscoveredFungus,
          },
          log: "🔁 リセット完了 (Reset Complete)",
          growthHistory: [],
        }));
      },

      deleteGrowthHistory: (timestamp: Date) => {
        set((state) => ({
          growthHistory: state.growthHistory.filter(
            (entry) => entry.timestamp !== timestamp
          ),
        }));
      },
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
