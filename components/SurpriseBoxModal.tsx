"use client"

import { useState } from "react"
import { Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { theme } from "@/config/theme"

interface SurpriseOption {
  name: string
  roses: number
  chance: number
  rarity: string
}

const surpriseOptions: SurpriseOption[] = [
  { name: "Surprise Bouquet", roses: 30, chance: 0.65, rarity: "Common" },
  { name: "Rose Garden", roses: 500, chance: 0.25, rarity: "Uncommon" },
  { name: "Floral Paradise", roses: 1000, chance: 0.05, rarity: "Rare" },
  { name: "Enchanted Oasis", roses: 2000, chance: 0.03, rarity: "Epic" },
  { name: "Mythical Rose Realm", roses: 4000, chance: 0.02, rarity: "Legendary" },
]

export function SurpriseBoxModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [result, setResult] = useState<SurpriseOption | null>(null)

  const openSurpriseBox = () => {
    const randomNumber = Math.random()
    let cumulativeChance = 0
    let selectedOption: SurpriseOption | undefined

    for (const option of surpriseOptions) {
      cumulativeChance += option.chance
      if (randomNumber <= cumulativeChance) {
        selectedOption = option
        break
      }
    }

    setResult(selectedOption || surpriseOptions[0])
  }

  const handlePurchase = () => {
    openSurpriseBox()
    // Here you would typically handle the actual purchase logic
    console.log("Surprise Box purchased")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Gift className="mr-2 h-4 w-4" style={{ color: theme.colors.accent }} />
          Surprise Box
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Surprise Box</DialogTitle>
          <DialogDescription>Purchase a Surprise Box for $5 and win amazing rose rewards!</DialogDescription>
        </DialogHeader>
        {!result ? (
          <div className="py-4">
            <p className="mb-4">What will you discover in your Surprise Box?</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Surprise Bouquet</li>
              <li>Rose Garden</li>
              <li>Floral Paradise</li>
              <li>Enchanted Oasis</li>
              <li>Mythical Rose Realm</li>
            </ul>
          </div>
        ) : (
          <div className="py-4 text-center">
            {result.roses <= 30 ? (
              <p className="text-xl font-bold mb-2">Surprise! You won {result.roses} roses!</p>
            ) : (
              <p className="text-xl font-bold mb-2">
                Congratulations! You won a {result.rarity.toLowerCase()} surprise!
              </p>
            )}
            <p className="text-2xl font-bold text-pink-500">{result.name}</p>
            <p className="text-lg mt-2">You received {result.roses} roses!</p>
          </div>
        )}
        <DialogFooter>
          {!result ? (
            <Button onClick={handlePurchase} className="w-full">
              Purchase for $5
            </Button>
          ) : (
            <Button onClick={() => setResult(null)} className="w-full">
              Open Another Box
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
