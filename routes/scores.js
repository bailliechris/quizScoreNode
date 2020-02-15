const express = require('express');
const mongodb = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const jwt = require('jsonwebtoken');

const router = express.Router();

// Verify Token for logging in
function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if(typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // Next middleware
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }
}

//Connect to MONGODB Get whole document
async function loadScoresCollection() {
              //mongodb+srv://posts_user:<password>@learningcluster-5qutw.azure.mongodb.net/test?retryWrites=true&w=majority
  const uri = "mongodb+srv://posts_user:adminp@learningcluster-5qutw.azure.mongodb.net/test?retryWrites=true&w=majority";
  const client = new mongodb(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  await client.connect();

  //Load DB "vuefullstack" and table "posts"
  return client.db("keyword-quiz").collection("quiz-scores");
}

//Get Posts
router.get('/', async (req, res) => {
    const posts = await loadScoresCollection();
    
    res.send(await posts.find({}).toArray());
});

//Return results matching a query of name and topic
router.post('/query', verifyToken, (req, res) => {
  jwt.verify(req.token, 'secretkey', async (err, authData) => {
    console.log(req.token);
    if(err) {
      res.json({
        token: false, 
        msg: "Invalid"
      });
      console.log("Query Error")
    } else {
      console.log("Query Success")
      const posts = await loadScoresCollection();
      let query = {};
    
      if (req.body.name !== "All") {
        query.name = req.body.name;
      }
      if (req.body.topic !== "All") {
        query.topic = req.body.topic;
      }
      if (req.body.time !== "All") {
        //query.time = req.body.time;
      }

      console.log(query);
    
      res.send(await posts.find(query).toArray());
    }
  });
});


//Add Posts
router.post('/', async (req, res) => {
    const posts = await loadPostsCollection();

    await posts.insertOne(req.body);

    res.status(201).send();
});

//Get scores table admin
router.get('/admin', verifyToken, (req, res) => {  
    jwt.verify(req.token, 'secretkey', async (err, authData) => {
      if(err) {
        res.json({
          token: false
        });
        console.log("Get All Error")
      } else {
        const posts = await loadScoresCollection();
        console.log("Get All Success")
        res.send(await posts.find({}).toArray());
      }
    });
});

//Get specific topic scores
router.get('/admin/topic', verifyToken, (req, res) => {  
  jwt.verify(req.token, 'secretkey', async (err, authData) => {
    if(err) {
      res.json({
        token: false
      });
    } else {
      const posts = await loadScoresCollection();
      const search = req.body.topic;
  
      res.send(await posts.find({search}).toArray());
    }
  });
});

/*
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  var myquery = { address: 'Mountain 21' };
  dbo.collection("customers").deleteOne(myquery, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    db.close();
  });
});
*/

//Send delete request to delete one
router.delete('/admin/:id', verifyToken, (req, res) => {
  jwt.verify(req.token, 'secretkey', async (err, authData) => {
    if(err) {
      res.json({
        token: false
      });
    } else {
      const posts = await loadScoresCollection();

      const deleteID = new ObjectID(req.params.id);

      console.log("Delete ID", deleteID);
  
      posts.deleteOne({_id: deleteID});

      res.status(200).send();
    }
  });
});

module.exports = router;