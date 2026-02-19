import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { ensureSupportGuildMembership } from "@/lib/discordAutoJoin";

const scopes = "identify guilds guilds.join";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
      authorization: { params: { scope: scopes } },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      const userId = String((user as any)?.id || (user as any)?.sub || (account as any)?.providerAccountId || "").trim();
      const accessToken = String((account as any)?.access_token || "").trim();
      if (userId && accessToken) {
        const joined = await ensureSupportGuildMembership({
          userId,
          userAccessToken: accessToken,
        }).catch(() => null);
        if (joined && !joined.ok) {
          console.warn(`[AUTH] support auto-join falhou user=${userId} status=${joined.status} reason=${joined.reason}`);
        }
      }
      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
async session({ session, token }) {
  session.accessToken = token.accessToken as any;
  session.user = { ...session.user, id: token.sub as any };
  return session;
},
  },
};
