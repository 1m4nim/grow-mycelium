import { useEffect } from "react";
import { getRandomFungusFromWikipedia } from "./wikipedia";
import { translateToJapanese } from "../utils/translate";

const useFungusDiscovery = (
  currentStage: string,
  setDiscoveredFungus: (fungus: any) => void
) => {
  useEffect(() => {
    if (currentStage === "fruiting") {
      const discoverFungus = async () => {
        try {
          const fungus = await getRandomFungusFromWikipedia();
          if (!fungus) {
            console.warn("キノコの情報が見つかりませんでした。");
            return;
          }

          const nameJa = await translateToJapanese(fungus.name);
          const descJa = await translateToJapanese(fungus.description);

          setDiscoveredFungus({
            name: nameJa,
            description: descJa,
            imageUrl: fungus.imageUrl,
          });
        } catch (error) {
          console.error("キノコの発見に失敗しました:", error);
        }
      };

      discoverFungus();
    }
  }, [currentStage, setDiscoveredFungus]);
};

export default useFungusDiscovery;
