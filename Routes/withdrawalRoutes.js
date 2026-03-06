import express from "express";
import { 
  requestWithdrawal, 
  getWithdrawalHistory, 
  getWithdrawalDetail 
} from "../Controllers/withdrawalController.js";
import { checkIsUserLogin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 1️⃣ Request a withdrawal
router.post("/withdraw", checkIsUserLogin, requestWithdrawal);

// 2️⃣ Get all withdrawal history for logged-in user
router.get("/withdraw/history/:id", checkIsUserLogin, getWithdrawalHistory);

// 3️⃣ Get a single withdrawal detail (optional)
router.get("/withdraw/:withdrawalId", checkIsUserLogin, getWithdrawalDetail);

export default router;