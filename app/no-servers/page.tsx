import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default function NoServersPage() {
  const clientId = String(process.env.DISCORD_CLIENT_ID || "1470481135321485455").trim();
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(
    clientId
  )}&scope=bot%20applications.commands&permissions=8`;

  return (
    <main className="min-h-screen section">
      <div className="container-max">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h1 className="text-3xl font-bold mb-2">Sem servidores elegiveis</h1>
            <p className="text-white/60 mb-6">
              Para acessar o painel, voce precisa ter permissao de <b>Manage Server</b> (ou Admin) em um servidor
              onde o bot esteja ativo.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href={inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-6 py-3 rounded-2xl"
              >
                Adicionar bot no servidor
              </a>
              <Link href="/dashboard" className="btn-secondary px-6 py-3 rounded-2xl">
                Recarregar
              </Link>
              <Link href="/" className="btn-secondary px-6 py-3 rounded-2xl">
                Voltar para a landing
              </Link>
              <SignOutButton className="btn-secondary px-6 py-3 rounded-2xl" />
            </div>

            <div className="mt-6 text-sm text-white/50">
              1) Clique em "Adicionar bot no servidor". 2) Escolha um servidor onde voce tenha Manage Server/Admin.
              3) Volte e clique em "Recarregar".
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

