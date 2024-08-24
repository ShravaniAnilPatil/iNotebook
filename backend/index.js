const connectToMongo = require('./db');
const express = require('express');

const app = express();
const port = 6000;

connectToMongo();

app.use(express.json());

// Add a route handler for the root URL
app.get('/', (req, res) => {
  res.send('Hello Shravani');
});


// Corrected route for your auth API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

// Your other routes here

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
