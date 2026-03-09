import { User } from "../models/User.js";

export const getWallet = async (req, res) => {

  const user = await User.findById(req.params.userId)
    .select("wallet_balance total_investment");

  res.json(user);
};

import { Commission } from "../models/Commission.js";

export const getCommissionHistory = async (req, res) => {

  const commissions = await Commission.find({
    to_user: req.params.userId
  }).populate("from_user", "name member_id");

  res.json(commissions);
};

