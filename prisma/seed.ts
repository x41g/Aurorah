import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.plan.upsert({
    where: { key: "STARTER" },
    create: {
      key: "STARTER",
      name: "Starter",
      description: "Plano inicial",
      priceCents: 0,

      maxGuilds: 1,
      maxTicketsPerMonth: 100,

      dashboardEnabled: true,
      paymentsEnabled: false,
      safePayEnabled: false,
      aiEnabled: false,
      analyticsEnabled: false,
      prioritySupport: false,
    },
    update: {
      name: "Starter",
      description: "Plano inicial",
      priceCents: 0,
      maxGuilds: 1,
      maxTicketsPerMonth: 100,
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
      name: "Pro",
      description: "Plano completo",
      priceCents: 0,

      maxGuilds: 5,
      maxTicketsPerMonth: null, // ilimitado

      dashboardEnabled: true,
      paymentsEnabled: true,
      safePayEnabled: true,
      aiEnabled: true,
      analyticsEnabled: true,
      prioritySupport: true,
    },
    update: {
      name: "Pro",
      description: "Plano completo",
      priceCents: 0,
      maxGuilds: 5,
      maxTicketsPerMonth: null,
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
