export interface CareerTrack {
  id: string;
  name: string;
  focus: string;
  dayToDay: string[];
  mustHave: string[];
  niceToHave: string[];
  salaryNote: string;
  fitFor: string;
}

export const CAREER_TRACKS: CareerTrack[] = [
  {
    id: "devops",
    name: "DevOps Engineer",
    focus: "Fluxo de entrega: do commit à produção, com automação e reversibilidade.",
    dayToDay: [
      "Manter e melhorar pipelines de CI/CD",
      "Containerizar aplicações e padronizar builds",
      "Provisionar infraestrutura em código",
      "Apoiar times de produto em deploy e troubleshooting",
    ],
    mustHave: ["Linux", "Git", "Docker", "CI/CD", "Uma nuvem", "Terraform", "Redes e HTTP"],
    niceToHave: ["Kubernetes", "Observabilidade", "Scripting em Python", "Segurança de pipeline"],
    salaryNote:
      "É a porta de entrada mais comum. Vagas júnior costumam pedir Linux, Git, Docker e nuvem básica; pleno adiciona Terraform e Kubernetes.",
    fitFor: "Quem vem de desenvolvimento ou suporte e quer atuar no ciclo completo de entrega.",
  },
  {
    id: "cloud",
    name: "Cloud Engineer",
    focus: "Infraestrutura na nuvem: rede, identidade, serviços gerenciados e custo.",
    dayToDay: [
      "Desenhar e provisionar VPCs, compute e bancos",
      "Aplicar políticas de IAM e segurança de rede",
      "Gerenciar custo, tags e budgets",
      "Migrar workloads para serviços gerenciados",
    ],
    mustHave: ["AWS/Azure/GCP", "Rede (VPC, DNS, TLS)", "IAM", "Terraform", "Linux"],
    niceToHave: ["FinOps", "Multi-conta/landing zone", "Certificação do provedor", "Migração de datacenter"],
    salaryNote: "Certificação do provedor ajuda a passar em triagem, mas projeto real é o que sustenta a entrevista técnica.",
    fitFor: "Quem gosta de arquitetura de infraestrutura e de decisões de custo e segurança.",
  },
  {
    id: "platform",
    name: "Platform Engineer",
    focus: "Plataforma interna: caminhos padronizados para que times entreguem sozinhos.",
    dayToDay: [
      "Operar e evoluir clusters Kubernetes",
      "Criar templates, charts e módulos reutilizáveis",
      "Manter GitOps, ambientes e self-service",
      "Reduzir atrito e carga cognitiva dos times de produto",
    ],
    mustHave: ["Kubernetes", "Helm", "GitOps (ArgoCD/Flux)", "Terraform", "CI/CD avançado"],
    niceToHave: ["Backstage/portais internos", "Operators e CRDs", "Go", "Service mesh"],
    salaryNote: "Uma das trilhas melhor remuneradas hoje, por exigir Kubernetes com profundidade e visão de produto interno.",
    fitFor: "Quem gosta de construir ferramentas para outros engenheiros.",
  },
  {
    id: "sre",
    name: "SRE",
    focus: "Confiabilidade medida: SLO, error budget, incidentes e performance.",
    dayToDay: [
      "Definir e acompanhar SLIs e SLOs",
      "Instrumentar serviços e melhorar alertas",
      "Conduzir incidentes e escrever postmortems",
      "Trabalhar capacidade, performance e eliminação de toil",
    ],
    mustHave: ["Observabilidade (Prometheus/Grafana/OTel)", "Kubernetes", "Linux profundo", "SLI/SLO", "Depuração de sistemas distribuídos"],
    niceToHave: ["Chaos engineering", "Análise de performance", "Python/Go", "Modelagem de capacidade"],
    salaryNote: "Exige maturidade em produção. Postmortems e SLOs reais no portfólio pesam mais que qualquer certificado.",
    fitFor: "Quem gosta de investigar, medir e melhorar sistemas sob pressão.",
  },
  {
    id: "devsecops",
    name: "DevSecOps",
    focus: "Segurança integrada ao ciclo de entrega, sem travar o time.",
    dayToDay: [
      "Manter scans de dependências, imagens e IaC no pipeline",
      "Gerenciar segredos, rotação e menor privilégio",
      "Proteger a cadeia de suprimentos (SBOM, assinatura)",
      "Responder a achados e conduzir correções com prazo",
    ],
    mustHave: ["Segurança de pipeline", "IAM", "Scanners (SCA, imagem, IaC)", "Gestão de secrets", "Kubernetes"],
    niceToHave: ["Compliance (ISO, SOC2)", "Threat modeling", "Policy as code (OPA)", "Resposta a incidentes"],
    salaryNote: "Demanda crescente por exigência regulatória e por incidentes de supply chain nos últimos anos.",
    fitFor: "Quem gosta de segurança prática, com automação, e não apenas de relatório.",
  },
];

export const FIRST_JOB_CHECKLIST = [
  "Três repositórios públicos organizados (aplicação, infraestrutura, GitOps)",
  "README com arquitetura, decisões, custo, rollback e runbooks",
  "Pipeline visível e verde, com badge no README",
  "Captura do dashboard e do SLO documentado",
  "Um postmortem real de incidente controlado",
  "LinkedIn alinhado ao currículo, com o projeto em destaque",
  "Currículo com resultados medidos, não lista de tecnologias",
  "Três histórias de dois minutos ensaiadas em voz alta",
  "Perfil GitHub com contribuições consistentes nos últimos meses",
  "Respostas prontas para pretensão salarial e disponibilidade",
];

export const RESUME_LINES = [
  "Reduzi o tempo de build de 22 para 4 minutos com cache de dependências e Dockerfile multi-stage.",
  "Implementei GitOps com ArgoCD: tempo de rollback em produção caiu de ~35 para 4 minutos.",
  "Provisionei dev e staging com Terraform (state remoto e módulos), eliminando configuração manual.",
  "Instrumentei métricas, logs e traces; detecção de incidente passou de 18 para 2 minutos.",
  "Reduzi 38% do custo mensal com right-sizing e desligamento noturno, mantendo SLO de 99,9%.",
  "Bloqueei vulnerabilidades críticas no pipeline com Trivy e npm audit, com política de exceções por prazo.",
];

export interface InterviewQuestion {
  id: string;
  area: string;
  question: string;
  whatTheyEvaluate: string;
  strongAnswer: string;
}

export const INTERVIEW_BANK: InterviewQuestion[] = [
  {
    id: "iq-1",
    area: "Linux",
    question: "Um servidor está lento. Quais são seus primeiros cinco comandos e por quê?",
    whatTheyEvaluate: "Método de diagnóstico e capacidade de eliminar hipóteses em ordem.",
    strongAnswer:
      "uptime para comparar carga com nproc; free -h olhando available e swap; df -h e df -i para espaço e inodes; ps ordenado por CPU; iostat para I/O. Só depois olho a aplicação. A ordem importa porque separa saturação de recurso de problema de código.",
  },
  {
    id: "iq-2",
    area: "Redes",
    question: "Qual a diferença entre 502, 503 e 504?",
    whatTheyEvaluate: "Se você entende o papel do proxy e sabe onde procurar evidência.",
    strongAnswer:
      "502: o proxy tentou e o upstream recusou ou fechou a conexão — normalmente processo caído ou porta errada. 503: nenhum upstream disponível ou o próprio proxy limitando. 504: o upstream aceitou mas excedeu o read timeout — geralmente consulta lenta. A prova está no error.log e em testar o upstream direto com curl.",
  },
  {
    id: "iq-3",
    area: "Containers",
    question: "Por que um container para logo depois de iniciar?",
    whatTheyEvaluate: "Modelo mental de PID 1 e ciclo de vida.",
    strongAnswer:
      "O container vive enquanto o processo principal vive. Se o comando termina — com sucesso ou erro — o container para. Diagnostico com docker logs, verifico entrypoint/cmd e variáveis de ambiente, e confirmo se o processo está em foreground.",
  },
  {
    id: "iq-4",
    area: "CI/CD",
    question: "Como você evitaria guardar chaves de nuvem no CI?",
    whatTheyEvaluate: "Conhecimento de OIDC e menor privilégio.",
    strongAnswer:
      "Uso OIDC: o workflow pede um token de identidade e assume uma role restrita por repositório e ref na trust policy. Não existe chave para vazar nem rotacionar, e a role limita exatamente as ações permitidas. Também declaro permissions mínimas no workflow.",
  },
  {
    id: "iq-5",
    area: "Cloud",
    question: "O que torna uma subnet pública e por que o banco não deve ficar em uma?",
    whatTheyEvaluate: "Fundamentos de rede na nuvem e postura de segurança.",
    strongAnswer:
      "Pública é a subnet cuja route table aponta 0.0.0.0/0 para o Internet Gateway. Banco em subnet privada, com Security Group aceitando apenas o SG da aplicação, elimina alcance direto da internet. Saída, quando necessária, passa por NAT ou VPC endpoint.",
  },
  {
    id: "iq-6",
    area: "IaC",
    question: "O que é drift e como você lida com ele?",
    whatTheyEvaluate: "Maturidade operacional com IaC em equipe.",
    strongAnswer:
      "Drift é divergência entre código e realidade, geralmente por alteração manual em incidente. Detecto com plan agendado usando -detailed-exitcode. Não aplico antes de entender: diferenças legítimas vão para o código (ou import), acidentais são revertidas pelo apply. E a regra do time é que correção manual vira PR no mesmo dia.",
  },
  {
    id: "iq-7",
    area: "Kubernetes",
    question: "Diferencie liveness e readiness probe.",
    whatTheyEvaluate: "Se você já causou ou evitou incidente por probe malconfigurada.",
    strongAnswer:
      "Liveness reinicia o container quando falha; readiness apenas o remove dos endpoints do Service. Por isso liveness nunca deve checar dependências externas: se o banco oscila, você reinicia toda a frota e transforma degradação em queda. Para inicialização lenta, uso startupProbe.",
  },
  {
    id: "iq-8",
    area: "Kubernetes",
    question: "Pod em CrashLoopBackOff. Como você investiga?",
    whatTheyEvaluate: "Sequência de diagnóstico e leitura de eventos.",
    strongAnswer:
      "get pods para restarts, describe para eventos e lastState (OOMKilled? falha de probe? ImagePullBackOff?), logs --previous para o erro real da execução que morreu. Se for OOMKilled, meço com kubectl top e redimensiono; se for probe, ajusto startup/liveness.",
  },
  {
    id: "iq-9",
    area: "GitOps",
    question: "Como se faz rollback em GitOps?",
    whatTheyEvaluate: "Se você entende o Git como fonte da verdade.",
    strongAnswer:
      "git revert do commit que alterou a versão, push e sync. O cluster volta ao estado anterior e o histórico registra quem reverteu e por quê. A exceção é banco: migração precisa ser retrocompatível, senão rollback de código não basta.",
  },
  {
    id: "iq-10",
    area: "SRE",
    question: "Explique error budget e como ele muda decisões.",
    whatTheyEvaluate: "Capacidade de traduzir confiabilidade em decisão de negócio.",
    strongAnswer:
      "Com SLO de 99,9% em 30 dias, há cerca de 43 minutos de falha permitida. Se o budget está saudável, o time entrega rápido e experimenta; se estourou, congela funcionalidades e prioriza estabilidade. É o que encerra a discussão entre velocidade e estabilidade com número em vez de opinião.",
  },
  {
    id: "iq-11",
    area: "Segurança",
    question: "Você descobre uma chave de nuvem commitada. O que faz?",
    whatTheyEvaluate: "Prioridade correta em resposta a incidente.",
    strongAnswer:
      "Primeiro revogo/rotaciono a credencial: ela já está comprometida. Depois audito o uso em CloudTrail para verificar acesso indevido, e só então limpo o histórico. Em seguida, adiciono scanner de segredos no pre-commit e no CI para impedir a repetição.",
  },
  {
    id: "iq-12",
    area: "Comportamental",
    question: "Conte um incidente que você conduziu.",
    whatTheyEvaluate: "Clareza, foco em mitigação antes de análise, e aprendizado.",
    strongAnswer:
      "Uso situação, ação e resultado: alerta às 14:03 com 78% de erro após deploy; mitigação por rollback em 7 minutos; causa raiz encontrada nos traces (conexões não devolvidas ao pool); ações registradas no postmortem com dono e prazo, incluindo alerta de saturação do pool que não existia.",
  },
];
