import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    amount: {
      type: Number,
      required: true,
      enum: [1000, 1500, 2250, 3000, 4500, 6000, 7500, 9000], // only allowed plans
    },

    transaction_id: {
      type: String,
      required: true,
    },

    screenshot: {
      secure_url: String,
      public_id: String,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    method: {
      type: String,
      required: true,
      enum: ["easypasia", "jazzcash"],
    },
  },
  { timestamps: true },
);

export const Investment = mongoose.model("Investment", investmentSchema);
