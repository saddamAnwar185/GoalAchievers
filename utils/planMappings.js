// utils/planMappings.js

/**
 * ✨ Joining Plans ✨
 * Maps the RS amount to the points earned by the tree
 */
export const PLAN_POINTS = {
  1000: 7,
  1500: 10,
  2250: 15,
  3000: 20,
  4500: 30,
  6000: 40,
  7500: 50,
  9000: 60,
};

/**
 * Our Achievers / User Ranks
 * Defines the progression, required points, and the reward for hitting the rank
 */
export const RANK_REWARDS = [
  {
    id: 1,
    rank: "Prime Rank",
    requiredPoints: 40, // Based on your "30/40" mention
    reward: 0,
    directBonus: 32,
    indirectBonus: 8,
    teamBonus: 0,
  },
  {
    id: 2,
    rank: "Master Rank",
    requiredPoints: 1500,
    reward: 80000, // Client mentioned 80,000 in text, but 120,000 in list
    directBonus: 32,
    indirectBonus: 8,
    teamBonus: 6,
  },
  {
    id: 3,
    rank: "Ultimate Rank",
    requiredPoints: 7000,
    reward: 100000,
    directBonus: 32,
    indirectBonus: 8,
    teamBonus: 6,
  },
  {
    id: 4,
    rank: "Platinum Member",
    requiredPoints: 15000,
    reward: 150000,
    directBonus: 32,
    indirectBonus: 8,
    teamBonus: 6,
  },
  {
    id: 5,
    rank: "Superstar Rank",
    requiredPoints: 55000,
    reward: 500000,
    directBonus: 32,
    indirectBonus: 8,
    teamBonus: 6,
  },
  {
    id: 6,
    rank: "Superior Rank",
    requiredPoints: 220000,
    reward: 1000000,
    directBonus: 32,
    indirectBonus: 8,
    teamBonus: 6,
  },
  {
    id: 7,
    rank: "Dominant Rank",
    requiredPoints: 550000,
    reward: 2500000,
    directBonus: 32,
    indirectBonus: 8,
    teamBonus: 6,
  },
];

/**
 * Helper to get rank details by points
 */
export const getRankByPoints = (points) => {
  // Returns the highest rank achieved based on current points
  return [...RANK_REWARDS]
    .reverse()
    .find((r) => points >= r.requiredPoints) || RANK_REWARDS[0];
};