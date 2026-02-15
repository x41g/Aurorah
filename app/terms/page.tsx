export const dynamic = "force-static";

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold">Termos de Uso</h1>
        <p className="text-white/70 mt-3">
          Estes termos regulam o uso do site, dashboard e serviços associados (incluindo integrações com Discord).
          Ajuste este texto para a sua operação real.
        </p>

        <div className="mt-8 space-y-6 text-white/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold">1. Conta e Acesso</h2>
            <p className="mt-2">
              O acesso ao dashboard é feito via login Discord. Você é responsável por manter sua conta segura e por
              qualquer atividade realizada nela.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Assinaturas e Planos</h2>
            <p className="mt-2">
              Alguns recursos podem exigir assinatura ativa. Limites (ex.: servidores, tickets/mês) dependem do plano
              contratado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Uso Aceitável</h2>
            <p className="mt-2">
              É proibido tentar burlar regras, explorar falhas, abusar de integrações ou realizar atividades ilegais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Limitação de Responsabilidade</h2>
            <p className="mt-2">
              O serviço é fornecido "como está". Em caso de instabilidade do Discord, provedores ou terceiros, o
              funcionamento pode ser afetado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Contato</h2>
            <p className="mt-2">Para suporte, utilize os canais oficiais do seu servidor/atendimento.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
