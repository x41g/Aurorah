import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen section">
      <div className="container-max">
        <div className="max-w-xl mx-auto card">
          <h1 className="text-3xl font-bold mb-2">404</h1>
          <p className="text-white/60 mb-6">Página não encontrada.</p>
          <Link href="/" className="btn-primary px-6 py-3 rounded-2xl">
            Voltar
          </Link>
        </div>
      </div>
    </main>
  );
}
