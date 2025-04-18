import { useMyceliumStore } from "./myceliumStore";

const MyComponent = () => {
  const { data, setParameter, grow, reset } = useMyceliumStore();

  // currentStageが変更されたか確認
  const handleGrow = () => {
    grow();
    console.log(data.currentStage); // 新しいステージが表示されるはず
  };

  return (
    <div>
      <p>Current Stage: {data.currentStage}</p>
      <button onClick={handleGrow}>Grow</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};
