const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@campusconnect.com" },
    update: {},
    create: {
      email: "admin@campusconnect.com",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
      rollNumber: "ADMIN001",
    },
  });

  console.log("✅ Created admin user:", admin.email);

  const user1Password = await bcrypt.hash("user123", 10);

  const user1 = await prisma.user.upsert({
    where: { email: "student1@example.com" },
    update: {},
    create: {
      email: "student1@example.com",
      password: user1Password,
      name: "John Doe",
      rollNumber: "CS2021001",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "student2@example.com" },
    update: {},
    create: {
      email: "student2@example.com",
      password: user1Password,
      name: "Jane Smith",
      rollNumber: "CS2021002",
    },
  });

  console.log("✅ Created sample users");

  const events = [
    {
      title: "Tech Fest 2025",
      description:
        "Annual technology festival featuring workshops, competitions, and guest lectures from industry experts. Join us for three days of innovation and learning!",
      venue: "Main Auditorium",
      date: new Date("2025-03-15"),
      time: "10:00 AM",
      capacity: 200,
      category: "Technical",
      organizer: "Computer Science Department",
      imageUrl:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    },
    {
      title: "Cultural Night",
      description:
        "Celebrate diversity with performances from various cultural groups. Dance, music, drama, and traditional cuisine await you!",
      venue: "Open Air Theatre",
      date: new Date("2025-03-20"),
      time: "6:00 PM",
      capacity: 500,
      category: "Cultural",
      organizer: "Cultural Committee",
      imageUrl:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    },
    {
      title: "Startup Summit",
      description:
        "Meet successful entrepreneurs, learn about startup ecosystem, and pitch your ideas to potential investors.",
      venue: "Conference Hall",
      date: new Date("2025-03-25"),
      time: "9:00 AM",
      capacity: 150,
      category: "Business",
      organizer: "Entrepreneurship Cell",
      imageUrl:
        "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
    },
    {
      title: "Sports Day",
      description:
        "Inter-department sports competition featuring cricket, football, basketball, and athletics. Show your team spirit!",
      venue: "Sports Complex",
      date: new Date("2025-04-05"),
      time: "8:00 AM",
      capacity: 300,
      category: "Sports",
      organizer: "Sports Committee",
      imageUrl:
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",
    },
    {
      title: "AI & Machine Learning Workshop",
      description:
        "Hands-on workshop on artificial intelligence and machine learning. Learn to build your first ML model. Laptops required.",
      venue: "Computer Lab A",
      date: new Date("2025-04-10"),
      time: "2:00 PM",
      capacity: 50,
      category: "Workshop",
      organizer: "AI Club",
      imageUrl:
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800",
    },
  ];

  for (const eventData of events) {
    const event = await prisma.event.create({
      data: eventData,
    });
    console.log(`✅ Created event: ${event.title}`);
  }

  console.log("");
  console.log("🎉 Seeding completed!");
  console.log("");
  console.log("📝 Test Credentials:");
  console.log("   Admin: admin@campusconnect.com / admin123");
  console.log("   User:  student1@example.com / user123");
  console.log("   User:  student2@example.com / user123");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
