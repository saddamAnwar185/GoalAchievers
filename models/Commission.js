// models/Commission.js
import mongoose from "mongoose";

const commissionSchema = new mongoose.Schema({
  from_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  to_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  amount: Number,
  points_earned: Number,

  percentage: Number,
  level: Number,

}, { timestamps: true });

export const Commission = mongoose.model("Commission", commissionSchema);