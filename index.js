const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
// const { MongoClient } = require('mongodb');
const ObjectID = require('mongodb').ObjectID;

const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://nahid2344:n335566GG4344@cluster0.yp2u3.mongodb.net/instagramCloneDB?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const postCollection = client.db("instagramCloneDB").collection("posts");
  const userCollection = client.db("instagramCloneDB").collection("users");

  app.get('/profilePosts', (req, res) => {
    const userEmail = req.query.email;
    console.log(userEmail)
    postCollection.find({ email: userEmail })
      .toArray((err, posts) => {
        res.send(posts)
      })
  })

  app.post("/addUsers", (req, res) => {
    const newUser = req.body;
    userCollection.insertOne(newUser)
      .then(result => {
        console.log("inserted count", result.insertedCount);
        res.send(result.insertedCount > 0)
      })
  })
  app.get('/allUsers', (req, res) => {
    userCollection.find()
      .toArray((err, items) => {
        res.send(items);
      })
  })

  app.get('/post/:id', (req, res) => {
    const id = ObjectID(req.params.id)
    postCollection.find({ _id: id })
      .toArray((err, documents) => {
        res.send(documents[0]);
      })
  })

  // app.patch("/like/:id", (req, res) => {
  //   console.log("data:",req.body.likeData);
  //   postCollection.updateOne({_id: ObjectID(req.params.id)},
  //     {$push: {likes: req.body.likeData}})
  //     .then (result => {
  //       res.send(result.modifiedCount > 0)
  //     })
  // })

  app.patch('/like/:id', async (req, res) => {
    const email = req.body;
    console.log("email", email.email)
    try {
      await postCollection.updateOne({ _id: new ObjectID(req.params.id) },
      { $push: { likes : email.email } },
      { upsert: true });
      // Send response in here
      res.send('Item Updated!');

    } catch(err) {
        console.error(err.message);
        res.sendStatus(400).send('Server Error');
    }
});

  app.post("/addPosts", (req, res) => {
    const newPost = req.body;
    postCollection.insertOne(newPost)
      .then(result => {
        console.log("inserted count", result.insertedCount);
        res.send(result.insertedCount > 0)
      })
  })
  app.get('/allPosts', (req, res) => {
    postCollection.find()
      .toArray((err, items) => {
        res.send(items);
      })
  })
});


// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6dt9c.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// ///////
// client.connect(err => {
//   const serviceCollection = client.db(process.env.DB_NAME).collection("services");
//   const orderCollection = client.db(process.env.DB_NAME).collection("orders");
//   const reviewCollection = client.db(process.env.DB_NAME).collection("reviews");
//   const engineerCollection = client.db(process.env.DB_NAME).collection("engineers");
//   const postCollection = client.db(process.env.DB_NAME).collection("posts");

//   app.post("/addPosts", (req, res) => {
//     const newPost = req.body;
//     postCollection.insertOne(newPost)
//       .then(result => {
//         console.log("inserted count", result.insertedCount);
//         res.send(result.insertedCount > 0)
//       })
//   })

//   app.post("/addServices", (req, res) => {
//     const newService = req.body;
//     console.log("New Event", newService);
//     serviceCollection.insertOne(newService)
//       .then(result => {
//         console.log("inserted count", result.insertedCount);
//         res.send(result.insertedCount > 0)
//       })
//   })


//   app.get('/services', (req, res) => {
//     serviceCollection.find()
//       .toArray((err, items) => {
//         res.send(items);
//       })
//   })

//   app.delete('/deleteService/:id', (req, res) => {
//     const id = ObjectID(req.params.id);
//     console.log('delete event', id);
//     serviceCollection.findOneAndDelete({ _id: id })
//       .then(documents => res.send(!!documents.value))
//   })

//   // Add Orders
//   app.post('/addOrders', (req, res) => {
//     const newOrder = req.body;
//     orderCollection.insertOne(newOrder)
//       .then(result => {
//         res.send(result.insertedCount > 0)
//       })
//   })

//   app.get('/orders', (req, res) => {
//     //console.log(req.query.email)
//     const userEmail = req.query.email
//     engineerCollection.find({ email: userEmail })
//       .toArray((err, engineers) => {
//         const filter = {};
//         if (engineers.length === 0) {
//           filter.email = userEmail;
//         }
//         orderCollection.find(filter)
//           .toArray((err, documents) => {
//             res.send(documents)
//           })
//       })
//   })
//   // single order load & update status
//   app.get('/order/:id', (req, res) => {
//     const id = ObjectID(req.params.id)
//     orderCollection.find({_id: id})
//     .toArray ( (err, documents) =>{
//       res.send(documents[0]);
//     })
//   })
//   app.patch('/update/:id', (req, res) => {
//     orderCollection.updateOne({_id: ObjectID(req.params.id)},
//     {
//       $set: {status: req.body.newStatus}
//     })
//     .then (result => {
//       res.send(result.modifiedCount > 0)
//     })
//   })

//   //add review
//   app.post("/addReviews", (req, res) => {
//     const newReview = req.body;
//     console.log("New Review", newReview);
//     reviewCollection.insertOne(newReview)
//       .then(result => {
//         console.log("inserted count", result.insertedCount);
//         res.send(result.insertedCount > 0)
//       })
//   })


//   app.get('/reviews', (req, res) => {
//     reviewCollection.find()
//       .toArray((err, items) => {
//         res.send(items);
//       })
//   })

//   /////////////add engineer

//   app.post("/addEngineers", (req, res) => {
//     const newEngineer = req.body;
//     console.log("New Engineer", newEngineer);
//     engineerCollection.insertOne(newEngineer)
//       .then(result => {
//         console.log("inserted count", result.insertedCount);
//         res.send(result.insertedCount > 0)
//       })
//   })

//   app.get('/engineers', (req, res) => {
//     engineerCollection.find()
//       .toArray((err, items) => {
//         res.send(items);
//       })
//   })
//   ///admin
//   app.post('/isEngineer', (req, res) => {
//     const signInEmail = req.body.email;
//     console.log("isEngineer", signInEmail)
//     engineerCollection.find({ email: signInEmail })
//       .toArray((err, engineers) => {
//         res.send(engineers.length > 0);
//       })
//   })

// });
/////////

app.get('/', (req, res) => {
  res.send('Hello from Airvice AC Repairing!')
})

app.listen(process.env.PORT || port)