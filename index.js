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

dotenv.config();
connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());
app.use(cors());

// API Routes
app.use("/api", Auth);
app.use("/api", investment);
app.use("/api", userRoutes);
app.use("/api", companyRoutes);
app.use("/api", adminRoutes);
app.use("/api", withdrawalRoutes);

// Static Files - Serve from the 'dist' folder
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all: Send index.html for any non-API route (for React/Vite routing)
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Export for Vercel
app.listen(process.env.PORT || 8000, () => {
  console.log('server is running')
})