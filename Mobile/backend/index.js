const express=require('express');
const mysql=require('mysql2');
const cors=require('cors');
const bodyparser=require('body-parser');


const app=express();


const port=4000;

app.use(express.json());

//setting up body parser
app.use(bodyparser.urlencoded({encoded:false}));


//setting up cross origin resource
app.use(cors({
    origin: 'http://10.6.54.224:8081',
    methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true
  }));


  //Setup Mysqlconnection
const connection = mysql.createConnection({
    host: 'localhost',   // Replace with your host
    user: 'root',        // Replace with your database user
    password: 'Trishala@99', // Replace with your database password
    database: 'geofencingsecuritycredentials'   // Replace with your database name
});

connection.connect((err)=>{
    if(err){
        console.log(`Error occurred due to error ${err}`);
    }
    console.log('Connected to the MySQL database');
});


//backend logic

//signup functionality

app.post('/signup', (req, res) => {
    const { firstname, lastname, email, phonenumber, password } = req.body;
    if (!firstname || !lastname || !email || !phonenumber || !password ) {
      return res.status(400).json({ message: 'All the details are required' });
    }
  
    // SQL query to insert data into the signup table
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

  //login functionality
  app.post("/login", (req, res) => {
    const { username, password } = req.body; // Username can be email or phone number
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    const query = "SELECT * FROM userdetails WHERE email = ? OR phonenumber = ?";
  
    connection.query(query, [username, username], (err, results) => {
      if (err) {
        console.error("Error fetching user from database:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
  
      const user = results[0];
  
      // Verify password (consider hashing passwords before storing in DB for better security)
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
  
      res.json({ message: "Login successful", user });
    });
  });
 
app.listen(port,()=>{
console.log(`Server running on port ${port}`);
});
