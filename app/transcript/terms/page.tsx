export const metadata = {
  title: "Termos de Uso",
};

export default function TermsPage() {
  return (
    <main className="section section-dark">
      <div className="container-max py-16">
        <div className="max-w-3xl mx-auto card p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Termos de Uso</h1>
          <p className="text-white/60 mb-8">
            Última atualização: <span className="text-white/80">{new Date().toLocaleDateString("pt-BR")}</span>
          </p>

          <div className="space-y-6 text-sm leading-relaxed text-white/80">
            <section>
              <h2 className="text-lg font-semibold text-white mb-2">1. Aceite</h2>
              <p>
                Ao acessar e utilizar este painel, você concorda com estes Termos de Uso e com a nossa Política de Privacidade,
                quando aplicável.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">2. Conta e Acesso</h2>
              <p>
                O acesso é feito via Discord. Você é responsável por manter seu acesso seguro e por qualquer atividade realizada
                na sua conta.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">3. Permissões</h2>
              <p>
                Para gerenciar servidores, é necessário ter permissões adequadas no Discord (por exemplo, “Manage Server”).
                O painel pode bloquear ações quando não houver permissão.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">4. Transcripts</h2>
              <p>
                Quando habilitados, transcripts podem ser gerados e armazenados por um período definido (TTL). Se desativados,
                transcripts podem ser invalidados e tornados inacessíveis.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">5. Uso Indevido</h2>
              <p>
                É proibido utilizar o serviço para abuso, spam, violação de leis ou qualquer uso que prejudique terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">6. Alterações</h2>
              <p>
                Podemos atualizar estes termos a qualquer momento. Recomendamos revisar periodicamente.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">7. Contato</h2>
              <p>
                Para suporte ou dúvidas, utilize os canais oficiais do projeto/servidor.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
