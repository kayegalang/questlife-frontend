import { useEffect, useState } from "react"
import {
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react"

import femaleIdle from "./assets/characters/female-adventurer/idle.png"
import femaleCheer0 from "./assets/characters/female-adventurer/cheer0.png"
import femaleCheer1 from "./assets/characters/female-adventurer/cheer1.png"
import femaleAttack0 from "./assets/characters/female-adventurer/attack0.png"
import femaleAttack1 from "./assets/characters/female-adventurer/attack1.png"
import femaleAttack2 from "./assets/characters/female-adventurer/attack2.png"

import maleIdle from "./assets/characters/male-adventurer/idle.png"
import maleCheer0 from "./assets/characters/male-adventurer/cheer0.png"
import maleCheer1 from "./assets/characters/male-adventurer/cheer1.png"
import maleAttack0 from "./assets/characters/male-adventurer/attack0.png"
import maleAttack1 from "./assets/characters/male-adventurer/attack1.png"
import maleAttack2 from "./assets/characters/male-adventurer/attack2.png"

import robotIdle from "./assets/characters/robot/idle.png"
import robotCheer0 from "./assets/characters/robot/cheer0.png"
import robotCheer1 from "./assets/characters/robot/cheer1.png"
import robotAttack0 from "./assets/characters/robot/attack0.png"
import robotAttack1 from "./assets/characters/robot/attack1.png"
import robotAttack2 from "./assets/characters/robot/attack2.png"

import zombieIdle from "./assets/characters/zombie/idle.png"
import zombieCheer0 from "./assets/characters/zombie/cheer0.png"
import zombieCheer1 from "./assets/characters/zombie/cheer1.png"
import zombieAttack0 from "./assets/characters/zombie/attack0.png"
import zombieAttack1 from "./assets/characters/zombie/attack1.png"
import zombieAttack2 from "./assets/characters/zombie/attack2.png"

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const { user } = useUser()

  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [streak, setStreak] = useState(0)
  const [lastStreakDate, setLastStreakDate] = useState(null)

  const [selectedCharacter, setSelectedCharacter] = useState(null)

  const [aiGoal, setAiGoal] = useState("")
  const [questType, setQuestType] = useState("Today")
  const [isGeneratingQuest, setIsGeneratingQuest] = useState(false)

  const [questFilter, setQuestFilter] = useState("All")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const [characterAction, setCharacterAction] = useState("idle")
  const [currentFrame, setCurrentFrame] = useState(0)

  const [quests, setQuests] = useState([])

  const characters = {
    female: {
      name: "Female Adventurer",
      idle: femaleIdle,
      cheer: [femaleCheer0, femaleCheer1],
      attack: [femaleAttack0, femaleAttack1, femaleAttack2],
    },
    male: {
      name: "Male Adventurer",
      idle: maleIdle,
      cheer: [maleCheer0, maleCheer1],
      attack: [maleAttack0, maleAttack1, maleAttack2],
    },
    robot: {
      name: "Robot",
      idle: robotIdle,
      cheer: [robotCheer0, robotCheer1],
      attack: [robotAttack0, robotAttack1, robotAttack2],
    },
    zombie: {
      name: "Zombie",
      idle: zombieIdle,
      cheer: [zombieCheer0, zombieCheer1],
      attack: [zombieAttack0, zombieAttack1, zombieAttack2],
    },
  }

  useEffect(() => {
    const savedCharacter = localStorage.getItem("questifyCharacter")

    if (savedCharacter) {
      setSelectedCharacter(savedCharacter)
    }
  }, [])

  useEffect(() => {
    if (selectedCharacter) {
      localStorage.setItem("questifyCharacter", selectedCharacter)
    }
  }, [selectedCharacter])

  useEffect(() => {
    if (!user) return

    async function fetchData() {
      try {
        const questResponse = await fetch(`${API_URL}/quests?userId=${user.id}`)
        const questData = await questResponse.json()

        const playerResponse = await fetch(`${API_URL}/player?userId=${user.id}`)
        const playerData = await playerResponse.json()

        setQuests(questData)
        setXp(playerData.xp)
        setLevel(playerData.level)
        setStreak(playerData.streak || 0)
        setLastStreakDate(playerData.lastStreakDate)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Unable to connect to the QuestLife server.")
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  useEffect(() => {
    if (!user || isLoading) return

    async function createStarterQuests() {
      const dailyQuestsExist = quests.some(
        (quest) => quest.questType === "Daily"
      )

      if (dailyQuestsExist) return

      const starterQuests = [
        {
          title: "Drink Water",
          xp: 25,
          completed: false,
          category: "Health",
          rarity: "Common",
          questType: "Daily",
        },
        {
          title: "Walk 5,000 Steps",
          xp: 50,
          completed: false,
          category: "Fitness",
          rarity: "Rare",
          questType: "Daily",
        },
        {
          title: "Study for 30 Minutes",
          xp: 50,
          completed: false,
          category: "Study",
          rarity: "Rare",
          questType: "Daily",
        },
      ]

      try {
        const savedQuests = []

        for (const quest of starterQuests) {
          const response = await fetch(`${API_URL}/quests?userId=${user.id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(quest),
          })

          const savedQuest = await response.json()
          savedQuests.push(savedQuest)
        }

        setQuests((prev) => [...prev, ...savedQuests])
      } catch (error) {
        console.error("Error creating starter quests:", error)
      }
    }

    createStarterQuests()
  }, [user, isLoading, quests])

  useEffect(() => {
    let frames = []

    if (!selectedCharacter) return

    if (characterAction === "cheer") {
      frames = characters[selectedCharacter].cheer
    }

    if (characterAction === "attack") {
      frames = characters[selectedCharacter].attack
    }

    if (frames.length === 0) return

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length)
    }, 200)

    return () => clearInterval(interval)
  }, [characterAction, selectedCharacter])

  function getCurrentCharacterSprite() {
    if (!selectedCharacter) return null

    const character = characters[selectedCharacter]

    if (characterAction === "cheer") {
      return character.cheer[currentFrame % character.cheer.length]
    }

    if (characterAction === "attack") {
      return character.attack[currentFrame % character.attack.length]
    }

    return character.idle
  }

  function getAvatarTitle() {
    if (level >= 4) return "Legendary Champion"
    if (level >= 3) return "Silver Knight"
    if (level >= 2) return "Bronze Hero"
    return "New Adventurer"
  }

  function getAvatarPower() {
    return 10 + level * 5
  }

  function getRarityColor(rarity) {
    switch (rarity) {
      case "Epic":
        return "text-purple-400"
      case "Rare":
        return "text-blue-400"
      default:
        return "text-gray-300"
    }
  }

  function getCategoryIcon(category) {
    switch (category) {
      case "Health":
        return "💖"
      case "Fitness":
        return "⚔️"
      case "Study":
        return "📚"
      case "Chores":
        return "🧹"
      case "Creative":
        return "🎨"
      default:
        return "✨"
    }
  }

  function getQuestTypeLabel(questType) {
    switch (questType) {
      case "Daily":
        return "Resets daily"
      case "Weekly":
        return "Resets weekly"
      default:
        return "Carries over"
    }
  }

  function getXpFromRarity(rarity) {
    switch (rarity) {
      case "Epic":
        return 100
      case "Rare":
        return 50
      default:
        return 25
    }
  }

  async function completeQuest(id, questXp) {
    const quest = quests.find((quest) => quest.id === id)

    if (!quest || quest.completed) return

    try {
      const response = await fetch(`${API_URL}/quests/${id}?userId=${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: true,
        }),
      })

      const updatedQuest = await response.json()

      const updatedQuests = quests.map((quest) => {
        if (quest.id === id) {
          return updatedQuest
        }

        return quest
      })

      const newXp = xp + questXp
      const newLevel = Math.floor(newXp / 100) + 1

      let newStreak = streak
      const today = new Date()

      if (quest.questType === "Daily") {
        if (!lastStreakDate) {
          newStreak = 1
        } else {
          const lastDate = new Date(lastStreakDate)

          const yesterday = new Date()
          yesterday.setDate(today.getDate() - 1)

          const sameDay =
            lastDate.toDateString() === today.toDateString()

          const wasYesterday =
            lastDate.toDateString() === yesterday.toDateString()

          if (!sameDay) {
            if (wasYesterday) {
              newStreak += 1
            } else {
              newStreak = 1
            }
          }
        }
      }

      await fetch(`${API_URL}/player?userId=${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          xp: newXp,
          level: newLevel,
          streak: newStreak,
          lastStreakDate: today,
        }),
      })

      setCurrentFrame(0)

      if (quest.rarity === "Epic") {
        setCharacterAction("attack")
      } else {
        setCharacterAction("cheer")
      }

      setTimeout(() => {
        setCharacterAction("idle")
        setCurrentFrame(0)
      }, 1200)

      setQuests(updatedQuests)
      setXp(newXp)
      setLevel(newLevel)
      setStreak(newStreak)
      setLastStreakDate(today)
    } catch (error) {
      console.error("Error completing quest:", error)
    }
  }

  async function generateAiQuest() {
    if (!aiGoal) return

    try {
      setIsGeneratingQuest(true)

      const response = await fetch(`${API_URL}/ai/generate-quest?userId=${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal: aiGoal,
          questType,
        }),
      })

      const generatedQuest = await response.json()

      const questToSave = {
        title: generatedQuest.title,
        xp: generatedQuest.xp ?? getXpFromRarity(generatedQuest.rarity),
        completed: false,
        category: generatedQuest.category,
        rarity: generatedQuest.rarity,
        questType: generatedQuest.questType || questType,
      }

      const saveResponse = await fetch(`${API_URL}/quests?userId=${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questToSave),
      })

      const savedQuest = await saveResponse.json()

      setQuests([...quests, savedQuest])
      setAiGoal("")
    } catch (error) {
      console.error("Error generating AI quest:", error)
    } finally {
      setIsGeneratingQuest(false)
    }
  }

  async function deleteQuest(id) {
    try {
      await fetch(`${API_URL}/quests/${id}?userId=${user.id}`, {
        method: "DELETE",
      })

      const filteredQuests = quests.filter((quest) => quest.id !== id)

      setQuests(filteredQuests)
    } catch (error) {
      console.error("Error deleting quest:", error)
    }
  }

  function QuestSection({ title, description, quests }) {
    return (
      <div className="mb-8">
        <div className="mb-4">
          <h3 className="text-2xl font-semibold">
            {title}
          </h3>

          <p className="text-slate-400 text-sm">
            {description}
          </p>
        </div>

        <div className="space-y-4">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className={`bg-slate-700/80 p-4 rounded-xl flex justify-between items-center border transition-all hover:scale-[1.02] ${
                quest.rarity === "Epic"
                  ? "border-purple-400 shadow-purple-900/40 shadow-lg"
                  : quest.rarity === "Rare"
                  ? "border-blue-400 shadow-blue-900/30 shadow-md"
                  : "border-slate-600"
              }`}
            >
              <div>
                <p className="font-semibold text-lg">
                  {getCategoryIcon(quest.category)} {quest.title}
                </p>

                <div className="flex flex-wrap gap-3 text-sm mt-1">
                  <p className="text-slate-300">+{quest.xp} XP</p>

                  <p className="text-yellow-400">{quest.category}</p>

                  <p className={getRarityColor(quest.rarity)}>
                    {quest.rarity}
                  </p>

                  <p className="text-emerald-400">{quest.questType}</p>

                  <p className="text-slate-400">
                    {getQuestTypeLabel(quest.questType)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => completeQuest(quest.id, quest.xp)}
                  disabled={quest.completed}
                  className={`px-4 py-2 rounded-lg ${
                    quest.completed
                      ? "bg-gray-500"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {quest.completed ? "Completed" : "Complete"}
                </button>

                <button
                  onClick={() => deleteQuest(quest.id)}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
                >
                  X
                </button>
              </div>
            </div>
          ))}

          {quests.length === 0 && (
            <p className="text-slate-400">
              No quests here yet.
            </p>
          )}
        </div>
      </div>
    )
  }

  const currentLevelXp = xp % 100
  const progressPercent = (currentLevelXp / 100) * 100

  const filteredQuests = quests.filter((quest) => {
    if (questFilter === "Active") return !quest.completed
    if (questFilter === "Completed") return quest.completed
    return true
  })

  const todayQuests = filteredQuests.filter(
    (quest) => quest.questType === "Today"
  )

  const dailyQuests = filteredQuests.filter(
    (quest) => quest.questType === "Daily"
  )

  const weeklyQuests = filteredQuests.filter(
    (quest) => quest.questType === "Weekly"
  )

  const completedQuestCount = quests.filter((quest) => quest.completed).length
  const activeQuestCount = quests.length - completedQuestCount

  const completionPercent =
    quests.length === 0
      ? 0
      : Math.round((completedQuestCount / quests.length) * 100)

  if (!user) {
    return (
      <SignedOut>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white flex flex-col items-center justify-center p-8">
          <h1 className="text-6xl font-bold mb-4">
            QuestLife
          </h1>

          <p className="text-slate-300 mb-8 text-center max-w-md">
            Turn your real-life goals into RPG quests, earn XP, and level up your life.
          </p>

          <SignInButton mode="modal">
            <button className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl text-lg">
              Start Your Adventure
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    )
  }

  if (!selectedCharacter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white flex flex-col items-center justify-center p-8">
        <div className="absolute top-6 right-6">
          <UserButton />
        </div>

        <h1 className="text-5xl font-bold mb-4">
          Choose Your Hero
        </h1>

        <p className="text-slate-300 mb-10">
          Select your character to begin your adventure.
        </p>

        <div className="grid grid-cols-2 gap-8">
          {Object.entries(characters).map(([key, character]) => (
            <button
              key={key}
              onClick={() => setSelectedCharacter(key)}
              className="bg-slate-800/80 backdrop-blur hover:bg-slate-700 p-6 rounded-2xl transition-all border border-slate-700 shadow-xl hover:scale-105"
            >
              <img
                src={character.idle}
                alt={character.name}
                className="w-32 h-32 pixelated mx-auto mb-4"
              />

              <p className="text-xl font-semibold">
                {character.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-center">
        <p className="text-2xl">
          Loading your quests...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-center">
        <div className="bg-slate-800/80 backdrop-blur p-8 rounded-2xl text-center border border-slate-700 shadow-xl">
          <h2 className="text-3xl font-bold mb-4">
            Server Error
          </h2>

          <p className="text-slate-300 mb-6">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end mb-4">
          <UserButton />
        </div>

        <h1 className="text-5xl font-bold mb-2">
          QuestLife
        </h1>

        <p className="text-slate-300 mb-8">
          Level up your real life.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 mb-6 border border-slate-700 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4">
                Your Hero
              </h2>

              <div className="bg-slate-700/80 rounded-2xl p-6 text-center border border-slate-600">
                <img
                  src={getCurrentCharacterSprite()}
                  alt="Hero"
                  className="w-40 h-40 mx-auto mb-4 pixelated"
                />

                <h3 className="text-2xl font-bold">
                  {getAvatarTitle()}
                </h3>

                <p className="text-slate-300 mt-2">
                  {characters[selectedCharacter].name}
                </p>

                <p className="text-slate-300 mt-2">
                  Level {level}
                </p>

                <p className="text-slate-300">
                  Power: {getAvatarPower()}
                </p>

                <p className="text-orange-400 mt-2">
                  🔥 {streak} Day Streak
                </p>

                <p className="text-slate-300 mt-4">
                  Total XP: {xp}
                </p>

                <div className="w-full bg-slate-600 rounded-full h-6 mt-4">
                  <div
                    className="bg-green-500 h-6 rounded-full transition-all"
                    style={{
                      width: `${progressPercent}%`,
                    }}
                  />
                </div>

                <p className="text-sm text-slate-400 mt-2">
                  {currentLevelXp}/100 XP to next level
                </p>

                <button
                  onClick={() => {
                    localStorage.removeItem("questifyCharacter")
                    setSelectedCharacter(null)
                  }}
                  className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded-lg mt-4"
                >
                  Change Hero
                </button>
              </div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 mb-6 border border-slate-700 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4">
                Quest Stats
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/80 rounded-xl p-4 border border-slate-600">
                  <p className="text-slate-300 text-sm">Total Quests</p>
                  <p className="text-2xl font-bold">{quests.length}</p>
                </div>

                <div className="bg-slate-700/80 rounded-xl p-4 border border-slate-600">
                  <p className="text-slate-300 text-sm">Completed</p>
                  <p className="text-2xl font-bold">{completedQuestCount}</p>
                </div>

                <div className="bg-slate-700/80 rounded-xl p-4 border border-slate-600">
                  <p className="text-slate-300 text-sm">Active</p>
                  <p className="text-2xl font-bold">{activeQuestCount}</p>
                </div>

                <div className="bg-slate-700/80 rounded-xl p-4 border border-slate-600">
                  <p className="text-slate-300 text-sm">Completion</p>
                  <p className="text-2xl font-bold">{completionPercent}%</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-slate-700 shadow-xl">
              <h2 className="text-2xl font-semibold mb-4">
                Quest Generator
              </h2>

              <div className="flex gap-2 mb-4">
                {["Today", "Daily", "Weekly"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setQuestType(type)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      questType === type
                        ? "bg-purple-600"
                        : "bg-slate-700 hover:bg-slate-600"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="What do you need to accomplish?"
                value={aiGoal}
                onChange={(e) => setAiGoal(e.target.value)}
                className="p-3 rounded-lg bg-slate-700 border border-slate-600 w-full mb-3"
              />

              <button
                onClick={generateAiQuest}
                disabled={isGeneratingQuest}
                className={`w-full p-3 rounded-lg ${
                  isGeneratingQuest
                    ? "bg-gray-500"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {isGeneratingQuest
                  ? "Generating Quest..."
                  : "Generate Quest"}
              </button>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-slate-700 shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">
              Quest Board
            </h2>

            <div className="flex gap-2 mb-6">
              {["All", "Active", "Completed"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setQuestFilter(filter)}
                  className={`px-4 py-2 rounded-lg ${
                    questFilter === filter
                      ? "bg-blue-500"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <QuestSection
              title="Today Quests"
              description="One-time quests that carry over until completed."
              quests={todayQuests}
            />

            <QuestSection
              title="Daily Quests"
              description="Recurring quests that reset every day."
              quests={dailyQuests}
            />

            <QuestSection
              title="Weekly Quests"
              description="Recurring quests that reset every week."
              quests={weeklyQuests}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App