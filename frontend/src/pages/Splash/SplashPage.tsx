import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Brain } from "lucide-react";

export function SplashPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/login" }), 2400);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden grid-bg flex items-center justify-center">
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        preserveAspectRatio="none"
        viewBox="0 0 800 600"
      >
        <defs>
          <linearGradient id="line" x1="0" x2="1">
            <stop offset="0" stopColor="oklch(0.745 0.135 210)" stopOpacity="0" />
            <stop offset="0.5" stopColor="oklch(0.745 0.135 210)" stopOpacity="0.7" />
            <stop offset="1" stopColor="oklch(0.555 0.22 264)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 14 }).map((_, i) => {
          const x1 = (i * 67) % 800,
            y1 = (i * 113) % 600;
          const x2 = (i * 199) % 800,
            y2 = (i * 251) % 600;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#line)" strokeWidth="1" />
          );
        })}
        {Array.from({ length: 24 }).map((_, i) => (
          <circle
            key={i}
            cx={(i * 71) % 800}
            cy={(i * 137) % 600}
            r="2"
            fill="oklch(0.745 0.135 210)"
            opacity="0.6"
          />
        ))}
      </svg>

      <div className="relative animate-fade-up text-center">
        <div className="relative mx-auto h-24 w-24">
          <span className="absolute inset-0 rounded-2xl bg-primary/30 animate-pulse-ring" />
          <span className="absolute inset-0 rounded-2xl bg-cyan-accent/20 animate-pulse-ring [animation-delay:0.6s]" />
          <div className="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-cyan-accent grid place-items-center shadow-glow">
            <Brain className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="mt-8 text-4xl md:text-5xl font-semibold tracking-tight">
          <span className="text-gradient">KnowRAG</span> Enterprise
        </h1>
        <p className="mt-3 text-muted-foreground text-sm tracking-wide">
          Intelligence des connaissances sécurisée pour l'entreprise
        </p>
        <div className="mt-10 mx-auto h-1 w-48 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-cyan-accent animate-[shimmer_1.6s_linear_infinite]"
            style={{ backgroundSize: "200% 100%" }}
          />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Initialisation de la session sécurisée…
        </p>
      </div>
    </div>
  );
}
