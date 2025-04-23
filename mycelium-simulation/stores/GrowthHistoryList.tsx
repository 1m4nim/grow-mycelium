import React from "react";
import { GrowthHistoryEntry } from "./MyceliumGrowth";

// アイコンのマップ
const stageIcons: Record<string, string> = {
  "spore(胞子)": "🦠",
  "hyphae(菌糸)": "🌱",
  "mycelium(菌糸体)": "🕸️",
  "fruiting(子実体形成)": "🍄",
  "mature(成熟)": "🌕",
};

interface Props {
  history: GrowthHistoryEntry[];
}

const GrowthHistoryList: React.FC<Props> = ({ history }) => {
  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>🌿 成長履歴</h3>
      {history.length === 0 ? (
        <p>まだ履歴はありません。</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {history.map((entry, index) => (
            <li
              key={index}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
                backgroundColor: "#f9f9f9",
              }}
            >
              <strong>
                {stageIcons[entry.stage]} {entry.stage}
              </strong>
              <div>🕒 {entry.timestamp.toLocaleString()}</div>
              <ul style={{ marginTop: "0.5rem", paddingLeft: "1rem" }}>
                <li>🌡️ 温度: {entry.params.温度}℃</li>
                <li>💧 湿度: {entry.params.湿度}%</li>
                <li>🍽️ 栄養: {entry.params.栄養}</li>
                <li>⚗️ pH: {entry.params.pH}</li>
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GrowthHistoryList;
