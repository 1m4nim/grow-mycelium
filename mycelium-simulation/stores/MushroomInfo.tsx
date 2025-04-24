import { getMushroomFromWikipedia } from "../utils/wikiFetcher";
import React, { useState } from "react";

const MushroomInfo: React.FC = () => {
  // ステートのパラメータ名を日本語に合わせて修正
  const [params, setParams] = useState({
    温度: 30,
    湿度: 85,
    栄養: 75,
    pH: 6,
  });
  const [exampleUsage, setExampleUsage] = useState("");

  const generateExampleUsage = async () => {
    const convertedParams = {
      temperature: params.温度,
      humidity: params.湿度,
      nutrition: params.栄養,
      pH: params.pH,
    };
    const mushroomInfo = await getMushroomFromWikipedia(convertedParams, "ja");

    if (mushroomInfo) {
      const usage = `
        **使用例**：

        この環境条件に基づき、キノコ情報を取得しました。
        - **温度**: ${params.温度}°C
        - **湿度**: ${params.湿度}%
        - **栄養状態**: ${params.栄養} (高栄養)
        - **pH**: ${params.pH}

        **キノコ情報**：
        - **タイトル**: ${mushroomInfo.title}
        - **説明**: ${mushroomInfo.description}
        - **画像URL**: ![キノコ画像](${mushroomInfo.imageUrl})

        この情報を参考に、環境に適したキノコの種類を調べることができます。`;

      setExampleUsage(usage);
    } else {
      setExampleUsage("キノコ情報が見つかりませんでした。");
    }
  };

  return (
    <div>
      <h1>キノコ情報</h1>
      <div>
        <label>温度:</label>
        <input
          type="number"
          value={params.温度} // 変更箇所：日本語で温度を参照
          onChange={(e) =>
            setParams((prev) => ({
              ...prev,
              温度: parseInt(e.target.value), // 変更箇所：日本語で温度を更新
            }))
          }
        />
      </div>
      <div>
        <label>湿度:</label>
        <input
          type="number"
          value={params.湿度} // 変更箇所：日本語で湿度を参照
          onChange={(e) =>
            setParams((prev) => ({
              ...prev,
              湿度: parseInt(e.target.value), // 変更箇所：日本語で湿度を更新
            }))
          }
        />
      </div>
      <div>
        <label>栄養状態:</label>
        <input
          type="number"
          value={params.栄養} // 変更箇所：日本語で栄養状態を参照
          onChange={(e) =>
            setParams((prev) => ({
              ...prev,
              栄養: parseInt(e.target.value), // 変更箇所：日本語で栄養状態を更新
            }))
          }
        />
      </div>
      <div>
        <label>pH:</label>
        <input
          type="number"
          value={params.pH}
          onChange={(e) =>
            setParams((prev) => ({
              ...prev,
              pH: parseInt(e.target.value),
            }))
          }
        />
      </div>
      <button onClick={generateExampleUsage}>使用例を生成</button>
      <div>
        <h2>使用例</h2>
        <pre>{exampleUsage}</pre>
      </div>
    </div>
  );
};

export default MushroomInfo;
