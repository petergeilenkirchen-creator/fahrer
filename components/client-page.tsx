"use client"

import { useState, useOptimistic } from "react"
import { Button } from "@/components/ui/button"
import { RideForm } from "@/components/ride-form"
import { RidesList } from "@/components/rides-list"
import { DriverManagement } from "@/components/driver-management"
import { AirportFlights } from "@/components/airport-flights"
import { TrainDepartures } from "@/components/train-departures"
import type { Ride } from "@/types/ride"
import type { Driver } from "@/types/driver"
import { addRide, deleteRide, updateRide, getRides } from "@/lib/actions/rides"
import { addDriver, deleteDriver, updateDriver } from "@/lib/actions/drivers"
import { logout } from "@/lib/actions/auth"
import { LogOut, Archive } from "lucide-react"

interface ClientPageProps {
  initialRides: Ride[]
  initialDrivers: Driver[]
}

export function ClientPage({ initialRides, initialDrivers }: ClientPageProps) {
  const [view, setView] = useState<"form" | "list" | "drivers" | "airport" | "trains" | "archived">("list")
  const [optimisticRides, setOptimisticRides] = useOptimistic(initialRides)
  const [optimisticDrivers, setOptimisticDrivers] = useOptimistic(initialDrivers)
  const [editingRide, setEditingRide] = useState<Ride | null>(null)
  const [archivedRides, setArchivedRides] = useState<Ride[]>([])

  const handleViewArchived = async () => {
    try {
      const allRides = await getRides(true)
      const archived = allRides.filter((ride) => ride.archived === true)
      setArchivedRides(archived)
      setView("archived")
    } catch (error) {
      console.error("Failed to load archived rides:", error)
      alert("Fehler beim Laden der archivierten Fahrten")
    }
  }

  const handleAddRide = async (ride: Ride) => {
    try {
      if (editingRide?.id) {
        await updateRide(editingRide.id, ride)
        setEditingRide(null)
      } else {
        await addRide(ride)
      }
      setView("list")
    } catch (error) {
      console.error("Failed to save ride:", error)
      alert(`Fehler beim Speichern der Fahrt: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`)
    }
  }

  const handleDeleteRide = async (id: string) => {
    try {
      await deleteRide(id)
    } catch (error) {
      console.error("Failed to delete ride:", error)
      alert("Fehler beim Löschen der Fahrt")
    }
  }

  const handleEditRide = (ride: Ride) => {
    setEditingRide(ride)
    setView("form")
  }

  const handleCancelEdit = () => {
    setEditingRide(null)
    setView("list")
  }

  const handleSelectFlight = (flightNumber: string) => {
    // Create a new ride with the flight number pre-filled
    setEditingRide({
      id: "",
      type: "arrival",
      driver: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      guest: "",
      flight: flightNumber,
    } as Ride)
    setView("form")
  }

  const handleAddDriver = async (driver: Omit<Driver, "id">) => {
    try {
      await addDriver(driver)
    } catch (error) {
      console.error("Failed to add driver:", error)
      alert(`Fehler beim Speichern des Fahrers: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`)
    }
  }

  const handleUpdateDriver = async (id: string, driver: Omit<Driver, "id">) => {
    try {
      await updateDriver(id, driver)
    } catch (error) {
      console.error("Failed to update driver:", error)
      alert(`Fehler beim Aktualisieren des Fahrers: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`)
    }
  }

  const handleDeleteDriver = async (id: string) => {
    try {
      await deleteDriver(id)
    } catch (error) {
      console.error("Failed to delete driver:", error)
      alert("Fehler beim Löschen des Fahrers")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Fahrdienst Manager</h1>
            <Button variant="ghost" size="sm" onClick={() => logout()} className="text-gray-600 hover:text-gray-900">
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
          <Button onClick={() => setView("list")} variant={view === "list" ? "default" : "outline"} className="w-full">
            Fahrten Liste ({optimisticRides.length})
          </Button>
          <Button
            onClick={() => {
              setEditingRide(null)
              setView("form")
            }}
            variant={view === "form" && !editingRide ? "default" : "outline"}
            className="w-full"
          >
            Neue Fahrt
          </Button>
          <Button
            onClick={() => setView("drivers")}
            variant={view === "drivers" ? "default" : "outline"}
            className="w-full"
          >
            Fahrer ({optimisticDrivers.length})
          </Button>
          <Button
            onClick={() => setView("airport")}
            variant={view === "airport" ? "default" : "outline"}
            className="w-full"
          >
            Flüge NUE
          </Button>
          <Button
            onClick={() => setView("trains")}
            variant={view === "trains" ? "default" : "outline"}
            className="w-full"
          >
            Züge Hof
          </Button>
          <Button
            onClick={handleViewArchived}
            variant={view === "archived" ? "default" : "outline"}
            className="col-span-2 md:col-span-1 w-full gap-2"
          >
            <Archive className="w-4 h-4" />
            Archiv
          </Button>
        </div>

        {view === "form" ? (
          <RideForm
            onSubmit={handleAddRide}
            drivers={optimisticDrivers}
            editingRide={editingRide}
            onCancelEdit={handleCancelEdit}
          />
        ) : view === "list" ? (
          <RidesList rides={optimisticRides} onDelete={handleDeleteRide} onEdit={handleEditRide} />
        ) : view === "archived" ? (
          <RidesList rides={archivedRides} onDelete={handleDeleteRide} onEdit={handleEditRide} showArchived={true} />
        ) : view === "drivers" ? (
          <DriverManagement
            drivers={optimisticDrivers}
            onAdd={handleAddDriver}
            onUpdate={handleUpdateDriver}
            onDelete={handleDeleteDriver}
          />
        ) : view === "airport" ? (
          <AirportFlights drivers={optimisticDrivers} onSelectFlight={handleSelectFlight} />
        ) : (
          <TrainDepartures />
        )}
      </main>
    </div>
  )
}
