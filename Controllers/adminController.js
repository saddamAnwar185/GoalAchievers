import { Investment } from "../models/Investment.js";
import { User } from "../models/User.js";
import { Withdrawal } from "../models/Withdrawal.js";
import { Company } from "../models/Company.js";
import { distributeCommission } from "../services/commissionService.js";
import cloudinary from "../lib/Cloudinary.js";
import mongoose from "mongoose";


export const approveInvestment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { investmentId } = req.params;

    const investment = await Investment.findById(investmentId).populate("user").session(session);

    if (!investment) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Investment not found" });
    }

    if (investment.status !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Already processed" });
    }

    // 1️⃣ Update User Activation Status
    const user = investment.user;
    user.is_active = true;
    user.can_refer = true;
    user.plan_amount = investment.amount;
    user.total_investment += investment.amount;
    
    // Note: We save the user within the session
    await user.save({ session });

    // 2️⃣ Update Investment Status
    investment.status = "approved";
    await investment.save({ session });

    // 3️⃣ Distribute Commissions & Points Tree
    // This function will now handle the 32%/8% cash AND the points for everyone above
    await distributeCommission(user, investment.amount, session);

    // 4️⃣ Cleanup: Delete Screenshot from Cloudinary
    if (investment.screenshot?.public_id) {
      await cloudinary.uploader.destroy(investment.screenshot.public_id);
    }

    // If everything reached here successfully, commit the changes
    await session.commitTransaction();
    session.endSession();

    // Return the same JSON structure as before
    return res.json({
      message: "Investment approved and commissions distributed"
    });

  } catch (error) {
    // If ANY part fails (points, cash, or db), undo everything automatically
    await session.abortTransaction();
    session.endSession();
    
    console.error("Approval Error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const rejectInvestment = async (req, res) => {
  try {

    const { investmentId } = req.params;

    const investment = await Investment.findById(investmentId);

    if (!investment) {
      return res.status(404).json({
        message: "Investment not found"
      });
    }

    if (investment.status !== "pending") {
      return res.status(400).json({
        message: "Already processed"
      });
    }


    /* Delete Screenshot */

    if (investment.screenshot?.public_id) {
      await cloudinary.uploader.destroy(
        investment.screenshot.public_id
      );
    }


    /* Update Status (No Validation) */

    await Investment.updateOne(
      { _id: investmentId },
      {
        $set: {
          status: "rejected"
        }
      }
    );


    res.json({
      message: "Investment rejected successfully"
    });


  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      message: "Server error"
    });

  }
};

// Get all pending investments
export const getPendingInvestments = async (req, res) => {
  try {

    const investments = await Investment
      .find({ status: "pending" })
      .populate("user")
      .sort({ createdAt: -1 }) // Newest first
      .lean();

    res.status(200).json(investments);

  } catch (error) {

    console.log(error.message);

    res.status(500).json({
      message: "Server error"
    });

  }
};

// ---------------- WITHDRAWALS ----------------

// Get pending withdrawals
export const getPendingWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ status: "pending" }).populate("user");
    res.json(withdrawals);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve withdrawal
export const approveWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;

    // 1. Find the withdrawal first (without populating user)
    const withdrawal = await Withdrawal.findById(withdrawalId);
    
    if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });
    if (withdrawal.status !== "pending") return res.status(400).json({ message: "Already processed" });

    // 2. Use findByIdAndUpdate for a "silent" update
    await Withdrawal.findByIdAndUpdate(withdrawalId, { 
      status: "success" 
    });

    res.json({ message: "Withdrawal approved successfully" });
  } catch (error) {
    console.error("Approve Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject withdrawal
export const rejectWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;

    // 1. Find the withdrawal (no need to populate if we use IDs directly)
    const withdrawal = await Withdrawal.findById(withdrawalId);
    
    if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });
    if (withdrawal.status !== "pending") return res.status(400).json({ message: "Already processed" });

    // 2. Refund the wallet balance using findByIdAndUpdate 
    // This BYPASSES the 'Master Rank' enum validation error
    await User.findByIdAndUpdate(
      withdrawal.user, 
      { $inc: { wallet_balance: withdrawal.amount } }, // Use $inc to safely add the amount
      { runValidators: false } // Crucial: This ignores the rank enum error
    );

    // 3. Mark the withdrawal as rejected
    await Withdrawal.findByIdAndUpdate(
      withdrawalId,
      { $set: { status: "rejected" } },
      { runValidators: false }
    );

    res.json({ success: true, message: "Withdrawal rejected and amount refunded" });
  } catch (error) {
    console.error("Reject Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- COMPANY ----------------

// Get company earnings
export const getCompanyEarnings = async (req, res) => {
  try {
    const company = await Company.findOne();
    if (!company) return res.status(404).json({ message: "Company data not found" });

    res.json({
      total_earnings: company.total_earnings,
      total_paid_commissions: company.total_paid_commissions,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- TEMPORARY CLEANUP ----------------
