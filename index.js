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
import cluster from 'cluster';
import os from 'os';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logic to run the app
const startServer = () => {
  const app = express();
  
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

  // API Routes
  app.use("/api", Auth);
  app.use("/api", investment);
  app.use("/api", userRoutes);
  app.use("/api", companyRoutes);
  app.use("/api", adminRoutes);
  app.use("/api", withdrawalRoutes);

  // Serve Static Frontend
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Catch-all route for SPA (React/Vue/etc)
  app.get('/*splat', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`Server process ${process.pid} running on port ${PORT}`);
  });
};

// Vercel or Production: Don't use cluster
// Local: Use cluster for performance
if ((cluster.isPrimary || cluster.isMaster) && process.env.NODE_ENV !== 'production') {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // This block runs on Vercel or as a worker locally
  startServer();
}