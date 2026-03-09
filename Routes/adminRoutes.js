import express from "express";
import { 
  approveInvestment,
  rejectInvestment,
  getPendingInvestments,
  approveWithdrawal,
  rejectWithdrawal,
  getPendingWithdrawals,
  getCompanyEarnings,
} from "../Controllers/adminController.js";

import { checkIsUserLogin, checkUserIsAdmin } from "../Middlewares/authMiddleware.js";

const router = express.Router();

// ------------------- INVESTMENTS -------------------
// Get all pending investments
router.get("/admin/investments/pending", checkIsUserLogin, checkUserIsAdmin, getPendingInvestments);

// Approve investment
router.put("/admin/investments/approve/:investmentId", checkIsUserLogin, checkUserIsAdmin, approveInvestment);

// Reject investment
router.put("/admin/investments/reject/:investmentId", checkIsUserLogin, checkUserIsAdmin, rejectInvestment);

// ------------------- WITHDRAWALS -------------------
// Get all pending withdrawals
router.get("/admin/withdrawals/pending", checkIsUserLogin, checkUserIsAdmin, getPendingWithdrawals);

// Approve withdrawal
router.put("/admin/withdrawals/approve/:withdrawalId", checkIsUserLogin, checkUserIsAdmin, approveWithdrawal);

// Reject withdrawal
router.put("/admin/withdrawals/reject/:withdrawalId", checkIsUserLogin, checkUserIsAdmin, rejectWithdrawal);

// ------------------- COMPANY -------------------
// Get total company earnings
router.get("/admin/company/earnings", checkIsUserLogin, checkUserIsAdmin, getCompanyEarnings);

export default router;