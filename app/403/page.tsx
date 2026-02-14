import Link from "next/link";

export default function Forbidden() {
  return (
    <main className="min-h-screen section">
      <div className="container-max">
        <div className="max-w-xl mx-auto card">
          <h1 className="text-3xl font-bold mb-2">403</h1>
          <p className="text-white/60 mb-6">Você não tem permissão para acessar esta página.</p>
          <Link href="/" className="btn-primary px-6 py-3 rounded-2xl">
            Voltar
          </Link>
        </div>
      </div>
    </main>
  );
}
