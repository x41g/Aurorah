import Link from "next/link";

export const metadata = {
  title: "Politica de Privacidade | Aurora",
  description: "Politica de Privacidade da plataforma Aurora.",
};

export default function PrivacyPage() {
  const updatedAt = "17/02/2026";

  return (
    <main className="section section-dark min-h-screen">
      <div className="container-max py-16">
        <div className="max-w-4xl mx-auto card p-6 sm:p-8 md:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Politica de Privacidade</h1>
          <p className="text-sm text-white/60 mb-8">Ultima atualizacao: {updatedAt}</p>

          <div className="space-y-6 text-sm sm:text-base text-white/80 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-white mb-2">1. Dados coletados</h2>
              <p>
                Podemos coletar dados de autenticacao via Discord, IDs tecnicos (usuario, servidor, canais),
                configuracoes da guild, logs operacionais e metricas de uso.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">2. Finalidade do uso</h2>
              <p>
                Os dados sao usados para operar o bot, sincronizar dashboard, aplicar regras de plano,
                gerar estatisticas e manter seguranca do servico.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">3. Compartilhamento</h2>
              <p>
                Nao vendemos dados pessoais. Compartilhamento ocorre apenas quando necessario para operacao
                tecnica, processamento de servicos e obrigacoes legais.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">4. Retencao e exclusao</h2>
              <p>
                Mantemos dados apenas pelo periodo necessario para funcionalidade, seguranca e conformidade.
                Alguns itens (como transcripts) podem expirar automaticamente conforme configuracao.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">5. Seguranca</h2>
              <p>
                Aplicamos medidas tecnicas para reduzir riscos de acesso nao autorizado, vazamentos e uso indevido.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">6. Direitos do usuario</h2>
              <p>
                O usuario pode solicitar revisao, atualizacao ou remocao de dados aplicaveis, conforme limites
                tecnicos e legais.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">7. Alteracoes nesta politica</h2>
              <p>
                Esta politica pode ser alterada para refletir mudancas no servico ou requisitos legais.
              </p>
            </section>
          </div>

          <div className="mt-10 text-sm text-white/60">
            Consulte tambem nossos{" "}
            <Link href="/terms" className="text-white hover:underline">
              Termos de Uso
            </Link>
            .
          </div>
        </div>
      </div>
    </main>
  );
}

