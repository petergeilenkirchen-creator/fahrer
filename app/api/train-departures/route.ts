import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[v0] Train departures API called for Hof Hbf")

    const url = "https://dbf.finalrewind.org/Hof%20Hbf.json"
    console.log("[v0] Fetching from DBF API:", url)

    const response = await fetch(url, {
      headers: {
        "User-Agent": "FahrdienstApp/1.0",
      },
      cache: "no-store",
    })

    console.log("[v0] Response status:", response.status)

    if (!response.ok) {
      console.log("[v0] API request failed with status:", response.status)
      return NextResponse.json({ error: "Fehler beim Abrufen der Zugdaten" }, { status: response.status })
    }

    const data = await response.json()
    console.log("[v0] API response received, processing data...")

    const parseTimeToDate = (timeString: string | null): string | null => {
      if (!timeString) return null

      // timeString is in format "HH:MM"
      const [hours, minutes] = timeString.split(":").map(Number)
      const now = new Date()
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes)

      return date.toISOString()
    }

    const addMinutesToTime = (timeString: string | null, minutes: number): string | null => {
      if (!timeString || minutes === 0) return timeString

      const date = new Date(timeString)
      date.setMinutes(date.getMinutes() + minutes)
      return date.toISOString()
    }

    const trains = []

    // Process departures
    if (data.departures && Array.isArray(data.departures)) {
      for (const departure of data.departures) {
        const origin = departure.route && departure.route.length > 0 ? departure.route[0].name : "N/A"

        const scheduledTimeStr = departure.scheduledDeparture || departure.scheduledArrival
        const scheduledTime = parseTimeToDate(scheduledTimeStr)
        const delay = departure.delayDeparture || departure.delayArrival || 0
        const estimatedTime = addMinutesToTime(scheduledTime, delay)

        trains.push({
          trainNumber: departure.train || "N/A",
          trainType: departure.train_type || "N/A",
          destination: departure.destination || "N/A",
          origin: origin,
          platform: departure.platform || null,
          scheduledTime: scheduledTime,
          estimatedTime: estimatedTime,
          delay: delay,
          type: "departure" as const,
          route: departure.route || [],
          messages: departure.messages || { delay: [], qos: [] },
        })
      }
    }

    // Process arrivals
    if (data.arrivals && Array.isArray(data.arrivals)) {
      for (const arrival of data.arrivals) {
        const origin = arrival.origin || (arrival.route && arrival.route.length > 0 ? arrival.route[0].name : "N/A")
        const destination =
          arrival.route && arrival.route.length > 0 ? arrival.route[arrival.route.length - 1].name : "Hof Hbf"

        const scheduledTimeStr = arrival.scheduledArrival || arrival.scheduledDeparture
        const scheduledTime = parseTimeToDate(scheduledTimeStr)
        const delay = arrival.delayArrival || arrival.delayDeparture || 0
        const estimatedTime = addMinutesToTime(scheduledTime, delay)

        trains.push({
          trainNumber: arrival.train || "N/A",
          trainType: arrival.train_type || "N/A",
          destination: destination,
          origin: origin,
          platform: arrival.platform || null,
          scheduledTime: scheduledTime,
          estimatedTime: estimatedTime,
          delay: delay,
          type: "arrival" as const,
          route: arrival.route || [],
          messages: arrival.messages || { delay: [], qos: [] },
        })
      }
    }

    console.log("[v0] Total trains:", trains.length)

    return NextResponse.json({ trains })
  } catch (error) {
    console.error("[v0] Error fetching train departures:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unbekannter Fehler beim Abrufen der Zugdaten" },
      { status: 500 },
    )
  }
}
