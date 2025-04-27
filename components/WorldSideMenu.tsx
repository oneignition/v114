export function WorldSideMenu() {
  return (
    <div className="absolute left-4 bottom-4 flex flex-col space-y-4">
      <button className="w-16 h-16 bg-[#2A2C31] rounded-lg border-2 border-[#4A4B4F] flex items-center justify-center hover:bg-[#3A3C41] transition-colors">
        <span className="text-2xl">🎯</span>
      </button>
      <button className="w-16 h-16 bg-[#2A2C31] rounded-lg border-2 border-[#4A4B4F] flex items-center justify-center hover:bg-[#3A3C41] transition-colors">
        <span className="text-2xl">📜</span>
      </button>
      <button className="w-16 h-16 bg-[#2A2C31] rounded-lg border-2 border-[#4A4B4F] flex items-center justify-center hover:bg-[#3A3C41] transition-colors">
        <span className="text-2xl">⭐</span>
      </button>
    </div>
  )
}
