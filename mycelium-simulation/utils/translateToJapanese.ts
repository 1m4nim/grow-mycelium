export const translateToJapanese = async (text: string): Promise<string> => {
  const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          target: "ja",
          format: "text",
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Google翻訳APIエラー:", data.error);
      return text;
    }

    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error("翻訳に失敗しました:", error);
    return text;
  }
};
