import { Booking } from "./room"

export interface User {
  username: string
  password: string
  firstName: string
  lastName: string
  dateOfBirth: string
  bookings: UserBooking[]  
}

export interface UserBooking {
  roomId: string
  booking: Booking
}
