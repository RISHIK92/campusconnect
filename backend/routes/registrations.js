const express = require("express");
const { authenticateToken, isAdmin } = require("../middleware/auth");
const { prisma } = require("../config/db.js");

const router = express.Router();

// GET /api/registrations/my - Get user's registrations
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const registrations = await prisma.registration.findMany({
      where: { userId: req.user.id },
      include: {
        event: true,
      },
      orderBy: {
        registeredAt: "desc",
      },
    });

    res.json(registrations);
  } catch (error) {
    console.error("Get registrations error:", error);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// GET /api/registrations/:id - Get single registration with QR
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await prisma.registration.findUnique({
      where: { id },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            rollNumber: true,
          },
        },
      },
    });

    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    // Check if user owns this registration or is admin
    if (registration.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(registration);
  } catch (error) {
    console.error("Get registration error:", error);
    res.status(500).json({ error: "Failed to fetch registration" });
  }
});

// GET /api/registrations/verify/:qrCodeData - Verify QR code and mark attendance (Admin only)
router.get(
  "/verify/:qrCodeData",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { qrCodeData } = req.params;

      const registration = await prisma.registration.findUnique({
        where: { qrCodeData },
        include: {
          event: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              rollNumber: true,
            },
          },
        },
      });

      if (!registration) {
        return res.status(404).json({ error: "Invalid QR code" });
      }

      // Mark as attended if not already
      if (!registration.attended) {
        await prisma.registration.update({
          where: { id: registration.id },
          data: {
            attended: true,
            attendedAt: new Date(),
          },
        });
      }

      res.json({
        message: registration.attended
          ? "Already checked in"
          : "Check-in successful",
        registration: {
          ...registration,
          attended: true,
        },
      });
    } catch (error) {
      console.error("Verify QR error:", error);
      res.status(500).json({ error: "Failed to verify QR code" });
    }
  }
);

module.exports = router;
