"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useToast } from "@/hooks/use-toast"
import * as THREE from "three"
import { Canvas } from "@react-three/fiber"
import { Text, Plane } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/components/mobile/useMobile"
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier"
import { GlamourAvatar } from "./GlamourAvatar"
import { useAppStatus } from "@/contexts/app-status-context"

// Update the Capacitor imports to safely handle web environments
// Try-catch for Capacitor imports to prevent errors in web environment
let Haptics: any = null
let ImpactStyle: any = null

try {
  if (
    typeof window !== "undefined" &&
    typeof (window as any).Capacitor !== "undefined" &&
    (window as any).Capacitor.isNative === true
  ) {
    const capacitorImport = require("@capacitor/haptics")
    Haptics = capacitorImport.Haptics
    ImpactStyle = capacitorImport.ImpactStyle
  }
} catch (error) {
  console.log("Capacitor not available in this environment")
}

// Roblox physics constants
const ROBLOX_CONSTANTS = {
  WALK_SPEED: 4.48, // Exactly 16 studs/sec in m/s
  RUN_SPEED: 6.72, // Exactly 24 studs/sec in m/s
  JUMP_FORCE: 12.5, // Force to achieve ~2.1m jump height (7.5 studs)
  GRAVITY: 54.94, // Exactly 196.2 studs/sec²
  ACCELERATION: 0.2, // Seconds to reach full speed
  DECELERATION: 0.15, // Seconds to stop from full speed
  CAMERA_LERP: 0.1, // Camera smoothing factor
  GROUND_FRICTION: 0.95, // Ground friction coefficient
  AIR_CONTROL: 0.3, // Air control multiplier
}

// DTI-style character component with Roblox movement mechanics
function DTICharacter({
  position = [0, 0, 0],
  customization = {
    // Default to pink theme as requested
    skinTone: "#FFDAB9",
    hairStyle: "waves", // long wavy hair
    hairColor: "#FFB6C1", // pastel pink
    eyeColor: "#8B4513", // brown eyes
    lipColor: "#FF0000", // bright red lips
    blushColor: "#FF69B4", // hot pink blush
    outfitStyle: "pink", // pink theme
    outfitColor: "#FF69B4", // hot pink
    accessoryStyle: "sunglasses", // oversized sunglasses
    accessoryColor: "#FFFFFF", // white
    legwearStyle: "fluffy", // fluffy leg warmers
    legwearColor: "#FFFFFF", // white
    shoesStyle: "platforms", // platform heels
    shoesColor: "#FF69B4", // hot pink
    bagStyle: "designer", // small designer bag
    bagColor: "#FFFFFF", // white
    headwearStyle: "beret", // fluffy beret
    headwearColor: "#FFFFFF", // white
    necklaceStyle: "pearls", // pearl necklace
    necklaceColor: "#FFFFFF", // white
    glitterEffect: true, // enable sparkle effect
  },
  animation = "idle",
  username = "User",
  isCurrentUser = false,
  onMove = () => {},
  controls = { forward: false, backward: false, left: false, right: false, jump: false, run: false },
  joystickControls = { x: 0, y: 0, intensity: 0 },
}) {
  const characterRef = useRef()
  const [currentRotation, setCurrentRotation] = useState(0)
  const [isJumping, setIsJumping] = useState(false)
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 })
  const [isOnGround, setIsOnGround] = useState(true)
  const [currentSpeed, setCurrentSpeed] = useState(ROBLOX_CONSTANTS.WALK_SPEED)
  const [targetSpeed, setTargetSpeed] = useState(ROBLOX_CONSTANTS.WALK_SPEED)
  const rigidBodyRef = useRef()
  const { camera } = useThree()

  // Handle movement based on controls with Roblox-like mechanics
  useFrame((state, delta) => {
    if (!rigidBodyRef.current || !isCurrentUser) return

    // Calculate movement direction
    let moveX = 0
    let moveZ = 0

    // Handle keyboard controls - camera-relative movement
    if (controls.forward) moveZ = -1
    if (controls.backward) moveZ = 1
    if (controls.left) moveX = -1
    if (controls.right) moveX = 1

    // Handle joystick controls (for mobile) - camera-relative movement
    if (Math.abs(joystickControls.x) > 0.1 || Math.abs(joystickControls.y) > 0.1) {
      moveX = joystickControls.x
      moveZ = joystickControls.y
    }

    // Normalize diagonal movement (Roblox-style)
    if (moveX !== 0 && moveZ !== 0) {
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ)
      moveX /= length
      moveZ /= length
    }

    // Determine if running (shift key or full joystick deflection)
    const isRunning = controls.run || joystickControls.intensity > 0.9

    // Set target speed based on running state
    const newTargetSpeed = isRunning ? ROBLOX_CONSTANTS.RUN_SPEED : ROBLOX_CONSTANTS.WALK_SPEED
    setTargetSpeed(newTargetSpeed)

    // Smooth acceleration/deceleration to target speed (Roblox-like)
    const speedDiff = targetSpeed - currentSpeed
    if (Math.abs(speedDiff) > 0.01) {
      // Use different acceleration/deceleration rates like Roblox
      const accelRate = speedDiff > 0 ? ROBLOX_CONSTANTS.ACCELERATION : ROBLOX_CONSTANTS.DECELERATION
      setCurrentSpeed(currentSpeed + (delta / accelRate) * Math.abs(speedDiff))
    } else {
      setCurrentSpeed(targetSpeed)
    }

    // Apply movement with camera-relative direction (Roblox-style)
    if (moveX !== 0 || moveZ !== 0) {
      // Calculate movement direction relative to camera
      const cameraAngle = Math.atan2(camera.position.x - position[0], camera.position.z - position[2])
      const angle = Math.atan2(moveX, moveZ) + cameraAngle

      // Set character rotation to face movement direction
      setCurrentRotation(angle)

      // Apply impulse for movement with current speed
      // Use different control strength when in air vs on ground (like Roblox)
      const controlMultiplier = isOnGround ? 1.0 : ROBLOX_CONSTANTS.AIR_CONTROL
      rigidBodyRef.current.applyImpulse({
        x: Math.sin(angle) * currentSpeed * delta * 60 * controlMultiplier,
        y: 0,
        z: Math.cos(angle) * currentSpeed * delta * 60 * controlMultiplier,
      })

      // Set animation to walking or running
      if (animation === "idle" && isOnGround) {
        onMove({ animation: isRunning ? "run" : "walk" })
      } else if (animation === "walk" && isRunning && isOnGround) {
        onMove({ animation: "run" })
      } else if (animation === "run" && !isRunning && isOnGround) {
        onMove({ animation: "walk" })
      }
    } else if ((animation === "walk" || animation === "run") && isOnGround) {
      // Set animation back to idle when not moving
      onMove({ animation: "idle" })
    }

    // Handle jumping with Roblox-like physics
    if (controls.jump && isOnGround) {
      rigidBodyRef.current.applyImpulse({ x: 0, y: ROBLOX_CONSTANTS.JUMP_FORCE, z: 0 })
      setIsJumping(true)
      setIsOnGround(false)
      onMove({ animation: "jump" })
    }

    // Get current velocity
    const currentVel = rigidBodyRef.current.linvel()
    setVelocity({
      x: currentVel.x,
      y: currentVel.y,
      z: currentVel.z,
    })

    // Check if character is on ground
    if (velocity.y === 0 && !isOnGround) {
      setIsOnGround(true)
      setIsJumping(false)

      // Determine animation after landing
      if (moveX !== 0 || moveZ !== 0) {
        onMove({ animation: isRunning ? "run" : "walk" })
      } else {
        onMove({ animation: "idle" })
      }
    }

    // Apply Roblox-like gravity
    rigidBodyRef.current.setGravityScale(ROBLOX_CONSTANTS.GRAVITY / 9.81)

    // Apply Roblox-like ground friction
    if (isOnGround && moveX === 0 && moveZ === 0) {
      rigidBodyRef.current.setLinvel({
        x: currentVel.x * ROBLOX_CONSTANTS.GROUND_FRICTION,
        y: currentVel.y,
        z: currentVel.z * ROBLOX_CONSTANTS.GROUND_FRICTION,
      })
    }

    // Update position for other components to use
    const worldPosition = rigidBodyRef.current.translation()
    onMove({
      position: [worldPosition.x, worldPosition.y, worldPosition.z],
      rotation: currentRotation,
    })
  })

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      enabledRotations={[false, false, false]}
      lockRotations
      mass={1}
      colliders={false}
      linearDamping={0.95}
      angularDamping={0.95}
      type={isCurrentUser ? "dynamic" : "fixed"}
    >
      <CuboidCollider args={[0.25, 0.75, 0.25]} position={[0, 0.75, 0]} />

      <group ref={characterRef} rotation={[0, currentRotation, 0]}>
        {/* DTI-style character model */}
        <GlamourAvatar animation={animation} isJumping={isJumping} customization={customization} />

        {/* Username floating above */}
        <Text
          position={[0, 2.5, 0]} // Higher position for the larger head
          fontSize={0.15}
          color="black"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="white"
        >
          {username}
        </Text>
      </group>
    </RigidBody>
  )
}

// Character Preview component for customization dialog
function CharacterPreview({ customization }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    })

    renderer.setSize(200, 200)
    renderer.setClearColor(0x000000, 0)

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    // Create character group
    const characterGroup = new THREE.Group()
    scene.add(characterGroup)

    // Position camera
    camera.position.set(0, 1.2, 1.2)
    camera.lookAt(0, 1, 0)

    // Create DTI character model
    const dtiCharacter = new THREE.Group()

    // Add head - much larger for DTI style
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 32, 32),
      new THREE.MeshStandardMaterial({ color: customization.skinTone }),
    )
    head.position.set(0, 1.8, 0)
    dtiCharacter.add(head)

    // Add body - thinner for DTI style
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.1, 0.2, 16, 8),
      new THREE.MeshStandardMaterial({ color: customization.outfitColor }),
    )
    body.position.set(0, 0.9, 0)
    dtiCharacter.add(body)

    // Add legs - longer and thinner for DTI style
    const leftLeg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.03, 1.8, 8, 8),
      new THREE.MeshStandardMaterial({ color: customization.skinTone }),
    )
    leftLeg.position.set(-0.08, 0.3, 0)
    dtiCharacter.add(leftLeg)

    const rightLeg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.03, 1.8, 8, 8),
      new THREE.MeshStandardMaterial({ color: customization.skinTone }),
    )
    rightLeg.position.set(0.08, 0.3, 0)
    dtiCharacter.add(rightLeg)

    // Add arms - thinner for DTI style
    const leftArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.03, 0.6, 8, 8),
      new THREE.MeshStandardMaterial({ color: customization.skinTone }),
    )
    leftArm.position.set(-0.18, 1.1, 0)
    leftArm.rotation.z = Math.PI / 6
    dtiCharacter.add(leftArm)

    const rightArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.03, 0.6, 8, 8),
      new THREE.MeshStandardMaterial({ color: customization.skinTone }),
    )
    rightArm.position.set(0.18, 1.1, 0)
    rightArm.rotation.z = -Math.PI / 6
    dtiCharacter.add(rightArm)

    characterGroup.add(dtiCharacter)

    // Animation loop
    let angle = 0
    const animate = () => {
      const animationFrame = requestAnimationFrame(animate)
      angle += 0.01

      // Rotate character slightly for preview
      characterGroup.rotation.y = angle

      renderer.render(scene, camera)

      return () => {
        cancelAnimationFrame(animationFrame)
      }
    }

    const cleanup = animate()

    return () => {
      cleanup()

      // Dispose geometries and materials
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      })

      renderer.dispose()
    }
  }, [customization])

  return (
    <div className="flex justify-center items-center p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg">
      <canvas ref={canvasRef} className="w-[200px] h-[200px]" />
    </div>
  )
}

// Roblox-style camera controller
function RobloxCamera({ target, initialPosition = [0, 2, 3], isMobile = false }) {
  const { camera } = useThree()
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 })
  const [cameraAngle, setCameraAngle] = useState({ x: 0, y: Math.PI / 6 })
  const [cameraDistance, setCameraDistance] = useState(3)
  const cameraRef = useRef()

  // Initialize camera position
  useEffect(() => {
    if (camera) {
      camera.position.set(...initialPosition)
      camera.lookAt(target[0], target[1], target[2])
    }
  }, [])

  // Handle mouse/touch camera rotation
  useFrame(() => {
    if (!target) return

    // Calculate desired camera position based on angle and distance (Roblox-style)
    const targetX = target[0] + Math.sin(cameraAngle.x) * Math.cos(cameraAngle.y) * cameraDistance
    const targetY = target[1] + Math.sin(cameraAngle.y) * cameraDistance + 1.0 // Add height offset like Roblox
    const targetZ = target[2] + Math.cos(cameraAngle.x) * Math.cos(cameraAngle.y) * cameraDistance

    // Smooth camera movement with Roblox-like damping
    camera.position.x += (targetX - camera.position.x) * ROBLOX_CONSTANTS.CAMERA_LERP
    camera.position.y += (targetY - camera.position.y) * ROBLOX_CONSTANTS.CAMERA_LERP
    camera.position.z += (targetZ - camera.position.z) * ROBLOX_CONSTANTS.CAMERA_LERP

    // Look at target with slight height offset (Roblox-style)
    camera.lookAt(target[0], target[1] + 0.8, target[2])
  })

  // Set up event listeners for camera control
  useEffect(() => {
    const handleMouseDown = (e) => {
      // Only handle right mouse button for camera rotation on desktop
      if (!isMobile && e.button !== 2) return

      // Prevent default context menu and scrolling
      e.preventDefault()
      e.stopPropagation()

      setIsDragging(true)
      setLastMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseMove = (e) => {
      if (!isDragging) return

      // Prevent default behavior
      e.preventDefault()
      e.stopPropagation()

      const deltaX = (e.clientX - lastMousePosition.x) * 0.01
      const deltaY = (e.clientY - lastMousePosition.y) * 0.01

      setCameraAngle({
        x: cameraAngle.x + deltaX,
        y: Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, cameraAngle.y + deltaY)),
      })

      setLastMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseUp = (e) => {
      // Prevent default behavior
      e.preventDefault()
      e.stopPropagation()

      setIsDragging(false)
    }

    const handleWheel = (e) => {
      // Prevent default scrolling
      e.preventDefault()
      e.stopPropagation()

      // Zoom in/out with mouse wheel
      const newDistance = Math.max(2, Math.min(10, cameraDistance + e.deltaY * 0.01))
      setCameraDistance(newDistance)
    }

    const handleTouchStart = (e) => {
      // Only handle touches on the right side of the screen for camera rotation on mobile
      if (isMobile && e.touches[0].clientX > window.innerWidth / 2) {
        // Prevent default behavior
        e.preventDefault()
        e.stopPropagation()

        setIsDragging(true)
        setLastMousePosition({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      }
    }

    const handleTouchMove = (e) => {
      if (!isDragging) return

      // Prevent default behavior
      e.preventDefault()
      e.stopPropagation()

      const deltaX = (e.touches[0].clientX - lastMousePosition.x) * 0.01
      const deltaY = (e.touches[0].clientY - lastMousePosition.y) * 0.01

      setCameraAngle({
        x: cameraAngle.x + deltaX,
        y: Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, cameraAngle.y + deltaY)),
      })

      setLastMousePosition({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    }

    const handleTouchEnd = (e) => {
      // Prevent default behavior
      e.preventDefault()
      e.stopPropagation()

      setIsDragging(false)
    }

    const handleContextMenu = (e) => {
      // Prevent context menu on right click
      e.preventDefault()
      e.stopPropagation()
    }

    // Add event listeners with passive: false to allow preventDefault()
    if (isMobile) {
      document.addEventListener("touchstart", handleTouchStart, { passive: false })
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleTouchEnd, { passive: false })
    } else {
      document.addEventListener("mousedown", handleMouseDown)
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("wheel", handleWheel, { passive: false })
      document.addEventListener("contextmenu", handleContextMenu)
    }

    return () => {
      // Remove event listeners
      if (isMobile) {
        document.removeEventListener("touchstart", handleTouchStart)
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("touchend", handleTouchEnd)
      } else {
        document.removeEventListener("mousedown", handleMouseDown)
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.removeEventListener("wheel", handleWheel)
        document.removeEventListener("contextmenu", handleContextMenu)
      }
    }
  }, [isDragging, lastMousePosition, cameraAngle, cameraDistance, isMobile])

  return null
}

// Virtual joystick component for mobile controls
function VirtualJoystick({ onMove, size = 120, baseColor = "rgba(0, 0, 0, 0.2)", stickColor = "#FF69B4" }) {
  const joystickRef = useRef(null)
  const knobRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const knobSize = size * 0.4
  const maxDistance = (size - knobSize) / 2

  const handleStart = (clientX, clientY) => {
    if (!joystickRef.current) return

    setIsDragging(true)

    const rect = joystickRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    updateKnobPosition(clientX, clientY, centerX, centerY)
  }

  const handleMove = (clientX, clientY) => {
    if (!isDragging || !joystickRef.current) return

    const rect = joystickRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    updateKnobPosition(clientX, clientY, centerX, centerY)
  }

  const handleEnd = () => {
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
    onMove({ x: 0, y: 0, intensity: 0 })
  }

  const updateKnobPosition = (clientX, clientY, centerX, centerY) => {
    let deltaX = clientX - centerX
    let deltaY = clientY - centerY

    // Calculate distance from center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const intensity = Math.min(1, distance / maxDistance)

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

    onMove({ x: normalizedX, y: normalizedY, intensity })
  }

  // Touch event handlers
  const handleTouchStart = (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }

  // Mouse event handlers
  const handleMouseDown = (e) => {
    handleStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e) => {
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

// Room component with physics - Boutique style for glamour avatar
function GlamourRoom({ onFloorClick, characterPosition, onDeskInteract, onMirrorInteract }) {
  return (
    <group>
      {/* Floor with physics - glossy floor */}
      <RigidBody type="fixed" colliders="cuboid">
        <Plane args={[4, 4]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onClick={onFloorClick} receiveShadow>
          <meshStandardMaterial color="#FFFFFF" metalness={0.3} roughness={0.2} />
        </Plane>
      </RigidBody>

      {/* Walls - boutique style */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1, -2]}>
          <planeGeometry args={[4, 2]} />
          <meshStandardMaterial color="#FFF0F5" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-2, 1, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[4, 2]} />
          <meshStandardMaterial color="#FFF0F5" />
        </mesh>
      </RigidBody>

      {/* Boutique furniture */}
      <GlamourDisplay position={[-1.2, 0, -1.2]} rotation={[0, Math.PI / 4, 0]} />
      <GlamourCounter position={[1, 0, -1]} onInteract={onDeskInteract} characterPosition={characterPosition} />
      <GlamourStool position={[1, 0, -0.4]} rotation={[0, Math.PI, 0]} />
      <GlamourShelf position={[-1.5, 0, 0.5]} />

      {/* Glamour Mirror */}
      <GlamourMirror
        position={[1.8, 0, 0.5]}
        rotation={[0, -Math.PI / 2, 0]}
        characterPosition={characterPosition}
        onInteract={onMirrorInteract}
      />

      {/* Boutique window */}
      <mesh position={[0, 1, -1.99]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#E6E6FA" transparent opacity={0.7} />
      </mesh>

      {/* Window frame */}
      <mesh position={[0, 1, -1.98]}>
        <boxGeometry args={[1.1, 1.1, 0.02]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 1, -1.97]}>
        <boxGeometry args={[1, 0.05, 0.03]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 1, -1.97]}>
        <boxGeometry args={[0.05, 1, 0.03]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Pink rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial color="#FFB6C1" />
      </mesh>

      {/* Decorative elements */}
      <mesh position={[-1, 0.01, 1]}>
        <cylinderGeometry args={[0.2, 0.2, 0.01, 16]} />
        <meshStandardMaterial color="#E0B0FF" />
      </mesh>

      <mesh position={[1, 0.01, 1]}>
        <cylinderGeometry args={[0.15, 0.15, 0.01, 16]} />
        <meshStandardMaterial color="#FFDF00" />
      </mesh>

      {/* Boutique lighting */}
      <pointLight position={[0, 2, 0]} intensity={0.5} color="#FFB6C1" />
      <pointLight position={[1, 1, 1]} intensity={0.3} color="#FFFFFF" />
    </group>
  )
}

// Glamour Mirror component
function GlamourMirror({ position = [0, 0, 0], rotation = [0, 0, 0], characterPosition, onInteract }) {
  const [isNearby, setIsNearby] = useState(false)
  const mirrorRef = useRef()

  useFrame(() => {
    if (mirrorRef.current && characterPosition) {
      const dx = characterPosition[0] - position[0]
      const dz = characterPosition[2] - position[2]
      const distance = Math.sqrt(dx * dx + dz * dz)

      // Check if character is within interaction distance
      setIsNearby(distance < 1.2)
    }
  })

  return (
    <group position={position} rotation={rotation} ref={mirrorRef}>
      {/* Mirror frame - more glamorous */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[1.0, 1.8, 0.1]} />
        <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Mirror glass */}
      <mesh position={[0, 1.2, 0.06]}>
        <boxGeometry args={[0.9, 1.7, 0.01]} />
        <meshStandardMaterial color="#A7C7E7" metalness={0.9} roughness={0.1} envMapIntensity={1} />
      </mesh>

      {/* Decorative elements */}
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[1.1, 0.1, 0.15]} />
        <meshStandardMaterial color="#FFB6C1" />
      </mesh>

      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.1, 0.1, 0.15]} />
        <meshStandardMaterial color="#FFB6C1" />
      </mesh>

      {/* Interaction tooltip */}
      {isNearby && (
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#FF69B4"
          onClick={() => onInteract()}
        >
          ✨ Customize Look ✨
        </Text>
      )}
    </group>
  )
}

// Glamour Counter component
function GlamourCounter({
  position: counterPosition = [0, 0, 0],
  rotation: counterRotation = [0, 0, 0],
  color: counterColor = "#FFB6C1",
  onInteract,
  characterPosition,
}) {
  const [isNearby, setIsNearby] = useState(false)
  const counterRef = useRef()

  useFrame(() => {
    if (counterRef.current && characterPosition) {
      const dx = characterPosition[0] - counterPosition[0]
      const dz = characterPosition[2] - counterPosition[2]
      const distance = Math.sqrt(dx * dx + dz * dz)

      // Check if character is within interaction distance
      setIsNearby(distance < 1.2)
    }
  })

  return (
    <group position={counterPosition} rotation={counterRotation} ref={counterRef}>
      {/* Counter top - glossy */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.8, 0.05, 0.8]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.3} roughness={0.2} />
      </mesh>
      {/* Counter base */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.75, 0.4, 0.75]} />
        <meshStandardMaterial color={counterColor} />
      </mesh>

      {/* Display items */}
      <mesh position={[0.2, 0.5, 0.2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
        <meshStandardMaterial color="#FF69B4" />
      </mesh>

      <mesh position={[-0.2, 0.5, -0.2]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Interaction tooltip */}
      {isNearby && (
        <Text
          position={[0, 1, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#FF69B4"
          onClick={() => {
            onInteract()
            if (Haptics) {
              try {
                Haptics.impact({ style: ImpactStyle.Light })
              } catch (error) {
                console.log("Haptic feedback error:", error)
              }
            }
          }}
        >
          💖 Shop Items 💖
        </Text>
      )}
    </group>
  )
}

// Boutique furniture components
function GlamourDisplay({ position = [0, 0, 0], rotation = [0, 0, 0], color = "#FFB6C1" }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Display base */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1, 0.3, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Display top */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1, 0.05, 1]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.3} roughness={0.2} />
      </mesh>

      {/* Display items */}
      <mesh position={[0.3, 0.5, 0.3]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[-0.3, 0.5, -0.3]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#FF69B4" />
      </mesh>
    </group>
  )
}

function GlamourStool({ position = [0, 0, 0], rotation = [0, 0, 0], color = "#FFB6C1" }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Seat */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Cushion */}
      <mesh position={[0, 0.33, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.05, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Legs */}
      <mesh position={[0.15, 0.15, 0.15]}>
        <boxGeometry args={[0.03, 0.3, 0.03]} />
        <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.15, 0.15, 0.15]}>
        <boxGeometry args={[0.03, 0.3, 0.03]} />
        <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.15, 0.15, -0.15]}>
        <boxGeometry args={[0.03, 0.3, 0.03]} />
        <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.15, 0.15, -0.15]}>
        <boxGeometry args={[0.03, 0.3, 0.03]} />
        <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

function GlamourShelf({ position = [0, 0, 0], rotation = [0, 0, 0], color = "#FFB6C1" }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Shelves */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.8, 0.05, 0.3]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.3} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.8, 0.05, 0.3]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.3} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.8, 0.05, 0.3]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.3} roughness={0.2} />
      </mesh>

      {/* Sides */}
      <mesh position={[0.4, 0.8, 0]}>
        <boxGeometry args={[0.05, 1.6, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.4, 0.8, 0]}>
        <boxGeometry args={[0.05, 1.6, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Display items */}
      <mesh position={[0.2, 0.9, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#FF69B4" />
      </mesh>

      <mesh position={[-0.2, 1.3, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>

      <mesh position={[0.1, 1.7, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Perfume bottle */}
      <mesh position={[-0.2, 0.9, 0]}>
        <cylinderGeometry args={[0.05, 0.03, 0.15, 16]} />
        <meshStandardMaterial color="#FF1493" />
      </mesh>
      <mesh position={[-0.2, 1.0, 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Makeup item */}
      <mesh position={[0.2, 1.3, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.03, 16]} />
        <meshStandardMaterial color="#E0B0FF" />
      </mesh>
      <mesh position={[0.2, 1.33, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.01, 16]} />
        <meshStandardMaterial color="#FF69B4" />
      </mesh>
    </group>
  )
}

// Main MiniRoom3D component
export function MiniRoom3D() {
  const { isMobile } = useMobile()
  const [customization, setCustomization] = useState({
    // Default to pink theme as requested
    skinTone: "#FFDAB9",
    hairStyle: "waves", // long wavy hair
    hairColor: "#FFB6C1", // pastel pink
    eyeColor: "#8B4513", // brown eyes
    lipColor: "#FF0000", // bright red lips
    blushColor: "#FF69B4", // hot pink blush
    outfitStyle: "pink", // pink theme
    outfitColor: "#FF69B4", // hot pink
    accessoryStyle: "sunglasses", // oversized sunglasses
    accessoryColor: "#FFFFFF", // white
    legwearStyle: "fluffy", // fluffy leg warmers
    legwearColor: "#FFFFFF", // white
    shoesStyle: "platforms", // platform heels
    shoesColor: "#FF69B4", // hot pink
    bagStyle: "designer", // small designer bag
    bagColor: "#FFFFFF", // white
    headwearStyle: "beret", // fluffy beret
    headwearColor: "#FFFFFF", // white
    necklaceStyle: "pearls", // pearl necklace
    necklaceColor: "#FFFFFF", // white
    glitterEffect: true, // enable sparkle effect
  })
  const [animation, setAnimation] = useState("idle")
  const [characterPosition, setCharacterPosition] = useState([0, 0, 0])
  const [characterRotation, setCharacterRotation] = useState(0)
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false)
  const { toast } = useToast()
  const appStatus = useAppStatus()

  // Add this inside the MiniRoom3D component function, near the top
  const { isNative, platform: currentPlatform, isTablet, setAppStatus } = appStatus

  // Update the triggerHaptic function to safely handle web environments
  const triggerHaptic = async (intensity = "medium") => {
    if (isNative && Haptics) {
      try {
        const style =
          intensity === "light" ? ImpactStyle?.Light : 
          intensity === "heavy" ? ImpactStyle?.Heavy : 
          ImpactStyle?.Medium;
      
      if (style) {
        await Haptics.impact({ style });
      }
    } catch (error) {
      console.error("Haptic feedback error:", error);
    }
  }

  // Modify the handleMirrorInteract function
  const handleMirrorInteract = () => {
    triggerHaptic("medium")
    setIsCustomizeOpen(true)
  }

  // Modify the handleCounterInteract function
  const handleCounterInteract = () => {
    triggerHaptic("medium")
    setIsShopOpen(true)
  }

  // Add platform-specific adjustments
  useEffect(() => {
    // Adjust camera position for different devices
    if (isTablet) {
      // Adjust for tablets - slightly further back camera
      // This would be implemented in the camera component
    }

    // Optimize performance for mobile
    if (isNative) {
      // Reduce particle effects or other heavy visual elements on mobile
      setCustomization((prev) => ({
        ...prev,
        glitterEffect: currentPlatform === "ios" ? prev.glitterEffect : false, // Disable glitter on Android for performance
      }))
    }
  }, [isNative, currentPlatform, isTablet])

  // Controls state with Roblox-like mechanics
  const [controls, setControls] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    run: false,
  })

  // Joystick controls for mobile
  const [joystickControls, setJoystickControls] = useState({ x: 0, y: 0, intensity: 0 })

  // Handle keyboard controls with Roblox-like input
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "w":
        case "ArrowUp":
          setControls((prev) => ({ ...prev, forward: true }))
          break
        case "s":
        case "ArrowDown":
          setControls((prev) => ({ ...prev, backward: true }))
          break
        case "a":
        case "ArrowLeft":
          setControls((prev) => ({ ...prev, left: true }))
          break
        case "d":
        case "ArrowRight":
          setControls((prev) => ({ ...prev, right: true }))
          break
        case " ":
          setControls((prev) => ({ ...prev, jump: true }))
          break
        case "Shift":
          setControls((prev) => ({ ...prev, run: true }))
          break
      }
    }

    const handleKeyUp = (e) => {
      switch (e.key) {
        case "w":
        case "ArrowUp":
          setControls((prev) => ({ ...prev, forward: false }))
          break
        case "s":
        case "ArrowDown":
          setControls((prev) => ({ ...prev, backward: false }))
          break
        case "a":
        case "ArrowLeft":
          setControls((prev) => ({ ...prev, left: false }))
          break
        case "d":
        case "ArrowRight":
          setControls((prev) => ({ ...prev, right: false }))
          break
        case " ":
          setControls((prev) => ({ ...prev, jump: false }))
          break
        case "Shift":
          setControls((prev) => ({ ...prev, run: false }))
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Handle joystick movement
  const handleJoystickMove = ({ x, y, intensity }) => {
    setJoystickControls({ x, y, intensity })
  }

  // Handle character movement and animation
  const handleCharacterUpdate = (update) => {
    if (update.position) {
      setCharacterPosition(update.position)
    }
    if (update.rotation !== undefined) {
      setCharacterRotation(update.rotation)
    }
    if (update.animation) {
      setAnimation(update.animation)
    }
  }

  // Handle floor click for point-and-click movement
  const handleFloorClick = (event) => {
    // Get intersection point
    const [x, , z] = event.point.toArray()

    // Calculate direction to clicked point
    const dx = x - characterPosition[0]
    const dz = z - characterPosition[2]
    const angle = Math.atan2(dx, dz)

    // Set character rotation to face clicked point
    setCharacterRotation(angle)
  }

  useEffect(() => {
    if (setAppStatus) {
      setAppStatus({
        isMiniRoomLoaded: true,
      })
    }
  }, [setAppStatus])

  // Add a container div with CSS to prevent scrolling when interacting with the mini room
  return (
    <div
      className="w-full h-full relative"
      style={{
        // Only prevent touch actions within this container
        touchAction: "none",
        // Don't affect scrolling outside this container
        overscrollBehavior: "contain",
      }}
    >
      <Canvas
        shadows
        camera={{
          position: isMobile ? [0, 2.5, 3.5] : [0, 2, 3],
          fov: isMobile ? 60 : 50,
        }}
        onCreated={({ gl }) => {
          // Only prevent default behaviors on the canvas element itself
          const canvas = gl.domElement

          // Prevent scrolling only when interacting with the canvas
          canvas.addEventListener(
            "touchmove",
            (e) => {
              e.preventDefault()
            },
            { passive: false },
          )

          canvas.addEventListener(
            "wheel",
            (e) => {
              e.preventDefault()
            },
            { passive: false },
          )
        }}
        style={{ touchAction: "none" }}
      >
        <Suspense fallback={null}>
          {/* Use Roblox-style camera instead of OrbitControls */}
          <RobloxCamera target={characterPosition} isMobile={isMobile} />

          <ambientLight intensity={0.5} />
          <directionalLight position={[1, 2, 3]} intensity={1} castShadow />

          {/* Pink-tinted lighting for boutique feel */}
          <pointLight position={[0, 2, 0]} intensity={0.3} color="#FFB6C1" />

          <Physics>
            <GlamourRoom
              onFloorClick={handleFloorClick}
              characterPosition={characterPosition}
              onDeskInteract={handleCounterInteract}
              onMirrorInteract={handleMirrorInteract}
            />

            <DTICharacter
              position={[0, 0, 0]}
              customization={customization}
              animation={animation}
              username="You"
              isCurrentUser={true}
              onMove={handleCharacterUpdate}
              controls={controls}
              joystickControls={joystickControls}
            />
          </Physics>
        </Suspense>
      </Canvas>

      {/* Mobile Controls */}
      {isMobile && (
        <div
          className="absolute bottom-32 left-8"
          style={{ touchAction: "none" }} // Prevent touch scrolling
        >
          <VirtualJoystick onMove={handleJoystickMove} />
        </div>
      )}

      {/* Jump Button for Mobile */}
      {isMobile && (
        <div
          className="absolute bottom-32 right-8"
          style={{ touchAction: "none" }} // Prevent touch scrolling
        >
          <button
            className="w-16 h-16 bg-pink-500 rounded-full text-white text-xl font-bold"
            onTouchStart={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setControls((prev) => ({ ...prev, jump: true }))
              if (Haptics) {
                try {
                  Haptics.impact({ style: ImpactStyle.Light })
                } catch (error) {
                  console.log("Haptic feedback error:", error)
                }
              }
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setControls((prev) => ({ ...prev, jump: false }))
            }}
          >
            Jump
          </button>
        </div>
      )}

      {/* Run Button for Mobile */}
      {isMobile && (
        <div
          className="absolute bottom-32 right-28"
          style={{ touchAction: "none" }} // Prevent touch scrolling
        >
          <button
            className="w-16 h-16 bg-purple-500 rounded-full text-white text-xl font-bold"
            onTouchStart={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setControls((prev) => ({ ...prev, run: true }))
              if (Haptics) {
                try {
                  Haptics.impact({ style: ImpactStyle.Light })
                } catch (error) {
                  console.log("Haptic feedback error:", error)
                }
              }
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setControls((prev) => ({ ...prev, run: false }))
            }}
          >
            Run
          </button>
        </div>
      )}

      {/* Character Customization Dialog */}
      {isCustomizeOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-semibold mb-4 text-pink-500">Customize Your Look</h2>

            <CharacterPreview customization={customization} />

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Skin Tone:</label>
              <div className="flex gap-2">
                {["#FFDAB9", "#F5DEB3", "#D2B48C", "#CD853F", "#8B4513", "#FFFFFF"].map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded-full cursor-pointer ${customization.skinTone === color ? "ring-2 ring-offset-2 ring-pink-500" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCustomization({ ...customization, skinTone: color })}
                  />
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Hair Style:</label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={customization.hairStyle}
                onChange={(e) => setCustomization({ ...customization, hairStyle: e.target.value })}
              >
                <option value="waves">Long Waves</option>
                <option value="ponytail">High Ponytail</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Hair Color:</label>
              <div className="flex gap-2">
                {["#FFB6C1", "#FFC0CB", "#E6E6FA", "#FFD700", "#C0C0C0", "#FF69B4"].map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded-full cursor-pointer ${customization.hairColor === color ? "ring-2 ring-offset-2 ring-pink-500" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCustomization({ ...customization, hairColor: color })}
                  />
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Lip Color:</label>
              <div className="flex gap-2">
                {["#FF0000", "#FF1493", "#FF69B4", "#FFB6C1", "#C71585", "#DB7093"].map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded-full cursor-pointer ${customization.lipColor === color ? "ring-2 ring-offset-2 ring-pink-500" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCustomization({ ...customization, lipColor: color })}
                  />
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Outfit Color:</label>
              <div className="flex gap-2">
                {["#FF69B4", "#FF1493", "#FFB6C1", "#FFC0CB", "#DB7093", "#C71585"].map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded-full cursor-pointer ${customization.outfitColor === color ? "ring-2 ring-offset-2 ring-pink-500" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCustomization({ ...customization, outfitColor: color })}
                  />
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Accessories:</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sunglasses"
                    checked={customization.accessoryStyle === "sunglasses"}
                    onChange={(e) =>
                      setCustomization({
                        ...customization,
                        accessoryStyle: e.target.checked ? "sunglasses" : "none",
                      })
                    }
                    className="mr-2"
                  />
                  <label htmlFor="sunglasses">Sunglasses</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="beret"
                    checked={customization.headwearStyle === "beret"}
                    onChange={(e) =>
                      setCustomization({
                        ...customization,
                        headwearStyle: e.target.checked ? "beret" : "none",
                      })
                    }
                    className="mr-2"
                  />
                  <label htmlFor="beret">Fluffy Beret</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pearls"
                    checked={customization.necklaceStyle === "pearls"}
                    onChange={(e) =>
                      setCustomization({
                        ...customization,
                        necklaceStyle: e.target.checked ? "pearls" : "none",
                      })
                    }
                    className="mr-2"
                  />
                  <label htmlFor="pearls">Pearl Necklace</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="bag"
                    checked={customization.bagStyle === "designer"}
                    onChange={(e) =>
                      setCustomization({
                        ...customization,
                        bagStyle: e.target.checked ? "designer" : "none",
                      })
                    }
                    className="mr-2"
                  />
                  <label htmlFor="bag">Designer Bag</label>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Legwear & Shoes:</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={customization.legwearStyle}
                    onChange={(e) => setCustomization({ ...customization, legwearStyle: e.target.value })}
                  >
                    <option value="fluffy">Fluffy Leg Warmers</option>
                    <option value="none">Bare Legs</option>
                  </select>
                </div>
                <div>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={customization.shoesStyle}
                    onChange={(e) => setCustomization({ ...customization, shoesStyle: e.target.value })}
                  >
                    <option value="platforms">Platform Heels</option>
                    <option value="heels">Regular Heels</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={customization.glitterEffect}
                  onChange={(e) => setCustomization({ ...customization, glitterEffect: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-gray-700 font-bold">Sparkly Glitter Effect</span>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                type="button"
                onClick={() => {
                  setIsCustomizeOpen(false)
                  if (Haptics) {
                    try {
                      Haptics.impact({ style: ImpactStyle.Light })
                    } catch (error) {
                      console.log("Haptic feedback error:", error)
                    }
                  }
                }}
              >
                Save Look
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={() => setIsCustomizeOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shop Dialog */}
      {isShopOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-semibold mb-4 text-pink-500">Glamour Boutique</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-pink-50 p-3 rounded-lg text-center">
                <div className="w-full h-24 bg-pink-200 rounded-lg mb-2 flex items-center justify-center">
                  <span className="text-3xl">👗</span>
                </div>
                <p className="font-semibold">Sparkly Dress</p>
                <p className="text-pink-500 font-bold">$25.99</p>
              </div>
              <div className="bg-pink-50 p-3 rounded-lg text-center">
                <div className="w-full h-24 bg-pink-200 rounded-lg mb-2 flex items-center justify-center">
                  <span className="text-3xl">👜</span>
                </div>
                <p className="font-semibold">Designer Bag</p>
                <p className="text-pink-500 font-bold">$19.99</p>
              </div>
              <div className="bg-pink-50 p-3 rounded-lg text-center">
                <div className="w-full h-24 bg-pink-200 rounded-lg mb-2 flex items-center justify-center">
                  <span className="text-3xl">👢</span>
                </div>
                <p className="font-semibold">Platform Heels</p>
                <p className="text-pink-500 font-bold">$29.99</p>
              </div>
              <div className="bg-pink-50 p-3 rounded-lg text-center">
                <div className="w-full h-24 bg-pink-200 rounded-lg mb-2 flex items-center justify-center">
                  <span className="text-3xl">👒</span>
                </div>
                <p className="font-semibold">Fluffy Beret</p>
                <p className="text-pink-500 font-bold">$15.99</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={() => {
                  toast({
                    title: "Items purchased!",
                    description: "Your glamorous items have been added to your inventory.",
                  })
                  setIsShopOpen(false)
                  if (Haptics) {
                    try {
                      Haptics.impact({ style: ImpactStyle.Light })
                    } catch (error) {
                      console.log("Haptic feedback error:", error)
                    }
                  }
                }}
              >
                Purchase
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
                type="button"
                onClick={() => setIsShopOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Menu */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex-1">
            <Button
              onClick={() => {
                setIsCustomizeOpen(true)
                if (Haptics) {
                  try {
                    Haptics.impact({ style: ImpactStyle.Light })
                  } catch (error) {
                    console.log("Haptic feedback error:", error)
                  }
                }
              }}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white"
            >
              Customize Look
            </Button>
          </div>
          <div className="flex-1">
            <Button
              onClick={() => {
                setAnimation(animation === "idle" ? "dance" : "idle")
                if (Haptics) {
                  try {
                    Haptics.impact({ style: ImpactStyle.Light })
                  } catch (error) {
                    console.log("Haptic feedback error:", error)
                  }
                }
              }}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white"
            >
              {animation === "idle" ? "Strike a Pose" : "Stop Posing"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
