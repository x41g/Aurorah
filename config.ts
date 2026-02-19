import { BsTicketDetailedFill, BsCreditCardFill, BsAwardFill, BsShieldFillCheck, BsLightningChargeFill } from "react-icons/bs";
import { GiBrain } from "react-icons/gi";

export const config = {
  botName: "Aurora",
  botDescription: "O melhor bot de tickets do Discord",
  triggersPlaceholder: `[
  {
    "enabled": true,
    "matchType": "equals",
    "trigger": ".vip",
    "responseType": "content",
    "content": "Ola, {client.mention}!\\nEntre no servidor abaixo para receber seu produto.\\nhttps://www.roblox.com/share?code..."
  }
]`,

  discordLink: "https://discord.com/oauth2/authorize?client_id=1470481135321485455",
  buyLink: "https://discord.gg/6FrSDf7dSc",
  instagramLink: "https://www.instagram.com/_auroxe/",
  tiktokLink: "https://www.tiktok.com/@auroxefx",

  stats: [
    { number: "3+", label: "Servidores Ativos" },
    { number: "10+", label: "Tickets Processados" },
    { number: "99.9%", label: "Uptime" },
  ],

  features: [
    {
      icon: BsTicketDetailedFill,
      title: "Tickets Automaticos",
      description: "Crie tickets com um clique. Sistema inteligente e automatico.",
    },
    {
      icon: BsCreditCardFill,
      title: "Pagamentos Integrados",
      description: "Receba pagamentos direto no Discord com MercadoPago.",
    },
    {
      icon: BsAwardFill,
      title: "Oficialmente Verificado pelo Discord",
      description: "Mais confianca, seguranca e estabilidade para sua operacao e seus clientes.",
    },
    {
      icon: BsShieldFillCheck,
      title: "Seguranca Premium",
      description: "Seguranca de nivel empresarial para proteger seus dados e seus clientes.",
    },
    {
      icon: BsLightningChargeFill,
      title: "Extremamente Rapido",
      description: "Resposta instantanea e sem lag. Otimizado para performance.",
    },
    {
      icon: GiBrain,
      title: "IA Integrada",
      description: "Respostas automaticas inteligentes com machine learning.",
    },
  ],

  plans: [
    {
      name: "Essencial",
      price: "R$ 9,90",
      period: "/mes",
      description: "Para pequenos servidores",
      features: ["Ate 300 tickets/mes", "Dashboard basico", "1 servidor"],
      popular: false,
    },
    {
      name: "Prime",
      price: "R$ 14,90",
      period: "/mes",
      description: "Para servidores em crescimento",
      features: [
        "Tickets ilimitados",
        "Dashboard completo",
        "Suporte prioritario",
        "Ate 5 servidores",
        "Pagamentos integrados",
        "SafePay (anti-scam)",
        "I.A integrada",
        "Analise estatisticas",
        "Formularios personalizados",
        "User Tracker Roblox"
      ],
      popular: true,
    },
    {
      name: "Elite",
      price: "Customizado",
      period: "",
      description: "Para grandes operacoes",
      features: [
        "Tudo do plano interior",
        "Suporte dedicado 24/7",
        "Servidores ilimitados",
        "Integracoes personalizadas",
      ],
      popular: false,
    },
  ],

  testimonials: [
    {
      name: "Melodys Store",
      role: "",
      text: "10/10 Aurora e simplesmente incrivel, sistema muito pratico e completo, recomendo usarem!",
      avatarUrl: "clients/Yelhsa.png",
    },
    {
      name: "Candy's Shopp",
      role: "",
      text: "Eu adorei muito o sistema e tudo que ele tem pra oferecer, a paciencia e o atendimento! 100/10",
      avatarUrl: "clients/miikaofc.png",
    },
  ],

  testimonialCarousel: {
    intervalMs: 2000,
  },

  faq: [
    {
      q: "Ha periodo de teste?",
      a: "Sim! 3 dias gratis para testar o bot e ver se e a solucao ideal para sua loja.",
    },
    {
      q: "Como funciona a Aurora?",
      a: "Nosso bot e integrado ao Discord e ao MercadoPago. Ele automatiza a criacao de tickets para cada venda, processa os pagamentos e fornece um dashboard completo para gerenciar tudo isso de forma facil e eficiente.",
    },
    {
      q: "Posso usar em multiplos servidores?",
      a: "Sim! Dependendo do plano. Essencial = 1 servidor, Prime = 5 servidores, Elite = ilimitado.",
    },
    {
      q: "Como funciona o sistema de pagamento?",
      a: "Integramos com MercadoPago. Voce recebe os pagamentos diretamente na sua conta ou, se preferir, sistema de pagamento semi-automatico.",
    },
  ],

  images: {
    logo: "/icons/logo.png",
  },
};
