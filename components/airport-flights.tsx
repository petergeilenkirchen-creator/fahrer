"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plane, RefreshCw, MapPin, AlertCircle, Clock, ArrowDown, ArrowUp, ExternalLink } from "lucide-react"
import type { Driver } from "@/types/driver"

interface Flight {
  flightNumber: string
  airline: string
  aircraft: string | null
  origin: string
  destination: string
  scheduledTime: string
  estimatedTime: string | null
  status: string
  terminal: string | null
  gate: string | null
  type: "arrival" | "departure"
  delay: number | null
}

interface AirportFlightsProps {
  drivers: Driver[]
  onSelectFlight?: (flightNumber: string) => void // Made optional since button is removed
}

export function AirportFlights({ drivers, onSelectFlight }: AirportFlightsProps) {
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [filter, setFilter] = useState<"all" | "arrival" | "departure">("all")

  const fetchFlights = async () => {
    console.log("[v0] Fetching airport flights...")
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/airport-flights")
      console.log("[v0] Airport flights response status:", response.status)

      const data = await response.json()
      console.log("[v0] Airport flights data:", data)

      if (data.error) {
        console.log("[v0] API returned error:", data.error)
        setError(data.error)
        setFlights([])
      } else {
        console.log("[v0] Found flights:", data.flights?.length || 0)
        setFlights(data.flights || [])
        setLastUpdate(new Date())
        setError(null)
      }
    } catch (err) {
      console.log("[v0] Error fetching airport flights:", err)
      setError("Fehler beim Abrufen der Flugdaten. Bitte versuchen Sie es später erneut.")
      setFlights([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFlights()
  }, [])

  const filteredFlights = flights.filter((flight) => {
    if (filter === "all") return true
    return flight.type === filter
  })

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
    } catch {
      return "N/A"
    }
  }

  const formatDateTime = (timeString: string) => {
    try {
      const date = new Date(timeString)
      const weekday = date.toLocaleDateString("de-DE", { weekday: "short" })
      const dateStr = date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })
      const time = date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
      return `${weekday}, ${dateStr} ${time}`
    } catch {
      return "N/A"
    }
  }

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes("landed") || statusLower.includes("departed")) return "text-green-600"
    if (statusLower.includes("delayed") || statusLower.includes("cancelled")) return "text-red-600"
    if (statusLower.includes("scheduled")) return "text-blue-600"
    return "text-gray-600"
  }

  const getFlightradar24Url = (flightNumber: string) => {
    // Remove spaces and convert to lowercase for the URL
    const formattedFlightNumber = flightNumber.replace(/\s+/g, "").toLowerCase()
    return `https://www.flightradar24.com/data/flights/${formattedFlightNumber}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Flughafen Nürnberg (NUE)
            </CardTitle>
            <CardDescription>
              Aktuelle Ankünfte und Abflüge
              {lastUpdate && (
                <span className="ml-2 text-xs">(Aktualisiert: {lastUpdate.toLocaleTimeString("de-DE")})</span>
              )}
            </CardDescription>
          </div>
          <Button onClick={fetchFlights} disabled={loading} size="sm" variant="outline">
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

        {loading && flights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Lade Flugdaten...</p>
          </div>
        ) : filteredFlights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Plane className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Keine Flüge gefunden</p>
            <p className="text-xs mt-1">Versuchen Sie es später erneut</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredFlights.map((flight, index) => (
              <div
                key={`${flight.flightNumber}-${index}`}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {flight.type === "arrival" ? (
                        <ArrowDown className="w-4 h-4 text-blue-600" />
                      ) : (
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      )}
                      <span className="font-semibold text-gray-900">{flight.flightNumber}</span>
                      <a
                        href={getFlightradar24Url(flight.flightNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Auf Flightradar24 anzeigen"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <span className="text-sm text-gray-600">{flight.airline}</span>
                      {flight.delay && flight.delay > 0 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">+{flight.delay} Min</span>
                      )}
                    </div>

                    <div className="text-sm text-gray-700 mb-1">
                      {flight.type === "arrival" ? (
                        <span>Von: {flight.origin}</span>
                      ) : (
                        <span>Nach: {flight.destination}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Geplant: {formatDateTime(flight.scheduledTime)}</span>
                      </div>
                      {flight.estimatedTime && <span>Erwartet: {formatDateTime(flight.estimatedTime)}</span>}
                      {flight.terminal && <span>Terminal {flight.terminal}</span>}
                      {flight.gate && <span>Gate {flight.gate}</span>}
                    </div>

                    <div className={`text-xs font-medium mt-1 ${getStatusColor(flight.status)}`}>{flight.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {filteredFlights.length} Flug{filteredFlights.length !== 1 ? "e" : ""} gefunden
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
