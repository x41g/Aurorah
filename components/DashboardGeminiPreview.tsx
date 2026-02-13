"use client";

import React, { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  ChevronRight,
  Hash,
  Check,
} from "lucide-react";

// --- CONFIGURAÇÃO DE IMAGENS ---
// (pode trocar por links ou por arquivos do /public usando "/clients/..." etc)
const SERVER_ICON_URL =
  "https://r2.e-z.host/3b4c067b-8d6b-4b6c-ba63-092e2cbda5d5/w549dsk7.png";
const BOT_AVATAR_URL =
  "https://r2.e-z.host/3b4c067b-8d6b-4b6c-ba63-092e2cbda5d5/ryvpm8e6.png";
const LOOP_IMAGE_URL =
  "https://r2.e-z.host/3b4c067b-8d6b-4b6c-ba63-092e2cbda5d5/w549dsk7.png";

type PaymentStatus = "pending" | "processing" | "paid";

type SystemMsg = {
  id: number;
  author: string;
  role: "system";
  text: string;
  category: string;
};

type BotMsg = {
  id: number;
  author: string;
  role: "bot";
  text: string;
};

type PaymentMsg = {
  id: number;
  author: string;
  role: "bot";
  type: "payment";
  amount: string;
  desc: string;
};

type Msg = SystemMsg | BotMsg | PaymentMsg;

export default function DashboardGeminiPreview() {
  const [scene, setScene] = useState(0);

  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");

  useEffect(() => {
    let timeout: number | undefined;

    const runSequence = async () => {
      // --- CENA 1: Criação do Ticket (0s - 1.5s)
      if (scene === 0) {
        setMessages([]);
        setPaymentStatus("pending");

        timeout = window.setTimeout(() => {
          setMessages([
            {
              id: 1,
              author: "System",
              role: "system",
              text: 'Ticket #2077 criado: "Sucesso na integração"',
              category: "Suporte Premium",
            },
          ]);
          setScene(1);
        }, 1500);
      }

      // --- CENA 2: Resposta IA (1.5s - 3.5s)
      else if (scene === 1) {
        setIsTyping(true);
        timeout = window.setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: 2,
              author: "Aurora IA",
              role: "bot",
              text: "Olá! Agradeço a preferência! Um atendente logo chegará para atender você, enquanto isso eu vou tirar sua dúvidas. Enquanto um humano não chega, podemos prosseguir com o pagamento?",
            },
          ]);
          setScene(2);
        }, 2000);
      }

      // --- CENA 3: Pagamento (3.5s - 6s)
      else if (scene === 2) {
        timeout = window.setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: 3,
              author: "Aurora IA",
              role: "bot",
              type: "payment",
              amount: "R$ 19,90",
              desc: "Compra Prioritária",
            },
          ]);

          // Simular clique e processamento
          window.setTimeout(() => {
            setPaymentStatus("processing");
            window.setTimeout(() => {
              setPaymentStatus("paid");
              window.setTimeout(() => setScene(3), 1000);
            }, 800);
          }, 800);
        }, 500);
      }

      // --- CENA 4: Frase Final (6s - 8s)
      else if (scene === 3) {
        timeout = window.setTimeout(() => {
          setScene(0);
        }, 2500);
      }
    };

    runSequence();
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [scene]);

  // ✅ DIFERENÇA PRINCIPAL:
  // Aqui é "thumbnail embutida": ocupa 100% do container pai (sem min-h-screen, sem p-4)
  return (
    <div className="w-full h-full bg-slate-950 font-sans text-slate-100 overflow-hidden relative">
      {/* BACKGROUND ANIMADO */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[700px] h-[700px] bg-purple-600/15 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* Main Container - ocupa o pai inteiro */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row ring-1 ring-white/10 z-10">
        {/* CENA 4 OVERLAY */}
        <div
          className={`absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
            scene === 3
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <div className="text-center space-y-6 animate-float">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full" />
              <img
                src={LOOP_IMAGE_URL}
                alt="Brand Logo"
                className="w-20 h-20 md:w-24 md:h-24 object-contain relative z-10 drop-shadow-2xl"
              />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-slate-400 bg-clip-text text-transparent">
                Automatize seu atendimento no <br /> Discord.
              </h1>
              <p className="text-slate-400 text-sm md:text-lg font-medium">
                Tickets + IA + Pagamentos
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Esquerda (Servers) */}
        <div className="hidden md:flex flex-col items-center w-16 bg-slate-950/50 py-4 gap-4 border-r border-white/5 z-20">
          <div className="group relative">
            <img
              src={SERVER_ICON_URL}
              alt="Logo do Servidor"
              className="w-10 h-10 rounded-[12px] shadow-lg shadow-indigo-500/20 transition-all hover:rounded-[10px] cursor-pointer object-cover"
            />
            <div className="absolute left-[-18px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full" />
          </div>

          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer group hover:rounded-[12px]">
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200">
              Arx
            </span>
          </div>
          <div className="w-8 h-0.5 bg-slate-800 rounded-full mx-auto" />
        </div>

        {/* Sidebar Meio (Canais) */}
        <div className="hidden md:flex flex-col w-56 bg-slate-900/50 border-r border-white/5 p-4 z-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-sm text-slate-200">Sua Loja</h2>
            <ChevronRight size={14} className="text-slate-500" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded text-slate-400 hover:bg-slate-800/50 cursor-pointer group transition-colors">
              <Hash size={16} className="text-slate-500 group-hover:text-slate-400" />
              <span className="text-sm font-medium">👋 boas-vindas</span>
            </div>

            <div className="flex items-center gap-2 px-2 py-1.5 rounded text-slate-400 hover:bg-slate-800/50 cursor-pointer group transition-colors">
              <Hash size={16} className="text-slate-500 group-hover:text-slate-400" />
              <span className="text-sm font-medium">🎫 abrir-ticket</span>
            </div>

            <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-indigo-500/10 text-indigo-300 cursor-pointer border-l-2 border-indigo-500">
              <MessageSquare size={16} />
              <span className="text-sm font-medium">ticket-2077</span>
            </div>
          </div>
        </div>

        {/* Área Principal (Chat) */}
        <div className="flex-1 flex flex-col bg-slate-900 relative">
          {/* Header */}
          <div className="h-14 border-b border-white/5 flex items-center px-6 gap-3 shadow-sm z-10 bg-slate-900/90 backdrop-blur">
            <Hash size={20} className="text-slate-400" />
            <div className="flex flex-col">
              <span className="font-bold text-slate-100 text-sm">
                ticket-2077
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                Suporte / Pedido
              </span>
            </div>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 p-6 space-y-6 overflow-hidden flex flex-col justify-end pb-8">
            {messages.length > 0 && (
              <div className="animate-fade-in-up">
                <div className="flex items-start gap-3 opacity-60 mb-4">
                  <div className="w-full border-t border-slate-700/50 mt-3 relative">
                    <span className="absolute top-[-10px] left-1/2 -translate-x-1/2 bg-slate-900 px-2 text-xs text-slate-500">
                      Hoje às 14:30
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg max-w-xl shadow-sm">
                  <div className="bg-indigo-500 h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-indigo-200">
                      {(messages[0] as SystemMsg).category}
                    </p>
                    <p className="text-sm text-slate-300 mt-1">
                      {(messages[0] as SystemMsg).text}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-500 text-sm animate-pulse ml-12">
                <span className="text-xs">Aurora IA está digitando...</span>
              </div>
            )}

            {messages.length > 1 && (
              <div className="flex items-start gap-4 animate-fade-in-up delay-75">
                <img
                  src={BOT_AVATAR_URL}
                  alt="Bot Avatar"
                  className="w-10 h-10 rounded-full shadow-lg shadow-indigo-500/20 shrink-0 object-cover bg-slate-800 ring-2 ring-indigo-500/20"
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-100">Aurora IA</span>

                    <span className="bg-[#5865F2] flex items-center gap-[3px] text-[10px] px-1.5 py-[1px] rounded-[4px] text-white font-bold h-[15px] shadow-[0_2px_4px_rgba(88,101,242,0.4)]">
                      <Check size={8} strokeWidth={4} />
                      BOT
                    </span>

                    <span className="text-xs text-slate-500 ml-1">
                      Hoje às 14:30
                    </span>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
                    {(messages[1] as BotMsg).text}
                  </p>
                </div>
              </div>
            )}

            {messages.length > 2 && (
              <div className="ml-14 animate-fade-in-up delay-100">
                <div
                  className={`
                    w-72 rounded-lg border-l-4 p-4 transition-all duration-500 relative overflow-hidden
                    ${
                      paymentStatus === "paid"
                        ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] scale-[1.02]"
                        : "bg-slate-800 border-indigo-500"
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2 relative z-10">
                    <h3 className="font-bold text-sm text-slate-200">
                      Pedido #9920
                    </h3>

                    {paymentStatus === "paid" ? (
                      <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold px-2 py-1 bg-emerald-500/10 rounded-full animate-bounce-short">
                        <CheckCircle2 size={12} /> PAGO
                      </div>
                    ) : (
                      <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full font-bold">
                        PENDENTE
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mb-4 relative z-10">
                    {(messages[2] as PaymentMsg).desc}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 relative z-10">
                    <span className="font-mono text-slate-200 font-bold">
                      {(messages[2] as PaymentMsg).amount}
                    </span>

                    <button
                      className={`
                        px-4 py-1.5 rounded text-xs font-bold transition-all duration-300 flex items-center gap-2 overflow-hidden relative
                        ${
                          paymentStatus === "paid"
                            ? "bg-emerald-500 text-white cursor-default shadow-lg shadow-emerald-500/20"
                            : paymentStatus === "processing"
                            ? "bg-slate-600 text-slate-300 cursor-wait"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                        }
                      `}
                    >
                      {paymentStatus === "pending" && (
                        <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                      )}

                      {paymentStatus === "paid" && <CheckCircle2 size={12} />}
                      {paymentStatus === "processing" && "Processando..."}
                      {paymentStatus === "pending" && (
                        <>
                          <CreditCard size={12} />
                          Pagar Agora
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area (Fake) */}
          <div className="h-16 px-4 bg-slate-900 mb-2">
            <div className="w-full h-10 bg-slate-800/50 rounded-lg flex items-center px-4 text-slate-500 text-sm border border-transparent hover:border-white/5 transition-colors">
              Enviar mensagem para #ticket-2077
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes shimmer { 100% { left: 100%; } }
        .animate-shimmer { animation: shimmer 2s infinite; }

        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-short { animation: bounce-short 0.3s ease-in-out; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
