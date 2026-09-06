import type { BadgeDef, LevelTier, Region, Skill } from "@/lib/types";

export const XP_RULES = [
  { action: "Ler uma aula", xp: 10 },
  { action: "Concluir uma aula", xp: 25 },
  { action: "Acertar o quiz", xp: 15 },
  { action: "Concluir um laboratório", xp: 100 },
  { action: "Concluir um desafio", xp: 250 },
  { action: "Projeto do módulo", xp: 500 },
  { action: "Módulo completo", xp: 1000 },
  { action: "Streak de 7 dias", xp: 300 },
  { action: "Semana concluída", xp: 200 },
  { action: "Boss Battle", xp: 750 },
  { action: "Projeto final PrintQuest", xp: 5000 },
];

export const LEVEL_TIERS: LevelTier[] = [
  { from: 1, to: 5, className: "Aprendiz de Infraestrutura" },
  { from: 6, to: 10, className: "Operador Linux" },
  { from: 11, to: 15, className: "Automatizador de Sistemas" },
  { from: 16, to: 20, className: "Container Builder" },
  { from: 21, to: 25, className: "Cloud Explorer" },
  { from: 26, to: 30, className: "IaC Builder" },
  { from: 31, to: 35, className: "Kubernetes Operator" },
  { from: 36, to: 40, className: "GitOps Engineer" },
  { from: 41, to: 45, className: "SRE Guardian" },
  { from: 46, to: 50, className: "DevOps Professional" },
];

/** XP necessário acumulado para atingir cada nível (1..50). */
export const XP_PER_LEVEL = Array.from({ length: 50 }, (_, i) => {
  const level = i + 1;
  return Math.round(600 * (level - 1) + 40 * Math.pow(level - 1, 2));
});

export function levelFromXp(xp: number) {
  let level = 1;
  for (let i = 0; i < XP_PER_LEVEL.length; i++) {
    if (xp >= XP_PER_LEVEL[i]) level = i + 1;
  }
  const currentFloor = XP_PER_LEVEL[level - 1];
  const nextFloor = XP_PER_LEVEL[Math.min(level, XP_PER_LEVEL.length - 1)];
  const tier = LEVEL_TIERS.find((t) => level >= t.from && level <= t.to) ?? LEVEL_TIERS[0];
  const span = Math.max(nextFloor - currentFloor, 1);
  return {
    level,
    className: tier.className,
    xpIntoLevel: xp - currentFloor,
    xpForNext: span,
    progress: Math.min(100, Math.round(((xp - currentFloor) / span) * 100)),
    nextLevelXp: nextFloor,
  };
}

export const REGIONS: Region[] = [
  {
    id: "vila-terminal",
    name: "Vila do Terminal",
    order: 1,
    theme: "Linux e sistemas",
    description:
      "O ponto de partida de toda carreira DevOps: shell, permissões, processos, systemd e logs. Quem não domina a Vila apanha em produção para sempre.",
    moduleIds: ["mod-0", "mod-1"],
    quest: "Escrever um runbook com 30 comandos e controlar um serviço systemd do início ao fim.",
    badge: "Terminal Apprentice",
    labId: "lab-1-1",
    bossId: "boss-processo-zumbi",
    xp: 2000,
    requiredLevel: 1,
  },
  {
    id: "floresta-redes",
    name: "Floresta das Redes",
    order: 2,
    theme: "Redes, HTTP e Nginx",
    description:
      "DNS que não resolve, porta fechada, TLS expirado e um Nginx devolvendo 502. A floresta ensina a ler o caminho do pacote até a aplicação.",
    moduleIds: ["mod-2"],
    quest: "Publicar uma API com /health atrás de um reverse proxy Nginx e diagnosticar 502/503/504.",
    badge: "Nginx Defender",
    labId: "lab-2-1",
    bossId: "boss-dragao-502",
    xp: 1500,
    requiredLevel: 6,
  },
  {
    id: "reino-codigo",
    name: "Reino do Código",
    order: 3,
    theme: "Git, GitHub e Bash",
    description:
      "Branches, PRs, rebase, revert e automação de tarefas repetitivas com Bash. Onde o trabalho em equipe começa a existir de verdade.",
    moduleIds: ["mod-3"],
    quest: "Proteger a branch main e automatizar health-check e backup de logs com Bash.",
    badge: "Git Guardian",
    labId: "lab-3-1",
    bossId: "boss-conflito-merge",
    xp: 1500,
    requiredLevel: 9,
  },
  {
    id: "vale-containers",
    name: "Vale dos Containers",
    order: 4,
    theme: "Docker e Compose",
    description:
      "Empacotar a aplicação de forma reprodutível: imagens enxutas, multi-stage, volumes, redes e um stack inteiro subindo com um comando.",
    moduleIds: ["mod-4"],
    quest: "Subir Vue + API Node + PostgreSQL com Docker Compose e imagem final sem root.",
    badge: "Container Architect",
    labId: "lab-4-1",
    bossId: "boss-crashloop-container",
    xp: 2000,
    requiredLevel: 13,
  },
  {
    id: "fortaleza-cicd",
    name: "Fortaleza CI/CD",
    order: 5,
    theme: "GitHub Actions",
    description:
      "A fortaleza que impede código quebrado de chegar à produção: lint, testes, build, cache, secrets, registry e rollback.",
    moduleIds: ["mod-5"],
    quest: "CI obrigatório em PR e publicação de imagens com tag imutável no GHCR.",
    badge: "Pipeline Builder",
    labId: "lab-5-1",
    bossId: "boss-pipeline-quebrado",
    xp: 2000,
    requiredLevel: 17,
  },
  {
    id: "imperio-cloud",
    name: "Império Cloud",
    order: 6,
    theme: "AWS e segurança",
    description:
      "IAM, VPC, subnets, Security Groups, EC2, S3, RDS, ALB, CloudFront e — o que ninguém ensina — controle de custos.",
    moduleIds: ["mod-6"],
    quest: "Deploy seguro na AWS com orçamento configurado e checklist de destruição.",
    badge: "Cloud Explorer",
    labId: "lab-6-1",
    bossId: "boss-security-group",
    xp: 3500,
    requiredLevel: 21,
  },
  {
    id: "terra-iac",
    name: "Terra IaC",
    order: 7,
    theme: "Terraform e Ansible",
    description:
      "Infraestrutura descrita em código, versionada e revisável. State remoto, módulos, ambientes e combate ao drift.",
    moduleIds: ["mod-7"],
    quest: "Provisionar dev e staging com Terraform e configurar o host com Ansible idempotente.",
    badge: "Infrastructure Mage",
    labId: "lab-7-1",
    bossId: "boss-drift-terraform",
    xp: 3500,
    requiredLevel: 26,
  },
  {
    id: "montanhas-k8s",
    name: "Montanhas Kubernetes",
    order: 8,
    theme: "Kubernetes e Helm",
    description:
      "Pods, Deployments, Services, Ingress, probes, limites, RBAC e charts Helm. O terreno onde o Platform Engineer nasce.",
    moduleIds: ["mod-8"],
    quest: "Rodar o PrintQuest em Kind com Helm e validar um rollback real.",
    badge: "Kubernetes Operator",
    labId: "lab-8-1",
    bossId: "boss-crashloopbackoff",
    xp: 3000,
    requiredLevel: 31,
  },
  {
    id: "portal-gitops",
    name: "Portal GitOps",
    order: 9,
    theme: "ArgoCD",
    description:
      "O Git passa a ser a fonte da verdade. Sync, auto-sync, detecção de drift, histórico e rollback por commit.",
    moduleIds: ["mod-9"],
    quest: "Sincronizar o cluster com o repositório GitOps via ArgoCD.",
    badge: "GitOps Keeper",
    labId: "lab-9-1",
    bossId: "boss-out-of-sync",
    xp: 1500,
    requiredLevel: 36,
  },
  {
    id: "torre-confiabilidade",
    name: "Torre da Confiabilidade",
    order: 10,
    theme: "Observabilidade, SRE, DevSecOps e FinOps",
    description:
      "Métricas, logs, traces, SLO, error budget, alertas úteis, postmortem sem culpa, segurança da cadeia de suprimentos e custo sob controle.",
    moduleIds: ["mod-10", "mod-11"],
    quest: "Publicar dashboard, alertas, SLO, runbook e postmortem de um incidente real.",
    badge: "SRE Guardian",
    labId: "lab-10-1",
    bossId: "boss-queda-producao",
    xp: 5500,
    requiredLevel: 41,
  },
];

export const SKILL_TREES = [
  "Fundamentos",
  "Containers e Automação",
  "Cloud e IaC",
  "Kubernetes e Plataforma",
  "SRE",
  "Segurança e FinOps",
] as const;

export const SKILLS: Skill[] = [
  // Fundamentos
  { id: "sk-linux", tree: "Fundamentos", name: "Linux essencial", description: "Filesystem, permissões, usuários e processos.", xp: 300, requires: [], lessonIds: ["l-1-1", "l-1-2"], reward: "Badge Linux Navigator" },
  { id: "sk-logs", tree: "Fundamentos", name: "Leitura de logs", description: "journalctl, /var/log, grep e correlação por timestamp.", xp: 250, requires: ["sk-linux"], lessonIds: ["l-1-4"], reward: "Badge Log Hunter" },
  { id: "sk-ssh", tree: "Fundamentos", name: "SSH e acesso remoto", description: "Chaves, agente, hardening e túneis.", xp: 250, requires: ["sk-linux"], lessonIds: ["l-1-5"], reward: "+250 XP" },
  { id: "sk-dns", tree: "Fundamentos", name: "DNS", description: "Registros, TTL, resolução e propagação.", xp: 250, requires: [], lessonIds: ["l-2-2"], reward: "Badge DNS Detective" },
  { id: "sk-http", tree: "Fundamentos", name: "HTTP e TLS", description: "Métodos, status, headers, handshake e certificados.", xp: 300, requires: ["sk-dns"], lessonIds: ["l-2-3", "l-2-4"], reward: "+300 XP" },
  { id: "sk-git", tree: "Fundamentos", name: "Git profissional", description: "Branches, PR, rebase, revert, tags e releases.", xp: 300, requires: [], lessonIds: ["l-3-1", "l-3-2"], reward: "Badge Git Guardian" },
  { id: "sk-bash", tree: "Fundamentos", name: "Bash scripting", description: "Variáveis, loops, funções, pipes e exit codes.", xp: 300, requires: ["sk-linux"], lessonIds: ["l-3-4", "l-3-5"], reward: "Badge Bash Scripter" },
  // Containers
  { id: "sk-docker", tree: "Containers e Automação", name: "Docker", description: "Imagens, containers, Dockerfile e cache de layers.", xp: 400, requires: ["sk-linux"], lessonIds: ["l-4-1", "l-4-2"], reward: "Badge Docker Initiate" },
  { id: "sk-compose", tree: "Containers e Automação", name: "Docker Compose", description: "Multi-serviço, redes, volumes e healthchecks.", xp: 350, requires: ["sk-docker"], lessonIds: ["l-4-4"], reward: "Badge Container Architect" },
  { id: "sk-multistage", tree: "Containers e Automação", name: "Multi-stage e imagem segura", description: "Build enxuto, usuário não-root e scan de imagem.", xp: 350, requires: ["sk-docker"], lessonIds: ["l-4-5"], reward: "+350 XP" },
  { id: "sk-actions", tree: "Containers e Automação", name: "GitHub Actions", description: "Workflows, jobs, matrizes, cache e secrets.", xp: 400, requires: ["sk-git", "sk-docker"], lessonIds: ["l-5-1", "l-5-2"], reward: "Badge Pipeline Builder" },
  { id: "sk-cd", tree: "Containers e Automação", name: "Deploy e rollback", description: "Registry, tags imutáveis, ambientes e rollback.", xp: 400, requires: ["sk-actions"], lessonIds: ["l-5-4", "l-5-5"], reward: "+400 XP" },
  // Cloud e IaC
  { id: "sk-iam", tree: "Cloud e IaC", name: "IAM", description: "Usuários, roles, políticas e menor privilégio.", xp: 400, requires: [], lessonIds: ["l-6-1"], reward: "Badge IAM Guardian" },
  { id: "sk-vpc", tree: "Cloud e IaC", name: "VPC e rede na nuvem", description: "Subnets, route tables, IGW, NAT e Security Groups.", xp: 450, requires: ["sk-iam", "sk-dns"], lessonIds: ["l-6-2", "l-6-3"], reward: "+450 XP" },
  { id: "sk-compute", tree: "Cloud e IaC", name: "EC2, S3 e RDS", description: "Compute, storage, banco gerenciado e backups.", xp: 450, requires: ["sk-vpc"], lessonIds: ["l-6-4"], reward: "Badge Cloud Explorer" },
  { id: "sk-terraform", tree: "Cloud e IaC", name: "Terraform", description: "Providers, state remoto, módulos e drift.", xp: 500, requires: ["sk-compute"], lessonIds: ["l-7-1", "l-7-2", "l-7-3"], reward: "Badge Terraform Builder" },
  { id: "sk-ansible", tree: "Cloud e IaC", name: "Ansible", description: "Inventário, playbooks, roles e idempotência.", xp: 400, requires: ["sk-ssh"], lessonIds: ["l-7-4"], reward: "Badge Ansible Automator" },
  // Kubernetes
  { id: "sk-k8s-core", tree: "Kubernetes e Plataforma", name: "Objetos do Kubernetes", description: "Pods, Deployments, Services e ConfigMaps.", xp: 500, requires: ["sk-compose"], lessonIds: ["l-8-1", "l-8-2"], reward: "+500 XP" },
  { id: "sk-ingress", tree: "Kubernetes e Plataforma", name: "Ingress e exposição", description: "Ingress controller, TLS e roteamento por host/path.", xp: 400, requires: ["sk-k8s-core", "sk-http"], lessonIds: ["l-8-3"], reward: "+400 XP" },
  { id: "sk-probes", tree: "Kubernetes e Plataforma", name: "Probes, limites e autoscaling", description: "liveness, readiness, requests/limits e HPA.", xp: 450, requires: ["sk-k8s-core"], lessonIds: ["l-8-4"], reward: "Badge Kubernetes Operator" },
  { id: "sk-helm", tree: "Kubernetes e Plataforma", name: "Helm", description: "Charts, values, templates e releases.", xp: 400, requires: ["sk-k8s-core"], lessonIds: ["l-8-5"], reward: "Badge Helm Captain" },
  { id: "sk-rbac", tree: "Kubernetes e Plataforma", name: "RBAC", description: "Roles, bindings e service accounts.", xp: 350, requires: ["sk-k8s-core", "sk-iam"], lessonIds: ["l-8-4"], reward: "+350 XP" },
  { id: "sk-argocd", tree: "Kubernetes e Plataforma", name: "ArgoCD e GitOps", description: "Estado desejado, sync, drift e rollback por Git.", xp: 500, requires: ["sk-helm", "sk-cd"], lessonIds: ["l-9-1", "l-9-2", "l-9-3"], reward: "Badge GitOps Keeper" },
  // SRE
  { id: "sk-prometheus", tree: "SRE", name: "Prometheus", description: "Métricas, PromQL, exporters e alert rules.", xp: 450, requires: ["sk-k8s-core"], lessonIds: ["l-10-1", "l-10-2"], reward: "+450 XP" },
  { id: "sk-grafana", tree: "SRE", name: "Grafana e Loki", description: "Dashboards úteis e logs centralizados.", xp: 400, requires: ["sk-prometheus"], lessonIds: ["l-10-3"], reward: "Badge Observability Watcher" },
  { id: "sk-otel", tree: "SRE", name: "OpenTelemetry", description: "Traces distribuídos e instrumentação.", xp: 400, requires: ["sk-prometheus"], lessonIds: ["l-10-4"], reward: "+400 XP" },
  { id: "sk-slo", tree: "SRE", name: "SLI, SLO e error budget", description: "Definir confiabilidade em números e decidir com base nela.", xp: 500, requires: ["sk-grafana"], lessonIds: ["l-10-5"], reward: "Badge SRE Guardian" },
  // Segurança e FinOps
  { id: "sk-secrets", tree: "Segurança e FinOps", name: "Gestão de secrets", description: "Cofres, rotação e nunca commitar credenciais.", xp: 400, requires: ["sk-actions"], lessonIds: ["l-11-1"], reward: "+400 XP" },
  { id: "sk-scan", tree: "Segurança e FinOps", name: "Scans e supply chain", description: "SCA, scan de imagem, SBOM e assinatura.", xp: 450, requires: ["sk-secrets"], lessonIds: ["l-11-2"], reward: "Badge Security Sentinel" },
  { id: "sk-finops", tree: "Segurança e FinOps", name: "FinOps", description: "Tags, budgets, right-sizing e desligar o que não usa.", xp: 400, requires: ["sk-compute"], lessonIds: ["l-11-3"], reward: "Badge Cost Optimizer" },
  { id: "sk-docs", tree: "Segurança e FinOps", name: "Documentação e portfólio", description: "README, ADR, diagramas e narrativa de entrevista.", xp: 350, requires: [], lessonIds: ["l-11-4"], reward: "Badge DevOps Professional" },
];

export const BADGES: BadgeDef[] = [
  { id: "first-commit", name: "First Commit", rarity: "Comum", xp: 50, condition: "Concluir a primeira aula do Módulo 0.", icon: "GitCommitHorizontal" },
  { id: "terminal-apprentice", name: "Terminal Apprentice", rarity: "Comum", xp: 100, condition: "Concluir 5 aulas de Linux.", icon: "Terminal" },
  { id: "linux-navigator", name: "Linux Navigator", rarity: "Raro", xp: 200, condition: "Concluir o Módulo 1 e o runbook de 30 comandos.", icon: "FolderTree" },
  { id: "log-hunter", name: "Log Hunter", rarity: "Raro", xp: 200, condition: "Encontrar a causa raiz usando apenas logs em um laboratório.", icon: "ScrollText" },
  { id: "dns-detective", name: "DNS Detective", rarity: "Raro", xp: 200, condition: "Resolver o laboratório de DNS e TTL.", icon: "Globe" },
  { id: "git-guardian", name: "Git Guardian", rarity: "Raro", xp: 250, condition: "Proteger a main e resolver um conflito de merge real.", icon: "GitBranch" },
  { id: "bash-scripter", name: "Bash Scripter", rarity: "Raro", xp: 250, condition: "Entregar health-check e backup automatizados em Bash.", icon: "SquareTerminal" },
  { id: "nginx-defender", name: "Nginx Defender", rarity: "Épico", xp: 350, condition: "Derrotar o Dragão 502.", icon: "Shield" },
  { id: "docker-initiate", name: "Docker Initiate", rarity: "Comum", xp: 150, condition: "Construir a primeira imagem própria.", icon: "Container" },
  { id: "container-architect", name: "Container Architect", rarity: "Épico", xp: 400, condition: "Stack completo do PrintQuest em Compose com healthchecks.", icon: "Boxes" },
  { id: "pipeline-builder", name: "Pipeline Builder", rarity: "Épico", xp: 400, condition: "CI obrigatório em PR com testes e build de imagem.", icon: "Workflow" },
  { id: "cloud-explorer", name: "Cloud Explorer", rarity: "Épico", xp: 450, condition: "Primeiro deploy na AWS dentro do orçamento.", icon: "Cloud" },
  { id: "iam-guardian", name: "IAM Guardian", rarity: "Épico", xp: 400, condition: "Aplicar menor privilégio e remover chaves de longa duração.", icon: "KeyRound" },
  { id: "terraform-builder", name: "Terraform Builder", rarity: "Épico", xp: 450, condition: "State remoto com lock e módulos reutilizáveis.", icon: "Blocks" },
  { id: "infrastructure-mage", name: "Infrastructure Mage", rarity: "Lendário", xp: 600, condition: "Ambientes dev e staging idênticos via IaC.", icon: "Wand2" },
  { id: "ansible-automator", name: "Ansible Automator", rarity: "Épico", xp: 400, condition: "Playbook idempotente aplicado duas vezes sem mudanças.", icon: "Repeat" },
  { id: "kubernetes-operator", name: "Kubernetes Operator", rarity: "Lendário", xp: 600, condition: "Deploy, rollout e rollback validados no cluster.", icon: "Ship" },
  { id: "helm-captain", name: "Helm Captain", rarity: "Épico", xp: 450, condition: "Chart próprio com values por ambiente.", icon: "Anchor" },
  { id: "gitops-keeper", name: "GitOps Keeper", rarity: "Lendário", xp: 600, condition: "ArgoCD sincronizando o cluster a partir do Git.", icon: "RefreshCw" },
  { id: "observability-watcher", name: "Observability Watcher", rarity: "Épico", xp: 450, condition: "Dashboard e alertas acionáveis publicados.", icon: "Activity" },
  { id: "sre-guardian", name: "SRE Guardian", rarity: "Lendário", xp: 700, condition: "SLO definido, alerta por error budget e postmortem escrito.", icon: "HeartPulse" },
  { id: "security-sentinel", name: "Security Sentinel", rarity: "Lendário", xp: 700, condition: "Scan de dependências e imagens bloqueando o pipeline.", icon: "ShieldCheck" },
  { id: "cost-optimizer", name: "Cost Optimizer", rarity: "Épico", xp: 450, condition: "Reduzir o custo mensal do ambiente sem perder SLO.", icon: "PiggyBank" },
  { id: "devops-professional", name: "DevOps Professional", rarity: "Lendário", xp: 1000, condition: "Projeto final PrintQuest completo e documentado.", icon: "Trophy" },
];
