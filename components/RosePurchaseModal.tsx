"use client"

import { useState } from "react"
import { FlowerIcon as Rose } from "lucide-react"
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
import { theme, ROSE_PRICES } from "@/config/theme"

export function RosePurchaseModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Rose className="mr-2 h-4 w-4" style={{ color: theme.colors.accent }} />
          Buy Roses
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buy Roses</DialogTitle>
          <DialogDescription>
            Choose a package to purchase roses. The more you buy, the better the value!
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {ROSE_PRICES.map((price, index) => (
            <Button key={index} variant="outline" className="justify-between" onClick={() => setIsOpen(false)}>
              <span>${price.amount}</span>
              <span className="flex items-center">
                <Rose className="mr-2 h-4 w-4" style={{ color: theme.colors.accent }} />
                {price.roses} roses
              </span>
            </Button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
