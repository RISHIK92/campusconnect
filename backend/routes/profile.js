const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const prisma = require("../config/db.js");

const router = express.Router();

// PUT /api/profile - Update user profile
router.put("/", authenticateToken, async (req, res) => {
  try {
    const { name, rollNumber } = req.body;
    const userId = req.user.id;

    // Check if roll number is already taken by another user
    if (rollNumber) {
      const existingRoll = await prisma.user.findFirst({
        where: {
          rollNumber,
          NOT: {
            id: userId,
          },
        },
      });

      if (existingRoll) {
        return res
          .status(400)
          .json({ error: "Roll number already registered" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        rollNumber: rollNumber || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        rollNumber: true,
        createdAt: true,
      },
    });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
