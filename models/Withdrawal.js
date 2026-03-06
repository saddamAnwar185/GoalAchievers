import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    method: {
      type: String,
      enum: ["EasyPaisa", "JazzCash"],
      required: true,
    },

    accountNumber: {
      type: String,
      required: true,
    },

    accountHolderName: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "success", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);