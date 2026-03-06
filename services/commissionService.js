import {User} from "../models/User.js";
import { Commission } from "../models/Commission.js";
import { Company } from "../models/Company.js";
import { PLAN_POINTS, RANK_REWARDS } from "../utils/planMappings.js";

export const distributeCommission = async (buyer, amount, session) => {
  try {
    const buyerPoints = PLAN_POINTS[amount] || 0;
    await User.findByIdAndUpdate(buyer._id, { $inc: { points: buyerPoints } }, { session });

    let currentParentId = buyer.referred_by;
    let level = 1;
    let totalCashLeavingCompany = 0;
    
    // GAP COMMISSION LOGIC: 
    // This prevents the company from going negative. 
    // If a Master (2%) is under an Ultimate (4%), the Ultimate gets the "Gap" (2%).
    let highestTeamBonusPercentDistrubuted = 0; 

    const userBulkUpdates = [];
    const commissionRecords = [];
    const visited = new Set();

    // PERFORMANCE: Limit to 20 levels to prevent Vercel timeouts
    while (currentParentId && level <= 20) {
      if (visited.has(currentParentId.toString())) break;
      visited.add(currentParentId.toString());

      const parent = await User.findById(currentParentId).session(session);
      if (!parent) break;

      let cashEarned = 0;
      let commType = "";
      let appliedPercentage = 0;

      if (parent.is_active) {
        // 1. DIRECT BONUS (Level 1)
        if (level === 1) {
          appliedPercentage = 32;
          cashEarned = (amount * appliedPercentage) / 100;
          commType = "Direct Bonus";
        } 
        // 2. INDIRECT BONUS (Level 2)
        else if (level === 2) {
          appliedPercentage = 8;
          cashEarned = (amount * appliedPercentage) / 100;
          commType = "Indirect Bonus";
        } 
        // 3. INFINITY TEAM BONUS (Gap Logic)
        else {
          const rankData = RANK_REWARDS.find(r => r.rank === parent.rank);
          const userPotentialBonus = rankData ? rankData.teamBonus : 0;

          if (userPotentialBonus > highestTeamBonusPercentDistrubuted) {
            // They get the difference between their rank and the rank below them
            appliedPercentage = userPotentialBonus - highestTeamBonusPercentDistrubuted;
            cashEarned = (amount * appliedPercentage) / 100;
            commType = `Team Bonus (${parent.rank})`;
            highestTeamBonusPercentDistrubuted = userPotentialBonus; 
          }
        }
      }

      // 4. RANK UPGRADE CHECK
      const UPLINE_FIXED_POINTS = 10;
      let newPoints = parent.points + UPLINE_FIXED_POINTS;
      let newRank = parent.rank;
      let rankPrizeMoney = 0;

      for (const r of [...RANK_REWARDS].reverse()) {
        if (newPoints >= r.requiredPoints) {
          // Check if rank is actually higher than current
          if (!parent.rewards_claimed.includes(r.rank)) {
            newRank = r.rank;
            rankPrizeMoney = r.reward;
            parent.rewards_claimed.push(r.rank);
          }
          break; 
        }
      }

      if (cashEarned > 0 || rankPrizeMoney > 0 || newPoints !== parent.points) {
        userBulkUpdates.push({
          updateOne: {
            filter: { _id: parent._id },
            update: {
              $set: { rank: newRank, rewards_claimed: parent.rewards_claimed, points: newPoints },
              $inc: { wallet_balance: Number((cashEarned + rankPrizeMoney).toFixed(2)) }
            }
          }
        });

        if (cashEarned > 0 || rankPrizeMoney > 0) {
          commissionRecords.push({
            from_user: buyer._id,
            to_user: parent._id,
            amount: Number(cashEarned.toFixed(2)),
            reward_amount: rankPrizeMoney,
            type: rankPrizeMoney > 0 ? "Rank Reward" : commType
          });
          totalCashLeavingCompany += (cashEarned + rankPrizeMoney);
        }
      }

      currentParentId = parent.referred_by;
      level++;
    }

    // FINAL DATABASE OPERATIONS
    if (userBulkUpdates.length > 0) await User.bulkWrite(userBulkUpdates, { session });
    if (commissionRecords.length > 0) await Commission.insertMany(commissionRecords, { session });

    await Company.findOneAndUpdate({}, 
      { $inc: { total_earnings: Number((amount - totalCashLeavingCompany).toFixed(2)) } }, 
      { upsert: true, session }
    );

  } catch (error) {
    console.error("CRITICAL_ERR:", error);
    throw error;
  }
};