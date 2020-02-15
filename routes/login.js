const jwt = require('jsonwebtoken');
const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

//Login route
router.post('/', (req, res) => {

    fs.readFile(path.join(__dirname, '../data', 'logon.txt'), 'utf8', function(err, data) {
      if(err) throw err;

      const file = JSON.parse(data);

      // user check and return token
      if (req.body.user == file.user && req.body.pw == file.pw) {
        jwt.sign({user: req.body.user, pw: req.body.pw}, 'secretkey', { expiresIn: '300s' }, (err, token) => {
          console.log(token);
          console.log("Login Success")
            res.json({
              token: token
            });
          });   
      } else {
          res.json({
            token: false
          });
      }
    });
  
});

module.exports = router;