// import React, { useEffect } from "react";
// import { useMyceliumStore } from "./MyceliumStore";

// const WikipediaInfo = () => {
//   const { discoveredFungus, fetchWikipediaInfo } = useMyceliumStore(
//     (state: any) => ({
//       discoveredFungus: state.data.discoveredFungus,
//       fetchWikipediaInfo: state.fetchWikipediaInfo,
//     })
//   );

//   useEffect(() => {
//     // コンポーネントがマウントされた時に Wikipedia のデータを取得
//     fetchWikipediaInfo("hyphae(菌糸)"); // 例として "hyphae(菌糸)" を取得
//   }, [fetchWikipediaInfo]);

//   if (!discoveredFungus) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div>
//       <h2>{discoveredFungus.name}</h2>
//       <p>{discoveredFungus.description}</p>
//       {discoveredFungus.imageUrl && (
//         <img src={discoveredFungus.imageUrl} alt={discoveredFungus.name} />
//       )}
//     </div>
//   );
// };

// export default WikipediaInfo;
