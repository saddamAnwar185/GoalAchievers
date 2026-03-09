import { User } from "../models/User.js";
import { Investment } from "../models/Investment.js";
import cloudinary from "cloudinary"; // Ensure your cloudinary config is imported
import { PLAN_POINTS } from "../utils/planMappings.js";


export const createInvestment = async (req, res) => {
  try {
    const { userId, amount, transaction_id, method } = req.body;

    // 1️⃣ Validate fields
    if (!userId || !amount || !transaction_id || !method) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!req.files || !req.files.screenshot) {
      return res.status(400).json({ message: "Screenshot required" });
    }

    // 2️⃣ Check User existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const activeOrPendingInvestment = await Investment.findOne({ 
      user: userId, 
      status: { $in: ["pending", "approved", "success"] } 
    });

    if (user.is_active || user.total_investment > 0 || activeOrPendingInvestment) {
      let msg = "You are already a member.";
      
      if (activeOrPendingInvestment?.status === "pending") {
        msg = "You already have a pending investment request.";
      }

      return res.status(400).json({ 
        success: false,
        message: msg 
      });
    }

    // 4️⃣ Validate plan amount
    const planAmount = Number(amount);
    const pointsAssigned = PLAN_POINTS[planAmount];

    if (!pointsAssigned) {
      return res.status(400).json({ message: "Invalid plan amount" });
    }

    // 5️⃣ Upload to cloudinary
    const upload = await cloudinary.uploader.upload(
      req.files.screenshot.tempFilePath,
      { folder: "investments" }
    );

    // 6️⃣ Create Investment
    const investment = await Investment.create({
      user: user._id,
      amount: planAmount,
      points: pointsAssigned,
      transaction_id,
      screenshot: {
        secure_url: upload.secure_url,
        public_id: upload.public_id
      },
      method: method,
      status: "pending"
    });

    return res.json({
      success: true,
      message: "Investment submitted. Waiting for admin approval.",
      investment
    });

  } catch (error) {
    console.error("Investment Error:", error.message);
    console.log(error)
    return res.status(500).json({ message: "Server error" });
  }
};

export const getInvestments = async (req, res) => {

  const { id } = req.params

  const investments = await Investment.find({
    user: id
  });

  res.json(investments);
};