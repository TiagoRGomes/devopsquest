import type { LessonDeep } from "./deep-redes-git";

/** Aprofundamento dos módulos 4 (Docker/Compose) e 5 (CI/CD com GitHub Actions). */
export const DEEP_CONTAINERS_CICD: Record<string, LessonDeep> = {
  "l-4-1": {
    body: [
      "<h3>1. Container não é máquina virtual</h3><p>Uma VM emula hardware e roda um kernel inteiro. Um container é só um <strong>processo Linux isolado</strong> que compartilha o kernel do host. O isolamento vem de dois recursos do kernel: <strong>namespaces</strong> (o que o processo enxerga: PIDs, rede, filesystem, hostname) e <strong>cgroups</strong> (quanto ele pode usar: CPU, memória, I/O). Por isso um container sobe em milissegundos.</p>",
      "<h3>2. Imagem vs container</h3><p>A <strong>imagem</strong> é um modelo somente leitura, feito de camadas empilhadas. O <strong>container</strong> é uma instância em execução dessa imagem, com uma camada gravável por cima. Apagou o container? A camada gravável some junto. Por isso dados importantes vão para volumes.</p>",
      "<h3>3. Um processo principal por container</h3><p>O container vive enquanto o processo PID 1 vive. Se o comando principal termina, o container para. Rodar vários serviços num container só (API + banco + cron) quebra esse modelo, dificulta logs e escalonamento.</p>",
      "<h3>4. Ciclo de vida na prática</h3><p><code>docker run</code> cria e inicia; <code>docker ps</code> lista; <code>docker logs -f</code> acompanha a saída; <code>docker exec -it</code> abre um shell dentro; <code>docker stop</code> envia SIGTERM e, após 10s, SIGKILL; <code>docker rm</code> remove. Sua aplicação deve tratar SIGTERM para encerrar sem perder requisições.</p>",
      "<h3>5. Tags e digests</h3><p><code>node:20</code> é uma tag móvel: amanhã pode apontar para outra imagem. O <strong>digest</strong> (<code>node@sha256:...</code>) é imutável. Em produção, fixe versões específicas e registre o digest do que foi publicado.</p>",
      "<h3>6. Checagem final</h3><p>Você deve explicar namespaces e cgroups, dizer por que dados não ficam no container e mostrar como inspecionar um container em execução.</p>",
    ],
    code: [
      {
        label: "Explorar um container por dentro",
        language: "bash",
        code: `docker run -d --name web -p 8080:80 --memory 256m nginx:1.27-alpine
docker ps                                # STATUS Up ...
docker logs -f web                       # saida do processo principal
docker exec -it web sh -c 'ps aux'       # PID 1 e o nginx master
docker inspect web --format '{{.State.Pid}} {{.HostConfig.Memory}}'
docker stats --no-stream web             # CPU e memoria usados (cgroups)
docker stop web && docker rm web`,
      },
    ],
    glossary: [
      { term: "namespace", definition: "Recurso do kernel que isola o que um processo enxerga (PIDs, rede, montagem)." },
      { term: "cgroup", definition: "Recurso do kernel que limita e mede CPU, memória e I/O de processos." },
      { term: "digest", definition: "Hash sha256 que identifica uma imagem de forma imutável." },
      { term: "PID 1", definition: "Processo principal do container; quando termina, o container para." },
    ],
    quiz: [
      { question: "O que um container compartilha com o host?", options: ["Nada", "O kernel", "O disco inteiro", "A BIOS"], answerIndex: 1, explanation: "Containers são processos isolados que usam o kernel do host." },
      { question: "Por que usar digest em produção?", options: ["É mais curto", "Garante exatamente a mesma imagem sempre", "É obrigatório", "Acelera o build"], answerIndex: 1, explanation: "Tags podem mudar; o digest é imutável." },
    ],
  },
  "l-4-2": {
    body: [
      "<h3>1. Cada instrução é uma camada</h3><p><code>FROM</code>, <code>RUN</code>, <code>COPY</code> e <code>ADD</code> geram camadas. O Docker reaproveita uma camada do cache se a instrução e seus arquivos de entrada não mudaram. Quando uma camada muda, <strong>todas as seguintes</strong> são refeitas.</p>",
      "<h3>2. Ordem certa: do que muda pouco ao que muda muito</h3><p>Copie primeiro <code>package.json</code> e <code>package-lock.json</code>, rode <code>npm ci</code>, e só depois copie o código. Assim, editar um arquivo <code>.ts</code> não reinstala dependências — o build cai de minutos para segundos.</p>",
      "<h3>3. .dockerignore</h3><p>Sem ele, <code>node_modules</code>, <code>.git</code> e arquivos <code>.env</code> vão para o contexto de build: build lento, cache invalidado e segredo vazado na imagem.</p>",
      "<h3>4. BuildKit e cache mounts</h3><p><code>RUN --mount=type=cache,target=/root/.npm npm ci</code> mantém o cache do npm entre builds sem colocá-lo na imagem. No CI, <code>--cache-from</code>/<code>--cache-to</code> reaproveita camadas entre execuções.</p>",
      "<h3>5. CMD, ENTRYPOINT e forma exec</h3><p>Use a forma JSON <code>CMD [\"node\", \"dist/server.js\"]</code>: o processo vira PID 1 e recebe SIGTERM. A forma shell (<code>CMD node server.js</code>) coloca um <code>sh</code> no meio que não repassa sinais.</p>",
      "<h3>6. Checagem final</h3><p>Altere uma linha do código e rebuilde: apenas as últimas camadas devem ser refeitas.</p>",
    ],
    code: [
      {
        label: "Dockerfile otimizado para cache",
        language: "dockerfile",
        code: `# syntax=docker/dockerfile:1.7
FROM node:20.15-alpine
WORKDIR /app
COPY package.json package-lock.json ./          # muda raramente
RUN --mount=type=cache,target=/root/.npm npm ci # camada reaproveitada
COPY . .                                         # muda sempre, fica por ultimo
RUN npm run build
CMD ["node", "dist/server.js"]                   # forma exec: recebe SIGTERM`,
      },
      {
        label: ".dockerignore mínimo",
        language: "text",
        code: `node_modules
.git
.env*
dist
coverage
*.log`,
        securityNote: "Nunca copie arquivos .env para a imagem: qualquer pessoa com acesso à imagem lê os segredos.",
      },
    ],
    glossary: [
      { term: "camada", definition: "Diferença de filesystem gerada por uma instrução do Dockerfile." },
      { term: "contexto de build", definition: "Arquivos enviados ao Docker para construir a imagem." },
      { term: "BuildKit", definition: "Motor de build moderno do Docker, com cache mounts e builds paralelos." },
    ],
    quiz: [
      { question: "Por que copiar package.json antes do código?", options: ["Estética", "Para reaproveitar o cache da instalação de dependências", "Obrigatório no Node", "Segurança"], answerIndex: 1, explanation: "Mudanças no código não invalidam a camada do npm ci." },
      { question: "Qual forma de CMD repassa SIGTERM corretamente?", options: ["CMD node app.js", "CMD [\"node\",\"app.js\"]", "Ambas", "Nenhuma"], answerIndex: 1, explanation: "A forma exec torna o node o PID 1." },
    ],
  },
  "l-4-3": {
    body: [
      "<h3>1. Três formas de persistir</h3><ul><li><strong>Volume nomeado</strong>: gerenciado pelo Docker, ideal para bancos</li><li><strong>Bind mount</strong>: pasta do host montada no container, ideal para desenvolvimento</li><li><strong>tmpfs</strong>: em memória, para dados temporários</li></ul>",
      "<h3>2. Redes do Docker</h3><p>Numa rede bridge criada por você, containers se encontram pelo nome (DNS interno). A rede bridge padrão não oferece isso. Publicar porta (<code>-p 8080:3000</code>) só é necessário para acesso de fora; entre containers, use a porta interna.</p>",
      "<h3>3. Configuração por ambiente (12-factor)</h3><p>A mesma imagem roda em dev, staging e produção; o que muda são as variáveis de ambiente. Nunca crie uma imagem por ambiente.</p>",
      "<h3>4. Segredos</h3><p>Variáveis de ambiente aparecem em <code>docker inspect</code>. Para segredos sensíveis, prefira arquivos montados (Docker secrets, Kubernetes Secret como volume) ou um cofre.</p>",
      "<h3>5. Checagem final</h3><p>Você deve ligar API e banco numa rede própria, persistir os dados em volume e configurar tudo via variáveis.</p>",
    ],
    code: [
      {
        label: "API e banco numa rede própria",
        language: "bash",
        code: `docker network create cloudshop
docker volume create pgdata
docker run -d --name db --network cloudshop -v pgdata:/var/lib/postgresql/data \\
  -e POSTGRES_PASSWORD_FILE=/run/secrets/pg -v "$PWD/pg.secret:/run/secrets/pg:ro" postgres:16
docker run -d --name api --network cloudshop -p 3000:3000 \\
  -e DATABASE_HOST=db cloudshop-api:1.4.0     # 'db' resolve pelo DNS da rede`,
      },
    ],
    glossary: [
      { term: "bind mount", definition: "Montagem de uma pasta do host dentro do container." },
      { term: "volume nomeado", definition: "Armazenamento persistente gerenciado pelo Docker." },
      { term: "12-factor", definition: "Conjunto de práticas para apps em nuvem, incluindo configuração via ambiente." },
    ],
    quiz: [
      { question: "Como a API encontra o banco numa rede Docker criada por você?", options: ["Pelo IP fixo", "Pelo nome do container", "Por localhost", "Não encontra"], answerIndex: 1, explanation: "Redes definidas pelo usuário têm DNS interno." },
      { question: "O que muda entre ambientes no modelo 12-factor?", options: ["A imagem", "As variáveis de configuração", "O Dockerfile", "O código"], answerIndex: 1, explanation: "A imagem é a mesma; a configuração vem do ambiente." },
    ],
  },
  "l-4-4": {
    body: [
      "<h3>1. Compose descreve o sistema</h3><p>Um <code>compose.yaml</code> declara serviços, redes e volumes. <code>docker compose up</code> cria tudo na ordem certa; <code>down</code> remove. É infraestrutura como código para o seu ambiente local.</p>",
      "<h3>2. depends_on com healthcheck</h3><p><code>depends_on</code> sozinho só espera o container iniciar, não ficar pronto. Combine com <code>condition: service_healthy</code> e um <code>healthcheck</code> no banco.</p>",
      "<h3>3. Perfis e overrides</h3><p><code>compose.override.yaml</code> é aplicado automaticamente em dev (bind mounts, hot reload). Perfis (<code>profiles: [tools]</code>) ligam serviços opcionais como Adminer.</p>",
      "<h3>4. Comandos do dia a dia</h3><p><code>compose ps</code>, <code>logs -f api</code>, <code>exec api sh</code>, <code>up -d --build api</code>, <code>down -v</code> (apaga volumes — cuidado).</p>",
      "<h3>5. Checagem final</h3><p>Um colega clona o repositório, roda um comando e tem frontend, API e banco funcionando.</p>",
    ],
    code: [
      {
        label: "Banco com healthcheck e API esperando",
        language: "yaml",
        code: `services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: dev-only
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 10
    volumes: [pgdata:/var/lib/postgresql/data]
  api:
    build: ./api
    depends_on:
      db:
        condition: service_healthy   # so sobe com o banco pronto
    ports: ["3000:3000"]
volumes:
  pgdata:`,
      },
    ],
    glossary: [
      { term: "healthcheck", definition: "Comando periódico que indica se o container está saudável." },
      { term: "profile", definition: "Grupo de serviços do Compose ativado sob demanda." },
    ],
    quiz: [
      { question: "depends_on sem condição garante que o banco está pronto?", options: ["Sim", "Não, só que o container iniciou", "Depende da imagem", "Só no Linux"], answerIndex: 1, explanation: "É preciso healthcheck com service_healthy." },
      { question: "O que docker compose down -v faz a mais?", options: ["Mostra versão", "Remove também os volumes", "Verbose", "Nada"], answerIndex: 1, explanation: "-v apaga os volumes e seus dados." },
    ],
  },
  "l-4-5": {
    body: [
      "<h3>1. Multi-stage: build pesado, runtime enxuto</h3><p>O primeiro estágio tem compiladores e dependências de desenvolvimento; o último copia só o resultado. Uma imagem Node cai de ~1 GB para ~150 MB, com menos superfície de ataque.</p>",
      "<h3>2. Imagens base mínimas</h3><p>Alpine, <em>slim</em> e distroless reduzem pacotes (e vulnerabilidades). Distroless nem tem shell, o que dificulta invasores e também o debug — use <code>kubectl debug</code> ou imagens <code>:debug</code> quando necessário.</p>",
      "<h3>3. Não rode como root</h3><p>Use <code>USER node</code> (ou um UID numérico). Se o processo for comprometido, o estrago fica limitado. Em Kubernetes, reforce com <code>runAsNonRoot</code> e <code>readOnlyRootFilesystem</code>.</p>",
      "<h3>4. Scan de vulnerabilidades e SBOM</h3><p>Trivy ou Grype listam CVEs por severidade. Falhe o pipeline em CRITICAL com correção disponível. Gere um SBOM (lista de componentes) para responder rápido quando surgir uma nova CVE.</p>",
      "<h3>5. Checagem final</h3><p>Sua imagem deve ser multi-stage, não-root, sem CVEs críticas corrigíveis e menor que 200 MB.</p>",
    ],
    code: [
      {
        label: "Multi-stage não-root",
        language: "dockerfile",
        code: `FROM node:20.15-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER 1000                          # nao-root
CMD ["dist/server.js"]`,
      },
      {
        label: "Scan e SBOM",
        language: "bash",
        code: `trivy image --severity CRITICAL,HIGH --ignore-unfixed --exit-code 1 cloudshop-api:1.4.0
trivy image --format cyclonedx -o sbom.json cloudshop-api:1.4.0
docker images cloudshop-api --format '{{.Tag}} {{.Size}}'`,
      },
    ],
    glossary: [
      { term: "distroless", definition: "Imagem sem gerenciador de pacotes nem shell, só o runtime necessário." },
      { term: "CVE", definition: "Identificador público de uma vulnerabilidade conhecida." },
      { term: "SBOM", definition: "Lista de todos os componentes e versões de um software." },
    ],
    quiz: [
      { question: "Principal ganho do multi-stage?", options: ["Build mais lento", "Imagem final menor e mais segura", "Mais camadas", "Suporte a Windows"], answerIndex: 1, explanation: "Ferramentas de build não vão para a imagem final." },
      { question: "Por que não rodar como root?", options: ["Performance", "Limita o estrago se o processo for comprometido", "Obrigatório no Docker", "Economiza memória"], answerIndex: 1, explanation: "Menor privilégio reduz impacto de invasão." },
    ],
  },
  "l-5-1": {
    body: [
      "<h3>1. O que é CI e o que é CD</h3><p><strong>Integração contínua</strong>: a cada push, o código é compilado e testado automaticamente. <strong>Entrega contínua</strong>: todo commit aprovado vira um artefato pronto para produção. <strong>Deploy contínuo</strong>: esse artefato vai para produção sem intervenção manual.</p>",
      "<h3>2. Hierarquia do GitHub Actions</h3><p><strong>Workflow</strong> (arquivo em <code>.github/workflows</code>) → <strong>jobs</strong> (rodam em paralelo por padrão, cada um em uma máquina nova) → <strong>steps</strong> (comandos ou actions, em sequência, compartilhando o filesystem do job).</p>",
      "<h3>3. Triggers</h3><p><code>push</code>, <code>pull_request</code>, <code>workflow_dispatch</code> (manual), <code>schedule</code> (cron), <code>release</code>. Use filtros de <code>branches</code> e <code>paths</code> para não rodar o pipeline do backend quando só o README mudou.</p>",
      "<h3>4. Dependência entre jobs e artefatos</h3><p><code>needs: test</code> cria ordem. Como jobs não compartilham disco, passe arquivos com <code>upload-artifact</code>/<code>download-artifact</code> ou valores com <code>outputs</code>.</p>",
      "<h3>5. Matrix</h3><p><code>strategy.matrix</code> roda o mesmo job em várias versões (Node 18/20/22) ou sistemas, em paralelo.</p>",
      "<h3>6. Checagem final</h3><p>Você deve ler um workflow e dizer o que roda, quando, em que ordem e em que máquina.</p>",
    ],
    code: [
      {
        label: "Workflow com filtros, matrix e dependência",
        language: "yaml",
        code: `name: api-ci
on:
  pull_request:
    paths: ["api/**", ".github/workflows/api-ci.yml"]
  push:
    branches: [main]
concurrency:
  group: api-ci-\${{ github.ref }}
  cancel-in-progress: true          # cancela execucao antiga do mesmo branch
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix: { node: [20, 22] }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: \${{ matrix.node }} }
      - run: npm ci && npm test
        working-directory: api
  build:
    needs: test                     # so roda se test passar
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t cloudshop-api:ci api`,
      },
    ],
    glossary: [
      { term: "runner", definition: "Máquina que executa os jobs do workflow." },
      { term: "matrix", definition: "Estratégia que multiplica um job por combinações de parâmetros." },
      { term: "concurrency", definition: "Controle que evita execuções simultâneas do mesmo grupo." },
    ],
    quiz: [
      { question: "Jobs de um workflow compartilham o disco?", options: ["Sim", "Não, cada um roda em uma máquina nova", "Só com matrix", "Só em self-hosted"], answerIndex: 1, explanation: "Use artifacts ou outputs para passar dados." },
      { question: "Como evitar rodar o CI da API quando só o README muda?", options: ["if: false", "Filtro paths", "matrix", "needs"], answerIndex: 1, explanation: "paths limita os arquivos que disparam o workflow." },
    ],
  },
  "l-5-2": {
    body: [
      "<h3>1. Onde o tempo vai</h3><p>Pipelines lentos quase sempre gastam tempo em instalar dependências, rebuildar imagens e rodar testes em série. Meça cada step antes de otimizar.</p>",
      "<h3>2. Cache de dependências</h3><p><code>setup-node</code> com <code>cache: npm</code> usa o hash do lockfile como chave. Lockfile igual = cache reaproveitado.</p>",
      "<h3>3. Cache de camadas Docker</h3><p><code>docker/build-push-action</code> com <code>cache-from: type=gha</code> e <code>cache-to: type=gha,mode=max</code> reaproveita camadas entre execuções.</p>",
      "<h3>4. Pirâmide de testes e fail fast</h3><p>Lint e testes unitários primeiro (segundos), integração depois, end-to-end por último. Paralelize com sharding. Falhar cedo economiza tempo de todos.</p>",
      "<h3>5. Testes instáveis (flaky)</h3><p>Um teste que falha às vezes destrói a confiança no pipeline. Coloque em quarentena, registre e corrija; nunca normalize o 'roda de novo que passa'.</p>",
      "<h3>6. Checagem final</h3><p>O pipeline do CloudShop deve rodar em menos de 10 minutos e mostrar claramente qual etapa falhou.</p>",
    ],
    code: [
      {
        label: "Integração com Postgres como service container",
        language: "yaml",
        code: `jobs:
  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: test }
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready" --health-interval 5s --health-retries 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm, cache-dependency-path: api/package-lock.json }
      - run: npm ci && npm run test:integration
        working-directory: api
        env: { DATABASE_URL: "postgres://postgres:test@localhost:5432/postgres" }`,
      },
    ],
    glossary: [
      { term: "flaky test", definition: "Teste que passa ou falha sem mudança no código." },
      { term: "service container", definition: "Container auxiliar (banco, cache) disponível durante o job." },
      { term: "sharding", definition: "Dividir a suíte de testes entre várias máquinas em paralelo." },
    ],
    quiz: [
      { question: "Qual a chave típica do cache de dependências npm?", options: ["Data", "Hash do package-lock.json", "Nome do branch", "Aleatória"], answerIndex: 1, explanation: "Se o lockfile não mudou, as dependências são as mesmas." },
      { question: "Ordem recomendada de testes?", options: ["E2E primeiro", "Lint e unitários primeiro", "Aleatória", "Só E2E"], answerIndex: 1, explanation: "Os rápidos primeiro dão feedback cedo." },
    ],
  },
  "l-5-3": {
    body: [
      "<h3>1. O problema das chaves de longa duração</h3><p>Guardar <code>AWS_ACCESS_KEY_ID</code> em secrets funciona, mas a chave vale para sempre, pode vazar em logs e precisa de rotação manual.</p>",
      "<h3>2. OIDC: credenciais temporárias</h3><p>O GitHub emite um token assinado dizendo 'sou o workflow do repositório X, branch main'. A AWS confia nesse emissor e, se as condições baterem, entrega credenciais válidas por uma hora. Nenhum segredo fica armazenado.</p>",
      "<h3>3. Condições de confiança</h3><p>Restrinja o <code>sub</code> do token a repositório e branch (ou environment). Sem isso, qualquer repositório poderia assumir o papel.</p>",
      "<h3>4. permissions do GITHUB_TOKEN</h3><p>Declare o mínimo: <code>contents: read</code> por padrão, <code>packages: write</code> só no job que publica, <code>id-token: write</code> só onde usa OIDC.</p>",
      "<h3>5. Actions de terceiros</h3><p>Fixe actions externas pelo SHA do commit, não por tag; uma tag pode ser movida para código malicioso.</p>",
      "<h3>6. Checagem final</h3><p>O pipeline do CloudShop acessa a AWS sem nenhuma chave salva e cada job tem só as permissões necessárias.</p>",
    ],
    code: [
      {
        label: "Assumir papel na AWS via OIDC",
        language: "yaml",
        code: `permissions:
  contents: read
  id-token: write          # necessario para pedir o token OIDC
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/cloudshop-deploy
          aws-region: us-east-1
      - run: aws sts get-caller-identity   # prova que as credenciais temporarias funcionam`,
      },
      {
        label: "Política de confiança restrita",
        language: "json",
        code: `{
  "Effect": "Allow",
  "Principal": { "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com" },
  "Action": "sts:AssumeRoleWithWebIdentity",
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
      "token.actions.githubusercontent.com:sub": "repo:cloudshop-org/cloudshop-app:environment:production"
    }
  }
}`,
        securityNote: "Sem a condição sub, qualquer repositório do GitHub poderia assumir esse papel.",
      },
    ],
    glossary: [
      { term: "OIDC", definition: "Protocolo de identidade que permite trocar um token assinado por credenciais temporárias." },
      { term: "GITHUB_TOKEN", definition: "Token automático do workflow, com permissões configuráveis." },
      { term: "environment", definition: "Ambiente do GitHub com regras de aprovação e secrets próprios." },
    ],
    quiz: [
      { question: "Maior vantagem do OIDC no CI?", options: ["Mais rápido", "Sem chave de longa duração armazenada", "Grátis", "Funciona offline"], answerIndex: 1, explanation: "As credenciais são temporárias e emitidas por execução." },
      { question: "Como fixar uma action de terceiros com segurança?", options: ["@main", "@v1", "Pelo SHA do commit", "@latest"], answerIndex: 2, explanation: "O SHA é imutável; tags podem ser movidas." },
    ],
  },
  "l-5-4": {
    body: [
      "<h3>1. Por que tag imutável</h3><p><code>latest</code> não diz o que está rodando e pode mudar sob seus pés. Use o SHA do commit (<code>sha-1a2b3c4</code>) e a versão SemVer nas releases. Cada deploy aponta para algo que nunca muda.</p>",
      "<h3>2. Metadados e rótulos OCI</h3><p><code>docker/metadata-action</code> gera tags e labels (<code>org.opencontainers.image.revision</code>, <code>source</code>) que ligam a imagem ao commit.</p>",
      "<h3>3. Multi-arquitetura</h3><p>Com QEMU e Buildx, uma imagem serve amd64 e arm64 (Graviton na AWS, Macs M-series), o que costuma baratear a infraestrutura.</p>",
      "<h3>4. Assinatura e proveniência</h3><p>Cosign assina a imagem com identidade OIDC; o cluster pode recusar imagens não assinadas. Attestations registram como e onde a imagem foi construída.</p>",
      "<h3>5. Checagem final</h3><p>Todo push na main publica <code>ghcr.io/cloudshop-org/cloudshop-api:sha-xxxxxxx</code>, assinada e escaneada.</p>",
    ],
    code: [
      {
        label: "Build, push e assinatura",
        language: "yaml",
        code: `permissions: { contents: read, packages: write, id-token: write }
steps:
  - uses: actions/checkout@v4
  - uses: docker/setup-buildx-action@v3
  - uses: docker/login-action@v3
    with: { registry: ghcr.io, username: \${{ github.actor }}, password: \${{ secrets.GITHUB_TOKEN }} }
  - id: meta
    uses: docker/metadata-action@v5
    with:
      images: ghcr.io/cloudshop-org/cloudshop-api
      tags: type=sha,prefix=sha-
  - id: build
    uses: docker/build-push-action@v6
    with:
      context: api
      push: true
      platforms: linux/amd64,linux/arm64
      tags: \${{ steps.meta.outputs.tags }}
      labels: \${{ steps.meta.outputs.labels }}
      cache-from: type=gha
      cache-to: type=gha,mode=max
  - uses: sigstore/cosign-installer@v3
  - run: cosign sign --yes ghcr.io/cloudshop-org/cloudshop-api@\${{ steps.build.outputs.digest }}`,
      },
    ],
    glossary: [
      { term: "GHCR", definition: "GitHub Container Registry, registro de imagens do GitHub." },
      { term: "cosign", definition: "Ferramenta do projeto Sigstore para assinar e verificar imagens." },
      { term: "Buildx", definition: "Extensão do Docker para builds multi-plataforma com BuildKit." },
    ],
    quiz: [
      { question: "Por que evitar a tag latest em deploy?", options: ["É lenta", "Não identifica a versão e pode mudar", "Não existe", "É paga"], answerIndex: 1, explanation: "Tags imutáveis garantem rastreabilidade e rollback." },
      { question: "O que o cosign adiciona?", options: ["Compressão", "Assinatura verificável da imagem", "Cache", "Scan"], answerIndex: 1, explanation: "Permite provar a origem da imagem." },
    ],
  },
  "l-5-5": {
    body: [
      "<h3>1. Estratégias de deploy</h3><ul><li><strong>Rolling</strong>: troca instâncias aos poucos (padrão do Kubernetes)</li><li><strong>Blue/green</strong>: sobe o ambiente novo completo e vira o tráfego de uma vez</li><li><strong>Canary</strong>: manda 5% do tráfego para a versão nova e aumenta se as métricas ficarem boas</li></ul>",
      "<h3>2. Aprovação e environments</h3><p>No GitHub, o environment <code>production</code> pode exigir revisores e só aceitar deploy da main. Isso dá controle sem burocracia.</p>",
      "<h3>3. Rollback rápido</h3><p>Com tags imutáveis, rollback é redeploy da versão anterior: <code>kubectl rollout undo</code> ou reverter o commit no repositório GitOps. Treine antes de precisar.</p>",
      "<h3>4. Smoke test pós-deploy</h3><p>Depois do deploy, o pipeline chama o /health e uma rota crítica; se falhar, faz rollback automático.</p>",
      "<h3>5. Depurando pipeline quebrado</h3><ol><li>Leia o primeiro erro, não o último.</li><li>Reproduza localmente com o mesmo comando.</li><li>Ative logs de debug (<code>ACTIONS_STEP_DEBUG</code>).</li><li>Verifique o que mudou: dependência, action, runner, secret expirado.</li></ol>",
      "<h3>6. Checagem final</h3><p>Você deve fazer deploy com aprovação, validar com smoke test e reverter em menos de 5 minutos.</p>",
    ],
    code: [
      {
        label: "Deploy com smoke test e rollback automático",
        language: "yaml",
        code: `deploy:
  needs: build
  environment: production        # exige aprovacao configurada no repositorio
  runs-on: ubuntu-latest
  steps:
    - run: kubectl set image deploy/api api=ghcr.io/cloudshop-org/cloudshop-api:sha-\${{ github.sha }}
    - run: kubectl rollout status deploy/api --timeout=180s
    - name: smoke test
      run: curl -fsS --retry 5 --retry-delay 5 https://api.cloudshop.dev/health
    - name: rollback
      if: failure()
      run: kubectl rollout undo deploy/api`,
      },
    ],
    glossary: [
      { term: "canary", definition: "Liberação gradual para uma fração do tráfego antes do total." },
      { term: "blue/green", definition: "Dois ambientes completos com troca de tráfego instantânea." },
      { term: "smoke test", definition: "Teste rápido que confirma que o essencial funciona após o deploy." },
    ],
    quiz: [
      { question: "Qual estratégia expõe a versão nova a só uma parte dos usuários?", options: ["Rolling", "Canary", "Recreate", "Blue/green"], answerIndex: 1, explanation: "Canary envia uma fração controlada do tráfego." },
      { question: "Ao depurar um pipeline, qual erro ler primeiro?", options: ["O último", "O primeiro", "Qualquer um", "Nenhum"], answerIndex: 1, explanation: "Os demais costumam ser consequência do primeiro." },
    ],
  },
};
