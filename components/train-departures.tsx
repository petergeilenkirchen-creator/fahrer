"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Train, RefreshCw, MapPin, AlertCircle, Clock, ArrowRight, ArrowDown, ArrowUp } from "lucide-react"

interface TrainMessage {
  text: string
  timestamp?: string
}

interface TrainDeparture {
  trainNumber: string
  trainType: string
  destination: string
  origin: string
  platform: string | null
  scheduledTime: string | null
  estimatedTime: string | null
  delay: number
  type: "departure" | "arrival" // Allow both types
  route: Array<{ name: string }>
  messages: { delay: Array<string | TrainMessage>; qos: Array<string | TrainMessage> }
}

export function TrainDepartures() {
  const [trains, setTrains] = useState<TrainDeparture[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [filter, setFilter] = useState<"all" | "arrival" | "departure">("all") // Add filter state

  const fetchTrains = async () => {
    console.log("[v0] Fetching train departures...")
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/train-departures")
      console.log("[v0] Train departures response status:", response.status)

      const data = await response.json()
      console.log("[v0] Train departures data:", data)

      if (data.error) {
        console.log("[v0] API returned error:", data.error)
        setError(data.error)
        setTrains([])
      } else {
        console.log("[v0] Found trains:", data.trains?.length || 0)
        setTrains(data.trains || [])
        setLastUpdate(new Date())
        setError(null)
      }
    } catch (err) {
      console.log("[v0] Error fetching train departures:", err)
      setError("Fehler beim Abrufen der Zugdaten. Bitte versuchen Sie es später erneut.")
      setTrains([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrains()
  }, [])

  const filteredTrains = trains.filter((train) => {
    if (filter === "all") return true
    return train.type === filter
  })

  const formatDateTime = (timeString: string | null) => {
    if (!timeString) return "N/A"
    try {
      const date = new Date(timeString)
      const weekday = date.toLocaleDateString("de-DE", { weekday: "short" })
      const dateStr = date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })
      const time = date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
      return `${weekday}, ${dateStr} ${time}`
    } catch {
      return timeString
    }
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "N/A"
    try {
      if (/^\d{2}:\d{2}$/.test(timeString)) {
        return timeString
      }
      const date = new Date(timeString)
      return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
    } catch {
      return timeString
    }
  }

  const getDelayColor = (delay: number) => {
    if (delay === 0) return "text-green-600"
    if (delay <= 5) return "text-yellow-600"
    return "text-red-600"
  }

  const getMessageText = (msg: string | TrainMessage): string => {
    if (typeof msg === "string") {
      return msg
    }
    return msg.text || ""
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Hauptbahnhof Hof
            </CardTitle>
            <CardDescription>
              Aktuelle Ankünfte und Abflüge
              {lastUpdate && (
                <span className="ml-2 text-xs">(Aktualisiert: {lastUpdate.toLocaleTimeString("de-DE")})</span>
              )}
            </CardDescription>
          </div>
          <Button onClick={fetchTrains} disabled={loading} size="sm" variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Aktualisieren
          </Button>
        </div>

        <div className="flex gap-2 mt-4">
          <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            Alle
          </Button>
          <Button size="sm" variant={filter === "arrival" ? "default" : "outline"} onClick={() => setFilter("arrival")}>
            <ArrowDown className="w-4 h-4 mr-1" />
            Ankünfte
          </Button>
          <Button
            size="sm"
            variant={filter === "departure" ? "default" : "outline"}
            onClick={() => setFilter("departure")}
          >
            <ArrowUp className="w-4 h-4 mr-1" />
            Abflüge
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900 mb-1">Fehler</p>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading && trains.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Lade Zugdaten...</p>
          </div>
        ) : filteredTrains.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Train className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Keine Züge gefunden</p>
            <p className="text-xs mt-1">Versuchen Sie es später erneut</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredTrains.map((train, index) => (
              <div
                key={`${train.trainNumber}-${index}`}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {train.type === "arrival" ? (
                        <ArrowDown className="w-4 h-4 text-blue-600" />
                      ) : (
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      )}
                      <span className="font-semibold text-gray-900">
                        {train.trainType} {train.trainNumber}
                      </span>
                      {train.delay > 0 && (
                        <span className={`text-xs font-medium ${getDelayColor(train.delay)}`}>+{train.delay} Min</span>
                      )}
                    </div>

                    <div className="text-sm text-gray-700 mb-2 flex items-center gap-2">
                      <span className="font-medium">{train.origin}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{train.destination}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDateTime(train.scheduledTime)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      {train.platform && <span className="font-medium">Gleis {train.platform}</span>}
                      {train.estimatedTime && train.estimatedTime !== train.scheduledTime && (
                        <span className="text-orange-600">Erwartet: {formatTime(train.estimatedTime)}</span>
                      )}
                    </div>

                    {train.messages && (train.messages.delay?.length > 0 || train.messages.qos?.length > 0) && (
                      <div className="mt-2 text-xs text-gray-600 space-y-1">
                        {train.messages.delay?.map((msg, i) => (
                          <div key={`delay-${i}`} className="flex items-start gap-1">
                            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-orange-600" />
                            <span>{getMessageText(msg)}</span>
                          </div>
                        ))}
                        {train.messages.qos?.map((msg, i) => (
                          <div key={`qos-${i}`} className="flex items-start gap-1">
                            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-600" />
                            <span>{getMessageText(msg)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {filteredTrains.length} Zug{filteredTrains.length !== 1 ? "e" : ""} gefunden
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
