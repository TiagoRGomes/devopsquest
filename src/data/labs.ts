import type { Lab } from "@/lib/types";

const lab = (l: Lab): Lab => l;

export const LABS: Lab[] = [
  // ===== Módulo 0
  lab({
    id: "lab-0-1",
    moduleId: "mod-0",
    title: "Bancada pronta: validar as 8 ferramentas",
    goal: "Instalar e provar, por comando, que todo o arsenal do curso funciona na sua máquina.",
    professionalContext:
      "Onboarding em empresa começa exatamente assim: montar ambiente e provar que consegue rodar o projeto localmente no primeiro dia.",
    minutes: 45,
    difficulty: "Iniciante",
    prerequisites: ["Linux/WSL2 funcionando"],
    environment: "Ubuntu 24.04 (WSL2, VM ou nativo)",
    steps: [
      "Instalar Docker e adicionar seu usuário ao grupo docker",
      "Instalar Node LTS via nvm",
      "Instalar AWS CLI v2, Terraform, kubectl e Helm",
      "Registrar todas as versões em docs/ferramentas.md",
      "Rodar o script de verificação e corrigir o que falhar",
    ],
    commands: {
      label: "Script de verificação do ambiente",
      language: "bash",
      code: `#!/usr/bin/env bash
set -uo pipefail
falhas=0
check() { printf '%-12s' "$1"; if out=$($2 2>&1); then echo "OK  $(echo "$out" | head -1)"; else echo "FALHOU"; falhas=$((falhas+1)); fi; }

check docker    "docker run --rm hello-world"
check node      "node -v"
check aws       "aws --version"
check terraform "terraform -version"
check kubectl   "kubectl version --client"
check helm      "helm version --short"
check git       "git --version"
check ssh       "ssh -T git@github.com"

echo "falhas: $falhas"; exit $(( falhas > 0 ))`,
    },
    validation: ["O script termina com 'falhas: 0'", "docker roda sem sudo", "ssh -T git@github.com identifica seu usuário"],
    commonErrors: [
      { error: "permission denied em /var/run/docker.sock", fix: "sudo usermod -aG docker $USER e reabrir a sessão" },
      { error: "Permission denied (publickey)", fix: "ssh-add ~/.ssh/id_ed25519 e registrar a chave pública no GitHub" },
    ],
    solution:
      "O script deve retornar 0. Se o Docker falhar, o problema é grupo do usuário; se o SSH falhar, é chave não carregada no agente ou não registrada no GitHub. Registre no diário técnico cada erro e a correção — esse registro é o começo do seu runbook.",
    xp: 100,
  }),
  lab({
    id: "lab-0-2",
    moduleId: "mod-0",
    title: "Conta de nuvem blindada com orçamento",
    goal: "Proteger a conta AWS e garantir alerta de custo antes de criar qualquer recurso.",
    professionalContext: "Primeira tarefa de qualquer engenheiro que recebe acesso a uma conta nova de nuvem.",
    minutes: 30,
    difficulty: "Iniciante",
    prerequisites: ["Conta AWS criada", "AWS CLI instalado"],
    environment: "AWS (free tier) + AWS CLI v2",
    steps: [
      "Ativar MFA na conta raiz",
      "Criar identidade de trabalho com permissões limitadas",
      "Configurar perfil nomeado no AWS CLI",
      "Criar budget de 5 USD com alerta em 80%",
      "Confirmar recebimento do e-mail de confirmação do alerta",
    ],
    commands: {
      label: "Perfil e orçamento",
      language: "bash",
      code: `aws configure --profile cloudshop
export AWS_PROFILE=cloudshop
aws sts get-caller-identity

ACC=$(aws sts get-caller-identity --query Account --output text)
aws budgets create-budget --account-id "$ACC" \\
  --budget '{"BudgetName":"estudo","BudgetLimit":{"Amount":"5","Unit":"USD"},"TimeUnit":"MONTHLY","BudgetType":"COST"}' \\
  --notifications-with-subscribers '[{"Notification":{"NotificationType":"ACTUAL","ComparisonOperator":"GREATER_THAN","Threshold":80,"ThresholdType":"PERCENTAGE"},"Subscribers":[{"SubscriptionType":"EMAIL","Address":"voce@exemplo.com"}]}]'

aws budgets describe-budgets --account-id "$ACC" --query 'Budgets[].BudgetName'`,
      securityNote: "Guarde as credenciais raiz fora da máquina de trabalho e nunca as use no dia a dia.",
    },
    validation: ["get-caller-identity retorna a identidade de trabalho, não a raiz", "Budget aparece em describe-budgets", "MFA ativo na raiz"],
    commonErrors: [
      { error: "AccessDenied ao criar budget", fix: "A identidade precisa de permissão budgets:ModifyBudget" },
      { error: "Alerta nunca chega", fix: "Confirmar a inscrição no e-mail enviado pela AWS" },
    ],
    solution:
      "Com MFA na raiz, identidade separada e budget ativo, você elimina os dois maiores riscos de iniciante: comprometimento de conta e fatura surpresa.",
    xp: 100,
  }),
  // ===== Módulo 1
  lab({
    id: "lab-1-1",
    moduleId: "mod-1",
    title: "Runbook de 30 comandos Linux",
    goal: "Construir um documento operacional com os 30 comandos que você usará em investigação real.",
    professionalContext: "Runbook é o que permite a qualquer pessoa do plantão diagnosticar sem depender de quem escreveu o sistema.",
    minutes: 60,
    difficulty: "Iniciante",
    prerequisites: ["Aulas 1.1 a 1.5"],
    environment: "Servidor Linux ou WSL2",
    steps: [
      "Agrupar comandos por objetivo: navegação, permissões, processos, logs, recursos, rede",
      "Para cada comando, escrever o que responde e quando usar",
      "Testar todos os comandos na sua máquina",
      "Adicionar uma seção 'primeiros 5 minutos de incidente'",
      "Publicar em docs/runbook-linux.md no repositório",
    ],
    commands: {
      label: "Base do runbook: primeiros 5 minutos",
      language: "bash",
      code: `uptime                      # carga: comparar com nproc
free -h                     # memoria disponivel
df -h && df -i              # espaco e inodes
ps -eo pid,stat,pcpu,pmem,etime,cmd --sort=-pcpu | head
ss -tulpn                   # quem escuta o que
journalctl -p err --since "15 min ago" --no-pager | tail -30
systemctl --failed          # unidades com falha
du -xh --max-depth=1 /var | sort -h | tail`,
    },
    validation: ["30 comandos documentados com propósito", "Seção de incidente com ordem de investigação", "Arquivo versionado no Git"],
    commonErrors: [
      { error: "Comandos copiados sem entender", fix: "Explique cada um com uma frase própria; se não conseguir, ainda não aprendeu" },
      { error: "Runbook sem ordem de uso", fix: "Ordene por fluxo de diagnóstico, não por ordem alfabética" },
    ],
    solution:
      "Um bom runbook tem ordem de investigação (carga → memória → disco → processos → rede → logs), comandos testados e um critério de escalada.",
    xp: 100,
  }),
  lab({
    id: "lab-1-2",
    moduleId: "mod-1",
    title: "Serviço systemd resiliente a reboot e falha",
    goal: "Colocar a API do CloudShop sob systemd com usuário dedicado, restart automático e logs no journal.",
    professionalContext: "Todo serviço em VM precisa subir no boot e voltar após falha, sem intervenção humana.",
    minutes: 50,
    difficulty: "Intermediário",
    prerequisites: ["Aula 1.3"],
    environment: "Linux com systemd (WSL2 com systemd habilitado ou VM)",
    steps: [
      "Criar usuário de sistema cloudshop sem shell",
      "Criar /opt/cloudshop com dono correto e um server.js mínimo",
      "Escrever a unit com EnvironmentFile e Restart=on-failure",
      "Habilitar, iniciar e validar com status e curl",
      "Matar o processo e confirmar que ele volta sozinho",
    ],
    commands: {
      label: "Criar e testar o serviço",
      language: "bash",
      code: `sudo useradd --system --no-create-home --shell /usr/sbin/nologin cloudshop
sudo mkdir -p /opt/cloudshop /etc/cloudshop
sudo tee /opt/cloudshop/server.js >/dev/null <<'EOF'
const http = require("http");
http.createServer((req,res)=>{res.writeHead(200,{"Content-Type":"application/json"});res.end('{"status":"ok"}')})
  .listen(process.env.PORT || 3000, () => console.log("ouvindo"));
EOF
echo 'PORT=3000' | sudo tee /etc/cloudshop/app.env
sudo chmod 640 /etc/cloudshop/app.env
sudo chown -R cloudshop:cloudshop /opt/cloudshop /etc/cloudshop

sudo systemctl daemon-reload
sudo systemctl enable --now cloudshop-api
curl -s localhost:3000 && echo
sudo pkill -f 'node /opt/cloudshop/server.js'
sleep 4 && systemctl status cloudshop-api --no-pager | head -5
journalctl -u cloudshop-api -n 20 --no-pager`,
      securityNote: "app.env com 640 e dono do serviço: variáveis de ambiente não devem ser legíveis por qualquer usuário.",
    },
    validation: [
      "systemctl is-enabled retorna enabled",
      "Após matar o processo, o serviço volta em segundos",
      "journalctl mostra a saída da aplicação",
    ],
    commonErrors: [
      { error: "status=203/EXEC", fix: "Caminho do ExecStart errado; use caminho absoluto do binário (which node)" },
      { error: "Serviço em laço de reinício", fix: "Ver journalctl para o erro real e aumentar RestartSec" },
    ],
    solution:
      "Com Restart=on-failure e enable, o serviço sobrevive a falha e a reboot. A unit deve usar usuário sem privilégio e EnvironmentFile protegido.",
    xp: 100,
  }),
  lab({
    id: "lab-1-3",
    moduleId: "mod-1",
    title: "Caça ao disco cheio",
    goal: "Diagnosticar e resolver um /var em 100% sem apagar dado necessário.",
    professionalContext: "Disco cheio é um dos incidentes mais frequentes e um dos que mais assustam iniciantes.",
    minutes: 40,
    difficulty: "Intermediário",
    prerequisites: ["Aulas 1.1 e 1.4"],
    environment: "Linux com permissão sudo",
    steps: [
      "Gerar arquivos grandes para simular o problema",
      "Detectar a saturação com df e localizar o diretório com du",
      "Identificar arquivos abertos e deletados que ainda ocupam espaço",
      "Aplicar rotação de log e limpeza segura",
      "Configurar alerta preventivo em 80%",
    ],
    commands: {
      label: "Diagnóstico e correção",
      language: "bash",
      code: `sudo mkdir -p /var/log/teste && sudo fallocate -l 2G /var/log/teste/gigante.log

df -h /var
sudo du -xh --max-depth=2 /var | sort -h | tail -10
sudo lsof +L1 | head                 # arquivos deletados ainda em uso
sudo journalctl --disk-usage
sudo journalctl --vacuum-time=7d
sudo truncate -s 0 /var/log/teste/gigante.log   # preserva o inode/handle
df -h /var`,
      securityNote: "Nunca apague log de auditoria sem política de retenção definida — pode ser exigência legal.",
    },
    validation: ["/var abaixo de 80%", "Serviço continua escrevendo log normalmente", "logrotate configurado"],
    commonErrors: [
      { error: "Espaço não libera após rm", fix: "O processo mantém o handle aberto; use truncate ou reinicie o serviço" },
      { error: "Disco livre mas erro de espaço", fix: "Inodes esgotados; verifique df -i" },
    ],
    solution:
      "df localiza a partição, du o diretório, lsof +L1 explica espaço 'fantasma'. truncate resolve sem quebrar o processo e logrotate previne a reincidência.",
    xp: 100,
  }),
  // ===== Módulo 2
  lab({
    id: "lab-2-1",
    moduleId: "mod-2",
    title: "Nginx reverse proxy com TLS para a API",
    goal: "Publicar a API atrás de Nginx com HTTPS, cabeçalhos corretos e timeouts definidos.",
    professionalContext: "Configuração padrão de qualquer serviço exposto na internet.",
    minutes: 60,
    difficulty: "Intermediário",
    prerequisites: ["Aulas 2.3 a 2.5", "API rodando na 3000"],
    environment: "Linux com Nginx e certbot (ou certificado autoassinado local)",
    steps: [
      "Instalar Nginx e criar o site do CloudShop",
      "Configurar upstream, proxy_set_header e timeouts",
      "Emitir certificado (certbot ou autoassinado para laboratório)",
      "Redirecionar HTTP para HTTPS",
      "Validar cabeçalhos e tempos com curl",
    ],
    commands: {
      label: "Configurar e validar",
      language: "bash",
      code: `sudo apt install -y nginx
sudo nginx -t && sudo systemctl reload nginx

# certificado local para laboratorio
sudo openssl req -x509 -nodes -days 30 -newkey rsa:2048 \\
  -keyout /etc/ssl/private/pq.key -out /etc/ssl/certs/pq.crt -subj "/CN=localhost"

curl -kI https://localhost/health
curl -k -s -o /dev/null -w 'tls:%{time_appconnect} ttfb:%{time_starttransfer}\\n' https://localhost/health
curl -s http://localhost/health -I | head -3     # deve devolver 301
sudo tail -20 /var/log/nginx/error.log`,
    },
    validation: ["HTTPS responde 200 em /health", "HTTP redireciona com 301", "X-Forwarded-For chega à aplicação"],
    commonErrors: [
      { error: "502 Bad Gateway", fix: "Upstream não está escutando; confirme com ss -tulpn e curl direto na 3000" },
      { error: "SELinux/AppArmor bloqueando conexão", fix: "Em distros com SELinux: setsebool -P httpd_can_network_connect 1" },
    ],
    solution:
      "O proxy deve repassar Host e X-Forwarded-*, ter timeouts curtos e redirecionar HTTP. Erros no error.log indicam com precisão a causa do 5xx.",
    xp: 100,
  }),
  lab({
    id: "lab-2-2",
    moduleId: "mod-2",
    title: "Investigação de DNS e TTL",
    goal: "Diagnosticar por que uma mudança de DNS 'não propagou' e planejar a migração corretamente.",
    professionalContext: "Toda migração de infraestrutura passa por DNS; erro aqui derruba o serviço para parte dos usuários.",
    minutes: 35,
    difficulty: "Intermediário",
    prerequisites: ["Aula 2.2"],
    environment: "Qualquer máquina com dig",
    steps: [
      "Consultar o registro no resolvedor local e em um público",
      "Consultar o servidor autoritativo e comparar",
      "Identificar o TTL e calcular o tempo de propagação",
      "Documentar um plano de migração com redução prévia de TTL",
      "Validar registros TXT e NS do domínio",
    ],
    commands: {
      label: "Comparar respostas e TTL",
      language: "bash",
      code: `dig exemplo.com A +noall +answer
dig @1.1.1.1 exemplo.com +short
dig @8.8.8.8 exemplo.com +short
NS=$(dig NS exemplo.com +short | head -1)
dig @"$NS" exemplo.com +noall +answer      # autoritativo
dig +trace exemplo.com | tail -15
dig TXT exemplo.com +short`,
    },
    validation: [
      "Você identifica se a diferença é cache ou configuração",
      "TTL documentado e plano de migração escrito",
      "Resposta autoritativa comparada com a do resolvedor",
    ],
    commonErrors: [
      { error: "Comparar apenas o resolvedor local", fix: "Sempre consultar o autoritativo para saber a verdade atual" },
      { error: "Migrar com TTL alto", fix: "Reduzir para 60s algumas horas antes e restaurar depois" },
    ],
    solution:
      "Se o autoritativo já responde o novo IP e os resolvedores não, é cache: aguardar o TTL. Se o autoritativo responde o antigo, o registro não foi salvo.",
    xp: 100,
  }),
  lab({
    id: "lab-2-3",
    moduleId: "mod-2",
    title: "Medir latência por fase com curl",
    goal: "Separar DNS, conexão, TLS e processamento para dizer exatamente onde está a lentidão.",
    professionalContext: "Transformar 'está lento' em número por fase é o que permite corrigir o gargalo certo.",
    minutes: 30,
    difficulty: "Iniciante",
    prerequisites: ["Aula 2.3"],
    environment: "Qualquer máquina com curl",
    steps: [
      "Criar um formato de saída com tempos por fase",
      "Medir 20 requisições e calcular média e máximo",
      "Comparar acesso pelo proxy e direto no upstream",
      "Registrar o resultado no diário técnico",
    ],
    commands: {
      label: "Medição repetida",
      language: "bash",
      code: `FMT='dns:%{time_namelookup} conn:%{time_connect} tls:%{time_appconnect} ttfb:%{time_starttransfer} total:%{time_total}\\n'
for i in $(seq 1 20); do curl -s -o /dev/null -w "$FMT" https://api.cloudshop.dev/health; done | tee /tmp/lat.txt

awk -F'total:' '{print $2}' /tmp/lat.txt | sort -n | awk '{a[NR]=$1} END{print "mediana:",a[int(NR/2)],"max:",a[NR]}'`,
    },
    validation: ["Você sabe qual fase domina o tempo total", "Comparação proxy versus upstream registrada"],
    commonErrors: [
      { error: "Uma única medição", fix: "Medir várias vezes; variação isolada engana" },
      { error: "Medir com cache do navegador", fix: "Usar curl, sem cache e sem extensões" },
    ],
    solution:
      "TLS alto sugere handshake/certificado; TTFB alto sugere processamento ou banco; DNS alto sugere resolvedor ruim ou TTL curto demais.",
    xp: 100,
  }),
  // ===== Módulo 3
  lab({
    id: "lab-3-1",
    moduleId: "mod-3",
    title: "Conflito de merge resolvido com segurança",
    goal: "Criar, diagnosticar e resolver um conflito real, validando o resultado.",
    professionalContext: "Conflito acontece toda semana em time; resolver mal introduz bug silencioso.",
    minutes: 40,
    difficulty: "Intermediário",
    prerequisites: ["Aulas 3.1 e 3.2"],
    environment: "Repositório Git local",
    steps: [
      "Criar duas branches que alteram a mesma linha",
      "Tentar o rebase e observar o conflito",
      "Resolver escolhendo o resultado correto (não apenas um lado)",
      "Rodar os testes e concluir o rebase",
      "Documentar a decisão no corpo do commit",
    ],
    commands: {
      label: "Reproduzir e resolver",
      language: "bash",
      code: `git init lab-conflito && cd lab-conflito
echo "timeout=5" > config.env && git add . && git commit -m "chore: config inicial"

git switch -c feat/a && echo "timeout=15" > config.env && git commit -am "feat: timeout 15"
git switch main && echo "timeout=30" > config.env && git commit -am "feat: timeout 30"

git switch feat/a && git rebase main       # conflito
git status
# editar config.env com o valor correto e remover marcadores
git add config.env && git rebase --continue
git log --oneline --graph -5`,
    },
    validation: ["Nenhum marcador <<<<<<< restante", "Testes passam após a resolução", "Histórico linear e legível"],
    commonErrors: [
      { error: "Aceitar 'ours' ou 'theirs' cegamente", fix: "Ler as duas mudanças e decidir o valor correto" },
      { error: "Esquecer marcadores no arquivo", fix: "grep -rn '<<<<<<<' antes de commitar" },
    ],
    solution:
      "A resolução correta às vezes é um terceiro valor. Depois de resolver, sempre rode os testes: conflito mal resolvido compila e quebra em produção.",
    xp: 100,
  }),
  lab({
    id: "lab-3-2",
    moduleId: "mod-3",
    title: "Health-check em Bash com retry e exit codes",
    goal: "Escrever um script robusto que outros processos possam usar para decidir.",
    professionalContext: "Scripts de verificação alimentam cron, systemd, pipelines e alertas.",
    minutes: 45,
    difficulty: "Intermediário",
    prerequisites: ["Aula 3.4"],
    environment: "Bash 5 + curl + shellcheck",
    steps: [
      "Escrever o script com set -euo pipefail, trap e log em stderr",
      "Implementar 3 tentativas com backoff",
      "Retornar códigos distintos por tipo de falha",
      "Passar por shellcheck sem avisos",
      "Testar contra uma URL válida e uma inválida",
    ],
    commands: {
      label: "Testar o script",
      language: "bash",
      code: `shellcheck scripts/health-check.sh
./scripts/health-check.sh https://api.cloudshop.dev/health; echo "exit=$?"
./scripts/health-check.sh https://localhost:9999/health; echo "exit=$?"
TIMEOUT=1 ./scripts/health-check.sh https://api.cloudshop.dev/health; echo "exit=$?"`,
    },
    validation: ["exit 0 no caminho felizardo", "exit 3 quando o serviço não responde", "shellcheck sem avisos"],
    commonErrors: [
      { error: "Script retorna 0 mesmo em falha", fix: "Garanta exit explícito em cada caminho" },
      { error: "Variável não citada quebrando com espaço", fix: 'Sempre use "$var"' },
    ],
    solution:
      "Códigos de saída distintos permitem que a automação diferencie 'dependência ausente' de 'serviço fora', o que muda a ação tomada.",
    xp: 100,
  }),
  lab({
    id: "lab-3-3",
    moduleId: "mod-3",
    title: "Backup de logs com retenção e restauração testada",
    goal: "Automatizar backup diário e provar que a restauração funciona.",
    professionalContext: "Backup não testado não é backup — é esperança.",
    minutes: 45,
    difficulty: "Intermediário",
    prerequisites: ["Aula 3.5"],
    environment: "Linux com systemd",
    steps: [
      "Escrever o script de backup com validação de integridade",
      "Aplicar retenção de 14 dias",
      "Criar service e timer systemd",
      "Executar restauração em diretório temporário",
      "Documentar o procedimento no runbook",
    ],
    commands: {
      label: "Backup, agendamento e restauração",
      language: "bash",
      code: `sudo install -m 0755 scripts/backup-logs.sh /usr/local/bin/backup-logs.sh
sudo systemctl enable --now cloudshop-backup.timer
systemctl list-timers | grep cloudshop
sudo systemctl start cloudshop-backup.service
journalctl -u cloudshop-backup -n 20 --no-pager

# restauracao de teste
mkdir -p /tmp/restore && tar -xzf /var/backups/cloudshop/$(ls -t /var/backups/cloudshop | head -1) -C /tmp/restore
ls -la /tmp/restore | head`,
      securityNote: "Diretório de backup com permissão 700: logs podem conter dado pessoal.",
    },
    validation: ["Arquivo .tar.gz válido gerado", "Restauração recupera os arquivos", "Arquivos com mais de 14 dias removidos"],
    commonErrors: [
      { error: "tar falha por caminho absoluto", fix: "Use tar -C diretório . para caminhos relativos" },
      { error: "Timer não dispara", fix: "Verificar OnCalendar e Persistent, e usar systemctl list-timers" },
    ],
    solution:
      "O ciclo completo é: gerar, validar integridade, aplicar retenção, agendar e restaurar em teste. Sem a restauração, o laboratório não está concluído.",
    xp: 100,
  }),
  // ===== Módulo 4
  lab({
    id: "lab-4-1",
    moduleId: "mod-4",
    title: "Stack CloudShop completo com Docker Compose",
    goal: "Subir Vue + API Node + PostgreSQL com healthchecks e persistência em um comando.",
    professionalContext: "Ambiente de desenvolvimento reproduzível é entrega padrão de quem cuida de plataforma.",
    minutes: 75,
    difficulty: "Intermediário",
    prerequisites: ["Aulas 4.1 a 4.4"],
    environment: "Docker Engine + Compose v2",
    steps: [
      "Escrever Dockerfiles de web e api com multi-stage",
      "Declarar os três serviços, redes e volume no Compose",
      "Adicionar healthcheck no banco e na API com depends_on condicionado",
      "Subir, validar conectividade e persistência",
      "Reiniciar tudo e confirmar que os dados permanecem",
    ],
    commands: {
      label: "Subir e validar",
      language: "bash",
      code: `docker compose config >/dev/null && echo "compose valido"
docker compose up -d --build
docker compose ps
docker compose exec api sh -c 'getent hosts db && wget -qO- http://127.0.0.1:3000/health'
docker compose exec db psql -U cloudshop -d cloudshop -c 'select 1;'

# persistencia
docker compose exec db psql -U cloudshop -d cloudshop -c "create table if not exists t(id int); insert into t values (1);"
docker compose down && docker compose up -d
docker compose exec db psql -U cloudshop -d cloudshop -c "select count(*) from t;"`,
    },
    validation: ["Três serviços healthy", "API resolve o banco pelo nome do serviço", "Dados sobrevivem a down/up"],
    commonErrors: [
      { error: "ECONNREFUSED 127.0.0.1:5432", fix: "Use DATABASE_HOST=db; localhost é o próprio container" },
      { error: "API reinicia antes do banco subir", fix: "healthcheck no db + condition: service_healthy" },
    ],
    solution:
      "Com healthcheck e depends_on condicionado, a ordem de inicialização deixa de ser sorte. Volume nomeado garante a persistência entre recriações.",
    xp: 100,
  }),
  lab({
    id: "lab-4-2",
    moduleId: "mod-4",
    title: "Reduzir a imagem de 1,2 GB para menos de 200 MB",
    goal: "Aplicar multi-stage, base enxuta e .dockerignore medindo o resultado.",
    professionalContext: "Imagem menor reduz tempo de pipeline, custo de registry e superfície de ataque.",
    minutes: 50,
    difficulty: "Avançado",
    prerequisites: ["Aulas 4.2 e 4.5"],
    environment: "Docker com BuildKit",
    steps: [
      "Medir a imagem atual e listar as maiores layers",
      "Adicionar .dockerignore e reordenar o Dockerfile",
      "Separar build de runtime com multi-stage",
      "Trocar para base alpine/slim e remover devDependencies",
      "Comparar tamanho e tempo de build antes e depois",
    ],
    commands: {
      label: "Medir e otimizar",
      language: "bash",
      code: `docker images cloudshop-api --format '{{.Tag}}\\t{{.Size}}'
docker history cloudshop-api:antes --human --format '{{.Size}}\\t{{.CreatedBy}}' | head -10

DOCKER_BUILDKIT=1 docker build -t cloudshop-api:depois ./api
docker images | grep cloudshop-api

# validar que continua funcionando
docker run --rm -d --name t -p 3001:3000 cloudshop-api:depois
sleep 2 && curl -s localhost:3001/health && docker rm -f t
trivy image --severity HIGH,CRITICAL cloudshop-api:depois | tail -5`,
    },
    validation: ["Imagem final abaixo de 200 MB", "Aplicação continua respondendo", "Nenhuma vulnerabilidade crítica com correção disponível"],
    commonErrors: [
      { error: "npm ci falha no estágio de runtime", fix: "Copie node_modules do estágio de deps em vez de reinstalar" },
      { error: "Binário nativo quebra no Alpine", fix: "Use a variante slim de Debian ou compile no mesmo ambiente" },
    ],
    solution:
      "Ganhos vêm de três lugares: contexto de build limpo, dependências de produção apenas e base mínima. Meça sempre antes e depois.",
    xp: 100,
  }),
  lab({
    id: "lab-4-3",
    moduleId: "mod-4",
    title: "Endurecer o container: não-root, read-only e limites",
    goal: "Rodar a aplicação sem privilégios, com filesystem somente leitura e recursos limitados.",
    professionalContext: "Exigência de qualquer checklist de segurança em ambiente corporativo.",
    minutes: 40,
    difficulty: "Avançado",
    prerequisites: ["Aula 4.5"],
    environment: "Docker Engine",
    steps: [
      "Criar usuário no Dockerfile e ajustar propriedade dos arquivos",
      "Rodar com --read-only e tmpfs nos caminhos que precisam escrever",
      "Descartar capabilities e impedir escalonamento de privilégio",
      "Definir limites de memória e CPU",
      "Confirmar o comportamento com testes",
    ],
    commands: {
      label: "Execução endurecida e verificação",
      language: "bash",
      code: `docker run -d --name api-hard \\
  --user 10001:10001 --read-only --tmpfs /tmp \\
  --cap-drop ALL --security-opt no-new-privileges \\
  --memory 256m --cpus 0.5 -p 3002:3000 cloudshop-api:depois

docker exec api-hard id
docker exec api-hard sh -c 'touch /app/teste' || echo "filesystem read-only confirmado"
docker inspect api-hard --format '{{.HostConfig.Memory}} {{.HostConfig.ReadonlyRootfs}} {{.HostConfig.CapDrop}}'
docker stats --no-stream api-hard`,
      securityNote: "Se a aplicação precisa escrever, monte tmpfs apenas nos caminhos necessários — nunca remova o read-only inteiro.",
    },
    validation: ["id mostra usuário não-root", "Escrita no filesystem falha", "Limites aparecem em docker inspect"],
    commonErrors: [
      { error: "Aplicação falha por não conseguir escrever cache", fix: "Monte tmpfs no diretório específico" },
      { error: "EACCES ao ler arquivos da imagem", fix: "COPY --chown para o usuário da aplicação" },
    ],
    solution:
      "Não-root + read-only + cap-drop ALL + limites é a configuração base. Cada exceção deve ser justificada e mínima.",
    xp: 100,
  }),
  // ===== Módulo 5
  lab({
    id: "lab-5-1",
    moduleId: "mod-5",
    title: "CI completo em PR: lint, testes e build",
    goal: "Impedir merge de código que não passa em qualidade, em menos de cinco minutos.",
    professionalContext: "Padrão mínimo de qualquer time que entrega várias vezes por semana.",
    minutes: 60,
    difficulty: "Intermediário",
    prerequisites: ["Aulas 5.1 e 5.2"],
    environment: "Repositório no GitHub",
    steps: [
      "Criar .github/workflows/ci.yml com jobs de qualidade",
      "Adicionar cache de dependências e concurrency",
      "Configurar branch protection exigindo o check",
      "Abrir um PR que falha de propósito e observar o bloqueio",
      "Corrigir e confirmar o merge liberado",
    ],
    commands: {
      label: "Validar o CI",
      language: "bash",
      code: `gh workflow list
gh pr create --fill --base main
gh pr checks --watch
gh run view --log-failed | head -40
gh api repos/:owner/:repo/branches/main/protection --jq '.required_status_checks.contexts'`,
    },
    validation: ["PR com erro é bloqueado", "Pipeline abaixo de 5 minutos", "Cache reduz o tempo na segunda execução"],
    commonErrors: [
      { error: "Cache nunca é reaproveitado", fix: "Chave baseada no hash do lockfile" },
      { error: "Check não aparece na proteção", fix: "O workflow precisa rodar uma vez para o contexto existir" },
    ],
    solution:
      "Verde obrigatório para merge é o que dá confiança ao time. Meça a duração e trate lentidão como bug.",
    xp: 100,
  }),
  lab({
    id: "lab-5-2",
    moduleId: "mod-5",
    title: "Publicar imagem no GHCR com tag imutável",
    goal: "Gerar imagem versionada com metadados e registrar o digest.",
    professionalContext: "Rastreabilidade entre commit, imagem e o que roda em produção.",
    minutes: 50,
    difficulty: "Avançado",
    prerequisites: ["Aulas 5.4 e 4.2"],
    environment: "GitHub Actions + GHCR",
    steps: [
      "Adicionar login, metadata e build-push ao workflow",
      "Criar a tag v0.1.0 e disparar o workflow",
      "Conferir as tags publicadas no pacote",
      "Registrar o digest no arquivo de release",
      "Puxar a imagem localmente pelo digest e rodar",
    ],
    commands: {
      label: "Publicar e verificar",
      language: "bash",
      code: `git tag -a v0.1.0 -m "primeira imagem" && git push origin v0.1.0
gh run watch

docker pull ghcr.io/tiago/cloudshop/api:0.1.0
docker inspect --format '{{index .RepoDigests 0}}' ghcr.io/tiago/cloudshop/api:0.1.0
docker run --rm -d -p 3003:3000 ghcr.io/tiago/cloudshop/api@sha256:<digest>
curl -s localhost:3003/health`,
    },
    validation: ["Tag semântica e tag por SHA publicadas", "Digest registrado no repositório", "Imagem roda a partir do digest"],
    commonErrors: [
      { error: "denied: permission_denied ao push", fix: "Adicionar packages: write nas permissions do job" },
      { error: "Tag latest sobrescrita em produção", fix: "Nunca usar latest para deploy; sempre versão ou digest" },
    ],
    solution:
      "A saída do CI deve ser um artefato identificável por versão e digest, com labels que apontam para o commit de origem.",
    xp: 100,
  }),
  lab({
    id: "lab-5-3",
    moduleId: "mod-5",
    title: "Rollback automático em falha de saúde",
    goal: "Fazer o pipeline reverter sozinho quando o deploy não fica saudável.",
    professionalContext: "Reduz o tempo de restauração de dezenas de minutos para poucos.",
    minutes: 55,
    difficulty: "Avançado",
    prerequisites: ["Aula 5.5"],
    environment: "GitHub Actions + ambiente de teste",
    steps: [
      "Registrar a versão atual antes de aplicar a nova",
      "Aplicar a nova versão e rodar verificação de saúde",
      "Reverter automaticamente em caso de falha",
      "Provocar uma falha intencional e medir o tempo de restauração",
      "Documentar o RTO medido no README",
    ],
    commands: {
      label: "Testar o caminho de falha",
      language: "bash",
      code: `gh workflow run deploy-e-rollback.yml -f versao=v0.1.0 -f acao=deploy
gh run watch

# versao intencionalmente quebrada
gh workflow run deploy-e-rollback.yml -f versao=v0.0.0-broken -f acao=deploy
gh run view --log | grep -E "rollback|health"
curl -s -o /dev/null -w '%{http_code}\\n' https://api.cloudshop.dev/health`,
    },
    validation: ["Deploy ruim é revertido automaticamente", "Serviço volta a responder 200", "Tempo de restauração registrado"],
    commonErrors: [
      { error: "Rollback não roda", fix: "Adicionar if: failure() no step de reversão" },
      { error: "Health-check passa cedo demais", fix: "Aguardar readiness e repetir a verificação com backoff" },
    ],
    solution:
      "Verificação pós-deploy com rollback automático é o mecanismo mais barato para proteger produção. Meça e publique o RTO.",
    xp: 100,
  }),
  // ===== Módulo 6
  lab({
    id: "lab-6-1",
    moduleId: "mod-6",
    title: "VPC do CloudShop com subnets pública e privada",
    goal: "Construir a rede completa e provar que a subnet privada não é alcançável de fora.",
    professionalContext: "Base de qualquer ambiente de nuvem auditável.",
    minutes: 70,
    difficulty: "Avançado",
    prerequisites: ["Aulas 6.2 e 6.3"],
    environment: "AWS (atenção ao custo do NAT)",
    steps: [
      "Criar VPC 10.20.0.0/16 com tags",
      "Criar subnets pública e privada em duas AZs",
      "Anexar IGW e configurar route tables",
      "Criar SGs referenciando um ao outro",
      "Provar isolamento e destruir tudo ao final",
    ],
    commands: {
      label: "Validar isolamento e destruir",
      language: "bash",
      code: `aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC_ID" \\
  --query 'RouteTables[].{RT:RouteTableId,Rotas:Routes[].GatewayId}'

# instancia privada nao deve ter IP publico
aws ec2 describe-instances --filters "Name=tag:env,Values=dev" \\
  --query 'Reservations[].Instances[].{ID:InstanceId,Publico:PublicIpAddress,Subnet:SubnetId}'

# destruicao (ordem importa)
aws ec2 terminate-instances --instance-ids "$INSTANCE_ID"
aws ec2 delete-nat-gateway --nat-gateway-id "$NAT_ID"
aws ec2 detach-internet-gateway --internet-gateway-id "$IGW" --vpc-id "$VPC_ID"
aws ec2 delete-internet-gateway --internet-gateway-id "$IGW"
aws ec2 delete-subnet --subnet-id "$PUB" && aws ec2 delete-subnet --subnet-id "$PRIV"
aws ec2 delete-vpc --vpc-id "$VPC_ID"`,
      securityNote: "Confirme no console que nada sobrou: NAT e IP elástico continuam cobrando após o laboratório.",
    },
    validation: ["Instância privada sem IP público", "Rota para IGW só na route table pública", "Conta sem recursos remanescentes"],
    commonErrors: [
      { error: "DependencyViolation ao apagar a VPC", fix: "Remover na ordem: instâncias, NAT, ENIs, subnets, IGW, VPC" },
      { error: "Fatura com NAT esquecido", fix: "Checar describe-nat-gateways e addresses ao final de todo laboratório" },
    ],
    solution:
      "Subnet privada + SG referenciando SG é a base do isolamento. E a disciplina de destruição é parte do exercício, não um extra.",
    xp: 100,
  }),
  lab({
    id: "lab-6-2",
    moduleId: "mod-6",
    title: "Frontend no S3 com CloudFront e bucket privado",
    goal: "Publicar o site com HTTPS e CDN sem tornar o bucket público.",
    professionalContext: "Arquitetura padrão e mais econômica para SPA em produção.",
    minutes: 60,
    difficulty: "Intermediário",
    prerequisites: ["Aula 6.4"],
    environment: "AWS S3 + CloudFront",
    steps: [
      "Criar bucket privado com criptografia e bloqueio de acesso público",
      "Publicar o build do Vue",
      "Criar distribuição CloudFront com OAC",
      "Ajustar cache e página de erro para SPA",
      "Validar HTTPS e invalidação de cache",
    ],
    commands: {
      label: "Publicar e validar",
      language: "bash",
      code: `npm run build
aws s3 sync ./dist s3://cloudshop-web-dev --delete
aws s3api get-public-access-block --bucket cloudshop-web-dev

curl -I https://d111111abcdef8.cloudfront.net
aws cloudfront create-invalidation --distribution-id E123456 --paths "/*"
curl -s -o /dev/null -w '%{http_code} %{time_total}\\n' https://d111111abcdef8.cloudfront.net/index.html`,
    },
    validation: ["Acesso direto ao bucket retorna 403", "CloudFront serve o site com HTTPS", "Rota do SPA funciona após refresh"],
    commonErrors: [
      { error: "403 no CloudFront", fix: "Bucket policy precisa permitir o OAC da distribuição" },
      { error: "404 ao recarregar rota do SPA", fix: "Configurar resposta de erro 404 para /index.html com status 200" },
    ],
    solution:
      "Bucket privado + OAC entrega segurança e desempenho. Cache longo para assets com hash e curto para index.html.",
    xp: 100,
  }),
  lab({
    id: "lab-6-3",
    moduleId: "mod-6",
    title: "RDS privado com segredo gerenciado e backup testado",
    goal: "Subir PostgreSQL gerenciado sem acesso público e restaurar um backup.",
    professionalContext: "Banco é o recurso mais crítico; backup não testado é o erro mais caro.",
    minutes: 65,
    difficulty: "Avançado",
    prerequisites: ["Aulas 6.3 e 6.4"],
    environment: "AWS RDS (db.t4g.micro)",
    steps: [
      "Criar subnet group com as subnets privadas",
      "Criar instância com senha gerenciada e sem acesso público",
      "Conectar via bastion/túnel e criar dado de teste",
      "Restaurar um snapshot em nova instância e validar o dado",
      "Destruir ambas as instâncias",
    ],
    commands: {
      label: "Criar, testar e restaurar",
      language: "bash",
      code: `aws rds describe-db-instances --db-instance-identifier cloudshop-dev \\
  --query 'DBInstances[0].{Publico:PubliclyAccessible,Backup:BackupRetentionPeriod,Cripto:StorageEncrypted}'

aws secretsmanager get-secret-value --secret-id "$SECRET_ARN" --query SecretString --output text | jq -r .password | head -c0

ssh -L 5432:cloudshop-dev.xxxx.us-east-1.rds.amazonaws.com:5432 bastion
psql -h localhost -U cloudshop -d cloudshop -c "create table pedido(id serial); insert into pedido default values;"

aws rds create-db-snapshot --db-instance-identifier cloudshop-dev --db-snapshot-identifier pq-teste
aws rds restore-db-instance-from-db-snapshot --db-instance-identifier cloudshop-restore --db-snapshot-identifier pq-teste`,
      securityNote: "Nunca imprima a senha do banco no terminal ou em log de pipeline.",
    },
    validation: ["PubliclyAccessible = false", "Backup com retenção maior que zero", "Dado presente na instância restaurada"],
    commonErrors: [
      { error: "Timeout ao conectar", fix: "SG do RDS deve permitir a origem correta; use referência de SG" },
      { error: "Restauração sem os dados esperados", fix: "Snapshot criado antes da escrita; verifique o horário" },
    ],
    solution:
      "Banco privado, senha em cofre, backup com retenção e restauração comprovada. Só assim o ambiente pode ser chamado de pronto.",
    xp: 100,
  }),
  // ===== Módulo 7
  lab({
    id: "lab-7-1",
    moduleId: "mod-7",
    title: "Terraform com state remoto e dois ambientes",
    goal: "Provisionar dev e staging com o mesmo módulo e state em S3 com lock.",
    professionalContext: "Como times reais gerenciam múltiplos ambientes sem duplicar código.",
    minutes: 80,
    difficulty: "Avançado",
    prerequisites: ["Aulas 7.1 a 7.3"],
    environment: "AWS + Terraform 1.9+",
    steps: [
      "Criar o bucket de state com versionamento e criptografia",
      "Configurar backend S3 com lock nos dois ambientes",
      "Extrair o módulo de rede e consumi-lo em dev e staging",
      "Aplicar dev, conferir plano limpo e aplicar staging",
      "Destruir ambos e verificar que o state ficou consistente",
    ],
    commands: {
      label: "Fluxo dos dois ambientes",
      language: "bash",
      code: `aws s3api create-bucket --bucket cloudshop-tfstate
aws s3api put-bucket-versioning --bucket cloudshop-tfstate --versioning-configuration Status=Enabled

cd infra/envs/dev && terraform init && terraform plan -out=p && terraform apply p
terraform plan -detailed-exitcode; echo "exit=$?"     # esperado 0

cd ../staging && terraform init && terraform apply -auto-approve
terraform state list
terraform output -json | jq

cd ../dev && terraform destroy -auto-approve
cd ../staging && terraform destroy -auto-approve`,
      securityNote: "O bucket de state guarda dados sensíveis: bloqueie acesso público e restrinja por role.",
    },
    validation: ["State no S3, não local", "plan retorna exit 0 após apply", "Módulo reutilizado pelos dois ambientes"],
    commonErrors: [
      { error: "Error acquiring the state lock", fix: "Outra execução em andamento; aguarde ou force-unlock com cuidado" },
      { error: "Recursos duplicados entre ambientes", fix: "Nomes derivados de var.env em todos os recursos" },
    ],
    solution:
      "Um módulo, dois tfvars, dois states. Plano limpo depois do apply é a prova de que código e realidade convergiram.",
    xp: 100,
  }),
  lab({
    id: "lab-7-2",
    moduleId: "mod-7",
    title: "Provocar e resolver drift de Terraform",
    goal: "Alterar um recurso pelo console, detectar a divergência e reconciliar.",
    professionalContext: "Drift acontece em toda empresa após correção emergencial no console.",
    minutes: 50,
    difficulty: "Avançado",
    prerequisites: ["Aula 7.3"],
    environment: "AWS + Terraform",
    steps: [
      "Aplicar a infraestrutura e confirmar plano limpo",
      "Alterar uma tag ou regra de SG manualmente pela CLI",
      "Detectar a divergência com plan -detailed-exitcode",
      "Decidir: refletir no código ou reverter para o desejado",
      "Configurar o job agendado de detecção de drift",
    ],
    commands: {
      label: "Criar e detectar o drift",
      language: "bash",
      code: `terraform plan -detailed-exitcode; echo "antes=$?"

aws ec2 create-tags --resources "$VPC_ID" --tags Key=owner,Value=alguem-fez-na-mao
aws ec2 authorize-security-group-ingress --group-id "$SG_APP" --protocol tcp --port 22 --cidr 0.0.0.0/0

terraform plan -detailed-exitcode; echo "depois=$?"   # esperado 2
terraform plan | grep -E '^\\s+[~+-]' | head -20
terraform apply -auto-approve      # reconcilia com o codigo
terraform plan -detailed-exitcode; echo "final=$?"    # esperado 0`,
      securityNote: "A regra de SSH aberta criada no exercício deve ser removida imediatamente após o teste.",
    },
    validation: ["plan retorna 2 após a alteração manual", "Apply reconcilia e volta a 0", "Job agendado de drift criado"],
    commonErrors: [
      { error: "Apply desfaz uma correção urgente legítima", fix: "Refletir a correção no código primeiro; depois aplicar" },
      { error: "Drift constante em campo gerenciado por outro sistema", fix: "Usar lifecycle ignore_changes para o atributo específico" },
    ],
    solution:
      "Drift se resolve por decisão explícita: ou o código passa a refletir a realidade, ou a realidade volta ao código. Nunca ignorando.",
    xp: 100,
  }),
  lab({
    id: "lab-7-3",
    moduleId: "mod-7",
    title: "Playbook Ansible idempotente para o host da API",
    goal: "Configurar o host inteiro por playbook, provando idempotência.",
    professionalContext: "Configuração reproduzível de frota de VMs, sem passos manuais.",
    minutes: 60,
    difficulty: "Intermediário",
    prerequisites: ["Aula 7.4"],
    environment: "Ansible + host Linux acessível por SSH",
    steps: [
      "Escrever o inventário e testar conectividade",
      "Criar tasks de pacotes, usuário, diretórios, Nginx e firewall",
      "Usar template Jinja2 e handler de reload",
      "Executar com --check --diff e depois aplicar",
      "Aplicar novamente e confirmar changed=0",
    ],
    commands: {
      label: "Aplicar e provar idempotência",
      language: "bash",
      code: `ansible all -i inventory.ini -m ping
ansible-lint site.yml
ansible-playbook -i inventory.ini site.yml --check --diff
ansible-playbook -i inventory.ini site.yml | tail -5
ansible-playbook -i inventory.ini site.yml | grep -E 'changed=[0-9]+'   # deve ser changed=0`,
    },
    validation: ["Segunda execução com changed=0", "Serviço rodando e firewall configurado", "ansible-lint sem erros"],
    commonErrors: [
      { error: "changed sempre maior que 0", fix: "Substituir shell/command por módulos declarativos ou usar creates/changed_when" },
      { error: "Handler não dispara", fix: "Verificar o notify e o nome exato do handler" },
    ],
    solution:
      "Idempotência é o teste objetivo do playbook: se a segunda execução muda algo, existe uma task imperativa a corrigir.",
    xp: 100,
  }),
  // ===== Módulo 8
  lab({
    id: "lab-8-1",
    moduleId: "mod-8",
    title: "CloudShop no Kubernetes (Kind) de ponta a ponta",
    goal: "Rodar web, API e banco no cluster com Service, Ingress e Secret.",
    professionalContext: "Migração de Compose para Kubernetes é tarefa recorrente em empresas em transição.",
    minutes: 90,
    difficulty: "Avançado",
    prerequisites: ["Aulas 8.1 a 8.3"],
    environment: "Kind + kubectl + ingress-nginx",
    steps: [
      "Criar o cluster Kind com mapeamento de portas",
      "Instalar o ingress controller",
      "Aplicar Deployments, Services, ConfigMap e Secret",
      "Criar o Ingress com rotas / e /api",
      "Validar acesso externo e verificar endpoints",
    ],
    commands: {
      label: "Subir e validar",
      language: "bash",
      code: `kind create cluster --name cloudshop --config kind.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl -n ingress-nginx wait --for=condition=ready pod -l app.kubernetes.io/component=controller --timeout=180s

kubectl create namespace cloudshop
kubectl -n cloudshop create secret generic cloudshop-db --from-literal=password="$(openssl rand -base64 24)"
kubectl -n cloudshop apply -f k8s/
kubectl -n cloudshop get pods,svc,ingress
kubectl -n cloudshop get endpoints
curl -H "Host: cloudshop.dev" http://localhost/api/health`,
      securityNote: "Secret criado por comando não fica no Git — no módulo 9 ele passa a vir do cofre.",
    },
    validation: ["Todos os pods Running e Ready", "Endpoints preenchidos em cada Service", "curl pelo Ingress retorna 200"],
    commonErrors: [
      { error: "ImagePullBackOff", fix: "Imagem inexistente ou registry privado sem imagePullSecret; use kind load docker-image" },
      { error: "Endpoints vazios", fix: "Selector do Service diferente das labels do pod" },
    ],
    solution:
      "A ordem é: pods prontos → endpoints preenchidos → Ingress roteando. Cada etapa tem um comando de verificação próprio.",
    xp: 100,
  }),
  lab({
    id: "lab-8-2",
    moduleId: "mod-8",
    title: "Probes e limites contra falso incidente",
    goal: "Configurar probes corretas e observar OOMKilled na prática.",
    professionalContext: "Probes e limites malfeitos causam instabilidade recorrente em clusters reais.",
    minutes: 60,
    difficulty: "Avançado",
    prerequisites: ["Aula 8.4"],
    environment: "Kind + metrics-server",
    steps: [
      "Definir limite de memória baixo e provocar OOMKilled",
      "Confirmar a causa em describe e lastState",
      "Ajustar o limite com base no consumo real",
      "Configurar startup, liveness e readiness corretamente",
      "Testar que readiness impede tráfego durante a inicialização",
    ],
    commands: {
      label: "Provocar e diagnosticar",
      language: "bash",
      code: `kubectl -n cloudshop set resources deploy/cloudshop-api --limits=memory=32Mi
kubectl -n cloudshop get pods -w | head -10
kubectl -n cloudshop describe pod -l component=api | grep -A6 'Last State'
kubectl -n cloudshop get pod -l component=api -o jsonpath='{.items[0].status.containerStatuses[0].lastState.terminated.reason}'

kubectl top pods -n cloudshop
kubectl -n cloudshop set resources deploy/cloudshop-api --requests=memory=128Mi --limits=memory=256Mi
kubectl -n cloudshop rollout status deploy/cloudshop-api`,
    },
    validation: ["OOMKilled reproduzido e explicado", "Limite ajustado com base em kubectl top", "Sem tráfego antes de Ready"],
    commonErrors: [
      { error: "Reinício em laço após ajuste", fix: "Liveness agressiva; use startupProbe para inicialização lenta" },
      { error: "kubectl top sem dados", fix: "Instalar metrics-server no cluster" },
    ],
    solution:
      "OOMKilled aparece em lastState.terminated.reason. A correção é medir com top e dimensionar, não simplesmente remover o limite.",
    xp: 100,
  }),
  lab({
    id: "lab-8-3",
    moduleId: "mod-8",
    title: "Chart Helm com rollback comprovado",
    goal: "Empacotar o CloudShop, implantar duas versões e reverter.",
    professionalContext: "Rollback treinado é o que dá coragem para implantar com frequência.",
    minutes: 70,
    difficulty: "Avançado",
    prerequisites: ["Aula 8.5"],
    environment: "Kind + Helm 3",
    steps: [
      "Criar o chart com values por ambiente",
      "Instalar a versão 1 com --atomic --wait",
      "Fazer upgrade para uma versão quebrada e observar o comportamento",
      "Executar helm rollback e validar a restauração",
      "Documentar o tempo de rollback",
    ],
    commands: {
      label: "Ciclo completo",
      language: "bash",
      code: `helm lint charts/cloudshop
helm upgrade --install cloudshop charts/cloudshop -n cloudshop \\
  --set image.tag=v0.1.0 --atomic --wait --timeout 3m

helm history cloudshop -n cloudshop
helm upgrade cloudshop charts/cloudshop -n cloudshop --set image.tag=nao-existe --wait --timeout 90s || echo "upgrade falhou"
kubectl -n cloudshop get pods

time helm rollback cloudshop 1 -n cloudshop
kubectl -n cloudshop rollout status deploy/cloudshop-api
curl -H "Host: cloudshop.dev" -s -o /dev/null -w '%{http_code}\\n' http://localhost/api/health`,
    },
    validation: ["Histórico com múltiplas revisões", "Rollback restaura o serviço", "Tempo de rollback medido"],
    commonErrors: [
      { error: "required value não informado", fix: "Passar image.tag por values de ambiente ou --set" },
      { error: "Upgrade travado em pending", fix: "Usar --atomic --wait e verificar eventos dos pods" },
    ],
    solution:
      "Com --atomic, o upgrade falho se reverte sozinho; helm rollback cobre o caso em que a falha aparece depois. Meça o tempo e publique.",
    xp: 100,
  }),
  // ===== Módulo 9
  lab({
    id: "lab-9-1",
    moduleId: "mod-9",
    title: "ArgoCD sincronizando o CloudShop",
    goal: "Colocar o cluster sob GitOps e provar o self-heal.",
    professionalContext: "Modelo de entrega padrão em plataformas Kubernetes modernas.",
    minutes: 75,
    difficulty: "Avançado",
    prerequisites: ["Aulas 9.1 e 9.2"],
    environment: "Kind + ArgoCD + repositório GitOps",
    steps: [
      "Instalar o ArgoCD e acessar a interface",
      "Criar o repositório cloudshop-gitops com base e overlays",
      "Declarar a Application de staging com auto-sync e selfHeal",
      "Alterar manualmente um Deployment e observar a reversão",
      "Alterar o Git e observar o sync automático",
    ],
    commands: {
      label: "Provar o self-heal",
      language: "bash",
      code: `argocd app get cloudshop-staging
kubectl -n cloudshop scale deploy/cloudshop-api --replicas=5
sleep 20 && kubectl -n cloudshop get deploy cloudshop-api -o jsonpath='{.spec.replicas}{"\\n"}'   # volta ao valor do Git

cd cloudshop-gitops/overlays/staging
kustomize edit set image ghcr.io/tiago/cloudshop/api=ghcr.io/tiago/cloudshop/api:v0.2.0
git commit -am "chore: api v0.2.0" && git push
argocd app wait cloudshop-staging --health --timeout 180`,
      securityNote: "Use deploy key com permissão de leitura para o ArgoCD acessar o repositório privado.",
    },
    validation: ["Application Synced e Healthy", "Alteração manual revertida automaticamente", "Commit no Git reflete no cluster"],
    commonErrors: [
      { error: "ComparisonError: repository not accessible", fix: "Registrar credencial/deploy key do repositório no ArgoCD" },
      { error: "OutOfSync permanente", fix: "Identificar campo com app diff e usar ignoreDifferences quando legítimo" },
    ],
    solution:
      "Com selfHeal, o Git vence qualquer alteração manual. É a garantia de que o cluster reflete o que foi revisado.",
    xp: 100,
  }),
  lab({
    id: "lab-9-2",
    moduleId: "mod-9",
    title: "Rollback de produção por git revert",
    goal: "Reverter uma versão ruim em minutos usando apenas Git.",
    professionalContext: "É assim que se restaura serviço em plataformas GitOps.",
    minutes: 45,
    difficulty: "Avançado",
    prerequisites: ["Aula 9.3"],
    environment: "ArgoCD + repositório GitOps",
    steps: [
      "Promover uma versão intencionalmente quebrada",
      "Detectar a falha por health do Application e métricas",
      "Reverter o commit de promoção",
      "Sincronizar e validar a restauração",
      "Registrar a linha do tempo para o postmortem",
    ],
    commands: {
      label: "Reverter e validar",
      language: "bash",
      code: `git -C cloudshop-gitops log --oneline -3 -- overlays/producao
git -C cloudshop-gitops revert --no-edit <sha-da-promocao>
git -C cloudshop-gitops push
argocd app sync cloudshop-producao && argocd app wait cloudshop-producao --health
kubectl -n cloudshop get pods -l component=api
argocd app history cloudshop-producao | tail -5`,
    },
    validation: ["Serviço saudável após o revert", "Histórico do ArgoCD registra a reversão", "Linha do tempo documentada"],
    commonErrors: [
      { error: "Revert sem sync (produção com sync manual)", fix: "Executar argocd app sync após o push" },
      { error: "Revert de migração de banco incompatível", fix: "Migrações precisam ser retrocompatíveis; rollback de schema é caso separado" },
    ],
    solution:
      "Rollback em GitOps é revert + sync. A exceção crítica é banco: migração precisa ser compatível com a versão anterior.",
    xp: 100,
  }),
  lab({
    id: "lab-9-3",
    moduleId: "mod-9",
    title: "Segredos fora do Git com External Secrets",
    goal: "Fazer o cluster buscar a senha do banco no cofre, sem nada sensível no repositório.",
    professionalContext: "Requisito obrigatório para GitOps em ambiente corporativo.",
    minutes: 55,
    difficulty: "Avançado",
    prerequisites: ["Aula 9.4"],
    environment: "Kind + External Secrets Operator (+ AWS Secrets Manager ou fake provider)",
    steps: [
      "Instalar o operador via Helm",
      "Criar o SecretStore com credencial de leitura mínima",
      "Declarar o ExternalSecret referenciando a chave do cofre",
      "Confirmar a criação do Secret no cluster",
      "Rotacionar no cofre e observar a atualização",
    ],
    commands: {
      label: "Instalar e validar",
      language: "bash",
      code: `helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets -n external-secrets --create-namespace

kubectl -n cloudshop apply -f gitops/external-secret-db.yaml
kubectl -n cloudshop get externalsecret cloudshop-db
kubectl -n cloudshop get secret cloudshop-db -o jsonpath='{.data.password}' | base64 -d | wc -c
grep -ri "password:" cloudshop-gitops/ || echo "nenhum segredo em texto no repositorio"`,
      securityNote: "Nunca imprima o valor do segredo; conte caracteres ou verifique apenas a existência.",
    },
    validation: ["Secret criado no cluster a partir do cofre", "Repositório sem valores sensíveis", "Rotação refletida no cluster"],
    commonErrors: [
      { error: "SecretSynced=False", fix: "Permissão insuficiente no cofre ou chave/propriedade com nome errado" },
      { error: "Secret não atualiza", fix: "Ajustar refreshInterval e verificar logs do operador" },
    ],
    solution:
      "O repositório guarda apenas a referência; o valor vive no cofre com rotação e auditoria. É assim que GitOps e segurança convivem.",
    xp: 100,
  }),
  // ===== Módulo 10
  lab({
    id: "lab-10-1",
    moduleId: "mod-10",
    title: "Stack de observabilidade e dashboard do CloudShop",
    goal: "Subir Prometheus, Grafana e Loki e construir o dashboard que responde 'está tudo bem?'.",
    professionalContext: "Sem observabilidade, você descobre incidente pelo cliente.",
    minutes: 90,
    difficulty: "Avançado",
    prerequisites: ["Aulas 10.1 a 10.3"],
    environment: "Kind + kube-prometheus-stack + Loki",
    steps: [
      "Instalar kube-prometheus-stack via Helm",
      "Expor /metrics na API e criar o ServiceMonitor",
      "Instalar Loki e enviar os logs da aplicação",
      "Construir o dashboard com taxa de erro, p95 e throughput",
      "Validar a correlação entre painel e logs",
    ],
    commands: {
      label: "Instalar e verificar coleta",
      language: "bash",
      code: `helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install kps prometheus-community/kube-prometheus-stack -n monitoring --create-namespace

kubectl -n cloudshop apply -f k8s/servicemonitor.yaml
kubectl -n monitoring port-forward svc/kps-kube-prometheus-stack-prometheus 9090:9090 &
curl -s 'localhost:9090/api/v1/targets' | jq '.data.activeTargets[] | select(.labels.job|test("cloudshop")) | .health'

curl -sG 'localhost:9090/api/v1/query' --data-urlencode \\
  'query=sum(rate(http_request_duration_seconds_count[5m])) by (route)' | jq '.data.result | length'`,
    },
    validation: ["Target da API com health=up", "Consultas retornam séries", "Dashboard responde em 5 segundos se está tudo bem"],
    commonErrors: [
      { error: "Target down", fix: "Porta e path do ServiceMonitor precisam casar com o Service" },
      { error: "Nenhuma série da aplicação", fix: "Confirmar que /metrics responde dentro do pod" },
    ],
    solution:
      "Coleta funcionando é pré-requisito; o valor está no dashboard enxuto: erro, latência, throughput e SLO no topo.",
    xp: 100,
  }),
  lab({
    id: "lab-10-2",
    moduleId: "mod-10",
    title: "Alertas acionáveis com runbook vinculado",
    goal: "Criar alertas por sintoma do usuário e testar o disparo de verdade.",
    professionalContext: "Alerta ruim gera fadiga; alerta bom evita indisponibilidade prolongada.",
    minutes: 60,
    difficulty: "Avançado",
    prerequisites: ["Aula 10.2"],
    environment: "Prometheus + Alertmanager",
    steps: [
      "Escrever regras de taxa de erro, p95 e burn rate",
      "Vincular runbook nas anotações",
      "Configurar rota por severidade no Alertmanager",
      "Provocar erros na API e observar o disparo",
      "Ajustar o for até eliminar falso positivo",
    ],
    commands: {
      label: "Provocar e verificar o alerta",
      language: "bash",
      code: `kubectl -n monitoring apply -f k8s/prometheus-rules.yaml
kubectl -n monitoring exec deploy/kps-kube-prometheus-stack-operator -- true

# gerar erros 5xx
for i in $(seq 1 200); do curl -s -o /dev/null -H "Host: cloudshop.dev" http://localhost/api/erro-proposital; done

curl -s localhost:9090/api/v1/alerts | jq '.data.alerts[] | {nome:.labels.alertname, estado:.state}'
kubectl -n monitoring port-forward svc/kps-kube-prometheus-stack-alertmanager 9093:9093 &
curl -s localhost:9093/api/v2/alerts | jq '.[].labels.alertname'`,
    },
    validation: ["Alerta passa de pending para firing", "Anotação contém link do runbook", "Nenhum falso positivo em operação normal"],
    commonErrors: [
      { error: "Alerta nunca dispara", fix: "Testar a expressão no Prometheus; janela ou threshold irreal" },
      { error: "Alerta dispara a cada pico", fix: "Aumentar o for e usar burn rate em vez de limite instantâneo" },
    ],
    solution:
      "Alerta deve descrever impacto no usuário, exigir ação e apontar o runbook. Se não cumprir os três, remova.",
    xp: 100,
  }),
  lab({
    id: "lab-10-3",
    moduleId: "mod-10",
    title: "Traces distribuídos com OpenTelemetry",
    goal: "Rastrear uma requisição do frontend até o banco e achar o gargalo.",
    professionalContext: "É o sinal que responde 'onde o tempo foi gasto' em arquitetura distribuída.",
    minutes: 65,
    difficulty: "Avançado",
    prerequisites: ["Aula 10.4"],
    environment: "OTel Collector + Tempo ou Jaeger",
    steps: [
      "Instrumentar a API com o SDK do OTel",
      "Subir o Collector com redaction e tail sampling",
      "Gerar tráfego, incluindo uma rota lenta",
      "Localizar o span dominante no trace",
      "Otimizar e comparar antes e depois",
    ],
    commands: {
      label: "Gerar e inspecionar traces",
      language: "bash",
      code: `kubectl -n monitoring apply -f k8s/otel-collector.yaml
kubectl -n cloudshop set env deploy/cloudshop-api \\
  OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector.monitoring:4318 OTEL_SAMPLE_RATIO=1

for i in $(seq 1 30); do curl -s -o /dev/null -H "Host: cloudshop.dev" http://localhost/api/orders; done
kubectl -n monitoring logs deploy/otel-collector --tail=20
kubectl -n monitoring port-forward svc/tempo 3200:3200 &
curl -s 'localhost:3200/api/search?tags=service.name%3Dcloudshop-api&limit=5' | jq '.traces[].durationMs'`,
      securityNote: "Confirme no Collector que headers de autorização estão sendo removidos antes da exportação.",
    },
    validation: ["Trace completo com spans de HTTP e banco", "Span dominante identificado", "Nenhum dado sensível nos atributos"],
    commonErrors: [
      { error: "Traces sem o span do banco", fix: "Habilitar auto-instrumentação do driver de banco" },
      { error: "Trace quebrado entre serviços", fix: "Garantir propagação do header traceparent no cliente HTTP" },
    ],
    solution:
      "O trace deve mostrar onde estão os milissegundos. A maioria das lentidões aparece como uma consulta repetida em laço.",
    xp: 100,
  }),
  lab({
    id: "lab-10-4",
    moduleId: "mod-10",
    title: "SLO, error budget e postmortem",
    goal: "Definir o SLO do CloudShop, medir o budget e escrever um postmortem real.",
    professionalContext: "É o vocabulário que define maturidade de SRE em qualquer entrevista.",
    minutes: 70,
    difficulty: "Avançado",
    prerequisites: ["Aula 10.5"],
    environment: "Prometheus + Grafana + repositório de documentação",
    steps: [
      "Definir dois SLIs e suas metas",
      "Criar o painel de consumo de error budget",
      "Provocar um incidente controlado e conduzi-lo",
      "Medir o impacto em minutos e em budget consumido",
      "Escrever o postmortem sem culpa com ações e prazos",
    ],
    commands: {
      label: "Medir budget e impacto",
      language: "bash",
      code: `# disponibilidade nos ultimos 30 dias
curl -sG localhost:9090/api/v1/query --data-urlencode \\
 'query=sum(rate(http_request_duration_seconds_count{status!~"5.."}[30d]))/sum(rate(http_request_duration_seconds_count[30d]))' | jq -r '.data.result[0].value[1]'

# incidente controlado
kubectl -n cloudshop set image deploy/cloudshop-api api=ghcr.io/tiago/cloudshop/api:versao-ruim
date -u +%FT%TZ   # inicio
kubectl -n cloudshop rollout undo deploy/cloudshop-api
date -u +%FT%TZ   # fim`,
    },
    validation: ["SLO documentado com consulta e budget", "Impacto medido em minutos e em budget", "Postmortem publicado com ações"],
    commonErrors: [
      { error: "SLO sem consulta associada", fix: "Todo SLO precisa de uma expressão mensurável" },
      { error: "Postmortem culpando pessoa", fix: "Descrever falhas de sistema, processo e ausência de guarda-corpo" },
    ],
    solution:
      "SLO em número, budget em minutos, incidente com linha do tempo e ações com dono e prazo. Este é o artefato que fecha o módulo.",
    xp: 100,
  }),
  // ===== Módulo 11
  lab({
    id: "lab-11-1",
    moduleId: "mod-11",
    title: "Varredura de segredos no histórico do Git",
    goal: "Provar que nenhum segredo existe no histórico e criar barreira preventiva.",
    professionalContext: "Auditoria de segurança começa exatamente por aqui.",
    minutes: 40,
    difficulty: "Intermediário",
    prerequisites: ["Aula 11.1"],
    environment: "Docker + gitleaks",
    steps: [
      "Rodar gitleaks no histórico completo dos três repositórios",
      "Rotacionar qualquer credencial encontrada",
      "Instalar o hook de pre-commit",
      "Adicionar o scanner ao CI",
      "Documentar o procedimento de resposta a vazamento",
    ],
    commands: {
      label: "Varrer e prevenir",
      language: "bash",
      code: `for repo in cloudshop-app cloudshop-infra cloudshop-gitops; do
  docker run --rm -v "$PWD/$repo:/repo" zricethezav/gitleaks:latest detect --source=/repo --redact --no-banner \\
    && echo "$repo: limpo" || echo "$repo: ACHADOS"
done

gitleaks protect --staged --redact
gh workflow view seguranca.yml`,
      securityNote: "Use --redact para não expor os valores encontrados na saída do terminal ou no log do CI.",
    },
    validation: ["Três repositórios sem achados", "Hook bloqueia commit com segredo de teste", "CI executa o scanner em cada PR"],
    commonErrors: [
      { error: "Muitos falsos positivos", fix: "Configurar .gitleaks.toml com allowlist justificada" },
      { error: "Achado 'resolvido' apagando o arquivo", fix: "Rotacionar a credencial: ela já está comprometida" },
    ],
    solution:
      "Prevenção em três camadas: hook local, CI e varredura periódica do histórico. Achado sempre implica rotação.",
    xp: 100,
  }),
  lab({
    id: "lab-11-2",
    moduleId: "mod-11",
    title: "Pipeline de segurança com política de bloqueio",
    goal: "Bloquear o build em vulnerabilidade crítica corrigível e registrar exceções com prazo.",
    professionalContext: "Como DevSecOps funciona sem parar a entrega do time.",
    minutes: 60,
    difficulty: "Avançado",
    prerequisites: ["Aula 11.2"],
    environment: "GitHub Actions + Trivy + tfsec",
    steps: [
      "Adicionar SCA, scan de imagem e scan de IaC ao workflow",
      "Definir a política: falhar em HIGH/CRITICAL com correção",
      "Provocar uma falha usando dependência antiga",
      "Corrigir e registrar uma exceção com prazo para o caso sem correção",
      "Publicar SBOM e assinar a imagem",
    ],
    commands: {
      label: "Testar a política",
      language: "bash",
      code: `npm audit --audit-level=high || echo "bloqueado por dependencia"
trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 cloudshop-api:ci
trivy config infra/
syft cloudshop-api:ci -o spdx-json > sbom.json 2>/dev/null || docker sbom cloudshop-api:ci > sbom.txt
cosign verify --certificate-oidc-issuer https://token.actions.githubusercontent.com \\
  --certificate-identity-regexp ".*" ghcr.io/tiago/cloudshop/api:latest`,
    },
    validation: ["Build falha com vulnerabilidade crítica corrigível", "SBOM gerado", "Imagem verificável por assinatura"],
    commonErrors: [
      { error: "Pipeline sempre vermelho por CVE sem correção", fix: "Usar ignore-unfixed e registrar exceção com prazo" },
      { error: "Scanner desligado sob pressão", fix: "Política escrita com exceções controladas em vez de desligamento" },
    ],
    solution:
      "Segurança sustentável tem política explícita, exceções com prazo e dono, e verificação automatizada de origem do artefato.",
    xp: 100,
  }),
  lab({
    id: "lab-11-3",
    moduleId: "mod-11",
    title: "Otimização de custo com meta e sem violar o SLO",
    goal: "Reduzir o custo do ambiente e provar que o SLO permaneceu intacto.",
    professionalContext: "FinOps na prática: economia justificada por dados, não por corte cego.",
    minutes: 55,
    difficulty: "Intermediário",
    prerequisites: ["Aulas 11.3 e 10.5"],
    environment: "AWS + Cost Explorer + Grafana",
    steps: [
      "Levantar o custo por serviço e por ambiente",
      "Escolher três otimizações mensuráveis",
      "Aplicar e medir o efeito no custo",
      "Comparar SLI antes e depois",
      "Registrar o resultado no README",
    ],
    commands: {
      label: "Medir antes e depois",
      language: "bash",
      code: `aws ce get-cost-and-usage --time-period Start=2026-08-01,End=2026-09-01 \\
  --granularity MONTHLY --metrics UnblendedCost --group-by Type=DIMENSION,Key=SERVICE \\
  --query 'ResultsByTime[0].Groups[].{S:Keys[0],V:Metrics.UnblendedCost.Amount}' --output table

aws ec2 describe-addresses --query 'Addresses[?AssociationId==null].AllocationId'
aws ec2 describe-volumes --filters Name=status,Values=available --query 'Volumes[].VolumeId'
kubectl top pods -n cloudshop`,
      securityNote: "Automação de desligamento deve filtrar por tag env=dev; sem filtro, o risco é derrubar produção.",
    },
    validation: ["Redução de custo medida em percentual", "SLI mantido dentro da meta", "Otimizações documentadas"],
    commonErrors: [
      { error: "Economia com queda de disponibilidade", fix: "Reverter e escolher outra alavanca; SLO é o limite" },
      { error: "Custo sem atribuição", fix: "Ativar tags de alocação de custo antes de medir" },
    ],
    solution:
      "Boa otimização tem número antes, número depois e SLO intacto. É esse trio que se apresenta em entrevista.",
    xp: 100,
  }),
  lab({
    id: "lab-11-4",
    moduleId: "mod-11",
    title: "Portfólio final: README, ADRs e diagrama",
    goal: "Deixar o CloudShop pronto para ser avaliado por um recrutador técnico.",
    professionalContext: "É o artefato que converte estudo em entrevista.",
    minutes: 75,
    difficulty: "Intermediário",
    prerequisites: ["Aulas 11.4 e 11.5"],
    environment: "Repositórios do CloudShop",
    steps: [
      "Escrever o README com arquitetura, deploy, observabilidade, rollback e custo",
      "Criar três ADRs das decisões principais",
      "Gerar o diagrama da arquitetura",
      "Adicionar badges de CI e capturas do dashboard",
      "Pedir revisão a outra pessoa e ajustar o que não ficou claro",
    ],
    commands: {
      label: "Diagrama em Mermaid",
      language: "markdown",
      code: `\`\`\`mermaid
flowchart LR
  U[Usuario] --> CF[CloudFront]
  CF --> S3[(S3: Vue build)]
  U --> ING[Ingress NGINX]
  ING --> API[API Node em Kubernetes]
  API --> DB[(RDS PostgreSQL)]
  API --> OTEL[OTel Collector]
  OTEL --> TEMPO[Tempo]
  API -.metrics.-> PROM[Prometheus]
  PROM --> GRAF[Grafana]
  GH[GitHub Actions] -->|imagem| GHCR[(GHCR)]
  GH -->|PR de versao| GITOPS[(cloudshop-gitops)]
  ARGO[ArgoCD] --> ING
  GITOPS --> ARGO
\`\`\``,
    },
    validation: ["Outra pessoa consegue rodar o projeto pelo README", "Três ADRs publicados", "Diagrama renderizando no GitHub"],
    commonErrors: [
      { error: "README só com comandos de instalação", fix: "Incluir arquitetura, decisões, custo e rollback" },
      { error: "Diagrama sem fluxo de entrega", fix: "Mostrar também CI, registry e GitOps" },
    ],
    solution:
      "O portfólio precisa responder o que é, como opera, como falha, como volta e quanto custa. Isso é o que diferencia projeto de tutorial.",
    xp: 100,
  }),
];

export function labsByModule(moduleId: string) {
  return LABS.filter((l) => l.moduleId === moduleId);
}
