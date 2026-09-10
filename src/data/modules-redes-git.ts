import type { Module } from "@/lib/types";

export const REDES_GIT_MODULES: Module[] = [
  {
    id: "mod-2",
    index: 2,
    slug: "redes-http-e-nginx",
    title: "Redes, HTTP e Nginx",
    tagline: "Siga o pacote do navegador até o processo da aplicação.",
    weeks: 2,
    xp: 1500,
    badge: "nginx-defender",
    regionId: "floresta-redes",
    bossId: "boss-dragao-502",
    overview:
      "Quase todo incidente de produção é, no fundo, um problema de caminho: DNS que aponta para o lugar errado, porta bloqueada, certificado expirado, upstream fora do ar. Neste módulo você aprende a percorrer esse caminho com ferramentas — dig, curl, ss, tcpdump — e a operar um Nginx como reverse proxy, entendendo de verdade a diferença entre 502, 503 e 504.",
    objectives: [
      "Explicar IP, subnet, gateway e rotas",
      "Diagnosticar DNS por registro, TTL e servidor consultado",
      "Ler requisições HTTP/HTTPS com curl e interpretar status e headers",
      "Configurar Nginx como reverse proxy com TLS",
      "Diferenciar e resolver 502, 503 e 504",
    ],
    prerequisites: ["Módulo 1 concluído"],
    topics: ["IP e subnets", "DNS", "TCP/UDP", "Portas", "HTTP/HTTPS", "TLS", "Firewall", "NAT", "Proxy", "Load balancer", "5xx"],
    delivery: "API com endpoint /health publicada atrás de Nginx com TLS, mais um documento de diagnóstico de 502/503/504.",
    checklist: [
      "dig do domínio retorna o IP esperado e você sabe o TTL",
      "curl -I no domínio devolve 200 via HTTPS",
      "Nginx repassa cabeçalhos X-Forwarded-For e Host corretamente",
      "Timeouts do proxy ajustados e documentados",
      "Firewall liberando apenas 22, 80 e 443",
    ],
    troubleshooting:
      "Sintoma: usuários recebem 502 intermitente. Investigação: log de erro do Nginx mostra 'connect() failed (111: Connection refused)' — ou seja, o upstream não está aceitando conexão. Confirmação: curl no upstream direto e ss -tulpn no host da API. Causa raiz: a API reiniciou por falta de memória. Correção: limite de memória, restart automático e readiness antes de receber tráfego.",
    interviewQuestions: [
      "Qual a diferença entre 502, 503 e 504 e o que cada um diz sobre o backend?",
      "Como você verifica se um problema é DNS, rede ou aplicação?",
      "O que acontece no handshake TLS e por que um certificado expirado quebra tudo?",
    ],
    printQuest: "Publicar a API do CloudShop em api.cloudshop.dev atrás de Nginx com HTTPS.",
    lessons: [
      {
        id: "l-2-1",
        moduleId: "mod-2",
        title: "IP, subnets, portas e o caminho do pacote",
        duration: 40,
        difficulty: "Iniciante",
        tools: ["ip", "ss", "ping", "traceroute"],
        xp: 25,
        objectives: ["Ler endereços e máscaras CIDR", "Entender rota padrão e gateway", "Identificar bloqueio de porta"],
        body: [
          "Um endereço IP sozinho não diz nada: ele precisa da máscara. 10.0.1.15/24 significa que os três primeiros octetos identificam a rede e o último o host, com 254 endereços úteis. Essa noção é a mesma que você usará ao desenhar VPC na AWS, onde escolher /16 para a VPC e /24 para subnets é o padrão pragmático.",
          "O pacote sai da sua máquina, consulta a tabela de rotas, encontra o gateway padrão para destinos externos e segue. ip route mostra essa decisão; traceroute mostra o caminho. Quando 'a aplicação não responde', a pergunta correta é em qual salto o caminho morre.",
          "Portas identificam o serviço dentro do host. Conexão recusada significa que ninguém escuta ou o firewall rejeitou ativamente; timeout normalmente significa pacote descartado por firewall ou rota errada. Essa distinção economiza horas de investigação.",
        ],
        code: [
          {
            label: "Investigar rede local e conectividade",
            language: "bash",
            code: `ip -brief addr            # enderecos e interfaces
ip route                  # rota padrao (default via ...)
ss -tulpn                 # portas em escuta
ping -c3 1.1.1.1          # conectividade IP
traceroute api.cloudshop.dev 2>/dev/null || tracepath api.cloudshop.dev
nc -zv api.cloudshop.dev 443   # porta aberta?
curl -sS -o /dev/null -w '%{http_code} %{time_total}s\\n' https://api.cloudshop.dev/health`,
          },
        ],
        whyItMatters: "Sem entender rede você não consegue desenhar VPC, depurar Kubernetes nem explicar por que o serviço interno não é alcançável.",
        commonMistake: "Tratar 'connection refused' e 'timeout' como o mesmo problema.",
        productionTip: "Documente as faixas de IP de cada ambiente antes de criar a infraestrutura; conflito de CIDR é dor crônica.",
        securityAlert: "Nunca exponha portas de banco (5432, 3306) à internet; use rede privada ou túnel.",
        interviewQuestion: "Explique a diferença entre connection refused e connection timeout.",
        glossary: [
          { term: "CIDR", definition: "Notação que combina endereço e tamanho do prefixo de rede, como 10.0.0.0/16." },
          { term: "gateway padrão", definition: "Roteador usado para destinos fora da rede local." },
        ],
        printQuestLink: "Planejar as faixas 10.20.0.0/16 (dev) e 10.30.0.0/16 (staging) do CloudShop.",
        quiz: [
          {
            question: "Quantos endereços utilizáveis tem uma sub-rede /24?",
            options: ["256", "254", "128", "512"],
            answerIndex: 1,
            explanation: "256 endereços totais menos rede e broadcast resultam em 254 utilizáveis.",
          },
        ],
      },
      {
        id: "l-2-2",
        moduleId: "mod-2",
        title: "DNS: registros, TTL e por que a mudança não propagou",
        duration: 35,
        difficulty: "Intermediário",
        tools: ["dig", "nslookup", "Route 53"],
        xp: 25,
        objectives: ["Consultar registros com dig", "Escolher entre A, CNAME e ALIAS", "Planejar troca de IP com TTL baixo"],
        body: [
          "DNS traduz nome em endereço, e cada tipo de registro tem um papel: A aponta para IPv4, AAAA para IPv6, CNAME para outro nome, MX para e-mail, TXT para verificações e SPF, NS delega a zona. Na AWS, o registro ALIAS resolve a limitação de CNAME no domínio raiz apontando direto para ALB ou CloudFront.",
          "TTL é a duração do cache. Se você vai trocar de servidor, reduza o TTL para 60 segundos algumas horas antes; do contrário, parte dos usuários continuará indo para o IP antigo por horas. É por isso que 'já mudei o DNS e ainda não funciona' quase sempre é cache, não erro.",
          "Ao diagnosticar, consulte o servidor autoritativo e não apenas o resolvedor local: dig +trace mostra a cadeia completa, e comparar a resposta do seu resolvedor com a do autoritativo revela imediatamente se o problema é propagação.",
        ],
        code: [
          {
            label: "Diagnóstico de DNS",
            language: "bash",
            code: `dig api.cloudshop.dev +short
dig api.cloudshop.dev A +noall +answer      # inclui TTL
dig NS cloudshop.dev +short                  # servidores autoritativos
dig @1.1.1.1 api.cloudshop.dev +short        # resolvedor publico
dig +trace api.cloudshop.dev | tail -20
dig TXT cloudshop.dev +short
resolvectl status | head -20                   # resolvedor local`,
          },
        ],
        whyItMatters: "Migração de infraestrutura sem plano de DNS gera indisponibilidade parcial e difícil de explicar.",
        commonMistake: "Trocar o registro com TTL de 24h e prometer que a mudança será imediata.",
        productionTip: "Antes de qualquer migração, baixe o TTL, valide o novo destino, migre e só depois volte o TTL para um valor alto.",
        interviewQuestion: "Por que não se usa CNAME no domínio raiz e qual a alternativa na AWS?",
        glossary: [
          { term: "TTL", definition: "Tempo em segundos que um registro pode ficar em cache." },
          { term: "autoritativo", definition: "Servidor que detém oficialmente os registros da zona." },
        ],
        printQuestLink: "Criar api.cloudshop.dev com TTL 60 durante a fase de migração.",
        quiz: [
          {
            question: "Você mudou o registro A mas parte dos usuários ainda vai ao IP antigo. Causa mais provável?",
            options: ["Firewall bloqueando", "Cache de DNS pelo TTL", "Certificado inválido", "Registro MX errado"],
            answerIndex: 1,
            explanation: "Resolvedores mantêm a resposta anterior em cache até o TTL expirar.",
          },
        ],
      },
      {
        id: "l-2-3",
        moduleId: "mod-2",
        title: "HTTP, status e headers com curl",
        duration: 40,
        difficulty: "Iniciante",
        tools: ["curl", "HTTP"],
        xp: 25,
        objectives: ["Interpretar famílias de status", "Usar curl para depurar de verdade", "Entender cabeçalhos que afetam proxy e cache"],
        body: [
          "Status HTTP é a primeira informação de qualquer diagnóstico: 2xx sucesso, 3xx redirecionamento, 4xx erro de quem chamou, 5xx erro de quem serve. A leitura ingênua confunde 401 (não autenticado) com 403 (autenticado, mas sem permissão) e 404 (não existe) com 400 (requisição malformada) — distinções que definem se o problema é do cliente ou do servidor.",
          "curl é o canivete: -I mostra apenas cabeçalhos, -v revela handshake e redirecionamentos, -w extrai tempos por fase (DNS, conexão, TLS, primeiro byte). Medir tempo por fase transforma 'está lento' em 'o TLS handshake leva 800 ms', que é uma frase que se pode corrigir.",
          "Cabeçalhos importam na operação: Host define o virtual host, X-Forwarded-For carrega o IP real do cliente atrás do proxy, Cache-Control decide o comportamento de CDN e Content-Type evita respostas mal interpretadas. Proxy mal configurado que perde esses cabeçalhos gera bugs difíceis de reproduzir.",
        ],
        code: [
          {
            label: "curl para diagnóstico",
            language: "bash",
            code: `curl -I https://api.cloudshop.dev/health
curl -v https://api.cloudshop.dev/health 2>&1 | head -25

curl -s -o /dev/null -w 'dns:%{time_namelookup} conn:%{time_connect} tls:%{time_appconnect} ttfb:%{time_starttransfer} total:%{time_total}\\n' \\
  https://api.cloudshop.dev/health

curl -X POST https://api.cloudshop.dev/orders \\
  -H 'Content-Type: application/json' \\
  -H "Authorization: Bearer $TOKEN" \\
  -d '{"productId":"cube-01","qty":2}' -i

curl --resolve api.cloudshop.dev:443:203.0.113.10 https://api.cloudshop.dev/health -I`,
            securityNote:
              "Passe tokens por variável de ambiente, nunca literal no comando: o histórico do shell guarda tudo.",
          },
        ],
        whyItMatters: "curl é a ferramenta que prova onde o problema está antes de acusar outro time.",
        commonMistake: "Testar no navegador com cache e extensões e tirar conclusões erradas sobre a API.",
        productionTip: "Todo serviço deve ter /health simples (sem dependências) e /ready (com dependências) para uso de proxy e Kubernetes.",
        interviewQuestion: "Diferencie 401, 403 e 404 e diga o que cada um indica na investigação.",
        glossary: [
          { term: "TTFB", definition: "Time To First Byte: tempo até o primeiro byte de resposta, útil para separar rede de processamento." },
          { term: "X-Forwarded-For", definition: "Cabeçalho que preserva o IP original do cliente atrás de proxies." },
        ],
        printQuestLink: "Implementar /health e /ready na API do CloudShop.",
        quiz: [
          {
            question: "Qual opção do curl mostra apenas os cabeçalhos da resposta?",
            options: ["-d", "-I", "-X", "-L"],
            answerIndex: 1,
            explanation: "-I faz uma requisição HEAD e imprime somente os cabeçalhos.",
          },
        ],
      },
      {
        id: "l-2-4",
        moduleId: "mod-2",
        title: "TLS, certificados e HTTPS que não expira de surpresa",
        duration: 35,
        difficulty: "Intermediário",
        tools: ["OpenSSL", "Let's Encrypt", "Nginx"],
        xp: 25,
        objectives: ["Entender o handshake TLS", "Inspecionar certificados", "Automatizar renovação"],
        body: [
          "No handshake TLS o cliente e o servidor negociam versão e cifra, o servidor apresenta a cadeia de certificados e a validação verifica assinatura, nome (SAN) e validade. Falhar em qualquer um desses pontos produz erro no navegador e, pior, erro em integrações que não têm quem clique em 'prosseguir'.",
          "Dois erros dominam a prática: cadeia incompleta (funciona no navegador, falha em cliente HTTP) e certificado expirado. Ambos são detectáveis por comando e ambos são evitáveis por automação com renovação e alerta trinta dias antes do vencimento.",
          "Do lado do Nginx, use TLS 1.2 e 1.3, redirecione HTTP para HTTPS, ative HSTS depois de validar o domínio inteiro e não use protocolos antigos. Terminar TLS no proxy é o padrão: o backend recebe HTTP interno e o proxy informa o esquema original via cabeçalho.",
        ],
        code: [
          {
            label: "Inspecionar certificado e renovar",
            language: "bash",
            code: `echo | openssl s_client -connect api.cloudshop.dev:443 -servername api.cloudshop.dev 2>/dev/null \\
  | openssl x509 -noout -subject -issuer -dates -ext subjectAltName

# validade em dias
END=$(echo | openssl s_client -connect api.cloudshop.dev:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
echo "expira em: $END"

sudo certbot --nginx -d api.cloudshop.dev --agree-tos -m voce@exemplo.com --non-interactive
sudo certbot renew --dry-run`,
            securityNote:
              "A chave privada do certificado deve ter permissão 600 e dono root. Nunca versione /etc/letsencrypt.",
          },
        ],
        whyItMatters: "Certificado expirado é uma das causas mais comuns e mais evitáveis de indisponibilidade total.",
        commonMistake: "Instalar apenas o certificado do domínio sem a cadeia intermediária.",
        productionTip: "Monitore validade como métrica e alerte em 30 dias; não confie apenas no cron de renovação.",
        securityAlert: "Desative TLS 1.0/1.1 e cifras fracas; auditorias reprovam e clientes modernos já não precisam delas.",
        interviewQuestion: "Um cliente Java falha no TLS mas o navegador funciona. Qual sua hipótese principal?",
        glossary: [
          { term: "SAN", definition: "Subject Alternative Name: lista de domínios cobertos pelo certificado." },
          { term: "HSTS", definition: "Cabeçalho que obriga o navegador a usar HTTPS no domínio por um período." },
        ],
        printQuestLink: "Emitir e renovar automaticamente o certificado de api.cloudshop.dev.",
        quiz: [
          {
            question: "Erro de TLS só em clientes não-navegador geralmente indica:",
            options: ["Certificado expirado", "Cadeia intermediária ausente", "DNS errado", "Porta 443 fechada"],
            answerIndex: 1,
            explanation: "Navegadores completam a cadeia automaticamente; clientes HTTP estritos não.",
          },
        ],
      },
      {
        id: "l-2-5",
        moduleId: "mod-2",
        title: "Nginx reverse proxy e a anatomia de 502, 503 e 504",
        duration: 50,
        difficulty: "Intermediário",
        tools: ["Nginx", "curl", "systemd"],
        xp: 25,
        objectives: ["Configurar reverse proxy com upstream", "Ajustar timeouts", "Diagnosticar cada 5xx pela evidência certa"],
        body: [
          "O reverse proxy é a porta da aplicação: termina TLS, distribui carga, serve estáticos, aplica limites e esconde a topologia interna. A configuração mínima define um upstream, repassa cabeçalhos essenciais e ajusta timeouts coerentes com o comportamento da aplicação.",
          "Os três 5xx contam histórias diferentes. 502 Bad Gateway: o proxy conseguiu tentar, mas o upstream recusou ou fechou a conexão — normalmente processo caído, porta errada ou reinício. 503 Service Unavailable: não há upstream disponível, ou o próprio proxy está limitando (rate limit, todos os backends marcados como falhos). 504 Gateway Timeout: o upstream aceitou mas demorou além do proxy_read_timeout — quase sempre consulta lenta ou dependência travada.",
          "O procedimento é sempre o mesmo: ler o error.log do Nginx (a mensagem entre parênteses é ouro), testar o upstream direto com curl, verificar quem escuta a porta e só então mexer em configuração. Aumentar timeout sem entender a causa transforma erro rápido em lentidão prolongada.",
        ],
        code: [
          {
            label: "Nginx como reverse proxy do CloudShop",
            language: "nginx",
            code: `upstream cloudshop_api {
  server 127.0.0.1:3000 max_fails=3 fail_timeout=10s;
  keepalive 32;
}

server {
  listen 443 ssl;
  http2 on;
  server_name api.cloudshop.dev;

  ssl_certificate     /etc/letsencrypt/live/api.cloudshop.dev/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.cloudshop.dev/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;

  access_log /var/log/nginx/cloudshop.access.log;
  error_log  /var/log/nginx/cloudshop.error.log warn;

  location /health {
    proxy_pass http://cloudshop_api;
    access_log off;
  }

  location / {
    proxy_pass http://cloudshop_api;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 3s;
    proxy_send_timeout 15s;
    proxy_read_timeout 15s;
  }
}

server {
  listen 80;
  server_name api.cloudshop.dev;
  return 301 https://$host$request_uri;
}`,
            securityNote:
              "Não repasse cabeçalhos X-Forwarded-* vindos do cliente sem sobrescrevê-los: eles podem ser falsificados para burlar controles.",
          },
          {
            label: "Diagnóstico de 5xx",
            language: "bash",
            code: `sudo nginx -t && sudo systemctl reload nginx
sudo tail -50 /var/log/nginx/cloudshop.error.log

# 502: o upstream aceita conexao?
curl -sS -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:3000/health
ss -tulpn | grep :3000
systemctl status cloudshop-api --no-pager

# 504: quanto tempo a rota realmente leva?
curl -s -o /dev/null -w 'ttfb:%{time_starttransfer} total:%{time_total}\\n' http://127.0.0.1:3000/orders

# taxa de erro por status no access log
awk '{print $9}' /var/log/nginx/cloudshop.access.log | sort | uniq -c | sort -rn | head`,
          },
        ],
        whyItMatters: "Saber diferenciar 502, 503 e 504 sob pressão é literalmente uma pergunta de entrevista e uma tarefa de plantão.",
        commonMistake: "Aumentar proxy_read_timeout para 300s e chamar isso de correção do 504.",
        productionTip: "Timeout do proxy sempre menor que o do cliente, e a aplicação deve ter timeout para suas próprias dependências.",
        securityAlert: "Oculte a versão do servidor (server_tokens off) e aplique rate limit em rotas de autenticação.",
        interviewQuestion: "Nginx retorna 502 apenas após deploys. Qual é a causa mais provável e como confirmar?",
        glossary: [
          { term: "upstream", definition: "Conjunto de servidores backend para onde o proxy encaminha requisições." },
          { term: "keepalive", definition: "Reuso de conexões TCP com o upstream, reduzindo latência." },
        ],
        printQuestLink: "Colocar o Nginx na frente da API e do frontend do CloudShop com TLS e timeouts definidos.",
        quiz: [
          {
            question: "O upstream aceitou a conexão mas demorou 40s. Qual status o Nginx retorna com read_timeout de 15s?",
            options: ["502", "503", "504", "500"],
            answerIndex: 2,
            explanation: "Timeout de leitura do upstream resulta em 504 Gateway Timeout.",
          },
        ],
      },
    ],
  },
  {
    id: "mod-3",
    index: 3,
    slug: "git-github-e-bash",
    title: "Git, GitHub e Bash",
    tagline: "Colaborar sem quebrar a main e automatizar o repetitivo.",
    weeks: 2,
    xp: 1500,
    badge: "git-guardian",
    regionId: "reino-codigo",
    bossId: "boss-conflito-merge",
    overview:
      "Git é o alicerce de CI/CD e GitOps: sem histórico limpo e fluxo previsível, automação não é confiável. Você vai dominar branches, PRs, merge versus rebase, revert, tags e releases, além de proteger a main com regras. Na segunda metade, Bash: scripts idempotentes com tratamento de erro que substituem tarefas manuais como health-check e backup de logs.",
    objectives: [
      "Trabalhar com branches e Pull Requests de forma profissional",
      "Escolher entre merge, rebase e revert com consciência",
      "Publicar releases com tags semânticas",
      "Escrever scripts Bash seguros com set -euo pipefail",
      "Proteger a branch main com regras e checks obrigatórios",
    ],
    prerequisites: ["Módulo 0 concluído"],
    topics: ["Branches", "PR", "Merge", "Rebase", "Revert", "Tags", "Releases", "Bash", "Loops", "Funções", "Pipes", "Exit codes"],
    delivery: "Script de health-check e de backup de logs em Bash, com main protegida exigindo revisão e CI verde.",
    checklist: [
      "main protegida: sem push direto, PR com aprovação e status check",
      "Conflito de merge resolvido manualmente e documentado",
      "Tag v1.0.0 publicada com release notes",
      "Script com set -euo pipefail, trap e código de saída correto",
      "Backup de logs comprimido com retenção definida",
    ],
    troubleshooting:
      "Sintoma: um commit ruim já está na main e em produção. Opções: revert (cria commit que desfaz, seguro em branch compartilhada) ou reset (reescreve histórico, proibido em branch compartilhada). Decisão correta: git revert, deploy da nova versão e postmortem curto explicando por que o CI não pegou.",
    interviewQuestions: [
      "Quando você usa rebase e quando usa merge?",
      "Como reverter algo já publicado sem reescrever histórico?",
      "O que faz set -euo pipefail e por que é obrigatório em script de automação?",
    ],
    printQuest: "Proteger o repositório cloudshop-app e automatizar verificação e backup no host.",
    lessons: [
      {
        id: "l-3-1",
        moduleId: "mod-3",
        title: "Branches, commits e Pull Requests que passam em revisão",
        duration: 40,
        difficulty: "Iniciante",
        tools: ["Git", "GitHub"],
        xp: 25,
        objectives: ["Adotar um fluxo de branches simples", "Escrever commits e PRs claros", "Configurar proteção da main"],
        body: [
          "Para a maioria dos times, trunk-based com branches curtas vence fluxos complexos: você cria feat/algo, entrega em menos de dois dias, abre PR, o CI valida e o merge acontece. Branches longas acumulam conflito e transformam integração em evento traumático.",
          "Commits são documentação. Conventional Commits (feat, fix, chore, docs, refactor) permitem gerar changelog automático e dizem ao leitor a intenção da mudança. Um bom commit responde o que mudou e por quê; o como está no diff.",
          "Proteger a main é decisão de engenharia, não burocracia: exigir PR, revisão e checks impede que código sem teste chegue à produção. É também o ponto onde CI/CD começa a ter valor real.",
        ],
        code: [
          {
            label: "Fluxo diário",
            language: "bash",
            code: `git switch -c feat/health-endpoint
git add src/routes/health.js
git commit -m "feat(api): adiciona endpoint /health com checagem de banco"
git push -u origin feat/health-endpoint

gh pr create --fill --base main
gh pr checks
gh pr merge --squash --delete-branch

git log --oneline --graph --decorate -10`,
          },
        ],
        whyItMatters: "Pipelines, GitOps e rollback dependem de histórico previsível. Repositório caótico contamina toda a automação.",
        commonMistake: "Commitar tudo em um único commit gigante com mensagem 'ajustes'.",
        productionTip: "Squash merge mantém a main limpa e facilita revert de uma mudança inteira.",
        securityAlert: "Ative varredura de segredos no repositório; token commitado deve ser revogado, não apenas removido.",
        interviewQuestion: "Como você organizaria o fluxo de branches de um time de cinco pessoas?",
        glossary: [
          { term: "trunk-based", definition: "Estratégia com branches curtas integradas frequentemente na main." },
          { term: "squash merge", definition: "Merge que condensa todos os commits do PR em um único commit." },
        ],
        printQuestLink: "Abrir o PR do endpoint /health no cloudshop-app com CI obrigatório.",
        quiz: [
          {
            question: "Qual prática reduz conflitos de merge?",
            options: ["Branches longas", "Integrar frequentemente com branches curtas", "Evitar PRs", "Commitar apenas no fim do mês"],
            answerIndex: 1,
            explanation: "Quanto menor a divergência entre branch e main, menor a chance de conflito.",
          },
        ],
      },
      {
        id: "l-3-2",
        moduleId: "mod-3",
        title: "Merge, rebase, revert: reescrever ou preservar história",
        duration: 45,
        difficulty: "Intermediário",
        tools: ["Git"],
        xp: 25,
        objectives: ["Resolver conflitos com segurança", "Aplicar rebase apenas onde é seguro", "Reverter mudanças publicadas"],
        body: [
          "Merge preserva a história como aconteceu e cria um commit de junção; rebase reaplica seus commits sobre a base atual, produzindo linha reta. A regra prática é simples: rebase na sua branch local antes do PR, merge para integrar na main. Rebase em branch compartilhada reescreve commits que outras pessoas já têm e gera confusão real.",
          "Conflito não é erro: é o Git avisando que duas mudanças tocaram o mesmo trecho e ele não pode decidir. Você abre o arquivo, escolhe o resultado correto (que às vezes não é nenhum dos dois lados), marca como resolvido e continua. Testar depois de resolver é obrigatório: conflito mal resolvido compila e mesmo assim quebra a lógica.",
          "Para desfazer algo já publicado, use revert: ele cria um novo commit invertendo a mudança e mantém o histórico auditável. reset --hard em branch compartilhada é o caminho mais rápido para perder trabalho de colegas.",
        ],
        code: [
          {
            label: "Rebase, conflito e revert",
            language: "bash",
            code: `git fetch origin
git rebase origin/main
# em caso de conflito:
git status                       # ver arquivos em conflito
# edite os arquivos, remova os marcadores <<<<<<< ======= >>>>>>>
git add src/api/orders.js
git rebase --continue
git rebase --abort               # desistir e voltar ao estado anterior

git revert 9f3a21c               # desfaz commit publicado com seguranca
git revert -m 1 <merge_commit>   # desfaz um merge

git reflog | head -20            # rede de seguranca: recuperar estados
git diff origin/main...HEAD      # o que a minha branch muda`,
            securityNote: "Nunca use push --force em branch compartilhada; se necessário, use --force-with-lease.",
          },
        ],
        whyItMatters: "Rollback rápido depende de histórico confiável. Revert é o botão de emergência do deploy.",
        commonMistake: "Fazer rebase de uma branch que já está em PR aberto e forçar push, invalidando as revisões.",
        productionTip: "Se um deploy quebrou produção, reverta primeiro e investigue depois. Restaurar serviço vem antes de entender.",
        interviewQuestion: "Explique quando revert é preferível a reset e por quê.",
        glossary: [
          { term: "reflog", definition: "Registro local de todas as posições de HEAD, permitindo recuperar commits 'perdidos'." },
          { term: "force-with-lease", definition: "Push forçado que falha se o remoto tiver commits que você não viu." },
        ],
        printQuestLink: "Reverter uma mudança de configuração que quebrou o build do CloudShop.",
        quiz: [
          {
            question: "Qual comando desfaz um commit já publicado sem reescrever a história?",
            options: ["git reset --hard", "git revert", "git rebase -i", "git checkout"],
            answerIndex: 1,
            explanation: "revert cria um commit inverso, preservando o histórico compartilhado.",
          },
        ],
      },
      {
        id: "l-3-3",
        moduleId: "mod-3",
        title: "Tags, releases e versionamento semântico",
        duration: 30,
        difficulty: "Intermediário",
        tools: ["Git", "GitHub Releases", "SemVer"],
        xp: 25,
        objectives: ["Aplicar SemVer", "Criar tags anotadas e releases", "Relacionar tag, imagem e deploy"],
        body: [
          "Versionar não é enfeite: é o que permite dizer exatamente o que está em produção e voltar a um ponto conhecido. SemVer usa MAJOR.MINOR.PATCH, em que MAJOR indica quebra de compatibilidade, MINOR funcionalidade compatível e PATCH correção.",
          "Tags anotadas guardam autor, data e mensagem, e são o gatilho natural de pipelines de release. A partir da tag você constrói a imagem com o mesmo identificador, de forma que a versão do código e a do artefato nunca divergem.",
          "Evite a tag latest como referência de produção: ela muda sob seus pés e destrói a reprodutibilidade. Produção aponta para versão imutável, sempre.",
        ],
        code: [
          {
            label: "Release do CloudShop",
            language: "bash",
            code: `git tag -a v1.2.0 -m "feat: catalogo com filtro por material"
git push origin v1.2.0

gh release create v1.2.0 --generate-notes

git describe --tags --abbrev=0        # ultima tag alcancavel
git log v1.1.0..v1.2.0 --oneline      # o que entrou na versao

docker build -t ghcr.io/sua-org/cloudshop-api:v1.2.0 .
docker push ghcr.io/sua-org/cloudshop-api:v1.2.0`,
          },
        ],
        whyItMatters: "Sem versão imutável não existe rollback confiável nem auditoria do que está rodando.",
        commonMistake: "Usar apenas latest e depois não conseguir reproduzir o que estava em produção ontem.",
        productionTip: "Referencie a imagem por digest (sha256) em ambientes críticos: é a garantia máxima de imutabilidade.",
        interviewQuestion: "Como você garante que a versão em produção corresponde exatamente a um commit?",
        glossary: [
          { term: "SemVer", definition: "Convenção de versionamento MAJOR.MINOR.PATCH com significado definido." },
          { term: "digest", definition: "Hash sha256 que identifica de forma imutável o conteúdo de uma imagem." },
        ],
        printQuestLink: "Publicar a v1.0.0 do CloudShop com notas de release geradas do histórico.",
        quiz: [
          {
            question: "Correção de bug sem quebra de contrato incrementa qual número?",
            options: ["MAJOR", "MINOR", "PATCH", "Nenhum"],
            answerIndex: 2,
            explanation: "Correções compatíveis incrementam o PATCH.",
          },
        ],
      },
      {
        id: "l-3-4",
        moduleId: "mod-3",
        title: "Bash sério: set -euo pipefail, funções e exit codes",
        duration: 45,
        difficulty: "Intermediário",
        tools: ["Bash", "ShellCheck"],
        xp: 25,
        objectives: ["Escrever scripts que falham cedo e alto", "Usar funções, trap e logging", "Retornar códigos de saída úteis"],
        body: [
          "Script de automação sem tratamento de erro é armadilha: ele continua depois de falhar e produz estado pior que o inicial. set -e aborta em erro, set -u falha em variável não definida (evitando rm -rf em caminho vazio), set -o pipefail propaga erro em pipeline e IFS ajustado evita quebra com espaços em nomes.",
          "Exit code é a interface do seu script com o mundo: 0 é sucesso e qualquer outro valor é falha. CI, systemd, cron e Kubernetes tomam decisão com base nisso. Definir códigos específicos (2 para dependência ausente, 3 para validação falha) torna a automação legível.",
          "Estruture com funções pequenas, log com timestamp para stderr, trap para limpeza de arquivos temporários e validação de argumentos no início. E rode ShellCheck: ele encontra em segundos bugs de quoting que custariam horas.",
        ],
        code: [
          {
            label: "Health-check do CloudShop em Bash",
            language: "bash",
            code: `#!/usr/bin/env bash
set -euo pipefail
IFS=$'\\n\\t'

URL="\${1:-https://api.cloudshop.dev/health}"
TIMEOUT="\${TIMEOUT:-5}"
RETRIES=3

log() { printf '%s [%s] %s\\n' "$(date -Is)" "$1" "$2" >&2; }
cleanup() { rm -f "$TMP"; }

TMP="$(mktemp)"
trap cleanup EXIT

command -v curl >/dev/null || { log ERRO "curl nao instalado"; exit 2; }

for attempt in $(seq 1 "$RETRIES"); do
  code="$(curl -sS -m "$TIMEOUT" -o "$TMP" -w '%{http_code}' "$URL" || echo 000)"
  if [[ "$code" == "200" ]]; then
    log INFO "saudavel (tentativa $attempt)"
    exit 0
  fi
  log AVISO "status $code na tentativa $attempt"
  sleep $(( attempt * 2 ))
done

log ERRO "servico indisponivel apos $RETRIES tentativas"
cat "$TMP" >&2 || true
exit 3`,
            securityNote:
              "Sempre use aspas em variáveis e nunca construa comando concatenando entrada externa: é injeção de shell.",
          },
        ],
        whyItMatters: "Bash aparece em toda vaga porque é a cola de qualquer automação: pipelines, entrypoints e rotinas de plantão.",
        commonMistake: "Esquecer aspas em variável com espaço e apagar o arquivo errado.",
        productionTip: "Adicione shellcheck ao CI. É o linter mais barato e mais rentável que existe.",
        interviewQuestion: "O que cada parte de set -euo pipefail faz e qual problema evita?",
        glossary: [
          { term: "trap", definition: "Registra comando a executar quando o script recebe um sinal ou termina." },
          { term: "exit code", definition: "Número retornado pelo processo; 0 indica sucesso." },
        ],
        printQuestLink: "Usar o health-check no cron do host e como comando de verificação pós-deploy.",
        quiz: [
          {
            question: "Qual opção faz o script abortar quando um comando dentro de um pipeline falha?",
            options: ["set -e", "set -u", "set -o pipefail", "set -x"],
            answerIndex: 2,
            explanation: "Sem pipefail, o status do pipeline é apenas do último comando.",
          },
        ],
      },
      {
        id: "l-3-5",
        moduleId: "mod-3",
        title: "Automatizar tarefas de plantão: backup de logs e cron/timers",
        duration: 40,
        difficulty: "Intermediário",
        tools: ["Bash", "tar", "cron", "systemd timers"],
        xp: 25,
        objectives: ["Escrever backup com retenção", "Agendar com cron e systemd timer", "Validar restauração"],
        body: [
          "Tarefas repetitivas de plantão são as primeiras candidatas à automação: compactar logs, limpar arquivos antigos, verificar espaço em disco, checar certificados. O script precisa ser idempotente (rodar duas vezes não causa dano) e observável (log e código de saída).",
          "Backup sem teste de restauração é ilusão de segurança. Sempre valide a integridade do arquivo gerado e, periodicamente, restaure em outro caminho para conferir. Retenção precisa ser explícita: quantos dias, onde, quem paga o armazenamento.",
          "Para agendar, cron continua onipresente, mas systemd timers oferecem log integrado ao journal, dependências e Persistent=true para executar após reinício. Em servidores modernos, timers são a escolha melhor; em ambientes legados, cron resolve.",
        ],
        code: [
          {
            label: "Backup de logs com retenção",
            language: "bash",
            code: `#!/usr/bin/env bash
set -euo pipefail

SRC="/var/log/cloudshop"
DEST="/var/backups/cloudshop"
KEEP_DAYS=14
STAMP="$(date +%F-%H%M)"
FILE="$DEST/logs-$STAMP.tar.gz"

mkdir -p "$DEST"
tar -czf "$FILE" -C "$SRC" .
tar -tzf "$FILE" >/dev/null   # valida integridade

find "$DEST" -name 'logs-*.tar.gz' -mtime +"$KEEP_DAYS" -delete
echo "backup ok: $FILE ($(du -h "$FILE" | cut -f1))"`,
            securityNote:
              "Backup de log pode conter dado pessoal: restrinja permissões (700) e considere criptografia em repouso.",
          },
          {
            label: "Agendamento com systemd timer",
            language: "ini",
            code: `# /etc/systemd/system/cloudshop-backup.service
[Unit]
Description=Backup dos logs do CloudShop

[Service]
Type=oneshot
ExecStart=/usr/local/bin/backup-logs.sh

# /etc/systemd/system/cloudshop-backup.timer
[Unit]
Description=Executa backup diario 03:15

[Timer]
OnCalendar=*-*-* 03:15:00
Persistent=true

[Install]
WantedBy=timers.target

# sudo systemctl enable --now cloudshop-backup.timer
# systemctl list-timers | grep cloudshop`,
          },
        ],
        whyItMatters: "Automatizar o repetitivo libera tempo para engenharia e reduz erro humano em madrugada de plantão.",
        commonMistake: "Backup que roda há meses sobre um caminho que mudou — e ninguém verificou.",
        productionTip: "Faça o script emitir métrica ou notificação de sucesso; silêncio não é evidência de funcionamento.",
        securityAlert: "Cron rodando como root em script gravável por outro usuário é escalonamento de privilégio.",
        interviewQuestion: "Qual vantagem de systemd timer sobre cron em um servidor moderno?",
        glossary: [
          { term: "idempotente", definition: "Operação cujo resultado é o mesmo ao ser executada mais de uma vez." },
          { term: "Persistent", definition: "Opção de timer que executa a tarefa perdida após o host voltar." },
        ],
        printQuestLink: "Agendar backup diário dos logs do CloudShop com retenção de 14 dias.",
        quiz: [
          {
            question: "O que valida que o backup gerado é utilizável?",
            options: ["Ver o tamanho do arquivo", "Listar o conteúdo do tar e testar restauração", "Confiar no exit code do tar", "Contar os arquivos de origem"],
            answerIndex: 1,
            explanation: "Integridade e restauração de teste são as únicas provas reais.",
          },
        ],
      },
    ],
  },
];
