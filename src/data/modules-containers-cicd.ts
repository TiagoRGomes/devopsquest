import type { Module } from "@/lib/types";

export const CONTAINERS_CICD_MODULES: Module[] = [
  {
    id: "mod-4",
    index: 4,
    slug: "docker-e-compose",
    title: "Docker e Compose",
    tagline: "Empacote a aplicação para rodar igual em qualquer lugar.",
    weeks: 3,
    xp: 2000,
    badge: "container-architect",
    regionId: "vale-containers",
    bossId: "boss-crashloop-container",
    overview:
      "Container é a unidade de entrega moderna. Aqui você aprende a construir imagens pequenas e seguras, entender cache de layers, gerenciar dados com volumes, conectar serviços em redes e orquestrar o stack completo do PrintQuest — frontend Vue, API Node e PostgreSQL — com Docker Compose, incluindo healthchecks e variáveis de ambiente.",
    objectives: [
      "Diferenciar imagem, container e registry",
      "Escrever Dockerfile eficiente com multi-stage",
      "Aproveitar cache de layers para builds rápidos",
      "Persistir dados com volumes e ligar serviços por rede",
      "Subir o stack completo com Compose e healthchecks",
    ],
    prerequisites: ["Módulo 1 e 3 concluídos"],
    topics: ["Imagens", "Containers", "Dockerfile", "Cache", "Registry", "Volumes", "Networks", "Compose", "Multi-stage", "Segurança"],
    delivery: "docker-compose.yml subindo Vue + API Node + PostgreSQL, com imagem final sem root e menor que 200 MB.",
    checklist: [
      "Dockerfile multi-stage com .dockerignore",
      "Container roda com usuário não-root",
      "Volume nomeado preservando dados do PostgreSQL",
      "Healthcheck em API e banco, com depends_on condicionado",
      "Nenhum segredo dentro da imagem",
    ],
    troubleshooting:
      "Sintoma: container reinicia em laço. Investigação: docker logs mostra 'ECONNREFUSED 127.0.0.1:5432'. Causa raiz: a API tenta o banco em localhost, mas dentro do container localhost é o próprio container — o host correto é o nome do serviço no Compose. Correção: DATABASE_HOST=db mais healthcheck com depends_on service_healthy.",
    interviewQuestions: [
      "Qual a diferença entre imagem e container?",
      "Como você reduziria uma imagem de 1,2 GB para menos de 200 MB?",
      "Por que rodar container como root é problema?",
    ],
    printQuest: "Containerizar o PrintQuest inteiro e subir o ambiente de desenvolvimento com um comando.",
    lessons: [
      {
        id: "l-4-1",
        moduleId: "mod-4",
        title: "Imagens, containers e o modelo mental correto",
        duration: 40,
        difficulty: "Iniciante",
        tools: ["Docker"],
        xp: 25,
        objectives: ["Distinguir imagem, container e registry", "Operar o ciclo de vida do container", "Inspecionar o que está rodando"],
        body: [
          "Imagem é um modelo somente-leitura, formado por layers empilhados; container é uma instância em execução desse modelo, com uma camada de escrita própria e efêmera. Registry é onde as imagens ficam guardadas (Docker Hub, GHCR, ECR). Entender isso explica por que dado gravado dentro do container desaparece ao recriá-lo — e por que volumes existem.",
          "Container não é máquina virtual: ele compartilha o kernel do host e isola processos por namespaces e cgroups. Isso o torna leve e rápido, mas também significa que ele não é fronteira de segurança perfeita — daí a importância de não rodar como root e de limitar recursos.",
          "O container vive enquanto seu processo principal (PID 1) vive. Se o processo termina, o container para. Esse é o motivo de tantos containers que 'não sobem': o comando terminou, com sucesso ou com erro, e o Docker apenas obedeceu.",
        ],
        code: [
          {
            label: "Ciclo de vida e inspeção",
            language: "bash",
            code: `docker run -d --name api -p 3000:3000 node:22-alpine sleep 3600
docker ps
docker ps -a                       # inclui parados
docker logs -f api
docker exec -it api sh             # entrar no container
docker inspect api | jq '.[0].State, .[0].NetworkSettings.IPAddress'
docker stats --no-stream
docker stop api && docker rm api
docker image ls && docker system df
docker system prune -f             # limpar recursos nao usados`,
            securityNote:
              "docker exec com --user root em produção deve ser exceção auditada; prefira depurar por logs e métricas.",
          },
        ],
        whyItMatters: "Todo o resto (CI/CD, Kubernetes, GitOps) assume que você entende container. Modelo mental errado aqui contamina tudo.",
        commonMistake: "Guardar dados importantes na camada de escrita do container e perdê-los no próximo deploy.",
        productionTip: "Trate containers como descartáveis: nada essencial dentro, tudo em volume ou serviço externo.",
        interviewQuestion: "Por que um container para imediatamente após iniciar?",
        glossary: [
          { term: "layer", definition: "Camada imutável da imagem, reaproveitada em cache e entre imagens." },
          { term: "cgroups", definition: "Mecanismo do kernel que limita CPU, memória e I/O de um grupo de processos." },
        ],
        printQuestLink: "Rodar a API do PrintQuest em container pela primeira vez.",
        quiz: [
          {
            question: "O que acontece com os dados escritos dentro do container ao removê-lo?",
            options: ["Ficam no host", "São perdidos, salvo se estiverem em volume", "Vão para a imagem", "Vão para o registry"],
            answerIndex: 1,
            explanation: "A camada de escrita é descartada com o container; persistência exige volume ou bind mount.",
          },
        ],
      },
      {
        id: "l-4-2",
        moduleId: "mod-4",
        title: "Dockerfile e cache de layers: builds rápidos de verdade",
        duration: 45,
        difficulty: "Intermediário",
        tools: ["Docker", "Dockerfile"],
        xp: 25,
        objectives: ["Escrever Dockerfile ordenado para cache", "Usar .dockerignore", "Reduzir tamanho da imagem"],
        body: [
          "Cada instrução do Dockerfile cria uma layer, e o Docker reaproveita a layer se a entrada não mudou. Daí a regra de ouro: copie primeiro os arquivos de dependência (package.json e lock), instale, e só depois copie o código. Invertendo essa ordem, qualquer alteração de uma linha de código invalida a instalação e o build volta a levar minutos.",
          ".dockerignore é tão importante quanto o Dockerfile: sem ele, node_modules local, .git e arquivos .env vão para o contexto de build, deixando tudo lento e podendo vazar segredo dentro da imagem.",
          "Escolha de base define tamanho e superfície de ataque. Alpine é minúscula mas usa musl (o que às vezes quebra binários nativos); as variantes slim de Debian são um bom meio; distroless entrega o mínimo para rodar, sem shell — excelente para produção.",
        ],
        code: [
          {
            label: "Dockerfile da API (ordem correta de cache)",
            language: "dockerfile",
            code: `FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=app:app src ./src
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]`,
            securityNote:
              "Nunca use ARG/ENV para segredo: valores ficam gravados no histórico da imagem e são legíveis por qualquer um com docker history.",
          },
          {
            label: ".dockerignore",
            language: "text",
            code: `node_modules
npm-debug.log
.git
.gitignore
.env
.env.*
coverage
dist
Dockerfile
docker-compose*.yml
**/*.md`,
          },
        ],
        whyItMatters: "Build de 8 minutos vira 40 segundos com ordenação correta — impacto direto no tempo de entrega do time.",
        commonMistake: "COPY . . antes de npm ci, destruindo o cache em toda alteração de código.",
        productionTip: "Fixe a versão da base (node:22.11-alpine) em vez de tag móvel para builds reprodutíveis.",
        securityAlert: "Rode scan de vulnerabilidades na imagem no CI e atualize a base periodicamente.",
        interviewQuestion: "Como você diagnostica um build de Docker que ficou lento após uma mudança pequena?",
        glossary: [
          { term: "contexto de build", definition: "Conjunto de arquivos enviados ao daemon Docker durante o build." },
          { term: "distroless", definition: "Imagem sem shell nem gerenciador de pacotes, contendo só o runtime necessário." },
        ],
        printQuestLink: "Escrever o Dockerfile definitivo da API do PrintQuest com usuário não-root.",
        quiz: [
          {
            question: "Por que copiar package.json antes do código-fonte?",
            options: [
              "Porque o npm exige",
              "Para preservar o cache da instalação de dependências",
              "Para reduzir a imagem final",
              "Para evitar erro de permissão",
            ],
            answerIndex: 1,
            explanation: "A layer de instalação só é invalidada quando os arquivos de dependência mudam.",
          },
        ],
      },
      {
        id: "l-4-3",
        moduleId: "mod-4",
        title: "Volumes, redes e variáveis de ambiente",
        duration: 40,
        difficulty: "Intermediário",
        tools: ["Docker", "PostgreSQL"],
        xp: 25,
        objectives: ["Persistir dados corretamente", "Conectar containers por rede e DNS interno", "Injetar configuração sem recompilar"],
        body: [
          "Volume nomeado é a forma correta de persistir dados de banco: gerenciado pelo Docker, portável e com performance adequada. Bind mount aponta um diretório do host e é ideal em desenvolvimento para ver alterações de código na hora — mas expõe caminhos do host e, em produção, gera acoplamento indesejado.",
          "Toda rede criada pelo Docker traz DNS interno: containers se encontram pelo nome do serviço. Por isso a API acessa o banco em db:5432, não em localhost. Manter o banco em rede interna, sem publicar porta no host, é boa prática de segurança elementar.",
          "Configuração vem do ambiente, não do código. Publique variáveis para host, porta e nome de banco; para credenciais, use secrets do orquestrador ou arquivo montado com permissão restrita. Um mesmo artefato precisa rodar em dev, staging e produção apenas mudando o ambiente.",
        ],
        code: [
          {
            label: "Volumes, rede e conexão entre serviços",
            language: "bash",
            code: `docker network create printquest-net
docker volume create printquest-pgdata

docker run -d --name db --network printquest-net \\
  -e POSTGRES_PASSWORD_FILE=/run/secrets/pg \\
  -v printquest-pgdata:/var/lib/postgresql/data \\
  postgres:16-alpine

docker run -d --name api --network printquest-net -p 3000:3000 \\
  -e DATABASE_HOST=db -e DATABASE_PORT=5432 -e NODE_ENV=production \\
  ghcr.io/tiago/printquest-api:v1.0.0

docker exec -it api getent hosts db     # DNS interno resolvendo
docker volume inspect printquest-pgdata
docker run --rm -v printquest-pgdata:/data alpine ls -la /data | head`,
            securityNote:
              "Evite -e SENHA=valor: a variável fica visível em docker inspect e no histórico do shell. Use arquivo de secret montado.",
          },
        ],
        whyItMatters: "Perder o volume do banco em um deploy é o tipo de erro que custa emprego. Entender persistência é obrigação.",
        commonMistake: "Usar localhost para falar com outro container e receber ECONNREFUSED.",
        productionTip: "Não publique a porta do banco no host; acesso administrativo via túnel SSH ou bastion.",
        securityAlert: "Volume com dados pessoais precisa de política de backup e de descarte, não só de existência.",
        interviewQuestion: "Quando você usaria bind mount e quando volume nomeado?",
        glossary: [
          { term: "volume nomeado", definition: "Área de armazenamento gerenciada pelo Docker, independente do ciclo do container." },
          { term: "DNS interno", definition: "Resolução automática de nomes de serviço dentro de uma rede Docker." },
        ],
        printQuestLink: "Garantir persistência dos pedidos do PrintQuest em volume dedicado.",
        quiz: [
          {
            question: "Dentro de um container, a que localhost se refere?",
            options: ["Ao host", "Ao próprio container", "Ao gateway da rede", "Ao container do banco"],
            answerIndex: 1,
            explanation: "Cada container tem seu próprio namespace de rede; localhost é ele mesmo.",
          },
        ],
      },
      {
        id: "l-4-4",
        moduleId: "mod-4",
        title: "Docker Compose: o stack do PrintQuest em um comando",
        duration: 50,
        difficulty: "Intermediário",
        tools: ["Docker Compose", "Vue", "Node", "PostgreSQL"],
        xp: 25,
        objectives: ["Declarar múltiplos serviços", "Usar healthcheck e depends_on condicionado", "Separar configuração por ambiente"],
        body: [
          "Compose descreve o ambiente inteiro em YAML: serviços, redes, volumes e dependências. O ganho real não é digitar menos, é reprodutibilidade: qualquer pessoa clona o repositório, roda um comando e tem o mesmo ambiente — fim do onboarding de dois dias.",
          "depends_on sozinho apenas ordena a inicialização; ele não espera o serviço ficar pronto. Para isso existe healthcheck combinado com condition: service_healthy. Sem isso, a API sobe antes do PostgreSQL aceitar conexões e entra em laço de reinício — o erro mais comum de quem está começando.",
          "Separe o que muda por ambiente: um docker-compose.yml base e um override para desenvolvimento com bind mount e hot reload. Em produção você não usa Compose com bind mount do código; usa a imagem construída no pipeline.",
        ],
        code: [
          {
            label: "docker-compose.yml do PrintQuest",
            language: "yaml",
            code: `services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: printquest
      POSTGRES_USER: printquest
      POSTGRES_PASSWORD_FILE: /run/secrets/pg_password
    secrets: [pg_password]
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U printquest -d printquest"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks: [backend]

  api:
    build:
      context: ./api
      target: runtime
    environment:
      NODE_ENV: production
      DATABASE_HOST: db
      DATABASE_PORT: "5432"
      DATABASE_NAME: printquest
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:3000/health"]
      interval: 15s
      timeout: 3s
      retries: 3
    networks: [backend, frontend]
    restart: unless-stopped

  web:
    build:
      context: ./web
    ports:
      - "8080:80"
    depends_on:
      api:
        condition: service_healthy
    networks: [frontend]
    restart: unless-stopped

volumes:
  pgdata:

networks:
  frontend:
  backend:
    internal: true

secrets:
  pg_password:
    file: ./secrets/pg_password.txt`,
            securityNote:
              "A rede backend é internal: o banco não tem rota para a internet. secrets/ deve estar no .gitignore.",
          },
          {
            label: "Operação diária com Compose",
            language: "bash",
            code: `docker compose up -d --build
docker compose ps
docker compose logs -f api
docker compose exec db psql -U printquest -d printquest -c '\\dt'
docker compose config          # valida e resolve o arquivo final
docker compose down            # mantem volumes
docker compose down -v         # remove volumes: apaga o banco`,
          },
        ],
        whyItMatters: "Compose é o ambiente de desenvolvimento padrão de times que entregam containers — e o degrau natural para Kubernetes.",
        commonMistake: "Confiar em depends_on sem healthcheck e culpar a aplicação pelo CrashLoop.",
        productionTip: "Rode docker compose config no CI para detectar YAML inválido antes do merge.",
        securityAlert: "docker compose down -v apaga volumes. Nunca digite isso em ambiente com dado real.",
        interviewQuestion: "Como você garante que a API só inicia depois que o banco aceita conexões?",
        glossary: [
          { term: "healthcheck", definition: "Comando periódico que determina se o container está saudável." },
          { term: "override", definition: "Arquivo Compose complementar que ajusta a configuração por ambiente." },
        ],
        printQuestLink: "Entregar o ambiente completo do PrintQuest com um docker compose up.",
        quiz: [
          {
            question: "O que faz condition: service_healthy?",
            options: [
              "Reinicia o serviço se ficar doente",
              "Espera o healthcheck da dependência passar antes de iniciar",
              "Cria o volume antes do serviço",
              "Publica a porta apenas se saudável",
            ],
            answerIndex: 1,
            explanation: "A dependência precisa reportar healthy para o serviço dependente iniciar.",
          },
        ],
      },
      {
        id: "l-4-5",
        moduleId: "mod-4",
        title: "Multi-stage e segurança de imagem",
        duration: 45,
        difficulty: "Avançado",
        tools: ["Docker", "Trivy", "BuildKit"],
        xp: 25,
        objectives: ["Separar build de runtime", "Rodar como usuário não-root com filesystem read-only", "Escanear vulnerabilidades"],
        body: [
          "Multi-stage build resolve um conflito antigo: para compilar você precisa de compilador, dependências de dev e ferramentas; para rodar, precisa apenas do artefato. Com estágios separados, o resultado final contém somente o necessário — imagem menor, build mais rápido e superfície de ataque reduzida.",
          "Segurança de container tem uma lista curta e obrigatória: usuário não-root, sem segredo embutido, base atualizada e fixada, filesystem read-only quando possível, capabilities descartadas e limites de recurso definidos. Cada item desses aparece em checklist de auditoria real.",
          "Scan de imagem no pipeline transforma segurança em processo. Falhe o build em vulnerabilidade crítica com correção disponível e gere SBOM para saber o que existe dentro do artefato — exigência crescente em contratos corporativos.",
        ],
        code: [
          {
            label: "Frontend Vue em multi-stage com Nginx",
            language: "dockerfile",
            code: `FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build          # gera /app/dist

FROM nginx:1.27-alpine AS runtime
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
USER nginx
CMD ["nginx", "-g", "daemon off;"]`,
          },
          {
            label: "Scan, SBOM e execução endurecida",
            language: "bash",
            code: `DOCKER_BUILDKIT=1 docker build -t printquest-web:v1 .
docker images printquest-web:v1 --format '{{.Size}}'

trivy image --severity HIGH,CRITICAL --exit-code 1 printquest-web:v1
docker sbom printquest-web:v1 2>/dev/null | head

docker run -d --name web \\
  --read-only --tmpfs /tmp --tmpfs /var/cache/nginx \\
  --cap-drop ALL --security-opt no-new-privileges \\
  --memory 256m --cpus 0.5 -p 8080:80 printquest-web:v1

docker history printquest-web:v1 | head   # confirme que nao ha segredo`,
            securityNote:
              "docker history revela comandos de build. Se um segredo passou por ARG, considere-o comprometido e rotacione.",
          },
        ],
        whyItMatters: "Imagem grande custa tempo de pipeline e dinheiro de registry; imagem insegura custa incidente.",
        commonMistake: "Deixar devDependencies e ferramentas de build na imagem final.",
        productionTip: "Use BuildKit com cache mount para dependências e mantenha a imagem final abaixo de 200 MB.",
        securityAlert: "Rodar como root com filesystem gravável permite que uma RCE na aplicação se torne persistente.",
        interviewQuestion: "Quais são as cinco medidas que você aplica para endurecer uma imagem de container?",
        glossary: [
          { term: "multi-stage", definition: "Dockerfile com vários FROM, copiando apenas artefatos entre estágios." },
          { term: "SBOM", definition: "Inventário dos componentes de software presentes no artefato." },
        ],
        printQuestLink: "Reduzir a imagem do frontend do PrintQuest e bloquear o build em vulnerabilidade crítica.",
        quiz: [
          {
            question: "Qual o principal benefício do multi-stage build?",
            options: [
              "Permitir vários containers no mesmo arquivo",
              "Manter na imagem final só o artefato e o runtime",
              "Acelerar o download da base",
              "Substituir o .dockerignore",
            ],
            answerIndex: 1,
            explanation: "Ferramentas de build ficam em estágios descartados, reduzindo tamanho e risco.",
          },
        ],
      },
    ],
  },
  {
    id: "mod-5",
    index: 5,
    slug: "ci-cd-com-github-actions",
    title: "CI/CD com GitHub Actions",
    tagline: "Nada chega à produção sem passar pela fortaleza.",
    weeks: 3,
    xp: 2000,
    badge: "pipeline-builder",
    regionId: "fortaleza-cicd",
    bossId: "boss-pipeline-quebrado",
    overview:
      "Pipeline é o coração operacional de DevOps. Você vai construir CI que roda lint, testes e build em cada PR, com cache eficiente, e CD que publica imagens imutáveis no GHCR usando autenticação sem senha (OIDC), ambientes com aprovação e rollback documentado. E, principalmente, vai aprender a depurar pipeline quebrado com método.",
    objectives: [
      "Escrever workflows com triggers, jobs e matrizes",
      "Acelerar builds com cache correto",
      "Gerenciar secrets e usar OIDC em vez de chave estática",
      "Publicar imagens com tag imutável e metadados",
      "Executar rollback rápido e confiável",
    ],
    prerequisites: ["Módulo 3 e 4 concluídos"],
    topics: ["Workflows", "Triggers", "Jobs", "Cache", "Lint", "Testes", "Build", "Secrets", "Registry", "Releases", "Rollback"],
    delivery: "CI obrigatório em PR e publicação de imagens com tag imutável no GHCR, com job de rollback disponível.",
    checklist: [
      "Workflow de PR rodando lint, testes e build em menos de 5 minutos",
      "Cache de dependências ativo e efetivo",
      "Imagem publicada com tag da versão e digest registrado",
      "Permissões do token mínimas (contents: read)",
      "Procedimento de rollback testado ao menos uma vez",
    ],
    troubleshooting:
      "Sintoma: pipeline verde no PR e vermelho na main. Investigação: o job da main roda testes de integração que dependem de service container e a variável de conexão está diferente. Causa raiz: configuração divergente entre workflows. Correção: extrair etapas comuns para workflow reutilizável e usar as mesmas variáveis.",
    interviewQuestions: [
      "O que deve rodar em cada PR e o que só em main?",
      "Como você evita usar chaves de nuvem de longa duração no CI?",
      "Como faria rollback de um deploy ruim em menos de cinco minutos?",
    ],
    printQuest: "Automatizar build, teste e publicação da imagem do PrintQuest a cada merge.",
    lessons: [
      {
        id: "l-5-1",
        moduleId: "mod-5",
        title: "Anatomia de um workflow: triggers, jobs e steps",
        duration: 40,
        difficulty: "Intermediário",
        tools: ["GitHub Actions", "YAML"],
        xp: 25,
        objectives: ["Escolher triggers adequados", "Estruturar jobs paralelos e dependentes", "Usar matriz de versões"],
        body: [
          "Um workflow reage a eventos: push, pull_request, schedule, workflow_dispatch (manual) e release. A escolha do trigger define o custo e a utilidade: validar em pull_request protege a main; publicar em push de tag garante que só versões marcadas geram artefato.",
          "Jobs rodam em paralelo por padrão e em máquinas separadas, o que significa que nada é compartilhado automaticamente entre eles — use needs para ordenar e artifacts para transportar arquivos. Steps dentro de um job compartilham o mesmo runner e diretório.",
          "Matriz é a forma de testar múltiplas versões sem duplicar YAML, e concurrency cancela execuções antigas do mesmo branch, economizando minutos e evitando confusão de resultados.",
        ],
        code: [
          {
            label: "CI do PrintQuest em PRs",
            language: "yaml",
            code: `name: ci

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  qualidade:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-node\${{ matrix.node }}
          path: coverage/

  shell:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: sudo apt-get install -y shellcheck
      - run: shellcheck scripts/*.sh`,
            securityNote:
              "Declare permissions no topo. O token padrão com escrita permite que uma dependência maliciosa altere o repositório.",
          },
        ],
        whyItMatters: "Pipeline é o que dá confiança para entregar várias vezes ao dia sem medo.",
        commonMistake: "Assumir que arquivos gerados em um job estarão disponíveis em outro.",
        productionTip: "Fixe actions por versão maior e evite referências a branch (@main) de terceiros.",
        securityAlert: "pull_request_target com checkout do código do PR é um vetor clássico de exfiltração de secrets.",
        interviewQuestion: "Qual a diferença entre job e step, e o que é compartilhado entre eles?",
        glossary: [
          { term: "runner", definition: "Máquina que executa um job do workflow." },
          { term: "concurrency", definition: "Regra que limita execuções simultâneas e pode cancelar as anteriores." },
        ],
        printQuestLink: "Tornar o CI obrigatório para merge no printquest-app.",
        quiz: [
          {
            question: "Como transportar arquivos entre dois jobs?",
            options: ["Variável de ambiente", "Artifacts ou cache", "Arquivo no /tmp do runner", "Secrets"],
            answerIndex: 1,
            explanation: "Jobs rodam em runners distintos; use upload/download de artifacts.",
          },
        ],
      },
      {
        id: "l-5-2",
        moduleId: "mod-5",
        title: "Cache, testes e pipeline rápido",
        duration: 40,
        difficulty: "Intermediário",
        tools: ["GitHub Actions", "cache", "service containers"],
        xp: 25,
        objectives: ["Configurar cache com chave correta", "Rodar testes de integração com service container", "Manter o pipeline abaixo de cinco minutos"],
        body: [
          "Pipeline lento é pipeline ignorado: as pessoas param de esperar e passam a burlar. Cache de dependências, baseado no hash do lockfile, é a otimização de maior retorno. Chave errada gera dois problemas opostos — cache nunca reaproveitado ou cache velho reaproveitado indevidamente.",
          "Testes de integração precisam de dependências reais: no GitHub Actions, service containers sobem PostgreSQL ou Redis ao lado do job, com healthcheck. Isso é infinitamente mais fiel que mock quando o objetivo é validar migração e consulta.",
          "Organize a execução por custo: lint e testes unitários primeiro (segundos), integração depois, build de imagem por último. Falhar rápido no que é barato preserva minutos e paciência.",
        ],
        code: [
          {
            label: "Testes de integração com PostgreSQL",
            language: "yaml",
            code: `jobs:
  integracao:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: printquest_test
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 10s --health-timeout 5s --health-retries 5
    env:
      DATABASE_URL: postgres://postgres:test@localhost:5432/printquest_test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run migrate
      - run: npm run test:integration

      - name: Cache do build do Docker
        uses: actions/cache@v4
        with:
          path: /tmp/.buildx-cache
          key: buildx-\${{ hashFiles('api/package-lock.json','api/Dockerfile') }}
          restore-keys: buildx-`,
            securityNote:
              "Credenciais de service container são de teste e efêmeras, mas nunca reutilize a mesma senha de produção nem em teste.",
          },
        ],
        whyItMatters: "Tempo de feedback é a métrica DORA mais sentida no dia a dia do time.",
        commonMistake: "Usar chave de cache fixa e receber dependências desatualizadas silenciosamente.",
        productionTip: "Meça a duração de cada job e trate pipeline lento como bug com prioridade.",
        interviewQuestion: "Como você reduziria um pipeline de 22 minutos para menos de 5?",
        glossary: [
          { term: "service container", definition: "Container auxiliar iniciado pelo runner para dependências de teste." },
          { term: "chave de cache", definition: "Identificador derivado de arquivos que determina reaproveitamento do cache." },
        ],
        printQuestLink: "Rodar as migrações e testes de integração do PrintQuest a cada PR.",
        quiz: [
          {
            question: "Qual a melhor base para a chave de cache de dependências Node?",
            options: ["Nome do branch", "Hash do package-lock.json", "Data do dia", "Número do PR"],
            answerIndex: 1,
            explanation: "O hash do lockfile muda exatamente quando as dependências mudam.",
          },
        ],
      },
      {
        id: "l-5-3",
        moduleId: "mod-5",
        title: "Secrets, OIDC e permissões mínimas",
        duration: 40,
        difficulty: "Avançado",
        tools: ["GitHub Actions", "OIDC", "AWS IAM"],
        xp: 25,
        objectives: ["Gerenciar secrets por ambiente", "Autenticar na AWS sem chave estática", "Aplicar menor privilégio no token do workflow"],
        body: [
          "Secret em CI é alvo de ataque. Boas práticas: usar secrets por ambiente com regra de aprovação, nunca imprimir valores, evitar passar segredo por argumento de linha de comando e restringir quem pode disparar workflows que acessam produção.",
          "A evolução mais importante dos últimos anos é OIDC: em vez de guardar chave de acesso da AWS no GitHub, o workflow troca um token de identidade por credenciais temporárias assumindo uma role. Não há chave para vazar nem rotacionar, e a role limita exatamente o que o pipeline pode fazer, inclusive por repositório e branch.",
          "Some a isso permissões mínimas do GITHUB_TOKEN (contents: read por padrão, escrita só onde necessário) e você elimina a maior parte dos vetores de comprometimento de pipeline.",
        ],
        code: [
          {
            label: "Deploy autenticando por OIDC",
            language: "yaml",
            code: `name: deploy

on:
  push:
    tags: ["v*"]

permissions:
  contents: read
  id-token: write        # necessario para OIDC

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: producao   # exige aprovacao configurada no repo
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/printquest-deploy
          aws-region: us-east-1
      - run: aws sts get-caller-identity
      - run: aws ecs update-service --cluster printquest --service api --force-new-deployment`,
            securityNote:
              "A trust policy da role deve restringir sub para o repositório e o ref específicos; sem isso, qualquer repo poderia assumi-la.",
          },
          {
            label: "Trust policy restritiva",
            language: "json",
            code: `{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
      "StringLike": { "token.actions.githubusercontent.com:sub": "repo:tiago/printquest-app:ref:refs/tags/v*" }
    }
  }]
}`,
          },
        ],
        whyItMatters: "Vagas de nível mais alto perguntam explicitamente sobre OIDC e menor privilégio em CI.",
        commonMistake: "Guardar AWS_ACCESS_KEY_ID no repositório e nunca rotacionar.",
        productionTip: "Use ambientes protegidos com revisor obrigatório para deploy em produção.",
        securityAlert: "echo de secret aparece em log; o mascaramento não cobre valores transformados (base64, por exemplo).",
        interviewQuestion: "Explique como OIDC substitui chaves estáticas no pipeline.",
        glossary: [
          { term: "OIDC", definition: "Protocolo de identidade que permite trocar token de confiança por credencial temporária." },
          { term: "environment", definition: "Recurso do GitHub que agrupa secrets e regras de aprovação por destino de deploy." },
        ],
        printQuestLink: "Configurar a role de deploy do PrintQuest restrita a tags do repositório.",
        quiz: [
          {
            question: "Qual permissão o workflow precisa para usar OIDC?",
            options: ["contents: write", "id-token: write", "packages: write", "actions: read"],
            answerIndex: 1,
            explanation: "id-token: write permite ao runner solicitar o token de identidade.",
          },
        ],
      },
      {
        id: "l-5-4",
        moduleId: "mod-5",
        title: "Build e publicação de imagem no GHCR com tag imutável",
        duration: 45,
        difficulty: "Avançado",
        tools: ["GitHub Actions", "Buildx", "GHCR"],
        xp: 25,
        objectives: ["Publicar no GHCR com metadados", "Gerar tags previsíveis", "Registrar o digest para deploy"],
        body: [
          "A saída do CI é um artefato identificável. Publicar no GHCR com docker/build-push-action e docker/metadata-action gera automaticamente tags coerentes: a versão da tag Git, o SHA do commit e, opcionalmente, latest para conveniência de desenvolvimento — nunca para produção.",
          "O digest é a identidade real da imagem. Registre-o na saída do job e use-o no deploy: assim, a mesma imagem testada é a que roda, sem chance de alguém sobrescrever uma tag no meio do caminho.",
          "Adicione labels OCI (fonte, revisão, versão) para que qualquer pessoa consiga rastrear a imagem de volta ao commit. Em auditoria e em incidente, esse detalhe economiza muito tempo.",
        ],
        code: [
          {
            label: "Publicação com metadados e digest",
            language: "yaml",
            code: `permissions:
  contents: read
  packages: write

jobs:
  imagem:
    runs-on: ubuntu-latest
    outputs:
      digest: \${{ steps.build.outputs.digest }}
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/\${{ github.repository }}/api
          tags: |
            type=semver,pattern={{version}}
            type=sha,format=long
      - id: build
        uses: docker/build-push-action@v6
        with:
          context: ./api
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      - run: echo "publicado com digest \${{ steps.build.outputs.digest }}"`,
            securityNote:
              "GITHUB_TOKEN com packages: write é suficiente para GHCR; não crie PAT de longa duração para isso.",
          },
        ],
        whyItMatters: "Deploy por digest é o que garante que produção roda exatamente o que passou pelos testes.",
        commonMistake: "Deployar :latest e não conseguir dizer qual commit está rodando.",
        productionTip: "Guarde a relação tag → digest → commit em um arquivo de release ou no repositório GitOps.",
        interviewQuestion: "Por que referenciar imagem por digest em produção?",
        glossary: [
          { term: "GHCR", definition: "GitHub Container Registry, registry de imagens integrado ao GitHub." },
          { term: "OCI labels", definition: "Metadados padronizados que descrevem origem e versão da imagem." },
        ],
        printQuestLink: "Publicar ghcr.io/tiago/printquest/api a cada tag de versão.",
        quiz: [
          {
            question: "Qual identificador é imutável para uma imagem?",
            options: ["latest", "nome da branch", "digest sha256", "número do build"],
            answerIndex: 2,
            explanation: "O digest é o hash do conteúdo; qualquer mudança gera outro digest.",
          },
        ],
      },
      {
        id: "l-5-5",
        moduleId: "mod-5",
        title: "Deploy, rollback e depuração de pipeline quebrado",
        duration: 45,
        difficulty: "Avançado",
        tools: ["GitHub Actions", "Docker", "act"],
        xp: 25,
        objectives: ["Estruturar deploy com aprovação", "Executar rollback em minutos", "Depurar workflow com método"],
        body: [
          "Deploy sem rollback planejado é aposta. O padrão mínimo é: artefato imutável, versão anterior conhecida e um caminho de volta testado — seja um job manual que reimplanta a versão anterior, seja rollout undo no Kubernetes. Rollback precisa ser tão rotineiro que ninguém hesite em usá-lo às três da manhã.",
          "Para depurar pipeline, siga a ordem: leia o primeiro erro do log (não o último), reproduza o comando localmente com as mesmas versões, verifique diferenças de ambiente (variáveis, permissões, cache) e só então mexa no YAML. Ative debug detalhado quando necessário e use act para iterar localmente sem poluir o histórico de execuções.",
          "Três causas cobrem a maioria dos casos: variável ou secret ausente no contexto (PR de fork não recebe secrets), permissão insuficiente do token e diferença de versão entre a máquina local e o runner.",
        ],
        code: [
          {
            label: "Deploy com rollback manual",
            language: "yaml",
            code: `name: deploy-e-rollback

on:
  workflow_dispatch:
    inputs:
      versao:
        description: "Tag da imagem a implantar (ex.: v1.2.0)"
        required: true
      acao:
        type: choice
        options: [deploy, rollback]
        default: deploy

jobs:
  aplicar:
    runs-on: ubuntu-latest
    environment: producao
    steps:
      - uses: actions/checkout@v4
      - name: Registrar versao atual
        run: echo "ANTERIOR=$(cat .deploy/current-version)" >> "$GITHUB_ENV"
      - name: Aplicar
        run: |
          set -euo pipefail
          ALVO="\${{ inputs.versao }}"
          echo "aplicando $ALVO (anterior: $ANTERIOR)"
          ./scripts/deploy.sh "$ALVO"
      - name: Verificar saude
        run: ./scripts/health-check.sh https://api.printquest.dev/health
      - name: Rollback automatico se falhar
        if: failure()
        run: ./scripts/deploy.sh "$ANTERIOR"`,
          },
          {
            label: "Depurar localmente",
            language: "bash",
            code: `gh run list --limit 5
gh run view --log-failed
gh run rerun <run-id> --failed

# reproduzir o job localmente
act pull_request -j qualidade --container-architecture linux/amd64

# habilitar log detalhado (variaveis de repositorio)
gh variable set ACTIONS_STEP_DEBUG --body true`,
          },
        ],
        whyItMatters: "Métricas DORA valorizam tempo de restauração. Rollback rápido é a resposta prática.",
        commonMistake: "Tentar corrigir para frente sob pressão em vez de reverter e investigar com calma.",
        productionTip: "Verificação de saúde pós-deploy com rollback automático em falha é o padrão que evita madrugadas.",
        securityAlert: "PRs de forks não recebem secrets: pipelines que dependem disso falham e tentam contornos inseguros.",
        interviewQuestion: "Descreva seu processo para depurar um workflow que falha só no runner.",
        glossary: [
          { term: "act", definition: "Ferramenta que executa workflows do GitHub Actions localmente em containers." },
          { term: "MTTR", definition: "Tempo médio de restauração do serviço após um incidente." },
        ],
        printQuestLink: "Criar o workflow de rollback do PrintQuest e testá-lo com a versão anterior.",
        quiz: [
          {
            question: "Deploy quebrou produção. Primeira ação correta?",
            options: [
              "Investigar a causa raiz antes de agir",
              "Reverter para a versão anterior conhecida e depois investigar",
              "Reiniciar todos os servidores",
              "Aumentar recursos da infraestrutura",
            ],
            answerIndex: 1,
            explanation: "Restaurar serviço primeiro; análise de causa raiz vem depois, com evidências preservadas.",
          },
        ],
      },
    ],
  },
];
