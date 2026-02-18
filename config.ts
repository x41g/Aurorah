import { BsTicketDetailedFill, BsCreditCardFill, BsAwardFill, BsShieldFillCheck, BsLightningChargeFill  } from "react-icons/bs";
import { GiBrain } from "react-icons/gi";

export const config = {
  botName: '・Aurora',
  botDescription: 'O melhor bot de tickets do Discord',
  tagline: 'Automatize as vendas do seu Discord',
  triggersPlaceholder: `[
  {
    "enabled": true,
    "matchType": "equals",
    "trigger": ".vip",
    "responseType": "content",
    "content": "Olá, {client.mention}!\\nEntre no servidor abaixo para receber seu produto.\\nhttps://www.roblox.com/share?code..."
  }
]`,
  
  // 🔗 Links
  discordLink: 'https://discord.com/oauth2/authorize?client_id=1470481135321485455',
  buyLink: 'https://discord.gg/6FrSDf7dSc',
  instagramLink: 'https://www.instagram.com/_auroxe/',
  tiktokLink: 'https://www.tiktok.com/@auroxefx',
  
  colors: {
primary: '#8B5CF6',
dark: '#EC4899',
light: '#60A5FA',     
accent: '#12071f',

  },
  stats: [
    { number: '3+', label: 'Servidores Ativos' },
    { number: '10+', label: 'Tickets Processados p/ servidor' },
    { number: '99.9%', label: 'Uptime' },
  ],
  
  features: [
    {
      icon: BsTicketDetailedFill,
      title: 'Tickets Automáticos',
      description: 'Crie tickets com um clique. Sistema inteligente e automático.',
    },
    {
      icon: BsCreditCardFill,
      title: 'Pagamentos Integrados',
      description: 'Receba pagamentos direto no Discord com MercadoPago.',
    },
    {
      icon: BsAwardFill,
      title: 'Oficialmente Verificado pelo Discord',
      description: 'Mais confiança, segurança e estabilidade para sua operação e seus clientes.',
    },
    {
      icon: BsShieldFillCheck,
      title: 'Segurança Premium',
      description: 'Segurança de nível empresarial para proteger seus dados e seus clientes.',
    },
    {
      icon: BsLightningChargeFill,
      title: 'Extremamente Rápido',
      description: 'Resposta instantânea e sem lag. Otimizado para performance.',
    },
    {
      icon: GiBrain,
      title: 'IA Integrada',
      description: 'Respostas automáticas inteligentes com machine learning.',
    },
  ],
  plans: [
    {
      name: 'Essencial',
      price: 'R$ 9,90',
      period: '/mês',
      description: 'Para pequenos servidores',
      features: [
        'Até 300 tickets/mês',
        'Dashboard básico',
        '1 servidor',
      ],
      popular: false,
    },
    {
      name: 'Prime',
      price: 'R$ 19,90',
      period: '/mês',
      description: 'Para servidores em crescimento',
      features: [
        'Tickets ilimitados',
        'Dashboard completo',
        'Suporte prioritário',
        'Até 5 servidores',
        'Pagamentos integrados',
        'SafePay (anti-scam)',
        'I.A integrada',
        'Análise estatisticas',
      ],
      popular: true,
    },
    {
      name: 'Elite',
      price: 'Customizado',
      period: '',
      description: 'Para grandes operações',
      features: [
        'Tudo do plano interior',
        'Suporte dedicado 24/7',
        'Servidores ilimitados',
        'Integrações personalizadas',
      ],
      popular: false,
    },
  ],
  
  testimonials: [
    {
      name: '𝐌𝐞𝐥𝐨𝐝𝐲𝐬 𝐒𝐭𝐨𝐫𝐞',
      role: '',
      text: '10/10 Aurora é simplesmente incrível, sistema muito prático e completo, recomendo usarem!',
      avatarUrl: 'clients/Yelhsa.png',
    },
    {
      name: 'Candy`s 𝐒hopp',
      role: '',
      text: 'Eu adorei muito o sistema e tudo que ele tem pra oferecer, a paciência e o atendimento! 100/10',
      avatarUrl: 'clients/miikaofc.png',
    },


  ],
  testimonialCarousel: {
  intervalMs: 2000,
  },
  
  faq: [
    {
      q: 'Há período de teste?',
      a: 'Sim! 3 dias grátis para testar o bot e ver se é a solução ideal para sua loja.',
    },
    {
      q: 'Como funciona a Aurora?',
      a: 'Nosso bot é integrado ao Discord e ao MercadoPago. Ele automatiza a criação de tickets para cada venda, processa os pagamentos e fornece um dashboard completo para gerenciar tudo isso de forma fácil e eficiente.',
    },
    {
      q: 'Posso usar em múltiplos servidores?',
      a: 'Sim! Dependendo do plano. Essencial = 1 servidor, Prime = 5 servidores, Elite = ilimitado.',
    },
    {
      q: 'Como funciona o sistema de pagamento?',
      a: 'Integramos com MercadoPago. Você recebe os pagamentos diretamente na sua conta ou se preferir, sistema de pagamento semi-automatico.',
    },
  ],
  
  images: {
    logo: '/icons/logo.png',
    botAvatar: '/aurora.png',
  },

    dashboardPreview: {
    src: "/icons/",
    type: "auto" as const,
    alt: "Prévia do dashboard",
    // poster: "https://seu-link-aqui/poster.png", // opcional (bom pra video)
      serverIconUrl: "https://r2.e-z.host/3b4c067b-8d6b-4b6c-ba63-092e2cbda5d5/d035xj7t.png",
      botAvatarUrl: "https://r2.e-z.host/3b4c067b-8d6b-4b6c-ba63-092e2cbda5d5/zl54n5em.png",
      loopImageUrl: "https://r2.e-z.host/3b4c067b-8d6b-4b6c-ba63-092e2cbda5d5/d035xj7t.png",
  },
}

