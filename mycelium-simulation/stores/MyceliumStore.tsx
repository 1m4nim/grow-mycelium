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
  isGrowing: boolean;
  setParameter: (key: keyof Parameters, value: number) => void;
  setLog: (msg: string) => void;
  grow: () => Promise<void>;
  reset: () => void;
  deleteGrowthHistory: (timestamp: Date) => void;
};

export const fetchFungusData = async (): Promise<Fungus> => {
  const categoryUrl = "https://en.wikipedia.org/w/api.php";
  const categoryParams = new URLSearchParams({
    action: "query",
    format: "json",
    list: "categorymembers",
    cmtitle: "Category:Edible_mushrooms", // Edible mushrooms category
    cmlimit: "50", // Limit to 50 pages
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
    console.error("Wikipedia category fetch error:", error);

    return {
      name: "Unknown Fungus",
      description: "Unable to fetch data.",
      imageUrl: "",
    };
  }
};

// persist with types
type MyceliumPersist = (
  config: StateCreator<MyceliumStore>,
  options: PersistOptions<MyceliumStore, Partial<MyceliumStore>>
) => StateCreator<MyceliumStore>;

// Zustand + persist store
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

      log: "Growing Start 🍄 Start Growing!",
      growthHistory: [],
      isGrowing: false, // ← Added here

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
        if (get().isGrowing) return; // Ignore if already growing
        set({ isGrowing: true }); // Set as growing

        const data = get().data;
        const stageOrder: GrowthStage[] = [
          "spore(胞子)",
          "hyphae(菌糸)",
          "mycelium(菌糸体)",
          "fruiting(子実体形成)",
          "mature(成熟)",
        ];
        const currentIndex = stageOrder.indexOf(data.currentStage);

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

        if (currentIndex < stageOrder.length - 1) {
          const nextStage = stageOrder[currentIndex + 1];

          if (nextStage === "fruiting(子実体形成)") {
            setTimeout(async () => {
              const randomFungus = await fetchFungusData();
              set((state) => ({
                data: {
                  ...state.data,
                  currentStage: nextStage,
                  discoveredFungus: randomFungus,
                },
                log: `🍄 Fruiting Stage! Discovered: ${randomFungus.name}`,
                isGrowing: false,
              }));
              addGrowthHistory(nextStage);
            }, 60000);
          } else {
            set((state) => ({
              data: {
                ...state.data,
                currentStage: nextStage,
              },
              log: `✅ Growth Stage: ${nextStage} (Grew to ${nextStage})`,
            }));
            addGrowthHistory(nextStage);

            // Stop autoGrow when reaching mature stage
            if (nextStage === "mature(成熟)") {
              get().data.stopAutoGrow();
            }

            set({ isGrowing: false });
          }
        } else {
          set(() => ({
            log: "✨ Reached mature stage (Fully Matured!)",
            isGrowing: false,
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
          log: "🔁 Reset Complete",
          growthHistory: [],
          isGrowing: false, // ← Reset to false
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
