import Link from "next/link";

export default function NoServersPage() {
  return (
    <main className="min-h-screen section">
      <div className="container-max">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h1 className="text-3xl font-bold mb-2">Sem servidores elegíveis</h1>
            <p className="text-white/60 mb-6">
              Para acessar o painel, você precisa ter permissão de <b>Manage Server</b> (ou Admin) em um servidor onde o bot
              esteja ativo.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="btn-secondary px-6 py-3 rounded-2xl">
                Recarregar
              </Link>
              <Link href="/" className="btn-primary px-6 py-3 rounded-2xl">
                Voltar para a landing
              </Link>
            </div>

            <div className="mt-6 text-sm text-white/50">
              Se você acabou de adicionar o bot, aguarde alguns segundos e recarregue.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
