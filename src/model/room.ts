export interface Booking {
  from: string
  to: string
}

export interface Room {
  bookings: Booking[]
  price: number
}

// a  . --- .
// b      . ---- .
export function isOverlapping(a: Booking, b: Booking): boolean {
  let aTo = new Date(a.to)
  let aFrom = new Date(a.from)
  let bTo = new Date(b.to)
  let bFrom = new Date(b.from)
  return (aTo > bFrom && aFrom < bTo) || (bTo > aFrom && bFrom < aTo)
}