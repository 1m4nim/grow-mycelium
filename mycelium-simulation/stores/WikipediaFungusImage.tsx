import React from "react";

type WikipediaFungusImageProps = {
  name: string;
  src: string;
};

const WikipediaFungusImage: React.FC<WikipediaFungusImageProps> = ({
  name,
  src,
}) => {
  if (!src) return null;

  return (
    <div>
      <img src={src} alt={name} style={{ maxWidth: "100%", height: "auto" }} />
    </div>
  );
};

export default WikipediaFungusImage;
