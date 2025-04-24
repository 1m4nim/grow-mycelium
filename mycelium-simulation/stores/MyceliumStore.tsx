import { create } from "zustand";

// 型定義
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
  params: Parameters;
  timestamp: Date;
};

export type MyceliumStore = {
  data: {
    currentStage: GrowthStage;
    parameters: Parameters;
    discoveredFungus?: Fungus;
    autoGrow: boolean;
    autoGrowIntervalId?: number;
  };
  log: string;
  growthHistory: GrowthEntry[];
  isGrowing: boolean;
  setParameter: (key: keyof Parameters, value: number) => void;
  setLog: (msg: string) => void;
  grow: () => Promise<void>;
  reset: () => void;
  deleteGrowthHistory: (timestamp: Date) => void;
  fetchWikipediaInfo: (title: string) => Promise<void>;
};

// デフォルトデータ
const defaultData = {
  currentStage: "spore(胞子)" as GrowthStage,
  parameters: {
    温度: 25,
    湿度: 50,
    栄養: 10,
    pH: 7,
  },
  autoGrow: false,
  autoGrowIntervalId: undefined,
};

export const useMyceliumStore = create<MyceliumStore>((set) => ({
  data: defaultData,
  log: "",
  growthHistory: [],
  isGrowing: false,

  setParameter: (key, value) =>
    set((state) => {
      const newData = { ...state.data };
      newData.parameters[key] = value;
      return { data: newData };
    }),

  setLog: (msg) => set({ log: msg }),

  grow: async () => {
    set({ isGrowing: true });

    // ステージの遷移
    const nextStage = {
      "spore(胞子)": "hyphae(菌糸)",
      "hyphae(菌糸)": "mycelium(菌糸体)",
      "mycelium(菌糸体)": "fruiting(子実体形成)",
      "fruiting(子実体形成)": "mature(成熟)",
      "mature(成熟)": "mature(成熟)", // 成熟の後は進まない
    };

    // 現在のステージから次のステージへ遷移
    set((state) => {
      const next = nextStage[state.data.currentStage as GrowthStage];
      const newEntry: GrowthEntry = {
        stage: next as GrowthStage,
        params: state.data.parameters,
        timestamp: new Date(),
      };
      return {
        data: {
          ...state.data,
          currentStage: next as GrowthStage,
        },
        growthHistory: [...state.growthHistory, newEntry],
        isGrowing: false,
      };
    });
  },

  reset: () =>
    set((state) => {
      if (state.data.autoGrowIntervalId) {
        clearInterval(state.data.autoGrowIntervalId);
      }
      return {
        data: { ...defaultData },
        log: "",
        growthHistory: [],
        isGrowing: false,
      };
    }),

  deleteGrowthHistory: (timestamp: Date) =>
    set((state) => ({
      growthHistory: state.growthHistory.filter(
        (entry) => entry.timestamp !== timestamp
      ),
    })),

  fetchWikipediaInfo: async (title: string) => {
    try {
      const response = await fetch(
        `http://localhost:3001/fetch-wikipedia?title=${title}`
      );
      const data = await response.json();
      const page = data.query.pages;
      const pageId = Object.keys(page)[0];
      const extract = page[pageId].extract;
      const imageUrl = page[pageId].thumbnail?.source || ""; // Wikipediaの画像URLを動的に取得

      // 各ステージごとに説明と画像を設定
      let fungusInfo = { name: "", description: "", imageUrl: "" };

      if (title === "spore(胞子)") {
        fungusInfo = {
          name: "Spore (胞子)",
          description: extract,
          imageUrl: "https://example.com/spore-image.jpg", // Wikipediaから画像URLを取得
        };
      } else if (title === "hyphae(菌糸)") {
        fungusInfo = {
          name: "Hyphae (菌糸)",
          description: extract,
          imageUrl: "https://example.com/hyphae-image.jpg",
        };
      } else if (title === "mycelium(菌糸体)") {
        fungusInfo = {
          name: "Mycelium (菌糸体)",
          description: extract,
          imageUrl: "https://example.com/mycelium-image.jpg",
        };
      } else if (title === "fruiting(子実体形成)") {
        fungusInfo = {
          name: "Fruiting (子実体形成)",
          description: extract,
          imageUrl: "https://example.com/fruiting-image.jpg",
        };
      } else if (title === "mature(成熟)") {
        fungusInfo = {
          name: "Mature (成熟)",
          description: extract,
          imageUrl: "https://example.com/mature-image.jpg",
        };
      }

      // `discoveredFungus`に情報を設定
      set((state) => ({
        data: {
          ...state.data,
          discoveredFungus: fungusInfo,
        },
      }));
    } catch (error) {
      console.error("Error fetching Wikipedia info:", error);
    }
  },
}));
