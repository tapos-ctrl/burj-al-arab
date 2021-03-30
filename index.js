const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require("firebase-admin");
const password = 'arabian1234';
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
console.log(process.env.DB_PASS)


const app = express()
app.use(cors());
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pt6jm.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const port = 5000




var serviceAccount = require("./configs/burj-al-arab-f1579-firebase-adminsdk-2zlrf-9b2661164f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});





const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, useUnifiedTopology: true });
client.connect(err => {
  console.log(err)
  const bookings = client.db("burjAlArab").collection("bookings");

  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    console.log(newBooking);
    bookings.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
    console.log(newBooking);
  })
  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer')) {
      const idToken = bearer.split(' ')[1];
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          if (tokenEmail == queryEmail) {
            bookings.find({ email: queryEmail })
              .toArray((err, documents) => {
                res.status(200).send(documents);
              })
          }
          else{
            res.status(401).send('un-authorized access') 
          }
        })
        .catch((error) => {
          res.status(401).send('un-authorized access')
        });
    }
    else{
      res.status(401).send('un-authorized access')
    }
  })

});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})