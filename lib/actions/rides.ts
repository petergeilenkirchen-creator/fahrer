"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Ride } from "@/types/ride"

export async function getRides(includeArchived = false) {
  console.log("[v0] getRides called")
  const supabase = await createClient()

  let query = supabase.from("rides").select("*").order("date", { ascending: true }).order("time", { ascending: true })

  if (!includeArchived) {
    query = query.or("archived.is.null,archived.eq.false")
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching rides:", error)
    throw new Error("Fehler beim Laden der Fahrten")
  }

  console.log("[v0] Fetched rides:", data?.length)
  return data as Ride[]
}

export async function addRide(ride: Omit<Ride, "id">) {
  console.log("[v0] addRide called with:", ride)
  const supabase = await createClient()
  const { data, error } = await supabase.from("rides").insert(ride).select()

  if (error) {
    console.error("[v0] Error adding ride:", error)
    console.error("[v0] Error details:", JSON.stringify(error, null, 2))
    throw new Error(`Fehler beim Speichern der Fahrt: ${error.message}`)
  }

  console.log("[v0] Ride added successfully:", data)
  revalidatePath("/")
  return data
}

export async function updateRide(id: string, ride: Omit<Ride, "id">) {
  console.log("[v0] updateRide called with id:", id, "data:", ride)
  const supabase = await createClient()
  const { data, error } = await supabase.from("rides").update(ride).eq("id", id).select()

  if (error) {
    console.error("[v0] Error updating ride:", error)
    console.error("[v0] Error details:", JSON.stringify(error, null, 2))
    throw new Error(`Fehler beim Aktualisieren der Fahrt: ${error.message}`)
  }

  console.log("[v0] Ride updated successfully:", data)
  revalidatePath("/")
  return data
}

export async function deleteRide(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("rides").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting ride:", error)
    throw new Error("Fehler beim Löschen der Fahrt")
  }

  revalidatePath("/")
}

export async function groupRides(rideIds: string[]) {
  console.log("[v0] groupRides called with:", rideIds)
  const supabase = await createClient()

  // Generate a new group ID
  const groupId = crypto.randomUUID()

  // Update all selected rides with the same group_id
  const { error } = await supabase.from("rides").update({ group_id: groupId }).in("id", rideIds)

  if (error) {
    console.error("[v0] Error grouping rides:", error)
    throw new Error("Fehler beim Gruppieren der Fahrten")
  }

  console.log("[v0] Rides grouped successfully with group_id:", groupId)
  revalidatePath("/")
}

export async function ungroupRides(groupId: string) {
  console.log("[v0] ungroupRides called with group_id:", groupId)
  const supabase = await createClient()

  // Remove group_id from all rides in this group
  const { error } = await supabase.from("rides").update({ group_id: null }).eq("group_id", groupId)

  if (error) {
    console.error("[v0] Error ungrouping rides:", error)
    throw new Error("Fehler beim Trennen der Fahrten")
  }

  console.log("[v0] Rides ungrouped successfully")
  revalidatePath("/")
}

export async function archiveRide(id: string) {
  console.log("[v0] archiveRide called with id:", id)
  const supabase = await createClient()
  const { error } = await supabase.from("rides").update({ archived: true }).eq("id", id)

  if (error) {
    console.error("[v0] Error archiving ride:", error)
    throw new Error("Fehler beim Archivieren der Fahrt")
  }

  console.log("[v0] Ride archived successfully")
  revalidatePath("/")
}

export async function unarchiveRide(id: string) {
  console.log("[v0] unarchiveRide called with id:", id)
  const supabase = await createClient()
  const { error } = await supabase.from("rides").update({ archived: false }).eq("id", id)

  if (error) {
    console.error("[v0] Error unarchiving ride:", error)
    throw new Error("Fehler beim Wiederherstellen der Fahrt")
  }

  console.log("[v0] Ride unarchived successfully")
  revalidatePath("/")
}
