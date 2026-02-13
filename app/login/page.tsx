import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { LoginButton } from "@/components/dashboard/LoginButton";

export default async function LoginPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (session?.accessToken) redirect("/dashboard");

  return (
    <main className="min-h-screen section">
      <div className="container-max">
        <div className="max-w-xl mx-auto">
          <div className="card">
            <h1 className="text-3xl font-bold mb-2">Entrar</h1>
            <p className="text-white/60 mb-6">
              Faça login com o Discord para configurar seus servidores e ver estatísticas.
            </p>
            <LoginButton />
          </div>
        </div>
      </div>
    </main>
  );
}
