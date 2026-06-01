import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (sessionId) {
      setStatus("success");
    } else {
      setStatus("error");
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        {status === "loading" && (
          <div className="animate-pulse">
            <div className="w-16 h-16 mx-auto border-4 border-gold-400/20 border-t-gold-400 rounded-full animate-spin" />
            <p className="mt-6 text-white/60">Processando seu pagamento...</p>
          </div>
        )}

        {status === "success" && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold-400/10 border-2 border-gold-400 mb-8">
              <svg className="w-10 h-10 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="font-display text-5xl font-light mb-4">
              Pagamento <span className="text-gold-gradient italic">confirmado!</span>
            </h1>

            <p className="text-xl text-white/70 mb-8">
              Obrigado pela sua compra. Você receberá um e-mail em instantes com o link para download.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
              <h2 className="text-lg font-medium mb-4 text-gold-400">📧 O que acontece agora?</h2>
              <ul className="space-y-3 text-left text-white/80">
                <li className="flex gap-3">
                  <span className="text-gold-400">✓</span>
                  <span>Você receberá um e-mail com o link de download</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gold-400">✓</span>
                  <span>O link será válido por 30 dias</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gold-400">✓</span>
                  <span>Você foi adicionado à nossa newsletter exclusiva</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gold-400">✓</span>
                  <span>Acesse os 7 ebooks em PDF imediatamente</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <a
                href="/"
                className="inline-block bg-gold-400 text-black px-8 py-4 rounded-full font-semibold hover:bg-gold-300 transition-colors"
              >
                Voltar ao início
              </a>

              <p className="text-sm text-white/50">
                Não recebeu o e-mail? Verifique sua caixa de spam ou{" "}
                <a href="mailto:contato@dozeroaomilhao.com" className="text-gold-400 hover:underline">
                  entre em contato
                </a>
              </p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500 mb-8">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h1 className="font-display text-5xl font-light mb-4">
              Ops! Algo deu <span className="text-red-500 italic">errado</span>
            </h1>

            <p className="text-xl text-white/70 mb-8">
              Não conseguimos processar seu pagamento. Tente novamente ou entre em contato.
            </p>

            <a
              href="/"
              className="inline-block bg-gold-400 text-black px-8 py-4 rounded-full font-semibold hover:bg-gold-300 transition-colors"
            >
              Voltar ao início
            </a>
          </>
        )}
      </div>
    </div>
  );
}
