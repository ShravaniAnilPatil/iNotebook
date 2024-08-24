const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const fetchUser1 = require('../middleware/fetchUser2'); 
const JWT_SECRET = "Shravaniisagood$girl"; // Secret key for JWT signing

// Middleware to parse JSON bodies
router.use(express.json());

// Middleware to fetch user details from JWT token
const fetchUser = (req, res, next) => {
  // Get the token from the header
  const token = req.header("auth-token");
  if (!token) {
    return res
      .status(401)
      .send({ error: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    return res
      .status(401)
      .send({ error: "Please authenticate using a valid token" });
  }
};

// Route 1: Create a User using: POST "/api/auth/createuser". Doesn't require auth
router.post(
  "/createuser",
  [
    // Validate the 'name' field: it should be at least 3 characters long
    body("name", "Enter a valid name").isLength({ min: 3 }),
    // Validate the 'email' field: it should be a valid email address
    body("email", "Enter a valid email").isEmail(),
    // Validate the 'password' field: it should be at least 7 characters long
    body("password", "Enter a password of at least 7 characters").isLength({
      min: 7,
    }),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return 400 status and the validation errors if any
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Destructure name, email, and password from the request body
      const { name, email, password } = req.body;

      // Check if the user already exists in the database
      let user = await User.findOne({ email });
      if (user) {
        // If user already exists, return 400 status with an error message
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      // Generate salt for hashing the password
      const salt = await bcrypt.genSalt(10);
      // Hash the password with the generated salt
      const secPass = await bcrypt.hash(password, salt);

      // Create a new user instance with the hashed password
      user = new User({
        name,
        email,
        password: secPass, // Save the hashed password
      });

      // Save the new user to the database
      await user.save();

      // Create a payload for JWT containing the user ID
      const data = {
        user: {
          id: user.id,
        },
      };

      // Sign the JWT token with the payload and secret key
      const authToken = jwt.sign(data, JWT_SECRET);
      console.log(authToken); // Optionally log the token for debugging purposes

      // Return the JWT token to the client
      res.json({ authToken });
    } catch (error) {
      console.error(error.message); // Log the error message
      // Return 500 status for server error
      res.status(500).send("Server error");
    }
  }
);

// Route 2: Authenticate a User using: POST "/api/auth/login". Doesn't require auth
router.post(
  "/login",
  [
    // Validate the 'email' field: it should be a valid email address
    body("email", "Enter a valid email").isEmail(),
    // Validate the 'password' field: it should not be blank
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return 400 status and the validation errors if any
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if the user exists in the database
      let user = await User.findOne({ email });
      if (!user) {
        // If user does not exist, return 400 status with an error message
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      // Compare the provided password with the stored hashed password
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        // If password does not match, return 400 status with an error message
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      // Create a payload for JWT containing the user ID
      const data = {
        user: {
          id: user.id,
        },
      };

      // Sign the JWT token with the payload and secret key
      const authToken = jwt.sign(data, JWT_SECRET);
      console.log(authToken); // Optionally log the token for debugging purposes

      // Return the JWT token to the client
      res.json({ authToken });
    } catch (error) {
      console.error(error.message); // Log the error message
      // Return 500 status for server error
      res.status(500).send("Server error");
    }
  }
);

// Route 3: Get user details using POST "/api/auth/getuser". Login required
router.post('/getuser', fetchUser1, async (req, res) => {
  try {
    // Fetch the user details from the database using the ID stored in req.user
    
    
    const user = await User.findById(req.user.id).select('-password'); // Exclude the password field
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
})
module.exports = router;
