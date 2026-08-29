import { createFileRoute } from "@tanstack/react-router";
import { SecurityPage } from "@/pages/Security/SecurityPage";
export const Route = createFileRoute("/_app/security")({ component: SecurityPage });
