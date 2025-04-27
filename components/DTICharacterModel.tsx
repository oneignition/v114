"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"

// DTI Character Model - Styled after Dress to Impress characters
export function DTICharacterModel({
  characterConfig,
  animation,
  isJumping,
}: {
  characterConfig: any
  animation: string
  isJumping: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)

  // Animation timing
  useFrame((state) => {
    if (!groupRef.current) return

    const t = state.clock.getElapsedTime()

    // Reset all animations
    if (headRef.current) {
      headRef.current.position.y = 1.7
      headRef.current.rotation.set(0, 0, 0)
    }

    if (bodyRef.current) {
      bodyRef.current.position.y = 1.0 // Lower body position for DTI proportions
      bodyRef.current.rotation.set(0, 0, 0)
    }

    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = 0
      rightLegRef.current.rotation.x = 0
    }

    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.x = 0
      rightArmRef.current.rotation.x = 0
      leftArmRef.current.rotation.z = Math.PI / 6
      rightArmRef.current.rotation.z = -Math.PI / 6
    }

    // Apply animations based on state
    if (animation === "idle") {
      // Subtle breathing animation
      if (bodyRef.current) {
        bodyRef.current.position.y = 1.0 + Math.sin(t * 1.5) * 0.02
      }

      if (headRef.current) {
        headRef.current.position.y = 1.7 + Math.sin(t * 1.5) * 0.02
        headRef.current.rotation.z = Math.sin(t * 0.5) * 0.02
      }

      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.z = Math.PI / 6 + Math.sin(t * 1.5) * 0.05
        rightArmRef.current.rotation.z = -Math.PI / 6 - Math.sin(t * 1.5) * 0.05
      }
    } else if (animation === "walk") {
      // Walking animation
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(t * 5) * 0.5
        rightLegRef.current.rotation.x = -Math.sin(t * 5) * 0.5
      }

      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -Math.sin(t * 5) * 0.25
        rightArmRef.current.rotation.x = Math.sin(t * 5) * 0.25
      }

      if (bodyRef.current) {
        bodyRef.current.position.y = 1.0 + Math.abs(Math.sin(t * 10)) * 0.05
        bodyRef.current.rotation.z = Math.sin(t * 5) * 0.05
      }

      if (headRef.current) {
        headRef.current.position.y = 1.7 + Math.abs(Math.sin(t * 10)) * 0.05
        headRef.current.rotation.z = -Math.sin(t * 5) * 0.05
      }
    } else if (animation === "run") {
      // Running animation - faster and more exaggerated
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(t * 8) * 0.8
        rightLegRef.current.rotation.x = -Math.sin(t * 8) * 0.8
      }

      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -Math.sin(t * 8) * 0.5
        rightArmRef.current.rotation.x = Math.sin(t * 8) * 0.5
      }

      if (bodyRef.current) {
        bodyRef.current.position.y = 1.0 + Math.abs(Math.sin(t * 16)) * 0.08
        bodyRef.current.rotation.z = Math.sin(t * 8) * 0.08
      }

      if (headRef.current) {
        headRef.current.position.y = 1.7 + Math.abs(Math.sin(t * 16)) * 0.08
        headRef.current.rotation.z = -Math.sin(t * 8) * 0.08
      }
    } else if (animation === "jump" || isJumping) {
      // Jump animation
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = -0.3
        rightLegRef.current.rotation.x = -0.3
      }

      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -0.5
        rightArmRef.current.rotation.x = -0.5
        leftArmRef.current.rotation.z = Math.PI / 4
        rightArmRef.current.rotation.z = -Math.PI / 4
      }
    } else if (animation === "dance") {
      // Dance animation
      if (bodyRef.current) {
        bodyRef.current.rotation.y = Math.sin(t * 3) * 0.2
      }

      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(t * 6) * 0.15
      }

      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.z = Math.PI / 4 + Math.sin(t * 6) * 0.5
        rightArmRef.current.rotation.z = -Math.PI / 4 - Math.sin(t * 6) * 0.5
        leftArmRef.current.rotation.x = Math.sin(t * 3) * 0.5
        rightArmRef.current.rotation.x = Math.sin(t * 3 + Math.PI) * 0.5
      }

      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(t * 6) * 0.2
        rightLegRef.current.rotation.x = -Math.sin(t * 6) * 0.2
      }
    }
  })

  return (
    <group ref={groupRef}>
      {/* Head - Much larger head with exaggerated features like DTI */}
      <group ref={headRef} position={[0, 1.7, 0]}>
        {/* Head base - larger and more oval shaped */}
        <mesh>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color={characterConfig.bodyColor} />
        </mesh>

        {/* Face features - DTI style with big eyes and lips */}
        <DTIFace position={[0, 0, 0.25]} faceStyle={characterConfig.faceStyle} bodyColor={characterConfig.bodyColor} />

        {/* Hair - DTI style with more volume */}
        <DTIHair hairStyle={characterConfig.hairStyle} hairColor={characterConfig.hairColor} />

        {/* Accessories */}
        {characterConfig.accessory !== "none" && (
          <DTIAccessory accessory={characterConfig.accessory} color={characterConfig.accessoryColor} />
        )}
      </group>

      {/* Body - Much thinner torso for DTI proportions */}
      <group ref={bodyRef} position={[0, 1.0, 0]}>
        <DTIOutfit
          category={characterConfig.category}
          outfit={characterConfig.outfit}
          outfitColor={characterConfig.outfitColor}
          bodyColor={characterConfig.bodyColor}
        />
      </group>

      {/* Arms - Thinner and longer for DTI proportions */}
      <group ref={leftArmRef} position={[-0.18, 1.2, 0]}>
        <mesh rotation={[0, 0, Math.PI / 6]}>
          <capsuleGeometry args={[0.04, 0.6, 8, 8]} />
          <meshStandardMaterial color={characterConfig.bodyColor} />
        </mesh>

        {/* Hand */}
        <mesh position={[-0.15, -0.3, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color={characterConfig.bodyColor} />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[0.18, 1.2, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 6]}>
          <capsuleGeometry args={[0.04, 0.6, 8, 8]} />
          <meshStandardMaterial color={characterConfig.bodyColor} />
        </mesh>

        {/* Hand */}
        <mesh position={[0.15, -0.3, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color={characterConfig.bodyColor} />
        </mesh>
      </group>

      {/* Legs - Much longer and thinner for DTI proportions */}
      <group ref={leftLegRef} position={[-0.08, 0.4, 0]}>
        <DTILeg
          side="left"
          legwear={characterConfig.legwear}
          legwearColor={characterConfig.legwearColor}
          bodyColor={characterConfig.bodyColor}
          shoesStyle={characterConfig.shoesStyle}
          shoesColor={characterConfig.shoesColor}
        />
      </group>

      <group ref={rightLegRef} position={[0.08, 0.4, 0]}>
        <DTILeg
          side="right"
          legwear={characterConfig.legwear}
          legwearColor={characterConfig.legwearColor}
          bodyColor={characterConfig.bodyColor}
          shoesStyle={characterConfig.shoesStyle}
          shoesColor={characterConfig.shoesColor}
        />
      </group>
    </group>
  )
}

// DTI Face component - Exaggerated features like in Dress to Impress
function DTIFace({
  position = [0, 0, 0],
  faceStyle,
  bodyColor,
}: { position: [number, number, number]; faceStyle: string; bodyColor: string }) {
  const faceRef = useRef<THREE.Group>(null)

  return (
    <group position={position as any} ref={faceRef}>
      {/* Big eyes - much larger for DTI style */}
      <mesh position={[-0.2, 0.05, 0.2]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.2, 0.05, 0.2]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Iris and pupils - larger and more colorful */}
      <mesh position={[-0.2, 0.05, 0.35]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color={faceStyle === "cute" ? "#FF69B4" : "#6B4226"} />
      </mesh>
      <mesh position={[0.2, 0.05, 0.35]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color={faceStyle === "cute" ? "#FF69B4" : "#6B4226"} />
      </mesh>

      {/* Pupils - larger */}
      <mesh position={[-0.2, 0.05, 0.45]}>
        <sphereGeometry args={[0.06, 32, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.2, 0.05, 0.45]}>
        <sphereGeometry args={[0.06, 32, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* Eye highlights - larger and more prominent */}
      <mesh position={[-0.25, 0.1, 0.5]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.15, 0.1, 0.5]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Eyelashes - more dramatic for DTI style */}
      <mesh position={[-0.2, 0.2, 0.35]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.03, 0.02]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.2, 0.2, 0.35]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.03, 0.02]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* Nose - very small like DTI style */}
      <mesh position={[0, -0.05, 0.4]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* Lips - much fuller for DTI style */}
      {faceStyle === "cute" ? (
        // Cute small mouth
        <mesh position={[0, -0.25, 0.4]}>
          <boxGeometry args={[0.15, 0.03, 0.02]} />
          <meshStandardMaterial color="#FF1493" />
        </mesh>
      ) : (
        // Full lips - much larger and more prominent
        <group position={[0, -0.25, 0.4]}>
          <mesh>
            <sphereGeometry args={[0.15, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#FF1493" />
          </mesh>
        </group>
      )}

      {/* Blush - more prominent */}
      <mesh position={[-0.3, -0.1, 0.2]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#FF9999" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.3, -0.1, 0.2]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#FF9999" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

// DTI Hair component - More voluminous and styled like in Dress to Impress
function DTIHair({ hairStyle, hairColor }: { hairStyle: string; hairColor: string }) {
  switch (hairStyle) {
    case "long":
      return (
        <group>
          {/* Base hair - larger and more voluminous */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.62, 32, 32]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>

          {/* Long flowing hair - more voluminous and wavy */}
          <mesh position={[0, -0.6, -0.1]}>
            <capsuleGeometry args={[0.4, 1.2, 16, 16]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>

          {/* Side hair strands - more defined */}
          <mesh position={[-0.4, -0.3, 0.1]}>
            <capsuleGeometry args={[0.15, 0.7, 8, 8]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>
          <mesh position={[0.4, -0.3, 0.1]}>
            <capsuleGeometry args={[0.15, 0.7, 8, 8]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>

          {/* Front bangs - DTI style often has defined bangs */}
          <mesh position={[0, 0.2, 0.4]}>
            <boxGeometry args={[0.8, 0.2, 0.2]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>
        </group>
      )

    case "pigtails":
      return (
        <group>
          {/* Base hair - larger */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.62, 32, 32]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>

          {/* Left pigtail - more defined and voluminous */}
          <mesh position={[-0.5, 0.1, 0]}>
            <capsuleGeometry args={[0.2, 0.8, 8, 8]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>

          {/* Right pigtail - more defined and voluminous */}
          <mesh position={[0.5, 0.1, 0]}>
            <capsuleGeometry args={[0.2, 0.8, 8, 8]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>

          {/* Front bangs */}
          <mesh position={[0, 0.2, 0.4]}>
            <boxGeometry args={[0.8, 0.2, 0.2]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>
        </group>
      )

    case "bob":
      return (
        <group>
          {/* Bob cut - more defined and styled */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.0, 0.9, 0.9]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>

          {/* Front bangs */}
          <mesh position={[0, 0.2, 0.4]}>
            <boxGeometry args={[0.8, 0.2, 0.2]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>
        </group>
      )

    case "ponytail":
      return (
        <group>
          {/* Base hair - larger */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.62, 32, 32]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>

          {/* Ponytail - more defined and voluminous */}
          <mesh position={[0, 0.2, -0.4]}>
            <capsuleGeometry args={[0.25, 1.0, 16, 16]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>

          {/* Front bangs */}
          <mesh position={[0, 0.2, 0.4]}>
            <boxGeometry args={[0.8, 0.2, 0.2]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>
        </group>
      )

    case "bangs":
      return (
        <group>
          {/* Base hair - larger */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.62, 32, 32]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>

          {/* Bangs - more defined and styled */}
          <mesh position={[0, 0.2, 0.4]}>
            <boxGeometry args={[0.9, 0.3, 0.3]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>

          {/* Long hair in back */}
          <mesh position={[0, -0.5, -0.1]}>
            <capsuleGeometry args={[0.4, 1.0, 16, 16]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>
        </group>
      )

    default:
      return (
        <group>
          {/* Default hair - larger and more styled */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.62, 32, 32]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>

          {/* Front styling */}
          <mesh position={[0, 0.2, 0.4]}>
            <boxGeometry args={[0.8, 0.2, 0.2]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>
        </group>
      )
  }
}

// DTI Accessory component - More stylized and prominent
function DTIAccessory({ accessory, color }: { accessory: string; color: string }) {
  switch (accessory) {
    case "bow":
      return (
        <group position={[0, 0.5, 0]}>
          {/* Bow center */}
          <mesh>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshStandardMaterial color={color} />
          </mesh>

          {/* Bow left loop - larger */}
          <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.15, 0.06, 16, 16, Math.PI]} />
            <meshStandardMaterial color={color} />
          </mesh>

          {/* Bow right loop - larger */}
          <mesh position={[0.2, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <torusGeometry args={[0.15, 0.06, 16, 16, Math.PI]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      )

    case "glasses":
      return (
        <group position={[0, 0.05, 0.45]}>
          {/* Left lens - cat eye style */}
          <mesh position={[-0.2, 0, 0]}>
            <torusGeometry args={[0.15, 0.03, 16, 16, Math.PI * 2]} />
            <meshStandardMaterial color={color} />
          </mesh>

          {/* Right lens - cat eye style */}
          <mesh position={[0.2, 0, 0]}>
            <torusGeometry args={[0.15, 0.03, 16, 16, Math.PI * 2]} />
            <meshStandardMaterial color={color} />
          </mesh>

          {/* Bridge */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.15, 0.03, 0.03]} />
            <meshStandardMaterial color={color} />
          </mesh>

          {/* Temples */}
          <mesh position={[-0.35, 0, -0.15]}>
            <boxGeometry args={[0.03, 0.03, 0.4]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0.35, 0, -0.15]}>
            <boxGeometry args={[0.03, 0.03, 0.4]} />
            <meshStandardMaterial color={color} />
          </mesh>

          {/* Cat eye corners - distinctive DTI style */}
          <mesh position={[-0.3, 0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.1, 0.03, 0.03]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0.3, 0.1, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.1, 0.03, 0.03]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      )

    case "hat":
      return (
        <group position={[0, 0.4, 0]}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.5, 0.55, 0.15, 32]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 0.25, 32]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      )

    case "headphones":
      return (
        <group>
          {/* Headband - larger */}
          <mesh position={[0, 0.4, 0]}>
            <torusGeometry args={[0.5, 0.04, 16, 16, Math.PI]} />
            <meshStandardMaterial color={color} />
          </mesh>

          {/* Left earpiece - larger */}
          <mesh position={[-0.5, 0, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>

          {/* Right earpiece - larger */}
          <mesh position={[0.5, 0, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      )

    case "catears":
      return (
        <group position={[0, 0.5, 0]}>
          {/* Left ear */}
          <mesh position={[-0.3, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
            <coneGeometry args={[0.15, 0.3, 32]} />
            <meshStandardMaterial color="black" />
          </mesh>

          {/* Right ear */}
          <mesh position={[0.3, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <coneGeometry args={[0.15, 0.3, 32]} />
            <meshStandardMaterial color="black" />
          </mesh>
        </group>
      )

    default:
      return null
  }
}

// DTI Outfit component - More stylized and fashion-forward
function DTIOutfit({
  category,
  outfit,
  outfitColor,
  bodyColor,
}: { category: string; outfit: string; outfitColor: string; bodyColor: string }) {
  switch (category) {
    case "denim":
      return (
        <group>
          {/* Denim top - cropped */}
          <mesh position={[0, 0.2, 0]}>
            <capsuleGeometry args={[0.12, 0.15, 16, 8]} />
            <meshStandardMaterial color="#5F9EA0" />
          </mesh>

          {/* Exposed midriff */}
          <mesh position={[0, 0, 0]}>
            <capsuleGeometry args={[0.1, 0.1, 16, 8]} />
            <meshStandardMaterial color={bodyColor} />
          </mesh>

          {/* Denim bottom - flared jeans */}
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.2, 0.3, 0.6, 16]} />
            <meshStandardMaterial color="#4682B4" />
          </mesh>
        </group>
      )

    case "streetwear":
      return (
        <group>
          {/* Streetwear top - cropped */}
          <mesh position={[0, 0.2, 0]}>
            <capsuleGeometry args={[0.12, 0.15, 16, 8]} />
            <meshStandardMaterial color="#000000" />
          </mesh>

          {/* Exposed midriff */}
          <mesh position={[0, 0, 0]}>
            <capsuleGeometry args={[0.1, 0.1, 16, 8]} />
            <meshStandardMaterial color={bodyColor} />
          </mesh>

          {/* Streetwear bottom - baggy pants */}
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.6, 16]} />
            <meshStandardMaterial color="#696969" />
          </mesh>
        </group>
      )

    case "popstar":
      return (
        <group>
          {/* Popstar crop top - very short */}
          <mesh position={[0, 0.2, 0]}>
            <capsuleGeometry args={[0.12, 0.1, 16, 8]} />
            <meshStandardMaterial color={outfitColor} />
          </mesh>

          {/* Exposed midriff - more exposed */}
          <mesh position={[0, 0, 0]}>
            <capsuleGeometry args={[0.1, 0.15, 16, 8]} />
            <meshStandardMaterial color={bodyColor} />
          </mesh>

          {/* Popstar pants/skirt - flared */}
          <mesh position={[0, -0.4, 0]}>
            <coneGeometry args={[0.3, 0.5, 16, 1, false, 0, Math.PI * 2]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </group>
      )

    case "fitness":
      return (
        <group>
          {/* Sports bra */}
          <mesh position={[0, 0.2, 0]}>
            <capsuleGeometry args={[0.12, 0.1, 16, 8]} />
            <meshStandardMaterial color={outfitColor} />
          </mesh>

          {/* Exposed midriff */}
          <mesh position={[0, 0, 0]}>
            <capsuleGeometry args={[0.1, 0.15, 16, 8]} />
            <meshStandardMaterial color={bodyColor} />
          </mesh>

          {/* Fitness leggings - tight */}
          <mesh position={[0, -0.4, 0]}>
            <capsuleGeometry args={[0.12, 0.5, 16, 8]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </group>
      )

    case "soft":
      return (
        <group>
          {/* Soft pastel dress - fluffy and cute */}
          <mesh position={[0, -0.1, 0]}>
            <coneGeometry args={[0.3, 0.8, 16, 1, false, 0, Math.PI * 2]} />
            <meshStandardMaterial color="#FFE4E1" />
          </mesh>

          {/* Upper body */}
          <mesh position={[0, 0.2, 0]}>
            <capsuleGeometry args={[0.12, 0.1, 16, 8]} />
            <meshStandardMaterial color="#FFE4E1" />
          </mesh>

          {/* Fluffy trim */}
          <mesh position={[0, -0.5, 0]}>
            <torusGeometry args={[0.3, 0.05, 16, 16]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </group>
      )

    case "school":
      return (
        <group>
          {/* School uniform top */}
          <mesh position={[0, 0.2, 0]}>
            <capsuleGeometry args={[0.12, 0.15, 16, 8]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>

          {/* School skirt - pleated */}
          <mesh position={[0, -0.3, 0]}>
            <coneGeometry args={[0.25, 0.4, 16, 1, false, 0, Math.PI * 2]} />
            <meshStandardMaterial color="#000000" />
          </mesh>

          {/* Collar */}
          <mesh position={[0, 0.3, 0.1]}>
            <boxGeometry args={[0.2, 0.05, 0.05]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </group>
      )

    case "pink":
      return (
        <group>
          {/* Pink dress - cute and stylish */}
          <mesh position={[0, -0.1, 0]}>
            <coneGeometry args={[0.25, 0.8, 16, 1, false, 0, Math.PI * 2]} />
            <meshStandardMaterial color="#FF69B4" />
          </mesh>

          {/* Top detail */}
          <mesh position={[0, 0.2, 0.05]}>
            <boxGeometry args={[0.25, 0.15, 0.05]} />
            <meshStandardMaterial color="#FF1493" />
          </mesh>

          {/* Cute bow */}
          <mesh position={[0, 0, 0.15]}>
            <boxGeometry args={[0.1, 0.05, 0.05]} />
            <meshStandardMaterial color="#FF1493" />
          </mesh>
        </group>
      )

    default:
      // Default outfit based on outfit type
      switch (outfit) {
        case "dress":
          return (
            <group>
              {/* Dress - more stylized */}
              <mesh position={[0, -0.1, 0]}>
                <coneGeometry args={[0.25, 0.8, 16, 1, false, 0, Math.PI * 2]} />
                <meshStandardMaterial color={outfitColor} />
              </mesh>

              {/* Upper body */}
              <mesh position={[0, 0.2, 0]}>
                <capsuleGeometry args={[0.12, 0.1, 16, 8]} />
                <meshStandardMaterial color={outfitColor} />
              </mesh>
            </group>
          )

        case "skirt":
          return (
            <group>
              {/* Top - cropped */}
              <mesh position={[0, 0.2, 0]}>
                <capsuleGeometry args={[0.12, 0.15, 16, 8]} />
                <meshStandardMaterial color={outfitColor} />
              </mesh>

              {/* Skirt - flared */}
              <mesh position={[0, -0.3, 0]}>
                <coneGeometry args={[0.3, 0.4, 16, 1, false, 0, Math.PI * 2]} />
                <meshStandardMaterial color={outfitColor} />
              </mesh>
            </group>
          )

        case "crop-top":
          return (
            <group>
              {/* Crop top - very short */}
              <mesh position={[0, 0.2, 0]}>
                <capsuleGeometry args={[0.12, 0.1, 16, 8]} />
                <meshStandardMaterial color={outfitColor} />
              </mesh>

              {/* Exposed midriff - more exposed */}
              <mesh position={[0, 0, 0]}>
                <capsuleGeometry args={[0.1, 0.15, 16, 8]} />
                <meshStandardMaterial color={bodyColor} />
              </mesh>

              {/* Bottom - tight */}
              <mesh position={[0, -0.4, 0]}>
                <boxGeometry args={[0.25, 0.5, 0.15]} />
                <meshStandardMaterial color="#6E7B8B" />
              </mesh>
            </group>
          )

        case "pants":
          return (
            <group>
              {/* Top - cropped */}
              <mesh position={[0, 0.2, 0]}>
                <capsuleGeometry args={[0.12, 0.15, 16, 8]} />
                <meshStandardMaterial color={outfitColor} />
              </mesh>

              {/* Pants - flared */}
              <mesh position={[0, -0.4, 0]}>
                <cylinderGeometry args={[0.15, 0.25, 0.6, 16]} />
                <meshStandardMaterial color={outfitColor === "#FFB6C1" ? "#6E7B8B" : outfitColor} />
              </mesh>
            </group>
          )

        default: // Default casual
          return (
            <group>
              {/* Body - stylized */}
              <mesh position={[0, 0, 0]}>
                <capsuleGeometry args={[0.12, 0.3, 16, 8]} />
                <meshStandardMaterial color={outfitColor} />
              </mesh>
            </group>
          )
      }
  }
}

// DTI Leg component - Much longer and thinner
function DTILeg({
  side,
  legwear,
  legwearColor,
  bodyColor,
  shoesStyle,
  shoesColor,
}: {
  side: string
  legwear: string
  legwearColor: string
  bodyColor: string
  shoesStyle: string
  shoesColor: string
}) {
  const legOffset = side === "left" ? -0.05 : 0.05

  return (
    <group position={[legOffset, 0, 0]}>
      {/* Leg - much longer and thinner */}
      {legwear === "leggings" || legwear === "pantyhose" || legwear === "boots" ? (
        <mesh position={[0, -0.7, 0]}>
          <capsuleGeometry args={[0.04, 1.4, 8, 8]} />
          <meshStandardMaterial
            color={legwearColor}
            transparent={legwear === "pantyhose"}
            opacity={legwear === "pantyhose" ? 0.7 : 1}
          />
        </mesh>
      ) : (
        <mesh position={[0, -0.7, 0]}>
          <capsuleGeometry args={[0.04, 1.4, 8, 8]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
      )}

      {/* Socks if applicable - higher */}
      {legwear === "socks" && (
        <mesh position={[0, -1.2, 0]}>
          <capsuleGeometry args={[0.045, 0.3, 8, 8]} />
          <meshStandardMaterial color={legwearColor} />
        </mesh>
      )}

      {/* Shoes - more stylized */}
      {shoesStyle === "heels" ? (
        <group position={[0, -1.4, 0]}>
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[0.08, 0.1, 0.15]} />
            <meshStandardMaterial color={shoesColor} />
          </mesh>
          <mesh position={[0, -0.05, -0.1]}>
            <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
            <meshStandardMaterial color={shoesColor} />
          </mesh>
        </group>
      ) : shoesStyle === "platforms" ? (
        <mesh position={[0, -1.4, 0.05]}>
          <boxGeometry args={[0.08, 0.2, 0.15]} />
          <meshStandardMaterial color={shoesColor} />
        </mesh>
      ) : shoesStyle === "boots" ? (
        <mesh position={[0, -1.2, 0.05]}>
          <boxGeometry args={[0.08, 0.5, 0.15]} />
          <meshStandardMaterial color={shoesColor} />
        </mesh>
      ) : shoesStyle === "sneakers" ? (
        <mesh position={[0, -1.4, 0.05]}>
          <boxGeometry args={[0.1, 0.1, 0.18]} />
          <meshStandardMaterial color={shoesColor} />
        </mesh>
      ) : (
        <mesh position={[0, -1.4, 0.05]}>
          <boxGeometry args={[0.08, 0.1, 0.15]} />
          <meshStandardMaterial color={shoesColor} />
        </mesh>
      )}
    </group>
  )
}
