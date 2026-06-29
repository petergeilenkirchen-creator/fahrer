import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    // Verify the secret token to prevent unauthorized access
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Starting CSV export email job")

    // Fetch all rides from the database
    const supabase = await createClient()
    const { data: rides, error } = await supabase.from("rides").select("*").order("date", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching rides:", error)
      return NextResponse.json({ error: "Failed to fetch rides" }, { status: 500 })
    }

    console.log(`[v0] Fetched ${rides?.length || 0} rides`)

    // Generate CSV content
    const headers = [
      "Datum",
      "Uhrzeit",
      "Name",
      "Telefon",
      "Von",
      "Nach",
      "Personen",
      "Flugnummer",
      "Fahrer",
      "Notizen",
    ]

    const csvRows = [headers.join(",")]

    rides?.forEach((ride) => {
      const date = new Date(ride.date)
      const formattedDate = date.toLocaleDateString("de-DE")
      const row = [
        formattedDate,
        ride.time || "",
        ride.name || "",
        ride.phone || "",
        ride.from || "",
        ride.to || "",
        ride.passengers?.toString() || "",
        ride.flight || "",
        ride.driver || "",
        ride.notes ? `"${ride.notes.replace(/"/g, '""')}"` : "",
      ]
      csvRows.push(row.join(","))
    })

    const csvContent = csvRows.join("\n")

    // Check if Resend API key is available
    if (!process.env.RESEND_API_KEY) {
      console.log("[v0] RESEND_API_KEY not found, skipping email")
      return NextResponse.json({
        success: true,
        message: "CSV generated but email not sent (RESEND_API_KEY missing)",
        ridesCount: rides?.length || 0,
      })
    }

    // Send email with CSV attachment using Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Fahrdienst Backup <onboarding@resend.dev>",
        to: process.env.BACKUP_EMAIL || "your-email@example.com",
        subject: `Fahrdienst CSV Backup - ${new Date().toLocaleString("de-DE")}`,
        html: `
          <h2>Automatischer Fahrdienst CSV-Export</h2>
          <p><strong>Zeitstempel:</strong> ${new Date().toLocaleString("de-DE")}</p>
          <p><strong>Anzahl Fahrten:</strong> ${rides?.length || 0}</p>
          <p>Die CSV-Datei ist im Anhang.</p>
        `,
        attachments: [
          {
            filename: `fahrdienst-backup-${new Date().toISOString().split("T")[0]}.csv`,
            content: Buffer.from(csvContent).toString("base64"),
          },
        ],
      }),
    })

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text()
      console.error("[v0] Resend API error:", errorText)
      return NextResponse.json({ error: "Failed to send email", details: errorText }, { status: 500 })
    }

    const result = await resendResponse.json()
    console.log("[v0] Email sent successfully:", result)

    return NextResponse.json({
      success: true,
      message: "CSV exported and emailed successfully",
      ridesCount: rides?.length || 0,
      emailId: result.id,
    })
  } catch (error) {
    console.error("[v0] Error in CSV export email job:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
