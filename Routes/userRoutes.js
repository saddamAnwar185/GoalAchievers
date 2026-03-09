import express from "express";
import { 
  getUserProfile,
  getReferralTree,
  getWallet,
  getTransactions,
  isUserLogin,
  logout,
  getCommission,
  updateProfile
} from "../Controllers/userController.js";

import { checkIsUserLogin } from "../Middlewares/authMiddleware.js";

const router = express.Router();

// All protected by login middleware
router.get("/me/:id", checkIsUserLogin, getUserProfile);
router.post("/me/update/:id", checkIsUserLogin, updateProfile);
router.get("/tree/:id", checkIsUserLogin, getReferralTree);
router.get("/wallet/:id", checkIsUserLogin, getWallet);
router.get("/transactions/:id", checkIsUserLogin, getTransactions);
router.get("/commissions/:id", checkIsUserLogin, getCommission);
router.get("/isUserLogin", checkIsUserLogin, isUserLogin);
router.get("/logout", checkIsUserLogin, logout);

export default router;