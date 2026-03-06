import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  total_earnings: { type: Number, default: 0 },
});

export const Company = mongoose.model("Company", companySchema);