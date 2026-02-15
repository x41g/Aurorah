'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Check, } from 'lucide-react' 
{/*ADICIONAR  Moon, Sun,*/}
{/* import { useTheme } from './providers' */}
import { config } from '../config'  
import DashboardPreview from "@/components/DashboardPreview";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import { MdAdd } from "react-icons/md";

export default function Home() {
  {/* const { theme, toggleTheme } = useTheme() */}
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 text-white dark:text-white overflow-hidden">
      {/* Theme Toggle */}
        {/* <button
          onClick={toggleTheme}
          className={[
            "fixed bottom-6 left-6 z-50",
            "flex items-center gap-2",
            "px-4 py-3 rounded-full",
            "bg-black/35 backdrop-blur-md",
            "border border-white/10",
            "shadow-lg shadow-black/30",
            "hover:bg-black/55 hover:border-white/20",
            "transition-all duration-300",
          ].join(" ")}
          aria-label="Alternar tema"
          title="Alternar tema"
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-5 h-5" />
              <span className="text-sm text-white/80">Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5" />
              <span className="text-sm text-slate-900/80">Escuro</span>
            </>
          )}
        </button> */}





      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="blob blob-1"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="blob blob-2"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-6xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        <div className="container-max px-4 py-4 flex justify-between items-center">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {config.images?.logo ? (
              <img
                src={config.images.logo}
                alt={`${config.botName} logo`}
                className="h-8 w-8 rounded-md object-contain"
              />
            ) : null}

            <span className="text-2xl font-bold gradient-text">
              {config.botName}
            </span>
          </motion.div>
          <motion.div
            className="hidden md:flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <a
              href="#features"
              className="text-gray-300 hover:text-white transition"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-gray-300 hover:text-white transition"
            >
              Preços
            </a>
            <a
              href="#faq"
              className="text-gray-300 hover:text-white transition"
            >
              FAQ
            </a>
            <a href="/dashboard" className="btn-secondary px-5 py-2 rounded-full leading-none">Dashboard</a>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative z-10">
        <div className="container-max">
          <motion.div
            className="text-center mb-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="inline-block mb-6 px-4 py-2 bg-purple-500/20 border border-purple-400/50 rounded-full"
            >
              <span className="text-purple-300 text-sm font-semibold">
                ✨ {config.botDescription}
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-7xl font-bold mb-6 leading-tight"
            >
              {config.tagline.split(' ').map((word, i) => (
                <span key={i}>
                  {word}{' '}
                </span>
              ))}
              <br />
              <span className="gradient-text">
                com a Aurora
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Venda mais no Discord sem aumentar sua carga de trabalho.
            </motion.p>

            {config.images?.botAvatar ? (
              <motion.div variants={itemVariants} className="mb-8 flex justify-center">
                <img
                  src={config.images.botAvatar}
                  alt={`${config.botName} avatar`}
                  className="h-24 w-24 rounded-3xl border border-white/20 object-cover shadow-[0_20px_60px_rgba(168,85,247,0.25)]"
                />
              </motion.div>
            ) : null}

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
            <a
              href={config.discordLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              <MdAdd className="h-5 w-5 shrink-0" />
              <span className="leading-none">Adicionar ao servidor</span>
            </a>
              <a
                
                className="btn-secondary"
                    onClick={() => {
    document.getElementById("pricing")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }}
  >
                Ver Planos
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              {config.stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl font-bold gradient-text">{stat.number}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            className="relative mt-20 rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <DashboardPreview />

          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section section-dark relative z-10">
        <div className="container-max">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-4">
              Recursos <span className="gradient-text">Poderosos</span>
            </h2>
            <p className="text-white/65 text-lg">
              Tudo que você precisa para gerenciar tickets profissionalmente
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {config.features.map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="card group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(236,72,153,0.18)]"
              >
<div className="mb-4">
  <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
    {/* glow fofinho */}
    <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-pink-400/25 via-purple-400/25 to-sky-400/25 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    
    {/* ícone */}
    <div className="relative z-10">
      {(() => {
        const Icon = feature.icon;
        return <Icon className="h-6 w-6 text-pink-300" />;
      })()}
    </div>
  </div>
</div> 
                
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section relative z-10">
        <div className="container-max">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-4">
              Planos <span className="gradient-text">Acessíveis</span>
            </h2>
            <p className="text-white/65 text-lg">
              Escolha o plano perfeito para seu servidor
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {config.plans.map((plan, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className={`p-8 rounded-xl border transition transform hover:scale-105 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400 shadow-2xl shadow-purple-500/50 md:scale-105'
                    : 'card'
                }`}
              >
                {plan.popular && (
                  <div className="mb-4 inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                    ⭐ Mais Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-200 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-300">{plan.period}</span>
                </div>
                <button
                className={`w-full py-3 rounded-lg font-bold transition ${
                    plan.popular
                      ? 'bg-white text-purple-600 hover:bg-gray-100'
                      : 'border-2 border-purple-400 hover:bg-purple-400/10'
                  }`}
                >
                  <a href={config.discordLink}>Começar Agora</a>
                </button>
                <ul className="space-y-3 mt-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section section-dark relative z-10">
        <div className="container-max">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-4">
              O que <span className="gradient-text">Clientes Dizem</span>
            </h2>
          </motion.div>

            <TestimonialCarousel />

        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section relative z-10">
        <div className="container-max max-w-3xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-4">
              Perguntas <span className="gradient-text">Frequentes</span>
            </h2>
          </motion.div>

          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {config.faq.map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="border border-purple-500/30 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 hover:from-purple-900/50 hover:to-pink-900/50 transition flex justify-between items-center"
                >
                  <span className="font-bold text-lg text-left">{item.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="p-6 bg-black/30 border-t border-purple-500/30"
                  >
                    <p className="text-gray-300">{item.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="section relative z-10">
        <div className="container-max text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6">
              Pronto para <span className="gradient-text">Começar?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Junte-se a milhares de servidores que já usam o {config.botName}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={config.discordLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                🔥 Começar Agora
              </a>
              <a
                href={config.buyLink}
                className="btn-secondary"
              >
                Ver Planos
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 py-12 px-4 bg-black/50 relative z-10">
        <div className="container-max">
          <div className="text-center text-gray-400">
            <p>&copy; 2026 {config.botName}. Todos os direitos reservados.</p>
            <p>Powered by Auroxe Group</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
