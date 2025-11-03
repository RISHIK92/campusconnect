const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticateToken, isAdmin } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { createEventSchema, updateEventSchema } = require("../utils/validation");

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/events - Get all events
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { category, upcoming } = req.query;

    const where = {};

    if (category) {
      where.category = category;
    }

    if (upcoming === "true") {
      where.date = {
        gte: new Date(),
      };
    }

    const events = await prisma.event.findMany({
      where,
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

    res.json(eventsWithStatus);
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// GET /api/events/:id - Get single event
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

// POST /api/events - Create new event (Admin only)
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

// PUT /api/events/:id - Update event (Admin only)
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

// DELETE /api/events/:id - Delete event (Admin only)
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
