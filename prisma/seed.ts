import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.plan.upsert({
    where: { key: "STARTER" },
    create: {
      key: "STARTER",
      name: "Essencial",
      description: "Plano inicial",
      priceCents: 0,

      maxGuilds: 1,
      maxTicketsPerMonth: 100,
      maxTicketPanels: 1,

      dashboardEnabled: true,
      paymentsEnabled: false,
      safePayEnabled: false,
      aiEnabled: false,
      analyticsEnabled: false,
      prioritySupport: false,
    },
    update: {
      name: "Essencial",
      description: "Plano inicial",
      priceCents: 0,
      maxGuilds: 1,
      maxTicketsPerMonth: 100,
      maxTicketPanels: 1,
      dashboardEnabled: true,
      paymentsEnabled: false,
      safePayEnabled: false,
      aiEnabled: false,
      analyticsEnabled: false,
      prioritySupport: false,
    },
  });

  await prisma.plan.upsert({
    where: { key: "PRO" },
    create: {
      key: "PRO",
      name: "Prime",
      description: "Plano completo",
      priceCents: 0,

      maxGuilds: 5,
      maxTicketsPerMonth: null, // ilimitado
      maxTicketPanels: 5,

      dashboardEnabled: true,
      paymentsEnabled: true,
      safePayEnabled: true,
      aiEnabled: true,
      analyticsEnabled: true,
      prioritySupport: true,
    },
    update: {
      name: "Prime",
      description: "Plano completo",
      priceCents: 0,
      maxGuilds: 5,
      maxTicketsPerMonth: null,
      maxTicketPanels: 5,
      dashboardEnabled: true,
      paymentsEnabled: true,
      safePayEnabled: true,
      aiEnabled: true,
      analyticsEnabled: true,
      prioritySupport: true,
    },
  });

  await prisma.plan.upsert({
    where: { key: "ENTERPRISE" },
    create: {
      key: "ENTERPRISE",
      name: "Elite",
      description: "Plano elite",
      priceCents: 0,

      maxGuilds: 999,
      maxTicketsPerMonth: null,
      maxTicketPanels: 10,

      dashboardEnabled: true,
      paymentsEnabled: true,
      safePayEnabled: true,
      aiEnabled: true,
      analyticsEnabled: true,
      prioritySupport: true,
    },
    update: {
      name: "Elite",
      description: "Plano elite",
      maxGuilds: 999,
      maxTicketsPerMonth: null,
      maxTicketPanels: 10,
      dashboardEnabled: true,
      paymentsEnabled: true,
      safePayEnabled: true,
      aiEnabled: true,
      analyticsEnabled: true,
      prioritySupport: true,
    },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
