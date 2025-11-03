const express = require("express");
const QRCode = require("qrcode");
const { PrismaClient } = require("@prisma/client");
const { authenticateToken, isAdmin } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/events/:id/register - Register for an event
router.post("/events/:id/register", authenticateToken, async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user.id;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if event is full
    if (event._count.registrations >= event.capacity) {
      return res.status(400).json({ error: "Event is full" });
    }

    // Check if user already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingRegistration) {
      return res
        .status(400)
        .json({ error: "Already registered for this event" });
    }

    // Generate unique QR code data
    const qrCodeData = `CAMPUSCONNECT:${userId}:${eventId}:${Date.now()}`;

    // Generate QR code image (base64)
    const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Create registration
    const registration = await prisma.registration.create({
      data: {
        userId,
        eventId,
        qrCode: qrCodeImage,
        qrCodeData,
      },
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

    res.status(201).json({
      message: "Registration successful",
      registration,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register for event" });
  }
});

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

// GET /api/verify/:qrCodeData - Verify QR code and mark attendance (Admin only)
router.get("/:qrCodeData", authenticateToken, isAdmin, async (req, res) => {
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
});

module.exports = router;
