import { BsTicketDetailedFill, BsCreditCardFill, BsAwardFill, BsShieldFillCheck, BsLightningChargeFill  } from "react-icons/bs";
import { GiBrain } from "react-icons/gi";

export const config = {
  botName: 'V5・Aurora',
  botDescription: 'O melhor bot de tickets do Discord',
  tagline: 'Automatize as vendas do seu Discord',
  
  // 🔗 Links
  discordLink: 'https://discord.com/oauth2/authorize?client_id=1470481135321485455&permissions=8&integration_type=0&scope=bot',
  buyLink: '',
  
  colors: {
primary: '#8B5CF6',
dark: '#EC4899',
light: '#60A5FA',     
accent: '#0f0f1a',

  },
  stats: [
    { number: '10+', label: 'Servidores Ativos' },
    { number: '50+', label: 'Tickets Processados p/ servidor' },
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
      name: 'Starter',
      price: 'R$ 9,90',
      period: '/mês',
      description: 'Para pequenos servidores',
      features: [
        'Até 100 tickets/mês',
        'Dashboard básico',
        '1 servidor',
      ],
      popular: false,
    },
    {
      name: 'Pro',
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
      name: 'Enterprise',
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
      name: 'Kama',
      role: 'Dono de Loja',
      text: 'Aumentei minhas vendas em 170% com o bot. Sistema muito profissional!',
      avatarUrl: 'clients/kama.png  ',
    },
        {
      name: 'Yuki',
      role: 'Administrador(a) de Loja',
      text: 'Aumentamos a margem de lucro e eficiência do suporte da nossa loja com a ferramenta!',
      avatarUrl: 'clients/yuki.png  ',
    },
    {
      name: 'iymarshuai_',
      role: 'Dona da Plumpy Store',
      text: 'Adorei o sistema daqui! Realmente confiável, espero que seja muito mais reconhecido!  100/10 💕',
      avatarUrl: 'clients/iymarshuai.png  ',
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
      a: 'Sim! Dependendo do plano. Starter = 1 servidor, Pro = 5 servidores, Enterprise = ilimitado.',
    },
    {
      q: 'Como funciona o sistema de pagamento?',
      a: 'Integramos com MercadoPago. Você recebe os pagamentos diretamente na sua conta ou se preferir, sistema de pagamento semi-automatico.',
    },
  ],
  
  images: {
    logo: '/icons/logo.png',
  },

    dashboardPreview: {
    src: "/icons/",
    type: "auto" as const,
    alt: "Prévia do dashboard",
    // poster: "https://seu-link-aqui/poster.png", // opcional (bom pra video)
      serverIconUrl: "https://r2.e-z.host/3b4c067b-8d6b-4b6c-ba63-092e2cbda5d5/riyofmko.png",
      botAvatarUrl: "https://r2.e-z.host/3b4c067b-8d6b-4b6c-ba63-092e2cbda5d5/zl54n5em.png",
      loopImageUrl: "https://r2.e-z.host/3b4c067b-8d6b-4b6c-ba63-092e2cbda5d5/w549dsk7.png",
  },
}
