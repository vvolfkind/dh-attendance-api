require('dotenv').config();
const express = require('express');
const app = express();
const connectDB = require('./config/db');


const serverPort = process.env.PORT;

// DB
connectDB();

// Midlewares
app.use(express.json({ extended: false }));

app.get('/', (req, res) => {
    res.send('API Running');
});

require('./routes')(app, express)

app.listen(serverPort, () => console.log(`Server up! Port: ${serverPort}`) );
