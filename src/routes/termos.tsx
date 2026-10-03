import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/components/LegalDocument";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Serviço — DevOpsQuest" },
      {
        name: "description",
        content:
          "Termos de Serviço do DevOpsQuest: regras de uso da plataforma, conta, comunidade, certificados e limitações.",
      },
      { property: "og:title", content: "Termos de Serviço — DevOpsQuest" },
      {
        property: "og:description",
        content: "Regras de uso da plataforma educacional DevOpsQuest.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <main className="px-4 py-8 sm:px-6">
      <LegalDocument doc="terms" />
    </main>
  );
}
