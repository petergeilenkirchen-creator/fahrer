export interface Ride {
  id?: string
  type: "arrival" | "departure"
  driver?: string // Made driver optional
  date: string
  time: string
  pickup_time?: string // Added pickup time for when driver picks up passenger
  flight: string
  guest?: string // Added guest field
  passengers: number
  location: string
  phone?: string // Made phone optional
  notes: string
  group_id?: string // Added for grouping rides together
  archived?: boolean // Added for archiving completed rides
  guest_informed?: boolean // Added to track if guest has been notified
}
