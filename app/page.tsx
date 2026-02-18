'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, ChevronDown, MessageCircle, Instagram, Sparkles, PlayCircle } from 'lucide-react'
import { FaTiktok } from 'react-icons/fa'
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  }

  const sectionFx = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.18 as const },
    transition: { duration: 0.45, ease: 'easeOut' as const },
  }

  return (
    <div className="landing-page min-h-screen overflow-hidden text-white">
      <div className="aura-grid-bg fixed inset-0 pointer-events-none" />
      <div className="pointer-events-none fixed inset-0">
        <motion.div
          className="absolute -top-28 left-[8%] h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/20 blur-3xl"
          animate={{ x: [0, 35, 0], y: [0, -22, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-[-9rem] right-[10%] h-[28rem] w-[28rem] rounded-full bg-violet-500/20 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 18, 0] }}
          transition={{ duration: 11, repeat: Infinity }}
        />
      </div>

      <nav className="sticky top-3 z-50 px-4 sm:px-6">
        <div className="container-max aura-panel flex items-center justify-between rounded-2xl px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {config.images?.logo ? (
              <img src={config.images.logo} alt="Logo Aurora" className="h-10 w-10 rounded-xl border border-white/15 object-cover" />
            ) : null}
            <strong className="gradient-text truncate text-lg sm:text-xl">{config.botName}</strong>
          </div>

          <div className="hidden items-center gap-5 text-sm md:flex">
            <a href="#features" className="text-white/75 transition hover:text-white">Features</a>
            <a href="#pricing" className="text-white/75 transition hover:text-white">Precos</a>
            <a href="#faq" className="text-white/75 transition hover:text-white">FAQ</a>
            <a href="/docs" className="text-white/75 transition hover:text-white">Docs</a>
            <a href="/dashboard" className="btn-secondary px-4 py-2">Dashboard</a>
          </div>
        </div>
      </nav>

      <motion.section className="section relative z-10 pt-14 sm:pt-20" {...sectionFx}>
        <div className="container-max grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div variants={container} initial="hidden" animate="visible" className="space-y-7">
            <motion.div variants={item} className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/35 bg-fuchsia-400/10 px-4 py-2 text-sm text-fuchsia-100">
              <Sparkles size={16} />
              <span>{config.botDescription}</span>
            </motion.div>

            <motion.h1 variants={item} className="text-3xl font-bold leading-[1.04] min-[420px]:text-4xl sm:text-5xl lg:text-6xl">
              Ticket, IA e pagamento
              <span className="gradient-text block">em uma experiencia premium</span>
            </motion.h1>

            <motion.p variants={item} className="max-w-2xl text-base text-white/70 sm:text-lg">
              Aurora centraliza atendimento do Discord com visual moderno, automacoes prontas e controle total no dashboard.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-3">
              <a href={config.discordLink} target="_blank" rel="noopener noreferrer" className="btn-primary fx-hover-lift fx-shimmer w-full min-[420px]:w-auto">
                Adicionar no servidor
                <ArrowRight size={16} />
              </a>
              <a href="#pricing" className="btn-secondary fx-hover-lift w-full min-[420px]:w-auto">Ver planos</a>
            </motion.div>

            <motion.div variants={item} className="grid max-w-xl grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:gap-4">
              {config.stats.map((s, i) => (
                <div key={i} className="aura-panel rounded-2xl p-4 text-center sm:p-5">
                  <div className="gradient-text text-xl font-bold sm:text-2xl">{s.number}</div>
                  <div className="text-xs text-white/65 sm:text-sm">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="aura-panel rounded-3xl p-2 fx-hover-lift">
              <DashboardPreview />
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              <PlayCircle size={16} />
              Preview ao vivo da Aurora V5
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section id="features" className="section section-dark relative z-10" {...sectionFx}>
        <div className="container-max">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Estrutura pensada para conversao</h2>
            <p className="mt-3 text-white/65">Tudo com foco em velocidade para cliente e staff.</p>
          </motion.div>

          <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            {config.features.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.article key={i} variants={item} className="aura-panel group rounded-3xl p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 transition group-hover:scale-105">
                    <Icon className="h-6 w-6 text-fuchsia-200" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-white/65">{f.description}</p>
                </motion.article>
              )
            })}
          </motion.div>
        </div>
      </motion.section>

      <motion.section id="pricing" className="section relative z-10" {...sectionFx}>
        <div className="container-max">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Planos claros e escalaveis</h2>
            <p className="mt-3 text-white/65">Escolha por necessidade real da sua loja.</p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-3">
            {config.plans.map((p, i) => (
              <article
                key={i}
                className={[
                  'aura-panel rounded-3xl p-6 fx-hover-lift',
                  p.popular ? 'ring-2 ring-fuchsia-300/45 shadow-[0_18px_50px_rgba(244,114,182,0.2)]' : '',
                ].join(' ')}
              >
                {p.popular ? <div className="mb-3 inline-flex rounded-full border border-fuchsia-300/35 bg-fuchsia-300/20 px-3 py-1 text-xs font-semibold">Mais escolhido</div> : null}
                <h3 className="text-2xl font-bold">{p.name}</h3>
                <p className="mt-1 text-sm text-white/65">{p.description}</p>
                <div className="mb-4 mt-5">
                  <span className="text-3xl font-bold">{p.price}</span>
                  <span className="text-white/60">{p.period}</span>
                </div>
                <a href={config.buyLink} target="_blank" rel="noopener noreferrer" className={p.popular ? 'btn-primary w-full' : 'btn-secondary w-full'}>
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
      </motion.section>

      <motion.section className="section section-dark relative z-10" {...sectionFx}>
        <div className="container-max">
          <h2 className="mb-10 text-center text-3xl font-bold sm:text-4xl">Quem usa recomenda</h2>
          <TestimonialCarousel />
        </div>
      </motion.section>

      <motion.section id="faq" className="section relative z-10" {...sectionFx}>
        <div className="container-max max-w-3xl">
          <h2 className="mb-10 text-center text-3xl font-bold sm:text-4xl">FAQ</h2>
          <div className="space-y-3">
            {config.faq.map((f, i) => (
              <div key={i} className="aura-panel overflow-hidden rounded-2xl p-0">
                <button className="flex w-full items-center justify-between p-5 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-semibold">{f.q}</span>
                  <ChevronDown size={18} className={['transition', openFaq === i ? 'rotate-180' : ''].join(' ')} />
                </button>
                {openFaq === i ? <div className="px-5 pb-5 text-sm text-white/70">{f.a}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section className="section relative z-10" {...sectionFx}>
        <div className="container-max">
          <div className="aura-panel rounded-3xl p-8 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Pronto para lancar sua operacao?</h2>
            <p className="mb-6 mt-3 text-white/70">Ative Aurora no seu servidor e configure tudo em minutos.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href={config.discordLink} target="_blank" rel="noopener noreferrer" className="btn-primary">Adicionar agora</a>
              <a href="/dashboard" className="btn-secondary">Abrir dashboard</a>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section className="section relative z-10 pt-0" {...sectionFx}>
        <div className="container-max">
          <div className="aura-panel rounded-3xl p-6 sm:p-8">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-2xl font-bold">Social e Contato</h3>
              <p className="text-sm text-white/65">Canais oficiais da Aurora.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <a href={config.discordLink} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex w-full items-center justify-center gap-2">
                <MessageCircle size={16} />
                Discord
              </a>
              <a href={config.instagramLink || config.buyLink} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex w-full items-center justify-center gap-2">
                <Instagram size={16} />
                Instagram
              </a>
              <a href={config.tiktokLink || config.buyLink} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex w-full items-center justify-center gap-2">
                <FaTiktok size={16} />
                TikTok
              </a>
            </div>
          </div>
        </div>
      </motion.section>

      <footer className="relative z-10 border-t border-white/10 px-4 py-10">
        <div className="container-max flex flex-col items-center justify-between gap-2 text-sm text-white/60 sm:flex-row">
          <span>© 2026 {config.botName}. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <a href="/terms" className="transition hover:text-white">Termos</a>
            <a href="/privacy" className="transition hover:text-white">Privacidade</a>
            <span>Powered by Auroxe Group</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
