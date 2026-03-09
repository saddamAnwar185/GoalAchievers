import express from "express";
import { getCompanyEarnings } from "../Controllers/companyController.js";
import { checkIsUserLogin, checkUserIsAdmin } from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.get("/company/earnings", checkIsUserLogin, checkUserIsAdmin ,getCompanyEarnings);

export default router;