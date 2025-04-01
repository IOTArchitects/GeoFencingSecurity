const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyparser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');
const crypto = require('crypto');

const app = express();
const port = 4000;

app.use(express.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use(cors({
  origin: 'http://172.20.10.4:8081',
  methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true
}));

// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Trishala@99',
  database: 'geofencingsecuritycredentials'
});

connection.connect((err) => {
  if (err) {
    console.log(`Error occurred: ${err}`);
  } else {
    console.log('Connected to MySQL database');
  }
});

// AES encryption
const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync('GROUP_3_SECRETKEY', 'salt', 32);
const iv = Buffer.alloc(16, 0);

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Signup route
app.post('/signup', (req, res) => {
  const { firstname, lastname, email, phonenumber, password } = req.body;
  if (!firstname || !lastname || !email || !phonenumber || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const encryptedPassword = encrypt(password);
  const query = 'INSERT INTO userdetails (firstname, lastname, email, phonenumber, password) VALUES (?, ?, ?, ?, ?)';

  connection.query(query, [firstname, lastname, email, phonenumber, encryptedPassword], (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    res.json({ message: 'User signed up successfully!' });
  });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const query = 'SELECT * FROM userdetails WHERE email = ? OR phonenumber = ?';
  connection.query(query, [username, username], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = results[0];
    const decryptedPassword = decrypt(user.password);

    if (decryptedPassword !== password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.json({ message: 'Login successful', user });
  });
});

// WebSocket + RFID handling
let latestAction = null;
let connectedClients = [];

function broadcastRFID(uid) {
  const message = JSON.stringify({ event: 'rfid-detected', uid });
  connectedClients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

app.post('/rfid-detected', (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ message: 'UID is required' });
  }

  latestAction = null; // Reset previous action
  broadcastRFID(uid);
  res.status(200).json({ message: 'RFID broadcasted to clients' });
});

app.get('/rfid-response', (req, res) => {
  if (latestAction) {
    res.status(200).send(latestAction);
    latestAction = null; // Reset after serving once
  } else {
    res.status(204).send(); // No decision yet
  }
});

// WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected via WebSocket');
  connectedClients.push(ws);

  ws.on('message', (message) => {
    try {
      const { action } = JSON.parse(message);
      if (action === 'approve' || action === 'reject') {
        latestAction = action;
        console.log(`Action set to: ${action}`);
      }
    } catch (err) {
      console.error('Invalid message from WebSocket:', err);
    }
  });

  ws.on('close', () => {
    connectedClients = connectedClients.filter(client => client !== ws);
    console.log('WebSocket client disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
