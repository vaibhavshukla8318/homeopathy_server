require("dotenv").config();
const cors = require('cors');
const express = require('express');
const path = require('path');
const connectDB = require('./src/config/db');
const authRouter = require('./src/routers/auth.router');
const adminRouter = require('./src/routers/admin.router');
const blogRouter = require('./src/routers/Blog.router');
const app = express();

const corsOptions = {
  // origin: 'https://aarogyasanjeevani.netlify.app',
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD']
};

app.use(cors(corsOptions));


app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/blog", blogRouter);

app.get('/', (req, res) => {
  res.send('Hello, World!');
})

const PORT = process.env.PORT;

const start = async() =>{
  await connectDB();
   app.listen(PORT, (req, res)=>{
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

start();