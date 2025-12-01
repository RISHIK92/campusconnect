const express = require("express");
const QRCode = require("qrcode");
const { authenticateToken, isAdmin } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { createEventSchema, updateEventSchema } = require("../utils/validation");
const { prisma } = require("../config/db.js");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, filter } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { venue: { contains: search, mode: "insensitive" } },
      ];
    }

    const now = new Date();
    if (filter === "upcoming") {
      where.date = { gte: now };
    } else if (filter === "past") {
      where.date = { lt: now };
    }

    const totalEvents = await prisma.event.count({ where });
    const totalPages = Math.ceil(totalEvents / take);

    const events = await prisma.event.findMany({
      where,
      skip,
      take,
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    const eventsWithStatus = await Promise.all(
      events.map(async (event) => {
        const userRegistration = await prisma.registration.findUnique({
          where: {
            userId_eventId: {
              userId: req.user.id,
              eventId: event.id,
            },
          },
        });

        return {
          ...event,
          registeredCount: event._count.registrations,
          isRegistered: !!userRegistration,
          isFull: event._count.registrations >= event.capacity,
        };
      })
    );

    res.json({
      events: eventsWithStatus,
      metadata: {
        totalEvents,
        totalPages,
        currentPage: parseInt(page),
        limit: take,
      },
    });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const userRegistration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: req.user.id,
          eventId: id,
        },
      },
    });

    res.json({
      ...event,
      registeredCount: event._count.registrations,
      isRegistered: !!userRegistration,
      isFull: event._count.registrations >= event.capacity,
    });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

router.post("/:id/register", authenticateToken, async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user.id;

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

    if (event._count.registrations >= event.capacity) {
      return res.status(400).json({ error: "Event is full" });
    }

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

    const qrCodeData = `CAMPUSCONNECT:${userId}:${eventId}:${Date.now()}`;

    const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

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

router.get(
  "/:id/registrations",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const registrations = await prisma.registration.findMany({
        where: { eventId: id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              rollNumber: true,
            },
          },
        },
        orderBy: {
          registeredAt: "desc",
        },
      });

      res.json(registrations);
    } catch (error) {
      console.error("Get event registrations error:", error);
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  }
);

router.post(
  "/",
  authenticateToken,
  isAdmin,
  validate(createEventSchema),
  async (req, res) => {
    try {
      const {
        title,
        description,
        venue,
        date,
        time,
        capacity,
        imageUrl,
        category,
        organizer,
      } = req.body;

      const event = await prisma.event.create({
        data: {
          title,
          description,
          venue,
          date: new Date(date),
          time,
          capacity: parseInt(capacity),
          imageUrl: imageUrl || null,
          category: category || null,
          organizer,
        },
      });

      res.status(201).json({
        message: "Event created successfully",
        event,
      });
    } catch (error) {
      console.error("Create event error:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  }
);

router.put(
  "/:id",
  authenticateToken,
  isAdmin,
  validate(updateEventSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }
      if (updateData.capacity) {
        updateData.capacity = parseInt(updateData.capacity);
      }

      const event = await prisma.event.update({
        where: { id },
        data: updateData,
      });

      res.json({
        message: "Event updated successfully",
        event,
      });
    } catch (error) {
      console.error("Update event error:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Event not found" });
      }
      res.status(500).json({ error: "Failed to update event" });
    }
  }
);

router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.event.delete({
      where: { id },
    });

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete event error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(500).json({ error: "Failed to delete event" });
  }
});

module.exports = router;
