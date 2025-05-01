import { useEffect, useState } from "react";
import { translateToJapanese } from "../utils/translateToJapanese";

type WikipediaPage = {
  title: string;
  pageid: number;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
};

type WikipediaApiResponse = {
  query: {
    pages: Record<string, WikipediaPage>;
  };
};

export const FungusInfo = ({ fungusName }: { fungusName: string }) => {
  const [info, setInfo] = useState<{
    image: string;
    descriptionJa: string;
    descriptionEn: string;
  } | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      const res = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro&explaintext&format=json&titles=${fungusName}&origin=*`
      );
      const data: WikipediaApiResponse = await res.json();
      const page = Object.values(data.query.pages)[0]; // pageの型はWikipediaPageです
      const descriptionEn = page.extract || "No English description found.";
      const image = page.thumbnail?.source || "";

      // 英語の説明がない場合は、「見つかりません」というメッセージを設定
      const descriptionJa =
        page.extract && page.extract !== ""
          ? await translateToJapanese(page.extract)
          : "説明が見つかりません";

      setInfo({ image, descriptionEn, descriptionJa });
    };

    fetchInfo();
  }, [fungusName]);

  if (!info) return <div>読み込み中...</div>;

  return (
    <div>
      <h2>{fungusName}</h2>
      {info.image && <img src={info.image} alt={fungusName} width={300} />}
      <h3>日本語の説明</h3>
      <p>{info.descriptionJa}</p>
      <h3>英語の説明</h3>
      <p>{info.descriptionEn}</p>
    </div>
  );
};
