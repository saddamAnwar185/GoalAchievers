import express from "express";
import { createInvestment, getInvestments } from "../Controllers/investmentController.js";
import { checkIsUserLogin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected routes
router.post("/invest", checkIsUserLogin, createInvestment);
router.get("/status/:id", checkIsUserLogin, getInvestments);

export default router;