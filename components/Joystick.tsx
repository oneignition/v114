"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface JoystickProps {
  onMove: (position: { x: number; y: number }) => void
  size?: number
  baseColor?: string
  stickColor?: string
}

export function Joystick({
  onMove,
  size = 100,
  baseColor = "rgba(0, 0, 0, 0.2)",
  stickColor = "#FF69B4",
}: JoystickProps) {
  const joystickRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const knobSize = size * 0.4
  const maxDistance = (size - knobSize) / 2

  const handleStart = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return

    setIsDragging(true)

    const rect = joystickRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    updateKnobPosition(clientX, clientY, centerX, centerY)
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !joystickRef.current) return

    const rect = joystickRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    updateKnobPosition(clientX, clientY, centerX, centerY)
  }

  const handleEnd = () => {
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
    onMove({ x: 0, y: 0 })
  }

  const updateKnobPosition = (clientX: number, clientY: number, centerX: number, centerY: number) => {
    let deltaX = clientX - centerX
    let deltaY = clientY - centerY

    // Calculate distance from center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Normalize if distance is greater than max
    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance
      deltaY = (deltaY / distance) * maxDistance
    }

    // Update knob position
    setPosition({ x: deltaX, y: deltaY })

    // Calculate normalized values (-1 to 1)
    const normalizedX = deltaX / maxDistance
    const normalizedY = deltaY / maxDistance

    onMove({ x: normalizedX, y: normalizedY })
  }

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX, e.clientY)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleEnd)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleEnd)
    }
  }, [isDragging])

  return (
    <div
      ref={joystickRef}
      className="relative rounded-full touch-none"
      style={{
        width: size,
        height: size,
        backgroundColor: baseColor,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleEnd}
    >
      <div
        ref={knobRef}
        className="absolute rounded-full"
        style={{
          width: knobSize,
          height: knobSize,
          left: `calc(50% - ${knobSize / 2}px)`,
          top: `calc(50% - ${knobSize / 2}px)`,
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? "none" : "transform 0.2s ease-out",
          backgroundColor: stickColor,
        }}
      />
    </div>
  )
}
