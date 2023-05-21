"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const room_1 = require("./model/room");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const hotelDB = new mongodb_1.MongoClient("mongodb://127.0.0.1:27017").db("HotelDB");
const options = {
    origin: "*"
};
app.use((0, cors_1.default)(options));
app.use(express_1.default.json());
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const loginReq = req.body;
    const user = yield hotelDB.collection("users").findOne({
        username: loginReq.username
    });
    if (user == null) {
        res.send({ err: "User does not exist" });
    }
    else if (user.password != loginReq.password) {
        res.send({ err: "Wrong password bruh" });
    }
    else {
        const id = user._id.toString();
        res.send({ id });
    }
}));
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const userCollection = hotelDB.collection("users");
    let maybeUser = yield userCollection.findOne({ username: body.username });
    if (maybeUser != null) {
        res.send({ err: "User already exists" });
        return;
    }
    const user = yield userCollection.insertOne(Object.assign(Object.assign({}, body), { bookings: [] }));
    const id = user.insertedId;
    res.send({ id });
}));
app.post('/checkAvailability', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requestedBooking = req.body;
    const rooms = yield hotelDB.collection("rooms").find().toArray();
    var availableRooms = [];
    for (let i = 0; i < rooms.length; i++) {
        const bookings = rooms[i].bookings;
        var isAvailable = true;
        for (let j = 0; j < bookings.length; j++) {
            const booking = bookings[j];
            if ((0, room_1.isOverlapping)(booking, requestedBooking)) {
                isAvailable = false;
                break;
            }
        }
        if (isAvailable) {
            availableRooms.push(rooms[i]);
        }
    }
    res.send(availableRooms);
}));
app.post("/book", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bookingReq = req.body;
    const userId = req.headers["user-id"];
    if (!(yield isAuthenticated(req.headers))) {
        res.send({ err: "Please login UwU" });
        return;
    }
    yield hotelDB.collection("users").updateOne({ _id: new mongodb_1.ObjectId(userId) }, {
        $push: {
            bookings: bookingReq
        }
    });
    yield hotelDB.collection("rooms").updateOne({ _id: new mongodb_1.ObjectId(bookingReq.roomId) }, {
        $push: {
            bookings: bookingReq.booking
        }
    });
    res.send();
}));
function isAuthenticated(headers) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = headers["user-id"];
        if (userId == null) {
            return false;
        }
        const maybeUser = yield hotelDB.collection("users").findOne({
            _id: new mongodb_1.ObjectId(userId)
        });
        return maybeUser != null;
    });
}
app.listen(3000, () => {
    console.log('App listening on port 3000!');
});
