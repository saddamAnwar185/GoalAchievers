import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { setUser } from "../Middlewares/authMiddleware.js";
import cloudinary from "../lib/Cloudinary.js";

function generateMemberId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createUniqueMemberId() {
  let memberId;
  let exists = true;

  while (exists) {
    memberId = generateMemberId();
    exists = await User.findOne({ member_id: memberId });
  }

  return memberId;
}

export const signup = async (req, res) => {
  try {
    const { name, email, password, sponsorId } = req.body;

    // 1️⃣ Basic Validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    // 2️⃣ Handle Profile Picture (DP) Upload
    let avatarData = {
      secure_url:
        "https://www.pngitem.com/pimgs/m/504-5040528_empty-profile-picture-png-transparent-png.png",
      public_id: null,
    };

    if (req.files && req.files.avatar) {
      const upload = await cloudinary.uploader.upload(
        req.files.avatar.tempFilePath,
        { folder: "user_avatars" },
      );
      avatarData = {
        secure_url: upload.secure_url,
        public_id: upload.public_id,
      };
    }

    // 3️⃣ Sponsor Logic
    let sponsor = null;
    if (sponsorId) {
      sponsor = await User.findOne({ member_id: sponsorId });
      if (!sponsor) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Sponsor ID" });
      }
    }

    // 4️⃣ Hash & Create
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar: avatarData, // Saving the DP here
      member_id: await createUniqueMemberId(),
      referred_by: sponsor ? sponsor._id : null,
      is_active: false,
    });

    if (sponsor) {
      await User.findByIdAndUpdate(sponsor._id, {
        $push: { my_referrals: newUser._id },
      });
    }

    const token = setUser(newUser);

    // 🍪 Send in cookie
    res.cookie("token", token);

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
      user: token,
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

    // 🔐 Create JWT
    const token = setUser(user);

    // 🍪 Send in cookie
    res.cookie("token", token);

    // ✅ Send only token to frontend (no plain user)
    res.json({
      success: true,
      user: token,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error" });
  }
};
