import type { Module } from "@/lib/types";

export const SRE_FINAL_MODULES: Module[] = [
  {
    id: "mod-10",
    index: 10,
    slug: "observabilidade-e-sre",
    title: "Observabilidade e SRE",
    tagline: "Saber o que acontece antes do cliente contar.",
    weeks: 3,
    xp: 2500,
    badge: "sre-guardian",
    regionId: "torre-confiabilidade",
    bossId: "boss-queda-producao",
    overview:
      "Observabilidade não é instalar Grafana: é conseguir responder perguntas novas sobre o sistema sem novo deploy. Você vai instrumentar o CloudShop com métricas Prometheus, centralizar logs com Loki, distribuir traces com OpenTelemetry, construir dashboards que respondem 'está tudo bem?' em cinco segundos, definir SLI/SLO com error budget e conduzir um incidente até o postmortem sem culpa.",
    objectives: [
      "Diferenciar logs, métricas e traces e saber quando usar cada um",
      "Escrever consultas PromQL úteis e regras de alerta acionáveis",
      "Montar dashboards guiados por RED e USE",
      "Definir SLI, SLO e error budget para o CloudShop",
      "Conduzir incidente e escrever postmortem sem culpa",
    ],
    prerequisites: ["Módulo 8 concluído"],
    topics: ["Logs", "Métricas", "Traces", "Prometheus", "Grafana", "Loki", "OpenTelemetry", "Alertmanager", "RED", "USE", "SLI/SLO", "Incidentes"],
    delivery: "Dashboard, alertas por sintoma, SLO documentado, runbook de incidente e postmortem de um evento real.",
    checklist: [
      "Métricas de latência, taxa de erro e throughput expostas pela API",
      "Dashboard responde 'está tudo bem?' sem interpretação",
      "Alertas baseados em sintoma do usuário, não em CPU",
      "SLO com error budget calculado e documentado",
      "Postmortem publicado com ações e responsáveis",
    ],
    troubleshooting:
      "Sintoma: usuários relatam lentidão, CPU normal. Investigação: métrica de latência p95 subiu, traces mostram 80% do tempo em uma consulta ao banco, logs do banco indicam lock. Causa raiz: migração criando índice em tabela grande durante horário de pico. Correção: abortar a migração, reagendar com criação concorrente e alertar por p95, não por CPU.",
    interviewQuestions: [
      "Diferença entre SLI, SLO e SLA?",
      "O que é error budget e como ele muda decisões de produto?",
      "Como você evitaria fadiga de alertas em um time de plantão?",
    ],
    printQuest: "Instrumentar o CloudShop com métricas, logs, traces, SLO e alertas úteis.",
    lessons: [
      {
        id: "l-10-1",
        moduleId: "mod-10",
        title: "Os três pilares e o que instrumentar primeiro",
        duration: 40,
        difficulty: "Intermediário",
        tools: ["Prometheus", "Loki", "OpenTelemetry"],
        xp: 25,
        objectives: ["Escolher o sinal adequado a cada pergunta", "Instrumentar as quatro métricas essenciais", "Evitar cardinalidade explosiva"],
        body: [
          "Métricas respondem 'quanto e com que frequência' de forma barata e agregada — ideais para alerta e tendência. Logs respondem 'o que exatamente aconteceu neste evento' — ideais para investigação pontual. Traces respondem 'onde o tempo foi gasto nesta requisição que atravessou cinco serviços'. Usar o sinal errado custa tempo e dinheiro.",
          "Comece pelo método RED nos serviços: Rate (requisições por segundo), Errors (taxa de erro) e Duration (distribuição de latência). Para recursos, USE: Utilization, Saturation, Errors. Com RED por rota e USE por recurso você já detecta a maioria dos incidentes reais.",
          "Cuidado com cardinalidade: usar userId, requestId ou URL completa como label multiplica séries temporais e derruba o Prometheus. Identificadores únicos vão para logs e traces; labels de métrica são dimensões de baixa cardinalidade (rota, método, status).",
        ],
        code: [
          {
            label: "Instrumentar a API do CloudShop",
            language: "javascript",
            code: `import express from "express";
import client from "prom-client";

const app = express();
const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

const httpDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duracao das requisicoes HTTP",
  labelNames: ["method", "route", "status"],   // baixa cardinalidade
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});
registry.registerMetric(httpDuration);

app.use((req, res, next) => {
  const end = httpDuration.startTimer({ method: req.method });
  res.on("finish", () => {
    // route (padrao) evita explodir series com IDs na URL
    end({ route: req.route?.path ?? "unmatched", status: res.statusCode });
  });
  next();
});

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", registry.contentType);
  res.end(await registry.metrics());
});`,
            securityNote:
              "Não exponha /metrics publicamente: métricas revelam rotas internas e volumes de negócio. Restrinja por rede ou autenticação.",
          },
        ],
        whyItMatters: "Serviço sem instrumentação é caixa preta: você descobre problema pelo cliente e depura por adivinhação.",
        commonMistake: "Usar caminho completo com ID como label e criar milhões de séries.",
        productionTip: "Histograma de latência com buckets alinhados ao seu SLO; buckets errados inutilizam o p95.",
        securityAlert: "Nunca coloque dado pessoal em label de métrica: ele fica retido por muito tempo e é difícil de expurgar.",
        interviewQuestion: "Quando você usaria trace em vez de log para investigar lentidão?",
        glossary: [
          { term: "RED", definition: "Rate, Errors, Duration: método de monitoramento orientado a serviço." },
          { term: "cardinalidade", definition: "Número de séries distintas geradas pelas combinações de labels." },
        ],
        printQuestLink: "Expor /metrics na API do CloudShop com histograma de latência por rota.",
        quiz: [
          {
            question: "Qual label é inadequado em uma métrica Prometheus?",
            options: ["method", "route", "userId", "status"],
            answerIndex: 2,
            explanation: "Identificador único gera cardinalidade praticamente infinita.",
          },
        ],
      },
      {
        id: "l-10-2",
        moduleId: "mod-10",
        title: "Prometheus e PromQL: consultas e alertas que valem plantão",
        duration: 50,
        difficulty: "Avançado",
        tools: ["Prometheus", "PromQL", "Alertmanager"],
        xp: 25,
        objectives: ["Escrever PromQL de taxa e percentil", "Criar regras de alerta por sintoma", "Configurar roteamento no Alertmanager"],
        body: [
          "Prometheus coleta métricas por scrape e armazena séries temporais. Em PromQL, a função rate calcula taxa por segundo de contadores, histogram_quantile estima percentis a partir de buckets e agregações por label permitem ver o comportamento por rota ou por serviço.",
          "Alerta bom é alerta que exige ação humana e descreve o impacto no usuário: 'taxa de erro 5xx acima de 2% por 5 minutos' vale acordar alguém; 'CPU em 85%' normalmente não, porque pode ser saudável. Use for para evitar alarme por pico transitório e severidade coerente com urgência.",
          "No Alertmanager, agrupe alertas relacionados, defina inibição (não alertar sobre sintoma quando a causa já disparou) e rotas por severidade. Fadiga de alerta é falha de engenharia: se o time ignora notificação, o sistema de alerta está quebrado.",
        ],
        code: [
          {
            label: "PromQL essencial para o CloudShop",
            language: "promql",
            code: `# Requisicoes por segundo por rota
sum(rate(http_request_duration_seconds_count[5m])) by (route)

# Taxa de erro (proporcao de 5xx)
sum(rate(http_request_duration_seconds_count{status=~"5.."}[5m]))
  / sum(rate(http_request_duration_seconds_count[5m]))

# Latencia p95 por rota
histogram_quantile(0.95,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))

# Saturacao de memoria do pod contra o limite
sum(container_memory_working_set_bytes{pod=~"cloudshop-api.*"}) by (pod)
  / sum(kube_pod_container_resource_limits{resource="memory",pod=~"cloudshop-api.*"}) by (pod)

# Consumo do error budget de 30 dias (SLO 99.9%)
1 - (sum(rate(http_request_duration_seconds_count{status!~"5.."}[30d]))
     / sum(rate(http_request_duration_seconds_count[30d]))) / 0.001`,
          },
          {
            label: "Regras de alerta por sintoma",
            language: "yaml",
            code: `groups:
  - name: cloudshop-api
    rules:
      - alert: TaxaDeErroAlta
        expr: |
          sum(rate(http_request_duration_seconds_count{status=~"5.."}[5m]))
            / sum(rate(http_request_duration_seconds_count[5m])) > 0.02
        for: 5m
        labels: { severity: critical }
        annotations:
          summary: "Mais de 2% das requisicoes falhando"
          description: "Usuarios estao recebendo erro. Runbook: docs/runbooks/api-5xx.md"

      - alert: LatenciaP95Degradada
        expr: |
          histogram_quantile(0.95,
            sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 1
        for: 10m
        labels: { severity: warning }
        annotations:
          summary: "p95 acima de 1s por 10 minutos"

      - alert: ErrorBudgetQueimandoRapido
        expr: |
          (sum(rate(http_request_duration_seconds_count{status=~"5.."}[1h]))
            / sum(rate(http_request_duration_seconds_count[1h]))) > 14.4 * 0.001
        for: 5m
        labels: { severity: critical }
        annotations:
          summary: "Consumo acelerado do error budget (burn rate 14.4x)"`,
            securityNote:
              "Anotações de alerta vão para canais de chat: não inclua dado de cliente nem trecho de log sensível.",
          },
        ],
        whyItMatters: "Alerta acionável e runbook vinculado é o que torna plantão sustentável.",
        commonMistake: "Alertar em CPU e disco e não alertar em taxa de erro percebida pelo usuário.",
        productionTip: "Todo alerta crítico deve ter link para runbook com passos de diagnóstico e mitigação.",
        interviewQuestion: "Como você definiria alertas para um serviço novo sem histórico?",
        glossary: [
          { term: "rate", definition: "Função PromQL que calcula taxa por segundo de um contador." },
          { term: "burn rate", definition: "Velocidade de consumo do error budget em relação ao permitido." },
        ],
        printQuestLink: "Criar as regras de alerta do CloudShop com runbook vinculado.",
        quiz: [
          {
            question: "Qual alerta é mais acionável?",
            options: ["CPU acima de 80%", "Taxa de 5xx acima de 2% por 5 minutos", "Disco em 60%", "Número de pods maior que 3"],
            answerIndex: 1,
            explanation: "Erro percebido pelo usuário indica impacto real e requer ação.",
          },
        ],
      },
      {
        id: "l-10-3",
        moduleId: "mod-10",
        title: "Grafana e Loki: dashboards e logs centralizados",
        duration: 45,
        difficulty: "Intermediário",
        tools: ["Grafana", "Loki", "LogQL"],
        xp: 25,
        objectives: ["Construir dashboard que responde perguntas", "Consultar logs com LogQL", "Correlacionar métrica e log"],
        body: [
          "Dashboard não é galeria de gráficos: é ferramenta de decisão. O primeiro painel responde 'está tudo bem?' com taxa de erro, p95 e throughput. Os seguintes ajudam a localizar o problema: por rota, por dependência, por recurso. Se um painel nunca é usado em incidente, ele só ocupa espaço.",
          "Loki indexa labels e guarda o conteúdo comprimido, o que o torna barato e integrado ao mesmo modelo de labels do Prometheus. Com LogQL você filtra por stream e por conteúdo, extrai campos de JSON e até gera métricas a partir de logs.",
          "O ganho maior é correlação: do painel de latência, ir para os logs daquele intervalo e serviço em dois cliques. Padronizar log estruturado com requestId e traceId é o que permite fechar o ciclo métrica → log → trace.",
        ],
        code: [
          {
            label: "Consultas LogQL",
            language: "logql",
            code: `{app="cloudshop", component="api"} |= "ERROR"

{app="cloudshop"} | json | status >= 500 | line_format "{{.route}} {{.message}}"

# taxa de erro derivada de log
sum(rate({app="cloudshop"} | json | status >= 500 [5m]))

# rastrear uma requisicao especifica
{app="cloudshop"} | json | requestId = "7f3c1a"

# duracao acima de 1s
{app="cloudshop"} | json | duration_ms > 1000`,
          },
          {
            label: "Log estruturado na aplicação",
            language: "javascript",
            code: `function log(level, message, extra = {}) {
  process.stdout.write(JSON.stringify({
    ts: new Date().toISOString(),
    level,
    service: "cloudshop-api",
    message,
    ...extra,           // requestId, route, status, duration_ms, traceId
  }) + "\\n");
}

// nunca inclua: senha, token, cookie, dado de pagamento
log("info", "pedido criado", { requestId, route: "/orders", status: 201, duration_ms: 84 });`,
            securityNote:
              "Mantenha uma lista de campos proibidos e um teste automatizado que falha se algum deles aparecer no log.",
          },
        ],
        whyItMatters: "Em incidente, o tempo gasto procurando log é tempo de indisponibilidade.",
        commonMistake: "Dashboard com quarenta painéis onde ninguém encontra o que importa.",
        productionTip: "Coloque o painel de SLO no topo e o runbook linkado na descrição do dashboard.",
        securityAlert: "Log centralizado concentra dados sensíveis: defina retenção e controle de acesso.",
        interviewQuestion: "Como você correlaciona um pico de latência com os logs correspondentes?",
        glossary: [
          { term: "LogQL", definition: "Linguagem de consulta do Loki, inspirada em PromQL." },
          { term: "log estruturado", definition: "Log emitido como objeto (JSON) com campos consultáveis." },
        ],
        printQuestLink: "Criar o dashboard principal do CloudShop com SLO, RED e link para logs.",
        quiz: [
          {
            question: "Qual campo é essencial para correlacionar log com trace?",
            options: ["hostname", "traceId", "nível do log", "timestamp apenas"],
            answerIndex: 1,
            explanation: "traceId liga o log à requisição distribuída correspondente.",
          },
        ],
      },
      {
        id: "l-10-4",
        moduleId: "mod-10",
        title: "OpenTelemetry: traces distribuídos",
        duration: 45,
        difficulty: "Avançado",
        tools: ["OpenTelemetry", "Collector", "Tempo/Jaeger"],
        xp: 25,
        objectives: ["Instrumentar traces com OTel", "Entender contexto e propagação", "Usar amostragem com critério"],
        body: [
          "Trace mostra a jornada de uma requisição como uma árvore de spans, com duração e atributos de cada etapa. É o sinal que responde imediatamente 'o tempo está no banco, na chamada externa ou no nosso código' — pergunta que métricas agregadas não respondem.",
          "OpenTelemetry é o padrão vendor-neutral: SDK instrumenta a aplicação, o Collector recebe, processa e exporta para o backend escolhido (Tempo, Jaeger, ou serviço gerenciado). Trocar de backend deixa de ser reescrita de instrumentação.",
          "Propagação de contexto é o que costura os serviços: o traceparent viaja nos headers HTTP. E amostragem controla custo — 100% em ambiente de estudo, taxa menor em produção, sempre com política que preserve traces de erro e de alta latência.",
        ],
        code: [
          {
            label: "Instrumentação OTel na API",
            language: "javascript",
            code: `// otel.js — carregado antes do app: node --require ./otel.js src/server.js
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { TraceIdRatioBasedSampler } from "@opentelemetry/sdk-trace-base";

const sdk = new NodeSDK({
  serviceName: "cloudshop-api",
  traceExporter: new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT }),
  sampler: new TraceIdRatioBasedSampler(Number(process.env.OTEL_SAMPLE_RATIO ?? 0.1)),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
process.on("SIGTERM", () => sdk.shutdown());`,
            securityNote:
              "Atributos de span podem vazar dado sensível (corpo da requisição, e-mail). Configure redaction no Collector.",
          },
          {
            label: "Collector com processamento",
            language: "yaml",
            code: `receivers:
  otlp:
    protocols: { http: {}, grpc: {} }

processors:
  batch: { timeout: 5s }
  attributes/limpeza:
    actions:
      - key: http.request.header.authorization
        action: delete
      - key: user.email
        action: delete
  tail_sampling:
    policies:
      - name: manter-erros
        type: status_code
        status_code: { status_codes: [ERROR] }
      - name: manter-lentos
        type: latency
        latency: { threshold_ms: 1000 }

exporters:
  otlphttp/tempo: { endpoint: http://tempo:4318 }

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [attributes/limpeza, tail_sampling, batch]
      exporters: [otlphttp/tempo]`,
          },
        ],
        whyItMatters: "Em arquitetura distribuída, sem trace a investigação de latência é chute educado.",
        commonMistake: "Instrumentar apenas um serviço e perder a propagação — o trace fica quebrado.",
        productionTip: "Tail sampling preservando erros e requisições lentas dá o melhor custo-benefício.",
        securityAlert: "Nunca envie corpo completo de requisição para o backend de traces.",
        interviewQuestion: "O que é propagação de contexto e como ela funciona em HTTP?",
        glossary: [
          { term: "span", definition: "Unidade de trabalho dentro de um trace, com início, fim e atributos." },
          { term: "Collector", definition: "Processo que recebe, transforma e exporta telemetria para backends." },
        ],
        printQuestLink: "Rastrear a jornada de criação de pedido do CloudShop do frontend ao banco.",
        quiz: [
          {
            question: "Qual sinal indica melhor onde o tempo de uma requisição foi gasto?",
            options: ["Log", "Métrica agregada", "Trace distribuído", "Contador de erros"],
            answerIndex: 2,
            explanation: "Traces detalham a duração de cada etapa da requisição.",
          },
        ],
      },
      {
        id: "l-10-5",
        moduleId: "mod-10",
        title: "SLI, SLO, error budget e postmortem sem culpa",
        duration: 50,
        difficulty: "Avançado",
        tools: ["SRE", "Grafana", "Runbooks"],
        xp: 25,
        objectives: ["Definir SLI e SLO do CloudShop", "Calcular e usar error budget", "Conduzir incidente e escrever postmortem"],
        body: [
          "SLI é a medida da experiência (proporção de requisições bem-sucedidas abaixo de 500 ms, por exemplo). SLO é a meta interna sobre esse indicador. SLA é o compromisso contratual, geralmente mais frouxo que o SLO. Confiabilidade deixa de ser opinião quando existe número.",
          "Error budget é o complemento do SLO: com meta de 99,9% em 30 dias, você tem cerca de 43 minutos de falha permitida. Esse número orienta decisão: budget sobrando permite acelerar entregas; budget estourado obriga a priorizar estabilidade. É a ferramenta que encerra a discussão entre 'entregar rápido' e 'ficar estável'.",
          "Incidente tem papéis (comandante, comunicação, investigação), registro de linha do tempo e foco em mitigar antes de entender. Depois vem o postmortem sem culpa: fatos, impacto medido, causas contribuintes, o que funcionou e ações com responsável e prazo. Culpar pessoa esconde falha de sistema e garante repetição.",
        ],
        code: [
          {
            label: "SLO do CloudShop documentado",
            language: "yaml",
            code: `servico: cloudshop-api
janela: 30d
slis:
  - nome: disponibilidade
    definicao: proporcao de requisicoes com status < 500
    consulta: |
      sum(rate(http_request_duration_seconds_count{status!~"5.."}[30d]))
        / sum(rate(http_request_duration_seconds_count[30d]))
    slo: 99.9%
    budget: 43m 12s
  - nome: latencia
    definicao: proporcao de requisicoes abaixo de 500ms
    consulta: |
      sum(rate(http_request_duration_seconds_bucket{le="0.5"}[30d]))
        / sum(rate(http_request_duration_seconds_count[30d]))
    slo: 95%
politica:
  budget_esgotado: congelar entregas de funcionalidade e priorizar confiabilidade
  budget_saudavel: liberar deploys frequentes e experimentos controlados`,
          },
          {
            label: "Modelo de postmortem",
            language: "markdown",
            code: `# Postmortem — Indisponibilidade da API (2026-09-14)

**Impacto:** 22 minutos com 78% das requisicoes em erro; 41% do error budget mensal consumido.
**Deteccao:** alerta TaxaDeErroAlta em 14:03 (usuarios comecaram a falhar 14:01).

## Linha do tempo (UTC)
- 14:01 deploy v1.4.0 aplicado
- 14:03 alerta critico disparado
- 14:07 hipotese: pool de conexoes esgotado (traces mostram espera no banco)
- 14:16 rollback para v1.3.2 iniciado
- 14:23 metricas normalizadas

## Causas contribuintes
1. Nova rota abria conexao por requisicao sem devolver ao pool.
2. Teste de carga nao cobria essa rota.
3. Alerta de saturacao do pool nao existia.

## O que funcionou
- Rollback automatizado levou 7 minutos.
- Runbook de 5xx acelerou o diagnostico.

## Acoes
| Acao | Responsavel | Prazo |
|---|---|---|
| Corrigir vazamento de conexao e cobrir com teste | Aluno | 2026-09-16 |
| Alerta de saturacao do pool | Aluno | 2026-09-18 |
| Teste de carga nas rotas de escrita no CI | Time | 2026-09-30 |

**Sem culpa:** a pessoa seguiu o processo existente; o sistema permitiu que a falha chegasse a producao.`,
          },
        ],
        whyItMatters: "SLO e postmortem são o vocabulário de SRE em entrevistas de nível pleno e sênior.",
        commonMistake: "Definir SLO de 99,99% sem arquitetura nem orçamento para sustentá-lo.",
        productionTip: "Alerte por burn rate do error budget, não por qualquer desvio: reduz drasticamente ruído.",
        securityAlert: "Postmortem pode conter dado sensível de cliente; publique versão interna e versão sanitizada.",
        interviewQuestion: "Explique error budget e como ele influencia a decisão de lançar uma funcionalidade.",
        glossary: [
          { term: "error budget", definition: "Quantidade de falha permitida pelo SLO em uma janela de tempo." },
          { term: "postmortem sem culpa", definition: "Análise focada em falhas de sistema e processo, não em pessoas." },
        ],
        printQuestLink: "Publicar o SLO do CloudShop e o postmortem do incidente do módulo.",
        quiz: [
          {
            question: "SLO de 99,9% em 30 dias permite aproximadamente quanto de indisponibilidade?",
            options: ["4 horas", "43 minutos", "7 horas", "4 minutos"],
            answerIndex: 1,
            explanation: "0,1% de 30 dias equivale a cerca de 43 minutos.",
          },
        ],
      },
    ],
  },
  {
    id: "mod-11",
    index: 11,
    slug: "devsecops-finops-e-projeto-final",
    title: "DevSecOps, FinOps e Projeto Final",
    tagline: "Seguro, com custo sob controle e pronto para portfólio.",
    weeks: 2,
    xp: 3000,
    badge: "devops-professional",
    regionId: "torre-confiabilidade",
    overview:
      "O último módulo transforma o que você construiu em um projeto defensável em entrevista. Segurança entra no pipeline (secrets, dependências, imagens, supply chain), custo passa a ser métrica de engenharia e a documentação amarra tudo: diagramas, decisões registradas, runbooks e a narrativa de cada decisão técnica. É aqui que o CloudShop deixa de ser exercício e passa a ser evidência de competência.",
    objectives: [
      "Gerenciar secrets com rotação e escopo mínimo",
      "Adicionar scans de dependências, imagens e IaC no pipeline",
      "Proteger a cadeia de suprimentos com SBOM e assinatura",
      "Otimizar custo sem violar o SLO",
      "Documentar o projeto de forma que outra pessoa consiga operar",
    ],
    prerequisites: ["Todos os módulos anteriores"],
    topics: ["Secrets", "SCA", "Scan de imagem", "Supply chain", "Backups", "IAM", "Orçamento", "Otimização", "Documentação"],
    delivery: "Projeto final CloudShop completo, seguro, documentado e apresentável em entrevista.",
    checklist: [
      "Nenhum segredo no histórico do Git (verificado por scanner)",
      "Pipeline falha em vulnerabilidade crítica com correção disponível",
      "SBOM gerado e imagem assinada",
      "Backup testado com restauração comprovada",
      "README com arquitetura, decisões, custo e runbooks",
    ],
    troubleshooting:
      "Sintoma: scanner reprova o build por vulnerabilidade crítica em dependência transitiva sem correção. Decisão correta: avaliar exploração real no contexto (a função vulnerável é usada?), aplicar mitigação, registrar exceção com prazo e responsável — não desligar o scanner. Exceção sem prazo é dívida esquecida.",
    interviewQuestions: [
      "Como você impede que um segredo chegue ao repositório?",
      "O que é SBOM e por que empresas passaram a exigir?",
      "Como reduziria 30% do custo de um ambiente sem afetar o SLO?",
    ],
    printQuest: "Fechar o CloudShop: segurança no pipeline, custo documentado e apresentação de portfólio.",
    lessons: [
      {
        id: "l-11-1",
        moduleId: "mod-11",
        title: "Secrets: ciclo de vida, rotação e detecção de vazamento",
        duration: 40,
        difficulty: "Avançado",
        tools: ["Secrets Manager", "gitleaks", "OIDC"],
        xp: 25,
        objectives: ["Definir onde cada segredo vive", "Automatizar rotação", "Detectar vazamento no histórico"],
        body: [
          "Todo segredo precisa de resposta para quatro perguntas: onde é armazenado, quem pode ler, com que frequência é rotacionado e como saberíamos que vazou. Sem essas respostas, você tem senha espalhada em variável de ambiente, print de tela e mensagem de chat.",
          "A ordem de preferência é clara: eliminar o segredo (usar identidade federada como OIDC ou role de instância), depois cofre gerenciado com rotação automática, e por último — se inevitável — segredo estático com rotação agendada e escopo mínimo.",
          "Detecção precisa ser automática: scanner de segredos no pre-commit e no CI, incluindo varredura do histórico. E quando um segredo vaza, o procedimento é rotacionar imediatamente, auditar o uso e só depois limpar o histórico. Remover o arquivo não desfaz o vazamento.",
        ],
        code: [
          {
            label: "Detecção e rotação",
            language: "bash",
            code: `# varredura do historico completo
docker run --rm -v "$PWD:/repo" zricethezav/gitleaks:latest detect --source=/repo --redact -v

# hook local para nao commitar segredo
cat > .git/hooks/pre-commit <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
gitleaks protect --staged --redact || { echo "segredo detectado: commit abortado"; exit 1; }
EOF
chmod +x .git/hooks/pre-commit

# rotacao no Secrets Manager
aws secretsmanager rotate-secret --secret-id cloudshop/db --rotation-rules AutomaticallyAfterDays=30
aws secretsmanager describe-secret --secret-id cloudshop/db --query '{Rotacao:RotationEnabled,Ultima:LastRotatedDate}'`,
            securityNote:
              "Ao encontrar um segredo no histórico, considere-o comprometido: rotacione antes de qualquer limpeza.",
          },
        ],
        whyItMatters: "Credencial vazada é a causa mais frequente de comprometimento em ambientes de nuvem.",
        commonMistake: "Apagar o arquivo do repositório e considerar o problema resolvido.",
        productionTip: "Prefira identidade federada: segredo que não existe não pode vazar.",
        securityAlert: "Segredo em variável de ambiente aparece em dump de erro e em ferramenta de APM mal configurada.",
        interviewQuestion: "Qual seu procedimento ao descobrir uma chave de nuvem commitada?",
        glossary: [
          { term: "rotação", definition: "Substituição periódica de credencial, idealmente automatizada." },
          { term: "gitleaks", definition: "Scanner que detecta padrões de segredo em código e histórico." },
        ],
        printQuestLink: "Varrer o histórico dos repositórios do CloudShop e ativar rotação do segredo do banco.",
        quiz: [
          {
            question: "Ao encontrar uma chave de acesso commitada, a primeira ação é:",
            options: ["Remover o arquivo", "Rotacionar/revogar a credencial", "Reescrever o histórico", "Tornar o repositório privado"],
            answerIndex: 1,
            explanation: "A credencial já está exposta; revogar interrompe o uso indevido.",
          },
        ],
      },
      {
        id: "l-11-2",
        moduleId: "mod-11",
        title: "Scans, SBOM e cadeia de suprimentos no pipeline",
        duration: 45,
        difficulty: "Avançado",
        tools: ["Trivy", "npm audit", "tfsec", "cosign"],
        xp: 25,
        objectives: ["Adicionar scans no CI com política clara", "Gerar SBOM", "Assinar e verificar imagens"],
        body: [
          "Segurança precisa ser etapa do pipeline, com política explícita: falhar em severidade crítica ou alta com correção disponível, avisar nas demais, e registrar exceções com prazo. Sem política, o scanner vira ruído que todos ignoram — ou bloqueio arbitrário que todos contornam.",
          "Cubra as três camadas: dependências da aplicação (SCA), imagem de container (sistema operacional e bibliotecas) e infraestrutura como código (configuração insegura antes do provisionamento). Encontrar bucket público em tfsec custa segundos; descobrir em auditoria custa reputação.",
          "SBOM lista o que existe no artefato e é cada vez mais exigido em contratos; assinatura com cosign prova origem e integridade, permitindo que o cluster aceite apenas imagens assinadas pelo seu pipeline.",
        ],
        code: [
          {
            label: "Pipeline de segurança",
            language: "yaml",
            code: `name: seguranca
on:
  pull_request:
  schedule: [{ cron: "0 6 * * 1" }]

permissions:
  contents: read
  security-events: write
  id-token: write

jobs:
  dependencias:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high

  imagem:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t cloudshop-api:ci ./api
      - uses: aquasecurity/trivy-action@master
        with:
          image-ref: cloudshop-api:ci
          severity: HIGH,CRITICAL
          ignore-unfixed: true
          exit-code: "1"
          format: sarif
          output: trivy.sarif
      - uses: github/codeql-action/upload-sarif@v3
        with: { sarif_file: trivy.sarif }

  iac:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aquasecurity/tfsec-action@v1.0.3
        with: { working_directory: infra }

  assinar:
    needs: [imagem]
    runs-on: ubuntu-latest
    steps:
      - uses: sigstore/cosign-installer@v3
      - run: |
          cosign sign --yes ghcr.io/sua-org/cloudshop/api@\${{ needs.imagem.outputs.digest }}
          cosign verify --certificate-identity-regexp ".*" \\
            --certificate-oidc-issuer https://token.actions.githubusercontent.com \\
            ghcr.io/sua-org/cloudshop/api@\${{ needs.imagem.outputs.digest }}`,
            securityNote:
              "ignore-unfixed evita bloquear por vulnerabilidade sem correção, mas registre-as e revise semanalmente.",
          },
        ],
        whyItMatters: "DevSecOps aparece explicitamente nas vagas e é o que permite entregar rápido sem virar risco.",
        commonMistake: "Ligar todos os scanners sem política e depois desligá-los porque 'travam o time'.",
        productionTip: "Exija assinatura de imagem no cluster (policy controller): só roda o que seu pipeline produziu.",
        securityAlert: "Dependência typosquatting instala pacote malicioso no build. Fixe versões e revise lockfile em PR.",
        interviewQuestion: "Como você definiria a política de bloqueio de vulnerabilidades no pipeline?",
        glossary: [
          { term: "SCA", definition: "Software Composition Analysis: análise de dependências e suas vulnerabilidades." },
          { term: "cosign", definition: "Ferramenta do projeto Sigstore para assinar e verificar artefatos." },
        ],
        printQuestLink: "Adicionar scans e assinatura à pipeline do CloudShop.",
        quiz: [
          {
            question: "Para que serve um SBOM?",
            options: [
              "Acelerar o build",
              "Listar componentes do artefato para auditoria e resposta a vulnerabilidades",
              "Substituir testes",
              "Criptografar a imagem",
            ],
            answerIndex: 1,
            explanation: "SBOM permite saber rapidamente se você é afetado por uma nova CVE.",
          },
        ],
      },
      {
        id: "l-11-3",
        moduleId: "mod-11",
        title: "FinOps: medir, atribuir e reduzir custo",
        duration: 40,
        difficulty: "Intermediário",
        tools: ["Cost Explorer", "Tags", "Kubecost"],
        xp: 25,
        objectives: ["Atribuir custo por projeto e ambiente", "Aplicar right-sizing", "Automatizar economia"],
        body: [
          "FinOps começa em medir e atribuir: sem tags consistentes, o custo é uma bola única que ninguém consegue reduzir com segurança. Com atribuição, você descobre que 40% do gasto está em um ambiente de teste esquecido — e a economia vira decisão trivial.",
          "As alavancas mais efetivas, na ordem: desligar o que não é usado, right-sizing baseado em métrica real, escolher armazenamento e classe adequados, usar capacidade reservada ou spot para carga previsível/tolerante, e reduzir tráfego entre zonas.",
          "Custo é decisão de engenharia com contrapartida de confiabilidade. Reduzir réplicas economiza até o momento em que você viola o SLO. É por isso que FinOps e SRE conversam: o error budget é o limite do que a economia pode custar.",
        ],
        code: [
          {
            label: "Atribuição e otimização",
            language: "bash",
            code: `# custo por ambiente (requer tags ativadas em Cost Allocation Tags)
aws ce get-cost-and-usage --time-period Start=2026-09-01,End=2026-09-30 \\
  --granularity MONTHLY --metrics UnblendedCost \\
  --group-by Type=TAG,Key=env

# right-sizing com base em recomendacao
aws compute-optimizer get-ec2-instance-recommendations --query 'instanceRecommendations[].{ID:instanceArn,Atual:currentInstanceType,Sugerido:recommendationOptions[0].instanceType}'

# desligar ambiente de dev fora do horario comercial
aws ec2 stop-instances --instance-ids $(aws ec2 describe-instances \\
  --filters Name=tag:env,Values=dev Name=instance-state-name,Values=running \\
  --query 'Reservations[].Instances[].InstanceId' --output text)

# no Kubernetes: identificar requests muito acima do uso real
kubectl top pods --all-namespaces | sort -k3 -h | tail -20`,
            securityNote:
              "Automação que desliga recursos precisa de escopo por tag; sem isso, um erro derruba produção.",
          },
        ],
        whyItMatters: "Engenheiro que fala de custo com números participa de decisões — e isso acelera carreira.",
        commonMistake: "Cortar réplicas e limites até violar o SLO, trocando fatura menor por incidente.",
        productionTip: "Publique um painel de custo por ambiente ao lado do painel de SLO: as duas conversas ficam honestas.",
        interviewQuestion: "Como você reduziria 30% do custo mantendo o SLO?",
        glossary: [
          { term: "right-sizing", definition: "Ajustar o tamanho do recurso ao consumo real observado." },
          { term: "spot", definition: "Capacidade com grande desconto que pode ser interrompida pelo provedor." },
        ],
        printQuestLink: "Documentar o custo mensal do CloudShop e aplicar duas otimizações medidas.",
        quiz: [
          {
            question: "Qual é o pré-requisito para atribuir custo por ambiente?",
            options: ["Budget configurado", "Tags consistentes e ativadas para alocação", "Instâncias reservadas", "Multi-AZ"],
            answerIndex: 1,
            explanation: "Sem tags de alocação, o relatório não separa o gasto por ambiente ou projeto.",
          },
        ],
      },
      {
        id: "l-11-4",
        moduleId: "mod-11",
        title: "Documentação, ADRs e o projeto que fecha entrevista",
        duration: 45,
        difficulty: "Intermediário",
        tools: ["Markdown", "ADR", "Diagramas"],
        xp: 25,
        objectives: ["Escrever README que sustenta uma conversa técnica", "Registrar decisões com ADR", "Preparar a narrativa da entrevista"],
        body: [
          "Projeto sem documentação não conta como experiência, porque ninguém consegue avaliar. O README precisa responder em dois minutos: o que é, qual a arquitetura, como rodar, como implantar, como observar, como reverter, quanto custa e quais decisões foram tomadas — com o porquê.",
          "ADR (Architecture Decision Record) é um documento curto por decisão: contexto, opções consideradas, escolha e consequências. Ele demonstra exatamente o que entrevista técnica procura: capacidade de comparar alternativas e assumir trade-off consciente.",
          "Para a entrevista, prepare três histórias de dois minutos: um incidente que você diagnosticou (com evidência), uma automação que reduziu tempo ou risco (com número) e uma decisão de arquitetura com trade-off. Com o CloudShop, você tem material real para as três.",
        ],
        code: [
          {
            label: "Estrutura do README do CloudShop",
            language: "markdown",
            code: `# CloudShop Platform

Catalogo e pedidos de produtos 3D. Projeto de engenharia de plataforma end-to-end.

## Arquitetura
Vue (S3 + CloudFront) -> ALB/Ingress -> API Node (Kubernetes) -> PostgreSQL (RDS)
Observabilidade: Prometheus, Grafana, Loki, OpenTelemetry. Entrega: GitHub Actions + ArgoCD.

## Como rodar localmente
docker compose up -d      # http://localhost:8080

## Como implantar
Merge na main -> CI (lint, testes, build, scans) -> imagem no GHCR ->
PR automatico no cloudshop-gitops -> ArgoCD sincroniza staging.
Producao: PR de promocao com aprovacao.

## Observabilidade
- Dashboard: grafana/cloudshop-overview
- SLO: 99,9% disponibilidade / 95% abaixo de 500ms (janela 30 dias)
- Runbooks: docs/runbooks/

## Rollback
git revert do commit de versao no repositorio GitOps (RTO medido: 4 minutos).

## Custo
Ambiente de estudo: ~18 USD/mes. Otimizacoes aplicadas: desligamento noturno de dev,
right-sizing do RDS, VPC endpoint para S3 (reduziu NAT).

## Decisoes (ADRs)
- ADR-001: Kubernetes em vez de ECS — motivo e consequencias
- ADR-002: GitOps com ArgoCD em vez de deploy por pipeline push
- ADR-003: RDS em vez de PostgreSQL autogerenciado`,
          },
          {
            label: "Modelo de ADR",
            language: "markdown",
            code: `# ADR-002: GitOps com ArgoCD em vez de deploy push pelo pipeline

- **Status:** aceito (2026-09-20)
- **Contexto:** precisamos de rastreabilidade do que roda em cada ambiente e rollback rapido,
  com apenas uma pessoa operando a plataforma.
- **Opcoes:**
  1. Pipeline push com kubectl/helm — simples, porem estado do cluster nao e auditavel no Git.
  2. ArgoCD com repositorio de manifests — reconciliacao continua e rollback por revert.
- **Decisao:** opcao 2.
- **Consequencias:** mais um componente para operar e curva de aprendizado;
  em troca, drift detectado automaticamente, historico de deploy no Git e rollback em minutos.
- **Revisao:** reavaliar se o time crescer acima de 15 pessoas ou se surgir necessidade multi-cluster.`,
          },
        ],
        whyItMatters: "Na entrevista, quem documenta consegue provar; quem não documenta precisa que acreditem.",
        commonMistake: "README com apenas instruções de instalação, sem arquitetura, decisões nem custo.",
        productionTip: "Escreva o ADR no momento da decisão: reconstruir o raciocínio depois nunca sai igual.",
        interviewQuestion: "Conte uma decisão de arquitetura sua, as alternativas e o trade-off assumido.",
        glossary: [
          { term: "ADR", definition: "Registro curto de uma decisão de arquitetura, com contexto e consequências." },
          { term: "RTO", definition: "Recovery Time Objective: tempo alvo para restaurar o serviço." },
        ],
        printQuestLink: "Escrever o README final e os três ADRs principais do CloudShop.",
        quiz: [
          {
            question: "O que um ADR registra?",
            options: [
              "Passos de instalação",
              "Contexto, opções, decisão e consequências de uma escolha de arquitetura",
              "Lista de tarefas do sprint",
              "Métricas do serviço",
            ],
            answerIndex: 1,
            explanation: "É o registro do raciocínio e do trade-off assumido.",
          },
        ],
      },
      {
        id: "l-11-5",
        moduleId: "mod-11",
        title: "Da conclusão à vaga: portfólio, currículo e entrevista",
        duration: 45,
        difficulty: "Intermediário",
        tools: ["Carreira", "LinkedIn", "GitHub"],
        xp: 25,
        objectives: ["Transformar o projeto em portfólio", "Escrever currículo orientado a resultado", "Treinar entrevista técnica e comportamental"],
        body: [
          "Portfólio de DevOps não é lista de tecnologias: é evidência de operação. Repositórios organizados, README com diagrama, pipeline visível e verde, dashboards com captura de tela, um postmortem real e ADRs. Isso vale mais que dez certificados sem prática.",
          "No currículo, cada linha deve ter verbo, escopo e resultado medido: 'reduzi o tempo de build de 22 para 4 minutos com cache de dependências e multi-stage' comunica competência; 'conhecimento em Docker' não comunica nada. Números vindos do seu próprio projeto são legítimos e verificáveis.",
          "Na entrevista, o roteiro é previsível: um problema de Linux/rede, um de container/Kubernetes, um de pipeline, um de nuvem/segurança e um comportamental sobre incidente. Ensaie em voz alta com o CloudShop como referência, sempre em três partes: situação, o que você fez, resultado medido.",
        ],
        code: [
          {
            label: "Checklist de candidatura",
            language: "markdown",
            code: `## Antes de aplicar
- [ ] 3 repositorios publicos organizados (app, infra, gitops)
- [ ] README com diagrama, decisoes, custo e runbooks
- [ ] Pipeline visivel e verde, com badge no README
- [ ] Captura do dashboard e do SLO
- [ ] 1 postmortem real publicado
- [ ] LinkedIn alinhado ao curriculo, com projeto em destaque

## Curriculo — exemplos de linha
- Reduzi o tempo de build de 22 para 4 minutos (cache de dependencias + multi-stage).
- Implementei GitOps com ArgoCD: rollback de producao em 4 minutos (antes ~35).
- Reduzi 38% do custo mensal com right-sizing e desligamento noturno, sem violar SLO de 99,9%.
- Instrumentei metricas, logs e traces; deteccao de incidente passou de 18 para 2 minutos.

## Historias de 2 minutos (situacao / acao / resultado)
1. Incidente diagnosticado com evidencia (logs, traces, metricas)
2. Automacao que reduziu tempo ou risco, com numero
3. Decisao de arquitetura com trade-off assumido`,
          },
        ],
        whyItMatters: "Competência sem narrativa não gera oferta. Esta aula converte o estudo em resultado profissional.",
        commonMistake: "Listar ferramentas sem nunca ter operado nada de ponta a ponta.",
        productionTip: "Grave-se respondendo as três histórias: ouvir a própria resposta corrige mais que qualquer dica.",
        interviewQuestion: "Fale sobre um projeto que você construiu do zero à produção e o que faria diferente hoje.",
        glossary: [
          { term: "portfólio", definition: "Conjunto de evidências verificáveis do que você sabe operar." },
          { term: "STAR", definition: "Estrutura de resposta: situação, tarefa, ação e resultado." },
        ],
        printQuestLink: "Publicar o CloudShop como projeto principal do portfólio.",
        quiz: [
          {
            question: "Qual linha de currículo é mais forte?",
            options: [
              "Conhecimento em Docker e Kubernetes",
              "Reduzi o tempo de build de 22 para 4 minutos com cache e multi-stage",
              "Interesse em cloud computing",
              "Cursos de DevOps concluídos",
            ],
            answerIndex: 1,
            explanation: "Resultado medido demonstra competência aplicada.",
          },
        ],
      },
    ],
  },
];
