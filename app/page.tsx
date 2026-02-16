'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Check, Sparkles, ArrowRight, PlayCircle } from 'lucide-react'
import { config } from '../config'
import DashboardPreview from '@/components/DashboardPreview'
import TestimonialCarousel from '@/components/TestimonialCarousel'

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }

  const item = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
  }

  return (
    <div className="min-h-screen text-white overflow-hidden fx-fade-in">
      <div className="fixed inset-0 pointer-events-none">
        <motion.div className="blob blob-1" animate={{ x: [0, 80, 0], y: [0, -30, 0] }} transition={{ duration: 10, repeat: Infinity }} />
        <motion.div className="blob blob-2" animate={{ x: [0, -90, 0], y: [0, 25, 0] }} transition={{ duration: 10, repeat: Infinity }} />
      </div>

      <nav className="sticky top-3 z-40 px-4 sm:px-6">
        <div className="container-max rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {config.images?.logo ? <img src={config.images.logo} alt="Logo" className="h-9 w-9 rounded-xl object-cover border border-white/10" /> : null}
            <strong className="text-lg sm:text-xl gradient-text truncate">{config.botName}</strong>
          </div>

          <div className="hidden md:flex items-center gap-5 text-sm">
            <a href="#features" className="text-white/75 hover:text-white transition">Features</a>
            <a href="#pricing" className="text-white/75 hover:text-white transition">Precos</a>
            <a href="#faq" className="text-white/75 hover:text-white transition">FAQ</a>
            <a href="/dashboard" className="btn-secondary px-4 py-2">Dashboard</a>
          </div>
        </div>
      </nav>

      <section className="section pt-20 sm:pt-24 relative z-10">
        <div className="container-max grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <motion.div variants={container} initial="hidden" animate="visible" className="space-y-7">
            <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-fuchsia-300/30 bg-fuchsia-400/10 text-fuchsia-100 text-sm fx-pulse-soft">
              <Sparkles size={16} />
              <span>{config.botDescription}</span>
            </motion.div>

            <motion.h1 variants={item} className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
              Suporte de Discord
              <span className="gradient-text block">mais rapido e mais limpo</span>
            </motion.h1>

            <motion.p variants={item} className="text-white/70 text-base sm:text-lg max-w-2xl">
              Configure tickets, IA e pagamentos com uma experiencia clara no bot e no dashboard, sem travar seu atendimento.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-3">
              <a href={config.discordLink} target="_blank" rel="noopener noreferrer" className="btn-primary fx-hover-lift fx-shimmer">
                Adicionar no servidor
                <ArrowRight size={16} />
              </a>
              <a href="#pricing" className="btn-secondary fx-hover-lift">
                Ver planos
              </a>
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-3 gap-3 sm:gap-4 max-w-xl fx-stagger">
              {config.stats.map((s, i) => (
                <div key={i} className="card p-4 sm:p-5 text-center fx-hover-lift">
                  <div className="text-xl sm:text-2xl font-bold gradient-text">{s.number}</div>
                  <div className="text-xs sm:text-sm text-white/65">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="space-y-4">
            <div className="card p-3 sm:p-4 fx-hover-lift">
              <DashboardPreview />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 inline-flex items-center gap-2">
              <PlayCircle size={16} />
              Preview ao vivo da experiencia V5
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="section section-dark relative z-10">
        <div className="container-max">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Recursos que vendem com voce</h2>
            <p className="text-white/65 mt-3">Fluxo claro para dono, staff e cliente final.</p>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {config.features.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.article key={i} variants={item} className="card group">
                  <div className="h-12 w-12 rounded-2xl border border-white/15 bg-white/5 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                    <Icon className="h-6 w-6 text-fuchsia-200" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-white/65 text-sm leading-relaxed">{f.description}</p>
                </motion.article>
              )
            })}
          </motion.div>
        </div>
      </section>

      <section id="pricing" className="section relative z-10">
        <div className="container-max">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Planos simples, foco no resultado</h2>
            <p className="text-white/65 mt-3">Escolha o nivel que faz sentido para sua operacao.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {config.plans.map((p, i) => (
              <article key={i} className={["card fx-hover-lift fx-shimmer", p.popular ? 'ring-2 ring-fuchsia-300/45 shadow-[0_18px_50px_rgba(244,114,182,0.2)]' : ''].join(' ')}>
                {p.popular ? <div className="inline-flex mb-3 px-3 py-1 rounded-full text-xs font-semibold bg-fuchsia-300/20 border border-fuchsia-300/35">Mais escolhido</div> : null}
                <h3 className="text-2xl font-bold">{p.name}</h3>
                <p className="text-white/65 text-sm mt-1">{p.description}</p>
                <div className="mt-5 mb-4">
                  <span className="text-3xl font-bold">{p.price}</span>
                  <span className="text-white/60">{p.period}</span>
                </div>
                <a href={config.discordLink} target="_blank" rel="noopener noreferrer" className={p.popular ? 'btn-primary w-full fx-hover-lift' : 'btn-secondary w-full fx-hover-lift'}>
                  Comecar
                </a>
                <ul className="mt-6 space-y-2">
                  {p.features.map((ft, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-white/80">
                      <Check size={16} className="mt-0.5 text-fuchsia-300" />
                      <span>{ft}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark relative z-10">
        <div className="container-max">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10">Feedback de quem usa</h2>
          <TestimonialCarousel />
        </div>
      </section>

      <section id="faq" className="section relative z-10">
        <div className="container-max max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10">FAQ</h2>
          <div className="space-y-3">
            {config.faq.map((f, i) => (
              <div key={i} className="card p-0 overflow-hidden">
                <button className="w-full p-5 text-left flex items-center justify-between" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-semibold">{f.q}</span>
                  <ChevronDown size={18} className={["transition", openFaq === i ? 'rotate-180' : ''].join(' ')} />
                </button>
                {openFaq === i ? <div className="px-5 pb-5 text-white/70 text-sm">{f.a}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section relative z-10">
        <div className="container-max text-center card">
          <h2 className="text-3xl sm:text-4xl font-bold">Pronto para lancar a V5?</h2>
          <p className="text-white/70 mt-3 mb-6">Ative o bot no servidor e configure tudo no seu ritmo.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={config.discordLink} target="_blank" rel="noopener noreferrer" className="btn-primary">Adicionar agora</a>
            <a href="/dashboard" className="btn-secondary">Abrir dashboard</a>
          </div>
        </div>
      </section>

      <footer className="py-10 px-4 border-t border-white/10 relative z-10">
        <div className="container-max flex flex-col sm:flex-row gap-2 items-center justify-between text-sm text-white/60">
          <span>© 2026 {config.botName}. Todos os direitos reservados.</span>
          <span>Powered by Auroxe Group</span>
        </div>
      </footer>
    </div>
  )
}
