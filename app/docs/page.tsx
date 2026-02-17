export default function DocsPage() {
  return (
    <main className="section min-h-screen">
      <div className="container-max max-w-4xl space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text">Docs do Painel V5</h1>
        <p className="text-white/70">
          Guia rapido das configuracoes de Tickets, Triggers, IA e Pagamentos.
        </p>

        <section className="card">
          <h2 className="text-xl font-semibold mb-2">Triggers</h2>
          <p className="text-white/75 mb-3">
            Triggers permitem responder automaticamente quando uma mensagem bate com um padrao.
          </p>
          <ul className="text-sm text-white/75 space-y-1">
            <li><code>matchType: equals</code> - mensagem deve ser igual ao trigger.</li>
            <li><code>matchType: startsWith</code> - mensagem comeca com o trigger.</li>
            <li><code>matchType: includes</code> - mensagem contem o trigger.</li>
            <li><code>matchType: regex</code> - usa expressao regular (avancado).</li>
          </ul>
        </section>

        <section className="card">
          <h2 className="text-xl font-semibold mb-2">Macros disponiveis</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm text-white/80">
            <div><code>{"{client.user}"}</code> mencao do dono do ticket</div>
            <div><code>{"{client.id}"}</code> id do dono do ticket</div>
            <div><code>{"{client.mention}"}</code> mencao do dono do ticket</div>
            <div><code>{"{client.tag}"}</code> tag do dono do ticket</div>
            <div><code>{"{staff.user}"}</code> mencao do staff assumido</div>
            <div><code>{"{staff.tag}"}</code> tag do staff assumido</div>
            <div><code>{"{guild.name}"}</code> nome do servidor</div>
            <div><code>{"{ticket.id}"}</code> id do canal do ticket</div>
            <div><code>{"{ticket.channel}"}</code> mencao do canal</div>
            <div><code>{"{ticket.owner.id}"}</code> id do dono do ticket</div>
            <div><code>{"{ticket.owner.user}"}</code> mencao do dono do ticket</div>
            <div><code>{"{author.user}"}</code> mencao de quem enviou a msg</div>
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-semibold mb-2">SLA e avaliacao (proximo passo)</h2>
          <p className="text-white/75">
            O proximo pacote inclui controle de SLA por categoria e avaliacao publica de atendimento.
          </p>
        </section>
      </div>
    </main>
  )
}
