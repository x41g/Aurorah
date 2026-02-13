import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

const scopes = "identify guilds";

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
