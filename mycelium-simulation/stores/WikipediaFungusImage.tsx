import React, { useEffect, useState } from "react";

type Props = {
  name: string;
};

const WikipediaFungusImage: React.FC<Props> = ({ name }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;

    const fetchImageFromWikipedia = async (lang: "ja" | "en") => {
      try {
        const response = await fetch(
          `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
            name
          )}&prop=pageimages&format=json&pithumbsize=400&origin=*`
        );

        const data = await response.json();
        const pages = data.query.pages;
        const page = Object.values(pages)[0] as any;

        if (page?.thumbnail?.source) {
          return page.thumbnail.source;
        } else {
          return null;
        }
      } catch (error) {
        console.error(`${lang}版Wikipediaから画像取得失敗:`, error);
        return null;
      }
    };

    const fetchImage = async () => {
      console.log("Fetching image for:", name);
      const jaImage = await fetchImageFromWikipedia("ja");
      console.log("Japanese image URL:", jaImage);

      if (jaImage) {
        setImageUrl(jaImage);
      } else {
        const enImage = await fetchImageFromWikipedia("en");
        console.log("English image URL:", enImage);
        setImageUrl(enImage);
      }
    };

    fetchImage();
  }, [name]);

  return (
    <div>
      <h4>{name} の画像</h4>
      {imageUrl ? (
        <img src={imageUrl} alt={name} style={{ maxWidth: "100%" }} />
      ) : (
        <p>画像が見つかりませんでした</p>
      )}
    </div>
  );
};

export default WikipediaFungusImage;
