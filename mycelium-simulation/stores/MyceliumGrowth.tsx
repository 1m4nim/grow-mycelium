import { useMyceliumStore } from "./MyceliumStore";
import "./MyceliumGrowth.css";
import { useEffect } from "react";

const MyceliumGrowth = () => {
  const { data, setParameter, grow, reset } = useMyceliumStore();

  useEffect(() => {
    const interval = setInterval(() => {
      grow();
    }, 5000);

    return () => clearInterval(interval);
  }, [grow]);

  // パラメータを変更するハンドラー
  const handleParameterChange = (
    param: keyof typeof data.parameters,
    value: number
  ) => {
    setParameter(param, value);
  };

  const handleGrow = () => {
    grow();
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="mycelium-growth-container">
      <h1>菌類を育てよう</h1>
      {/*現在のステージ*/}
      <div>
        <h2>現在のステージ:{data.currentStage}</h2>
      </div>

      {/*パラメータ*/}
      <div>
        <h3>成長パラメーター</h3>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            🌡️ 温度: {data.parameters.temperature}℃
          </label>
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            value={data.parameters.temperature}
            onChange={(e) =>
              handleParameterChange("temperature", Number(e.target.value))
            }
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            💧 湿度: {data.parameters.humidity}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={data.parameters.humidity}
            onChange={(e) =>
              handleParameterChange("humidity", Number(e.target.value))
            }
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            🍽️ 栄養: {data.parameters.nutrition}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={data.parameters.nutrition}
            onChange={(e) =>
              handleParameterChange("nutrition", Number(e.target.value))
            }
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            ⚗️ pH: {data.parameters.pH}
          </label>
          <input
            type="range"
            min={0}
            max={14}
            step={0.1}
            value={data.parameters.pH}
            onChange={(e) =>
              handleParameterChange("pH", Number(e.target.value))
            }
            style={{ width: "100%" }}
          />
        </div>

        {/* 成長とリセットボタン */}
        <div>
          <button onClick={handleGrow}>成長中</button>
          {data.currentStage.includes("mature") && (
            <button onClick={reset} style={{ marginTop: "1rem" }}>
              🔁 リセット
            </button>
          )}
        </div>

        {/* 発見されたキノコ情報 */}
        {data.discoveredFungus && (
          <div>
            <h3> 発見されたキノコ</h3>
            <p>名前:{data.discoveredFungus.name}</p>
            <p>レア度:{data.discoveredFungus.rarity}</p>
            <p>説明:{data.discoveredFungus.imageUrl}</p>
            <img
              src={data.discoveredFungus.imageUrl}
              alt={data.discoveredFungus.name}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyceliumGrowth;
