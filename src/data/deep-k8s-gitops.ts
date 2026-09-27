import type { LessonDeep } from "./deep-redes-git";

/** Aprofundamento dos módulos 8 (Kubernetes/Helm) e 9 (GitOps/ArgoCD). */
export const DEEP_K8S_GITOPS: Record<string, LessonDeep> = {
  "l-8-1": {
    body: [
      "<h3>1. Por que Kubernetes existe</h3><p>Rodar um contêiner é fácil; rodar centenas, em várias máquinas, reiniciando os que caem, distribuindo carga e trocando versões sem parar o serviço, não é. O Kubernetes é um <strong>orquestrador</strong>: você descreve o estado desejado e ele trabalha sem parar para que a realidade fique igual à descrição.</p>",
      "<h3>2. Control plane: o cérebro</h3><ul><li><strong>kube-apiserver</strong>: a única porta de entrada; tudo (kubectl, controllers, kubelet) conversa com ele</li><li><strong>etcd</strong>: banco chave-valor com todo o estado do cluster — faça backup</li><li><strong>kube-scheduler</strong>: escolhe em qual nó cada Pod vai rodar</li><li><strong>kube-controller-manager</strong>: roda os controllers (Deployment, ReplicaSet, Node…)</li></ul>",
      "<h3>3. Nós de trabalho: os músculos</h3><p>Cada nó roda o <strong>kubelet</strong> (garante que os contêineres do Pod estão de pé), o <strong>container runtime</strong> (containerd) e o <strong>kube-proxy</strong> ou um CNI com eBPF (regras de rede dos Services).</p>",
      "<h3>4. O loop de reconciliação</h3><p>Todo controller faz o mesmo ciclo: <em>observar</em> o estado atual → <em>comparar</em> com o desejado → <em>agir</em> para diminuir a diferença → repetir. Se você apaga um Pod de um Deployment com 3 réplicas, o ReplicaSet percebe que há 2 e cria outro. Isso é o que torna o sistema auto-curável.</p>",
      "<h3>5. Declarativo vs imperativo</h3><p><code>kubectl run</code> é imperativo (\"faça isto agora\"). <code>kubectl apply -f</code> é declarativo (\"quero que seja assim\"). Em produção use sempre declarativo e versionado em Git — é a base do GitOps do próximo módulo.</p>",
      "<h3>6. Namespaces e contexto</h3><p>Namespaces separam times e ambientes dentro do cluster (quota, RBAC, nomes). Sempre confira o contexto com <code>kubectl config current-context</code> antes de um comando destrutivo — aplicar em produção achando que é dev é um erro clássico.</p>",
      "<h3>7. Checagem final</h3><p>Você deve explicar o caminho de um <code>kubectl apply</code> até o contêiner rodar: apiserver grava no etcd → scheduler escolhe nó → kubelet do nó puxa a imagem e inicia o contêiner.</p>",
    ],
    code: [
      {
        label: "Explorando o cluster pela primeira vez",
        language: "bash",
        code: `kind create cluster --name cloudshop     # cluster local em Docker
kubectl get nodes -o wide                  # nós, versão e IPs
kubectl get pods -n kube-system            # componentes do control plane
kubectl api-resources | head               # tipos de objeto que o cluster conhece
kubectl explain deployment.spec.replicas   # documentação de qualquer campo
# Veja a reconciliação acontecer:
kubectl create deployment web --image=nginx --replicas=3
kubectl delete pod -l app=web --wait=false
kubectl get pods -l app=web -w             # novos Pods aparecem sozinhos`,
      },
    ],
    glossary: [
      { term: "etcd", definition: "Banco chave-valor distribuído que guarda todo o estado do cluster." },
      { term: "kubelet", definition: "Agente em cada nó que executa e vigia os contêineres dos Pods." },
      { term: "Reconciliação", definition: "Ciclo contínuo de comparar estado desejado e atual e corrigir a diferença." },
      { term: "Namespace", definition: "Divisão lógica do cluster para isolar nomes, permissões e quotas." },
    ],
    quiz: [
      {
        question: "Você apaga manualmente um Pod de um Deployment com 3 réplicas. O que acontece?",
        options: ["Fica com 2 réplicas até novo deploy", "O ReplicaSet cria um novo Pod para voltar a 3", "O Deployment é apagado", "O nó reinicia"],
        answerIndex: 1,
        explanation: "O controller reconcilia o estado atual (2) com o desejado (3) e cria um novo Pod.",
      },
      {
        question: "Qual componente decide em qual nó um Pod vai rodar?",
        options: ["kubelet", "etcd", "kube-scheduler", "kube-proxy"],
        answerIndex: 2,
        explanation: "O scheduler avalia recursos, afinidades e taints para escolher o nó.",
      },
    ],
  },
  "l-8-2": {
    body: [
      "<h3>1. Pod: a menor unidade</h3><p>Um Pod é um ou mais contêineres que compartilham rede (mesmo IP) e volumes. Pods são descartáveis: nunca crie Pods soltos em produção, crie um controller que os recria.</p>",
      "<h3>2. Deployment e ReplicaSet</h3><p>O Deployment gerencia ReplicaSets, que gerenciam Pods. Ao trocar a imagem, o Deployment cria um novo ReplicaSet e faz <strong>rolling update</strong>: sobe Pods novos e derruba antigos aos poucos, controlado por <code>maxSurge</code> e <code>maxUnavailable</code>.</p>",
      "<h3>3. Labels e selectors: a cola de tudo</h3><p>Deployment encontra seus Pods por labels; Service encontra para onde mandar tráfego por labels. Se o selector não bate com as labels do template, nada funciona — é a primeira coisa a conferir.</p>",
      "<h3>4. Service: endereço estável</h3><ul><li><strong>ClusterIP</strong>: IP interno e nome DNS (<code>api.cloudshop.svc.cluster.local</code>)</li><li><strong>NodePort</strong>: porta em todos os nós (uso raro)</li><li><strong>LoadBalancer</strong>: pede um balanceador à nuvem</li></ul><p>O Service mantém uma lista de endpoints com os IPs dos Pods prontos.</p>",
      "<h3>5. ConfigMap e Secret</h3><p>Configuração fica fora da imagem: ConfigMap para dados comuns, Secret para sensíveis. Atenção: Secret é só base64, não criptografia — habilite criptografia do etcd e restrinja com RBAC. Injete como variáveis (<code>envFrom</code>) ou arquivos (volume).</p>",
      "<h3>6. Rollout na prática</h3><p><code>kubectl rollout status</code> acompanha, <code>rollout history</code> mostra versões e <code>rollout undo</code> volta. Mudar só um ConfigMap não reinicia Pods; use um hash da config como anotação (Helm faz isso fácil).</p>",
    ],
    code: [
      {
        label: "API do CloudShop: Deployment + Service + ConfigMap",
        language: "yaml",
        code: `apiVersion: v1
kind: ConfigMap
metadata: { name: api-config, namespace: cloudshop }
data:
  LOG_LEVEL: info
  DB_HOST: postgres.cloudshop.svc.cluster.local
---
apiVersion: apps/v1
kind: Deployment
metadata: { name: api, namespace: cloudshop }
spec:
  replicas: 3
  strategy:
    rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }   # nunca fica abaixo de 3
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }                  # precisa bater com o selector
    spec:
      containers:
        - name: api
          image: ghcr.io/cloudshop/api:1.4.2              # tag fixa, nunca latest
          ports: [{ containerPort: 3000 }]
          envFrom:
            - configMapRef: { name: api-config }
            - secretRef: { name: api-db }                 # senha do banco
---
apiVersion: v1
kind: Service
metadata: { name: api, namespace: cloudshop }
spec:
  selector: { app: api }
  ports: [{ port: 80, targetPort: 3000 }]`,
      },
      {
        label: "Atualizar e voltar versão",
        language: "bash",
        code: `kubectl -n cloudshop set image deploy/api api=ghcr.io/cloudshop/api:1.5.0
kubectl -n cloudshop rollout status deploy/api
kubectl -n cloudshop get endpoints api      # IPs dos Pods prontos
kubectl -n cloudshop rollout undo deploy/api   # volta para a versão anterior`,
      },
    ],
    glossary: [
      { term: "ReplicaSet", definition: "Garante um número fixo de Pods iguais; é gerenciado pelo Deployment." },
      { term: "Rolling update", definition: "Troca gradual de Pods antigos por novos sem indisponibilidade." },
      { term: "Endpoints", definition: "Lista de IPs de Pods prontos para os quais o Service envia tráfego." },
    ],
    quiz: [
      {
        question: "O Service não entrega tráfego e 'kubectl get endpoints' está vazio. Causa mais provável?",
        options: ["Imagem grande", "Selector do Service não bate com as labels dos Pods (ou Pods não prontos)", "Falta de ConfigMap", "Namespace com letra maiúscula"],
        answerIndex: 1,
        explanation: "Endpoints vazios significam que nenhum Pod pronto corresponde ao selector.",
      },
      {
        question: "Um Secret do Kubernetes, por padrão, é:",
        options: ["Criptografado com AES", "Apenas codificado em base64", "Guardado fora do etcd", "Visível só para root"],
        answerIndex: 1,
        explanation: "Base64 não é segurança; é preciso criptografia do etcd, RBAC ou um gerenciador externo.",
      },
    ],
  },
  "l-8-3": {
    body: [
      "<h3>1. O problema da exposição</h3><p>Um LoadBalancer por serviço custa caro e não entende HTTP. O <strong>Ingress</strong> define regras de roteamento HTTP(S) por host e caminho, e um <strong>Ingress Controller</strong> (ingress-nginx, Traefik, AWS Load Balancer Controller) as executa atrás de um único balanceador.</p>",
      "<h3>2. Regras por host e path</h3><p><code>loja.cloudshop.dev/</code> vai para o frontend, <code>loja.cloudshop.dev/api</code> para a API. O campo <code>ingressClassName</code> escolhe qual controller atende.</p>",
      "<h3>3. TLS automático com cert-manager</h3><p>O cert-manager conversa com a Let's Encrypt via ACME, cria o certificado num Secret e renova antes de vencer. Você só declara um <code>ClusterIssuer</code> e a anotação no Ingress.</p>",
      "<h3>4. Gateway API: o sucessor</h3><p>A Gateway API separa papéis (infra cuida do Gateway, time cuida das HTTPRoutes) e suporta divisão de tráfego por peso — útil para canary. Vagas novas já pedem conhecê-la.</p>",
      "<h3>5. Depurando</h3><p>Siga o caminho: DNS aponta para o balanceador? → controller recebeu a regra (<code>kubectl describe ingress</code>)? → Service tem endpoints? → Pod responde na porta? Erro 503 do controller costuma significar Service sem endpoints.</p>",
    ],
    code: [
      {
        label: "Ingress com TLS automático",
        language: "yaml",
        code: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: cloudshop
  namespace: cloudshop
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod   # gera e renova o certificado
spec:
  ingressClassName: nginx
  tls:
    - hosts: [loja.cloudshop.dev]
      secretName: cloudshop-tls
  rules:
    - host: loja.cloudshop.dev
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend: { service: { name: api, port: { number: 80 } } }
          - path: /
            pathType: Prefix
            backend: { service: { name: frontend, port: { number: 80 } } }`,
      },
    ],
    glossary: [
      { term: "Ingress Controller", definition: "Proxy que lê objetos Ingress e roteia o tráfego HTTP de fato." },
      { term: "cert-manager", definition: "Operador que emite e renova certificados TLS automaticamente." },
      { term: "Gateway API", definition: "API moderna de roteamento que substitui o Ingress com mais recursos." },
    ],
    quiz: [
      {
        question: "Você cria um Ingress mas nada acontece. O que falta com mais frequência?",
        options: ["Um Ingress Controller instalado / ingressClassName correto", "Mais réplicas", "Um PersistentVolume", "Um CronJob"],
        answerIndex: 0,
        explanation: "O objeto Ingress é só uma regra; sem controller ninguém a executa.",
      },
      {
        question: "Quem renova o certificado Let's Encrypt no cluster?",
        options: ["kubelet", "cert-manager", "etcd", "O navegador"],
        answerIndex: 1,
        explanation: "O cert-manager acompanha a validade e renova antes de expirar.",
      },
    ],
  },
  "l-8-4": {
    body: [
      "<h3>1. Três probes, três perguntas</h3><ul><li><strong>startupProbe</strong>: \"já terminou de iniciar?\" — protege apps lentos no boot</li><li><strong>readinessProbe</strong>: \"pode receber tráfego?\" — se falha, sai do Service, mas não reinicia</li><li><strong>livenessProbe</strong>: \"travou?\" — se falha, o kubelet reinicia o contêiner</li></ul><p>Nunca faça a liveness depender do banco: se o banco cair, todos os Pods reiniciam em cascata.</p>",
      "<h3>2. Requests e limits</h3><p><strong>Request</strong> é o que o scheduler reserva; <strong>limit</strong> é o teto. Passar do limite de memória = <code>OOMKilled</code>; passar do de CPU = lentidão (throttling). Defina requests sempre; muitos times evitam limite de CPU e mantêm o de memória.</p>",
      "<h3>3. Classes de QoS</h3><p>Guaranteed (request = limit), Burstable e BestEffort (sem nada). Sob pressão de memória, BestEffort é despejado primeiro.</p>",
      "<h3>4. HPA: escalar por métrica</h3><p>O HorizontalPodAutoscaler ajusta réplicas com base em CPU (percentual do request!), memória ou métricas customizadas. Sem requests, o HPA de CPU não funciona. Para escalar nós, use Cluster Autoscaler ou Karpenter.</p>",
      "<h3>5. PodDisruptionBudget</h3><p>Garante um mínimo de Pods durante manutenções de nó (drain). Sem PDB, um upgrade de cluster pode derrubar todas as réplicas de uma vez.</p>",
      "<h3>6. RBAC: quem pode o quê</h3><p>Role/ClusterRole listam verbos sobre recursos; RoleBinding liga a um usuário, grupo ou ServiceAccount. Cada app deve ter sua ServiceAccount com o mínimo — e <code>automountServiceAccountToken: false</code> se não fala com a API.</p>",
    ],
    code: [
      {
        label: "Probes, recursos e HPA da API",
        language: "yaml",
        code: `# trecho do container da API
readinessProbe:
  httpGet: { path: /ready, port: 3000 }   # checa dependências leves
  periodSeconds: 5
livenessProbe:
  httpGet: { path: /healthz, port: 3000 } # só "o processo responde?"
  initialDelaySeconds: 10
  failureThreshold: 3
resources:
  requests: { cpu: 200m, memory: 256Mi }
  limits:   { memory: 512Mi }
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: api, namespace: cloudshop }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: api }
  minReplicas: 3
  maxReplicas: 15
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 70 } }`,
      },
      {
        label: "RBAC mínimo para um job de leitura",
        language: "yaml",
        code: `apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata: { name: read-pods, namespace: cloudshop }
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata: { name: read-pods, namespace: cloudshop }
subjects: [{ kind: ServiceAccount, name: reporter, namespace: cloudshop }]
roleRef: { kind: Role, name: read-pods, apiGroup: rbac.authorization.k8s.io }
# teste: kubectl auth can-i delete pods --as=system:serviceaccount:cloudshop:reporter -n cloudshop  -> no`,
      },
    ],
    glossary: [
      { term: "OOMKilled", definition: "Contêiner encerrado por ultrapassar o limite de memória." },
      { term: "Throttling", definition: "Redução forçada de CPU quando o contêiner atinge o limite." },
      { term: "PDB", definition: "PodDisruptionBudget: mínimo de Pods disponíveis durante interrupções voluntárias." },
      { term: "ServiceAccount", definition: "Identidade usada por Pods para falar com a API do Kubernetes." },
    ],
    quiz: [
      {
        question: "A readinessProbe falha. O que o Kubernetes faz?",
        options: ["Reinicia o contêiner", "Tira o Pod dos endpoints do Service", "Apaga o Deployment", "Nada"],
        answerIndex: 1,
        explanation: "Readiness controla tráfego; quem reinicia é a liveness.",
      },
      {
        question: "O HPA por CPU não escala. Qual o primeiro item a checar?",
        options: ["Se há requests de CPU definidos e metrics-server instalado", "Se a imagem é alpine", "Se há Ingress", "Se o namespace é default"],
        answerIndex: 0,
        explanation: "A utilização é calculada sobre o request e depende do metrics-server.",
      },
    ],
  },
  "l-8-5": {
    body: [
      "<h3>1. O problema que o Helm resolve</h3><p>Dev, staging e produção usam os mesmos manifestos com diferenças (réplicas, domínio, recursos). Copiar YAML gera divergência. O Helm usa <strong>templates</strong> + <strong>values</strong> e empacota tudo em um <strong>chart</strong> versionado.</p>",
      "<h3>2. Estrutura de um chart</h3><ul><li><code>Chart.yaml</code>: nome, versão do chart e appVersion</li><li><code>values.yaml</code>: padrões</li><li><code>templates/</code>: manifestos com Go template</li><li><code>values-prod.yaml</code>: sobrescritas por ambiente</li></ul>",
      "<h3>3. Releases e histórico</h3><p>Cada <code>helm upgrade</code> cria uma revisão guardada no cluster. <code>helm rollback api 3</code> volta exatamente para a revisão 3. Use <code>--atomic</code> para desfazer sozinho se o deploy falhar.</p>",
      "<h3>4. Antes de aplicar, veja</h3><p><code>helm template</code> renderiza localmente; <code>helm lint</code> valida; o plugin <code>helm diff</code> mostra o que vai mudar — o equivalente ao <code>terraform plan</code>.</p>",
      "<h3>5. Distribuição</h3><p>Charts podem ser publicados como artefatos OCI no mesmo registry das imagens (<code>helm push</code>) e assinados. Alternativa sem templates: Kustomize, com bases e overlays.</p>",
    ],
    code: [
      {
        label: "Template com valores e checksum de config",
        language: "yaml",
        code: `# templates/deployment.yaml (trecho)
spec:
  replicas: {{ .Values.replicas }}
  template:
    metadata:
      annotations:
        # muda quando o ConfigMap muda -> força restart dos Pods
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
    spec:
      containers:
        - name: api
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          resources: {{- toYaml .Values.resources | nindent 12 }}`,
      },
      {
        label: "Ciclo completo com Helm",
        language: "bash",
        code: `helm lint charts/api
helm template api charts/api -f values-prod.yaml | less       # ver o YAML final
helm diff upgrade api charts/api -f values-prod.yaml -n cloudshop
helm upgrade --install api charts/api -f values-prod.yaml -n cloudshop --atomic --timeout 5m
helm history api -n cloudshop
helm rollback api 3 -n cloudshop`,
      },
    ],
    glossary: [
      { term: "Chart", definition: "Pacote Helm com templates, valores padrão e metadados." },
      { term: "Release", definition: "Instância de um chart instalada no cluster, com histórico de revisões." },
      { term: "Kustomize", definition: "Ferramenta de customização de YAML por overlays, sem templates." },
    ],
    quiz: [
      {
        question: "O que faz 'helm upgrade --atomic'?",
        options: ["Apaga o namespace", "Faz rollback automático se o upgrade falhar", "Ignora erros", "Cria um novo cluster"],
        answerIndex: 1,
        explanation: "Com --atomic, falha ou timeout desfazem a mudança automaticamente.",
      },
      {
        question: "Qual comando mostra o YAML final sem aplicar nada?",
        options: ["helm install", "helm template", "helm rollback", "helm push"],
        answerIndex: 1,
        explanation: "helm template renderiza localmente os manifestos.",
      },
    ],
  },
  "l-9-1": {
    body: [
      "<h3>1. Os quatro princípios</h3><ol><li><strong>Declarativo</strong>: o sistema é descrito como dados</li><li><strong>Versionado e imutável</strong>: o Git guarda cada estado</li><li><strong>Puxado automaticamente</strong>: um agente no cluster busca as mudanças</li><li><strong>Reconciliado continuamente</strong>: diferenças são detectadas e corrigidas</li></ol>",
      "<h3>2. Push vs pull</h3><p>No modelo push, o pipeline tem credencial de admin do cluster — alvo valioso para ataques. No pull, só o agente dentro do cluster aplica mudanças; o CI apenas escreve no Git.</p>",
      "<h3>3. Repositório de app vs de configuração</h3><p>O código fica em <code>cloudshop-app</code>; o estado desejado dos ambientes em <code>cloudshop-gitops</code>. Separar evita loops de CI e dá permissões diferentes: muitos podem mexer no código, poucos aprovam produção.</p>",
      "<h3>4. Estrutura típica</h3><p>Pastas <code>apps/</code> (cada serviço com base e overlays por ambiente), <code>clusters/</code> (o que cada cluster instala) e <code>platform/</code> (ingress, cert-manager, monitoramento). Prefira pastas por ambiente a branches por ambiente — merges entre branches geram divergência escondida.</p>",
      "<h3>5. O Git vira trilha de auditoria</h3><p>Quem mudou, quando, por quê e quem aprovou: tudo está no histórico e nos pull requests. Rollback é um <code>git revert</code>.</p>",
    ],
    code: [
      {
        label: "Estrutura do repositório cloudshop-gitops",
        language: "text",
        code: `cloudshop-gitops/
├── apps/
│   └── api/
│       ├── base/                 # Deployment, Service, HPA comuns
│       └── overlays/
│           ├── staging/          # 2 réplicas, domínio de staging
│           └── prod/             # 6 réplicas, recursos maiores
├── platform/
│   ├── ingress-nginx/
│   └── cert-manager/
└── clusters/
    ├── staging/apps.yaml         # App of Apps do staging
    └── prod/apps.yaml`,
      },
    ],
    glossary: [
      { term: "GitOps", definition: "Operar sistemas tendo o Git como fonte da verdade, com reconciliação automática." },
      { term: "Modelo pull", definition: "Agente no cluster busca e aplica as mudanças, sem credencial externa de admin." },
      { term: "Overlay", definition: "Camada de ajustes por ambiente sobre uma base comum." },
    ],
    quiz: [
      {
        question: "Qual a principal vantagem de segurança do GitOps pull?",
        options: ["Builds mais rápidos", "O CI não precisa de credencial de admin do cluster", "Dispensa testes", "Não usa Git"],
        answerIndex: 1,
        explanation: "Só o agente interno aplica mudanças; o pipeline só escreve no repositório.",
      },
      {
        question: "Como se faz rollback em GitOps?",
        options: ["kubectl delete", "git revert do commit problemático", "Reiniciar o cluster", "Editar o Pod à mão"],
        answerIndex: 1,
        explanation: "O agente reconcilia para o estado anterior registrado no Git.",
      },
    ],
  },
  "l-9-2": {
    body: [
      "<h3>1. Componentes do ArgoCD</h3><ul><li><strong>repo-server</strong>: clona o Git e renderiza Helm/Kustomize</li><li><strong>application-controller</strong>: compara o renderizado com o cluster e sincroniza</li><li><strong>argocd-server</strong>: API e interface web</li></ul>",
      "<h3>2. O objeto Application</h3><p>Liga uma <em>source</em> (repo, caminho, revisão) a um <em>destination</em> (cluster, namespace). Status importantes: <strong>Synced/OutOfSync</strong> (igual ao Git?) e <strong>Healthy/Degraded/Progressing</strong> (está funcionando?).</p>",
      "<h3>3. Políticas de sync</h3><p><code>automated</code> aplica sozinho; <code>prune</code> apaga o que saiu do Git; <code>selfHeal</code> desfaz mudanças manuais. Comece com automated em staging e aprovação manual em produção, se o time preferir.</p>",
      "<h3>4. Ordem e hooks</h3><p><code>sync-wave</code> ordena recursos (CRDs e namespaces antes dos apps); hooks <code>PreSync</code> rodam migrações de banco antes da nova versão.</p>",
      "<h3>5. App of Apps e ApplicationSet</h3><p>Uma Application que cria outras Applications permite subir um cluster inteiro a partir de um único apontamento. O ApplicationSet gera Applications por lista, pastas ou clusters.</p>",
      "<h3>6. Acesso e projetos</h3><p><code>AppProject</code> limita quais repositórios, clusters e tipos de recurso cada time pode usar. Integre SSO e desative o usuário admin local após configurar.</p>",
    ],
    code: [
      {
        label: "Application da API em staging",
        language: "yaml",
        code: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: api-staging
  namespace: argocd
spec:
  project: cloudshop
  source:
    repoURL: https://github.com/cloudshop/cloudshop-gitops.git
    targetRevision: main
    path: apps/api/overlays/staging
  destination:
    server: https://kubernetes.default.svc
    namespace: cloudshop-staging
  syncPolicy:
    automated: { prune: true, selfHeal: true }
    syncOptions: [CreateNamespace=true]`,
      },
      {
        label: "Operando pela CLI",
        language: "bash",
        code: `argocd app list
argocd app get api-staging        # Sync status + Health
argocd app diff api-staging       # o que difere do Git
argocd app sync api-staging
argocd app history api-staging`,
      },
    ],
    glossary: [
      { term: "Application", definition: "Recurso do ArgoCD que liga uma fonte Git a um destino no cluster." },
      { term: "selfHeal", definition: "Opção que desfaz automaticamente alterações feitas fora do Git." },
      { term: "Sync wave", definition: "Número que define a ordem de aplicação dos recursos." },
      { term: "ApplicationSet", definition: "Gerador de várias Applications a partir de um modelo." },
    ],
    quiz: [
      {
        question: "Uma app aparece 'Synced' mas 'Degraded'. O que significa?",
        options: ["O Git não foi lido", "O cluster está igual ao Git, mas os recursos não estão saudáveis", "Tudo certo", "Falta permissão no Git"],
        answerIndex: 1,
        explanation: "Sync compara com o Git; Health avalia se os recursos funcionam.",
      },
      {
        question: "Para rodar uma migração de banco antes da nova versão, use:",
        options: ["Hook PreSync", "prune", "HPA", "NodePort"],
        answerIndex: 0,
        explanation: "Hooks PreSync executam Jobs antes do sync principal.",
      },
    ],
  },
  "l-9-3": {
    body: [
      "<h3>1. O que é drift</h3><p>Drift é a diferença entre o que está no Git e o que roda no cluster — normalmente causada por um <code>kubectl edit</code> \"só para testar\". Com selfHeal ligado, o ArgoCD desfaz em segundos; sem ele, a app fica OutOfSync e alerta.</p>",
      "<h3>2. Diferenças legítimas</h3><p>Alguns campos mudam sozinhos (réplicas controladas pelo HPA, campos preenchidos por webhooks). Use <code>ignoreDifferences</code> para não brigar com eles.</p>",
      "<h3>3. Rollback do jeito certo</h3><p>Rollback pela interface do ArgoCD é temporário e desliga o auto-sync. O caminho definitivo é <code>git revert</code>: o histórico fica correto e o próximo sync não traz o erro de volta.</p>",
      "<h3>4. Promoção entre ambientes</h3><p>Promover é copiar a mesma versão (tag ou digest da imagem) de staging para prod via pull request. Artefato imutável: o que foi testado é exatamente o que vai para produção.</p>",
      "<h3>5. Entregas progressivas</h3><p>Argo Rollouts troca o Deployment por um Rollout com canary (10% → 50% → 100%) e análise automática de métricas; se a taxa de erro sobe, aborta sozinho.</p>",
    ],
    code: [
      {
        label: "Promovendo e revertendo com Git",
        language: "bash",
        code: `# promover a versão testada em staging para prod
cd cloudshop-gitops/apps/api/overlays/prod
kustomize edit set image ghcr.io/cloudshop/api=ghcr.io/cloudshop/api:1.5.0
git checkout -b promote/api-1.5.0 && git commit -am "promote(prod): api 1.5.0"
gh pr create --title "Promove api 1.5.0 para prod" --body "Validado em staging"
# deu problema? reverter o merge:
git revert -m 1 <sha-do-merge> && git push`,
      },
      {
        label: "Ignorando réplicas gerenciadas pelo HPA",
        language: "yaml",
        code: `spec:
  ignoreDifferences:
    - group: apps
      kind: Deployment
      jsonPointers: [/spec/replicas]`,
      },
    ],
    glossary: [
      { term: "Drift", definition: "Divergência entre o estado declarado no Git e o real no cluster." },
      { term: "Promoção", definition: "Levar o mesmo artefato validado de um ambiente para o próximo." },
      { term: "Canary", definition: "Liberar a nova versão para uma fração pequena do tráfego antes de todos." },
    ],
    quiz: [
      {
        question: "Por que preferir git revert ao rollback pela interface do ArgoCD?",
        options: ["É mais bonito", "Mantém o Git como fonte da verdade e evita que o erro volte no próximo sync", "Não precisa de PR", "Apaga o cluster"],
        answerIndex: 1,
        explanation: "O rollback pela UI é temporário; o Git continua apontando para a versão ruim.",
      },
      {
        question: "HPA muda as réplicas e o ArgoCD mostra OutOfSync. Solução?",
        options: ["Desligar o HPA", "ignoreDifferences em /spec/replicas", "Apagar a app", "Usar NodePort"],
        answerIndex: 1,
        explanation: "Campos controlados por outro controller devem ser ignorados na comparação.",
      },
    ],
  },
  "l-9-4": {
    body: [
      "<h3>1. O dilema</h3><p>Tudo vai para o Git — menos senhas em texto claro. Duas saídas: guardar o segredo <strong>criptografado</strong> no Git (SOPS, Sealed Secrets) ou guardar só uma <strong>referência</strong> e buscar num cofre (External Secrets Operator).</p>",
      "<h3>2. External Secrets Operator</h3><p>Um <code>SecretStore</code> diz como acessar o cofre (AWS Secrets Manager, Vault, GCP) usando identidade do Pod (IRSA), sem chave fixa. Um <code>ExternalSecret</code> diz qual segredo buscar e cria o Secret do Kubernetes, renovando periodicamente.</p>",
      "<h3>3. SOPS com age</h3><p>O SOPS criptografa só os valores do YAML, mantendo as chaves legíveis para revisar diffs. O ArgoCD descriptografa com um plugin (ou KSOPS) usando a chave privada guardada apenas no cluster.</p>",
      "<h3>4. Rotação e vazamento</h3><p>Com cofre externo, rotacionar é trocar no cofre e esperar o refresh. Se um segredo for commitado em claro: revogue primeiro, depois limpe o histórico — remover o arquivo não basta.</p>",
      "<h3>5. Defesa extra</h3><p>Ative secret scanning no GitHub, hooks como gitleaks no pre-commit e RBAC que impede listar Secrets para a maioria das pessoas.</p>",
    ],
    code: [
      {
        label: "ExternalSecret buscando a senha do banco",
        language: "yaml",
        code: `apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata: { name: api-db, namespace: cloudshop }
spec:
  refreshInterval: 1h
  secretStoreRef: { name: aws-secrets, kind: ClusterSecretStore }
  target: { name: api-db }              # Secret criado no cluster
  data:
    - secretKey: DB_PASSWORD
      remoteRef: { key: cloudshop/prod/db, property: password }`,
        securityNote: "O Git só guarda a referência; o valor nunca sai do cofre em texto claro.",
      },
      {
        label: "Criptografando com SOPS + age",
        language: "bash",
        code: `age-keygen -o key.txt                         # chave privada: nunca no Git
sops --encrypt --age $(grep public key.txt | cut -d: -f2) \\
  --encrypted-regex '^(data|stringData)$' secret.yaml > secret.enc.yaml
sops --decrypt secret.enc.yaml | kubectl apply -f -   # só para teste local
gitleaks detect --source .                     # procura segredos vazados`,
      },
    ],
    glossary: [
      { term: "External Secrets Operator", definition: "Operador que sincroniza segredos de cofres externos para Secrets do Kubernetes." },
      { term: "SOPS", definition: "Ferramenta que criptografa valores em arquivos YAML/JSON mantendo a estrutura legível." },
      { term: "Sealed Secrets", definition: "Segredos criptografados com a chave pública de um controller no cluster." },
    ],
    quiz: [
      {
        question: "Uma senha foi commitada em texto claro. Primeiro passo?",
        options: ["Apagar o arquivo", "Revogar/rotacionar a senha imediatamente", "Renomear o repositório", "Esperar"],
        answerIndex: 1,
        explanation: "O histórico e clones já podem ter a senha; revogar vem antes de limpar.",
      },
      {
        question: "No External Secrets, o que fica no Git?",
        options: ["A senha em base64", "Apenas a referência ao segredo no cofre", "A chave privada", "Nada"],
        answerIndex: 1,
        explanation: "O ExternalSecret aponta para o cofre; o valor é buscado no cluster.",
      },
    ],
  },
  "l-9-5": {
    body: [
      "<h3>1. O fluxo ponta a ponta</h3><ol><li>Dev abre PR em <code>cloudshop-app</code></li><li>CI roda testes, lint e scan</li><li>No merge, build da imagem com tag do commit, SBOM e assinatura</li><li>CI abre PR (ou commit) em <code>cloudshop-gitops</code> trocando a tag de staging</li><li>ArgoCD sincroniza staging; smoke tests validam</li><li>Promoção para prod via PR aprovado</li></ol>",
      "<h3>2. Tag imutável e digest</h3><p>Use a tag do commit (<code>sha-abc1234</code>) ou, melhor, o digest <code>@sha256:…</code>. <code>latest</code> impede saber o que roda e quebra rollback.</p>",
      "<h3>3. Quem atualiza o Git</h3><p>Opções: o próprio CI com um GitHub App de escopo mínimo, ou o Argo CD Image Updater observando o registry. Em ambos, a credencial só escreve no repo de config, nunca no cluster.</p>",
      "<h3>4. Garantindo a cadeia</h3><p>Uma política no cluster (Kyverno ou Sigstore policy-controller) só admite imagens assinadas pelo seu pipeline. Assim, mesmo alguém com acesso ao Git não sobe imagem desconhecida.</p>",
      "<h3>5. Medindo o resultado</h3><p>Com o fluxo completo você mede as métricas DORA: frequência de deploy (merges no gitops), lead time (commit → sync em prod), taxa de falha e tempo de recuperação (revert → sync).</p>",
    ],
    code: [
      {
        label: "Job do CI que atualiza o repositório GitOps",
        language: "yaml",
        code: `update-gitops:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - uses: actions/create-github-app-token@v1
      id: app
      with:
        app-id: \${{ vars.GITOPS_APP_ID }}
        private-key: \${{ secrets.GITOPS_APP_KEY }}
        repositories: cloudshop-gitops          # escopo mínimo
    - uses: actions/checkout@v4
      with: { repository: cloudshop/cloudshop-gitops, token: "\${{ steps.app.outputs.token }}" }
    - run: |
        cd apps/api/overlays/staging
        kustomize edit set image ghcr.io/cloudshop/api@\${{ needs.build.outputs.digest }}
        git config user.name "cloudshop-bot"
        git config user.email "bot@cloudshop.dev"
        git commit -am "chore(staging): api \${{ github.sha }}" && git push`,
      },
    ],
    glossary: [
      { term: "Digest", definition: "Hash sha256 que identifica uma imagem de forma imutável." },
      { term: "Image Updater", definition: "Componente do ArgoCD que atualiza tags no Git ao detectar novas imagens." },
      { term: "Admission policy", definition: "Regra que aceita ou rejeita recursos ao entrarem no cluster." },
    ],
    quiz: [
      {
        question: "Por que referenciar a imagem por digest em vez de 'latest'?",
        options: ["É menor", "É imutável: garante exatamente o artefato testado e permite rollback", "Dispensa registry", "O Kubernetes exige"],
        answerIndex: 1,
        explanation: "Tags podem ser movidas; o digest aponta sempre para o mesmo conteúdo.",
      },
      {
        question: "Que credencial o CI precisa ter no fluxo GitOps?",
        options: ["Admin do cluster de produção", "Escrita apenas no repositório de configuração", "Root nos nós", "Nenhuma"],
        answerIndex: 1,
        explanation: "O CI só escreve no Git; o ArgoCD aplica no cluster.",
      },
    ],
  },
};
