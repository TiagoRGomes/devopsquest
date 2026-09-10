import type { MaturityAxis, ProjectStep } from "@/lib/types";

export const PROJECT = {
  name: "CloudShop Platform",
  pitch:
    "Catálogo e pedidos de produtos de impressão 3D. Um produto pequeno o suficiente para você construir sozinho e completo o suficiente para exigir tudo o que uma vaga de DevOps pede.",
  stack: [
    "Vue 3",
    "Node.js",
    "PostgreSQL",
    "Docker",
    "Docker Compose",
    "GitHub Actions",
    "GHCR",
    "AWS",
    "Terraform",
    "Ansible",
    "Kubernetes",
    "Helm",
    "ArgoCD",
    "Prometheus",
    "Grafana",
    "OpenTelemetry",
  ],
  repos: [
    { name: "cloudshop-app", purpose: "Frontend Vue, API Node, testes, Dockerfiles e pipelines de CI." },
    { name: "cloudshop-infra", purpose: "Terraform (rede, compute, banco) e playbooks Ansible." },
    { name: "cloudshop-gitops", purpose: "Manifests Kubernetes por ambiente, sincronizados pelo ArgoCD." },
  ],
};

export const PROJECT_STEPS: ProjectStep[] = [
  { id: "ps-01", phase: "Fundação", title: "Repositórios e diário técnico", description: "Criar os três repositórios, README inicial, .gitignore e docs/diario.md.", stack: ["Git", "GitHub"], deliverable: "Três repositórios com README e diário iniciado", repo: "todos" },
  { id: "ps-02", phase: "Fundação", title: "Host preparado com systemd", description: "Usuário de serviço, diretórios, unit com restart automático e logs no journal.", stack: ["Linux", "systemd"], deliverable: "Serviço sobrevivendo a reboot e a falha", repo: "cloudshop-infra" },
  { id: "ps-03", phase: "Fundação", title: "API com /health e /ready", description: "Endpoints de saúde: /health sem dependências e /ready verificando o banco.", stack: ["Node"], deliverable: "Endpoints usados por proxy, Compose e Kubernetes", repo: "cloudshop-app" },
  { id: "ps-04", phase: "Fundação", title: "Nginx reverse proxy com TLS", description: "Proxy com cabeçalhos corretos, timeouts e HTTPS com renovação automática.", stack: ["Nginx", "Let's Encrypt"], deliverable: "api.cloudshop.dev respondendo por HTTPS", repo: "cloudshop-infra" },
  { id: "ps-05", phase: "Fundação", title: "Automação de plantão em Bash", description: "Health-check com retry e backup de logs com retenção, agendados por timer.", stack: ["Bash", "systemd"], deliverable: "Dois scripts com exit codes e restauração testada", repo: "cloudshop-infra" },
  { id: "ps-06", phase: "Fundação", title: "Main protegida e fluxo de PR", description: "Branch protection com revisão e checks obrigatórios; commits convencionais.", stack: ["GitHub"], deliverable: "Nenhum push direto na main", repo: "cloudshop-app" },
  { id: "ps-07", phase: "Containers", title: "Dockerfile multi-stage da API", description: "Cache otimizado, dependências de produção, usuário não-root e healthcheck.", stack: ["Docker"], deliverable: "Imagem menor que 200 MB e sem root", repo: "cloudshop-app" },
  { id: "ps-08", phase: "Containers", title: "Frontend Vue containerizado", description: "Build em estágio separado e Nginx servindo os estáticos.", stack: ["Vue", "Docker", "Nginx"], deliverable: "Imagem de frontend enxuta", repo: "cloudshop-app" },
  { id: "ps-09", phase: "Containers", title: "Stack completo em Compose", description: "Web, API e PostgreSQL com healthchecks, rede interna e volume persistente.", stack: ["Docker Compose"], deliverable: "docker compose up sobe tudo em máquina limpa", repo: "cloudshop-app" },
  { id: "ps-10", phase: "Containers", title: "Imagem endurecida e escaneada", description: "read-only, cap-drop, limites e Trivy sem crítico corrigível.", stack: ["Docker", "Trivy"], deliverable: "Checklist de segurança de container cumprido", repo: "cloudshop-app" },
  { id: "ps-11", phase: "Entrega", title: "CI de qualidade em PR", description: "Lint, testes unitários e de integração com service container, cache e concurrency.", stack: ["GitHub Actions"], deliverable: "Pipeline abaixo de 5 minutos bloqueando merge ruim", repo: "cloudshop-app" },
  { id: "ps-12", phase: "Entrega", title: "Publicação no GHCR com tag imutável", description: "metadata-action, build-push, digest registrado e labels OCI.", stack: ["Buildx", "GHCR"], deliverable: "Imagem rastreável até o commit", repo: "cloudshop-app" },
  { id: "ps-13", phase: "Entrega", title: "Deploy com rollback automático", description: "Verificação de saúde pós-deploy e reversão em falha, com RTO medido.", stack: ["GitHub Actions", "Bash"], deliverable: "RTO documentado no README", repo: "cloudshop-app" },
  { id: "ps-14", phase: "Nuvem", title: "VPC com camadas e SGs referenciados", description: "Subnets pública/privada em duas AZs, rotas e firewall por referência de SG.", stack: ["AWS VPC"], deliverable: "Banco inacessível da internet", repo: "cloudshop-infra" },
  { id: "ps-15", phase: "Nuvem", title: "Frontend em S3 + CloudFront", description: "Bucket privado com OAC, cache adequado e fallback de SPA.", stack: ["S3", "CloudFront"], deliverable: "Site com HTTPS e bucket fechado", repo: "cloudshop-infra" },
  { id: "ps-16", phase: "Nuvem", title: "RDS privado com backup testado", description: "Senha gerenciada em cofre, criptografia, retenção e restauração comprovada.", stack: ["RDS", "Secrets Manager"], deliverable: "Restauração validada em instância separada", repo: "cloudshop-infra" },
  { id: "ps-17", phase: "Nuvem", title: "IAM sem chaves estáticas + FinOps", description: "OIDC no pipeline, roles mínimas, tags obrigatórias e budget com alerta.", stack: ["IAM", "Budgets"], deliverable: "Zero chaves de longa duração e custo monitorado", repo: "cloudshop-infra" },
  { id: "ps-18", phase: "IaC", title: "Terraform com state remoto e dois ambientes", description: "Backend S3 com lock, módulo de rede reutilizado por dev e staging.", stack: ["Terraform"], deliverable: "plan limpo nos dois ambientes", repo: "cloudshop-infra" },
  { id: "ps-19", phase: "IaC", title: "Ansible idempotente e detecção de drift", description: "Playbook do host com changed=0 na segunda execução e plan agendado em CI.", stack: ["Ansible", "GitHub Actions"], deliverable: "Configuração reproduzível e drift monitorado", repo: "cloudshop-infra" },
  { id: "ps-20", phase: "Kubernetes", title: "CloudShop no cluster com Ingress", description: "Deployments, Services, ConfigMap, Secret e Ingress com TLS.", stack: ["Kubernetes"], deliverable: "Aplicação acessível por HTTPS no cluster", repo: "cloudshop-gitops" },
  { id: "ps-21", phase: "Kubernetes", title: "Probes, limites, HPA e RBAC", description: "Probes corretas, recursos dimensionados por medição, autoscaling e menor privilégio.", stack: ["Kubernetes"], deliverable: "Sem OOMKilled e sem reinício por probe", repo: "cloudshop-gitops" },
  { id: "ps-22", phase: "Kubernetes", title: "Chart Helm com rollback comprovado", description: "Chart próprio, values por ambiente, upgrade atômico e rollback medido.", stack: ["Helm"], deliverable: "Rollback executado com tempo registrado", repo: "cloudshop-gitops" },
  { id: "ps-23", phase: "GitOps + SRE", title: "ArgoCD com promoção por PR e segredos no cofre", description: "Auto-sync em staging, promoção revisada para produção, External Secrets.", stack: ["ArgoCD", "External Secrets"], deliverable: "Cluster reconciliado pelo Git, sem segredo no repositório", repo: "cloudshop-gitops" },
  { id: "ps-24", phase: "GitOps + SRE", title: "Observabilidade, SLO e projeto final", description: "Métricas, logs, traces, dashboard, alertas, SLO, postmortem, scans e documentação.", stack: ["Prometheus", "Grafana", "OpenTelemetry"], deliverable: "Projeto pronto para portfólio e entrevista", repo: "todos" },
];

export const MATURITY_AXES: MaturityAxis[] = [
  { axis: "Código e testes", weight: 10, description: "Lint, testes unitários e de integração, cobertura razoável e revisão obrigatória." },
  { axis: "Containers", weight: 10, description: "Multi-stage, imagem enxuta, não-root, read-only e healthcheck." },
  { axis: "Automação", weight: 10, description: "CI em PR, cache eficiente, publicação de artefato e rollback automatizado." },
  { axis: "Cloud", weight: 10, description: "Rede em camadas, serviços gerenciados, backups e identidade sem chaves estáticas." },
  { axis: "IaC", weight: 10, description: "Terraform com state remoto, módulos, ambientes e drift monitorado." },
  { axis: "Kubernetes", weight: 10, description: "Manifests corretos, probes, limites, RBAC e chart Helm versionado." },
  { axis: "GitOps", weight: 8, description: "Repositório de manifests como fonte da verdade, promoção por PR e rollback por revert." },
  { axis: "Observabilidade", weight: 10, description: "Métricas, logs estruturados, traces, dashboards e alertas acionáveis." },
  { axis: "Segurança", weight: 12, description: "Segredos em cofre, scans no pipeline, SBOM, assinatura e menor privilégio." },
  { axis: "Documentação", weight: 5, description: "README completo, ADRs, diagrama e runbooks utilizáveis por terceiros." },
  { axis: "Custo", weight: 5, description: "Tags, budget, custo medido por ambiente e otimizações justificadas." },
];

/** Cada etapa do projeto contribui para eixos de maturidade. */
export const STEP_AXES: Record<string, string[]> = {
  "ps-01": ["Documentação"],
  "ps-02": ["Cloud"],
  "ps-03": ["Código e testes", "Observabilidade"],
  "ps-04": ["Cloud", "Segurança"],
  "ps-05": ["Automação"],
  "ps-06": ["Código e testes"],
  "ps-07": ["Containers"],
  "ps-08": ["Containers"],
  "ps-09": ["Containers", "Automação"],
  "ps-10": ["Containers", "Segurança"],
  "ps-11": ["Código e testes", "Automação"],
  "ps-12": ["Automação"],
  "ps-13": ["Automação", "Observabilidade"],
  "ps-14": ["Cloud", "Segurança"],
  "ps-15": ["Cloud"],
  "ps-16": ["Cloud", "Segurança"],
  "ps-17": ["Segurança", "Custo"],
  "ps-18": ["IaC"],
  "ps-19": ["IaC", "Automação"],
  "ps-20": ["Kubernetes"],
  "ps-21": ["Kubernetes", "Observabilidade"],
  "ps-22": ["Kubernetes", "GitOps"],
  "ps-23": ["GitOps", "Segurança"],
  "ps-24": ["Observabilidade", "Documentação", "Custo"],
};

export function maturityScore(completedStepIds: string[]) {
  const achieved: Record<string, number> = {};
  const possible: Record<string, number> = {};

  for (const step of PROJECT_STEPS) {
    const axes = STEP_AXES[step.id] ?? [];
    for (const axis of axes) {
      possible[axis] = (possible[axis] ?? 0) + 1;
      if (completedStepIds.includes(step.id)) achieved[axis] = (achieved[axis] ?? 0) + 1;
    }
  }

  const perAxis = MATURITY_AXES.map((a) => {
    const total = possible[a.axis] ?? 1;
    const done = achieved[a.axis] ?? 0;
    return { ...a, score: Math.round((done / total) * 100) };
  });

  const totalWeight = MATURITY_AXES.reduce((acc, a) => acc + a.weight, 0);
  const overall = Math.round(
    perAxis.reduce((acc, a) => acc + (a.score * a.weight) / 100, 0) * (100 / totalWeight),
  );

  return { perAxis, overall };
}
