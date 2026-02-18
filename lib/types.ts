export type GuildConfig = {
  staffRoleId?: string
  ticketCategoryId?: string
  logsChannelId?: string
  panelChannelId?: string
  slaChannelId?: string
  feedbackChannelId?: string
  transcriptEnabled?: boolean
  transcriptTtlDays?: number
  allowOpenRoleIds?: string[]
  maxOpenTicketsPerUser?: number
  cooldownSeconds?: number
  panelImageUrl?: string

  // Ticket system (V5)
  ticketSystemEnabled?: boolean
  ticketOpenMode?: "buttons" | "select"
  ticketCreateMode?: "category" | "thread"
  ticketButtonEmoji?: string
  ticketButtonStyle?: number
  ticketAppearanceMode?: "embed" | "content"
  ticketEmbedTitle?: string
  ticketEmbedDescription?: string
  ticketEmbedColor?: string
  ticketEmbedBannerUrl?: string
  ticketEmbedThumbUrl?: string
  ticketContentText?: string
  ticketFunctions?: Array<{
    name: string
    preDescription?: string
    description?: string
    emoji?: string
    enabled?: boolean
  }>
  ticketForms?: Record<
    string,
    {
      enabled?: boolean
      title?: string
      robloxVerificationEnabled?: boolean
      robloxUsernameQuestionId?: string
      questions?: Array<{
        id: string
        label: string
        required?: boolean
        style?: "SHORT" | "PARA"
      }>
    }
  >

  // IA
  aiEnabled?: boolean
  aiModel?: string
  aiPrompt?: string
  aiPromptSecurity?: {
    stripMentions?: boolean
    stripLinks?: boolean
    blockJailbreakHints?: boolean
  }

  // Payments + SafePay
  paymentAutoEnabled?: boolean
  paymentAccessToken?: string
  safePayEnabled?: boolean
  safePayBanksOff?: string[]
  paymentSemiEnabled?: boolean
  paymentSemiKey?: string
  paymentSemiType?: string
  paymentSemiApproverRoleId?: string

  // Staff panel toggles
  featureRenameTicket?: boolean
  featureNotifyUser?: boolean
  featureAddUser?: boolean
  featureRemoveUser?: boolean

  // Custom triggers
  customTriggers?: Array<{
    enabled?: boolean
    matchType?: "equals" | "startsWith" | "includes" | "regex"
    trigger: string
    responseType?: "content" | "embed"
    content?: string
    embed?: {
      title?: string
      description?: string
      color?: string
    }
    deleteUserMessage?: boolean
  }>

  // Ticket panel profiles (multi-panel workspace)
  ticketPanelProfiles?: Array<{
    id: string
    label: string
    config?: {
      ticketSystemEnabled?: boolean
      ticketOpenMode?: "buttons" | "select"
      ticketCreateMode?: "category" | "thread"
      ticketButtonEmoji?: string
      ticketButtonStyle?: number
      ticketAppearanceMode?: "embed" | "content"
      ticketEmbedTitle?: string
      ticketEmbedDescription?: string
      ticketEmbedColor?: string
      ticketEmbedBannerUrl?: string
      ticketEmbedThumbUrl?: string
      ticketContentText?: string
      ticketFunctions?: Array<{
        name: string
        preDescription?: string
        description?: string
        emoji?: string
        enabled?: boolean
      }>
      ticketForms?: Record<
        string,
        {
          enabled?: boolean
          title?: string
          robloxVerificationEnabled?: boolean
          robloxUsernameQuestionId?: string
          questions?: Array<{
            id: string
            label: string
            required?: boolean
            style?: "SHORT" | "PARA"
          }>
        }
      >
    }
  }>
  ticketActiveProfileId?: string
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
