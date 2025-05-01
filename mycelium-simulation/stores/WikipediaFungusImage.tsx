// WikipediaFungusImage.tsx
import React from "react";

type WikipediaFungusImageProps = {
  name: string;
};

const WikipediaFungusImage: React.FC<WikipediaFungusImageProps> = ({
  name,
}) => {
  return (
    <div>
      <img
        src={`https://en.wikipedia.org/wiki/File:${name.replace(
          /\s+/g,
          "_"
        )}.jpg`}
        alt={name}
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </div>
  );
};

export default WikipediaFungusImage;
