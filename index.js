const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

//middalware

app.use(cors());
app.use(express.json());

// grnaral server
app.get("/", (req, res) => {
  res.send("doctors protal server");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// database code is here

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@474.79d3jxt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
});

const run = async () => {
  try {
    const usercollection = client
      .db("doctostprotal")
      .collection("usercollection");
    const apoinmentOptions = client
      .db("doctostprotal")
      .collection("apoinmentOptions");

    const bookingCollection = client.db("doctostprotal").collection("bookings");

    //get all  apoinment options
    app.get("/apoinmentOptions", async (req, res) => {
      const date = req.query.date;
      console.log(date);
      const query = {};
      const options = await apoinmentOptions.find(query).toArray();

      ///date query
      const bookingquery = { appointmentDate: date };
      const allredyBooked = await bookingCollection
        .find(bookingquery)
        .toArray();

      options.forEach((option) => {
        const optionBokooed = allredyBooked.filter(
          (book) => book.treatment === option.name
        );
        const bookingSlot = optionBokooed.map((book) => book.slot);
        const remeningslot = option.slots.filter(
          (slot) => !bookingSlot.includes(slot)
        );
        option.slots = remeningslot;
      });

      res.send(options);
    });

    //bookings options

    app.post("/bookings", async (req, res) => {
      const booking = req.body;

      const query = {
        appointmentDate: booking.appointmentDate,
        treatment:booking.treatment,
        email:booking.email
      };
      const alredybooked = await bookingCollection.find(query).toArray();
  if(alredybooked.length) {
    const messege=`you have already booked ${booking.appointmentDate}`
      return res.send({ acknowledged:false, messege});
  }

      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });
  } finally {
  }
};

run().catch((ero) => console.log(ero));
