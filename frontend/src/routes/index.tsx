import { createFileRoute } from "@tanstack/react-router";
import { SplashPage } from "@/pages/Splash/SplashPage";

export const Route = createFileRoute("/")({
  component: SplashPage,
});
