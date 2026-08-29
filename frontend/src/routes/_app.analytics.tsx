import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsPage } from "@/pages/Analytics/AnalyticsPage";
export const Route = createFileRoute("/_app/analytics")({ component: AnalyticsPage });
