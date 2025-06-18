// "use client";

// import { useEffect, useState } from "react";
// import { Sword, Shield, Star, Coins, ShoppingCart, Lock } from "lucide-react";
// import Image from "next/image";
// import { useSession } from "next-auth/react";
// import { getCurrentCoin } from "@/actions/user/status/coin/getCurrentCoin";
// import { reduceCoin } from "@/actions/user/status/coin/reduceCoin";

// interface Equipment {
//   id: string;
//   name: string;
//   image: string;
//   type: "weapon" | "armor" | "accessory";
//   attack?: number;
//   defense?: number;
//   price: number;
//   owned: boolean;
//   equipped: boolean;
//   description: string;
// }

// const equipmentData: Equipment[] = [
//   {
//     id: "1",
//     name: "魔法の剣",
//     image: "/weapon.jpeg",
//     type: "weapon",
//     attack: 85,
//     price: 120,
//     owned: true,
//     equipped: true,
//     description: "古代の魔法が込められた強力な剣",
//   },
//   {
//     id: "2",
//     name: "竜鱗の盾",
//     image: "/guard.png",
//     type: "armor",
//     defense: 120,
//     price: 250,
//     owned: true,
//     equipped: false,
//     description: "伝説の竜の鱗で作られた最強の盾",
//   },
//   {
//     id: "3",
//     name: "雷神の指輪",
//     image: "/spark.png",
//     type: "accessory",
//     attack: 25,
//     price: 1,
//     owned: false,
//     equipped: false,
//     description: "雷の力を宿した神秘的な指輪",
//   },
//   {
//     id: "4",
//     name: "氷結の杖",
//     image: "/ice.png",
//     type: "weapon",
//     attack: 45,
//     price: 180,
//     owned: false,
//     equipped: false,
//     description: "氷の魔法を極めた者だけが使える杖",
//   },
//   {
//     id: "5",
//     name: "森の守護鎧",
//     image: "/forest.png",
//     type: "armor",
//     defense: 75,
//     price: 100,
//     owned: true,
//     equipped: false,
//     description: "森の精霊に祝福された軽量な鎧",
//   },
//   {
//     id: "6",
//     name: "闇の短剣",
//     image: "/dark.jpeg",
//     type: "weapon",
//     attack: 110,
//     price: 300,
//     owned: false,
//     equipped: false,
//     description: "闇の力を操る伝説の暗殺者の武器",
//   },
// ];

// const typeIcons = {
//   weapon: <Sword className="w-4 h-4" style={{ imageRendering: "pixelated" }} />,
//   armor: <Shield className="w-4 h-4" style={{ imageRendering: "pixelated" }} />,
//   accessory: (
//     <Star className="w-4 h-4" style={{ imageRendering: "pixelated" }} />
//   ),
// };

// export default function EquipmentShop() {
//   const [selectedTab, setSelectedTab] = useState("all");
//   const [coins, setCoins] = useState<number>(0);
//   const [equipment, setEquipment] = useState(equipmentData);

//   const { data: session } = useSession();

//   const handlePurchase = async (id: string) => {
//     const item = equipment.find((eq) => eq.id === id);
//     if (item && coins >= item.price && session?.user?.email) {
//       await reduceCoin(session.user.email, item.price);
//       const currentCoin = await getCurrentCoin(session.user.email);
//       setCoins(currentCoin || 0);
//       setEquipment(
//         equipment.map((eq) => (eq.id === id ? { ...eq, owned: true } : eq))
//       );
//     }
//   };

//   useEffect(() => {
//     const fetchCoin = async () => {
//       if (session?.user?.email) {
//         const currentCoin = await getCurrentCoin(session.user.email);
//         setCoins(currentCoin || 0);
//       }
//     };
//     fetchCoin();
//   }, [session]);

//   const handleEquip = (id: string) => {
//     const item = equipment.find((eq) => eq.id === id);
//     if (item && item.owned) {
//       setEquipment(
//         equipment.map((eq) => {
//           if (eq.type === item.type) {
//             return { ...eq, equipped: eq.id === id };
//           }
//           return eq;
//         })
//       );
//     }
//   };

//   const filteredEquipment = equipment.filter((item) => {
//     if (selectedTab === "all") return true;
//     return item.type === selectedTab;
//   });

//   return (
//     <div
//       className="min-h-screen p-4 font-mono relative"
//       style={{
//         fontFamily: '"Courier New", monospace',
//         fontSize: "14px",
//         imageRendering: "pixelated",
//         background:
//           "linear-gradient(45deg, #1e40af 0%, #7c3aed 25%, #059669 50%, #dc2626 75%, #ea580c 100%)",
//         backgroundSize: "400% 400%",
//         animation: "gradientShift 8s ease infinite",
//       }}>
//       <style jsx>{`
//         @keyframes gradientShift {
//           0% {
//             background-position: 0% 50%;
//           }
//           50% {
//             background-position: 100% 50%;
//           }
//           100% {
//             background-position: 0% 50%;
//           }
//         }

//         .pixel-border {
//           border-style: solid;
//           image-rendering: pixelated;
//         }

//         .pixel-text {
//           font-family: "Courier New", monospace;
//           font-weight: bold;
//           text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.8);
//         }
//       `}</style>

//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <div
//             className="border-4 p-6 pixel-border"
//             style={{
//               backgroundColor: "#dc2626",
//               borderColor: "#fbbf24",
//               boxShadow: "6px 6px 0px #991b1b, 12px 12px 0px rgba(0,0,0,0.6)",
//             }}>
//             <div className="flex items-center justify-between">
//               <h1 className="text-4xl font-bold text-white flex items-center gap-3 pixel-text">
//                 <ShoppingCart
//                   className="w-10 h-10"
//                   style={{ imageRendering: "pixelated" }}
//                 />
//                 装備ショップ
//               </h1>
//               <div
//                 className="flex items-center gap-3 px-6 py-3 border-3 text-orange-900 font-bold text-xl"
//                 style={{
//                   backgroundColor: "#fbbf24",
//                   borderColor: "#f59e0b",
//                   boxShadow: "3px 3px 0px #d97706, 6px 6px 0px rgba(0,0,0,0.4)",
//                 }}>
//                 <Coins
//                   className="w-7 h-7"
//                   style={{ imageRendering: "pixelated" }}
//                 />
//                 <span className="pixel-text">{coins.toLocaleString()}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="mb-6">
//           <div className="grid grid-cols-4 gap-4">
//             {[
//               {
//                 value: "all",
//                 label: "すべて",
//                 color: "#8b5cf6",
//                 shadow: "#7c3aed",
//               },
//               {
//                 value: "weapon",
//                 label: "武器",
//                 color: "#ef4444",
//                 shadow: "#dc2626",
//               },
//               {
//                 value: "armor",
//                 label: "防具",
//                 color: "#3b82f6",
//                 shadow: "#1d4ed8",
//               },
//               {
//                 value: "accessory",
//                 label: "アクセサリー",
//                 color: "#22c55e",
//                 shadow: "#16a34a",
//               },
//             ].map((tab) => (
//               <button
//                 key={tab.value}
//                 onClick={() => setSelectedTab(tab.value)}
//                 className="p-4 border-4 font-bold text-white pixel-text text-lg"
//                 style={{
//                   backgroundColor:
//                     selectedTab === tab.value ? tab.color : "#4b5563",
//                   borderColor:
//                     selectedTab === tab.value ? "#ffffff" : "#6b7280",
//                   boxShadow:
//                     selectedTab === tab.value
//                       ? `4px 4px 0px ${tab.shadow}, 8px 8px 0px rgba(0,0,0,0.4)`
//                       : "3px 3px 0px #374151, 6px 6px 0px rgba(0,0,0,0.3)",
//                   cursor: "pointer",
//                   transition: "all 0.1s ease",
//                 }}>
//                 {tab.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Equipment Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredEquipment.map((item) => (
//             <div
//               key={item.id}
//               className="relative pixel-border"
//               style={{
//                 backgroundColor: "#1f2937",
//                 borderWidth: "5px",
//                 borderColor: item.owned ? "#10b981" : "#6b7280",
//                 boxShadow: item.owned
//                   ? "6px 6px 0px #059669, 12px 12px 0px rgba(0,0,0,0.5)"
//                   : "4px 4px 0px #374151, 8px 8px 0px rgba(0,0,0,0.4)",
//                 opacity: !item.owned ? 0.8 : 1,
//               }}>
//               {/* Lock Overlay */}
//               {!item.owned && (
//                 <div
//                   className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4"
//                   style={{
//                     backgroundColor: "rgba(0,0,0,0.8)",
//                     backdropFilter: "none",
//                   }}>
//                   <div className="text-center mb-4">
//                     <Lock
//                       className="w-20 h-20 text-red-400 mx-auto mb-3"
//                       style={{ imageRendering: "pixelated" }}
//                     />
//                     <span className="text-red-400 font-bold pixel-text text-xl">
//                       LOCKED
//                     </span>
//                   </div>
//                   <button
//                     onClick={() => handlePurchase(item.id)}
//                     disabled={coins < item.price}
//                     className="px-6 py-3 border-4 font-bold pixel-text text-lg"
//                     style={{
//                       backgroundColor:
//                         coins >= item.price ? "#22c55e" : "#6b7280",
//                       borderColor: coins >= item.price ? "#16a34a" : "#4b5563",
//                       color: "white",
//                       boxShadow:
//                         coins >= item.price
//                           ? "4px 4px 0px #15803d, 8px 8px 0px rgba(0,0,0,0.4)"
//                           : "3px 3px 0px #374151, 6px 6px 0px rgba(0,0,0,0.3)",
//                       cursor: coins >= item.price ? "pointer" : "not-allowed",
//                     }}>
//                     購入する
//                   </button>
//                 </div>
//               )}

//               <div className="p-6">
//                 {/* Equipment Image */}
//                 <div className="mb-4 flex justify-center">
//                   <div
//                     className="border-3 p-3"
//                     style={{
//                       backgroundColor: "#374151",
//                       borderColor: "#6b7280",
//                       boxShadow:
//                         "2px 2px 0px #1f2937, 4px 4px 0px rgba(0,0,0,0.3)",
//                     }}>
//                     <Image
//                       src={item.image}
//                       alt={item.name}
//                       width={80}
//                       height={80}
//                       className="pixel-border"
//                       style={{
//                         imageRendering: "pixelated",
//                         borderWidth: "2px",
//                         borderColor: "#9ca3af",
//                       }}
//                     />
//                   </div>
//                 </div>

//                 {/* Header */}
//                 <div className="mb-4">
//                   <div className="flex items-center gap-2 mb-2">
//                     {typeIcons[item.type]}
//                     <h3 className="text-xl font-bold text-white pixel-text">
//                       {item.name}
//                     </h3>
//                   </div>
//                 </div>

//                 <p className="text-white text-opacity-90 text-sm mb-4 pixel-text leading-relaxed">
//                   {item.description}
//                 </p>

//                 {/* Stats */}
//                 <div className="space-y-3 mb-5">
//                   {item.attack && (
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2 text-white text-sm pixel-text">
//                         <Sword
//                           className="w-5 h-5 text-red-300"
//                           style={{ imageRendering: "pixelated" }}
//                         />
//                         <span>攻撃力</span>
//                       </div>
//                       <div className="flex items-center gap-3">
//                         <div
//                           className="w-24 h-4 border-2 overflow-hidden"
//                           style={{
//                             backgroundColor: "rgba(0,0,0,0.6)",
//                             borderColor: "rgba(255,255,255,0.4)",
//                           }}>
//                           <div
//                             className="h-full"
//                             style={{
//                               width: `${(item.attack / 120) * 100}%`,
//                               backgroundColor: "#ef4444",
//                               boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
//                             }}
//                           />
//                         </div>
//                         <span className="text-white font-bold text-lg w-10 text-right pixel-text">
//                           {item.attack}
//                         </span>
//                       </div>
//                     </div>
//                   )}

//                   {item.defense && (
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2 text-white text-sm pixel-text">
//                         <Shield
//                           className="w-5 h-5 text-blue-300"
//                           style={{ imageRendering: "pixelated" }}
//                         />
//                         <span>防御力</span>
//                       </div>
//                       <div className="flex items-center gap-3">
//                         <div
//                           className="w-24 h-4 border-2 overflow-hidden"
//                           style={{
//                             backgroundColor: "rgba(0,0,0,0.6)",
//                             borderColor: "rgba(255,255,255,0.4)",
//                           }}>
//                           <div
//                             className="h-full"
//                             style={{
//                               width: `${(item.defense / 120) * 100}%`,
//                               backgroundColor: "#3b82f6",
//                               boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
//                             }}
//                           />
//                         </div>
//                         <span className="text-white font-bold text-lg w-10 text-right pixel-text">
//                           {item.defense}
//                         </span>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Price and Actions */}
//                 <div
//                   className="border-t-3 pt-4"
//                   style={{
//                     borderColor: "rgba(255,255,255,0.3)",
//                   }}>
//                   <div className="flex items-center gap-2 mb-4">
//                     <Coins
//                       className="w-6 h-6 text-yellow-300"
//                       style={{ imageRendering: "pixelated" }}
//                     />
//                     <span className="font-bold text-white text-xl pixel-text">
//                       {item.price.toLocaleString()}
//                     </span>
//                   </div>

//                   {!item.owned ? (
//                     <button
//                       onClick={() => handlePurchase(item.id)}
//                       disabled={coins < item.price}
//                       className="w-full p-4 border-4 font-bold pixel-text text-lg"
//                       style={{
//                         backgroundColor:
//                           coins >= item.price ? "#22c55e" : "#6b7280",
//                         borderColor:
//                           coins >= item.price ? "#16a34a" : "#4b5563",
//                         color: "white",
//                         boxShadow:
//                           coins >= item.price
//                             ? "4px 4px 0px #15803d, 8px 8px 0px rgba(0,0,0,0.4)"
//                             : "3px 3px 0px #374151, 6px 6px 0px rgba(0,0,0,0.3)",
//                         cursor: coins >= item.price ? "pointer" : "not-allowed",
//                       }}>
//                       装備
//                     </button>
//                   ) : (
//                     <button
//                       onClick={() => handleEquip(item.id)}
//                       className="w-full p-4 border-4 font-bold pixel-text text-lg"
//                       style={{
//                         backgroundColor: item.owned
//                           ? item.equipped
//                             ? "#6b7280"
//                             : "#3b82f6"
//                           : "#6b7280",
//                         borderColor: item.owned
//                           ? item.equipped
//                             ? "#4b5563"
//                             : "#1d4ed8"
//                           : "#4b5563",
//                         color: "white",
//                         boxShadow:
//                           item.equipped && coins >= item.price
//                             ? "4px 4px 0px #1e40af, 8px 8px 0px rgba(0,0,0,0.4)"
//                             : "3px 3px 0px #374151, 6px 6px 0px rgba(0,0,0,0.3)",
//                         cursor: "pointer",
//                       }}>
//                       装備
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { Sword, Shield, Star, Coins, ShoppingCart, Lock } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { getCurrentCoin } from "@/actions/user/status/coin/getCurrentCoin";
import { reduceCoin } from "@/actions/user/status/coin/reduceCoin";

/* ---------- 型定義 ---------- */
interface Equipment {
  id: string;
  name: string;
  image: string;
  type: "weapon" | "armor" | "accessory";
  attack?: number;
  defense?: number;
  price: number;
  owned: boolean;
  equipped: boolean;
  description: string;
}

/* ---------- ダミーデータ ---------- */
const equipmentData: Equipment[] = [
  {
    id: "1",
    name: "魔法の剣",
    image: "/weapon.jpeg",
    type: "weapon",
    attack: 85,
    price: 120,
    owned: true,
    equipped: true,
    description: "古代の魔法が込められた強力な剣",
  },
  {
    id: "2",
    name: "竜鱗の盾",
    image: "/guard.png",
    type: "armor",
    defense: 120,
    price: 250,
    owned: true,
    equipped: false,
    description: "伝説の竜の鱗で作られた最強の盾",
  },
  {
    id: "3",
    name: "雷神の指輪",
    image: "/spark.png",
    type: "accessory",
    attack: 25,
    price: 1,
    owned: false,
    equipped: false,
    description: "雷の力を宿した神秘的な指輪",
  },
  {
    id: "4",
    name: "氷結の杖",
    image: "/ice.png",
    type: "weapon",
    attack: 45,
    price: 180,
    owned: false,
    equipped: false,
    description: "氷の魔法を極めた者だけが使える杖",
  },
  {
    id: "5",
    name: "森の守護鎧",
    image: "/forest.png",
    type: "armor",
    defense: 75,
    price: 100,
    owned: true,
    equipped: false,
    description: "森の精霊に祝福された軽量な鎧",
  },
  {
    id: "6",
    name: "闇の短剣",
    image: "/dark.jpeg",
    type: "weapon",
    attack: 110,
    price: 300,
    owned: false,
    equipped: false,
    description: "闇の力を操る伝説の暗殺者の武器",
  },
];

/* ---------- アイコン ---------- */
const typeIcons = {
  weapon: <Sword className="w-4 h-4" style={{ imageRendering: "pixelated" }} />,
  armor: <Shield className="w-4 h-4" style={{ imageRendering: "pixelated" }} />,
  accessory: (
    <Star className="w-4 h-4" style={{ imageRendering: "pixelated" }} />
  ),
};

/* ---------- メインコンポーネント ---------- */
export default function EquipmentShop() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [coins, setCoins] = useState<number>(0);
  const [equipment, setEquipment] = useState(equipmentData);
  const { data: session } = useSession();

  /* 購入処理 */
  const handlePurchase = async (id: string) => {
    const item = equipment.find((eq) => eq.id === id);
    if (item && coins >= item.price && session?.user?.email) {
      await reduceCoin(session.user.email, item.price);
      const currentCoin = await getCurrentCoin(session.user.email);
      setCoins(currentCoin || 0);
      setEquipment(
        equipment.map((eq) => (eq.id === id ? { ...eq, owned: true } : eq))
      );
    }
  };

  /* 所持コイン取得 */
  useEffect(() => {
    const fetchCoin = async () => {
      if (session?.user?.email) {
        const currentCoin = await getCurrentCoin(session.user.email);
        setCoins(currentCoin || 0);
      }
    };
    fetchCoin();
  }, [session]);

  /* 装備切替 */
  const handleEquip = (id: string) => {
    const item = equipment.find((eq) => eq.id === id);
    if (item && item.owned) {
      setEquipment(
        equipment.map((eq) => {
          if (eq.type === item.type) {
            return { ...eq, equipped: eq.id === id };
          }
          return eq;
        })
      );
    }
  };

  const filteredEquipment = equipment.filter((item) => {
    if (selectedTab === "all") return true;
    return item.type === selectedTab;
  });

  return (
    <div
      className="min-h-screen p-4 font-mono relative"
      style={{
        fontFamily: '"Courier New", monospace',
        fontSize: "14px",
        imageRendering: "pixelated",
        background:
          "linear-gradient(45deg, #1e40af 0%, #7c3aed 25%, #059669 50%, #dc2626 75%, #ea580c 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 8s ease infinite",
      }}>
      {/* ------- keyframes (JSX style) ------- */}
      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .pixel-border {
          border-style: solid;
          image-rendering: pixelated;
        }
        .pixel-text {
          font-family: "Courier New", monospace;
          font-weight: bold;
          text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.8);
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* -------- Header -------- */}
        <div className="mb-6">
          <div
            className="border-4 p-6 pixel-border"
            style={{
              backgroundColor: "#dc2626",
              borderColor: "#fbbf24",
              boxShadow: "6px 6px 0px #991b1b, 12px 12px 0px rgba(0,0,0,0.6)",
            }}>
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold text-white flex items-center gap-3 pixel-text">
                <ShoppingCart
                  className="w-10 h-10"
                  style={{ imageRendering: "pixelated" }}
                />
                装備ショップ
              </h1>
              <div
                className="flex items-center gap-3 px-6 py-3 border-3 text-orange-900 font-bold text-xl"
                style={{
                  backgroundColor: "#fbbf24",
                  borderColor: "#f59e0b",
                  boxShadow: "3px 3px 0px #d97706, 6px 6px 0px rgba(0,0,0,0.4)",
                }}>
                <Coins
                  className="w-7 h-7"
                  style={{ imageRendering: "pixelated" }}
                />
                <span className="pixel-text">{coins.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* -------- Tabs -------- */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                value: "all",
                label: "すべて",
                color: "#8b5cf6",
                shadow: "#7c3aed",
              },
              {
                value: "weapon",
                label: "武器",
                color: "#ef4444",
                shadow: "#dc2626",
              },
              {
                value: "armor",
                label: "防具",
                color: "#3b82f6",
                shadow: "#1d4ed8",
              },
              {
                value: "accessory",
                label: "アクセサリー",
                color: "#22c55e",
                shadow: "#16a34a",
              },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedTab(tab.value)}
                className="p-4 border-4 font-bold text-white pixel-text text-lg"
                style={{
                  backgroundColor:
                    selectedTab === tab.value ? tab.color : "#4b5563",
                  borderColor:
                    selectedTab === tab.value ? "#ffffff" : "#6b7280",
                  boxShadow:
                    selectedTab === tab.value
                      ? `4px 4px 0px ${tab.shadow}, 8px 8px 0px rgba(0,0,0,0.4)`
                      : "3px 3px 0px #374151, 6px 6px 0px rgba(0,0,0,0.3)",
                  cursor: "pointer",
                  transition: "all 0.1s ease",
                }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* -------- Equipment Grid -------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => (
            /* flex & flex-col 追加で縦レイアウト化 */
            <div
              key={item.id}
              className="relative pixel-border flex flex-col"
              style={{
                backgroundColor: "#1f2937",
                borderWidth: "5px",
                borderColor: item.owned ? "#10b981" : "#6b7280",
                boxShadow: item.owned
                  ? "6px 6px 0px #059669, 12px 12px 0px rgba(0,0,0,0.5)"
                  : "4px 4px 0px #374151, 8px 8px 0px rgba(0,0,0,0.4)",
                opacity: !item.owned ? 0.8 : 1,
              }}>
              {/* ------------ Lock Overlay ------------ */}
              {!item.owned && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    backdropFilter: "none",
                  }}>
                  <div className="text-center mb-4">
                    <Lock
                      className="w-20 h-20 text-red-400 mx-auto mb-3"
                      style={{ imageRendering: "pixelated" }}
                    />
                    <span className="text-red-400 font-bold pixel-text text-xl">
                      LOCKED
                    </span>
                  </div>
                  <button
                    onClick={() => handlePurchase(item.id)}
                    disabled={coins < item.price}
                    className="px-6 py-3 border-4 font-bold pixel-text text-lg"
                    style={{
                      backgroundColor:
                        coins >= item.price ? "#22c55e" : "#6b7280",
                      borderColor: coins >= item.price ? "#16a34a" : "#4b5563",
                      color: "white",
                      boxShadow:
                        coins >= item.price
                          ? "4px 4px 0px #15803d, 8px 8px 0px rgba(0,0,0,0.4)"
                          : "3px 3px 0px #374151, 6px 6px 0px rgba(0,0,0,0.3)",
                      cursor: coins >= item.price ? "pointer" : "not-allowed",
                    }}>
                    購入する
                  </button>
                </div>
              )}

              {/* ------------ Card Body ------------ */}
              <div className="p-6 flex flex-col h-full">
                {/* Equipment Image */}
                <div className="mb-4 flex justify-center">
                  <div
                    className="border-3 p-3"
                    style={{
                      backgroundColor: "#374151",
                      borderColor: "#6b7280",
                      boxShadow:
                        "2px 2px 0px #1f2937, 4px 4px 0px rgba(0,0,0,0.3)",
                    }}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="pixel-border"
                      style={{
                        imageRendering: "pixelated",
                        borderWidth: "2px",
                        borderColor: "#9ca3af",
                      }}
                    />
                  </div>
                </div>

                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {typeIcons[item.type]}
                    <h3 className="text-xl font-bold text-white pixel-text">
                      {item.name}
                    </h3>
                  </div>
                </div>

                <p className="text-white text-opacity-90 text-sm mb-4 pixel-text leading-relaxed">
                  {item.description}
                </p>

                {/* Stats */}
                <div className="space-y-3 mb-5">
                  {item.attack && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white text-sm pixel-text">
                        <Sword
                          className="w-5 h-5 text-red-300"
                          style={{ imageRendering: "pixelated" }}
                        />
                        <span>攻撃力</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-24 h-4 border-2 overflow-hidden"
                          style={{
                            backgroundColor: "rgba(0,0,0,0.6)",
                            borderColor: "rgba(255,255,255,0.4)",
                          }}>
                          <div
                            className="h-full"
                            style={{
                              width: `${(item.attack / 120) * 100}%`,
                              backgroundColor: "#ef4444",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
                            }}
                          />
                        </div>
                        <span className="text-white font-bold text-lg w-10 text-right pixel-text">
                          {item.attack}
                        </span>
                      </div>
                    </div>
                  )}

                  {item.defense && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white text-sm pixel-text">
                        <Shield
                          className="w-5 h-5 text-blue-300"
                          style={{ imageRendering: "pixelated" }}
                        />
                        <span>防御力</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-24 h-4 border-2 overflow-hidden"
                          style={{
                            backgroundColor: "rgba(0,0,0,0.6)",
                            borderColor: "rgba(255,255,255,0.4)",
                          }}>
                          <div
                            className="h-full"
                            style={{
                              width: `${(item.defense / 120) * 100}%`,
                              backgroundColor: "#3b82f6",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
                            }}
                          />
                        </div>
                        <span className="text-white font-bold text-lg w-10 text-right pixel-text">
                          {item.defense}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ------------ Price & Actions ------------ */}
                <div
                  className="border-t-3 pt-4 mt-auto"
                  style={{ borderColor: "rgba(255,255,255,0.3)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Coins
                      className="w-6 h-6 text-yellow-300"
                      style={{ imageRendering: "pixelated" }}
                    />
                    <span className="font-bold text-white text-xl pixel-text">
                      {item.price.toLocaleString()}
                    </span>
                  </div>

                  {!item.owned ? (
                    <button
                      onClick={() => handlePurchase(item.id)}
                      disabled={coins < item.price}
                      className="w-full p-4 border-4 font-bold pixel-text text-lg"
                      style={{
                        backgroundColor:
                          coins >= item.price ? "#22c55e" : "#6b7280",
                        borderColor:
                          coins >= item.price ? "#16a34a" : "#4b5563",
                        color: "white",
                        boxShadow:
                          coins >= item.price
                            ? "4px 4px 0px #15803d, 8px 8px 0px rgba(0,0,0,0.4)"
                            : "3px 3px 0px #374151, 6px 6px 0px rgba(0,0,0,0.3)",
                        cursor: coins >= item.price ? "pointer" : "not-allowed",
                      }}>
                      購入する
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEquip(item.id)}
                      className="w-full p-4 border-4 font-bold pixel-text text-lg"
                      style={{
                        backgroundColor: item.equipped ? "#6b7280" : "#3b82f6",
                        borderColor: item.equipped ? "#4b5563" : "#1d4ed8",
                        color: "white",
                        boxShadow: item.equipped
                          ? "3px 3px 0px #374151, 6px 6px 0px rgba(0,0,0,0.3)"
                          : "4px 4px 0px #1e40af, 8px 8px 0px rgba(0,0,0,0.4)",
                        cursor: "pointer",
                      }}>
                      {item.equipped ? "装備中" : "装備"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
