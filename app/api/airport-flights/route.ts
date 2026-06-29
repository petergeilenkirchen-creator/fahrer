import { type NextRequest, NextResponse } from "next/server"

function fetchWithTimeout(url: string, options: RequestInit, timeout = 10000) {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) => setTimeout(() => reject(new Error("Request timeout")), timeout)),
  ])
}

export async function GET(request: NextRequest) {
  try {
    // Nuremberg Airport ICAO code
    const airportCode = "EDDN"

    // Get flights from 2 hours ago to 12 hours in the future
    const offsetMinutes = -120
    const durationMinutes = 720

    const rapidApiKey = process.env.RAPIDAPI_KEY || "664fc85898msh3767eeaaaac0732p143546jsn2eba6183824b"

    console.log("[v0] Airport flights API called for Nuremberg (EDDN)")
    console.log("[v0] RapidAPI key available:", !!rapidApiKey)

    const url = `https://aerodatabox.p.rapidapi.com/flights/airports/icao/${airportCode}?withLeg=true&direction=Both&withCancelled=false&withCodeshared=true&withCargo=false&withPrivate=false&withLocation=false`

    console.log("[v0] Fetching from AeroDataBox:", url)

    const response = await fetchWithTimeout(
      url,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "aerodatabox.p.rapidapi.com",
          "x-rapidapi-key": rapidApiKey,
        },
      },
      10000,
    ) // 10 second timeout

    console.log("[v0] Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Error response:", errorText)
      return NextResponse.json(
        {
          error: `AeroDataBox API error: ${response.status}`,
          flights: [],
          count: 0,
        },
        { status: 200 },
      )
    }

    const data = await response.json()
    console.log("[v0] API response received:", {
      hasArrivals: !!data.arrivals,
      hasDepartures: !!data.departures,
      arrivalsCount: data.arrivals?.length || 0,
      departuresCount: data.departures?.length || 0,
    })

    // Combine arrivals and departures
    const arrivals = (data.arrivals || []).map((flight: any) => ({
      flightNumber: flight.number || "Unknown",
      airline: flight.airline?.name || "Unknown",
      aircraft: flight.aircraft?.model || null,
      origin: flight.departure?.airport?.name || flight.departure?.airport?.iata || "Unknown",
      destination: "Nürnberg (NUE)",
      scheduledTime: flight.arrival?.scheduledTime?.local || flight.arrival?.scheduledTime?.utc,
      estimatedTime: flight.arrival?.revisedTime?.local || flight.arrival?.revisedTime?.utc,
      status: flight.status || "Unknown",
      terminal: flight.arrival?.terminal || null,
      gate: flight.arrival?.gate || null,
      type: "arrival" as const,
      delay: flight.arrival?.delay ? Math.round(flight.arrival.delay / 60) : null, // Convert seconds to minutes
    }))

    const departures = (data.departures || []).map((flight: any) => ({
      flightNumber: flight.number || "Unknown",
      airline: flight.airline?.name || "Unknown",
      aircraft: flight.aircraft?.model || null,
      origin: "Nürnberg (NUE)",
      destination: flight.arrival?.airport?.name || flight.arrival?.airport?.iata || "Unknown",
      scheduledTime: flight.departure?.scheduledTime?.local || flight.departure?.scheduledTime?.utc,
      estimatedTime: flight.departure?.revisedTime?.local || flight.departure?.revisedTime?.utc,
      status: flight.status || "Unknown",
      terminal: flight.departure?.terminal || null,
      gate: flight.departure?.gate || null,
      type: "departure" as const,
      delay: flight.departure?.delay ? Math.round(flight.departure.delay / 60) : null,
    }))

    const allFlights = [...arrivals, ...departures]
      .filter((flight) => flight.flightNumber !== "Unknown")
      .sort((a, b) => {
        const timeA = new Date(a.scheduledTime || 0).getTime()
        const timeB = new Date(b.scheduledTime || 0).getTime()
        return timeA - timeB
      })

    console.log("[v0] Total flights:", allFlights.length)
    if (allFlights.length > 0) {
      console.log("[v0] Sample flights:", allFlights.slice(0, 3))
    }

    return NextResponse.json({ flights: allFlights, count: allFlights.length })
  } catch (error: any) {
    console.error("[v0] Error fetching airport flights:", error)
    console.error("[v0] Error details:", error?.message)

    return NextResponse.json(
      {
        error: `Fehler beim Abrufen der Flugdaten: ${error?.message || "Unbekannter Fehler"}`,
        flights: [],
        count: 0,
      },
      { status: 200 },
    )
  }
}
