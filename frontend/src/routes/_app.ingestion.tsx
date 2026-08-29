import { createFileRoute } from "@tanstack/react-router";
import { IngestionPage } from "@/pages/Ingestion/IngestionPage";
export const Route = createFileRoute("/_app/ingestion")({ component: IngestionPage });
