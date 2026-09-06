import type { Module } from "@/lib/types";

export const K8S_GITOPS_MODULES: Module[] = [
  {
    id: "mod-8",
    index: 8,
    slug: "kubernetes-e-helm",
    title: "Kubernetes e Helm",
    tagline: "Orquestrar com probes, limites e rollback confiável.",
    weeks: 4,
    xp: 3000,
    badge: "kubernetes-operator",
    regionId: "montanhas-k8s",
    bossId: "boss-crashloopbackoff",
    overview:
      "Kubernetes é o divisor de águas entre quem opera servidores e quem opera plataforma. Você vai rodar o PrintQuest em um cluster local (Kind), entender Pods, Deployments, Services, ConfigMaps e Secrets, expor a aplicação com Ingress e TLS, configurar probes e limites que evitam incidentes, aplicar RBAC e empacotar tudo em um chart Helm com rollback validado.",
    objectives: [
      "Explicar o modelo declarativo e o loop de reconciliação",
      "Escrever manifests de Deployment, Service e Ingress",
      "Configurar liveness/readiness e requests/limits corretamente",
      "Aplicar RBAC mínimo e Secrets sem expor dados",
      "Empacotar e versionar releases com Helm, com rollback testado",
    ],
    prerequisites: ["Módulos 4 e 5 concluídos"],
    topics: ["Pods", "Deployments", "Services", "ConfigMaps", "Secrets", "Ingress", "Probes", "Limits", "RBAC", "Rollout/rollback", "Helm"],
    delivery: "PrintQuest rodando em Kind via Helm, com Ingress, probes, limites e rollback comprovado.",
    checklist: [
      "kubectl get pods mostra todos os pods Running e Ready",
      "readinessProbe impede tráfego antes da aplicação estar pronta",
      "requests e limits definidos em todos os containers",
      "Secret não aparece em manifest versionado em texto puro",
      "helm rollback restaurou a versão anterior com sucesso",
    ],
    troubleshooting:
      "Sintoma: pod em CrashLoopBackOff. Investigação em ordem: kubectl get pod (contagem de restarts), kubectl describe pod (eventos, OOMKilled, falha de probe, imagem inválida), kubectl logs --previous (o erro da execução que morreu). Causas mais comuns: variável de ambiente ausente, dependência indisponível, limite de memória baixo demais e liveness probe agressiva matando um app de inicialização lenta.",
    interviewQuestions: [
      "Diferença entre liveness e readiness probe?",
      "O que acontece quando um container excede o limite de memória?",
      "Como você faria rollback de um deploy no Kubernetes?",
    ],
    printQuest: "Migrar o PrintQuest do Compose para Kubernetes com chart Helm próprio.",
    lessons: [
      {
        id: "l-8-1",
        moduleId: "mod-8",
        title: "Arquitetura do cluster e o loop de reconciliação",
        duration: 45,
        difficulty: "Intermediário",
        tools: ["Kind", "kubectl"],
        xp: 25,
        objectives: ["Entender control plane e nós", "Criar um cluster local", "Navegar recursos com kubectl"],
        body: [
          "Kubernetes funciona por reconciliação: você declara o estado desejado no API server, o etcd guarda, os controllers comparam com o real e agem até convergir. Entender isso explica por que apagar um pod à mão o faz voltar — o Deployment quer três réplicas e o controller obedece a essa vontade, não à sua.",
          "No control plane estão API server, etcd, scheduler e controller manager; em cada nó, kubelet (executa e reporta), container runtime e kube-proxy (rede de serviços). Diagnóstico começa sempre por eventos e status, que refletem o que os controllers viram.",
          "Kind cria um cluster completo em containers Docker, ideal para aprender e para CI. Comece dominando kubectl get/describe/logs/exec e o uso de namespaces — a maior parte do trabalho diário está nesses cinco comandos.",
        ],
        code: [
          {
            label: "Cluster local com Kind e navegação",
            language: "bash",
            code: `cat > kind.yaml <<'EOF'
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    kubeadmConfigPatches:
      - |
        kind: InitConfiguration
        nodeRegistration:
          kubeletExtraArgs:
            node-labels: "ingress-ready=true"
    extraPortMappings:
      - { containerPort: 80, hostPort: 80 }
      - { containerPort: 443, hostPort: 443 }
  - role: worker
EOF

kind create cluster --name printquest --config kind.yaml
kubectl cluster-info
kubectl get nodes -o wide
kubectl create namespace printquest
kubectl config set-context --current --namespace=printquest

kubectl get all
kubectl api-resources | head -20
kubectl explain deployment.spec.strategy
kubectl get events --sort-by=.lastTimestamp | tail -20`,
          },
        ],
        whyItMatters: "Sem o modelo de reconciliação na cabeça, você briga com o cluster em vez de operá-lo.",
        commonMistake: "Deletar pods esperando que fiquem deletados, sem alterar o Deployment.",
        productionTip: "Use namespaces por ambiente/equipe desde o início; migrar depois é trabalhoso.",
        securityAlert: "kubeconfig é credencial de cluster: proteja com permissão 600 e nunca comite.",
        interviewQuestion: "Explique o que acontece entre kubectl apply e o pod rodando.",
        glossary: [
          { term: "reconciliação", definition: "Ciclo contínuo que aproxima o estado real do estado declarado." },
          { term: "kubelet", definition: "Agente em cada nó que executa containers e reporta status ao control plane." },
        ],
        printQuestLink: "Criar o cluster local onde o PrintQuest será migrado.",
        quiz: [
          {
            question: "Você apaga um pod gerenciado por Deployment. O que acontece?",
            options: ["Ele fica apagado", "O controller cria outro para manter as réplicas", "O Deployment é apagado também", "O nó é reiniciado"],
            answerIndex: 1,
            explanation: "O controller reconcilia o real com o desejado, recriando o pod.",
          },
        ],
      },
      {
        id: "l-8-2",
        moduleId: "mod-8",
        title: "Deployment, Service, ConfigMap e Secret",
        duration: 50,
        difficulty: "Intermediário",
        tools: ["kubectl", "YAML"],
        xp: 25,
        objectives: ["Escrever manifests corretos", "Injetar configuração e segredo", "Expor a aplicação internamente"],
        body: [
          "Deployment gerencia ReplicaSets, que gerenciam pods, e é o que permite rollout gradual e rollback. Service dá um nome estável e balanceamento para um conjunto de pods selecionado por labels: ClusterIP para uso interno, NodePort para acesso direto em laboratório, LoadBalancer para provisionar balanceador na nuvem.",
          "Configuração vem de ConfigMap; dado sensível, de Secret. Importante: Secret padrão é apenas base64, não criptografia — o que protege é RBAC, criptografia em repouso no etcd e não versionar o valor. Para GitOps, use Sealed Secrets, SOPS ou External Secrets Operator.",
          "Labels e selectors são a cola de tudo. Selector do Service que não casa com as labels do pod produz o clássico 'Service sem endpoints', em que a aplicação está de pé mas nada chega nela.",
        ],
        code: [
          {
            label: "Manifests da API do PrintQuest",
            language: "yaml",
            code: `apiVersion: v1
kind: ConfigMap
metadata: { name: printquest-api-config }
data:
  NODE_ENV: production
  DATABASE_HOST: printquest-db
  DATABASE_PORT: "5432"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: printquest-api
  labels: { app: printquest, component: api }
spec:
  replicas: 2
  revisionHistoryLimit: 5
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }
  selector:
    matchLabels: { app: printquest, component: api }
  template:
    metadata:
      labels: { app: printquest, component: api }
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
      containers:
        - name: api
          image: ghcr.io/tiago/printquest/api:v1.2.0
          ports: [{ containerPort: 3000, name: http }]
          envFrom:
            - configMapRef: { name: printquest-api-config }
          env:
            - name: DATABASE_PASSWORD
              valueFrom:
                secretKeyRef: { name: printquest-db, key: password }
          resources:
            requests: { cpu: 100m, memory: 128Mi }
            limits:   { cpu: 500m, memory: 256Mi }
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities: { drop: ["ALL"] }
---
apiVersion: v1
kind: Service
metadata: { name: printquest-api }
spec:
  type: ClusterIP
  selector: { app: printquest, component: api }
  ports: [{ port: 80, targetPort: http }]`,
            securityNote:
              "Nunca versione Secret com valor em base64 no Git. Use External Secrets ou SOPS com chave gerenciada.",
          },
          {
            label: "Aplicar e depurar",
            language: "bash",
            code: `kubectl apply -f k8s/
kubectl get deploy,rs,pod,svc
kubectl describe deploy printquest-api | tail -20
kubectl get endpoints printquest-api      # vazio = selector nao casa
kubectl logs deploy/printquest-api --tail=50
kubectl port-forward svc/printquest-api 8080:80
kubectl run tmp --rm -it --image=curlimages/curl -- sh -c 'curl -s printquest-api/health'`,
          },
        ],
        whyItMatters: "Estes quatro objetos cobrem 80% do trabalho diário com Kubernetes.",
        commonMistake: "Selector do Service divergente das labels do pod, gerando Service sem endpoints.",
        productionTip: "maxUnavailable: 0 garante deploy sem janela de indisponibilidade quando há réplicas suficientes.",
        securityAlert: "runAsNonRoot, readOnlyRootFilesystem e drop de capabilities devem ser o padrão, não a exceção.",
        interviewQuestion: "Service existe, pods rodando, mas nada responde. O que você verifica?",
        glossary: [
          { term: "selector", definition: "Regra de labels que define quais pods pertencem a um Service ou controller." },
          { term: "envFrom", definition: "Forma de injetar todas as chaves de um ConfigMap como variáveis de ambiente." },
        ],
        printQuestLink: "Traduzir os serviços do Compose em Deployments e Services do PrintQuest.",
        quiz: [
          {
            question: "Service sem endpoints normalmente indica:",
            options: ["Falta de Ingress", "Selector que não casa com as labels dos pods", "Namespace errado do Service", "Imagem inválida"],
            answerIndex: 1,
            explanation: "Sem pods correspondentes ao selector, não há endpoints para balancear.",
          },
        ],
      },
      {
        id: "l-8-3",
        moduleId: "mod-8",
        title: "Ingress, TLS e exposição externa",
        duration: 45,
        difficulty: "Avançado",
        tools: ["Ingress NGINX", "cert-manager"],
        xp: 25,
        objectives: ["Instalar ingress controller", "Rotear por host e path", "Automatizar certificado TLS"],
        body: [
          "Ingress é regra de roteamento HTTP; quem executa é o ingress controller (NGINX, Traefik, ou o gateway do provedor). Sem controller instalado, o objeto Ingress existe e nada acontece — confusão frequente de quem está começando.",
          "Com Ingress você concentra em um único ponto de entrada o roteamento por host e path, o TLS e políticas como redirect e rate limit. No PrintQuest, o frontend responde na raiz e a API em /api, com o mesmo certificado.",
          "cert-manager automatiza emissão e renovação de certificados via ACME, transformando um risco recorrente (certificado expirado) em processo. Em produção, monitore a validade também como métrica.",
        ],
        code: [
          {
            label: "Ingress do PrintQuest com TLS",
            language: "yaml",
            code: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: printquest
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "15"
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts: [printquest.dev]
      secretName: printquest-tls
  rules:
    - host: printquest.dev
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service: { name: printquest-api, port: { number: 80 } }
          - path: /
            pathType: Prefix
            backend:
              service: { name: printquest-web, port: { number: 80 } }`,
            securityNote:
              "Force ssl-redirect e considere rate limit em rotas de login para reduzir força bruta.",
          },
          {
            label: "Instalar controller e depurar",
            language: "bash",
            code: `kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl -n ingress-nginx wait --for=condition=ready pod -l app.kubernetes.io/component=controller --timeout=180s

kubectl get ingress
kubectl describe ingress printquest
kubectl -n ingress-nginx logs deploy/ingress-nginx-controller --tail=50
curl -H "Host: printquest.dev" http://localhost/api/health -i`,
          },
        ],
        whyItMatters: "Toda aplicação precisa ser alcançável com HTTPS; Ingress é o mecanismo padrão para isso.",
        commonMistake: "Criar Ingress sem controller instalado e concluir que 'o Kubernetes não funciona'.",
        productionTip: "Timeouts do Ingress devem ser coerentes com os da aplicação, como no Nginx tradicional.",
        securityAlert: "Ingress mal configurado pode expor rotas administrativas; revise paths e autenticação.",
        interviewQuestion: "Qual a diferença entre Service LoadBalancer e Ingress?",
        glossary: [
          { term: "ingress controller", definition: "Componente que implementa as regras declaradas em objetos Ingress." },
          { term: "ClusterIssuer", definition: "Recurso do cert-manager que define a autoridade emissora de certificados." },
        ],
        printQuestLink: "Publicar frontend e API do PrintQuest sob o mesmo domínio com HTTPS.",
        quiz: [
          {
            question: "Você criou um Ingress e nada acontece. Causa mais provável?",
            options: ["Falta de Secret TLS", "Nenhum ingress controller instalado", "Namespace errado do pod", "Service tipo ClusterIP"],
            answerIndex: 1,
            explanation: "Sem controller, o objeto Ingress não é implementado por ninguém.",
          },
        ],
      },
      {
        id: "l-8-4",
        moduleId: "mod-8",
        title: "Probes, recursos, autoscaling e RBAC",
        duration: 50,
        difficulty: "Avançado",
        tools: ["kubectl", "HPA", "RBAC"],
        xp: 25,
        objectives: ["Configurar probes que ajudam em vez de atrapalhar", "Definir requests/limits com critério", "Aplicar HPA e RBAC mínimo"],
        body: [
          "Liveness diz 'se falhar, reinicie'; readiness diz 'se falhar, não mande tráfego'; startup dá tempo extra para aplicações de inicialização lenta. O erro clássico é apontar liveness para um endpoint que checa o banco: quando o banco oscila, o Kubernetes reinicia toda a aplicação e transforma uma degradação em queda total.",
          "Requests definem o que o scheduler reserva; limits, o teto. CPU acima do limite sofre throttling (fica lento); memória acima do limite resulta em OOMKilled (o container morre). Definir memória com folga real e observar o consumo antes de apertar é a prática correta.",
          "HPA escala réplicas por métrica, mas só funciona com requests definidos e metrics-server ativo. E RBAC fecha o ciclo: cada aplicação e cada pessoa com o mínimo necessário, nunca cluster-admin distribuído por conveniência.",
        ],
        code: [
          {
            label: "Probes corretas e HPA",
            language: "yaml",
            code: `containers:
  - name: api
    startupProbe:
      httpGet: { path: /health, port: http }
      failureThreshold: 30
      periodSeconds: 2
    livenessProbe:
      httpGet: { path: /health, port: http }   # sem dependencias externas
      periodSeconds: 10
      timeoutSeconds: 2
      failureThreshold: 3
    readinessProbe:
      httpGet: { path: /ready, port: http }    # com dependencias
      periodSeconds: 5
      failureThreshold: 2
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: printquest-api }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: printquest-api }
  minReplicas: 2
  maxReplicas: 8
  metrics:
    - type: Resource
      resource:
        name: cpu
        target: { type: Utilization, averageUtilization: 70 }`,
          },
          {
            label: "RBAC mínimo e diagnóstico",
            language: "yaml",
            code: `apiVersion: v1
kind: ServiceAccount
metadata: { name: printquest-api }
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata: { name: printquest-api-read }
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata: { name: printquest-api-read }
subjects: [{ kind: ServiceAccount, name: printquest-api }]
roleRef: { kind: Role, name: printquest-api-read, apiGroup: rbac.authorization.k8s.io }`,
            securityNote:
              "Evite ClusterRoleBinding com cluster-admin para aplicações. Verifique com kubectl auth can-i --as=system:serviceaccount:ns:sa.",
          },
          {
            label: "Investigar consumo e permissões",
            language: "bash",
            code: `kubectl top pods
kubectl describe pod <pod> | grep -A5 -E 'Limits|Requests|Last State'
kubectl get pod <pod> -o jsonpath='{.status.containerStatuses[0].lastState.terminated.reason}'  # OOMKilled?
kubectl get hpa
kubectl auth can-i list secrets --as=system:serviceaccount:printquest:printquest-api`,
          },
        ],
        whyItMatters: "Probes e limites malfeitos são a causa número um de instabilidade em clusters de empresas reais.",
        commonMistake: "Liveness apontando para endpoint que depende do banco, causando reinício em cascata.",
        productionTip: "Comece com limites generosos, observe métricas por uma semana e só então aperte.",
        securityAlert: "ServiceAccount com permissão de ler todos os Secrets é escalonamento de privilégio no cluster.",
        interviewQuestion: "O que acontece quando um container excede requests? E limits?",
        glossary: [
          { term: "OOMKilled", definition: "Container encerrado pelo kernel por exceder o limite de memória." },
          { term: "throttling", definition: "Redução forçada de CPU quando o container excede seu limite." },
        ],
        printQuestLink: "Ajustar probes e limites da API do PrintQuest com base no consumo medido.",
        quiz: [
          {
            question: "Falha de readiness probe causa:",
            options: ["Reinício do container", "Remoção do pod dos endpoints do Service", "Escala automática", "Recriação do Deployment"],
            answerIndex: 1,
            explanation: "Readiness controla recebimento de tráfego; liveness controla reinício.",
          },
        ],
      },
      {
        id: "l-8-5",
        moduleId: "mod-8",
        title: "Helm: empacotar, versionar e fazer rollback",
        duration: 50,
        difficulty: "Avançado",
        tools: ["Helm"],
        xp: 25,
        objectives: ["Criar chart próprio", "Parametrizar por ambiente", "Executar rollout e rollback"],
        body: [
          "Helm empacota manifests em chart com templates e values, resolvendo dois problemas: repetição entre ambientes e versionamento de release. Cada instalação ou upgrade cria uma revisão, o que torna rollback um comando único e auditável.",
          "Estruture o chart com values.yaml de defaults conservadores e arquivos por ambiente (values-dev.yaml, values-prod.yaml) alterando réplicas, recursos, host e tag de imagem. Templates devem falhar cedo: use required para valores obrigatórios.",
          "Antes de aplicar, valide com helm lint e helm template para ver o YAML final, e prefira upgrade --atomic --wait, que reverte automaticamente se os pods não ficarem prontos. Rollback treinado é rollback confiável.",
        ],
        code: [
          {
            label: "Chart do PrintQuest",
            language: "yaml",
            code: `# Chart.yaml
apiVersion: v2
name: printquest
description: Plataforma PrintQuest (web + api)
type: application
version: 0.3.0
appVersion: "1.2.0"

# values.yaml
replicaCount: 2
image:
  repository: ghcr.io/tiago/printquest/api
  tag: ""            # obrigatorio via --set ou values de ambiente
  pullPolicy: IfNotPresent
resources:
  requests: { cpu: 100m, memory: 128Mi }
  limits:   { cpu: 500m, memory: 256Mi }
ingress:
  enabled: true
  host: printquest.dev

# templates/deployment.yaml (trecho)
# image: "{{ .Values.image.repository }}:{{ required \\"informe image.tag\\" .Values.image.tag }}"
# replicas: {{ .Values.replicaCount }}`,
          },
          {
            label: "Ciclo de release e rollback",
            language: "bash",
            code: `helm lint ./charts/printquest
helm template printquest ./charts/printquest -f values-prod.yaml | kubectl apply --dry-run=client -f -

helm upgrade --install printquest ./charts/printquest \\
  -n printquest --create-namespace \\
  -f values-prod.yaml --set image.tag=v1.2.0 \\
  --atomic --wait --timeout 5m

helm history printquest -n printquest
helm rollback printquest 3 -n printquest        # volta para a revisao 3
kubectl rollout status deploy/printquest-api -n printquest
kubectl rollout undo deploy/printquest-api -n printquest   # alternativa sem Helm`,
            securityNote:
              "Não passe senha por --set (fica no histórico e no release do Helm). Use Secret gerenciado externamente.",
          },
        ],
        whyItMatters: "Helm é o formato de distribuição padrão no ecossistema e a base do que o ArgoCD sincroniza.",
        commonMistake: "Deixar image.tag vazio e implantar acidentalmente latest.",
        productionTip: "--atomic --wait transforma upgrade falho em rollback automático, sem intervenção humana.",
        interviewQuestion: "Como você reverteria um deploy ruim feito por Helm, e o que aconteceria com o banco?",
        glossary: [
          { term: "chart", definition: "Pacote Helm com templates, values e metadados." },
          { term: "revisão", definition: "Versão de uma release Helm, usada para histórico e rollback." },
        ],
        printQuestLink: "Empacotar o PrintQuest em chart e validar o rollback da versão anterior.",
        quiz: [
          {
            question: "O que faz helm upgrade --atomic?",
            options: [
              "Aplica sem validar",
              "Reverte automaticamente se o upgrade falhar",
              "Apaga a release anterior",
              "Ignora hooks",
            ],
            answerIndex: 1,
            explanation: "Em falha, a release volta ao estado anterior automaticamente.",
          },
        ],
      },
    ],
  },
  {
    id: "mod-9",
    index: 9,
    slug: "gitops-com-argocd",
    title: "GitOps com ArgoCD",
    tagline: "O Git decide o que roda no cluster.",
    weeks: 2,
    xp: 1500,
    badge: "gitops-keeper",
    regionId: "portal-gitops",
    bossId: "boss-out-of-sync",
    overview:
      "Em GitOps, o repositório é a fonte da verdade e um agente no cluster reconcilia continuamente. Isso muda a operação: deploy é merge, rollback é revert, auditoria é git log e alteração manual é detectada como drift. Você vai instalar o ArgoCD, estruturar o repositório printquest-gitops, configurar auto-sync com self-heal e resolver o boss OutOfSync.",
    objectives: [
      "Explicar GitOps e seus quatro princípios na prática",
      "Instalar e operar o ArgoCD",
      "Estruturar repositório GitOps por ambiente",
      "Configurar auto-sync, prune e self-heal com consciência",
      "Diagnosticar OutOfSync e executar rollback por Git",
    ],
    prerequisites: ["Módulo 8 concluído"],
    topics: ["Estado desejado", "Sync", "Auto-sync", "Drift", "Histórico", "Rollback", "Repositório GitOps"],
    delivery: "Cluster sincronizado pelo ArgoCD a partir do repositório printquest-gitops, com rollback por revert comprovado.",
    checklist: [
      "Application do ArgoCD apontando para o repositório e caminho corretos",
      "Auto-sync com prune e selfHeal habilitados no ambiente de staging",
      "Alteração manual no cluster revertida automaticamente pelo self-heal",
      "Rollback executado por git revert e refletido no cluster",
      "Segredos fora do Git (External Secrets ou SOPS)",
    ],
    troubleshooting:
      "Sintoma: Application permanentemente OutOfSync. Investigação: argocd app diff mostra campo que muda sozinho — geralmente valor mutado por webhook/controller ou campo default do cluster. Correção: ignoreDifferences para o campo específico, ou ajustar o manifest para refletir a realidade. Prevenção: nunca editar recursos gerenciados com kubectl edit.",
    interviewQuestions: [
      "Quais as vantagens de GitOps sobre deploy por pipeline push?",
      "Como você faz rollback em GitOps?",
      "Como gerenciar secrets em um repositório GitOps?",
    ],
    printQuest: "Colocar o PrintQuest sob GitOps: cada merge no repositório de manifests reflete no cluster.",
    lessons: [
      {
        id: "l-9-1",
        moduleId: "mod-9",
        title: "Princípios de GitOps e estrutura do repositório",
        duration: 35,
        difficulty: "Intermediário",
        tools: ["Git", "Kustomize/Helm"],
        xp: 25,
        objectives: ["Entender os princípios de GitOps", "Estruturar repositório por ambiente", "Separar aplicação de manifests"],
        body: [
          "GitOps se apoia em quatro princípios: estado desejado declarativo, versionado e imutável em Git, aplicado automaticamente por agentes, com reconciliação contínua. A consequência prática é enorme: quem pode fazer merge pode implantar, e o histórico do Git é o histórico do que rodou em produção.",
          "Separe o repositório da aplicação do repositório de manifests. A aplicação gera imagem versionada; o repositório GitOps registra qual versão deve rodar em cada ambiente. Isso permite políticas de revisão diferentes e evita que uma mudança de código altere produção sem passo explícito.",
          "Estruture por ambiente com base comum e overlays: base/ com o essencial, overlays/dev e overlays/prod com réplicas, recursos e host. Kustomize é ideal para isso; Helm com values por ambiente também funciona e o ArgoCD suporta ambos.",
        ],
        code: [
          {
            label: "Estrutura do printquest-gitops",
            language: "text",
            code: `printquest-gitops/
  base/
    kustomization.yaml
    deployment-api.yaml
    service-api.yaml
    ingress.yaml
  overlays/
    staging/
      kustomization.yaml      # replicas: 1, host: staging.printquest.dev
      image-tag.yaml
    producao/
      kustomization.yaml      # replicas: 3, recursos maiores
      image-tag.yaml
  apps/
    staging.yaml              # Application do ArgoCD
    producao.yaml`,
          },
          {
            label: "Overlay de produção com Kustomize",
            language: "yaml",
            code: `# overlays/producao/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: printquest
resources: [../../base]
replicas:
  - name: printquest-api
    count: 3
images:
  - name: ghcr.io/tiago/printquest/api
    newTag: v1.2.0
patches:
  - target: { kind: Deployment, name: printquest-api }
    patch: |
      - op: replace
        path: /spec/template/spec/containers/0/resources/limits/memory
        value: 512Mi`,
            securityNote:
              "Nada de senha nesses arquivos: o repositório é lido por várias pessoas e pelo agente do cluster.",
          },
        ],
        whyItMatters: "GitOps é o padrão dominante para entrega em Kubernetes e aparece cada vez mais nas descrições de vaga.",
        commonMistake: "Misturar código e manifests no mesmo repositório e perder controle sobre o que vai a produção.",
        productionTip: "Proteja o repositório GitOps com revisão obrigatória: ele é o botão de deploy da empresa.",
        securityAlert: "Quem tem escrita no repositório GitOps tem, na prática, acesso de deploy ao cluster.",
        interviewQuestion: "Por que separar repositório de aplicação e de manifests?",
        glossary: [
          { term: "overlay", definition: "Camada Kustomize que ajusta a base para um ambiente específico." },
          { term: "estado desejado", definition: "Descrição declarativa do que deve existir, versionada em Git." },
        ],
        printQuestLink: "Criar a estrutura base/overlays do printquest-gitops.",
        quiz: [
          {
            question: "Em GitOps, como se faz um deploy?",
            options: ["kubectl apply manual", "Merge no repositório de manifests", "Reinício dos pods", "Upload no console do cluster"],
            answerIndex: 1,
            explanation: "O agente reconcilia o cluster com o que está no Git após o merge.",
          },
        ],
      },
      {
        id: "l-9-2",
        moduleId: "mod-9",
        title: "ArgoCD: instalação, Application e sync",
        duration: 45,
        difficulty: "Avançado",
        tools: ["ArgoCD", "kubectl"],
        xp: 25,
        objectives: ["Instalar o ArgoCD no cluster", "Declarar Application", "Operar sync manual e automático"],
        body: [
          "O ArgoCD roda dentro do cluster e observa repositórios Git. Cada Application define origem (repo, revisão, caminho) e destino (cluster, namespace), além da política de sincronização. Instalar é simples; o valor está em configurar bem a política.",
          "Auto-sync aplica mudanças automaticamente. prune remove recursos que saíram do Git — poderoso e perigoso, porque um caminho errado pode apagar objetos. selfHeal desfaz alterações manuais no cluster, garantindo que o Git prevaleça. Em staging, ligue os três; em produção, muitos times mantêm sync manual ou com janela de aprovação.",
          "Use a interface e a CLI para diagnóstico: status de saúde por recurso, diff entre Git e cluster, histórico de sync e logs do controller. É a visão mais clara de 'o que está rodando' que uma equipe pode ter.",
        ],
        code: [
          {
            label: "Instalar e declarar a Application",
            language: "bash",
            code: `kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl -n argocd rollout status deploy/argocd-server

kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d
kubectl -n argocd port-forward svc/argocd-server 8081:443

argocd login localhost:8081 --username admin --insecure
argocd app list
argocd app get printquest-staging
argocd app diff printquest-staging
argocd app sync printquest-staging
argocd app history printquest-staging`,
            securityNote:
              "Troque a senha inicial do admin, habilite SSO quando possível e não exponha o argocd-server publicamente sem autenticação forte.",
          },
          {
            label: "Application declarativa",
            language: "yaml",
            code: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: printquest-staging
  namespace: argocd
spec:
  project: default
  source:
    repoURL: git@github.com:tiago/printquest-gitops.git
    targetRevision: main
    path: overlays/staging
  destination:
    server: https://kubernetes.default.svc
    namespace: printquest
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 3
      backoff: { duration: 10s, factor: 2, maxDuration: 2m }`,
          },
        ],
        whyItMatters: "Operar ArgoCD é tarefa concreta de vaga de Platform Engineering.",
        commonMistake: "Ligar prune com caminho errado no repositório e apagar recursos do namespace.",
        productionTip: "Produção com sync manual ou aprovação; staging com auto-sync total para feedback rápido.",
        securityAlert: "Repositório privado exige credencial de leitura no ArgoCD; use deploy key restrita.",
        interviewQuestion: "O que fazem prune e selfHeal e quais riscos trazem?",
        glossary: [
          { term: "Application", definition: "Recurso do ArgoCD que liga um caminho do Git a um destino no cluster." },
          { term: "selfHeal", definition: "Reverte automaticamente alterações feitas diretamente no cluster." },
        ],
        printQuestLink: "Criar as Applications de staging e produção do PrintQuest.",
        quiz: [
          {
            question: "Alguém editou um Deployment com kubectl. Com selfHeal ativo, o que ocorre?",
            options: ["A mudança persiste", "O ArgoCD reverte para o estado do Git", "A Application é apagada", "O cluster é reiniciado"],
            answerIndex: 1,
            explanation: "selfHeal garante que o Git seja a fonte da verdade.",
          },
        ],
      },
      {
        id: "l-9-3",
        moduleId: "mod-9",
        title: "Drift, rollback por Git e promoção entre ambientes",
        duration: 40,
        difficulty: "Avançado",
        tools: ["ArgoCD", "Git", "Kustomize"],
        xp: 25,
        objectives: ["Diagnosticar OutOfSync", "Reverter por Git", "Promover versão de staging para produção"],
        body: [
          "OutOfSync significa divergência entre Git e cluster. As causas se dividem em três: alguém alterou o cluster à mão, um controller mutou o objeto (injeção de sidecar, defaults) ou o Git mudou e o sync ainda não ocorreu. argocd app diff aponta exatamente o campo — e é por onde começa a investigação.",
          "Quando o campo é legitimamente gerenciado por outro componente, configure ignoreDifferences para aquele caminho específico; ignorar amplamente esconde problemas reais. Nunca 'resolva' OutOfSync desligando o self-heal.",
          "Rollback em GitOps é git revert do commit que alterou a tag da imagem: o cluster volta ao estado anterior e o histórico registra o que houve. Promoção entre ambientes é o mesmo mecanismo: um PR que atualiza a tag no overlay de produção com a versão já validada em staging.",
        ],
        code: [
          {
            label: "Diagnóstico, ignoreDifferences e rollback",
            language: "bash",
            code: `argocd app get printquest-producao
argocd app diff printquest-producao
kubectl describe deploy printquest-api -n printquest | tail -20

# rollback: reverter o commit que subiu a versao ruim
git -C printquest-gitops log --oneline -5 -- overlays/producao
git -C printquest-gitops revert 4c1f8ab
git -C printquest-gitops push
argocd app sync printquest-producao
argocd app history printquest-producao

# promocao de staging para producao
cd printquest-gitops/overlays/producao
kustomize edit set image ghcr.io/tiago/printquest/api=ghcr.io/tiago/printquest/api:v1.2.0
git commit -am "chore(prod): promove api para v1.2.0" && git push`,
          },
          {
            label: "Ignorar campo mutado por outro controller",
            language: "yaml",
            code: `spec:
  ignoreDifferences:
    - group: apps
      kind: Deployment
      name: printquest-api
      jsonPointers:
        - /spec/replicas          # gerenciado pelo HPA
    - group: ""
      kind: Service
      jqPathExpressions:
        - .spec.clusterIP`,
            securityNote:
              "Não use ignoreDifferences em campos de segurança (securityContext, imagem): esconderia alteração maliciosa.",
          },
        ],
        whyItMatters: "Rollback por revert é a demonstração mais clara de valor do GitOps em um incidente.",
        commonMistake: "Corrigir produção com kubectl edit; o self-heal desfaz e o problema volta em segundos.",
        productionTip: "Promoção sempre por PR com a versão exata já validada em staging — nunca rebuild para produção.",
        interviewQuestion: "Como você faria rollback de uma versão ruim em um cluster gerido por ArgoCD?",
        glossary: [
          { term: "OutOfSync", definition: "Estado em que o cluster difere do estado declarado no Git." },
          { term: "promoção", definition: "Levar uma versão já validada de um ambiente para o próximo." },
        ],
        printQuestLink: "Promover a v1.2.0 do PrintQuest de staging para produção via PR.",
        quiz: [
          {
            question: "Qual a forma correta de rollback em GitOps?",
            options: ["kubectl rollout undo", "git revert do commit e sync", "Apagar a Application", "Editar o Deployment no cluster"],
            answerIndex: 1,
            explanation: "O Git é a fonte da verdade; reverter o commit reverte o cluster de forma auditável.",
          },
        ],
      },
      {
        id: "l-9-4",
        moduleId: "mod-9",
        title: "Segredos em GitOps: External Secrets e SOPS",
        duration: 40,
        difficulty: "Avançado",
        tools: ["External Secrets Operator", "SOPS", "Secrets Manager"],
        xp: 25,
        objectives: ["Escolher estratégia de segredo", "Configurar External Secrets", "Encriptar valores com SOPS"],
        body: [
          "O paradoxo do GitOps é claro: tudo em Git, mas segredo não pode ir para Git em texto. Duas soluções dominam. External Secrets Operator mantém o valor em um cofre (AWS Secrets Manager, Vault) e cria o Secret no cluster a partir de uma referência versionável. SOPS encripta o valor no próprio arquivo com chave gerenciada (KMS), permitindo versionar com segurança.",
          "External Secrets costuma ser a melhor escolha quando já existe cofre corporativo: rotação acontece no cofre e o cluster acompanha. SOPS é excelente para times pequenos e para configuração que muda pouco, mantendo o fluxo 100% em Git.",
          "Em qualquer estratégia, valem as mesmas regras: rotação periódica, acesso auditado, escopo mínimo e nenhum segredo em log, em ConfigMap ou em variável impressa por pipeline.",
        ],
        code: [
          {
            label: "External Secret referenciando o cofre",
            language: "yaml",
            code: `apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata: { name: aws-secrets }
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef: { name: external-secrets }
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata: { name: printquest-db }
spec:
  refreshInterval: 1h
  secretStoreRef: { name: aws-secrets, kind: SecretStore }
  target: { name: printquest-db, creationPolicy: Owner }
  data:
    - secretKey: password
      remoteRef: { key: printquest/db, property: password }`,
            securityNote:
              "A ServiceAccount do operador deve ter permissão apenas nos segredos com prefixo printquest/.",
          },
          {
            label: "SOPS com KMS",
            language: "bash",
            code: `sops --encrypt --kms arn:aws:kms:us-east-1:123456789012:key/abc secrets.yaml > secrets.enc.yaml
git add secrets.enc.yaml    # somente o arquivo encriptado
sops --decrypt secrets.enc.yaml | kubectl apply -f -

# validacao: garantir que nada em texto puro entre no repositorio
grep -rIl "password:" overlays/ | xargs -r grep -L "ENC\\["`,
          },
        ],
        whyItMatters: "Segredo vazado em repositório é o incidente de segurança mais comum e mais evitável do setor.",
        commonMistake: "Commitar Secret em base64 acreditando que base64 é criptografia.",
        productionTip: "Adicione um scanner de segredos no CI do repositório GitOps; ele barra o erro humano.",
        securityAlert: "Segredo comitado é comprometido para sempre: rotacione, não apenas remova o arquivo.",
        interviewQuestion: "Como você gerencia segredos em um fluxo GitOps?",
        glossary: [
          { term: "External Secrets", definition: "Operador que sincroniza segredos de um cofre externo para Secrets do cluster." },
          { term: "SOPS", definition: "Ferramenta que encripta valores dentro de arquivos YAML/JSON usando KMS ou PGP." },
        ],
        printQuestLink: "Migrar a senha do banco do PrintQuest para o cofre com External Secrets.",
        quiz: [
          {
            question: "Base64 em um Secret do Kubernetes oferece:",
            options: ["Criptografia forte", "Apenas codificação, sem proteção", "Assinatura digital", "Rotação automática"],
            answerIndex: 1,
            explanation: "Base64 é codificação reversível; proteção vem de RBAC, criptografia no etcd e cofres.",
          },
        ],
      },
      {
        id: "l-9-5",
        moduleId: "mod-9",
        title: "Pipeline de imagem + GitOps: o fluxo completo",
        duration: 40,
        difficulty: "Avançado",
        tools: ["GitHub Actions", "ArgoCD", "Kustomize"],
        xp: 25,
        objectives: ["Conectar CI de imagem a atualização de manifests", "Automatizar bump de versão por PR", "Definir governança de deploy"],
        body: [
          "O fluxo maduro tem dois repositórios e dois papéis. O CI da aplicação testa, constrói e publica a imagem com tag imutável. Em seguida, um passo abre PR no repositório GitOps atualizando a tag do overlay do ambiente. Quem revisa esse PR está autorizando o deploy.",
          "Para staging, esse PR pode ter merge automático — feedback rápido é mais valioso que cerimônia. Para produção, revisão humana e janela definida. Assim o mesmo mecanismo atende dois níveis de risco sem ferramentas diferentes.",
          "Alternativa: ArgoCD Image Updater observa o registry e atualiza a tag automaticamente. É conveniente, mas reduz a rastreabilidade de 'quem decidiu implantar'. Em produção, prefira o PR explícito.",
        ],
        code: [
          {
            label: "CI abre PR no repositório GitOps",
            language: "yaml",
            code: `name: promover-staging
on:
  workflow_run:
    workflows: [ci]
    types: [completed]
    branches: [main]

permissions:
  contents: read

jobs:
  bump:
    if: github.event.workflow_run.conclusion == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          repository: tiago/printquest-gitops
          token: \${{ secrets.GITOPS_PR_TOKEN }}
      - uses: imranismail/setup-kustomize@v2
      - name: Atualizar tag da imagem no overlay de staging
        run: |
          cd overlays/staging
          kustomize edit set image ghcr.io/tiago/printquest/api=ghcr.io/tiago/printquest/api:sha-\${{ github.event.workflow_run.head_sha }}
      - uses: peter-evans/create-pull-request@v6
        with:
          token: \${{ secrets.GITOPS_PR_TOKEN }}
          branch: bump/staging-\${{ github.event.workflow_run.head_sha }}
          title: "chore(staging): atualiza api para sha-\${{ github.event.workflow_run.head_sha }}"
          body: "Promocao automatica apos CI verde na main."`,
            securityNote:
              "O token de acesso ao repositório GitOps deve permitir apenas abrir PR, nunca fazer push direto na main.",
          },
        ],
        whyItMatters: "Esta é a arquitetura de entrega que as vagas de Platform Engineering descrevem hoje.",
        commonMistake: "Dar push direto na main do repositório GitOps pelo pipeline, eliminando a revisão.",
        productionTip: "Registre no PR o link do build, os testes e o digest da imagem: revisão informada em trinta segundos.",
        interviewQuestion: "Descreva o caminho de um commit até produção em uma arquitetura GitOps.",
        glossary: [
          { term: "Image Updater", definition: "Componente que atualiza tags de imagem automaticamente a partir do registry." },
          { term: "promoção automática", definition: "Atualização automatizada de manifests após validação em CI." },
        ],
        printQuestLink: "Automatizar a promoção do PrintQuest para staging após CI verde.",
        quiz: [
          {
            question: "Qual prática preserva a rastreabilidade do deploy em GitOps?",
            options: [
              "Push direto do pipeline na main do GitOps",
              "PR com a tag da imagem e revisão para produção",
              "Editar manifests no cluster",
              "Usar sempre latest",
            ],
            answerIndex: 1,
            explanation: "O PR registra quem autorizou, o que mudou e com base em qual validação.",
          },
        ],
      },
    ],
  },
];
