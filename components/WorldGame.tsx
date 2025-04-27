"use client"

import { useState, useEffect, useRef } from "react"
import { WorldHeader } from "./WorldHeader"
import { WorldResources } from "./WorldResources"
import { WorldUI } from "./WorldUI"
import { WorldSideMenu } from "./WorldSideMenu"
import { WorldMission } from "./WorldMission"

interface Position {
  x: number
  y: number
}

interface Building {
  type: "tent" | "house" | "shop" | "inn" | "guild" | "fountain"
  position: Position
  size: { width: number; height: number }
  colors: {
    primary: string
    secondary: string
    accent: string
    roof: string
    finial?: string
    shadow?: string
    stripes?: string[]
  }
  details: {
    windows: number
    door: boolean
    chimney: boolean
    awning: boolean
    stripes?: boolean
    scallops?: number
    finial?: boolean
  }
}

interface Player {
  position: Position
  username: string
  level: number
  direction: "up" | "down" | "left" | "right"
  avatar: string
}

export function WorldGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentPlayer, setCurrentPlayer] = useState<Player>({
    position: { x: 5, y: 5 },
    username: "양크",
    level: 25,
    direction: "down",
    avatar: "/placeholder.svg",
  })

  // Constants for isometric projection
  const TILE_WIDTH = 64
  const TILE_HEIGHT = 32
  const MAP_WIDTH = 15
  const MAP_HEIGHT = 15

  // Buildings
  const [buildings] = useState<Building[]>([
    {
      type: "tent",
      position: { x: 3, y: 3 },
      size: { width: 2, height: 2 },
      colors: {
        primary: "#FF2B2B",
        secondary: "#FFFFFF",
        accent: "#FF4444",
        roof: "#FF2B2B",
        finial: "#FFD700",
        shadow: "rgba(0,0,0,0.3)",
        stripes: ["#FF2B2B", "#FFFFFF"],
      },
      details: {
        windows: 0,
        door: true,
        chimney: false,
        awning: false,
        stripes: true,
        scallops: 8,
        finial: true,
      },
    },
    {
      type: "house",
      position: { x: 2, y: 2 },
      size: { width: 2, height: 2 },
      colors: {
        primary: "#8B4513",
        secondary: "#A0522D",
        accent: "#CD853F",
        roof: "#8B0000",
      },
      details: {
        windows: 2,
        door: true,
        chimney: true,
        awning: false,
      },
    },
    {
      type: "shop",
      position: { x: 6, y: 4 },
      size: { width: 2, height: 2 },
      colors: {
        primary: "#4A708B",
        secondary: "#5F9EA0",
        accent: "#87CEFA",
        roof: "#00008B",
      },
      details: {
        windows: 3,
        door: true,
        chimney: false,
        awning: true,
      },
    },
    {
      type: "inn",
      position: { x: 4, y: 6 },
      size: { width: 3, height: 2 },
      colors: {
        primary: "#8B7355",
        secondary: "#CD853F",
        accent: "#DEB887",
        roof: "#8B4513",
      },
      details: {
        windows: 4,
        door: true,
        chimney: true,
        awning: true,
      },
    },
    {
      type: "guild",
      position: { x: 8, y: 8 },
      size: { width: 3, height: 3 },
      colors: {
        primary: "#2F4F4F",
        secondary: "#5F9EA0",
        accent: "#00CED1",
        roof: "#008080",
      },
      details: {
        windows: 6,
        door: true,
        chimney: false,
        awning: false,
      },
    },
    {
      type: "fountain",
      position: { x: 5, y: 5 },
      size: { width: 1, height: 1 },
      colors: {
        primary: "#4682B4",
        secondary: "#87CEFA",
        accent: "#00BFFF",
        roof: "#4169E1",
      },
      details: {
        windows: 0,
        door: false,
        chimney: false,
        awning: false,
      },
    },
  ])

  // Resources
  const [resources] = useState({
    energy: 1983,
    maxEnergy: 64,
    coins: 3926315,
    gems: 18155,
    hearts: 698299,
  })

  // Convert isometric coordinates to screen coordinates
  const isoTo2D = (x: number, y: number) => {
    return {
      x: ((x - y) * TILE_WIDTH) / 2 + 400,
      y: ((x + y) * TILE_HEIGHT) / 2 + 100,
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.imageSmoothingEnabled = false

    const drawTile = (x: number, y: number) => {
      const { x: screenX, y: screenY } = isoTo2D(x, y)

      const gradient = ctx.createLinearGradient(
        screenX - TILE_WIDTH / 2,
        screenY,
        screenX + TILE_WIDTH / 2,
        screenY + TILE_HEIGHT,
      )
      gradient.addColorStop(0, "#9BC53D")
      gradient.addColorStop(1, "#5D8233")

      ctx.beginPath()
      ctx.moveTo(screenX, screenY)
      ctx.lineTo(screenX + TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2)
      ctx.lineTo(screenX, screenY + TILE_HEIGHT)
      ctx.lineTo(screenX - TILE_WIDTH / 2, screenY + TILE_HEIGHT / 2)
      ctx.closePath()

      ctx.fillStyle = gradient
      ctx.fill()

      ctx.strokeStyle = "#3A5F0B"
      ctx.lineWidth = 1
      ctx.stroke()
    }

    const drawTent = (building: Building) => {
      const { x: screenX, y: screenY } = isoTo2D(building.position.x, building.position.y)
      const tentWidth = TILE_WIDTH * 1.5
      const tentHeight = TILE_HEIGHT * 3

      // Draw shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)"
      ctx.beginPath()
      ctx.ellipse(screenX + tentWidth / 2, screenY + TILE_HEIGHT / 2, tentWidth / 2, TILE_HEIGHT / 2, 0, 0, Math.PI * 2)
      ctx.fill()

      // Draw tent base
      ctx.fillStyle = "#FFD700"
      ctx.beginPath()
      ctx.moveTo(screenX, screenY)
      ctx.lineTo(screenX + tentWidth, screenY)
      ctx.lineTo(screenX + tentWidth / 2, screenY + TILE_HEIGHT / 2)
      ctx.closePath()
      ctx.fill()

      // Draw tent body
      const gradient = ctx.createLinearGradient(screenX, screenY - tentHeight, screenX + tentWidth, screenY)
      gradient.addColorStop(0, "#FF4136")
      gradient.addColorStop(0.5, "#FF725C")
      gradient.addColorStop(1, "#FF4136")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.moveTo(screenX, screenY)
      ctx.lineTo(screenX + tentWidth / 2, screenY - tentHeight)
      ctx.lineTo(screenX + tentWidth, screenY)
      ctx.closePath()
      ctx.fill()

      // Draw tent stripes
      ctx.strokeStyle = "#FFFFFF"
      ctx.lineWidth = 2
      for (let i = 1; i < 5; i++) {
        ctx.beginPath()
        ctx.moveTo(screenX + (tentWidth * i) / 5, screenY)
        ctx.lineTo(screenX + tentWidth / 2, screenY - tentHeight)
        ctx.stroke()
      }

      // Draw tent entrance
      ctx.fillStyle = "#8B0000"
      ctx.beginPath()
      ctx.moveTo(screenX + tentWidth * 0.3, screenY)
      ctx.lineTo(screenX + tentWidth / 2, screenY - tentHeight * 0.6)
      ctx.lineTo(screenX + tentWidth * 0.7, screenY)
      ctx.closePath()
      ctx.fill()

      // Draw tent top ornament
      ctx.fillStyle = "#FFD700"
      ctx.beginPath()
      ctx.arc(screenX + tentWidth / 2, screenY - tentHeight, TILE_WIDTH / 8, 0, Math.PI * 2)
      ctx.fill()

      // Add pixel art details
      const pixelSize = 2
      ctx.fillStyle = "#FFFFFF"

      // Top highlight
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(screenX + tentWidth / 2 - 5 + i * pixelSize, screenY - tentHeight + 5, pixelSize, pixelSize)
      }

      // Side highlights
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(screenX + 5, screenY - tentHeight / 2 + i * pixelSize, pixelSize, pixelSize)
        ctx.fillRect(screenX + tentWidth - 7, screenY - tentHeight / 2 + i * pixelSize, pixelSize, pixelSize)
      }
    }

    const drawBuilding = (building: Building) => {
      if (building.type === "tent") {
        drawTent(building)
      } else {
        const { width, height } = building.size
        const { colors, details } = building

        // Draw shadow
        ctx.fillStyle = "rgba(0,0,0,0.2)"
        ctx.beginPath()
        ctx.ellipse(
          screenX,
          screenY + TILE_HEIGHT / 2,
          (TILE_WIDTH / 2) * width,
          (TILE_HEIGHT / 2) * height,
          0,
          0,
          Math.PI * 2,
        )
        ctx.fill()

        // Draw building base
        ctx.fillStyle = colors.primary
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 1

        // Front face
        ctx.beginPath()
        ctx.moveTo(screenX, screenY)
        ctx.lineTo(screenX + (TILE_WIDTH / 2) * width, screenY + (TILE_HEIGHT / 2) * height)
        ctx.lineTo(screenX + (TILE_WIDTH / 2) * width, screenY + (TILE_HEIGHT / 2) * height + TILE_HEIGHT * 2)
        ctx.lineTo(screenX, screenY + TILE_HEIGHT * 2)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // Right face
        ctx.fillStyle = colors.secondary
        ctx.beginPath()
        ctx.moveTo(screenX + (TILE_WIDTH / 2) * width, screenY + (TILE_HEIGHT / 2) * height)
        ctx.lineTo(screenX + TILE_WIDTH * width, screenY)
        ctx.lineTo(screenX + TILE_WIDTH * width, screenY + TILE_HEIGHT * 2)
        ctx.lineTo(screenX + (TILE_WIDTH / 2) * width, screenY + (TILE_HEIGHT / 2) * height + TILE_HEIGHT * 2)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // Roof
        ctx.fillStyle = colors.roof
        ctx.beginPath()
        ctx.moveTo(screenX, screenY)
        ctx.lineTo(screenX + (TILE_WIDTH / 2) * width, screenY - (TILE_HEIGHT / 2) * height)
        ctx.lineTo(screenX + TILE_WIDTH * width, screenY)
        ctx.lineTo(screenX + (TILE_WIDTH / 2) * width, screenY + (TILE_HEIGHT / 2) * height)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // Details
        if (details.windows) {
          ctx.fillStyle = colors.accent
          for (let i = 0; i < details.windows; i++) {
            ctx.fillRect(screenX + ((i + 1) * TILE_WIDTH) / (details.windows + 1) - 5, screenY + TILE_HEIGHT, 10, 15)
          }
        }

        if (details.door) {
          ctx.fillStyle = colors.accent
          ctx.fillRect(screenX + TILE_WIDTH / 4, screenY + TILE_HEIGHT * 2 - TILE_HEIGHT, TILE_WIDTH / 4, TILE_HEIGHT)
        }

        if (details.chimney) {
          ctx.fillStyle = colors.secondary
          ctx.fillRect(screenX + (TILE_WIDTH * 3) / 4, screenY - TILE_HEIGHT, TILE_WIDTH / 8, TILE_HEIGHT / 2)
        }

        if (details.awning) {
          ctx.fillStyle = colors.accent
          ctx.beginPath()
          ctx.moveTo(screenX, screenY + TILE_HEIGHT)
          ctx.lineTo(screenX + TILE_WIDTH / 2, screenY + (TILE_HEIGHT * 3) / 2)
          ctx.lineTo(screenX + TILE_WIDTH, screenY + TILE_HEIGHT)
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
        }
      }
    }

    const drawPlayer = (player: Player) => {
      const { x: screenX, y: screenY } = isoTo2D(player.position.x, player.position.y)

      // Draw shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)"
      ctx.beginPath()
      ctx.ellipse(screenX, screenY + TILE_HEIGHT / 2, TILE_WIDTH / 4, TILE_HEIGHT / 4, 0, 0, Math.PI * 2)
      ctx.fill()

      // Draw character
      const characterSize = 32
      ctx.fillStyle = "#FFD700"
      ctx.fillRect(screenX - characterSize / 2, screenY - characterSize, characterSize, characterSize)

      // Draw face (pixel art style)
      ctx.fillStyle = "#000000"
      ctx.fillRect(screenX - 6, screenY - characterSize + 8, 2, 2) // Left eye
      ctx.fillRect(screenX + 4, screenY - characterSize + 8, 2, 2) // Right eye
      ctx.fillRect(screenX - 4, screenY - characterSize + 18, 8, 2) // Mouth

      // Draw username and level
      ctx.font = "bold 12px Arial"
      ctx.fillStyle = "#FFFFFF"
      ctx.textAlign = "center"
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 3
      ctx.strokeText(`${player.username} Lv.${player.level}`, screenX, screenY - characterSize - 5)
      ctx.fillText(`${player.username} Lv.${player.level}`, screenX, screenY - characterSize - 5)
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
          drawTile(x, y)
        }
      }

      buildings.forEach(drawBuilding)
      drawPlayer(currentPlayer)

      requestAnimationFrame(render)
    }

    render()

    const handleKeyDown = (e: KeyboardEvent) => {
      const newPosition = { ...currentPlayer.position }
      let newDirection = currentPlayer.direction

      switch (e.key) {
        case "ArrowUp":
          newPosition.y--
          newDirection = "up"
          break
        case "ArrowDown":
          newPosition.y++
          newDirection = "down"
          break
        case "ArrowLeft":
          newPosition.x--
          newDirection = "left"
          break
        case "ArrowRight":
          newPosition.x++
          newDirection = "right"
          break
      }

      if (
        newPosition.x >= 0 &&
        newPosition.x < MAP_WIDTH &&
        newPosition.y >= 0 &&
        newPosition.y < MAP_HEIGHT &&
        !buildings.some((building) => building.position.x === newPosition.x && building.position.y === newPosition.y)
      ) {
        setCurrentPlayer((prev) => ({
          ...prev,
          position: newPosition,
          direction: newDirection,
        }))
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [currentPlayer, buildings])

  return (
    <div className="relative bg-[#1a1b1e] p-4 rounded-lg">
      <WorldHeader player={currentPlayer} />
      <WorldResources resources={resources} />
      <div className="relative">
        <canvas ref={canvasRef} width={800} height={600} className="rounded-lg shadow-lg" />
        <WorldUI />
        <WorldSideMenu />
      </div>
      <WorldMission />
    </div>
  )
}
