"use client"

import { useState } from "react"
import { ArrowLeft, Sword, MapPin } from "lucide-react"
import Image from "next/image"

interface Player {
  name: string
  level: number
  hp: number
  maxHp: number
  attack: number
  defense: number
  avatar: string
}

interface Monster {
  id: string
  name: string
  level: number
  hp: number
  maxHp: number
  attack: number
  defense: number
  image: string
  exp: number
  coins: number
}

interface Stage {
  id: number
  name: string
  currentBattle: number
  totalBattles: number
  theme: string
}

export default function BattlePage() {
  const [player, setPlayer] = useState<Player>({
    name: "戦士",
    level: 7,
    hp: 120,
    maxHp: 120,
    attack: 45,
    defense: 25,
    avatar: "/placeholder.svg?height=100&width=100",
  })

  const [currentMonster, setCurrentMonster] = useState<Monster>({
    id: "slime",
    name: "スライム",
    level: 3,
    hp: 80,
    maxHp: 80,
    attack: 25,
    defense: 10,
    image: "/placeholder.svg?height=120&width=120",
    exp: 15,
    coins: 30,
  })

  const [currentStage, setCurrentStage] = useState<Stage>({
    id: 1,
    name: "森の入り口",
    currentBattle: 3,
    totalBattles: 10,
    theme: "forest",
  })

  const [battleLog, setBattleLog] = useState<string[]>(["野生のスライムが現れた！", "バトル開始！"])
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [battleResult, setBattleResult] = useState<"win" | "lose" | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const addToBattleLog = (message: string) => {
    setBattleLog((prev) => [...prev.slice(-5), message])
  }

  const calculateDamage = (attacker: number, defender: number) => {
    const baseDamage = Math.max(1, attacker - defender)
    const randomFactor = 0.8 + Math.random() * 0.4
    return Math.floor(baseDamage * randomFactor)
  }

  const handleAttack = async () => {
    if (!isPlayerTurn || isProcessing) return

    setIsProcessing(true)

    // プレイヤーの攻撃
    const playerDamage = calculateDamage(player.attack, currentMonster.defense)
    const newMonsterHp = Math.max(0, currentMonster.hp - playerDamage)
    setCurrentMonster((prev) => ({ ...prev, hp: newMonsterHp }))
    addToBattleLog(`${player.name}の攻撃！`)
    addToBattleLog(`${currentMonster.name}に${playerDamage}のダメージ！`)

    if (newMonsterHp <= 0) {
      setBattleResult("win")
      addToBattleLog(`${currentMonster.name}を倒した！`)
      addToBattleLog(`経験値${currentMonster.exp}、コイン${currentMonster.coins}を獲得！`)

      // ステージ進行
      if (currentStage.currentBattle < currentStage.totalBattles) {
        setCurrentStage((prev) => ({ ...prev, currentBattle: prev.currentBattle + 1 }))
      }

      setIsProcessing(false)
      return
    }

    setIsPlayerTurn(false)

    // モンスターの攻撃
    setTimeout(() => {
      const monsterDamage = calculateDamage(currentMonster.attack, player.defense)
      const newPlayerHp = Math.max(0, player.hp - monsterDamage)
      setPlayer((prev) => ({ ...prev, hp: newPlayerHp }))
      addToBattleLog(`${currentMonster.name}の攻撃！`)
      addToBattleLog(`${player.name}に${monsterDamage}のダメージ！`)

      if (newPlayerHp <= 0) {
        setBattleResult("lose")
        addToBattleLog(`${player.name}は倒れた...`)
      }

      setIsPlayerTurn(true)
      setIsProcessing(false)
    }, 1500)
  }

  const stageProgressPercentage = (currentStage.currentBattle / currentStage.totalBattles) * 100

  return (
    <div
      className="min-h-screen p-4 font-mono"
      style={{
        backgroundColor: "#2d3748",
        fontFamily: '"Courier New", monospace',
      }}
    >
      <style jsx>{`
        .pixel-border {
          border-style: solid;
          image-rendering: pixelated;
        }
        .pixel-text {
          font-family: "Courier New", monospace;
          font-weight: bold;
          text-shadow: 2px 2px 0px rgba(0, 0, 0, 1);
          letter-spacing: 1px;
        }
        .retro-button {
          transition: all 0.1s ease;
        }
        .retro-button:hover:not(:disabled) {
          transform: translate(-2px, -2px);
        }
        .retro-button:active:not(:disabled) {
          transform: translate(0px, 0px);
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div
            className="border-4 p-4 pixel-border"
            style={{
              backgroundColor: "#1a202c",
              borderColor: "#4a5568",
              boxShadow: "4px 4px 0px #2d3748",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.history.back()}
                  className="p-2 border-3 bg-gray-600 border-gray-500 text-white pixel-border retro-button"
                  style={{ boxShadow: "2px 2px 0px #4a5568" }}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="text-2xl font-bold text-white pixel-text">⚔️ BATTLE</h1>
              </div>
            </div>

            {/* Stage Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-green-300 pixel-text text-sm">第{currentStage.id}階層</div>
                  <div className="text-white pixel-text text-lg">{currentStage.name}</div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-300 pixel-text text-sm">進行状況</span>
                  <span className="text-yellow-300 pixel-text text-sm">
                    {currentStage.currentBattle}/{currentStage.totalBattles}
                  </span>
                </div>
                <div className="w-full h-3 border-2 border-yellow-400" style={{ backgroundColor: "#2d3748" }}>
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${stageProgressPercentage}%`,
                      backgroundColor: "#f6e05e",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Field */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Player Status */}
          <div
            className="border-4 p-4 pixel-border"
            style={{
              backgroundColor: "#2b6cb0",
              borderColor: "#3182ce",
              boxShadow: "4px 4px 0px #2c5282",
            }}
          >
            <div className="text-center">
              <h3 className="text-white font-bold pixel-text text-lg mb-3">{player.name}</h3>
              <div className="mb-3">
                <Image
                  src={player.avatar || "/placeholder.svg"}
                  alt="Player"
                  width={80}
                  height={80}
                  className="mx-auto pixel-border border-2 border-white"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
              <div className="space-y-2">
                <div className="text-white pixel-text text-sm">Lv.{player.level}</div>
                <div className="text-white pixel-text text-sm">
                  HP: {player.hp}/{player.maxHp}
                </div>
                <div className="w-full h-3 border-2 border-white" style={{ backgroundColor: "#1a202c" }}>
                  <div
                    className="h-full"
                    style={{
                      width: `${(player.hp / player.maxHp) * 100}%`,
                      backgroundColor: player.hp > player.maxHp * 0.3 ? "#48bb78" : "#f56565",
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-white pixel-text text-xs mt-3">
                  <div className="p-2 border-2 border-white text-center" style={{ backgroundColor: "#1a202c" }}>
                    ATK: {player.attack}
                  </div>
                  <div className="p-2 border-2 border-white text-center" style={{ backgroundColor: "#1a202c" }}>
                    DEF: {player.defense}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monster */}
          <div
            className="border-4 p-4 pixel-border"
            style={{
              backgroundColor: "#c53030",
              borderColor: "#e53e3e",
              boxShadow: "4px 4px 0px #9b2c2c",
            }}
          >
            <div className="text-center">
              <h3 className="text-white font-bold pixel-text text-lg mb-3">{currentMonster.name}</h3>
              <div className="mb-3">
                <Image
                  src={currentMonster.image || "/placeholder.svg"}
                  alt="Monster"
                  width={100}
                  height={100}
                  className="mx-auto pixel-border border-2 border-white"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
              <div className="space-y-2">
                <div className="text-white pixel-text text-sm">Lv.{currentMonster.level}</div>
                <div className="text-white pixel-text text-sm">
                  HP: {currentMonster.hp}/{currentMonster.maxHp}
                </div>
                <div className="w-full h-3 border-2 border-white" style={{ backgroundColor: "#1a202c" }}>
                  <div
                    className="h-full"
                    style={{
                      width: `${(currentMonster.hp / currentMonster.maxHp) * 100}%`,
                      backgroundColor: "#e53e3e",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Log */}
        <div className="mb-4">
          <div
            className="border-4 p-4 pixel-border"
            style={{
              backgroundColor: "#1a202c",
              borderColor: "#4a5568",
              boxShadow: "4px 4px 0px #2d3748",
            }}
          >
            <h3 className="text-white font-bold pixel-text mb-3">📜 BATTLE LOG</h3>
            <div className="p-3 border-2 border-gray-500 h-32 overflow-y-auto" style={{ backgroundColor: "#2d3748" }}>
              {battleLog.map((log, index) => (
                <div key={index} className="text-green-300 pixel-text text-sm mb-1">
                  {">"} {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attack Command */}
        {!battleResult && (
          <div className="text-center">
            <button
              onClick={handleAttack}
              disabled={!isPlayerTurn || isProcessing}
              className="px-8 py-4 border-4 font-bold pixel-text text-white text-xl retro-button"
              style={{
                backgroundColor: isPlayerTurn && !isProcessing ? "#38a169" : "#4a5568",
                borderColor: isPlayerTurn && !isProcessing ? "#2f855a" : "#2d3748",
                boxShadow: isPlayerTurn && !isProcessing ? "4px 4px 0px #2f855a" : "4px 4px 0px #2d3748",
                cursor: isPlayerTurn && !isProcessing ? "pointer" : "not-allowed",
              }}
            >
              <div className="flex items-center gap-3">
                <Sword className="w-6 h-6" />
                <span>{isProcessing ? "PROCESSING..." : "攻撃"}</span>
              </div>
            </button>
          </div>
        )}

        {/* Battle Result */}
        {battleResult && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div
              className="border-4 p-8 pixel-border text-center"
              style={{
                backgroundColor: battleResult === "win" ? "#38a169" : "#c53030",
                borderColor: battleResult === "win" ? "#2f855a" : "#9b2c2c",
                boxShadow: "8px 8px 0px rgba(0,0,0,0.8)",
              }}
            >
              <h2 className="text-white font-bold pixel-text text-4xl mb-6">
                {battleResult === "win" ? "🎉 VICTORY!" : "💀 DEFEAT..."}
              </h2>
              {battleResult === "win" && (
                <div className="text-white pixel-text mb-6 space-y-2">
                  <p>EXP +{currentMonster.exp}</p>
                  <p>COIN +{currentMonster.coins}</p>
                  {currentStage.currentBattle === currentStage.totalBattles && (
                    <p className="text-yellow-300">🎊 ステージクリア！</p>
                  )}
                </div>
              )}
              <div className="space-y-3">
                <button
                  onClick={() => window.history.back()}
                  className="block w-full px-8 py-4 border-4 font-bold pixel-text text-white retro-button"
                  style={{
                    backgroundColor: "#4a5568",
                    borderColor: "#2d3748",
                    boxShadow: "4px 4px 0px #2d3748",
                  }}
                >
                  戻る
                </button>
                {battleResult === "win" && currentStage.currentBattle < currentStage.totalBattles && (
                  <button
                    onClick={() => {
                      setBattleResult(null)
                      // 次の敵を生成する処理をここに追加
                      setCurrentMonster({
                        ...currentMonster,
                        hp: currentMonster.maxHp,
                      })
                      setBattleLog([`新しい敵が現れた！`, "バトル開始！"])
                    }}
                    className="block w-full px-8 py-4 border-4 font-bold pixel-text text-white retro-button"
                    style={{
                      backgroundColor: "#38a169",
                      borderColor: "#2f855a",
                      boxShadow: "4px 4px 0px #2f855a",
                    }}
                  >
                    次の敵へ
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
