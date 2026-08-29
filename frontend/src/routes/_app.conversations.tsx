import { createFileRoute } from "@tanstack/react-router";
import { ConversationsPage } from "@/pages/Conversations/ConversationsPage";
export const Route = createFileRoute("/_app/conversations")({ component: ConversationsPage });
