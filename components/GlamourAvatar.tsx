"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// Simple DTI-style avatar component
export function GlamourAvatar({
  animation = "idle",
  isJumping = false,
  customization = {
    skinTone: "#FFDAB9",
    hairStyle: "waves",
    hairColor: "#FFB6C1",
    eyeColor: "#8B4513",
    lipColor: "#FF0000",
    blushColor: "#FF69B4",
    outfitStyle: "pink",
    outfitColor: "#FF69B4",
    accessoryStyle: "sunglasses",
    accessoryColor: "#FFFFFF",
    legwearStyle: "fluffy",
    legwearColor: "#FFFFFF",
    shoesStyle: "platforms",
    shoesColor: "#FF69B4",
    bagStyle: "designer",
    bagColor: "#FFFFFF",
    headwearStyle: "beret",
    headwearColor: "#FFFFFF",
    necklaceStyle: "pearls",
    necklaceColor: "#FFFFFF",
    glitterEffect: true,
  },
}) {
  const groupRef = useRef()
  const headRef = useRef()
  const bodyRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()
  const leftLegRef = useRef()
  const rightLegRef = useRef()
  const glitterParticlesRef = useRef([])
  const glitterGroupRef = useRef()

  // Animation parameters
  const animationTime = useRef(0)
  const jumpTime = useRef(0)

  // Create glitter particles
  useEffect(() => {
    if (!customization.glitterEffect || !glitterGroupRef.current) return

    // Clear existing particles
    if (glitterParticlesRef.current.length > 0) {
      glitterParticlesRef.current.forEach((particle) => {
        if (particle.geometry) particle.geometry.dispose()
        if (particle.material) particle.material.dispose()
        glitterGroupRef.current.remove(particle)
      })
      glitterParticlesRef.current = []
    }

    // Create new particles
    const particleCount = 20
    const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8)
    const particleMaterial = new THREE.MeshStandardMaterial({
      color: "#FFFFFF",
      emissive: "#FFFFFF",
      emissiveIntensity: 0.5,
      metalness: 1,
      roughness: 0.2,
    })

    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial)

      // Random position around the character
      particle.position.set((Math.random() - 0.5) * 2, Math.random() * 2, (Math.random() - 0.5) * 2)

      // Custom data for animation
      particle.userData = {
        speed: 0.2 + Math.random() * 0.8,
        offset: Math.random() * Math.PI * 2,
      }

      glitterGroupRef.current.add(particle)
      glitterParticlesRef.current.push(particle)
    }

    return () => {
      // Cleanup particles
      glitterParticlesRef.current.forEach((particle) => {
        if (particle.geometry) particle.geometry.dispose()
        if (particle.material) particle.material.dispose()
      })
    }
  }, [customization.glitterEffect])

  // Animation loop
  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Update animation time
    animationTime.current += delta

    // Handle different animations
    switch (animation) {
      case "idle":
        // Subtle idle animation
        if (headRef.current) {
          headRef.current.position.y = 1.8 + Math.sin(animationTime.current * 1.5) * 0.02
          headRef.current.rotation.z = Math.sin(animationTime.current) * 0.03
        }
        if (bodyRef.current) {
          bodyRef.current.position.y = 0.9 + Math.sin(animationTime.current * 1.5) * 0.01
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.z = Math.PI / 6 + Math.sin(animationTime.current) * 0.05
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -Math.PI / 6 - Math.sin(animationTime.current) * 0.05
        }
        break

      case "walk":
        // Walking animation
        if (headRef.current) {
          headRef.current.position.y = 1.8 + Math.abs(Math.sin(animationTime.current * 5)) * 0.05
          headRef.current.rotation.z = Math.sin(animationTime.current * 5) * 0.03
        }
        if (bodyRef.current) {
          bodyRef.current.position.y = 0.9 + Math.abs(Math.sin(animationTime.current * 5)) * 0.03
          bodyRef.current.rotation.z = Math.sin(animationTime.current * 5) * 0.02
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.z = Math.PI / 6 + Math.sin(animationTime.current * 5) * 0.3
          leftArmRef.current.rotation.x = Math.sin(animationTime.current * 5) * 0.2
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -Math.PI / 6 - Math.sin(animationTime.current * 5) * 0.3
          rightArmRef.current.rotation.x = -Math.sin(animationTime.current * 5) * 0.2
        }
        if (leftLegRef.current) {
          leftLegRef.current.rotation.x = Math.sin(animationTime.current * 5) * 0.3
        }
        if (rightLegRef.current) {
          rightLegRef.current.rotation.x = -Math.sin(animationTime.current * 5) * 0.3
        }
        break

      case "run":
        // Running animation - more exaggerated walking
        if (headRef.current) {
          headRef.current.position.y = 1.8 + Math.abs(Math.sin(animationTime.current * 8)) * 0.08
          headRef.current.rotation.z = Math.sin(animationTime.current * 8) * 0.05
        }
        if (bodyRef.current) {
          bodyRef.current.position.y = 0.9 + Math.abs(Math.sin(animationTime.current * 8)) * 0.05
          bodyRef.current.rotation.z = Math.sin(animationTime.current * 8) * 0.04
          bodyRef.current.rotation.x = Math.sin(animationTime.current * 8) * 0.05
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.z = Math.PI / 6 + Math.sin(animationTime.current * 8) * 0.5
          leftArmRef.current.rotation.x = Math.sin(animationTime.current * 8) * 0.4
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -Math.PI / 6 - Math.sin(animationTime.current * 8) * 0.5
          rightArmRef.current.rotation.x = -Math.sin(animationTime.current * 8) * 0.4
        }
        if (leftLegRef.current) {
          leftLegRef.current.rotation.x = Math.sin(animationTime.current * 8) * 0.5
        }
        if (rightLegRef.current) {
          rightLegRef.current.rotation.x = -Math.sin(animationTime.current * 8) * 0.5
        }
        break

      case "jump":
        // Jump animation
        jumpTime.current += delta
        if (jumpTime.current > 1) jumpTime.current = 1

        if (headRef.current) {
          headRef.current.position.y = 1.8
        }
        if (bodyRef.current) {
          bodyRef.current.position.y = 0.9
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.z = Math.PI / 4
          leftArmRef.current.rotation.x = -Math.PI / 6
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -Math.PI / 4
          rightArmRef.current.rotation.x = -Math.PI / 6
        }
        if (leftLegRef.current) {
          leftLegRef.current.rotation.x = -Math.PI / 6
        }
        if (rightLegRef.current) {
          rightLegRef.current.rotation.x = -Math.PI / 6
        }
        break

      case "dance":
        // Dance animation
        if (headRef.current) {
          headRef.current.position.y = 1.8 + Math.sin(animationTime.current * 4) * 0.1
          headRef.current.rotation.y = Math.sin(animationTime.current * 2) * 0.2
          headRef.current.rotation.z = Math.sin(animationTime.current * 3) * 0.1
        }
        if (bodyRef.current) {
          bodyRef.current.position.y = 0.9 + Math.sin(animationTime.current * 4) * 0.05
          bodyRef.current.rotation.y = Math.sin(animationTime.current * 2) * 0.1
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.z = Math.PI / 3 + Math.sin(animationTime.current * 4) * 0.5
          leftArmRef.current.rotation.x = Math.sin(animationTime.current * 2) * 0.5
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -Math.PI / 3 - Math.sin(animationTime.current * 4 + Math.PI) * 0.5
          rightArmRef.current.rotation.x = Math.sin(animationTime.current * 2 + Math.PI) * 0.5
        }
        if (leftLegRef.current) {
          leftLegRef.current.rotation.x = Math.sin(animationTime.current * 4) * 0.2
          leftLegRef.current.rotation.z = Math.sin(animationTime.current * 2) * 0.1
        }
        if (rightLegRef.current) {
          rightLegRef.current.rotation.x = Math.sin(animationTime.current * 4 + Math.PI) * 0.2
          rightLegRef.current.rotation.z = Math.sin(animationTime.current * 2 + Math.PI) * 0.1
        }
        break

      default:
        break
    }

    // Animate glitter particles
    if (customization.glitterEffect && glitterParticlesRef.current.length > 0) {
      glitterParticlesRef.current.forEach((particle) => {
        // Spiral upward movement
        particle.position.y += particle.userData.speed * delta
        particle.position.x = Math.sin(animationTime.current * particle.userData.speed + particle.userData.offset) * 0.5
        particle.position.z = Math.cos(animationTime.current * particle.userData.speed + particle.userData.offset) * 0.5

        // Reset particles that go too high
        if (particle.position.y > 3) {
          particle.position.y = 0
          particle.userData.offset = Math.random() * Math.PI * 2
        }
      })
    }
  })

  return (
    <group ref={groupRef}>
      {/* Head - much larger for DTI style */}
      <mesh ref={headRef} position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color={customization.skinTone} />

        {/* Eyes */}
        <mesh position={[0.25, 0.1, 0.55]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="white" />
          <mesh position={[0, 0, 0.07]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color={customization.eyeColor} />
          </mesh>
        </mesh>

        <mesh position={[-0.25, 0.1, 0.55]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="white" />
          <mesh position={[0, 0, 0.07]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color={customization.eyeColor} />
          </mesh>
        </mesh>

        {/* Mouth */}
        <mesh position={[0, -0.2, 0.55]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={customization.lipColor} />
        </mesh>

        {/* Blush */}
        <mesh position={[0.4, -0.1, 0.4]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={customization.blushColor} transparent opacity={0.3} />
        </mesh>

        <mesh position={[-0.4, -0.1, 0.4]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={customization.blushColor} transparent opacity={0.3} />
        </mesh>

        {/* Hair - based on style */}
        {customization.hairStyle === "waves" && (
          <>
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.75, 32, 32]} />
              <meshStandardMaterial color={customization.hairColor} />
            </mesh>
            <mesh position={[0, -0.5, 0]}>
              <cylinderGeometry args={[0.6, 0.3, 1.2, 16]} />
              <meshStandardMaterial color={customization.hairColor} />
            </mesh>
          </>
        )}

        {customization.hairStyle === "ponytail" && (
          <>
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.72, 32, 32]} />
              <meshStandardMaterial color={customization.hairColor} />
            </mesh>
            <mesh position={[0, 0.6, 0]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color={customization.hairColor} />
            </mesh>
            <mesh position={[0, 0.9, 0]}>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial color={customization.hairColor} />
            </mesh>
          </>
        )}

        {/* Accessories */}
        {customization.accessoryStyle === "sunglasses" && (
          <group position={[0, 0.1, 0.65]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.7, 0.12, 0.05]} />
              <meshStandardMaterial color="black" />
            </mesh>
            <mesh position={[0.25, 0, 0.05]}>
              <cylinderGeometry args={[0.12, 0.12, 0.05, 16]} />
              <meshStandardMaterial color="black" />
            </mesh>
            <mesh position={[-0.25, 0, 0.05]}>
              <cylinderGeometry args={[0.12, 0.12, 0.05, 16]} />
              <meshStandardMaterial color="black" />
            </mesh>
          </group>
        )}

        {customization.headwearStyle === "beret" && (
          <group position={[0, 0.5, 0]}>
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial color={customization.headwearColor} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.7, 0.7, 0.1, 16]} />
              <meshStandardMaterial color={customization.headwearColor} />
            </mesh>
          </group>
        )}
      </mesh>

      {/* Body - thinner for DTI style */}
      <mesh ref={bodyRef} position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.2, 0.6, 16, 8]} />
        <meshStandardMaterial color={customization.outfitColor} />

        {/* Necklace */}
        {customization.necklaceStyle === "pearls" && (
          <mesh position={[0, 0.2, 0.18]}>
            <torusGeometry args={[0.15, 0.03, 8, 16]} />
            <meshStandardMaterial color={customization.necklaceColor} metalness={0.5} roughness={0.2} />
          </mesh>
        )}
      </mesh>

      {/* Legs - longer and thinner for DTI style */}
      <mesh ref={leftLegRef} position={[-0.1, 0.3, 0]}>
        <capsuleGeometry args={[0.05, 0.8, 8, 8]} />
        <meshStandardMaterial color={customization.skinTone} />

        {/* Legwear */}
        {customization.legwearStyle === "fluffy" && (
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.3, 16]} />
            <meshStandardMaterial color={customization.legwearColor} />
          </mesh>
        )}

        {/* Shoes */}
        {customization.shoesStyle === "platforms" && (
          <group position={[0, -0.5, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.15, 0.1, 0.25]} />
              <meshStandardMaterial color={customization.shoesColor} />
            </mesh>
            <mesh position={[0, -0.1, 0]}>
              <boxGeometry args={[0.2, 0.1, 0.3]} />
              <meshStandardMaterial color={customization.shoesColor} />
            </mesh>
          </group>
        )}

        {customization.shoesStyle === "heels" && (
          <group position={[0, -0.5, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.12, 0.05, 0.25]} />
              <meshStandardMaterial color={customization.shoesColor} />
            </mesh>
            <mesh position={[0, -0.05, -0.1]}>
              <boxGeometry args={[0.05, 0.1, 0.05]} />
              <meshStandardMaterial color={customization.shoesColor} />
            </mesh>
          </group>
        )}
      </mesh>

      <mesh ref={rightLegRef} position={[0.1, 0.3, 0]}>
        <capsuleGeometry args={[0.05, 0.8, 8, 8]} />
        <meshStandardMaterial color={customization.skinTone} />

        {/* Legwear */}
        {customization.legwearStyle === "fluffy" && (
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.3, 16]} />
            <meshStandardMaterial color={customization.legwearColor} />
          </mesh>
        )}

        {/* Shoes */}
        {customization.shoesStyle === "platforms" && (
          <group position={[0, -0.5, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.15, 0.1, 0.25]} />
              <meshStandardMaterial color={customization.shoesColor} />
            </mesh>
            <mesh position={[0, -0.1, 0]}>
              <boxGeometry args={[0.2, 0.1, 0.3]} />
              <meshStandardMaterial color={customization.shoesColor} />
            </mesh>
          </group>
        )}

        {customization.shoesStyle === "heels" && (
          <group position={[0, -0.5, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.12, 0.05, 0.25]} />
              <meshStandardMaterial color={customization.shoesColor} />
            </mesh>
            <mesh position={[0, -0.05, -0.1]}>
              <boxGeometry args={[0.05, 0.1, 0.05]} />
              <meshStandardMaterial color={customization.shoesColor} />
            </mesh>
          </group>
        )}
      </mesh>

      {/* Arms - thinner for DTI style */}
      <mesh ref={leftArmRef} position={[-0.25, 1.1, 0]}>
        <capsuleGeometry args={[0.05, 0.6, 8, 8]} />
        <meshStandardMaterial color={customization.skinTone} />
      </mesh>

      <mesh ref={rightArmRef} position={[0.25, 1.1, 0]}>
        <capsuleGeometry args={[0.05, 0.6, 8, 8]} />
        <meshStandardMaterial color={customization.skinTone} />

        {/* Bag */}
        {customization.bagStyle === "designer" && (
          <group position={[0.3, -0.2, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.2, 0.2, 0.1]} />
              <meshStandardMaterial color={customization.bagColor} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
              <meshStandardMaterial color="gold" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        )}
      </mesh>

      {/* Glitter effect */}
      <group ref={glitterGroupRef} />
    </group>
  )
}
