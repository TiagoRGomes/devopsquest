export interface Resource {
  category: string;
  title: string;
  description: string;
  url: string;
  kind: "Documentação" | "Ferramenta" | "Leitura" | "Prática";
}

export const RESOURCES: Resource[] = [
  { category: "Linux", title: "Documentação do systemd", description: "Referência oficial de units, timers e journal.", url: "https://www.freedesktop.org/software/systemd/man/latest/", kind: "Documentação" },
  { category: "Linux", title: "ExplainShell", description: "Cole um comando e veja o significado de cada flag.", url: "https://explainshell.com/", kind: "Ferramenta" },
  { category: "Bash", title: "ShellCheck", description: "Linter de Bash que encontra bugs de quoting e lógica.", url: "https://www.shellcheck.net/", kind: "Ferramenta" },
  { category: "Redes", title: "MDN — HTTP", description: "Métodos, status, cabeçalhos e cache explicados com precisão.", url: "https://developer.mozilla.org/pt-BR/docs/Web/HTTP", kind: "Documentação" },
  { category: "Redes", title: "SSL Labs Server Test", description: "Auditoria de configuração TLS de um domínio.", url: "https://www.ssllabs.com/ssltest/", kind: "Ferramenta" },
  { category: "Nginx", title: "Documentação do Nginx", description: "Diretivas de proxy, timeouts e upstream.", url: "https://nginx.org/en/docs/", kind: "Documentação" },
  { category: "Git", title: "Pro Git (livro completo, em português)", description: "A referência definitiva sobre Git, gratuita.", url: "https://git-scm.com/book/pt-br/v2", kind: "Leitura" },
  { category: "Docker", title: "Boas práticas de Dockerfile", description: "Cache, camadas, tamanho e segurança de imagem.", url: "https://docs.docker.com/build/building/best-practices/", kind: "Documentação" },
  { category: "Docker", title: "Trivy", description: "Scanner de vulnerabilidades para imagens, IaC e dependências.", url: "https://trivy.dev/", kind: "Ferramenta" },
  { category: "CI/CD", title: "GitHub Actions — documentação", description: "Workflows, contexts, cache, OIDC e ambientes.", url: "https://docs.github.com/actions", kind: "Documentação" },
  { category: "CI/CD", title: "act", description: "Rodar workflows do GitHub Actions localmente.", url: "https://github.com/nektos/act", kind: "Ferramenta" },
  { category: "AWS", title: "AWS Well-Architected Framework", description: "Os pilares que orientam decisões de arquitetura na nuvem.", url: "https://aws.amazon.com/architecture/well-architected/", kind: "Leitura" },
  { category: "AWS", title: "AWS Pricing Calculator", description: "Estimar custo antes de provisionar.", url: "https://calculator.aws/", kind: "Ferramenta" },
  { category: "Terraform", title: "Terraform Registry", description: "Providers e módulos oficiais e comunitários.", url: "https://registry.terraform.io/", kind: "Documentação" },
  { category: "Terraform", title: "tfsec / Trivy config", description: "Análise estática de configuração insegura em IaC.", url: "https://github.com/aquasecurity/tfsec", kind: "Ferramenta" },
  { category: "Ansible", title: "Documentação do Ansible", description: "Módulos, roles, inventário dinâmico e boas práticas.", url: "https://docs.ansible.com/", kind: "Documentação" },
  { category: "Kubernetes", title: "Kubernetes — conceitos", description: "Documentação oficial, com tradução parcial em português.", url: "https://kubernetes.io/pt-br/docs/concepts/", kind: "Documentação" },
  { category: "Kubernetes", title: "Kind", description: "Cluster Kubernetes em Docker, ideal para estudo e CI.", url: "https://kind.sigs.k8s.io/", kind: "Ferramenta" },
  { category: "Kubernetes", title: "Helm", description: "Empacotamento e versionamento de releases no cluster.", url: "https://helm.sh/docs/", kind: "Documentação" },
  { category: "GitOps", title: "ArgoCD", description: "Documentação de Applications, sync, projetos e RBAC.", url: "https://argo-cd.readthedocs.io/", kind: "Documentação" },
  { category: "GitOps", title: "External Secrets Operator", description: "Sincronizar segredos de cofres para o cluster.", url: "https://external-secrets.io/", kind: "Ferramenta" },
  { category: "Observabilidade", title: "Prometheus — PromQL", description: "Referência de funções e operadores de consulta.", url: "https://prometheus.io/docs/prometheus/latest/querying/basics/", kind: "Documentação" },
  { category: "Observabilidade", title: "OpenTelemetry", description: "Instrumentação vendor-neutral de métricas, logs e traces.", url: "https://opentelemetry.io/docs/", kind: "Documentação" },
  { category: "SRE", title: "Google SRE Book (gratuito)", description: "A origem de SLO, error budget e cultura de postmortem.", url: "https://sre.google/books/", kind: "Leitura" },
  { category: "SRE", title: "SLO Workbook", description: "Como definir SLIs e SLOs úteis na prática.", url: "https://sre.google/workbook/implementing-slos/", kind: "Leitura" },
  { category: "Segurança", title: "OWASP Top 10", description: "Riscos mais comuns em aplicações web.", url: "https://owasp.org/www-project-top-ten/", kind: "Leitura" },
  { category: "Segurança", title: "gitleaks", description: "Detecção de segredos em código e histórico do Git.", url: "https://github.com/gitleaks/gitleaks", kind: "Ferramenta" },
  { category: "Segurança", title: "Sigstore / cosign", description: "Assinatura e verificação de artefatos de software.", url: "https://docs.sigstore.dev/", kind: "Ferramenta" },
  { category: "Carreira", title: "DORA — métricas de entrega", description: "Frequência de deploy, lead time, MTTR e taxa de falha.", url: "https://dora.dev/", kind: "Leitura" },
  { category: "Carreira", title: "Roadmap DevOps", description: "Mapa visual de tópicos para acompanhar sua evolução.", url: "https://roadmap.sh/devops", kind: "Leitura" },
];

export const RESOURCE_CATEGORIES = Array.from(new Set(RESOURCES.map((r) => r.category)));
