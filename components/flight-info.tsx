"use client"

import { Clock, AlertCircle, CheckCircle, Plane } from "lucide-react"
import { useMemo } from "react"

interface FlightData {
  flightNumber: string
  airline: string
  origin: string
  destination: string
  scheduledTime: string
  estimatedTime: string | null
  delay: number
  status: string
  gate: string | null
  terminal: string | null
}

interface FlightInfoProps {
  flightNumber: string
  rideDate: string
  flightsData?: { flights: FlightData[] }
  isLoading?: boolean
}

export function FlightInfo({ flightNumber, rideDate, flightsData, isLoading }: FlightInfoProps) {
  const flightData = useMemo(() => {
    if (!flightsData?.flights) return null

    const normalizedFlightNumber = flightNumber.replace(/\s+/g, "").toUpperCase()
    return flightsData.flights.find(
      (f: FlightData) => f.flightNumber.replace(/\s+/g, "").toUpperCase() === normalizedFlightNumber,
    )
  }, [flightNumber, flightsData])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        <span>Lade Flugdaten...</span>
      </div>
    )
  }

  if (!flightData) {
    return null
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes("landed") || statusLower.includes("arrived")) return "text-green-600"
    if (statusLower.includes("delayed") || statusLower.includes("verspätet")) return "text-orange-600"
    if (statusLower.includes("cancelled") || statusLower.includes("gestrichen")) return "text-red-600"
    return "text-blue-600"
  }

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes("landed") || statusLower.includes("arrived")) return <CheckCircle className="w-3 h-3" />
    if (statusLower.includes("delayed") || statusLower.includes("verspätet")) return <AlertCircle className="w-3 h-3" />
    return <Plane className="w-3 h-3" />
  }

  return (
    <div className="mt-1 space-y-1">
      <div className="flex items-center gap-2 text-xs">
        <Clock className="w-3 h-3 text-gray-400" />
        <span className="text-gray-600">Geplant: {formatTime(flightData.scheduledTime)}</span>
        {flightData.estimatedTime && flightData.delay > 0 && (
          <>
            <span className="text-gray-400">→</span>
            <span className="text-orange-600 font-medium">
              Erwartet: {formatTime(flightData.estimatedTime)} (+{flightData.delay} Min)
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className={`flex items-center gap-1 ${getStatusColor(flightData.status)}`}>
          {getStatusIcon(flightData.status)}
          <span className="font-medium">{flightData.status}</span>
        </span>
        {flightData.gate && (
          <>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">Gate {flightData.gate}</span>
          </>
        )}
        {flightData.terminal && (
          <>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">Terminal {flightData.terminal}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-500">
        <span>{flightData.origin}</span>
        <span>→</span>
        <span>{flightData.destination}</span>
      </div>
    </div>
  )
}
