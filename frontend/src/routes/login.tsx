import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/Login/LoginPage";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});
