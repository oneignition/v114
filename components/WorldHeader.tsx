import Image from "next/image"

interface WorldHeaderProps {
  player: {
    username: string
    level: number
    avatar: string
  }
}

export function WorldHeader({ player }: WorldHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 bg-black/80 p-2 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="relative w-12 h-12">
          <Image src={player.avatar} alt={player.username} width={48} height={48} className="rounded-lg" />
          <div className="absolute bottom-0 right-0 bg-black/80 px-1 rounded text-xs text-white">Lv.{player.level}</div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1 rounded">
            <span className="text-white font-bold">GUARDIAN</span>
            <span className="text-yellow-300 ml-1">PASS</span>
          </div>
          <div className="bg-red-500 w-2 h-2 rounded-full" />
        </div>
      </div>
    </div>
  )
}
