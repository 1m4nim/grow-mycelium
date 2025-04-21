// wikipedia.ts
export const getRandomFungusFromWikipedia = async () => {
  try {
    // ランダムな記事を10個取得
    const randomResp = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=random&rnnamespace=0&rnlimit=10`
    );
    const randomData = await randomResp.json();
    const randomPages = randomData.query.random;

    // 順にチェックしてキノコカテゴリがあるか探す
    for (const page of randomPages) {
      const title = page.title;

      const detailResp = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages|categories&exintro&explaintext&titles=${encodeURIComponent(
          title
        )}&format=json&origin=*`
      );
      const detailData = await detailResp.json();
      const pageData =
        detailData.query.pages[Object.keys(detailData.query.pages)[0]];

      const isFungi = pageData.categories?.some((cat: any) =>
        cat.title.includes("Fungi")
      );
      if (!isFungi) continue;

      return {
        name: pageData.title,
        description: pageData.extract,
        imageUrl: pageData.thumbnail?.source || "",
      };
    }

    return null;
  } catch (e) {
    console.error("Wikipedia fetch error:", e);
    return null;
  }
};
