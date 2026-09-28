import type { LessonDeep } from "./deep-redes-git";

/** Aprofundamento dos módulos 10 (Observabilidade/SRE) e 11 (DevSecOps/FinOps/Projeto final). */
export const DEEP_SRE_FINAL: Record<string, LessonDeep> = {
  "l-10-1": {
    body: [
      "<h3>1. Monitorar vs observar</h3><p>Monitorar responde perguntas que você já conhecia (\"a CPU passou de 80%?\"). Observar permite responder perguntas novas sobre um problema que ninguém previu, olhando os dados que o sistema emite.</p>",
      "<h3>2. Os três sinais</h3><ul><li><strong>Métricas</strong>: números no tempo, baratos, ótimos para alertas e tendências</li><li><strong>Logs</strong>: eventos detalhados, ótimos para entender o que aconteceu</li><li><strong>Traces</strong>: o caminho de uma requisição por vários serviços, ótimos para achar onde está a lentidão</li></ul><p>O segredo é ligá-los: da métrica ao trace, do trace ao log, pelo mesmo <code>trace_id</code>.</p>",
      "<h3>3. Métodos RED e USE</h3><p><strong>RED</strong> para serviços: Rate (requisições/s), Errors (taxa de erro), Duration (latência). <strong>USE</strong> para recursos: Utilization, Saturation, Errors. Os quatro sinais de ouro do Google (latência, tráfego, erros, saturação) resumem os dois.</p>",
      "<h3>4. O que instrumentar primeiro</h3><ol><li>RED na borda (Ingress) e em cada API</li><li>Saturação de banco e filas</li><li>Logs estruturados em JSON com trace_id</li><li>Traces nas rotas críticas (checkout do CloudShop)</li></ol>",
      "<h3>5. Cuidado com cardinalidade</h3><p>Cada combinação de labels vira uma série no Prometheus. Colocar <code>user_id</code> ou URL completa como label explode memória e custo. Use labels com poucos valores (rota, método, status).</p>",
    ],
    code: [
      {
        label: "Log estruturado ligado ao trace",
        language: "json",
        code: `{"ts":"2026-03-10T14:02:11Z","level":"error","service":"api","route":"/checkout",
 "status":502,"duration_ms":1840,"trace_id":"4bf92f3577b34da6a3ce929d0e0e4736",
 "msg":"payment gateway timeout"}`,
      },
    ],
    glossary: [
      { term: "RED", definition: "Rate, Errors, Duration: métricas essenciais de um serviço." },
      { term: "USE", definition: "Utilization, Saturation, Errors: métricas essenciais de um recurso." },
      { term: "Cardinalidade", definition: "Quantidade de séries únicas geradas pelas combinações de labels." },
    ],
    quiz: [
      {
        question: "Qual label NÃO deve ir para uma métrica Prometheus?",
        options: ["method", "status_code", "user_id", "route"],
        answerIndex: 2,
        explanation: "user_id tem valores ilimitados e explode a cardinalidade.",
      },
      {
        question: "Para descobrir em qual serviço uma requisição ficou lenta, o sinal ideal é:",
        options: ["Métrica de CPU", "Trace distribuído", "Uptime", "Contagem de Pods"],
        answerIndex: 1,
        explanation: "O trace mostra a duração de cada etapa (span) no caminho.",
      },
    ],
  },
  "l-10-2": {
    body: [
      "<h3>1. Como o Prometheus funciona</h3><p>Ele <strong>puxa</strong> (scrape) métricas de endpoints <code>/metrics</code> em intervalos, guarda em um banco de séries temporais e avalia regras de alerta. No Kubernetes, o kube-prometheus-stack descobre alvos via <code>ServiceMonitor</code>.</p>",
      "<h3>2. Tipos de métrica</h3><ul><li><strong>Counter</strong>: só sobe (requisições totais) — use sempre com <code>rate()</code></li><li><strong>Gauge</strong>: sobe e desce (memória em uso)</li><li><strong>Histogram</strong>: distribui valores em buckets para calcular percentis</li></ul>",
      "<h3>3. PromQL essencial</h3><p><code>rate(x[5m])</code> dá a taxa por segundo; <code>sum by (route)</code> agrega; <code>histogram_quantile(0.95, …)</code> calcula o p95. Média de latência esconde problemas — alerte em percentis.</p>",
      "<h3>4. Alertas que valem plantão</h3><p>Alerte em <strong>sintomas</strong> que o usuário sente (erro, lentidão), não em causas (CPU alta). Todo alerta precisa de: <code>for</code> para evitar ruído, severidade, e link para runbook. Se ninguém precisa agir, não é alerta, é dashboard.</p>",
      "<h3>5. Alertmanager</h3><p>Agrupa, deduplica, silencia e roteia: crítico vai para o plantão (PagerDuty/Opsgenie), aviso vai para o chat.</p>",
    ],
    code: [
      {
        label: "Consultas PromQL do dia a dia",
        language: "promql",
        code: `# requisições por segundo por rota
sum by (route) (rate(http_requests_total{service="api"}[5m]))
# taxa de erro 5xx
sum(rate(http_requests_total{service="api",status=~"5.."}[5m]))
  / sum(rate(http_requests_total{service="api"}[5m]))
# latência p95
histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket{service="api"}[5m])))`,
      },
      {
        label: "Regra de alerta com runbook",
        language: "yaml",
        code: `groups:
  - name: cloudshop-api
    rules:
      - alert: ApiHighErrorRate
        expr: |
          sum(rate(http_requests_total{service="api",status=~"5.."}[5m]))
            / sum(rate(http_requests_total{service="api"}[5m])) > 0.05
        for: 10m                       # evita alertar por picos de segundos
        labels: { severity: critical }
        annotations:
          summary: "API com mais de 5% de erros"
          runbook_url: https://github.com/cloudshop/runbooks/blob/main/api-errors.md`,
      },
    ],
    glossary: [
      { term: "Scrape", definition: "Coleta periódica das métricas expostas por um alvo." },
      { term: "Counter", definition: "Métrica que só aumenta; lida com rate()." },
      { term: "Percentil p95", definition: "Valor abaixo do qual estão 95% das medições." },
    ],
    quiz: [
      {
        question: "Como consultar um counter corretamente?",
        options: ["Valor bruto", "Com rate() ou increase()", "Com avg()", "Com max()"],
        answerIndex: 1,
        explanation: "O valor bruto só cresce; o que importa é a taxa de variação.",
      },
      {
        question: "Para que serve o 'for: 10m' num alerta?",
        options: ["Repetir a cada 10 min", "Só disparar se a condição durar 10 minutos", "Apagar após 10 min", "Nada"],
        answerIndex: 1,
        explanation: "Reduz alarmes falsos causados por picos curtos.",
      },
    ],
  },
  "l-10-3": {
    body: [
      "<h3>1. Dashboard que ajuda num incidente</h3><p>Topo: os sinais de ouro do serviço. Meio: dependências (banco, fila, gateway de pagamento). Base: recursos (CPU, memória, Pods). Quem abre às 3h da manhã precisa entender em 10 segundos se o problema é aqui.</p>",
      "<h3>2. Variáveis e dashboards como código</h3><p>Variáveis (<code>$namespace</code>, <code>$service</code>) evitam um painel por serviço. Guarde os dashboards em JSON no Git e provisione por ConfigMap ou Terraform — sem cliques perdidos.</p>",
      "<h3>3. Loki: logs baratos</h3><p>O Loki indexa só labels (namespace, app), não o texto — por isso é barato. Promtail ou o Grafana Alloy coletam os logs dos nós. A consulta LogQL filtra por labels e depois pelo conteúdo.</p>",
      "<h3>4. Da métrica ao log</h3><p>Ao ver um pico de erro no gráfico, clique e abra os logs do mesmo intervalo e serviço; com trace_id no log, pule direto para o trace no Tempo.</p>",
    ],
    code: [
      {
        label: "LogQL: encontrar e contar erros",
        language: "logql",
        code: `{namespace="cloudshop", app="api"} |= "error"
{app="api"} | json | status >= 500 | line_format "{{.route}} {{.msg}}"
sum by (route) (count_over_time({app="api"} | json | status >= 500 [5m]))`,
      },
    ],
    glossary: [
      { term: "Loki", definition: "Sistema de logs que indexa apenas labels, reduzindo custo." },
      { term: "LogQL", definition: "Linguagem de consulta de logs do Loki." },
      { term: "Provisioning", definition: "Carregar dashboards e fontes de dados a partir de arquivos versionados." },
    ],
    quiz: [
      {
        question: "Por que o Loki é mais barato que soluções que indexam todo o texto?",
        options: ["Não guarda logs", "Indexa só labels, não o conteúdo", "Usa só memória", "Comprime em zip"],
        answerIndex: 1,
        explanation: "Índice pequeno reduz armazenamento e custo.",
      },
    ],
  },
  "l-10-4": {
    body: [
      "<h3>1. Trace e span</h3><p>Um <strong>trace</strong> é a história de uma requisição; cada etapa (chamada HTTP, query SQL) é um <strong>span</strong> com início, duração e atributos. O contexto viaja entre serviços no cabeçalho <code>traceparent</code> (W3C).</p>",
      "<h3>2. OpenTelemetry</h3><p>Padrão aberto com SDKs e auto-instrumentação para Node, Java, Python, Go. Você instrumenta uma vez e envia para qualquer backend (Tempo, Jaeger, Datadog).</p>",
      "<h3>3. O Collector</h3><p>Recebe dados via OTLP, processa (batch, remoção de dados sensíveis, sampling) e exporta. Rode como DaemonSet ou sidecar para desacoplar a app do fornecedor.</p>",
      "<h3>4. Sampling</h3><p>Guardar 100% dos traces custa caro. <em>Head sampling</em> decide no início (ex.: 10%); <em>tail sampling</em> no Collector guarda todos os com erro ou lentos e uma amostra do resto.</p>",
    ],
    code: [
      {
        label: "Auto-instrumentação da API Node",
        language: "bash",
        code: `npm install @opentelemetry/auto-instrumentations-node
export OTEL_SERVICE_NAME=cloudshop-api
export OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
export NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register"
node server.js   # HTTP, Express e pg passam a gerar spans`,
      },
      {
        label: "Collector com tail sampling",
        language: "yaml",
        code: `receivers: { otlp: { protocols: { http: {}, grpc: {} } } }
processors:
  batch: {}
  tail_sampling:
    policies:
      - { name: erros, type: status_code, status_code: { status_codes: [ERROR] } }
      - { name: lentos, type: latency, latency: { threshold_ms: 1000 } }
      - { name: amostra, type: probabilistic, probabilistic: { sampling_percentage: 10 } }
exporters: { otlp: { endpoint: tempo:4317, tls: { insecure: true } } }
service:
  pipelines:
    traces: { receivers: [otlp], processors: [tail_sampling, batch], exporters: [otlp] }`,
      },
    ],
    glossary: [
      { term: "Span", definition: "Uma etapa de um trace, com nome, duração e atributos." },
      { term: "OTLP", definition: "Protocolo do OpenTelemetry para enviar telemetria." },
      { term: "Tail sampling", definition: "Decidir guardar o trace depois de vê-lo completo." },
    ],
    quiz: [
      {
        question: "Como o contexto do trace passa de um serviço para outro?",
        options: ["Pelo banco", "Pelo cabeçalho traceparent", "Por e-mail", "Pelo DNS"],
        answerIndex: 1,
        explanation: "O padrão W3C Trace Context propaga o id no cabeçalho HTTP.",
      },
      {
        question: "Qual sampling garante guardar todos os traces com erro?",
        options: ["Head 1%", "Tail sampling por status", "Nenhum", "Aleatório no cliente"],
        answerIndex: 1,
        explanation: "Só no fim se sabe se houve erro; o tail sampling decide nesse momento.",
      },
    ],
  },
  "l-10-5": {
    body: [
      "<h3>1. SLI, SLO e SLA</h3><ul><li><strong>SLI</strong>: a medida (ex.: % de requisições de checkout com sucesso em menos de 500 ms)</li><li><strong>SLO</strong>: a meta interna (99,5% em 30 dias)</li><li><strong>SLA</strong>: o contrato com o cliente, com multa — sempre mais frouxo que o SLO</li></ul>",
      "<h3>2. Error budget</h3><p>Um SLO de 99,5% permite 0,5% de falha: em 30 dias, cerca de 3h36min. Enquanto há orçamento, o time lança à vontade; quando acaba, prioriza estabilidade. Isso transforma briga entre produto e operação em regra combinada.</p>",
      "<h3>3. Alertas por burn rate</h3><p>Em vez de alertar a cada erro, alerte quando o orçamento está sendo gasto rápido demais: queimar 2% em 1 hora (taxa 14,4) é página imediata; 10% em 3 dias é ticket.</p>",
      "<h3>4. Resposta a incidente</h3><p>Papéis claros (comandante, comunicação, operação), canal único, linha do tempo registrada. Primeiro mitigar (rollback, desligar feature flag), depois investigar.</p>",
      "<h3>5. Postmortem sem culpa</h3><p>Foco no sistema, não na pessoa: linha do tempo, impacto, causa raiz com 5 porquês, o que ajudou, o que atrapalhou e ações com dono e prazo. Se uma pessoa conseguiu derrubar produção com um comando, o problema é o processo que permitiu.</p>",
    ],
    code: [
      {
        label: "Cálculo do error budget",
        language: "text",
        code: `SLO 99,5% em 30 dias
30 dias = 43.200 min
Orçamento = 43.200 x 0,005 = 216 min (~3h36)
Incidente de 40 min -> restam 176 min (81% do orçamento)`,
      },
      {
        label: "Alerta de burn rate rápido",
        language: "promql",
        code: `(
  sum(rate(http_requests_total{route="/checkout",status=~"5.."}[1h]))
  / sum(rate(http_requests_total{route="/checkout"}[1h]))
) > (14.4 * 0.005)`,
      },
    ],
    glossary: [
      { term: "Error budget", definition: "Quantidade de falha permitida pelo SLO em um período." },
      { term: "Burn rate", definition: "Velocidade com que o error budget está sendo consumido." },
      { term: "Blameless", definition: "Postmortem focado em causas sistêmicas, sem culpar pessoas." },
    ],
    quiz: [
      {
        question: "SLO de 99,9% em 30 dias permite aproximadamente quanto de indisponibilidade?",
        options: ["4 min", "43 min", "7 horas", "1 dia"],
        answerIndex: 1,
        explanation: "43.200 min x 0,001 ≈ 43 minutos.",
      },
      {
        question: "O error budget acabou. O que o time deve fazer?",
        options: ["Lançar mais features", "Priorizar confiabilidade até recuperar", "Mudar o SLO para 90%", "Ignorar"],
        answerIndex: 1,
        explanation: "É o acordo do error budget: sem orçamento, estabilidade vem primeiro.",
      },
    ],
  },
  "l-11-1": {
    body: [
      "<h3>1. O ciclo de vida de um segredo</h3><p>Criar → armazenar em cofre → entregar à aplicação com o menor escopo → rotacionar → revogar. Cada etapa precisa de dono e registro.</p>",
      "<h3>2. Prefira credenciais temporárias</h3><p>OIDC do GitHub para a nuvem, IRSA/Pod Identity no EKS, credenciais dinâmicas do Vault para bancos. O melhor segredo é o que expira sozinho em minutos.</p>",
      "<h3>3. Rotação sem queda</h3><p>Para trocar a senha do banco: crie a nova, faça a app aceitar ambas (ou recarregar), migre, e só então revogue a antiga. Automatize no Secrets Manager.</p>",
      "<h3>4. Detecção de vazamento</h3><p>Camadas: gitleaks no pre-commit, secret scanning com push protection no GitHub, scan no CI e alertas de uso anômalo no CloudTrail.</p>",
      "<h3>5. Plano de resposta</h3><p>1) revogar, 2) avaliar uso indevido nos logs, 3) limpar histórico, 4) postmortem. Tenha isso escrito antes de precisar.</p>",
    ],
    code: [
      {
        label: "Pre-commit com gitleaks",
        language: "yaml",
        code: `# .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.4
    hooks:
      - id: gitleaks
# instalar: pip install pre-commit && pre-commit install`,
      },
    ],
    glossary: [
      { term: "Push protection", definition: "Bloqueio do push quando o GitHub detecta um segredo." },
      { term: "Credencial dinâmica", definition: "Credencial gerada sob demanda com validade curta." },
    ],
    quiz: [
      {
        question: "Qual a forma mais segura de o CI acessar a AWS?",
        options: ["Access key em secret do repo", "OIDC com role temporária", "Senha do root", "Chave no Dockerfile"],
        answerIndex: 1,
        explanation: "OIDC gera credenciais de curta duração sem nada fixo guardado.",
      },
    ],
  },
  "l-11-2": {
    body: [
      "<h3>1. Onde entram os scans</h3><ul><li><strong>SAST</strong> no código (Semgrep, CodeQL)</li><li><strong>SCA</strong> nas dependências (Dependabot, Trivy)</li><li><strong>IaC scan</strong> no Terraform/K8s (Checkov, Trivy config)</li><li><strong>Imagem</strong> após o build (Trivy, Grype)</li><li><strong>DAST</strong> na app rodando em staging (OWASP ZAP)</li></ul>",
      "<h3>2. Bloquear com critério</h3><p>Falhe o pipeline só em vulnerabilidades críticas/altas com correção disponível; o resto vira relatório. Bloquear tudo faz o time ignorar o scanner.</p>",
      "<h3>3. SBOM</h3><p>A lista de materiais (Syft, formato SPDX ou CycloneDX) diz exatamente o que há na imagem. Quando surge uma nova CVE, você descobre em minutos quais imagens são afetadas.</p>",
      "<h3>4. Assinatura e proveniência</h3><p>Cosign assina a imagem sem chave fixa (keyless via OIDC); atestados SLSA registram como ela foi construída. No cluster, uma política só aceita o que foi assinado pelo seu pipeline.</p>",
    ],
    code: [
      {
        label: "Pipeline de segurança da imagem",
        language: "yaml",
        code: `- name: Scan da imagem
  uses: aquasecurity/trivy-action@0.24.0
  with:
    image-ref: ghcr.io/cloudshop/api:\${{ github.sha }}
    severity: CRITICAL,HIGH
    ignore-unfixed: true
    exit-code: "1"                 # falha o job
- name: SBOM
  run: syft ghcr.io/cloudshop/api:\${{ github.sha }} -o spdx-json > sbom.json
- name: Assinar (keyless)
  run: cosign sign --yes ghcr.io/cloudshop/api@\${{ steps.build.outputs.digest }}`,
      },
    ],
    glossary: [
      { term: "SAST", definition: "Análise estática de segurança do código-fonte." },
      { term: "SCA", definition: "Análise de vulnerabilidades em dependências de terceiros." },
      { term: "SBOM", definition: "Inventário de componentes de um software." },
    ],
    quiz: [
      {
        question: "Uma nova CVE grave foi publicada. O que ajuda a saber rápido quais imagens são afetadas?",
        options: ["README", "SBOM das imagens", "Dashboard de CPU", "Tags latest"],
        answerIndex: 1,
        explanation: "O SBOM lista cada pacote e versão presentes na imagem.",
      },
    ],
  },
  "l-11-3": {
    body: [
      "<h3>1. As três fases do FinOps</h3><p><strong>Informar</strong> (ver quem gasta), <strong>otimizar</strong> (reduzir desperdício) e <strong>operar</strong> (tornar custo parte da rotina). Sem tags e atribuição, não há conversa possível.</p>",
      "<h3>2. Onde o dinheiro some</h3><ul><li>Instâncias e nós superdimensionados (requests muito acima do uso)</li><li>Ambientes de dev ligados à noite e fim de semana</li><li>NAT Gateway e tráfego entre zonas</li><li>Volumes, snapshots e IPs esquecidos</li><li>Logs guardados para sempre</li></ul>",
      "<h3>3. Alavancas</h3><p>Rightsizing, Spot para cargas tolerantes (Karpenter facilita), Savings Plans para a base estável, desligamento agendado, políticas de retenção e classes de storage mais baratas.</p>",
      "<h3>4. Custo no pull request</h3><p>O Infracost comenta no PR quanto a mudança de Terraform vai custar por mês — o time decide antes, não na fatura.</p>",
    ],
    code: [
      {
        label: "Infracost no CI",
        language: "bash",
        code: `infracost breakdown --path infra/envs/prod --format json --out-file base.json
infracost diff --path infra/envs/prod --compare-to base.json
# saída: "Monthly cost will increase by $142 (+18%)"`,
      },
    ],
    glossary: [
      { term: "Rightsizing", definition: "Ajustar o tamanho do recurso ao uso real." },
      { term: "Spot", definition: "Capacidade ociosa da nuvem com grande desconto, que pode ser interrompida." },
      { term: "Showback", definition: "Mostrar a cada time quanto ele gasta, sem cobrar internamente." },
    ],
    quiz: [
      {
        question: "Qual carga é boa candidata a instâncias Spot?",
        options: ["Banco de dados principal", "Jobs de CI e workers tolerantes a interrupção", "Control plane", "DNS"],
        answerIndex: 1,
        explanation: "Spot pode ser retomado a qualquer momento; exige cargas que suportam isso.",
      },
    ],
  },
  "l-11-4": {
    body: [
      "<h3>1. O README que recrutador lê</h3><p>Em 30 segundos: o que é, diagrama de arquitetura, como rodar em um comando, decisões principais e resultados (tempo de deploy, SLO, custo).</p>",
      "<h3>2. ADR: decisões registradas</h3><p>Um Architecture Decision Record curto: contexto, decisão, alternativas consideradas e consequências. Em entrevista, mostrar que você escolheu ArgoCD em vez de Flux <em>e por quê</em> vale mais que usar ambos.</p>",
      "<h3>3. Runbooks</h3><p>Para cada alerta: o que significa, como confirmar, como mitigar e quem escalar. Um runbook bom permite que alguém novo resolva o incidente.</p>",
      "<h3>4. Diagramas como código</h3><p>Mermaid ou diagrams.net versionados no repo mantêm a documentação viva junto ao código.</p>",
    ],
    code: [
      {
        label: "Modelo de ADR",
        language: "markdown",
        code: `# ADR-004: GitOps com ArgoCD
Data: 2026-03-10  |  Status: aceito
## Contexto
Deploys via kubectl no CI exigiam credencial de admin do cluster.
## Decisão
Adotar ArgoCD em modelo pull com repositório cloudshop-gitops.
## Alternativas
Flux (menos interface visual), push via Helm no CI (credencial exposta).
## Consequências
+ auditoria e rollback por Git  - mais um componente para operar`,
      },
    ],
    glossary: [
      { term: "ADR", definition: "Documento curto que registra uma decisão de arquitetura e seu porquê." },
      { term: "Runbook", definition: "Procedimento passo a passo para responder a um alerta ou tarefa." },
    ],
    quiz: [
      {
        question: "O que um ADR deve conter além da decisão?",
        options: ["Só o código", "Contexto, alternativas e consequências", "Salários", "Senhas"],
        answerIndex: 1,
        explanation: "O valor do ADR está em explicar por que a escolha foi feita.",
      },
    ],
  },
  "l-11-5": {
    body: [
      "<h3>1. Portfólio que prova</h3><p>Um projeto completo (CloudShop) vale mais que dez tutoriais: infra com Terraform, cluster, pipeline, GitOps, observabilidade, SLO e um postmortem simulado. Mostre números.</p>",
      "<h3>2. Currículo orientado a impacto</h3><p>Fórmula: <em>verbo + o que fez + ferramenta + resultado</em>. \"Reduzi o tempo de deploy de 40 para 8 minutos com cache de camadas e pipeline paralelo no GitHub Actions.\"</p>",
      "<h3>3. Entrevista técnica</h3><p>Espere perguntas de fundamentos (DNS, TLS, Linux), cenário (\"o site está lento, o que você faz?\") e design (\"desenhe o deploy de uma API com zero downtime\"). Pense em voz alta, faça perguntas de contexto e fale de trade-offs.</p>",
      "<h3>4. Método STAR</h3><p>Para perguntas comportamentais: Situação, Tarefa, Ação e Resultado. Use o incidente do seu projeto como história.</p>",
      "<h3>5. Continuar evoluindo</h3><p>Certificações úteis (CKA, AWS SAA, Terraform Associate), contribuições open source e escrever sobre o que aprendeu mantêm você visível.</p>",
    ],
    code: [
      {
        label: "Roteiro de resposta: 'o site está lento'",
        language: "text",
        code: `1. Escopo: todos os usuários ou uma região/rota? desde quando? houve deploy?
2. Sinais: latência p95, taxa de erro e tráfego no dashboard
3. Trace de uma requisição lenta -> qual span demora?
4. Dependência (banco/API externa) ou recurso (CPU, throttling, pool)?
5. Mitigar: rollback, escalar, feature flag
6. Depois: causa raiz, postmortem e ação preventiva`,
      },
    ],
    glossary: [
      { term: "STAR", definition: "Situação, Tarefa, Ação, Resultado: estrutura para respostas comportamentais." },
      { term: "Trade-off", definition: "Escolha consciente entre vantagens e desvantagens de alternativas." },
    ],
    quiz: [
      {
        question: "Qual linha de currículo é mais forte?",
        options: ["Conhecimento em Docker", "Reduzi o deploy de 40 para 8 min com cache e jobs paralelos", "Trabalho em equipe", "Curioso por tecnologia"],
        answerIndex: 1,
        explanation: "Mostra ação concreta, ferramenta e resultado mensurável.",
      },
    ],
  },
};
