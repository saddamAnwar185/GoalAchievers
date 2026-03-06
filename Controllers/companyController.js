import { Company } from "../models/Company.js";

export const getCompanyEarnings = async (req, res) => {
  try {
    let company = await Company.findOne();
    if (!company) {
      company = await Company.create({ total_earnings: 0 });
    }
    res.json({ total_earnings: company.total_earnings });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};