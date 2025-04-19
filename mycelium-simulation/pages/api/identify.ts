import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const fungusName = req.query.name as string;

  if (!fungusName) {
    return res.status(400).json({ error: "菌の名前を指定してください" });
  }

  try {
    const response = await fetch(
      `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        fungusName
      )}`
    );

    if (!response.ok) {
      return res.status(404).json({ error: "菌の情報が見つかりません" });
    }

    const data = await response.json();

    return res.status(200).json({
      title: data.title,
      description: data.extract,
      image: data.thumbnail?.source || null,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Wikipediaから情報の取得に失敗しました" });
  }
}
