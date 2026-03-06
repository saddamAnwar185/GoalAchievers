// import express from 'express'
// import bodyParser from "body-parser"
// import cookieParser from "cookie-parser"
// import fileUpload from "express-fileupload"
// import Auth from './Routes/Auth.js'
// import dotenv from 'dotenv'
// import { connectDB } from './lib/connection.js'
// import investment from './Routes/InvestmentRoute.js'
// import userRoutes from './Routes/userRoutes.js';
// import companyRoutes from "./Routes/companyRoutes.js";
// import adminRoutes from "./Routes/adminRoutes.js";
// import withdrawalRoutes from "./Routes/withdrawalRoutes.js";
// import cors from 'cors'

// const app = express()
// dotenv.config()

// connectDB()


// // Middleware
// app.use(express.json())
// app.use(bodyParser.urlencoded({ extended: true }))
// app.use(cookieParser())
// app.use(fileUpload({
//   useTempFiles: true,
//   tempFileDir: '/tmp/',
// }))
// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true,
//   methods: ["GET","POST","PUT","PATCH","DELETE"]
// }))

// app.use("/api" ,Auth)
// app.use("/api" ,investment)
// app.use("/api" ,userRoutes)
// app.use("/api" ,companyRoutes)
// app.use("/api" ,adminRoutes)
// app.use("/api" ,withdrawalRoutes)

// app.listen(8000, () => {
//     console.log("server is running on: http://localhost:8000")
// })

import express from 'express';
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import Auth from './Routes/Auth.js';
import dotenv from 'dotenv';
import { connectDB } from './lib/connection.js';
import investment from './Routes/InvestmentRoute.js';
import userRoutes from './Routes/userRoutes.js';
import companyRoutes from "./Routes/companyRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";
import withdrawalRoutes from "./Routes/withdrawalRoutes.js";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Serve static files from the 'dist' folder


// Multi-core scaling modules
import cluster from 'cluster';
import os from 'os';

dotenv.config();

// Check if this is the Master process
if (cluster.isPrimary || cluster.isMaster) {
  const numCPUs = os.cpus().length;

  // Fork workers for each core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // If a worker dies, start a new one immediately
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

} else {
  // WORKER PROCESS: This runs on individual cores
  const app = express();

  app.use(express.static(path.join(__dirname, 'dist')));

  // Connect Database for each worker
  connectDB();

  // Middleware
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  }));


  app.use(cors());

  // Routes
  app.use("/api", Auth);
  app.use("/api", investment);
  app.use("/api", userRoutes);
  app.use("/api", companyRoutes);
  app.use("/api", adminRoutes);
  app.use("/api", withdrawalRoutes);

    app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`Worker process ${process.pid} started on port ${PORT}`);
  });
}