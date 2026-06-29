"use client"

import type React from "react"

import { useState } from "react"
import { login } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Fahrdienst App</CardTitle>
          <CardDescription>Bitte geben Sie das Passwort ein</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="text-center"
                autoFocus
              />
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading || !password}>
              {loading ? "Wird überprüft..." : "Anmelden"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
