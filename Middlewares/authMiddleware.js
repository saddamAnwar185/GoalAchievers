import jwt from "jsonwebtoken";
import { User } from "../models/User.js";


export const setUser = (user) => {
  const token = jwt.sign({
        name: user.name,
        email: user.email,
        member_id: user.member_id,
        referred_by: user.referred_by,
        wallet_balance: user.wallet_balance,
        total_investment: user.total_investment,
        is_active: user.is_active,
        can_refer: user.can_refer,
         _id: user._id,
        my_referrals: user.my_referrals,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        plan_amount: user.plan_amount,
        role: user.role
  
      }, process.env.JWT_SECRET, { expiresIn: "7d" });

      return token
}

// 🔐 Check if user logged in
export const checkIsUserLogin = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token)
      return res.status(401).json({success: false, message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id).select("-password");
    if (!user)
      return res.status(401).json({ success: false, message: "User not found" });

    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};


// 👑 Check if user is admin
export const checkUserIsAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin access required" });

  next();
};