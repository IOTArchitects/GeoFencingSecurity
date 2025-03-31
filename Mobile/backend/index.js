const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyparser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios'); 

const app = express();
const port = 4000;

app.use(express.json());
app.use(bodyparser.urlencoded({ extended: false }));

// Setting up cross-origin resource sharing
app.use(cors({
  origin: 'http://172.20.10.4:8081',
  methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true
}));

// Setup MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',   // Replace with your host
  user: 'root',        // Replace with your database user
  password: 'root', // Replace with your database password
  database: 'geofencingsecuritycredentials'   // Replace with your database name
});

connection.connect((err) => {
  if (err) {
    console.log(`Error occurred due to error ${err}`);
  }
  console.log('Connected to the MySQL database');
});

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('Received:', message);

    try {
      const data = JSON.parse(message);
      if (data.action === 'approve' || data.action === 'reject') {
        // Forward the response to the Arduino
        axios.post('http://172.20.10.4:4000/rfid-response', { action: data.action })
          .then(response => {
            console.log('Response sent to Arduino:', response.data);
          })
          .catch(error => {
            console.error('Error sending response to Arduino:', error);
          });
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// RFID detection route
app.post('/rfid-detected', (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ message: 'UID is required' });
  }

  // Notify all WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event: 'rfid-detected', uid }));
    }
  });

  res.status(200).send('Notification sent to frontend');
});

// RFID response route (for Arduino)
let latestAction = null;  // Store latest action from user

// Store action when user approves/rejects
app.post('/rfid-response', (req, res) => {
  const { action } = req.body;
  if (!action) {
    return res.status(400).json({ message: 'Action is required' });
  }

  latestAction = action; // Store latest action
  res.status(200).send(action);
});

// New GET endpoint to fetch the latest action
app.get('/rfid-response', (req, res) => {
  if (!latestAction) {
    return res.status(404).json({ message: 'No action received yet' });
  }

  res.status(200).send(latestAction);
  latestAction = null;  // Reset after sending
});



// Signup functionality
app.post('/signup', (req, res) => {
  const { firstname, lastname, email, phonenumber, password } = req.body;
  if (!firstname || !lastname || !email || !phonenumber || !password) {
    return res.status(400).json({ message: 'All the details are required' });
  }

  const query = 'INSERT INTO userdetails (firstname, lastname, email, phonenumber, password) VALUES (?, ?, ?, ?, ?);';

  connection.query(query, [firstname, lastname, email, phonenumber, password], (err, results) => {
    if (err) {
      console.error('Error inserting data into the database:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    console.log('User signed up:', results);
    res.json({ message: 'User signed up successfully!' });
  });
});

// Login functionality
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const query = 'SELECT * FROM userdetails WHERE email = ? OR phonenumber = ?';

  connection.query(query, [username, username], (err, results) => {
    if (err) {
      console.error('Error fetching user from database:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = results[0];

    // Verify password (consider hashing passwords before storing in DB for better security)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.json({ message: 'Login successful', user });
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});