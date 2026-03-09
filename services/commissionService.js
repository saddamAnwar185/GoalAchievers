import { User } from "../models/User.js";
import { Commission } from "../models/Commission.js";
import { Company } from "../models/Company.js";
import { PLAN_POINTS, RANK_REWARDS } from "../utils/planMappings.js";

export const distributeCommission = async (buyer, amount, session) => {
  try {
    // 1. Assign Buyer's personal points
    const buyerPoints = PLAN_POINTS[amount] || 0;
    await User.findByIdAndUpdate(
      buyer._id, 
      { $inc: { points: buyerPoints } }, 
      { session }
    );

    let currentParentId = buyer.referred_by;
    let level = 1;
    let totalCashLeavingCompany = 0;
    let highestTeamBonusPercentDistributed = 0; 

    const userBulkUpdates = [];
    const commissionRecords = [];
    const visited = new Set();

    while (currentParentId && level <= 20) {
      if (visited.has(currentParentId.toString())) break;
      visited.add(currentParentId.toString());

      const parent = await User.findById(currentParentId).session(session);
      if (!parent) break;

      let cashEarned = 0;
      let appliedPercentage = 0;

      if (parent.is_active) {
        if (level === 1) {
          appliedPercentage = 32;
          cashEarned = (amount * appliedPercentage) / 100;
        } 
        else if (level === 2) {
          appliedPercentage = 8;
          cashEarned = (amount * appliedPercentage) / 100;
        } 
        else {
          const rankData = RANK_REWARDS.find(r => r.rank === parent.rank);
          const userPotentialBonus = rankData ? rankData.teamBonus : 0;

          if (userPotentialBonus > highestTeamBonusPercentDistributed) {
            appliedPercentage = userPotentialBonus - highestTeamBonusPercentDistributed;
            cashEarned = (amount * appliedPercentage) / 100;
            highestTeamBonusPercentDistributed = userPotentialBonus; 
          }
        }
      }

      const UPLINE_FIXED_POINTS = 10; 
      let newPoints = (parent.points || 0) + UPLINE_FIXED_POINTS;
      let newRank = parent.rank;
      let rankPrizeMoney = 0;
      
      let updatedRewards = [...(parent.rewards_claimed || [])];

      for (const r of [...RANK_REWARDS].reverse()) {
        if (newPoints >= r.requiredPoints) {
          if (!updatedRewards.includes(r.rank)) {
            newRank = r.rank;
            rankPrizeMoney = r.reward;
            updatedRewards.push(r.rank); 
          }
          break; 
        }
      }

      // Update User Wallet and Points
      userBulkUpdates.push({
        updateOne: {
          filter: { _id: parent._id },
          update: {
            $set: { 
              rank: newRank, 
              rewards_claimed: updatedRewards, 
              points: newPoints 
            },
            $inc: { 
              wallet_balance: Number((cashEarned + rankPrizeMoney).toFixed(2)) 
            }
          }
        }
      });

      // 3. THE FIX: Always save a record with EVERY detail
      commissionRecords.push({
        from_user: buyer._id,      // Who bought the plan
        to_user: parent._id,        // Who is getting the points/cash
        amount: Number(cashEarned.toFixed(2)), // 0 if no cash, but record exists
        points_earned: UPLINE_FIXED_POINTS,    // Always 10 points
        percentage: appliedPercentage,        // 0 if no cash, but record exists
        level: level                          // 1, 2, 3... 20
      });

      totalCashLeavingCompany += (cashEarned + rankPrizeMoney);
      currentParentId = parent.referred_by;
      level++;
    }

    if (userBulkUpdates.length > 0) {
      await User.bulkWrite(userBulkUpdates, { session });
    }

    if (commissionRecords.length > 0) {
      // This will now save 1 record for EVERY level in the upline
      await Commission.insertMany(commissionRecords, { session });
    }

    await Company.findOneAndUpdate(
      {}, 
      { $inc: { total_earnings: Number((amount - totalCashLeavingCompany).toFixed(2)) } }, 
      { upsert: true, session, returnDocument: 'after' }
    );

  } catch (error) {
    console.error("CRITICAL_DISTRIBUTION_ERROR:", error);
    throw error; 
  }
};