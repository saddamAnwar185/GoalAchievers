import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  amount: { 
    type: Number, 
    required: true,
    enum: [500, 750, 1000, 1200] // only allowed plans
  },

  transaction_id: { 
    type: String, 
    required: true 
  },

  amount: { 
    type: Number, 
    required: true,
    enum: [100, 150, 225, 300, 450, 600, 750, 900] // New ✨Joining Plan✨
  },

  screenshot: {
    secure_url: String,
    public_id: String
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  method: {
    type: String,
    required: true,
    enum: ["easypasia", "jazzcash"]
  }

}, { timestamps: true });

export const Investment = mongoose.model("Investment", investmentSchema);