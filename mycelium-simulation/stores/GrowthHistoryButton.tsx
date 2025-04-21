import React, { useState } from "react";
import { useMyceliumStore } from "./MyceliumStore"; // こちらから growthHistory を取得する

const GrowthHistoryButton: React.FC = () => {
  const [showHistory, setShowHistory] = useState(false);
  const growthHistory = useMyceliumStore((state) => state.growthHistory); // ✅ Zustand store から取得

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const renderHistory = () => {
    if (growthHistory.length === 0) {
      return <div>履歴がないよ！</div>;
    }

    return (
      <div>
        <h3>成長の履歴</h3>
        <ul>
          {growthHistory.map((entry, index) => (
            <li key={index} style={{ marginBottom: "1em" }}>
              <strong>ステージ:</strong> {entry.stage} <br />
              <strong>気温:</strong> {entry.params.temperature}°C <br />
              <strong>湿度:</strong> {entry.params.humidity}% <br />
              <strong>栄養:</strong> {entry.params.nutrition}% <br />
              <strong>pH:</strong> {entry.params.pH} <br />
              <strong>日時:</strong>{" "}
              {new Date(entry.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div>
      <button
        onClick={toggleHistory}
        style={{
          backgroundColor: "#868333",
          color: "white",
          padding: "8px 12px",
          border: "none",
          borderRadius: "4px",
        }}
      >
        {showHistory ? "履歴を閉じる" : "履歴を見る"}
      </button>
      {showHistory && renderHistory()}
    </div>
  );
};

export default GrowthHistoryButton;
