import { Coffee, Coins, Diamond } from "lucide-react"

interface WorldResourcesProps {
  resources: {
    energy: number
    maxEnergy: number
    coins: number
    gems: number
    hearts: number
  }
}

export function WorldResources({ resources }: WorldResourcesProps) {
  return (
    <div className="absolute top-4 right-4 flex items-center space-x-4 bg-black/80 p-2 rounded-lg">
      <div className="flex items-center px-3 py-1 bg-[#2A2C31] rounded-lg">
        <Coffee className="w-5 h-5 mr-2 text-[#8B4513]" />
        <span className="text-white">
          {resources.energy}/{resources.maxEnergy}
        </span>
        <button className="ml-2 text-blue-400 text-sm">+</button>
      </div>
      <div className="flex items-center px-3 py-1 bg-[#2A2C31] rounded-lg">
        <Coins className="w-5 h-5 mr-2 text-yellow-400" />
        <span className="text-white">{resources.coins.toLocaleString()}</span>
        <button className="ml-2 text-blue-400 text-sm">+</button>
      </div>
      <div className="flex items-center px-3 py-1 bg-[#2A2C31] rounded-lg">
        <Diamond className="w-5 h-5 mr-2 text-blue-400" />
        <span className="text-white">{resources.gems.toLocaleString()}</span>
        <button className="ml-2 text-blue-400 text-sm">+</button>
      </div>
      <div className="flex items-center px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg">
        <span className="text-white">{resources.hearts.toLocaleString()}</span>
      </div>
    </div>
  )
}
