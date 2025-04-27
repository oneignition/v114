export function WorldUI() {
  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col space-y-2">
      <div className="flex flex-col space-y-2">
        <div className="w-48 h-8 bg-[#2A2C31] rounded-lg flex items-center">
          <div className="h-full bg-yellow-400 rounded-l-lg" style={{ width: "60%" }} />
          <button className="ml-auto p-1">
            <span className="text-lg">🔍</span>
          </button>
        </div>
        <div className="w-48 h-8 bg-[#2A2C31] rounded-lg flex items-center">
          <div className="h-full bg-blue-400 rounded-l-lg" style={{ width: "40%" }} />
          <button className="ml-auto p-1">
            <span className="text-lg">🔍</span>
          </button>
        </div>
        <div className="w-48 h-8 bg-[#2A2C31] rounded-lg flex items-center">
          <div className="h-full bg-green-400 rounded-l-lg" style={{ width: "80%" }} />
          <button className="ml-auto p-1">
            <span className="text-lg">🔍</span>
          </button>
        </div>
      </div>
    </div>
  )
}
