"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Driver } from "@/types/driver"

export async function getDrivers() {
  console.log("[v0] getDrivers called")
  const supabase = await createClient()
  const { data, error } = await supabase.from("drivers").select("*").order("name", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching drivers:", error)
    throw new Error("Fehler beim Laden der Fahrer")
  }

  console.log("[v0] Fetched drivers:", data?.length)
  return data as Driver[]
}

export async function addDriver(driver: Omit<Driver, "id">) {
  console.log("[v0] addDriver called with:", driver)
  const supabase = await createClient()
  const { data, error } = await supabase.from("drivers").insert(driver).select()

  if (error) {
    console.error("[v0] Error adding driver:", error)
    console.error("[v0] Error details:", JSON.stringify(error, null, 2))
    throw new Error(`Fehler beim Speichern des Fahrers: ${error.message}`)
  }

  console.log("[v0] Driver added successfully:", data)
  revalidatePath("/")
  return data
}

export async function updateDriver(id: string, driver: Omit<Driver, "id">) {
  console.log("[v0] updateDriver called with id:", id, "data:", driver)
  const supabase = await createClient()
  const { data, error } = await supabase.from("drivers").update(driver).eq("id", id).select()

  if (error) {
    console.error("[v0] Error updating driver:", error)
    console.error("[v0] Error details:", JSON.stringify(error, null, 2))
    throw new Error(`Fehler beim Aktualisieren des Fahrers: ${error.message}`)
  }

  console.log("[v0] Driver updated successfully:", data)
  revalidatePath("/")
  return data
}

export async function deleteDriver(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("drivers").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting driver:", error)
    throw new Error("Fehler beim Löschen des Fahrers")
  }

  revalidatePath("/")
}
