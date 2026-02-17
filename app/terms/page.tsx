import Link from "next/link";

export const metadata = {
  title: "Termos de Uso | Aurora",
  description: "Termos de Uso da plataforma Aurora.",
};

export default function TermsPage() {
  const updatedAt = "17/02/2026";

  return (
    <main className="section section-dark min-h-screen">
      <div className="container-max py-16">
        <div className="max-w-4xl mx-auto card p-6 sm:p-8 md:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Termos de Uso</h1>
          <p className="text-sm text-white/60 mb-8">Ultima atualizacao: {updatedAt}</p>

          <div className="space-y-6 text-sm sm:text-base text-white/80 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-white mb-2">1. Aceite dos termos</h2>
              <p>
                Ao utilizar a Aurora (bot e dashboard), voce concorda com estes termos e com a nossa
                politica de privacidade.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">2. Conta e acesso</h2>
              <p>
                O acesso e realizado via Discord. O usuario e responsavel pela seguranca da propria conta
                e pelas acoes executadas nela.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">3. Uso permitido</h2>
              <p>
                O servico deve ser usado de forma legal e etica. Nao e permitido spam, fraude, abuso,
                tentativa de invasao, engenharia social ou uso que prejudique terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">4. Planos e recursos</h2>
              <p>
                Recursos disponiveis variam conforme plano contratado. A Aurora pode restringir ou bloquear
                funcoes nao inclusas no plano.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">5. Transcripts e registros</h2>
              <p>
                Quando habilitados, transcripts e logs podem ser armazenados por periodo configurado (TTL)
                para operacao, seguranca e auditoria.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">6. Disponibilidade</h2>
              <p>
                Fazemos o melhor esforco para manter estabilidade, mas nao garantimos disponibilidade
                ininterrupta do servico.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">7. Alteracoes</h2>
              <p>Estes termos podem ser atualizados a qualquer momento. A versao publicada neste link e a vigente.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">8. Contato</h2>
              <p>
                Para suporte comercial ou tecnico, utilize nossos canais oficiais.
              </p>
            </section>
          </div>

          <div className="mt-10 text-sm text-white/60">
            Consulte tambem nossa{" "}
            <Link href="/privacy" className="text-white hover:underline">
              Politica de Privacidade
            </Link>
            .
          </div>
        </div>
      </div>
    </main>
  );
}

