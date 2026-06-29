"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Driver } from "@/types/driver"
import { Trash2, User, Phone, Mail, Pencil } from "lucide-react"

interface DriverManagementProps {
  drivers: Driver[]
  onAdd: (driver: Omit<Driver, "id">) => void
  onUpdate: (id: string, driver: Omit<Driver, "id">) => void
  onDelete: (id: string) => void
}

export function DriverManagement({ drivers, onAdd, onUpdate, onDelete }: DriverManagementProps) {
  const [formData, setFormData] = useState<Partial<Driver>>({
    name: "",
    phone: "",
    email: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)

  useEffect(() => {
    if (editingDriver) {
      setFormData(editingDriver)
    }
  }, [editingDriver])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.phone) {
      alert("Bitte füllen Sie alle Pflichtfelder aus")
      return
    }

    setIsSubmitting(true)
    try {
      if (editingDriver?.id) {
        const { name, phone, email } = formData
        await onUpdate(editingDriver.id, { name: name!, phone: phone!, email: email || "" })
        setEditingDriver(null)
      } else {
        const { name, phone, email } = formData
        await onAdd({ name: name!, phone: phone!, email: email || "" })
      }
      setFormData({ name: "", phone: "", email: "" })
    } catch (error) {
      console.error("[v0] Error in handleSubmit:", error)
      alert(`Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingDriver(null)
    setFormData({ name: "", phone: "", email: "" })
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-900">
          {editingDriver ? "Fahrer bearbeiten" : "Neuen Fahrer hinzufügen"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Vollständiger Name"
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
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="fahrer@beispiel.de"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Wird gespeichert..." : editingDriver ? "Änderungen speichern" : "Fahrer hinzufügen"}
            </Button>
            {editingDriver && (
              <Button type="button" variant="outline" size="lg" onClick={handleCancelEdit}>
                Abbrechen
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Fahrerliste</h2>
        {drivers.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">Noch keine Fahrer hinzugefügt</p>
            <p className="text-gray-400 text-sm mt-2">Fügen Sie Ihren ersten Fahrer über das Formular oben hinzu</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drivers.map((driver) => (
              <Card key={driver.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">{driver.name}</span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${driver.phone}`} className="hover:underline">
                          {driver.phone}
                        </a>
                      </div>

                      {driver.email && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${driver.email}`} className="hover:underline">
                            {driver.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingDriver(driver)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => driver.id && onDelete(driver.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
