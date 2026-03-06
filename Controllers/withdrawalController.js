import { Withdrawal } from "../models/Withdrawal.js";
import { User } from "../models/User.js";

export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, method, accountNumber, accountHolderName, userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // 1. Validation
    if (amount <= 0 || amount > user.wallet_balance) {
      return res.status(400).json({ success: false, message: "Invalid amount or insufficient balance" });
    }

    // 2. Create the withdrawal record first
    const withdrawal = await Withdrawal.create({
      user: user._id,
      amount,
      method,
      accountNumber,
      accountHolderName,
      status: "pending",
    });

    // 3. Deduct balance and save using the bypass flag to avoid the Rank error
    user.wallet_balance -= amount;
    await user.save({ validateBeforeSave: false }); 

    res.status(201).json({
      success: true,
      message: "Withdrawal request sent to admin",
      withdrawal,
    });
  } catch (error) {
    console.error("Withdrawal Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 2️⃣ Get withdrawal history
export const getWithdrawalHistory = async (req, res) => {
  const {id} = req.params
  try {
    const withdrawals = await Withdrawal.find({ user: id }).sort({ createdAt: -1 });
    res.json({ withdrawals });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 3️⃣ Get single withdrawal detail
export const getWithdrawalDetail = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const withdrawal = await Withdrawal.findOne({ _id: withdrawalId }).populate("user");
    if (!withdrawal) return res.status(404).json({ message: "Withdrawal not found" });

    res.json({ withdrawal });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error" });
  }
};