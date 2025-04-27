import { Button } from "@/components/ui/button"

export function WorldMission() {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/90 text-white p-4 rounded-lg flex items-center justify-between w-[500px]">
      <div className="flex items-center space-x-4">
        <div className="text-lg font-bold">비기너 미션 98</div>
        <div className="text-sm text-gray-400">30개의 미션 스테이지를 클리어하세요. (27/30)</div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <span className="text-yellow-400 text-lg">60,000</span>
        </div>
        <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">시작</Button>
      </div>
    </div>
  )
}
