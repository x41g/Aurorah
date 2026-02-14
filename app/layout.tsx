import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'
import { Fredoka } from "next/font/google";
const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: 'Aurora - Gerenciamento de Tickets Discord',
  description: 'Aurora — Automatize as vendas do seu Discord',
  keywords: 'Discord, Bot, Tickets, Suporte, Pagamentos',
  icons: {
    icon: "/favicon.ico",
  },

  openGraph: {
    title: 'Auroxe Group — Aurora ',
    description: 'Cansado de gerenciar seu servidor manualmente? A Aurora é a melhor auxiliar de tickets e pagamentos definitivo para Discord, automatizando o suporte e vendas do seu servidor com facilidade. Experimente agora e transforme seu servidor!',
    url: 'https://auroxegroup.shop', // Coloque a URL real do seu site aqui
    siteName: '- Auroxe Group -',
    images: [
      {
        url: '/aurora.png', // A imagem deve estar na pasta 'public'
        width: 1200,
        height: 630,
        alt: 'Preview do Aurora Bot',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },

  // Importante para o card ficar grande no Discord e Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Auroxe Group — Aurora ',
    description: 'Cansado de gerenciar seu servidor manualmente? A Aurora é a melhor auxiliar de tickets e pagamentos definitivo para Discord, automatizando o suporte e vendas do seu servidor com facilidade. Experimente agora e transforme seu servidor!',
    images: ['/aurora.png'], // Mesma imagem do OpenGraph
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${fredoka.className} bg-slate-950 text-white transition-colors duration-300 dark:bg-slate-950 dark:text-white`}>
        <Providers>{children}</Providers> 
      </body>
    </html>
  )
}
