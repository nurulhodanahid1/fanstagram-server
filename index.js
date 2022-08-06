const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const ObjectID = require('mongodb').ObjectID;

const port = process.env.PORT || 5000;
//

app.use(cors());
app.use(bodyParser.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yp2u3.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const postCollection = client.db("fanstagramDB").collection("posts");
  const userCollection = client.db("fanstagramDB").collection("users");

  // log in
  app.post('/signin', (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(422).json({ error: "please add email or password" })
    }
    userCollection.findOne({ email: email })
      .then(savedUser => {
        console.log("savedUser--->", savedUser);
        if (!savedUser) {
          return res.status(422).json({ error: "Invalid Email or password" })
        } else {
          if (password === savedUser.password) {
            res.json({ message: "successfully signed in" })
          }
          else {
            return res.status(422).json({ error: "Invalid Email or password" })
          }
        }
      })
      .catch(err => {
        console.log(err)
      })
  })

  //signup
  app.post('/signup', (req, res) => {
    const newUser = req.body;
    const { name, email, password } = newUser;
    if (!email || !password || !name) {
      return res.status(422).json({ error: "please add all the fields" })
    } else {
      userCollection.findOne({ email: email })
        .then(savedUser => {
          if (savedUser) {
            return res.status(422).json({ error: "user already exists with that email" })
          } else {
            userCollection.insertOne(newUser)
              .then(result => {
                console.log("inserted count", result.insertedCount);
                res.send(result.insertedCount > 0)
              })
          }
        })
        .catch(err => {
          console.log(err)
        })
    }
  })

  // All User //
  app.get('/users', (req, res) => {
    userCollection.find()
      .toArray((err, items) => {
        res.send(items);
      })
  });

  // Crate Post for Login User //
  // All posts showed
  app.post("/addPosts", (req, res) => {
    const newPost = req.body;
    postCollection.insertOne(newPost)
      .then(result => {
        console.log("inserted count", result.insertedCount);
        res.send(result.insertedCount > 0)
      })
  })
  app.get('/posts', (req, res) => {
    postCollection.find()
      .toArray((err, items) => {
        res.send(items);
      })
  })

  // Single Post Find For Comment In post Component//
  app.get('/post/:id', (req, res) => {
    const id = ObjectID(req.params.id)
    postCollection.find({ _id: id })
      .toArray((err, documents) => {
        res.send(documents[0]);
      })
  })


  // Add Comment in a Post ///
  app.patch('/comment/:id', async (req, res) => {
    const newComment = req.body;
    try {
      await postCollection.updateOne({ _id: new ObjectID(req.params.id) },
        { $push: { comments: newComment } },
        { upsert: true }).then(data => {
          res.send(data)
        })
    } catch (err) {
      console.log(err.message);
      res.sendStatus(400).send('Server Error');
    }
  });

    // Add and Remove like each post
    app.patch('/like/:id', async (req, res) => {
      const email = req.body;
      try {
        await postCollection.updateOne({ _id: new ObjectID(req.params.id) },
          { $push: { likes: email.email } },
          { upsert: true }).then( data => {
            res.send(data)
          })
      } catch (err) {
        console.error(err.message);
        res.sendStatus(400).send('Server Error');
      }
    });
    app.patch('/unlike/:id', async (req, res) => {
      const email = req.body;
      try {
        await postCollection.updateOne({ _id: new ObjectID(req.params.id) },
          { $pull: { likes: email.email } },
          { upsert: true }).then( data => {
            res.send(data)
          })
      } catch (err) {
        console.error(err.message);
        res.sendStatus(400).send('Server Error');
      }
    });


    // Every User Different Profile Details //
  app.get('/profilePosts', (req, res) => {
    const userEmail = req.query.email;
    console.log(userEmail)
    postCollection.find({ email: userEmail })
      .toArray((err, posts) => {
        res.send(posts)
      })
  })

  app.delete('/deletePost/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    console.log('delete event', id);
    postCollection.findOneAndDelete({ _id: id })
      .then(documents => res.send(!!documents.value))
  })

  app.patch('/addProfilePic', async (req, res) => {
    const { userId, imageURL } = req.body;
    console.log("user id:", userId)
    console.log("image url:", imageURL);
    try {
      await userCollection.updateOne({ _id: new ObjectID(userId) },
        { $set: { imageURL: imageURL } },
        { upsert: true }).then( data => {
          res.send(data)
        })

    } catch (err) {
      console.error(err.message);
      res.sendStatus(400).send('Server Error');
    }
  });


  //  Follow and Unfollow User 
  //  Adding to Followers array and Following array same time
  app.patch('/follow', async (req, res) => {
    const { followersEmail, followersId, followingEmail } = req.body;
    try {
      await userCollection.updateOne({ _id: new ObjectID(followersId) },
        { $push: { following: followingEmail } },
        { upsert: true }).then( data => {
          res.send(data)
        })
    } catch (err) {
      console.error(err.message);
      res.sendStatus(400).send('Server Error');
    }
  });

  app.patch('/follow/:id', async (req, res) => {
    const { followersEmail, followersId, followingEmail } = req.body;
    try {
      await userCollection.updateOne({ _id: new ObjectID(req.params.id) },
        { $push: { followers: followersEmail } },
        { upsert: true }).then( data => {
          res.send(data)
        })

    } catch (err) {
      console.error(err.message);
      res.sendStatus(400).send('Server Error');
    };
  });

  app.patch('/unfollow/:id', async (req, res) => {
    const { followersEmail, followersId, followingEmail } = req.body;
    try {
      await userCollection.updateOne({ _id: new ObjectID(req.params.id) },
        { $pull: { followers: followersEmail } },
        { upsert: true }).then( data => {
          res.send(data)
        })

    } catch (err) {
      console.error(err.message);
      res.sendStatus(400).send('Server Error');
    };
  });

  app.patch('/unfollow', async (req, res) => {
    const { followersEmail, followersId, followingEmail } = req.body;
    try {
      await userCollection.updateOne({ _id: new ObjectID(followersId) },
        { $pull: { following: followingEmail } },
        { upsert: true }).then( data => {
          res.send(data)
        })

    } catch (err) {
      console.error(err.message);
      res.sendStatus(400).send('Server Error');
    }
  });

  

});

app.get('/', (req, res) => {
  res.send('Hello from FanstaGram Server!');
})

app.listen(process.env.PORT || port)