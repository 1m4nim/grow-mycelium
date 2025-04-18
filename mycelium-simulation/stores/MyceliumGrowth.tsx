import { useMyceliumStore } from "./myceliumStore";
import "./MyceliumGrowth.css";

const MyceliumGrowth = () => {
  const { data, setParameter, grow, reset } = useMyceliumStore();

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
        <label>
          Temperature:
          <input
            type="number"
            value={data.parameters.temperature}
            onChange={(e) =>
              handleParameterChange("temperature", Number(e.target.value))
            }
          />
        </label>
      </div>
      {/* 成長とリセットボタン */}
      <div>
        <button onClick={handleGrow}>成長</button>\
        <button onClick={handleReset}>リセット</button>
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
  );
};

export default MyceliumGrowth;
