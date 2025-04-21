import React, { useState } from "react";
import { useMyceliumStore } from "./MyceliumStore";
import { GrowthEntry } from "./MyceliumStore";

const GrowthHistoryButton: React.FC = () => {
  const [showHistory, setShowHistory] = useState(false);
  // const { growthHistory, deleteGrowthHistory } = useMyceliumStore((state) => ({
  // growthHistory: state.growthHistory,
  // deleteGrowthHistory: state.deleteGrowthHistory,
  const growthHistory = useMyceliumStore((state) => state.growthHistory);
  const deleteGrowthHistory = useMyceliumStore(
    (state) => state.deleteGrowthHistory
  );

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };
  const handleDelete = (timestamp: Date) => {
    deleteGrowthHistory(timestamp);
  };

  const renderHistory = () => {
    if (growthHistory.length === 0) {
      return <div>履歴がないよ！</div>;
    }

    return (
      <div>
        <h3>成長の履歴</h3>
        <ul>
          {growthHistory.map((entry: GrowthEntry, index) => (
            <li key={index} style={{ marginBottom: "1em" }}>
              <strong>ステージ:</strong> {entry.stage} <br />
              <strong>温度:</strong> {entry.params.温度}°C <br />
              <strong>湿度:</strong> {entry.params.湿度}% <br />
              <strong>栄養:</strong> {entry.params.栄養} <br />
              <strong>pH:</strong> {entry.params.pH} <br />
              <strong>日時:</strong>{" "}
              {new Date(entry.timestamp).toLocaleString()} <br />
              <button onClick={() => handleDelete(entry.timestamp)}>
                履歴を削除
              </button>
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
          marginBottom: "10px",
        }}
      >
        {showHistory ? "履歴を閉じる" : "履歴を見る"}
      </button>
      {showHistory && renderHistory()}
    </div>
  );
};

export default GrowthHistoryButton;
