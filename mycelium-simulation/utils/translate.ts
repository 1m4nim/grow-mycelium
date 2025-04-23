export const translateToJapanese = async (text: string): Promise<string> => {
  try {
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;

    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          q: text,
          target: "ja",
        }),
      }
    );

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error("翻訳に失敗しました:", error);
    return text; // 翻訳できない場合はそのまま返す
  }
};
