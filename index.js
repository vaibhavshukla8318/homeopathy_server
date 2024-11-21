const cors = require('cors');
const express = require('express');
const connectDB = require('./src/config/db');
const authRouter = require('./src/routers/auth.router');
const adminRouter = require('./src/routers/admin.router');
const app = express();

const corsOptions = {
  // origin: 'https://bookstore8318.netlify.app',
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']
};

app.use(cors(corsOptions));


app.use(express.json())

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

app.get('/', (req, res) => {
  res.send('Hello, World!');
})

const PORT = 3000;

const start = async() =>{
  await connectDB();
  await app.listen(PORT, (req, res)=>{
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

start();