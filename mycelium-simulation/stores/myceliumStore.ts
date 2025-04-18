import { create } from "zustand";
import { persist } from "zustand/middleware";

type GrowthParameters = {
  temperature: number;
  humidity: number;
  nutrition: number;
  pH: number;
};

type GrowthStage = "spore" | "hyphae" | "mycelium" | "fruiting" | "mature";

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
  setParameter: (key: keyof GrowthParameters, value: number) => void; // 型を明示的にしたい
  grow: () => void;
  reset: () => void;
};

export const useMyceliumStore = create<MyceliumStore>()(
  persist<MyceliumStore>(
    (
      set: (fn: (state: MyceliumStore) => MyceliumStore) => void, //引数として渡される fn は、現在の状態を引数として受け取り、新しい状態を返す関数
      get: () => MyceliumStore //現在の状態を取得するために使う
    ) => ({
      data: {
        currentStage: "spore",
        parameters: {
          temperature: 25,
          humidity: 70,
          nutrition: 50,
          pH: 7,
        },
        discoveredFungus: undefined,
      },
      setParameter: (key: keyof GrowthParameters, value: number) =>
        void set((state) => ({
          //前の状態 (state) を元にして新しい状態を作る関数を渡す
          ...state,
          data: {
            ...state.data,
            parameters: {
              ...state.data.parameters,
              [key]: value,
            },
          },
        })),
      grow: () => {
        const stageOrder: GrowthStage[] = [
          "spore",
          "hyphae",
          "mycelium",
          "fruiting",
          "mature",
        ];
        const currentIndex = stageOrder.indexOf(get().data.currentStage); //現在のステージが配列の中で何番目かを調べている
        if (currentIndex < stageOrder.length - 1) {
          set((state) => ({
            ...state,
            data: {
              ...state.data,
              currentStage: stageOrder[currentIndex + 1],
            },
          }));
        }
      },
      reset: (): void =>
        set((state: MyceliumStore) => ({
          data: {
            currentStage: "spore",
            parameters: {
              temperature: 25,
              humidity: 70,
              nutrition: 50,
              pH: 7,
            },
            discoveredFungus: undefined,
          },
          grow: get().grow,
          reset: get().reset,
          setParameter: get().setParameter,
        })),
    }),
    { name: "mycelium-storage" }
  )
);
