type RawBotState = unknown;

export type MaintenanceState = {
  enabled: boolean;
  message: string;
  updatedAt: number | null;
};

export const DEFAULT_MAINTENANCE_MESSAGE =
  "Estamos em manutenção para aplicar melhorias. Voltamos em breve.";

export function readGuildIds(raw: RawBotState): string[] {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (raw && typeof raw === "object") {
    const maybe = (raw as any).guildIds;
    if (Array.isArray(maybe)) return maybe.map(String).filter(Boolean);
  }
  return [];
}

export function readMaintenanceState(raw: RawBotState): MaintenanceState {
  if (raw && typeof raw === "object") {
    const m = (raw as any).maintenance;
    if (m && typeof m === "object") {
      return {
        enabled: Boolean(m.enabled),
        message: String(m.message || DEFAULT_MAINTENANCE_MESSAGE),
        updatedAt: Number.isFinite(Number(m.updatedAt)) ? Number(m.updatedAt) : null,
      };
    }
  }
  return {
    enabled: false,
    message: DEFAULT_MAINTENANCE_MESSAGE,
    updatedAt: null,
  };
}

export function buildBotStatePayload(guildIds: string[], maintenance: MaintenanceState) {
  return {
    guildIds: (Array.isArray(guildIds) ? guildIds : []).map(String).filter(Boolean),
    maintenance: {
      enabled: Boolean(maintenance.enabled),
      message: String(maintenance.message || DEFAULT_MAINTENANCE_MESSAGE).slice(0, 240),
      updatedAt: Number.isFinite(Number(maintenance.updatedAt))
        ? Number(maintenance.updatedAt)
        : Date.now(),
    },
  };
}

