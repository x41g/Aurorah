import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { readGuildIds } from '@/lib/siteMaintenance'

export async function GET() {
  try {
    const now = Date.now()

    const [botState, latestStats, latestConfig] = await Promise.all([
      prisma.botState.findUnique({ where: { id: 'singleton' } }),
      prisma.guildStats.findFirst({ select: { updatedAt: true }, orderBy: { updatedAt: 'desc' } }),
      prisma.guildConfig.findFirst({ select: { updatedAt: true }, orderBy: { updatedAt: 'desc' } }),
    ])

    const guildIds = readGuildIds(botState?.guildIds)
    const botLastHeartbeatAt = botState?.updatedAt ? botState.updatedAt.getTime() : 0
    const botOnline = botLastHeartbeatAt > 0 && now - botLastHeartbeatAt <= 3 * 60 * 1000

    return NextResponse.json(
      {
        ok: true,
        now,
        services: {
          site: { status: 'operational', lastCheckAt: now },
          botSync: {
            status: botOnline ? 'operational' : 'degraded',
            lastHeartbeatAt: botLastHeartbeatAt || null,
            guildCount: guildIds.length,
          },
          statsPipeline: {
            status: latestStats?.updatedAt ? 'operational' : 'unknown',
            lastUpdateAt: latestStats?.updatedAt ? latestStats.updatedAt.getTime() : null,
          },
          configPipeline: {
            status: latestConfig?.updatedAt ? 'operational' : 'unknown',
            lastUpdateAt: latestConfig?.updatedAt ? latestConfig.updatedAt.getTime() : null,
          },
        },
      },
      { status: 200 }
    )
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: String((e as any)?.message || e || 'status_error'),
      },
      { status: 500 }
    )
  }
}
