import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { Booking, Room, isOverlapping } from './model/room';
import { User, UserBooking } from './model/user';
import { IncomingHttpHeaders } from 'http';
import cors, { CorsOptions } from 'cors';

const app = express();

const hotelDB = new MongoClient("mongodb://127.0.0.1:27017").db("HotelDB");

const options: CorsOptions = {
  origin: "*"
}

app.use(cors(options))

app.use(express.json());

app.post('/login', async (req, res) => {
  const loginReq: LoginRequest = req.body
  const user = await hotelDB.collection("users").findOne({
    username: loginReq.username
  })
  if (user == null) {
    res.send({ err: "User does not exist" })
  } else if (user.password != loginReq.password) {
    res.send({ err: "Wrong password bruh" })
  } else {
    const id = user._id.toString()
    res.send({ id })
  }
});

app.post('/register', async (req, res) => {
  const body: RegisterRequest = req.body
  const userCollection = hotelDB.collection<User>("users")
  let maybeUser = await userCollection.findOne({ username: body.username })
  if (maybeUser != null) {
    res.send({ err: "User already exists" })
    return
  }
  const user = await userCollection.insertOne({
    ...body,
    bookings: []
  })
  const id = user.insertedId
  res.send({ id })
});

app.post('/checkAvailability', async (req, res) => {
  const requestedBooking: Booking = req.body
  const rooms = await hotelDB.collection<Room>("rooms").find().toArray()
  var availableRooms: Room[] = []

  for (let i = 0; i < rooms.length; i++) {
    const bookings = rooms[i].bookings;
    var isAvailable = true
    for (let j = 0; j < bookings.length; j++) {
      const booking = bookings[j]
      if (isOverlapping(booking, requestedBooking)) {
        isAvailable = false
        break
      }
    }
    if (isAvailable) {
      availableRooms.push(rooms[i])
    }
  }

  res.send(availableRooms)
})

app.post("/book", async (req, res) => {
  const bookingReq: UserBooking = req.body
  const userId = req.headers["user-id"] as string | undefined
  if (!await isAuthenticated(req.headers)) {
    res.send({ err: "Please login UwU" })
    return
  }
  await hotelDB.collection<User>("users").updateOne(
    { _id: new ObjectId(userId) },
    {
      $push: {
        bookings: bookingReq
      }
    }
  )
  await hotelDB.collection<Room>("rooms").updateOne(
    { _id: new ObjectId(bookingReq.roomId) },
    {
      $push: {
        bookings: bookingReq.booking
      }
    }
  )
  res.send()
})

async function isAuthenticated(headers: IncomingHttpHeaders): Promise<boolean> {
  const userId = headers["user-id"] as string | undefined
  if (userId == null) {
    return false
  }
  const maybeUser = await hotelDB.collection<User>("users").findOne({
    _id: new ObjectId(userId)
  })
  return maybeUser != null
}

app.listen(3000, () => {
  console.log('App listening on port 3000!');
});
