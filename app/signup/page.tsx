"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/Header"
import { theme } from "@/config/theme"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Apple, Mail, Check, X, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null)
  const { signup, checkUsernameAvailability } = useAuth()
  const router = useRouter()

  // Debounce username check
  useEffect(() => {
    if (!username || username.length < 3) {
      setIsUsernameAvailable(null)
      return
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true)
      try {
        const isAvailable = await checkUsernameAvailability(username)
        setIsUsernameAvailable(isAvailable)
      } catch (error) {
        console.error("Error checking username:", error)
      } finally {
        setIsCheckingUsername(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [username, checkUsernameAvailability])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!email || !password || !confirmPassword || !username) {
      setError("All fields are required")
      setIsLoading(false)
      return
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters")
      setIsLoading(false)
      return
    }

    if (!isUsernameAvailable) {
      setError("Username is already taken")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const result = await signup(email, password, username)
      if (result.success) {
        router.push("/profile")
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An error occurred during signup")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: theme.colors.background }} className="min-h-screen">
      <Header theme={theme} />
      <main className="container mx-auto p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Sign Up for Roses</CardTitle>
            <CardDescription className="text-center">Join our community of K-pop enthusiasts!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className={`pr-10 ${
                      isUsernameAvailable === true
                        ? "border-green-500"
                        : isUsernameAvailable === false
                          ? "border-red-500"
                          : ""
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {isCheckingUsername && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                    {!isCheckingUsername && isUsernameAvailable === true && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {!isCheckingUsername && isUsernameAvailable === false && <X className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
                {username && username.length < 3 && (
                  <p className="text-xs text-amber-500">Username must be at least 3 characters</p>
                )}
                {!isCheckingUsername && isUsernameAvailable === false && (
                  <p className="text-xs text-red-500">Username is already taken</p>
                )}
                {!isCheckingUsername && isUsernameAvailable === true && (
                  <p className="text-xs text-green-500">Username is available</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Sign Up with Email"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-2">Or sign up with</p>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => console.log("Sign up with Google")}>
                <Mail className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button variant="outline" onClick={() => console.log("Sign up with Apple")}>
                <Apple className="mr-2 h-4 w-4" />
                Apple
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-pink-500 hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
