"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Ride } from "@/types/ride"
import type { Driver } from "@/types/driver"

interface RideFormProps {
  onSubmit: (ride: Ride) => void
  drivers: Driver[]
  editingRide?: Ride | null
  onCancelEdit?: () => void
}

export function RideForm({ onSubmit, drivers, editingRide, onCancelEdit }: RideFormProps) {
  const [formData, setFormData] = useState<Partial<Ride>>({
    type: "arrival",
    driver: "defaultDriver",
    date: "",
    time: "",
    pickup_time: "",
    flight: "",
    guest: "",
    passengers: 1,
    location: "",
    phone: "",
    notes: "",
    guest_informed: false, // Added guest_informed to initial state
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editingRide) {
      setFormData(editingRide)
    } else {
      setFormData({
        type: "arrival",
        driver: "defaultDriver",
        date: "",
        time: "",
        pickup_time: "",
        flight: "",
        guest: "",
        passengers: 1,
        location: "",
        phone: "",
        notes: "",
        guest_informed: false, // Added guest_informed to reset state
      })
    }
  }, [editingRide])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(formData as Ride)
      if (!editingRide) {
        setFormData({
          type: "arrival",
          driver: "defaultDriver",
          date: "",
          time: "",
          pickup_time: "",
          flight: "",
          guest: "",
          passengers: 1,
          location: "",
          phone: "",
          notes: "",
          guest_informed: false, // Added guest_informed to reset state
        })
      }
    } catch (error) {
      console.error("Error submitting ride:", error)
      alert(`Fehler beim Speichern: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">
        {editingRide ? "Fahrt bearbeiten" : "Neue Fahrt erfassen"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Typ</Label>
            <Select
              key={`type-${formData.type}`}
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as "arrival" | "departure" })}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="arrival">Ankunft</SelectItem>
                <SelectItem value="departure">Abfahrt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver">Fahrer</Label>
            {drivers.length > 0 ? (
              <Select
                key={`driver-${formData.driver}`}
                value={formData.driver || "defaultDriver"}
                onValueChange={(value) => setFormData({ ...formData, driver: value })}
              >
                <SelectTrigger id="driver">
                  <SelectValue placeholder="Fahrer auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defaultDriver">--- Kein Fahrer ---</SelectItem>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.name}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="driver"
                value={formData.driver}
                onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                placeholder="Name des Fahrers"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Datum</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="time">Flug-/Zugzeit</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickup_time">Abholzeit</Label>
              <Input
                id="pickup_time"
                type="time"
                value={formData.pickup_time}
                onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="flight">Flugnummer</Label>
            <Input
              id="flight"
              value={formData.flight}
              onChange={(e) => setFormData({ ...formData, flight: e.target.value.toUpperCase() })}
              placeholder="z.B. LH123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest">Gast</Label>
            <Input
              id="guest"
              value={formData.guest}
              onChange={(e) => setFormData({ ...formData, guest: e.target.value })}
              placeholder="Name des Gastes"
              className="font-bold text-red-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passengers">Personenanzahl</Label>
            <Input
              id="passengers"
              type="number"
              min="1"
              value={formData.passengers}
              onChange={(e) => setFormData({ ...formData, passengers: Number.parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ort</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Abholort / Zielort"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+49 123 456789"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notizen</Label>
          <Input
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Zusätzliche Informationen"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="guest_informed"
            checked={formData.guest_informed || false}
            onCheckedChange={(checked) => setFormData({ ...formData, guest_informed: checked as boolean })}
          />
          <Label
            htmlFor="guest_informed"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Gast informiert
          </Label>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Wird gespeichert..." : editingRide ? "Änderungen speichern" : "Fahrt speichern"}
          </Button>
          {editingRide && onCancelEdit && (
            <Button type="button" variant="outline" size="lg" onClick={onCancelEdit}>
              Abbrechen
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}
