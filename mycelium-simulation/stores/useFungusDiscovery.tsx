import { useEffect } from "react";
import { getRandomFungusFromWikipedia } from "./wikipedia";
import { translateToJapanese } from "./translator";

const useFungusDiscovery = (
  currentStage: string,
  setDiscoveredFungus: (fungus: any) => void
) => {
  useEffect(() => {
    if (currentStage === "fruiting") {
      const discoverFungus = async () => {
        const fungus = await getRandomFungusFromWikipedia();
        if (!fungus) return;

        const nameJa = await translateToJapanese(fungus.name);
        const descJa = await translateToJapanese(fungus.description);

        setDiscoveredFungus({
          name: nameJa,
          description: descJa,
          imageUrl: fungus.imageUrl,
        });
      };

      discoverFungus();
    }
  }, [currentStage]);
};

export default useFungusDiscovery;
