import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="container-max py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
        
        <div>
          © {new Date().getFullYear()} Aurora — Auroxe Group. Todos os direitos reservados.
        </div>

        <div className="flex items-center gap-6">
          <Link href="/terms" className="hover:text-white transition">
            Termos
          </Link>

          <Link href="/privacy" className="hover:text-white transition">
            Privacidade
          </Link>

          <Link href="/status" className="hover:text-white transition">
            Status
          </Link>
        </div>
      </div>
    </footer>
  );
}
