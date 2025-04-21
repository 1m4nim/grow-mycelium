export const translateToJapanese = async (text: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_DEEPL_API_KEY;

  const response = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `auth_key=${apiKey}&text=${encodeURIComponent(text)}&target_lang=JA`,
  });

  const json = await response.json();
  return json.translations?.[0]?.text || text;
};
