// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    points: { type: Number, default: 0 },
    rank: {
      type: String,
      enum: [
        "Prime Rank",
        "Master Rank",
        "Ultimate Rank",
        "Platinum Member",
        "Superstar Rank",
        "Superior Rank",
        "Dominant Rank",
      ],
      default: "Prime Rank",
    },
    rewards_claimed: [{ type: Number }],
    email: { type: String, unique: true },
    password: {
      type: String,
      required: true,
    },

    member_id: {
      type: String,
      unique: true,
    },

    referred_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    wallet_balance: {
      type: Number,
      default: 0,
    },

    total_investment: {
      type: Number,
      default: 0,
    },
    rewards_claimed: { type: [String], default: [] },
    avatar: {
      secure_url: { type: String, default: "https://via.placeholder.com/150" },
      public_id: { type: String, default: null },
    },
    is_active: { type: Boolean, default: false },
    can_refer: { type: Boolean, default: false },
    plan_amount: { type: Number, default: 0 },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    my_referrals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
