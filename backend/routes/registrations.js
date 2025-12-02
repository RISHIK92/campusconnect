const express = require("express");
const { authenticateToken, isAdmin } = require("../middleware/auth");
const prisma = require("../config/db.js");

const router = express.Router();

router.get("/my", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = req.query.filter || "all";
    const skip = (page - 1) * limit;

    let where = { userId: req.user.id };
    const now = new Date();

    switch (filter) {
      case "upcoming":
        where.event = { date: { gt: now } };
        break;
      case "past":
        where.event = { date: { lt: now } };
        break;
      case "attended":
        where.attended = true;
        break;
      case "not-attended":
        where.attended = false;
        break;
    }

    const [registrations, total] = await prisma.$transaction([
      prisma.registration.findMany({
        where,
        include: {
          event: true,
        },
        orderBy: {
          registeredAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.registration.count({ where }),
    ]);

    res.json({
      registrations,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get registrations error:", error);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

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

    if (registration.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(registration);
  } catch (error) {
    console.error("Get registration error:", error);
    res.status(500).json({ error: "Failed to fetch registration" });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await prisma.registration.findUnique({
      where: { id },
    });

    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    if (registration.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }

    if (registration.attended) {
      return res
        .status(400)
        .json({ error: "Cannot cancel registration after attending event" });
    }

    await prisma.registration.delete({
      where: { id },
    });

    res.json({ message: "Registration cancelled successfully" });
  } catch (error) {
    console.error("Cancel registration error:", error);
    res.status(500).json({ error: "Failed to cancel registration" });
  }
});

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
