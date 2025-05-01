export const translateToJapanese = async (text: string): Promise<string> => {
  const response = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "8ded8e94-0948-4df3-996f-08e80de9dcaf:fx",
    },
    body: new URLSearchParams({
      text,
      target_lang: "JA",
    }),
  });

  const data = await response.json();

  if (data.translations && data.translations.length > 0) {
    return data.translations[0].text;
  } else {
    throw new Error("翻訳に失敗しました");
  }
};
