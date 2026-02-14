export type GuildConfig = {
  staffRoleId?: string
  ticketCategoryId?: string
  logsChannelId?: string
  panelChannelId?: string
  transcriptEnabled?: boolean
  transcriptTtlDays?: number
  allowOpenRoleIds?: string[]
  maxOpenTicketsPerUser?: number
  cooldownSeconds?: number
  panelImageUrl?: string;
}

export type GuildStats = {
  guildId: string
  updatedAt: number
  todayKey?: string
  ticketsCreatedToday?: number
  ticketsClosedToday?: number
  staff?: Record<
    string,
    {
      claimed?: number
      closed?: number
    }
  >
}
