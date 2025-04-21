import React, { useEffect, useState } from "react";

const WikiSearch = () => {
  const [results, setResults] = useState<{ ja: any[]; en: any[] }>({
    ja: [],
    en: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 日本語版
        const responseJa = await fetch(
          `https://ja.wikipedia.org/w/api.php?action=query&list=search&srsearch=キノコ&format=json&origin=*&prop=extracts|pageimages&exintro=&explaintext=&piprop=thumbnail&pithumbsize=200`
        );
        const jsonJa = await responseJa.json();

        // 英語版
        const responseEn = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=fungus&format=json&origin=*&prop=extracts|pageimages&exintro=&explaintext=&piprop=thumbnail&pithumbsize=200`
        );
        const jsonEn = await responseEn.json();

        // 日本語版と英語版の情報をマージ
        const mergedResults = {
          ja: jsonJa.query.search,
          en: jsonEn.query.search,
        };

        setResults(mergedResults);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>日本語版結果</h2>
      <ul>
        {results.ja.map((item, index) => (
          <li key={index}>
            <h3>{item.title}</h3>
            {item.thumbnail && item.thumbnail.source && (
              <img src={item.thumbnail.source} alt={item.title} />
            )}
            <p>{item.snippet}</p>
          </li>
        ))}
      </ul>

      <h2>英語版結果</h2>
      <ul>
        {results.en.map((item, index) => (
          <li key={index}>
            <h3>{item.title}</h3>
            {item.thumbnail && item.thumbnail.source && (
              <img src={item.thumbnail.source} alt={item.title} />
            )}
            <p>{item.snippet}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WikiSearch;
