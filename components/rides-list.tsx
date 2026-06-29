"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { Ride } from "@/types/ride"
import {
  Trash2,
  Phone,
  MapPin,
  Users,
  Plane,
  Calendar,
  Clock,
  Pencil,
  Download,
  Link2,
  Unlink,
  Archive,
  ArchiveRestore,
  CarFront,
  CheckCircle2,
} from "lucide-react"
import { useState } from "react"
import { groupRides, ungroupRides, archiveRide, unarchiveRide } from "@/lib/actions/rides" // Added archive actions

interface RidesListProps {
  rides: Ride[]
  onDelete: (id: string) => void
  onEdit: (ride: Ride) => void
  showArchived?: boolean // Added prop to control archived visibility
}

export function RidesList({ rides, onDelete, onEdit, showArchived = false }: RidesListProps) {
  const [selectedDate, setSelectedDate] = useState<string>("upcoming") // Changed default from "all" to "upcoming"
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedRides, setSelectedRides] = useState<Set<string>>(new Set())
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const exportToCSV = () => {
    const headers = ["Typ", "Fahrer", "Datum", "Uhrzeit", "Flug", "Gast", "Personen", "Ort", "Telefon", "Bemerkungen"]

    const csvData = rides.map((ride) => [
      ride.type === "arrival" ? "Ankunft" : "Abfahrt",
      ride.driver || "",
      new Date(ride.date).toLocaleDateString("de-DE", {
        weekday: "long",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      ride.time.slice(0, 5),
      ride.flight,
      ride.guest || "",
      ride.passengers.toString(),
      ride.location,
      ride.phone || "",
      ride.notes || "",
    ])

    const csvContent = [headers.join(";"), ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(";"))].join("\n")

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `fahrten_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleRideSelection = (rideId: string) => {
    const newSelection = new Set(selectedRides)
    if (newSelection.has(rideId)) {
      newSelection.delete(rideId)
    } else {
      newSelection.add(rideId)
    }
    setSelectedRides(newSelection)
  }

  const handleGroupSelected = async () => {
    if (selectedRides.size < 2) {
      alert("Bitte wählen Sie mindestens 2 Fahrten zum Gruppieren aus")
      return
    }

    try {
      await groupRides(Array.from(selectedRides))
      setSelectedRides(new Set())
      setSelectionMode(false)
    } catch (error) {
      alert("Fehler beim Gruppieren der Fahrten")
    }
  }

  const handleUngroup = async (groupId: string) => {
    try {
      await ungroupRides(groupId)
      setExpandedGroups((prev) => {
        const newSet = new Set(prev)
        newSet.delete(groupId)
        return newSet
      })
    } catch (error) {
      alert("Fehler beim Trennen der Fahrten")
    }
  }

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  const handleArchive = async (rideId: string) => {
    try {
      await archiveRide(rideId)
    } catch (error) {
      alert("Fehler beim Archivieren der Fahrt")
    }
  }

  const handleUnarchive = async (rideId: string) => {
    try {
      await unarchiveRide(rideId)
    } catch (error) {
      alert("Fehler beim Wiederherstellen der Fahrt")
    }
  }

  const filteredRides = rides.filter((ride) => {
    const rideDate = new Date(ride.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const rideDateOnly = new Date(rideDate)
    rideDateOnly.setHours(0, 0, 0, 0)

    if (selectedDate === "upcoming") {
      return rideDateOnly >= today
    }

    if (selectedDate === "all") return true

    if (selectedDate === "today") {
      return rideDateOnly.getTime() === today.getTime()
    }

    if (selectedDate === "tomorrow") {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return rideDateOnly.getTime() === tomorrow.getTime()
    }

    if (selectedDate === "week") {
      const weekFromNow = new Date(today)
      weekFromNow.setDate(weekFromNow.getDate() + 7)
      return rideDate >= today && rideDate <= weekFromNow
    }

    return true
  })

  const groupedRides = filteredRides.reduce(
    (acc, ride) => {
      if (ride.group_id) {
        if (!acc[ride.group_id]) {
          acc[ride.group_id] = []
        }
        acc[ride.group_id].push(ride)
      } else {
        acc[ride.id || "ungrouped"] = [ride]
      }
      return acc
    },
    {} as Record<string, Ride[]>,
  )

  if (filteredRides.length === 0) {
    return (
      <Card className="p-6 sm:p-12 text-center">
        <p className="text-gray-500 text-base sm:text-lg">Keine Fahrten für diesen Zeitraum</p>
        <p className="text-gray-400 text-xs sm:text-sm mt-2">
          Wählen Sie einen anderen Filter oder erstellen Sie eine neue Fahrt
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-2 sm:space-y-4">
      <Card className="p-2 sm:p-4">
        <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <Button
              variant={selectedDate === "upcoming" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDate("upcoming")}
              className="text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-3"
            >
              Aktuell
            </Button>
            <Button
              variant={selectedDate === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDate("all")}
              className="text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-3"
            >
              Alle ({rides.length})
            </Button>
            <Button
              variant={selectedDate === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDate("today")}
              className="text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-3"
            >
              Heute
            </Button>
            <Button
              variant={selectedDate === "tomorrow" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDate("tomorrow")}
              className="text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-3"
            >
              Morgen
            </Button>
            <Button
              variant={selectedDate === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDate("week")}
              className="text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-3"
            >
              7 Tage
            </Button>
          </div>
          <div className="flex gap-1.5 sm:gap-2">
            <Button
              variant={selectionMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectionMode(!selectionMode)
                setSelectedRides(new Set())
              }}
              className="gap-1 sm:gap-2 text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-3"
            >
              <Link2 className="w-3 h-3 sm:w-4 sm:h-4" />
              {selectionMode ? "Abbrechen" : "Gruppieren"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="gap-1 sm:gap-2 bg-transparent text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-3"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              CSV
            </Button>
          </div>
        </div>

        {selectionMode && selectedRides.size > 0 && (
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">
                {selectedRides.size} {selectedRides.size === 1 ? "Fahrt" : "Fahrten"} ausgewählt
              </span>
              <Button
                size="sm"
                onClick={handleGroupSelected}
                disabled={selectedRides.size < 2}
                className="text-xs sm:text-sm h-7 sm:h-9"
              >
                Gruppieren
              </Button>
            </div>
          </div>
        )}
      </Card>

      {Object.entries(groupedRides).map(([groupKey, groupRides]) => {
        const isGroup = groupRides.length > 1 && groupRides[0].group_id
        const isExpanded = expandedGroups.has(groupKey)

        if (isGroup) {
          const firstRide = groupRides[0]
          const totalPassengers = groupRides.reduce((sum, r) => sum + r.passengers, 0)

          return (
            <Card key={groupKey} className="overflow-hidden border-2 border-blue-200">
              <div
                className="p-2 sm:p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => toggleGroupExpansion(groupKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {firstRide.guest && (
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                        <span className="font-bold text-red-600 text-base sm:text-lg">{firstRide.guest}</span>
                        {firstRide.guest_informed && (
                          <div className="flex items-center gap-0.5 sm:gap-1 text-green-600">
                            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm font-medium">Informiert</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-1 sm:mb-2">
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-600 text-white">
                        Gruppe ({groupRides.length})
                      </span>
                      {firstRide.driver && firstRide.driver !== "defaultDriver" && (
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm">{firstRide.driver}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-700 flex-wrap">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{totalPassengers} Pers.</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>
                          {new Date(firstRide.date).toLocaleDateString("de-DE", {
                            weekday: "short",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUngroup(groupKey)
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 sm:h-9 sm:w-9"
                    >
                      <Unlink className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="divide-y divide-gray-200">
                  {groupRides.map((ride) => (
                    <div key={ride.id} className="p-2 sm:p-4 bg-white">
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="flex-1 space-y-1.5 sm:space-y-3">
                          {ride.guest && (
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <span className="font-bold text-red-600 text-base sm:text-lg">{ride.guest}</span>
                              {ride.guest_informed && (
                                <div className="flex items-center gap-0.5 sm:gap-1 text-green-600">
                                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="text-xs sm:text-sm font-medium">Informiert</span>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <span
                              className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
                                ride.type === "arrival" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {ride.type === "arrival" ? "Ankunft" : "Abfahrt"}
                            </span>
                            {ride.driver && ride.driver !== "defaultDriver" && (
                              <span className="font-semibold text-gray-900 text-xs sm:text-sm">{ride.driver}</span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
                            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                              <span>
                                {new Date(ride.date).toLocaleDateString("de-DE", {
                                  weekday: "short",
                                  month: "2-digit",
                                  day: "2-digit",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                              <CarFront className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                              <span>Abh: {ride.pickup_time ? ride.pickup_time.slice(0, 5) : "--:--"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                              <span>Flug: {ride.time.slice(0, 5)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                              <Plane className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                              <span>{ride.flight}</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                              <span>
                                {ride.passengers} {ride.passengers === 1 ? "Pers." : "Pers."}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                              <span className="truncate">{ride.location}</span>
                            </div>
                            {ride.phone && (
                              <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                <a href={`tel:${ride.phone}`} className="hover:underline">
                                  {ride.phone}
                                </a>
                              </div>
                            )}
                          </div>

                          {ride.notes && (
                            <div className="pt-1.5 sm:pt-2 border-t border-gray-100">
                              <p className="text-xs sm:text-sm text-gray-600 italic">{ride.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1 sm:gap-2">
                          {showArchived ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => ride.id && handleUnarchive(ride.id)}
                              className="text-green-500 hover:text-green-700 hover:bg-green-50 h-7 w-7 sm:h-9 sm:w-9"
                              title="Wiederherstellen"
                            >
                              <ArchiveRestore className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => ride.id && handleArchive(ride.id)}
                              className="text-orange-500 hover:text-orange-700 hover:bg-orange-50 h-7 w-7 sm:h-9 sm:w-9"
                              title="Archivieren"
                            >
                              <Archive className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(ride)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 h-7 w-7 sm:h-9 sm:w-9"
                          >
                            <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => ride.id && onDelete(ride.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 sm:h-9 sm:w-9"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        } else {
          const ride = groupRides[0]
          return (
            <Card
              key={ride.id}
              className={`p-2 sm:p-4 hover:shadow-md transition-shadow ${
                ride.driver && ride.driver !== "defaultDriver" ? "bg-orange-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                {selectionMode && (
                  <div className="pt-0.5 sm:pt-1">
                    <Checkbox
                      checked={selectedRides.has(ride.id!)}
                      onCheckedChange={() => toggleRideSelection(ride.id!)}
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                  </div>
                )}

                <div className="flex-1 space-y-1.5 sm:space-y-3">
                  {ride.guest && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="font-bold text-red-600 text-base sm:text-lg">{ride.guest}</span>
                      {ride.guest_informed && (
                        <div className="flex items-center gap-0.5 sm:gap-1 text-green-600">
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm font-medium">Informiert</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span
                      className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
                        ride.type === "arrival" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {ride.type === "arrival" ? "Ankunft" : "Abfahrt"}
                    </span>
                    {ride.driver && ride.driver !== "defaultDriver" && (
                      <span className="font-semibold text-gray-900 text-xs sm:text-sm">{ride.driver}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span>
                        {new Date(ride.date).toLocaleDateString("de-DE", {
                          weekday: "short",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                      <CarFront className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span>Abh: {ride.pickup_time ? ride.pickup_time.slice(0, 5) : "--:--"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span>Flug: {ride.time.slice(0, 5)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                      <Plane className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span>{ride.flight}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span>
                        {ride.passengers} {ride.passengers === 1 ? "Pers." : "Pers."}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span className="truncate">{ride.location}</span>
                    </div>
                    {ride.phone && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <a href={`tel:${ride.phone}`} className="hover:underline">
                          {ride.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {ride.notes && (
                    <div className="pt-1.5 sm:pt-2 border-t border-gray-100">
                      <p className="text-xs sm:text-sm text-gray-600 italic">{ride.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-1 sm:gap-2">
                  {showArchived ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => ride.id && handleUnarchive(ride.id)}
                      className="text-green-500 hover:text-green-700 hover:bg-green-50 h-7 w-7 sm:h-9 sm:w-9"
                      title="Wiederherstellen"
                    >
                      <ArchiveRestore className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => ride.id && handleArchive(ride.id)}
                      className="text-orange-500 hover:text-orange-700 hover:bg-orange-50 h-7 w-7 sm:h-9 sm:w-9"
                      title="Archivieren"
                    >
                      <Archive className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(ride)}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 h-7 w-7 sm:h-9 sm:w-9"
                  >
                    <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => ride.id && onDelete(ride.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 sm:h-9 sm:w-9"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        }
      })}
    </div>
  )
}
