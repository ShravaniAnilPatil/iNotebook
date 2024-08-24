const jwt = require('jsonwebtoken');
const JWT_SECRET = "Shravaniisagood$girl"; // Secret key for JWT signing


const fetchUser1 = (req, res, next) => {
  // Get the token from the header
  const token = req.header('auth-token');

  if (!token) {
    return res.status(401).json({ error: 'Please authenticate using a valid token' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Extract the user ID from the decoded JWT token
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error(error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = fetchUser1;
