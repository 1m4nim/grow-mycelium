import React, { useState } from "react";
import { useMyceliumStore } from "./MyceliumStore";
import { GrowthEntry } from "./MyceliumStore";
import GrowthHistoryList from "./GrowthHistoryList"; // 追加したコンポーネント

const GrowthHistoryButton: React.FC = () => {
  const [showHistory, setShowHistory] = useState(false);
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
          width: "100%", // ボタンの幅を調整
        }}
      >
        {showHistory ? "履歴を閉じる" : "履歴を見る"}
      </button>

      {showHistory && (
        <div style={{ marginTop: "1rem" }}>
          {growthHistory.length === 0 ? (
            <p>履歴がありません。</p>
          ) : (
            <GrowthHistoryList history={growthHistory} />
          )}
        </div>
      )}
    </div>
  );
};

export default GrowthHistoryButton;
