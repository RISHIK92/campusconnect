const express = require("express");
const { authenticateToken, isAdmin } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { updateUserRoleSchema } = require("../utils/validation");
const { prisma } = require("../config/db");

const router = express.Router();

router.get("/stats", authenticateToken, isAdmin, async (req, res) => {
  try {
    // Get counts
    const [totalUsers, totalEvents, totalRegistrations, upcomingEvents] =
      await Promise.all([
        prisma.user.count(),
        prisma.event.count(),
        prisma.registration.count(),
        prisma.event.count({
          where: {
            date: {
              gte: new Date(),
            },
          },
        }),
      ]);

    // Get attendance stats
    const attendedCount = await prisma.registration.count({
      where: { attended: true },
    });

    // Get recent registrations
    const recentRegistrations = await prisma.registration.findMany({
      take: 10,
      orderBy: {
        registeredAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            title: true,
            date: true,
          },
        },
      },
    });

    // Get popular events
    const popularEvents = await prisma.event.findMany({
      take: 5,
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: {
        registrations: {
          _count: "desc",
        },
      },
    });

    res.json({
      totalUsers,
      totalEvents,
      totalRegistrations,
      upcomingEvents,
      attendanceRate:
        totalRegistrations > 0
          ? ((attendedCount / totalRegistrations) * 100).toFixed(2)
          : 0,
      recentRegistrations,
      popularEvents: popularEvents.map((event) => ({
        ...event,
        registrationCount: event._count.registrations,
      })),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

router.get(
  "/events/:id/registrations",
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

      const event = await prisma.event.findUnique({
        where: { id },
      });

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json({
        event,
        registrations,
        stats: {
          total: registrations.length,
          attended: registrations.filter((r) => r.attended).length,
          pending: registrations.filter((r) => !r.attended).length,
        },
      });
    } catch (error) {
      console.error("Get event registrations error:", error);
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  }
);

router.get("/users", authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        rollNumber: true,
        role: true,
        createdAt: true,
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(
      users.map((user) => ({
        ...user,
        registrationCount: user._count.registrations,
      }))
    );
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// PATCH /api/admin/users/:id/role - Update user role
router.patch(
  "/users/:id/role",
  authenticateToken,
  isAdmin,
  validate(updateUserRoleSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      res.json({
        message: "User role updated successfully",
        user,
      });
    } catch (error) {
      console.error("Update user role error:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(500).json({ error: "Failed to update user role" });
    }
  }
);

module.exports = router;
