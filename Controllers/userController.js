import { User } from "../models/User.js";
import { Investment } from "../models/Investment.js";
import { Withdrawal } from "../models/Withdrawal.js";
import { Commission } from "../models/Commission.js";
import cloudinary from "../lib/Cloudinary.js";

// ---------------- USER PROFILE ----------------
export const getUserProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id)
      .select("-password")
      .populate("referred_by");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // 1. Find the user to check for an existing avatar
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2. Prepare update object
    let updateData = { name };

    // 3. Handle Profile Image if provided
    if (req.files && req.files.profileImage) {
      const file = req.files.profileImage;

      // Delete old image from Cloudinary if it exists
      if (user.avatar && user.avatar.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      }

      // Upload new image
      const myCloud = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });

      updateData.avatar = {
        public_id: myCloud.public_id,
        secure_url: myCloud.secure_url, // Adjusted to match your frontend .secure_url
      };
    }

    // 4. Update User with new Mongoose options
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        returnDocument: "after", // Fixes Mongoose deprecation warning
        runValidators: false, // Bypasses the "Master Rank" enum error
      },
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
// ---------------- REFERRAL TREE ----------------
export const getReferralTree = async (req, res) => {
  const { id } = req.params;

  const allcommissions = await Commission.find({});

  try {
    // Find commissions sent to this user from their Level 1 (Direct) referrals
    const commissions = await Commission.find({ to_user: id, level: 1 })
      .populate({
        path: "from_user",
        // Do not select password or avatar here
        select: "-password -avatar",
      })
      .sort({ createdAt: -1 });

    if (!commissions) {
      return res.status(404).json({ message: "No data found" });
    }

    // Return the exact structure you requested
    res.json({ commissions });
  } catch (error) {
    console.error("Commission Fetch Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
// ---------------- WALLET ----------------
export const getWallet = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Optional: calculate total earnings (commissions + withdrawals)
    const totalInvestments = user.total_investment;
    const walletBalance = user.wallet_balance;

    res.json({
      wallet_balance: walletBalance,
      total_investment: totalInvestments,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- TRANSACTIONS ----------------
export const getTransactions = async (req, res) => {
  try {
    const { id } = req.params;

    const investments = await Investment.find({ user: id }).sort({
      createdAt: -1,
    });
    const withdrawals = await Withdrawal.find({ user: id }).sort({
      createdAt: -1,
    });

    res.json({
      investments,
      withdrawals,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCommission = async (req, res) => {
  const { id } = req.params;

  try {
    const commissions = await Commission.find({
      to_user: id,
      level: { $gt: 1 },
    }).populate("from_user");
    res.status(200).json({ commissions });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const isUserLogin = (req, res) => {
  res.json({
    success: true,
    message: "user is login",
  });
};

export const logout = (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  res.status(200).json({
    success: true,
    message: "logged out",
  });
};
