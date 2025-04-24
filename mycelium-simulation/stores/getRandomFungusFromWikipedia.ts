export const getRandomFungusFromWikipedia = async () => {
  const response = await fetch(
    "https://en.wikipedia.org/api/rest_v1/page/random/summary"
  );
  const data = await response.json();

  const title = data.title.toLowerCase();
  const extract = data.extract.toLowerCase();

  const keywords = [
    "fungus",
    "mushroom",
    "basidiomycota",
    "ascomycota",
    "mycelium",
  ];

  const isFungusRelated = keywords.some((word) => {
    return title.includes(word) || extract.includes(word);
  });

  if (!isFungusRelated) return null;

  return {
    name: data.title,
    description: data.extract,
    imageUrl: data.thumbnail?.source || "",
  };
};
