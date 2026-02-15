export const dynamic = "force-static";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold">Política de Privacidade</h1>
        <p className="text-white/70 mt-3">
          Esta política descreve como coletamos e usamos dados. Ajuste conforme sua operação real.
        </p>

        <div className="mt-8 space-y-6 text-white/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold">1. Dados coletados</h2>
            <p className="mt-2">
              Usamos login via Discord. Podemos armazenar identificadores (ex.: ID do usuário, guildId) e configurações
              do servidor para operar o bot e o dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Finalidade</h2>
            <p className="mt-2">Operação do serviço, métricas de uso, segurança, suporte e melhorias do produto.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Retenção</h2>
            <p className="mt-2">Mantemos dados apenas pelo tempo necessário. Transcripts podem expirar automaticamente.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Compartilhamento</h2>
            <p className="mt-2">
              Não vendemos seus dados. Podemos usar provedores de infraestrutura (ex.: banco e hosting) para operar o
              serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Seus direitos</h2>
            <p className="mt-2">Você pode solicitar exclusão/ajuste de dados conforme aplicável.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
