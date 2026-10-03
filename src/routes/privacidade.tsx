import { createFileRoute } from "@tanstack/react-router";
import { LegalDocument } from "@/components/LegalDocument";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — DevOpsQuest" },
      {
        name: "description",
        content:
          "Política de Privacidade do DevOpsQuest: dados coletados, uso, compartilhamento, segurança e seus direitos (LGPD e GDPR).",
      },
      { property: "og:title", content: "Política de Privacidade — DevOpsQuest" },
      {
        property: "og:description",
        content: "Como o DevOpsQuest coleta, usa e protege os seus dados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <main className="px-4 py-8 sm:px-6">
      <LegalDocument doc="privacy" />
    </main>
  );
}
