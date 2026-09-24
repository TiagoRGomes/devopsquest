import type { Lesson } from "@/lib/types";

/** Aprofundamento das aulas dos módulos 2 (Redes/HTTP/Nginx) e 3 (Git/Bash). Anexado às aulas originais. */
export type LessonDeep = Partial<Pick<Lesson, "body" | "code" | "glossary" | "quiz" | "objectives">>;

export const DEEP_REDES_GIT: Record<string, LessonDeep> = {
  "l-2-1": {
    objectives: ["Calcular rede, broadcast e hosts de um bloco CIDR", "Ler a tabela de rotas e explicar o gateway padrão", "Diferenciar TCP de UDP e saber quando cada um aparece"],
    body: [
      "<h3>1. O modelo em camadas, sem decoreba</h3><p>Pense na rede como correio: a <strong>camada de enlace</strong> (Ethernet, Wi‑Fi) entrega de um vizinho para o outro usando endereços MAC; a <strong>camada de rede</strong> (IP) sabe levar de uma cidade a outra; a <strong>camada de transporte</strong> (TCP/UDP) garante que a carta chegue ao morador certo, via porta; e a <strong>camada de aplicação</strong> (HTTP, DNS, SSH) é o conteúdo da carta.</p><p>Quando algo falha, você desce ou sobe essas camadas: a interface tem IP? Existe rota? A porta responde? A aplicação devolve o status esperado? Esse roteiro é o coração de todo diagnóstico de rede.</p>",
      "<h3>2. Calculando um bloco CIDR na mão</h3><p>Um IPv4 tem 32 bits. Em <code>10.0.1.0/24</code>, os 24 primeiros bits são fixos (rede) e sobram 8 bits para hosts: 2⁸ = 256 endereços. O primeiro (<code>10.0.1.0</code>) é o endereço da rede e o último (<code>10.0.1.255</code>) é broadcast, restando 254 utilizáveis.</p><ul><li><strong>/16</strong> = 65.536 endereços (tamanho típico de uma VPC)</li><li><strong>/24</strong> = 256 (subnet típica)</li><li><strong>/28</strong> = 16 (menor subnet permitida na AWS)</li><li><strong>/32</strong> = um único host (usado em regras de firewall)</li></ul><p>Na AWS, cada subnet reserva 5 endereços, então um /24 oferece 251 IPs úteis.</p>",
      "<h3>3. IPs privados, públicos e NAT</h3><p>As faixas <code>10.0.0.0/8</code>, <code>172.16.0.0/12</code> e <code>192.168.0.0/16</code> são privadas: não são roteadas na internet. Para sair, a máquina passa por um <strong>NAT</strong>, que troca o IP de origem pelo IP público do roteador. É exatamente o papel do NAT Gateway numa VPC: servidores em subnet privada acessam a internet, mas a internet não inicia conexão com eles.</p>",
      "<h3>4. Tabela de rotas: como o kernel decide</h3><p>Para cada pacote, o kernel procura a rota mais específica (maior prefixo) que casa com o destino. Se nada casar, usa a <strong>rota padrão</strong> (<code>default via 10.0.1.1</code>). Use <code>ip route get 1.1.1.1</code> para perguntar ao kernel qual interface e gateway ele usaria — é a forma mais rápida de confirmar se uma VPN ou um Docker bridge está roubando o tráfego.</p>",
      "<h3>5. TCP e UDP na prática</h3><p><strong>TCP</strong> abre conexão com o handshake SYN → SYN‑ACK → ACK, garante ordem e reenvio. É usado por HTTP, SSH e bancos. <strong>UDP</strong> não abre conexão: envia e pronto. É usado por DNS, métricas StatsD, streaming e QUIC (HTTP/3). Se o DNS falha mas o HTTP funciona, lembre-se de que o firewall pode estar liberando TCP e bloqueando UDP 53.</p>",
      "<h3>6. Portas e quem está escutando</h3><p>Portas de 0 a 1023 exigem privilégio (22 SSH, 80 HTTP, 443 HTTPS, 5432 PostgreSQL). O comando <code>ss -tulpn</code> lista quem escuta e em qual endereço. Atenção ao detalhe: <code>127.0.0.1:3000</code> só aceita conexões locais, enquanto <code>0.0.0.0:3000</code> aceita de qualquer interface. Metade dos 'funciona na minha máquina' em containers vem de um servidor escutando só em localhost.</p>",
      "<h3>7. Refused, timeout e no route</h3><ul><li><strong>Connection refused</strong>: o host respondeu com RST — ninguém escuta na porta ou um firewall rejeitou ativamente. O caminho existe.</li><li><strong>Timeout</strong>: nenhuma resposta. Pacote descartado por firewall/security group ou rota inexistente.</li><li><strong>No route to host</strong>: o próprio sistema (ou um roteador) sabe que não há caminho.</li></ul><p>Cada mensagem aponta para uma camada diferente; leia antes de agir.</p>",
      "<h3>8. Firewall no host</h3><p>No Ubuntu, <code>ufw</code> é uma interface amigável sobre nftables. A política saudável é negar entrada por padrão e liberar só o necessário. Em nuvem, você terá duas camadas: o firewall do host e o security group; ambos precisam permitir o tráfego.</p>",
      "<h3>9. Roteiro de diagnóstico em 5 passos</h3><ol><li><code>ip -brief addr</code>: a interface tem IP?</li><li><code>ip route get &lt;destino&gt;</code>: há rota?</li><li><code>ping</code>/<code>tracepath</code>: em qual salto morre?</li><li><code>nc -zv host porta</code>: a porta abre?</li><li><code>curl -v</code>: a aplicação responde corretamente?</li></ol><p>Registre o resultado de cada passo no ticket: isso transforma 'não funciona' em evidência.</p>",
      "<h3>10. Checagem final</h3><p>Você deve conseguir: planejar as subnets do CloudShop sem sobreposição, explicar por que um banco fica em subnet privada, e dizer em qual camada está um problema só lendo a mensagem de erro.</p>",
    ],
    code: [
      {
        label: "Perguntar ao kernel qual caminho será usado",
        language: "bash",
        code: `ip route get 1.1.1.1
# 1.1.1.1 via 10.0.1.1 dev eth0 src 10.0.1.15   <- gateway e interface escolhidos
ip route get 10.30.2.10
# se aparecer dev docker0 ou tun0, outra rede esta capturando esse destino`,
      },
      {
        label: "Firewall mínimo com ufw",
        language: "bash",
        code: `sudo ufw default deny incoming     # nega tudo que entra
sudo ufw default allow outgoing    # permite saida
sudo ufw allow 22/tcp              # SSH
sudo ufw allow 80,443/tcp          # HTTP e HTTPS
sudo ufw enable
sudo ufw status verbose            # confira antes de fechar a sessao SSH`,
        securityNote: "Libere a porta 22 antes de ativar o firewall para não se trancar fora do servidor.",
      },
    ],
    glossary: [
      { term: "NAT", definition: "Tradução de endereço que permite a IPs privados saírem para a internet usando um IP público." },
      { term: "broadcast", definition: "Último endereço de uma subnet, usado para falar com todos os hosts dela." },
      { term: "handshake TCP", definition: "Troca SYN, SYN-ACK, ACK que abre uma conexão TCP." },
      { term: "0.0.0.0", definition: "Endereço de escuta que significa 'todas as interfaces'." },
      { term: "security group", definition: "Firewall virtual de instâncias em nuvem, com regras stateful." },
    ],
    quiz: [
      { question: "Um serviço escuta em 127.0.0.1:3000 dentro do container. O que acontece ao acessar pela porta publicada?", options: ["Funciona normalmente", "Falha, pois só aceita conexões locais do próprio container", "Vira HTTPS", "Usa UDP"], answerIndex: 1, explanation: "Localhost dentro do container não é alcançável de fora; é preciso escutar em 0.0.0.0." },
      { question: "Qual protocolo o DNS usa por padrão?", options: ["TCP 80", "UDP 53", "TCP 443", "UDP 123"], answerIndex: 1, explanation: "DNS usa UDP 53 e recorre a TCP 53 para respostas grandes." },
      { question: "Quantos IPs úteis uma subnet /24 oferece na AWS?", options: ["256", "254", "251", "250"], answerIndex: 2, explanation: "A AWS reserva 5 endereços por subnet." },
    ],
  },
  "l-2-2": {
    body: [
      "<h3>1. Como uma resolução acontece de verdade</h3><p>Sua máquina pergunta ao <strong>resolvedor recursivo</strong> (do provedor, 1.1.1.1, 8.8.8.8). Se ele não tiver cache, pergunta à raiz, que indica os servidores de <code>.dev</code>, que indicam os servidores <strong>autoritativos</strong> de <code>cloudshop.dev</code>, que finalmente respondem o IP. O resolvedor guarda a resposta pelo TTL e devolve a você.</p>",
      "<h3>2. Os registros que você vai usar</h3><ul><li><strong>A / AAAA</strong>: nome → IPv4 / IPv6</li><li><strong>CNAME</strong>: nome → outro nome (não pode coexistir com outros registros no mesmo nome)</li><li><strong>ALIAS/ANAME</strong>: comportamento de CNAME no apex, específico do provedor</li><li><strong>MX</strong>: servidores de e-mail</li><li><strong>TXT</strong>: SPF, DKIM, verificação de domínio, desafios ACME</li><li><strong>NS</strong>: quem é autoritativo pela zona</li><li><strong>CAA</strong>: quais autoridades podem emitir certificados</li></ul>",
      "<h3>3. TTL e cache negativo</h3><p>O TTL vale também para respostas 'não existe' (NXDOMAIN), controladas pelo registro SOA. Se você consultou um nome antes de criá-lo, pode ficar recebendo NXDOMAIN por alguns minutos mesmo após a criação. Não é bug: é cache negativo.</p>",
      "<h3>4. Migração de IP sem indisponibilidade</h3><ol><li>Um dia antes, baixe o TTL para 60s.</li><li>Suba o novo destino e teste com <code>curl --resolve api.cloudshop.dev:443:NOVO_IP https://api.cloudshop.dev/health</code>.</li><li>Troque o registro.</li><li>Mantenha o servidor antigo ativo pelo TTL antigo.</li><li>Volte o TTL para 300–3600s.</li></ol>",
      "<h3>5. DNS dentro do Kubernetes e do Docker</h3><p>Containers usam um DNS interno: no Docker Compose, o nome do serviço resolve para o container; no Kubernetes, <code>api.cloudshop.svc.cluster.local</code> resolve para o Service. Muitos erros 'host not found' em cluster vêm de namespace errado no nome curto.</p>",
      "<h3>6. Checagem final</h3><p>Você deve saber consultar o autoritativo, ler o TTL restante, validar um novo destino antes da troca e explicar por que o apex não aceita CNAME.</p>",
    ],
    code: [
      {
        label: "Testar novo servidor antes de trocar o DNS",
        language: "bash",
        code: `# forca o nome a resolver para o novo IP apenas neste comando
curl -sS --resolve api.cloudshop.dev:443:203.0.113.20 https://api.cloudshop.dev/health
# {"status":"ok"}  <- novo destino pronto; agora pode trocar o registro A
dig api.cloudshop.dev @ns-1.awsdns-00.com +noall +answer   # resposta do autoritativo`,
      },
    ],
    glossary: [
      { term: "resolvedor recursivo", definition: "Servidor que faz a busca completa e mantém cache para os clientes." },
      { term: "NXDOMAIN", definition: "Resposta DNS indicando que o nome não existe." },
      { term: "apex", definition: "O domínio raiz da zona, como cloudshop.dev." },
      { term: "CAA", definition: "Registro que restringe quais autoridades podem emitir certificados." },
    ],
    quiz: [
      { question: "Qual registro é usado no desafio DNS-01 do Let's Encrypt?", options: ["MX", "TXT", "NS", "AAAA"], answerIndex: 1, explanation: "O ACME publica um token em um registro TXT _acme-challenge." },
      { question: "Como validar um servidor novo sem mexer no DNS?", options: ["ping", "curl --resolve", "dig +trace", "traceroute"], answerIndex: 1, explanation: "--resolve força o IP apenas para aquela requisição." },
    ],
  },
  "l-2-3": {
    body: [
      "<h3>1. Anatomia de uma requisição</h3><p>Uma requisição HTTP tem <strong>método</strong> (GET, POST, PUT, PATCH, DELETE), <strong>caminho</strong>, <strong>headers</strong> e, às vezes, <strong>corpo</strong>. A resposta tem <strong>status</strong>, headers e corpo. Com <code>curl -v</code> você vê tudo: linhas com <code>&gt;</code> são o que você enviou, com <code>&lt;</code> o que recebeu.</p>",
      "<h3>2. Famílias de status</h3><ul><li><strong>2xx</strong> sucesso (200 OK, 201 Created, 204 No Content)</li><li><strong>3xx</strong> redirecionamento (301 permanente, 302/307 temporário, 304 cache)</li><li><strong>4xx</strong> erro do cliente (400, 401 sem autenticação, 403 sem permissão, 404, 429 limite)</li><li><strong>5xx</strong> erro do servidor ou do caminho (500, 502, 503, 504)</li></ul><p>Regra de ouro no plantão: 4xx em massa costuma ser deploy de cliente ou mudança de contrato; 5xx é com você.</p>",
      "<h3>3. Headers que importam para DevOps</h3><ul><li><code>Host</code>: qual site o cliente quer — base de virtual hosts</li><li><code>X-Forwarded-For</code> / <code>X-Forwarded-Proto</code>: IP e protocolo originais quando há proxy</li><li><code>Cache-Control</code>, <code>ETag</code>: comportamento de cache e CDN</li><li><code>Strict-Transport-Security</code>: força HTTPS no navegador</li><li><code>X-Request-Id</code>: correlaciona logs entre serviços</li></ul>",
      "<h3>4. Medindo tempo com curl</h3><p>O <code>-w</code> do curl quebra o tempo em DNS, conexão TCP, handshake TLS, tempo até o primeiro byte e total. Se o TTFB é alto e o resto baixo, o gargalo está na aplicação; se o <code>time_connect</code> é alto, é rede.</p>",
      "<h3>5. Health checks bem feitos</h3><p>Separe <strong>liveness</strong> (o processo está vivo?) de <strong>readiness</strong> (pode receber tráfego? banco conectado?). Um /health que consulta tudo pode derrubar o serviço inteiro quando uma dependência secundária oscila.</p>",
      "<h3>6. Checagem final</h3><p>Você deve conseguir ler um <code>curl -v</code>, apontar a fase lenta de uma requisição e explicar 401 vs 403.</p>",
    ],
    code: [
      {
        label: "Quebrar o tempo de uma requisição por fase",
        language: "bash",
        code: `curl -sS -o /dev/null https://api.cloudshop.dev/health -w '
dns:     %{time_namelookup}s
tcp:     %{time_connect}s
tls:     %{time_appconnect}s
ttfb:    %{time_starttransfer}s
total:   %{time_total}s
status:  %{http_code}
'
# ttfb muito maior que tls => lentidao na aplicacao, nao na rede`,
      },
      {
        label: "Enviar JSON e ver headers",
        language: "bash",
        code: `curl -i -X POST https://api.cloudshop.dev/orders \\
  -H 'Content-Type: application/json' \\
  -H 'X-Request-Id: debug-123' \\
  -d '{"sku":"CS-001","qty":1}'
# HTTP/2 201   <- criado
# location: /orders/42`,
      },
    ],
    glossary: [
      { term: "TTFB", definition: "Time To First Byte: tempo até o primeiro byte da resposta." },
      { term: "idempotente", definition: "Operação que pode ser repetida sem mudar o resultado, como GET e PUT." },
      { term: "readiness", definition: "Sinal de que o serviço está pronto para receber tráfego." },
      { term: "HSTS", definition: "Header que obriga o navegador a usar HTTPS no domínio." },
    ],
    quiz: [
      { question: "Usuário autenticado sem permissão recebe qual status?", options: ["401", "403", "404", "500"], answerIndex: 1, explanation: "401 é falta de autenticação; 403 é autenticado mas proibido." },
      { question: "time_connect baixo e time_starttransfer alto indicam:", options: ["Problema de DNS", "Lentidão na aplicação", "Firewall", "Certificado"], answerIndex: 1, explanation: "A conexão foi rápida; a demora está no processamento." },
    ],
  },
  "l-2-4": {
    body: [
      "<h3>1. O que o TLS garante</h3><p>TLS entrega três coisas: <strong>confidencialidade</strong> (ninguém lê no meio), <strong>integridade</strong> (ninguém altera) e <strong>autenticidade</strong> (o servidor é quem diz ser). A autenticidade vem do certificado, assinado por uma autoridade (CA) em que o sistema confia.</p>",
      "<h3>2. Cadeia de certificados</h3><p>O servidor deve enviar o seu certificado <strong>e</strong> os intermediários (<code>fullchain.pem</code>). Se enviar só o certificado final, navegadores podem funcionar por cache, mas curl, apps mobile e integrações falham com 'unable to get local issuer certificate'.</p>",
      "<h3>3. Handshake em alto nível</h3><p>O cliente envia versões e cifras suportadas e o nome desejado (SNI). O servidor escolhe, envia o certificado, ambos combinam uma chave de sessão e a comunicação passa a ser cifrada. Com TLS 1.3 isso leva uma ida e volta.</p>",
      "<h3>4. Let's Encrypt e renovação automática</h3><p>Certificados gratuitos duram 90 dias de propósito: forçam automação. O certbot (ou o cert-manager no Kubernetes) renova sozinho a partir de 30 dias do vencimento. Seu trabalho é garantir que a renovação roda e alertar se falhar.</p>",
      "<h3>5. Monitorar validade</h3><p>Crie um alerta para certificados com menos de 14 dias. É um dos incidentes mais evitáveis e mais constrangedores da profissão.</p>",
      "<h3>6. Checagem final</h3><p>Você deve saber ver emissor e validade com openssl, explicar SNI e confirmar que a cadeia completa está sendo servida.</p>",
    ],
    code: [
      {
        label: "Inspecionar certificado e dias restantes",
        language: "bash",
        code: `echo | openssl s_client -connect api.cloudshop.dev:443 -servername api.cloudshop.dev 2>/dev/null \\
  | openssl x509 -noout -issuer -subject -dates
# notAfter=Dec 20 12:00:00 2026 GMT   <- data de expiracao
sudo certbot renew --dry-run          # testa a renovacao sem alterar nada
systemctl list-timers | grep certbot  # timer que renova automaticamente`,
      },
    ],
    glossary: [
      { term: "SNI", definition: "Extensão TLS onde o cliente informa o nome do site, permitindo vários certificados no mesmo IP." },
      { term: "fullchain", definition: "Arquivo com o certificado do site mais os intermediários." },
      { term: "ACME", definition: "Protocolo usado pelo Let's Encrypt para emitir e renovar certificados automaticamente." },
    ],
    quiz: [
      { question: "curl falha com 'unable to get local issuer certificate' mas o navegador abre. Causa provável?", options: ["DNS", "Cadeia intermediária ausente", "Porta fechada", "HTTP/2"], answerIndex: 1, explanation: "O servidor não envia os intermediários; o navegador compensou com cache." },
      { question: "Por que certificados Let's Encrypt duram 90 dias?", options: ["Custo", "Para incentivar automação e reduzir impacto de vazamento", "Limite técnico", "Exigência do DNS"], answerIndex: 1, explanation: "Vida curta obriga renovação automática e limita a janela de abuso." },
    ],
  },
  "l-2-5": {
    body: [
      "<h3>1. O que um reverse proxy faz</h3><p>O Nginx recebe a conexão do cliente, termina o TLS, aplica regras (limites, headers, cache, compressão) e repassa ao <strong>upstream</strong> — sua API Node em <code>127.0.0.1:3000</code>. O cliente nunca fala direto com a aplicação.</p>",
      "<h3>2. Estrutura da configuração</h3><p><code>http</code> contém <code>server</code> (um site por <code>server_name</code>), que contém <code>location</code> (regras por caminho). Sempre valide com <code>nginx -t</code> antes de <code>systemctl reload nginx</code>; reload não derruba conexões, restart derruba.</p>",
      "<h3>3. 502, 503 e 504 pelo log</h3><ul><li><strong>502 Bad Gateway</strong>: o upstream recusou, fechou a conexão ou devolveu lixo. Log: <em>connect() failed (111)</em> ou <em>upstream prematurely closed</em>.</li><li><strong>503 Service Unavailable</strong>: não há upstream disponível ou há limite/manutenção.</li><li><strong>504 Gateway Timeout</strong>: o upstream aceitou mas não respondeu dentro de <code>proxy_read_timeout</code>.</li></ul>",
      "<h3>4. Timeouts conscientes</h3><p>Aumentar timeout esconde lentidão; diminuir demais corta operações legítimas. Meça o p99 da rota e defina o timeout um pouco acima, documentando o motivo.</p>",
      "<h3>5. Balanceamento de carga</h3><p>Um bloco <code>upstream</code> com vários servidores distribui por round-robin; <code>max_fails</code> e <code>fail_timeout</code> tiram temporariamente do rodízio um backend doente.</p>",
      "<h3>6. Checagem final</h3><p>Você deve conseguir ler o error.log e dizer em segundos se o problema é o upstream parado, lento ou inexistente.</p>",
    ],
    code: [
      {
        label: "Upstream com dois backends e failover",
        language: "nginx",
        code: `upstream cloudshop_api {
  server 127.0.0.1:3000 max_fails=3 fail_timeout=10s;
  server 127.0.0.1:3001 max_fails=3 fail_timeout=10s;
  keepalive 32;                     # reutiliza conexoes com o backend
}
server {
  listen 443 ssl http2;
  server_name api.cloudshop.dev;
  location / {
    proxy_pass http://cloudshop_api;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 15s;         # acima do p99 medido da API
  }
}`,
      },
      {
        label: "Diagnóstico rápido de 5xx",
        language: "bash",
        code: `sudo nginx -t && sudo systemctl reload nginx
sudo tail -n 50 /var/log/nginx/error.log | grep -E 'upstream|connect\\(\\)'
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head
# 1520 200 / 37 502  <- proporcao de erros
curl -sS http://127.0.0.1:3000/health   # testa o upstream sem o proxy`,
      },
    ],
    glossary: [
      { term: "upstream", definition: "Servidor de aplicação para o qual o proxy repassa as requisições." },
      { term: "reload", definition: "Recarregar configuração sem derrubar conexões ativas." },
      { term: "round-robin", definition: "Distribuição de requisições em rodízio entre os backends." },
    ],
    quiz: [
      { question: "O log mostra 'upstream timed out while reading response header'. Qual status o cliente viu?", options: ["502", "503", "504", "500"], answerIndex: 2, explanation: "O upstream aceitou mas não respondeu a tempo: 504." },
      { question: "Qual comando valida a configuração antes de aplicar?", options: ["nginx -s stop", "nginx -t", "nginx -v", "systemctl restart nginx"], answerIndex: 1, explanation: "nginx -t testa a sintaxe e os arquivos referenciados." },
    ],
  },
  "l-3-1": {
    body: [
      "<h3>1. O modelo mental do Git</h3><p>O Git guarda <strong>snapshots</strong>, não diferenças. Cada commit aponta para o snapshot e para o commit pai; uma branch é apenas um ponteiro móvel para um commit. Entender isso elimina o medo: criar branch é barato e quase nada se perde de verdade.</p>",
      "<h3>2. As três áreas</h3><p><strong>Working tree</strong> (seus arquivos), <strong>staging</strong> (o que vai no próximo commit, via <code>git add</code>) e <strong>repositório</strong> (commits). <code>git add -p</code> permite escolher trechos, produzindo commits pequenos e focados.</p>",
      "<h3>3. Mensagens de commit que ajudam no incidente</h3><p>Use o padrão <strong>Conventional Commits</strong>: <code>feat(api): adiciona endpoint /orders</code>, <code>fix(nginx): aumenta proxy_read_timeout</code>. Linha de assunto no imperativo, até ~72 caracteres, e corpo explicando o <em>porquê</em>. Ferramentas geram changelog e versão a partir disso.</p>",
      "<h3>4. Fluxo de trabalho com trunk-based</h3><p>Branches curtas (horas ou poucos dias) saindo da <code>main</code>, PR pequeno, revisão, CI verde, merge. Branches longas acumulam conflito e risco. Feature flags permitem integrar código incompleto sem ativá-lo.</p>",
      "<h3>5. Pull Request que passa em revisão</h3><ul><li>Título claro e descrição com contexto, mudança e como testar</li><li>Menos de ~400 linhas alteradas</li><li>CI verde antes de pedir revisão</li><li>Screenshots ou saída de comandos quando for infra</li><li>Proteção de branch: revisão obrigatória e checks exigidos</li></ul>",
      "<h3>6. Checagem final</h3><p>Você deve criar branch, fazer commits atômicos com <code>add -p</code>, abrir PR bem descrito e explicar o que é uma branch por dentro.</p>",
    ],
    code: [
      {
        label: "Ciclo completo de uma mudança",
        language: "bash",
        code: `git switch main && git pull --ff-only
git switch -c fix/nginx-timeout
git add -p                          # escolhe trechos
git commit -m "fix(nginx): ajusta proxy_read_timeout para 15s" \\
  -m "p99 da rota /orders medido em 11s; timeout anterior de 5s gerava 504."
git push -u origin fix/nginx-timeout
gh pr create --fill --base main     # abre o PR com a mensagem do commit`,
      },
    ],
    glossary: [
      { term: "snapshot", definition: "Foto completa do estado dos arquivos em um commit." },
      { term: "HEAD", definition: "Ponteiro para o commit/branch atualmente em uso." },
      { term: "Conventional Commits", definition: "Convenção de mensagens como feat:, fix:, chore: que permite automação." },
      { term: "trunk-based", definition: "Estratégia de branches curtas integradas com frequência à main." },
    ],
    quiz: [
      { question: "O que é uma branch no Git?", options: ["Uma cópia dos arquivos", "Um ponteiro móvel para um commit", "Um servidor", "Um diff"], answerIndex: 1, explanation: "Branch é só uma referência para um commit." },
      { question: "Para que serve git add -p?", options: ["Push forçado", "Escolher trechos para o commit", "Apagar arquivos", "Criar tag"], answerIndex: 1, explanation: "Permite montar commits focados, trecho a trecho." },
    ],
  },
  "l-3-2": {
    body: [
      "<h3>1. Merge preserva, rebase reescreve</h3><p><strong>Merge</strong> cria um commit que une duas histórias; nada é alterado. <strong>Rebase</strong> reaplica seus commits sobre outra base, gerando commits novos com hashes novos. Regra prática: rebase em branches só suas; nunca reescreva história compartilhada.</p>",
      "<h3>2. Resolvendo conflitos com calma</h3><p>O Git marca o trecho com <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code> e <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code>. Entenda as duas intenções, edite, rode os testes, <code>git add</code> e continue (<code>git rebase --continue</code> ou commit do merge). Em dúvida, <code>--abort</code> volta ao estado anterior.</p>",
      "<h3>3. Revert em produção</h3><p><code>git revert &lt;sha&gt;</code> cria um commit que desfaz outro, mantendo a história auditável. É o jeito seguro de desfazer algo que já está na main e já foi para produção.</p>",
      "<h3>4. Reflog: a rede de segurança</h3><p>Fez <code>reset --hard</code> errado? <code>git reflog</code> mostra por onde o HEAD passou nos últimos dias; basta criar uma branch naquele ponto para recuperar.</p>",
      "<h3>5. Force push com responsabilidade</h3><p>Se precisar, use <code>git push --force-with-lease</code>: ele recusa o push se alguém enviou algo que você não viu.</p>",
      "<h3>6. Checagem final</h3><p>Você deve saber escolher entre merge, rebase e revert conforme o contexto e recuperar trabalho perdido com reflog.</p>",
    ],
    code: [
      {
        label: "Atualizar branch e recuperar erro",
        language: "bash",
        code: `git fetch origin
git rebase origin/main              # reaplica seus commits sobre a main atual
# conflito? edite, depois:
git add . && git rebase --continue
git push --force-with-lease         # seguro: recusa se o remoto mudou
git reflog | head -5                # historico do HEAD
git switch -c resgate HEAD@{2}      # recupera um estado anterior`,
      },
    ],
    glossary: [
      { term: "reflog", definition: "Registro local de todas as posições por onde o HEAD passou." },
      { term: "force-with-lease", definition: "Push forçado que falha se o remoto tiver commits que você não conhece." },
      { term: "fast-forward", definition: "Merge que apenas avança o ponteiro, sem commit de merge." },
    ],
    quiz: [
      { question: "Um commit ruim já está na main em produção. O que usar?", options: ["git reset --hard e force push", "git revert", "git rebase -i", "Apagar a branch"], answerIndex: 1, explanation: "Revert desfaz sem reescrever a história compartilhada." },
      { question: "Onde recuperar um commit 'perdido' após reset?", options: ["git log", "git reflog", "git stash", "git tag"], answerIndex: 1, explanation: "O reflog guarda as posições anteriores do HEAD." },
    ],
  },
  "l-3-3": {
    body: [
      "<h3>1. SemVer explicado</h3><p><code>MAJOR.MINOR.PATCH</code>: PATCH corrige sem mudar contrato, MINOR adiciona compatível, MAJOR quebra compatibilidade. <code>2.4.1 → 3.0.0</code> avisa a quem consome que haverá trabalho de migração.</p>",
      "<h3>2. Tags anotadas</h3><p>Use <code>git tag -a v1.4.0 -m ...</code>: a tag anotada guarda autor, data e mensagem, e pode ser assinada. Tags leves são só ponteiros.</p>",
      "<h3>3. Da tag à imagem</h3><p>Em DevOps, a tag dispara o pipeline de release: build da imagem <code>cloudshop-api:1.4.0</code>, changelog e publicação. A mesma versão identifica código, imagem e deploy — rastreabilidade de ponta a ponta.</p>",
      "<h3>4. Automatizando a versão</h3><p>Com Conventional Commits, ferramentas como release-please ou semantic-release calculam a próxima versão e geram o changelog sozinhas.</p>",
      "<h3>5. Checagem final</h3><p>Você deve saber criar e publicar uma tag anotada e explicar que tipo de mudança justifica cada incremento.</p>",
    ],
    code: [
      {
        label: "Criar e publicar release",
        language: "bash",
        code: `git tag -a v1.4.0 -m "v1.4.0: endpoint /orders"
git push origin v1.4.0
git describe --tags                  # v1.4.0-3-g1a2b3c <- 3 commits apos a tag
gh release create v1.4.0 --generate-notes`,
      },
    ],
    glossary: [
      { term: "SemVer", definition: "Versionamento semântico MAJOR.MINOR.PATCH." },
      { term: "tag anotada", definition: "Tag com metadados (autor, data, mensagem) armazenada como objeto no Git." },
      { term: "changelog", definition: "Lista das mudanças entre versões." },
    ],
    quiz: [
      { question: "Você removeu um campo obrigatório da API. Qual incremento?", options: ["PATCH", "MINOR", "MAJOR", "Nenhum"], answerIndex: 2, explanation: "Quebra de contrato exige MAJOR." },
      { question: "Por que a mesma versão na tag e na imagem?", options: ["Estética", "Rastreabilidade entre código e deploy", "Economizar disco", "Exigência do Docker"], answerIndex: 1, explanation: "Permite saber exatamente qual código está rodando." },
    ],
  },
  "l-3-4": {
    body: [
      "<h3>1. Por que set -euo pipefail</h3><ul><li><code>-e</code>: sai no primeiro comando que falhar</li><li><code>-u</code>: erro ao usar variável não definida (evita <code>rm -rf \"$DIR/\"</code> com DIR vazio)</li><li><code>-o pipefail</code>: um pipe falha se qualquer etapa falhar, não só a última</li></ul>",
      "<h3>2. Aspas sempre</h3><p><code>\"$arquivo\"</code> protege contra espaços e curingas. Sem aspas, um nome como <code>meu log.txt</code> vira dois argumentos.</p>",
      "<h3>3. Funções, argumentos e retorno</h3><p>Funções recebem <code>$1</code>, <code>$2</code>, <code>\"$@\"</code>; usam <code>local</code> para variáveis internas; retornam status com <code>return</code> e dados via <code>echo</code>.</p>",
      "<h3>4. Exit codes e trap</h3><p>0 é sucesso, qualquer outro é falha — é assim que o CI decide se o job passou. <code>trap cleanup EXIT</code> garante limpeza de arquivos temporários mesmo em erro.</p>",
      "<h3>5. Qualidade com shellcheck</h3><p>O shellcheck encontra aspas faltando, variáveis não usadas e armadilhas clássicas. Coloque-o no pipeline.</p>",
      "<h3>6. Checagem final</h3><p>Você deve escrever um script com modo estrito, validação de argumentos, log com horário, trap de limpeza e exit code correto.</p>",
    ],
    code: [
      {
        label: "Esqueleto de script profissional",
        language: "bash",
        code: `#!/usr/bin/env bash
set -euo pipefail

log() { printf '%s [%s] %s\\n' "$(date -Is)" "$1" "$2" >&2; }
usage() { echo "uso: $0 <ambiente>" >&2; exit 2; }

[[ $# -eq 1 ]] || usage
env="$1"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT          # limpa sempre, mesmo com erro

log INFO "verificando saude em $env"
if ! curl -fsS "https://api.$env.cloudshop.dev/health" > "$tmp/health.json"; then
  log ERROR "health check falhou"
  exit 1
fi
log INFO "ok"`,
      },
    ],
    glossary: [
      { term: "exit code", definition: "Número devolvido pelo processo; 0 significa sucesso." },
      { term: "trap", definition: "Comando Bash que executa uma ação ao receber sinal ou ao sair." },
      { term: "shellcheck", definition: "Analisador estático de scripts shell." },
    ],
    quiz: [
      { question: "O que -o pipefail muda?", options: ["Deixa o script mais rápido", "O pipe falha se qualquer comando dele falhar", "Ignora erros", "Ativa debug"], answerIndex: 1, explanation: "Sem pipefail, só o status do último comando conta." },
      { question: "Qual a vantagem de trap ... EXIT?", options: ["Paraleliza", "Garante limpeza ao sair, com ou sem erro", "Evita aspas", "Cria cron"], answerIndex: 1, explanation: "O trap roda sempre que o script termina." },
    ],
  },
  "l-3-5": {
    body: [
      "<h3>1. cron vs systemd timers</h3><p><strong>cron</strong> é simples e universal. <strong>systemd timers</strong> oferecem logs no journal, dependências, <code>Persistent=true</code> (roda o que perdeu se a máquina estava desligada) e <code>RandomizedDelaySec</code> para não sobrecarregar tudo ao mesmo tempo.</p>",
      "<h3>2. Lendo a sintaxe do cron</h3><p><code>minuto hora dia-do-mês mês dia-da-semana</code>. <code>30 2 * * *</code> = todo dia às 02:30. Lembre: cron roda com PATH mínimo e sem seu ambiente; use caminhos absolutos.</p>",
      "<h3>3. Idempotência e lock</h3><p>Uma tarefa agendada precisa poder rodar duas vezes sem estrago e não pode rodar em paralelo consigo mesma. <code>flock</code> resolve o segundo ponto.</p>",
      "<h3>4. Backup que vale: o restore testado</h3><p>Backup sem teste de restauração é esperança. Compacte, envie para fora do servidor (S3), aplique retenção e periodicamente restaure em outro lugar.</p>",
      "<h3>5. Observando tarefas agendadas</h3><p>Alertar quando o job <em>não</em> roda é tão importante quanto quando falha: use um 'dead man's switch' (ping para um serviço de monitoração ao fim de cada execução).</p>",
      "<h3>6. Checagem final</h3><p>Você deve criar um timer systemd com lock, logs no journal e envio do backup para fora da máquina.</p>",
    ],
    code: [
      {
        label: "Timer systemd para backup de logs",
        language: "ini",
        code: `# /etc/systemd/system/cloudshop-backup.service
[Service]
Type=oneshot
User=cloudshop
ExecStart=/usr/bin/flock -n /tmp/cloudshop-backup.lock /opt/cloudshop/bin/backup-logs.sh

# /etc/systemd/system/cloudshop-backup.timer
[Timer]
OnCalendar=*-*-* 02:30:00
Persistent=true            # executa se a maquina estava desligada no horario
RandomizedDelaySec=5m
[Install]
WantedBy=timers.target`,
      },
      {
        label: "Ativar e acompanhar",
        language: "bash",
        code: `sudo systemctl daemon-reload
sudo systemctl enable --now cloudshop-backup.timer
systemctl list-timers cloudshop-backup.timer   # proxima execucao
journalctl -u cloudshop-backup.service -n 20   # logs da ultima execucao`,
      },
    ],
    glossary: [
      { term: "systemd timer", definition: "Unidade systemd que agenda a execução de um service." },
      { term: "flock", definition: "Utilitário que impede execuções simultâneas usando um arquivo de lock." },
      { term: "dead man's switch", definition: "Alerta disparado quando um sinal periódico esperado deixa de chegar." },
    ],
    quiz: [
      { question: "Script funciona no terminal mas falha no cron. Causa comum?", options: ["Cron não suporta Bash", "PATH e ambiente mínimos no cron", "Falta de CPU", "DNS"], answerIndex: 1, explanation: "Cron não carrega seu perfil; use caminhos absolutos." },
      { question: "O que Persistent=true faz num timer?", options: ["Roda para sempre", "Executa a tarefa perdida quando a máquina volta", "Guarda logs", "Evita paralelismo"], answerIndex: 1, explanation: "Recupera execuções perdidas enquanto a máquina estava desligada." },
    ],
  },
};
