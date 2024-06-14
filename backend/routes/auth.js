const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Middleware to parse JSON bodies
router.use(express.json());

// Create a User using: POST "/api/auth". Doesn't require auth
router.post('/', (req, res) => {
  console.log(req.body); // Logs the request body to the console
  const user= User(req.body);
  user.save()
  res.send(req.body); // Sends back the request body as the response

 



});

module.exports = router;
