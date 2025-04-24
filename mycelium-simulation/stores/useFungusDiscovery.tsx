import { useEffect } from "react";
import { Fungus } from "./MyceliumStore";

const useFungusDiscovery = (
  currentStage: string,
  setDiscoveredFungus: (fungus: Fungus) => void
) => {
  useEffect(() => {
    if (currentStage === "fruiting(子実体形成)") {
      const discoveredFungus = {
        name: "Example Fungus",
        description: "An example fungus discovered during fruiting.",
        imageUrl: "https://example.com/fungus.jpg",
      };
      setDiscoveredFungus(discoveredFungus);
    }
  }, [currentStage, setDiscoveredFungus]);
};

export default useFungusDiscovery;
