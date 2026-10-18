import type { Module } from "@/lib/types";

export const SRE_FINAL_MODULES: Module[] = [
  {
    id: "mod-10",
    index: 10,
    slug: "observabilidade-e-sre",
    title: "Observabilidade e SRE",
    tagline: "Saber o que acontece antes do cliente contar.",
    weeks: 3,
    xp: 2575,
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
    topics: [
      "Logs",
      "Métricas",
      "Traces",
      "Prometheus",
      "Grafana",
      "Loki",
      "OpenTelemetry",
      "Alertmanager",
      "RED",
      "USE",
      "SLI/SLO",
      "Incidentes",
    ],
    delivery:
      "Dashboard, alertas por sintoma, SLO documentado, runbook de incidente e postmortem de um evento real.",
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
        objectives: [
          "Escolher o sinal adequado a cada pergunta",
          "Instrumentar as quatro métricas essenciais",
          "Evitar cardinalidade explosiva",
        ],
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
        whyItMatters:
          "Serviço sem instrumentação é caixa preta: você descobre problema pelo cliente e depura por adivinhação.",
        commonMistake: "Usar caminho completo com ID como label e criar milhões de séries.",
        productionTip:
          "Histograma de latência com buckets alinhados ao seu SLO; buckets errados inutilizam o p95.",
        securityAlert:
          "Nunca coloque dado pessoal em label de métrica: ele fica retido por muito tempo e é difícil de expurgar.",
        interviewQuestion: "Quando você usaria trace em vez de log para investigar lentidão?",
        glossary: [
          {
            term: "RED",
            definition: "Rate, Errors, Duration: método de monitoramento orientado a serviço.",
          },
          {
            term: "cardinalidade",
            definition: "Número de séries distintas geradas pelas combinações de labels.",
          },
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
        objectives: [
          "Escrever PromQL de taxa e percentil",
          "Criar regras de alerta por sintoma",
          "Configurar roteamento no Alertmanager",
        ],
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
        commonMistake:
          "Alertar em CPU e disco e não alertar em taxa de erro percebida pelo usuário.",
        productionTip:
          "Todo alerta crítico deve ter link para runbook com passos de diagnóstico e mitigação.",
        interviewQuestion: "Como você definiria alertas para um serviço novo sem histórico?",
        glossary: [
          {
            term: "rate",
            definition: "Função PromQL que calcula taxa por segundo de um contador.",
          },
          {
            term: "burn rate",
            definition: "Velocidade de consumo do error budget em relação ao permitido.",
          },
        ],
        printQuestLink: "Criar as regras de alerta do CloudShop com runbook vinculado.",
        quiz: [
          {
            question: "Qual alerta é mais acionável?",
            options: [
              "CPU acima de 80%",
              "Taxa de 5xx acima de 2% por 5 minutos",
              "Disco em 60%",
              "Número de pods maior que 3",
            ],
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
        objectives: [
          "Construir dashboard que responde perguntas",
          "Consultar logs com LogQL",
          "Correlacionar métrica e log",
        ],
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
        productionTip:
          "Coloque o painel de SLO no topo e o runbook linkado na descrição do dashboard.",
        securityAlert:
          "Log centralizado concentra dados sensíveis: defina retenção e controle de acesso.",
        interviewQuestion:
          "Como você correlaciona um pico de latência com os logs correspondentes?",
        glossary: [
          { term: "LogQL", definition: "Linguagem de consulta do Loki, inspirada em PromQL." },
          {
            term: "log estruturado",
            definition: "Log emitido como objeto (JSON) com campos consultáveis.",
          },
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
        objectives: [
          "Instrumentar traces com OTel",
          "Entender contexto e propagação",
          "Usar amostragem com critério",
        ],
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
        whyItMatters:
          "Em arquitetura distribuída, sem trace a investigação de latência é chute educado.",
        commonMistake:
          "Instrumentar apenas um serviço e perder a propagação — o trace fica quebrado.",
        productionTip:
          "Tail sampling preservando erros e requisições lentas dá o melhor custo-benefício.",
        securityAlert: "Nunca envie corpo completo de requisição para o backend de traces.",
        interviewQuestion: "O que é propagação de contexto e como ela funciona em HTTP?",
        glossary: [
          {
            term: "span",
            definition: "Unidade de trabalho dentro de um trace, com início, fim e atributos.",
          },
          {
            term: "Collector",
            definition: "Processo que recebe, transforma e exporta telemetria para backends.",
          },
        ],
        printQuestLink:
          "Rastrear a jornada de criação de pedido do CloudShop do frontend ao banco.",
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
        objectives: [
          "Definir SLI e SLO do CloudShop",
          "Calcular e usar error budget",
          "Conduzir incidente e escrever postmortem",
        ],
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
        whyItMatters:
          "SLO e postmortem são o vocabulário de SRE em entrevistas de nível pleno e sênior.",
        commonMistake: "Definir SLO de 99,99% sem arquitetura nem orçamento para sustentá-lo.",
        productionTip:
          "Alerte por burn rate do error budget, não por qualquer desvio: reduz drasticamente ruído.",
        securityAlert:
          "Postmortem pode conter dado sensível de cliente; publique versão interna e versão sanitizada.",
        interviewQuestion:
          "Explique error budget e como ele influencia a decisão de lançar uma funcionalidade.",
        glossary: [
          {
            term: "error budget",
            definition: "Quantidade de falha permitida pelo SLO em uma janela de tempo.",
          },
          {
            term: "postmortem sem culpa",
            definition: "Análise focada em falhas de sistema e processo, não em pessoas.",
          },
        ],
        printQuestLink: "Publicar o SLO do CloudShop e o postmortem do incidente do módulo.",
        quiz: [
          {
            question:
              "SLO de 99,9% em 30 dias permite aproximadamente quanto de indisponibilidade?",
            options: ["4 horas", "43 minutos", "7 horas", "4 minutos"],
            answerIndex: 1,
            explanation: "0,1% de 30 dias equivale a cerca de 43 minutos.",
          },
        ],
      },
      {
        id: "l-10-6",
        moduleId: "mod-10",
        title: "Investigação ponta a ponta: do log ao span que explica a falha",
        duration: 55,
        difficulty: "Intermediário",
        tools: ["OpenTelemetry", "Node.js", "LogQL"],
        xp: 25,
        objectives: [
          "Padronizar campos de eventos sem registrar dados sensíveis",
          "Correlacionar logs com o contexto ativo do OpenTelemetry",
          "Diagnosticar quebras de propagação entre serviços",
          "Distinguir ausência de evento de ausência de amostra",
          "Validar uma hipótese com evidências de múltiplos sinais",
        ],
        body: [
          "Você já conhece logs e traces; agora vamos usá-los como uma **cadeia de evidências**. Imagine um pedido que falha somente ao calcular o frete: a métrica aponta o horário, o log descreve o evento e o `trace_id` permite procurar a execução correspondente.",
          "Um **contrato de log** define campos estáveis para toda a equipe. Comece com `timestamp`, `level`, `service`, `event`, `trace_id` e `span_id`; acrescente apenas atributos necessários ao diagnóstico. Um evento como `shipping.failed` é mais fácil de consultar que dezenas de mensagens livres.",
          "O **contexto ativo** pertence à execução atual, não a uma variável global. Com a instrumentação OTel inicializada antes da aplicação, `trace.getSpan(context.active())` recupera o span daquela operação. Guardar o último identificador em uma variável compartilhada mistura requisições concorrentes e produz correlações falsas.",
          "No exemplo, a função `logEvent` usa uma **lista permitida de campos** e consulta o contexto no momento da emissão. Execute-a dentro de um handler instrumentado; fora de um span, os identificadores ficam ausentes. Isso é esperado em tarefas ainda não instrumentadas e não deve ser preenchido com um identificador inventado.",
          "Para cruzar processos, a **propagação** precisa transportar contexto: em HTTP, normalmente `traceparent`; em filas, propriedades da mensagem. Se o consumidor iniciar outro trace, confira injeção no produtor e extração no consumidor antes de concluir que o backend perdeu dados. Instrumentação automática não cobre necessariamente todo cliente de mensageria.",
          "No Loki, mantenha `trace_id` no **conteúdo JSON**, não como label indexado do stream. Filtre primeiro pelo serviço e pelo intervalo, depois extraia o JSON e busque o identificador. Configure no Grafana um campo derivado apontando para o backend de traces para reduzir o trabalho manual.",
          "A **amostragem** muda o que você consegue provar. Um log com `trace_id` não garante que o trace foi armazenado: uma decisão de head sampling pode descartá-lo antes do Collector. Tail sampling só avalia spans que chegaram até ele; não recupera dados descartados na origem.",
          "Feche o exercício com uma **falha controlada** no laboratório: provoque timeout no frete, encontre o evento `shipping.failed` e confira a duração do span correspondente. Registre também o caso sem trace retido e a limitação observada. Investigar bem inclui dizer o que a evidência disponível não permite concluir.",
        ],
        code: [
          {
            label: "Logger com correlação ao contexto ativo",
            language: "javascript",
            code: 'import { context, trace } from "@opentelemetry/api";\n\n// Pré-requisito: SDK OTel inicializado antes da aplicação.\nfunction logEvent(event, { status, dependency } = {}) {\n  const span = trace.getSpan(context.active());\n  const ids = span?.spanContext();\n  // Lista permitida: não aceite corpo, headers ou atributos arbitrários.\n  process.stdout.write(JSON.stringify({\n    timestamp: new Date().toISOString(),\n    level: "error",\n    service: "cloudshop-api",\n    event,\n    trace_id: ids?.traceId,\n    span_id: ids?.spanId,\n    status,\n    dependency,\n  }) + "\\n");\n}\n\n// Chame dentro do handler instrumentado ao detectar a falha real.\nlogEvent("shipping.failed", { status: 504, dependency: "shipping" });',
          },
          {
            label: "Localizar o evento correlacionado no Loki",
            language: "logql",
            code: '# Selecione o intervalo do incidente e substitua pelo trace_id observado.\n{app="cloudshop", component="api"}\n  | json\n  | event = "shipping.failed"\n  | trace_id = "4bf92f3577b34da6a3ce929d0e0e4736"',
          },
        ],
        whyItMatters:
          "Correlação confiável reduz tentativas aleatórias e permite explicar qual dependência afetou uma jornada.",
        commonMistake:
          "Presumir que todo trace_id encontrado em log terá um trace armazenado, ignorando a amostragem.",
        productionTip:
          "Teste a correlação em duas requisições simultâneas e após atravessar uma fila; isso revela contexto perdido ou compartilhado.",
        securityAlert:
          "Não registre Authorization, cookies, payloads de pagamento nem baggage indiscriminadamente; aplique retenção e acesso mínimo aos backends.",
        interviewQuestion:
          "Como você investigaria logs com trace_id válido quando o backend não encontra o trace?",
        glossary: [
          {
            term: "Contexto ativo",
            definition: "Estado da execução atual usado para associar eventos ao span correto.",
          },
          {
            term: "trace_id",
            definition: "Identificador compartilhado pelos spans de um trace distribuído.",
          },
          {
            term: "span_id",
            definition: "Identificador de uma operação específica dentro do trace.",
          },
          {
            term: "Head sampling",
            definition: "Decisão de amostragem feita no início do trace.",
          },
          {
            term: "Propagação",
            definition: "Transporte de contexto entre processos para manter a correlação.",
          },
        ],
        printQuestLink:
          "Entregar uma investigação do timeout de frete do CloudShop com log sanitizado, trace correlacionado e teste de propagação.",
        quiz: [
          {
            question: "Onde recuperar o identificador de trace ao emitir um log?",
            options: [
              "Em uma variável global com o último ID",
              "No contexto ativo da execução",
              "No nome do pod",
              "No status HTTP",
            ],
            answerIndex: 1,
            explanation:
              "O contexto ativo evita misturar identificadores de requisições concorrentes.",
          },
          {
            question: "Por que um trace_id pode não ter trace no backend?",
            options: [
              "Todo log está corrompido",
              "JSON impede tracing",
              "O trace pode ter sido descartado pela amostragem",
              "O span_id substitui o trace",
            ],
            answerIndex: 2,
            explanation:
              "A existência do identificador não garante retenção ou exportação do trace.",
          },
          {
            question: "Como armazenar trace_id no Loki neste exercício?",
            options: [
              "Como label único de cada stream",
              "No nome do serviço",
              "Como campo JSON consultável",
              "Como senha do coletor",
            ],
            answerIndex: 2,
            explanation: "Campos no conteúdo permitem busca sem criar um stream por identificador.",
          },
        ],
      },
      {
        id: "l-10-7",
        moduleId: "mod-10",
        title: "Engenharia de alertas: burn rate multijanela e revisão do plantão",
        duration: 55,
        difficulty: "Intermediário",
        tools: ["Prometheus", "promtool", "Alertmanager"],
        xp: 25,
        objectives: [
          "Calcular burn rate a partir de um SLO baseado em requisições",
          "Combinar janelas longa e curta em uma regra",
          "Separar paginação urgente de trabalho planejável",
          "Tratar ausência de tráfego como condição distinta",
          "Revisar a qualidade dos alertas com o plantão",
        ],
        body: [
          "Esta aula transforma a ideia de alerta acionável em uma **política verificável**. O objetivo não é silenciar sintomas, mas chamar alguém apenas quando há uma decisão urgente. Para cada regra, escreva impacto, responsável, ação inicial e canal; sem esses itens, `severity: critical` é apenas um rótulo.",
          "Considere **SLO de disponibilidade de 99,9%** em 30 dias, medido por requisições. A fração de falha permitida é `0.001`; o burn rate é a proporção observada de erros dividida por esse valor. Assim, 1,44% de erros corresponde a `14.4` vezes a taxa permitida.",
          "A **janela longa** acumula evidência de impacto; a curta confirma que o problema continua acontecendo. Exigir burn rate acima de `14.4` tanto em uma hora quanto em cinco minutos reduz páginas causadas por uma falha antiga que já cessou. O operador `and on(service)` combina séries da mesma dimensão.",
          "O limiar tem uma **interpretação de orçamento**: mantendo o mesmo perfil de tráfego, `14.4 × 1h / 720h` representa aproximadamente 2% do orçamento de 30 dias. Para SLO por requisições, o consumo real depende da distribuição do tráfego; valide também contagens acumuladas, em vez de converter tudo automaticamente em minutos.",
          "O bloco usa o contador de histograma já instrumentado, `http_request_duration_seconds_count`, e pressupõe a label `service`. As regras de gravação calculam proporções por serviço. Se a sua instrumentação não expõe essa label, adicione-a de forma consistente ou adapte a agregação antes de copiar a regra.",
          "**Sem tráfego não significa 100% de disponibilidade**. A divisão pode gerar `NaN`, e ausência de coleta pode eliminar séries; não force zero com um preenchimento que esconda falhas. Monitore scrape e disponibilidade do pipeline separadamente e use uma sonda sintética quando a jornada precisar de validação mesmo sem usuários.",
          "**Paginação e ticket têm urgências diferentes**. A queima rápida pode chamar o plantão; uma degradação lenta e persistente pode gerar trabalho para o horário útil, conforme a política acordada. `for: 2m` adiciona persistência, mas também atraso: avalie esse custo no tempo de detecção.",
          "Por fim, faça uma **revisão semanal de ruído**: quantas notificações exigiram ação, quais duplicaram outras e quais chegaram tarde? Teste regras com `promtool`, simule recuperação e confira roteamento no Alertmanager. Só ajuste limites após comparar impacto e evidência; reduzir páginas às cegas pode ocultar incidentes.",
        ],
        code: [
          {
            label: "Regras multijanela por serviço",
            language: "yaml",
            code: '# Pré-requisito: contador com labels service e status.\ngroups:\n  - name: cloudshop-slo\n    rules:\n      - record: service:http_errors:ratio1h\n        expr: |\n          sum by (service) (rate(http_request_duration_seconds_count{status=~"5.."}[1h]))\n          / sum by (service) (rate(http_request_duration_seconds_count[1h]))\n      - record: service:http_errors:ratio5m\n        expr: |\n          sum by (service) (rate(http_request_duration_seconds_count{status=~"5.."}[5m]))\n          / sum by (service) (rate(http_request_duration_seconds_count[5m]))\n      - alert: CloudShopBudgetQueimaRapida\n        expr: |\n          (service:http_errors:ratio1h{service="cloudshop-api"} / 0.001 > 14.4)\n          and on (service)\n          (service:http_errors:ratio5m{service="cloudshop-api"} / 0.001 > 14.4)\n        for: 2m\n        labels:\n          severity: critical\n          team: platform\n        annotations:\n          summary: "Falhas da API consomem o orçamento rapidamente"\n          description: "Verificar impacto e seguir docs/runbooks/api-5xx.md"',
          },
          {
            label: "Validar o arquivo antes de recarregar o Prometheus",
            language: "bash",
            code: "# Salve o YAML anterior como cloudshop-slo.rules.yml.\n# Verifica sintaxe; não substitui testes de comportamento com séries simuladas.\npromtool check rules cloudshop-slo.rules.yml",
          },
        ],
        whyItMatters:
          "Alertas sustentáveis preservam atenção humana para situações que realmente ameaçam a experiência do usuário.",
        commonMistake:
          "Usar apenas a janela longa e continuar notificando depois que o serviço já se recuperou.",
        productionTip:
          "Adicione testes de regra para erro sustentado, recuperação, baixo tráfego e série ausente antes de ativar paginação.",
        securityAlert:
          "Notificações devem trazer links e agregados, nunca credenciais ou amostras de dados pessoais; restrinja quem pode criar silêncios.",
        interviewQuestion:
          "Por que combinar duas janelas e como validar que o alerta não mascara ausência de telemetria?",
        glossary: [
          {
            term: "Burn rate",
            definition: "Razão entre a taxa de falhas observada e a taxa permitida pelo SLO.",
          },
          {
            term: "Regra de gravação",
            definition: "Expressão PromQL cujo resultado é armazenado como nova série.",
          },
          {
            term: "Multijanela",
            definition: "Uso combinado de intervalos diferentes para avaliar um sintoma.",
          },
          {
            term: "Paginação",
            definition: "Notificação urgente que exige resposta do plantão.",
          },
          {
            term: "Fadiga de alertas",
            definition: "Perda de atenção causada por notificações frequentes e pouco úteis.",
          },
        ],
        printQuestLink:
          "Entregar regra multijanela do CloudShop validada, política de canais e registro de revisão de ruído.",
        quiz: [
          {
            question: "Com SLO de 99,9%, qual o burn rate para 1,44% de erros?",
            options: ["0,144", "1,44", "14,4", "1440"],
            answerIndex: 2,
            explanation: "0,0144 dividido por 0,001 resulta em 14,4.",
          },
          {
            question: "Qual o papel da janela curta?",
            options: [
              "Confirmar que a degradação continua",
              "Substituir o SLO",
              "Eliminar toda notificação",
              "Medir custo mensal",
            ],
            answerIndex: 0,
            explanation:
              "Ela evita tratar um impacto passado como falha necessariamente ainda ativa.",
          },
          {
            question: "Uma série sem dados prova disponibilidade total?",
            options: [
              "Sim, não há erros",
              "Somente à noite",
              "Sim, com for",
              "Não; pode haver falha de coleta",
            ],
            answerIndex: 3,
            explanation:
              "Ausência de evidência exige verificar a saúde da telemetria e outras sondas.",
          },
        ],
      },
      {
        id: "l-10-8",
        moduleId: "mod-10",
        title: "Game day: resposta coordenada e ações de postmortem verificáveis",
        duration: 55,
        difficulty: "Intermediário",
        tools: ["kubectl", "Runbooks", "Markdown"],
        xp: 25,
        objectives: [
          "Executar um exercício de incidente com limites claros",
          "Separar comando, investigação e comunicação",
          "Escolher mitigação reversível com critério de sucesso",
          "Registrar uma linha do tempo com evidências",
          "Transformar aprendizados em ações testáveis",
        ],
        body: [
          "Em vez de repetir o conceito de postmortem, vamos **ensaiar o ciclo completo**. Um game day é uma simulação planejada para testar pessoas, processos e ferramentas. Use o CloudShop de laboratório; defina previamente cenário, duração, responsáveis e condição de parada em `docs/game-day.md`.",
          "Comece estabelecendo **limites de segurança**: ambiente isolado, dados sintéticos, autorização e um observador com poder de abortar. Uma simulação que toca produção por engano já é um incidente real. Confirme o contexto com `kubectl config current-context` antes de qualquer operação.",
          "Ao detectar a degradação, nomeie um **coordenador do incidente**. Ele mantém prioridades e evita intervenções conflitantes; outra pessoa investiga e outra comunica. Em uma equipe pequena, uma pessoa pode acumular papéis, mas precisa anunciar essa limitação e registrar decisões no canal `inc-cloudshop`.",
          "Escreva a primeira atualização com **impacto, horário e próximo retorno**, mesmo sem causa conhecida. Diga o que foi observado e o que ainda é hipótese: “checkout apresenta erros desde 14:02 UTC; próxima atualização às 14:12”. Não prometa uma restauração em `5m` sem evidência.",
          "A **mitigação vem antes da explicação definitiva**. Se o início coincide com um deploy, compare a revisão atual e a anterior e avalie rollback; uma migração incompatível pode impedir essa opção. Registre alternativa, risco, autorização e sinal que comprovará melhora antes de executar a mudança.",
          "O exemplo usa uma **revisão explícita** para reduzir ambiguidades, mas só deve ser executado após a avaliação de compatibilidade. `rollout status` informa progresso do Deployment, não a recuperação da experiência. Confira também a jornada sintética de compra, a taxa de erros e o tempo de resposta.",
          "Após estabilizar, preserve a **linha do tempo factual**: detecção, decisões, mudanças e recuperação, com horários em UTC. No postmortem, diferencie gatilho de condições contribuintes. “Deploy iniciou a falha” não explica por que testes, revisão e mecanismos de recuperação não a impediram.",
          "Termine com **ações verificáveis**, não promessas vagas. Troque “melhorar testes” por “adicionar teste de exaustão do pool que falha na versão defeituosa”, com responsável, prazo e evidência. Agende novo exercício para comprovar a mudança e só encerre o item quando o critério de aceite estiver cumprido.",
        ],
        code: [
          {
            label: "Inspeção e mitigação em laboratório autorizado",
            language: "bash",
            code: "# Leia o contexto e confirme manualmente que é o laboratório autorizado.\nkubectl config current-context\nkubectl -n cloudshop-lab rollout history deployment/cloudshop-api\nkubectl -n cloudshop-lab get deployment cloudshop-api -o wide\n\n# Somente após validar compatibilidade e autorizar a revisão 3 deste laboratório.\nkubectl -n cloudshop-lab rollout undo deployment/cloudshop-api --to-revision=3\nkubectl -n cloudshop-lab rollout status deployment/cloudshop-api --timeout=120s\n# Depois, valide checkout sintético e métricas; rollout saudável não basta.",
          },
          {
            label: "Registro de decisão e ação com aceite",
            language: "yaml",
            code: '# Exemplo didático: substitua horários e evidências pelos dados do exercício.\nincidente: GD-001\nambiente: cloudshop-lab\ndecisao:\n  horario_utc: "2026-09-14T14:08:00Z"\n  hipotese: "Nova versão não devolve conexões ao pool"\n  mitigacao: "Retornar à revisão 3 compatível com o esquema atual"\n  sucesso: "Checkout sintético funciona e erros retornam à linha de base por 10 minutos"\nacao:\n  responsavel: "Equipe da API"\n  prazo: "2026-09-21"\n  aceite: "Teste de carga falha na versão defeituosa e passa na corrigida"\n  evidencia: "Anexar execução do CI ao ticket antes de encerrá-lo"',
          },
        ],
        whyItMatters:
          "Uma equipe que ensaia decisões e comunicação reduz improviso e consegue comprovar se aprendeu com falhas.",
        commonMistake:
          "Encerrar o incidente quando os pods ficam Ready, sem confirmar a jornada do usuário.",
        productionTip:
          "Mantenha o runbook acessível mesmo se o cluster ou o provedor principal estiver indisponível.",
        securityAlert:
          "Não faça injeção de falhas fora do escopo autorizado; sanitize evidências e envolva resposta de segurança se houver suspeita de comprometimento.",
        interviewQuestion:
          "Como decidir entre rollback e investigação adicional, e que evidência permite declarar recuperação?",
        glossary: [
          {
            term: "Game day",
            definition: "Exercício controlado para testar resposta e resiliência.",
          },
          {
            term: "Mitigação",
            definition: "Ação para reduzir impacto antes da correção definitiva.",
          },
          {
            term: "Coordenador do incidente",
            definition: "Pessoa que organiza prioridades e decisões durante a resposta.",
          },
          {
            term: "Gatilho",
            definition: "Evento que inicia a manifestação de uma falha.",
          },
          {
            term: "Critério de aceite",
            definition: "Condição objetiva necessária para considerar uma ação concluída.",
          },
        ],
        printQuestLink:
          "Executar um game day no CloudShop de laboratório e entregar linha do tempo, comunicação e postmortem com ações testáveis.",
        quiz: [
          {
            question: "Qual evidência basta para declarar recuperação?",
            options: [
              "Deployment atualizado apenas",
              "Fim do expediente",
              "Jornada validada e indicadores estabilizados",
              "Hipótese plausível",
            ],
            answerIndex: 2,
            explanation:
              "A recuperação deve refletir a experiência, não somente o estado do orquestrador.",
          },
          {
            question: "Qual ação de postmortem é verificável?",
            options: [
              "Ter mais cuidado",
              "Teste do pool com responsável, prazo e execução anexada",
              "Nunca mais falhar",
              "Melhorar tudo",
            ],
            answerIndex: 1,
            explanation: "Um aceite observável permite comprovar conclusão e eficácia.",
          },
          {
            question: "Quando executar rollback?",
            options: [
              "Sempre que alguém sugerir",
              "Sem consultar o esquema do banco",
              "Só depois de descobrir toda a causa",
              "Após avaliar compatibilidade, risco e critério de sucesso",
            ],
            answerIndex: 3,
            explanation: "Mitigar rapidamente não significa ignorar riscos de incompatibilidade.",
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
    xp: 3075,
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
    topics: [
      "Secrets",
      "SCA",
      "Scan de imagem",
      "Supply chain",
      "Backups",
      "IAM",
      "Orçamento",
      "Otimização",
      "Documentação",
    ],
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
    printQuest:
      "Fechar o CloudShop: segurança no pipeline, custo documentado e apresentação de portfólio.",
    lessons: [
      {
        id: "l-11-1",
        moduleId: "mod-11",
        title: "Secrets: ciclo de vida, rotação e detecção de vazamento",
        duration: 40,
        difficulty: "Avançado",
        tools: ["Secrets Manager", "gitleaks", "OIDC"],
        xp: 25,
        objectives: [
          "Definir onde cada segredo vive",
          "Automatizar rotação",
          "Detectar vazamento no histórico",
        ],
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
        whyItMatters:
          "Credencial vazada é a causa mais frequente de comprometimento em ambientes de nuvem.",
        commonMistake: "Apagar o arquivo do repositório e considerar o problema resolvido.",
        productionTip: "Prefira identidade federada: segredo que não existe não pode vazar.",
        securityAlert:
          "Segredo em variável de ambiente aparece em dump de erro e em ferramenta de APM mal configurada.",
        interviewQuestion: "Qual seu procedimento ao descobrir uma chave de nuvem commitada?",
        glossary: [
          {
            term: "rotação",
            definition: "Substituição periódica de credencial, idealmente automatizada.",
          },
          {
            term: "gitleaks",
            definition: "Scanner que detecta padrões de segredo em código e histórico.",
          },
        ],
        printQuestLink:
          "Varrer o histórico dos repositórios do CloudShop e ativar rotação do segredo do banco.",
        quiz: [
          {
            question: "Ao encontrar uma chave de acesso commitada, a primeira ação é:",
            options: [
              "Remover o arquivo",
              "Rotacionar/revogar a credencial",
              "Reescrever o histórico",
              "Tornar o repositório privado",
            ],
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
        objectives: [
          "Adicionar scans no CI com política clara",
          "Gerar SBOM",
          "Assinar e verificar imagens",
        ],
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
        whyItMatters:
          "DevSecOps aparece explicitamente nas vagas e é o que permite entregar rápido sem virar risco.",
        commonMistake:
          "Ligar todos os scanners sem política e depois desligá-los porque 'travam o time'.",
        productionTip:
          "Exija assinatura de imagem no cluster (policy controller): só roda o que seu pipeline produziu.",
        securityAlert:
          "Dependência typosquatting instala pacote malicioso no build. Fixe versões e revise lockfile em PR.",
        interviewQuestion:
          "Como você definiria a política de bloqueio de vulnerabilidades no pipeline?",
        glossary: [
          {
            term: "SCA",
            definition:
              "Software Composition Analysis: análise de dependências e suas vulnerabilidades.",
          },
          {
            term: "cosign",
            definition: "Ferramenta do projeto Sigstore para assinar e verificar artefatos.",
          },
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
        objectives: [
          "Atribuir custo por projeto e ambiente",
          "Aplicar right-sizing",
          "Automatizar economia",
        ],
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
        whyItMatters:
          "Engenheiro que fala de custo com números participa de decisões — e isso acelera carreira.",
        commonMistake:
          "Cortar réplicas e limites até violar o SLO, trocando fatura menor por incidente.",
        productionTip:
          "Publique um painel de custo por ambiente ao lado do painel de SLO: as duas conversas ficam honestas.",
        interviewQuestion: "Como você reduziria 30% do custo mantendo o SLO?",
        glossary: [
          {
            term: "right-sizing",
            definition: "Ajustar o tamanho do recurso ao consumo real observado.",
          },
          {
            term: "spot",
            definition: "Capacidade com grande desconto que pode ser interrompida pelo provedor.",
          },
        ],
        printQuestLink:
          "Documentar o custo mensal do CloudShop e aplicar duas otimizações medidas.",
        quiz: [
          {
            question: "Qual é o pré-requisito para atribuir custo por ambiente?",
            options: [
              "Budget configurado",
              "Tags consistentes e ativadas para alocação",
              "Instâncias reservadas",
              "Multi-AZ",
            ],
            answerIndex: 1,
            explanation:
              "Sem tags de alocação, o relatório não separa o gasto por ambiente ou projeto.",
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
        objectives: [
          "Escrever README que sustenta uma conversa técnica",
          "Registrar decisões com ADR",
          "Preparar a narrativa da entrevista",
        ],
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
        whyItMatters:
          "Na entrevista, quem documenta consegue provar; quem não documenta precisa que acreditem.",
        commonMistake:
          "README com apenas instruções de instalação, sem arquitetura, decisões nem custo.",
        productionTip:
          "Escreva o ADR no momento da decisão: reconstruir o raciocínio depois nunca sai igual.",
        interviewQuestion:
          "Conte uma decisão de arquitetura sua, as alternativas e o trade-off assumido.",
        glossary: [
          {
            term: "ADR",
            definition:
              "Registro curto de uma decisão de arquitetura, com contexto e consequências.",
          },
          {
            term: "RTO",
            definition: "Recovery Time Objective: tempo alvo para restaurar o serviço.",
          },
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
        objectives: [
          "Transformar o projeto em portfólio",
          "Escrever currículo orientado a resultado",
          "Treinar entrevista técnica e comportamental",
        ],
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
        whyItMatters:
          "Competência sem narrativa não gera oferta. Esta aula converte o estudo em resultado profissional.",
        commonMistake: "Listar ferramentas sem nunca ter operado nada de ponta a ponta.",
        productionTip:
          "Grave-se respondendo as três histórias: ouvir a própria resposta corrige mais que qualquer dica.",
        interviewQuestion:
          "Fale sobre um projeto que você construiu do zero à produção e o que faria diferente hoje.",
        glossary: [
          {
            term: "portfólio",
            definition: "Conjunto de evidências verificáveis do que você sabe operar.",
          },
          {
            term: "STAR",
            definition: "Estrutura de resposta: situação, tarefa, ação e resultado.",
          },
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
      {
        id: "l-11-6",
        moduleId: "mod-11",
        title: "Portfólio auditável: provas reproduzíveis em vez de promessas",
        duration: 55,
        difficulty: "Intermediário",
        tools: ["GitHub Actions", "Docker Compose", "Markdown"],
        xp: 25,
        objectives: [
          "Construir uma matriz de competências e evidências",
          "Separar resultados medidos de estimativas",
          "Criar uma validação reproduzível do projeto",
          "Preparar demonstração curta com plano alternativo",
          "Publicar evidências sem expor dados privados",
        ],
        body: [
          "Você já organizou currículo e README; agora precisa demonstrar **reprodutibilidade**. Um portfólio forte permite a outra pessoa verificar uma afirmação sem depender da sua apresentação. Para cada competência, conecte `afirmação → artefato → procedimento de validação → limitação`.",
          "Escolha **três provas relevantes** em vez de multiplicar repositórios. No CloudShop, use uma implantação automatizada, uma recuperação de falha e uma otimização medida. Cada prova deve apontar para um commit ou uma execução específica, e não apenas para um badge `passing` que muda com o tempo.",
          "Uma comparação exige **condições explícitas**: versão, tamanho da amostra, máquina, carga e intervalo. Se o build passou de 12 para 5 minutos, informe se o cache estava frio ou quente em cada teste. Registre também a dispersão; `n=1` é uma observação, não uma garantia de desempenho.",
          "Separe **laboratório e produção** sem diminuir a prática. Diga que o projeto usa dados sintéticos e uma carga de `20 req/s`, se isso for verdade. Operar um exercício bem documentado demonstra raciocínio; apresentá-lo como operação comercial real compromete sua credibilidade.",
          "A **demonstração local** deve ter pré-requisitos e uma saída esperada. O script pressupõe um arquivo Compose já existente, aguarda o healthcheck e consulta `/health`. Adapte o endpoint ao contrato da sua API e documente consumo de memória e portas antes de pedir que alguém execute.",
          "Prepare uma **narrativa de cinco minutos**: problema, decisão, prova, resultado e limite. Mostre uma execução e uma evidência de recuperação, não todas as telas. Tenha uma gravação curta e resultados sanitizados como plano alternativo se a rede falhar durante a entrevista.",
          "A **curadoria pública** é uma atividade de segurança. Faça revisão do histórico, capturas e artefatos; um terminal gravado pode revelar tokens ou nomes internos. O arquivo `.env.example` precisa conter placeholders, nunca credenciais funcionais, mesmo que sejam de laboratório.",
          "Conclua pedindo uma **avaliação externa**: outra pessoa consegue rodar o projeto com as instruções e explicar o trade-off sem sua ajuda? Registre dificuldades como issues, corrija as mais importantes e marque a versão demonstrada com uma referência como `portfolio-v1`. Essa validação vale mais que ampliar a lista de ferramentas.",
        ],
        code: [
          {
            label: "Smoke test reproduzível do ambiente local",
            language: "bash",
            code: "#!/usr/bin/env bash\nset -euo pipefail\n# Pré-requisitos: Docker Compose v2, compose.yaml com healthcheck e API em 8080.\n# Execute apenas em ambiente local de estudo; remove containers ao terminar.\ntrap 'docker compose down' EXIT\ndocker compose up -d --build --wait --wait-timeout 120\n# -f faz o teste falhar em respostas HTTP de erro.\ncurl --fail --silent --show-error --max-time 10 http://localhost:8080/health\nprintf '\\nSmoke test concluído.\\n'\n# O healthcheck não substitui um teste completo de criação de pedido.",
          },
          {
            label: "Índice de evidências do portfólio",
            language: "yaml",
            code: '# Metadados do laboratório: preencha resultados somente após medir.\nprojeto: CloudShop\ncontexto: "Laboratório com dados sintéticos, não operação comercial"\nevidencias:\n  - competencia: "Recuperação de falhas"\n    artefato: "docs/game-day.md"\n    reproducao: "Seguir cenário autorizado e registrar tempos em UTC"\n    criterio: "Checkout validado após mitigação"\n    limite: "Resultado válido para a carga e infraestrutura descritas"\n  - competencia: "Entrega automatizada"\n    artefato: ".github/workflows/ci.yml"\n    reproducao: "Consultar execução vinculada ao commit demonstrado"\n    criterio: "Build e testes aprovados sem credenciais no log"',
          },
        ],
        whyItMatters:
          "Evidências reproduzíveis permitem avaliar competência aplicada, mesmo quando sua experiência é de laboratório.",
        commonMistake:
          "Copiar números de exemplos para o currículo sem executar a medição correspondente.",
        productionTip:
          "Mantenha uma versão de demonstração estável e valide as instruções em ambiente limpo antes de cada apresentação.",
        securityAlert:
          "Nunca publique ativos ou incidentes do empregador sem autorização; remova dados pessoais e revogue qualquer credencial exposta.",
        interviewQuestion:
          "Como outra pessoa verificaria um resultado que você apresenta no portfólio e quais são os limites dessa medição?",
        glossary: [
          {
            term: "Reprodutibilidade",
            definition: "Possibilidade de repetir um procedimento sob condições documentadas.",
          },
          {
            term: "Artefato",
            definition: "Arquivo ou resultado concreto que sustenta uma afirmação.",
          },
          {
            term: "Linha de base",
            definition: "Medição inicial usada como referência de comparação.",
          },
          {
            term: "Smoke test",
            definition: "Verificação curta de funcionamento essencial.",
          },
          {
            term: "Curadoria",
            definition: "Seleção e revisão de evidências relevantes para um público.",
          },
        ],
        printQuestLink:
          "Publicar uma versão auditável do CloudShop com matriz de evidências, smoke test local e demonstração curta sanitizada.",
        quiz: [
          {
            question: "Qual evidência sustenta melhor uma melhoria de build?",
            options: [
              "Um número sem contexto",
              "Medições com versões, cache e ambiente documentados",
              "Uma lista de ferramentas",
              "Um certificado isolado",
            ],
            answerIndex: 1,
            explanation: "Condições documentadas tornam a comparação verificável.",
          },
          {
            question: "Como descrever uma recuperação feita em laboratório?",
            options: [
              "Como incidente comercial real",
              "Sem mencionar o ambiente",
              "Como exercício com carga, método e limites explícitos",
              "Como garantia de disponibilidade futura",
            ],
            answerIndex: 2,
            explanation: "Transparência preserva credibilidade e permite avaliar a prática.",
          },
          {
            question: "Qual o objetivo principal do smoke test?",
            options: [
              "Comprovar toda a segurança",
              "Substituir testes de carga",
              "Prometer SLO de produção",
              "Verificar rapidamente o funcionamento essencial",
            ],
            answerIndex: 3,
            explanation: "É uma checagem inicial e limitada, não uma prova completa de qualidade.",
          },
        ],
      },
      {
        id: "l-11-7",
        moduleId: "mod-11",
        title: "Entrevista prática: diagnóstico em voz alta e simulações com rubrica",
        duration: 55,
        difficulty: "Intermediário",
        tools: ["Linux", "curl", "kubectl", "GitHub Actions"],
        xp: 25,
        objectives: [
          "Organizar prática técnica por cenários e fundamentos",
          "Explicitar hipóteses e critérios de confirmação",
          "Diagnosticar conectividade em camadas",
          "Explicar riscos e alternativas de uma intervenção",
          "Avaliar simulações com uma rubrica objetiva",
        ],
        body: [
          "Aqui o foco não é repetir histórias de currículo: é **resolver problemas sob observação**. Em uma entrevista prática, o avaliador quer acompanhar seu modelo mental. Comece perguntando impacto, escopo, ambiente e mudanças recentes antes de executar `kubectl` ou sugerir trocar toda a arquitetura.",
          "Monte uma **matriz de treino por fundamentos**: processos e permissões em Linux; DNS, TCP e HTTP em redes; imagem e runtime em containers; recursos e eventos em Kubernetes; fluxo de artefatos e permissões no CI. Alterne cenários pequenos, como “pipeline não publica imagem”, com sessões de `30m`.",
          "Use um ciclo de **hipótese, teste e interpretação**. Diante de erro no checkout, diga: “vou separar resolução DNS de resposta HTTP; se DNS falhar, não concluo que a API caiu”. Execute uma consulta pequena e explique como o resultado muda a próxima decisão. Uma lista de comandos sem interpretação não demonstra diagnóstico.",
          "Comece por **inspeções não destrutivas**. O bloco de rede separa nome, conexão e status HTTP e registra tempos observados pelo cliente. Um `curl` bem-sucedido da sua máquina não prova que um pod alcança a dependência; origem, proxy e políticas podem mudar o caminho.",
          "Em Kubernetes, distinga **estado desejado e execução**: Deployment existe, mas há pods agendados? Eventos indicam imagem inválida, falta de recursos ou falha de probe? `describe` e logs ajudam a escolher a camada; reiniciar tudo pode apagar pistas e esconder o problema temporariamente.",
          "Treine também **leitura de pipeline**: descubra qual etapa falhou, que identidade a executa e qual artefato a etapa seguinte espera. Se a autenticação no registry falhar, não aumente permissões para administrador automaticamente. Explique como verificar escopo e corrigir apenas o acesso necessário.",
          "Quando não souber algo, pratique **incerteza responsável**: declare o limite e diga onde confirmaria o comportamento. “Não lembro essa flag; consultaria `--help` e testaria no laboratório” é melhor que inventar. Antes de uma mudança, anuncie risco, rollback e sinal de sucesso.",
          "Faça uma **simulação com rubrica**: de zero a dois pontos para delimitação, hipóteses, evidências, segurança e comunicação. Grave a sessão com dados fictícios, escolha um ponto fraco e repita o cenário com outra causa. O objetivo não é decorar respostas, mas melhorar decisões transferíveis entre ferramentas.",
        ],
        code: [
          {
            label: "Diagnóstico HTTP a partir da máquina do candidato",
            language: "bash",
            code: "# Pré-requisitos: getent e curl; adapte ao endpoint autorizado do exercício.\ngetent hosts example.com\n# Tempos cumulativos em segundos; não confunda HTTP 500 com falha de DNS.\ncurl --silent --show-error --output /dev/null   --connect-timeout 3 --max-time 10   --write-out 'http=%{http_code} dns=%{time_namelookup} connect=%{time_connect} total=%{time_total}\\n'   https://example.com/\n# Sem --fail, HTTP 4xx/5xx exige interpretação explícita do código retornado.",
          },
          {
            label: "Inspeção inicial sem alterar o cluster",
            language: "bash",
            code: "# Use somente o contexto e namespace autorizados pelo entrevistador.\nkubectl config current-context\nkubectl -n cloudshop-lab get deployments,pods,services\nkubectl -n cloudshop-lab describe deployment cloudshop-api\nkubectl -n cloudshop-lab get events --sort-by=.metadata.creationTimestamp\n# Logs podem conter dados sensíveis; não copie a saída para serviços públicos.\nkubectl -n cloudshop-lab logs deployment/cloudshop-api --tail=50 --timestamps",
          },
        ],
        whyItMatters:
          "Praticar diagnóstico explicável prepara tanto para entrevistas quanto para incidentes em ambientes desconhecidos.",
        commonMistake:
          "Executar comandos de alteração para parecer rápido antes de entender escopo e risco.",
        productionTip:
          "Repita o mesmo sintoma com causas diferentes: DNS inválido, timeout e HTTP 500 exigem raciocínios distintos.",
        securityAlert:
          "Não cole tokens ou logs de empresas em plataformas de entrevista; peça autorização antes de qualquer alteração e use privilégios mínimos.",
        interviewQuestion:
          "A aplicação não responde a um cliente, mas o pod está Running: quais hipóteses você testaria e em qual ordem?",
        glossary: [
          {
            term: "Hipótese",
            definition: "Explicação provisória que pode ser confirmada ou refutada por evidência.",
          },
          {
            term: "Rubrica",
            definition: "Critérios explícitos usados para avaliar uma prática.",
          },
          {
            term: "Timeout",
            definition: "Limite de espera excedido antes de uma operação terminar.",
          },
          {
            term: "Estado desejado",
            definition: "Configuração que o controlador busca manter no sistema.",
          },
          {
            term: "Escopo de permissão",
            definition: "Conjunto de recursos e ações autorizados para uma identidade.",
          },
        ],
        printQuestLink:
          "Realizar duas entrevistas simuladas com o CloudShop, entregando hipóteses, evidências sanitizadas e autoavaliação por rubrica.",
        quiz: [
          {
            question: "Antes de mudar o ambiente durante o diagnóstico, você deve:",
            options: [
              "Delimitar escopo, risco e autorização",
              "Reiniciar todos os pods",
              "Desligar os alertas",
              "Solicitar acesso de administrador sempre",
            ],
            answerIndex: 0,
            explanation: "A segurança da investigação começa antes da primeira alteração.",
          },
          {
            question: "HTTP 500 recebido pelo curl demonstra necessariamente falha de DNS?",
            options: [
              "Sim",
              "Não; houve resposta HTTP de um servidor no caminho",
              "Sim, se o pod está Running",
              "Apenas em HTTPS",
            ],
            answerIndex: 1,
            explanation:
              "Receber resposta HTTP é diferente de não resolver o nome; é preciso investigar a camada que respondeu.",
          },
          {
            question: "Se não lembra uma flag durante a entrevista, qual conduta é melhor?",
            options: [
              "Inventar e executar",
              "Encerrar o diagnóstico",
              "Declarar a dúvida e consultar documentação ou ajuda",
              "Mudar de assunto",
            ],
            answerIndex: 2,
            explanation:
              "Comunicar limites e validar comportamento demonstra responsabilidade técnica.",
          },
        ],
      },
      {
        id: "l-11-8",
        moduleId: "mod-11",
        title: "Primeiros 90 dias: aprender o sistema, entregar com segurança e ganhar autonomia",
        duration: 55,
        difficulty: "Intermediário",
        tools: ["Markdown", "Git", "SLO", "Runbooks"],
        xp: 25,
        objectives: [
          "Mapear serviços, responsáveis e fluxos de entrega",
          "Planejar resultados para 30, 60 e 90 dias",
          "Escolher uma primeira melhoria de baixo risco",
          "Negociar autonomia e critérios de escalonamento",
          "Demonstrar impacto sem otimizar métricas isoladas",
        ],
        body: [
          "Entrar em uma equipe exige **entender antes de transformar**. O plano de `90 dias` é um acordo de aprendizagem e entregas, não uma promessa de dominar toda a plataforma. Ajuste marcos com sua liderança conforme senioridade, contexto e prioridade do negócio.",
          "Nos **primeiros 30 dias**, descubra quem opera cada serviço, quem decide mudanças e como um pedido chega à produção. Siga uma alteração do commit ao deploy, leia um incidente recente e observe o atendimento de um alerta. Registre dúvidas em `docs/onboarding.md`, com responsáveis para respondê-las.",
          "O **acesso inicial** deve ser suficiente para aprender sem criar risco desnecessário. Comece com leitura, MFA e sessões auditáveis; solicite elevação temporária para tarefas aprovadas. Não compartilhe credenciais de colegas para acelerar o onboarding e não exporte inventários internos para contas pessoais.",
          "Construa um **mapa de dependências operacionais**: serviço, dono, dashboard, runbook, repositório e escalonamento. Um catálogo simples já revela serviços órfãos e documentação quebrada. Confirme as informações com quem atende o plantão, pois um documento antigo pode não refletir a operação real.",
          "Entre os **dias 31 e 60**, entregue uma melhoria pequena acompanhada por alguém experiente. Pode ser corrigir um runbook ou tornar um teste de pipeline determinístico. Defina linha de base, risco, revisão e rollback; em vez de “reduzir tempo de CI”, combine medir `p50` e taxa de falha em uma amostra acordada.",
          "Evite o impulso de **substituir ferramentas cedo demais**. Uma configuração aparentemente estranha pode existir por contrato, custo ou incidente anterior. Registre alternativas e procure contexto antes de propor migração; automatizar um processo ainda não compreendido pode apenas acelerar erros.",
          "Entre os **dias 61 e 90**, busque autonomia em um escopo explícito. Execute uma mudança revisada, participe de um exercício e apresente resultados com limites. Entrar sozinho no plantão não é rito obrigatório: combine treinamento, acesso, runbooks e critérios de escalonamento antes de assumir responsabilidade.",
          "Feche o período com uma **retrospectiva orientada a impacto**: o que aprendeu, que risco diminuiu, que resultado foi medido e o que ainda depende de apoio. Não use quantidade de commits como medida de valor. Atualize o plano para o próximo trimestre e confirme com a equipe se o benefício observado justifica manter a mudança.",
        ],
        code: [
          {
            label: "Plano negociável com entregas e critérios de aceite",
            language: "yaml",
            code: '# Exemplo para adaptar com a liderança; não é uma meta universal.\nplano:\n  dias_1_30:\n    objetivo: "Entender a operação"\n    entrega: "Mapa de serviços e acompanhamento de um deploy"\n    aceite: "Mapa revisado por responsáveis e dúvidas prioritárias respondidas"\n  dias_31_60:\n    objetivo: "Entregar melhoria de baixo risco"\n    entrega: "Correção de runbook validada em laboratório"\n    aceite: "Outra pessoa executa o procedimento sem instrução oral adicional"\n  dias_61_90:\n    objetivo: "Ampliar autonomia em escopo acordado"\n    entrega: "Mudança revisada com resultado observado"\n    aceite: "Revisão, rollback e critério de escalonamento documentados"\nacompanhamento:\n  frequencia: "Semanal"\n  responsaveis: ["Profissional", "Mentor", "Liderança"]',
          },
          {
            label: "Modelo de catálogo operacional mínimo",
            language: "yaml",
            code: '# Mantenha apenas links internos autorizados, sem credenciais.\nservicos:\n  - nome: cloudshop-api\n    responsavel: "Equipe de pedidos"\n    repositorio: "Link interno a preencher"\n    dashboard: "Link interno a preencher"\n    runbook: "docs/runbooks/api-5xx.md"\n    escalonamento: "Consultar escala vigente do time"\n    ultima_validacao: "Preencher após revisão com o responsável"\n# Não publique o catálogo da empresa no portfólio pessoal.',
          },
        ],
        whyItMatters:
          "Autonomia construída com contexto e confiança permite entregar valor sem criar incidentes evitáveis na adaptação.",
        commonMistake:
          "Prometer uma migração grande na primeira semana antes de entender dependências e restrições.",
        productionTip:
          "Combine checkpoints semanais com mentor e liderança e revise prioridades sempre que o contexto mudar.",
        securityAlert:
          "Use MFA, identidades individuais e elevação temporária; inventários, runbooks e indicadores internos também precisam de controle de acesso.",
        interviewQuestion:
          "Que primeira melhoria você escolheria em uma plataforma desconhecida e como demonstraria valor com baixo risco?",
        glossary: [
          {
            term: "Onboarding",
            definition: "Processo de integração ao contexto técnico e organizacional da equipe.",
          },
          {
            term: "Mentoria",
            definition: "Acompanhamento para desenvolver contexto e autonomia com apoio.",
          },
          {
            term: "Escalonamento",
            definition: "Acionamento de pessoas ou níveis de suporte conforme critérios definidos.",
          },
          {
            term: "Catálogo de serviços",
            definition: "Registro dos serviços e de suas informações operacionais essenciais.",
          },
          {
            term: "Autonomia",
            definition: "Capacidade de atuar com responsabilidade dentro de um escopo acordado.",
          },
        ],
        printQuestLink:
          "Criar um plano de 90 dias para assumir a operação do CloudShop, com catálogo, melhoria de baixo risco e critérios de autonomia.",
        quiz: [
          {
            question: "Qual deve ser a prioridade inicial em uma equipe nova?",
            options: [
              "Migrar tudo para sua ferramenta preferida",
              "Entender serviços, responsáveis e processo de entrega",
              "Assumir plantão sozinho imediatamente",
              "Receber todas as permissões disponíveis",
            ],
            answerIndex: 1,
            explanation: "Contexto e responsabilidades vêm antes de mudanças amplas.",
          },
          {
            question: "Qual é uma boa primeira entrega?",
            options: [
              "Mudança irreversível sem revisão",
              "Refatorar toda a infraestrutura",
              "Runbook corrigido e validado por outra pessoa",
              "Aumentar o número de commits",
            ],
            answerIndex: 2,
            explanation: "Uma melhoria pequena e verificável reduz risco e constrói confiança.",
          },
          {
            question: "Quando assumir autonomia no plantão?",
            options: [
              "Assim que receber o notebook",
              "Sempre no dia 30",
              "Sem acesso aos dashboards",
              "Após alinhar treinamento, escopo, recursos e escalonamento",
            ],
            answerIndex: 3,
            explanation: "Responsabilidade operacional exige preparação e suporte explícitos.",
          },
        ],
      },
    ],
  },
];
