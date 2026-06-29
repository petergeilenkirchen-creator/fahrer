import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const flightNumber = searchParams.get("flight")

  if (!flightNumber) {
    return NextResponse.json({ error: "Flight number is required" }, { status: 400 })
  }

  try {
    const username = process.env.OPENSKY_USERNAME
    const password = process.env.OPENSKY_PASSWORD

    const url = `https://opensky-network.org/api/states/all`

    const headers: HeadersInit = {
      "User-Agent": "Fahrdienst-App/1.0",
      Accept: "application/json",
    }

    if (username && password) {
      const auth = btoa(`${username}:${password}`)
      headers["Authorization"] = `Basic ${auth}`
    }

    const response = await fetch(url, {
      headers,
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            "Flugverfolgung funktioniert nur in der Production-Umgebung. Bitte geben Sie Datum und Zeit manuell ein.",
        },
        { status: 503 },
      )
    }

    const data = await response.json()

    if (!data.states || data.states.length === 0) {
      return NextResponse.json(
        { error: "Keine aktiven Flüge gefunden. Bitte geben Sie die Zeit manuell ein." },
        { status: 404 },
      )
    }

    const normalizedFlightNumber = flightNumber.replace(/\s+/g, "").toUpperCase()

    const flight = data.states.find((state: any[]) => {
      const callsign = state[1]?.trim().toUpperCase() || ""
      return callsign === normalizedFlightNumber || callsign.includes(normalizedFlightNumber)
    })

    if (!flight) {
      return NextResponse.json(
        {
          error: `Flug ${flightNumber} nicht gefunden. OpenSky zeigt nur aktuell fliegende Flugzeuge. Bitte geben Sie die Zeit manuell ein.`,
        },
        { status: 404 },
      )
    }

    const [
      icao24,
      callsign,
      originCountry,
      timePosition,
      lastContact,
      longitude,
      latitude,
      baroAltitude,
      onGround,
      velocity,
      trueTrack,
      verticalRate,
    ] = flight

    const isLanding = onGround === false && verticalRate < 0
    const isTakingOff = onGround === false && verticalRate > 0
    const isOnGround = onGround === true

    let status = "active"
    if (isOnGround) {
      status = "landed"
    } else if (isLanding) {
      status = "landing"
    } else if (isTakingOff) {
      status = "departed"
    }

    return NextResponse.json({
      flightNumber: callsign.trim(),
      status: status,
      originCountry: originCountry,
      position: {
        latitude: latitude,
        longitude: longitude,
        altitude: baroAltitude,
      },
      velocity: velocity,
      onGround: onGround,
      lastContact: new Date(lastContact * 1000).toISOString(),
      note: "OpenSky zeigt Echtzeit-Flugdaten für aktuell fliegende Flugzeuge.",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Flugverfolgung ist in der Vorschau nicht verfügbar. Die Funktion wird nach dem Deployment auf Vercel funktionieren. Bitte geben Sie Datum und Zeit manuell ein.",
      },
      { status: 503 },
    )
  }
}
