import type { Module } from "@/lib/types";

export const FUNDAMENTOS_MODULES: Module[] = [
  {
    id: "mod-0",
    index: 0,
    slug: "boas-vindas-e-ambiente",
    title: "Boas-vindas e Ambiente",
    tagline: "Monte a bancada de trabalho de quem vive de infraestrutura.",
    weeks: 1,
    xp: 500,
    badge: "first-commit",
    regionId: "vila-terminal",
    overview:
      "Antes de aprender ferramenta, é preciso entender o jogo: o que uma pessoa de DevOps entrega no dia a dia, como as vagas estão escritas hoje e qual ambiente de trabalho você precisa ter na sua máquina. Este módulo entrega a bancada pronta: shell Linux, Git configurado com chave SSH, editor com extensões, Docker, Node, AWS CLI, Terraform, kubectl e Helm. No fim, você terá repositórios criados, orçamento de nuvem protegido e um diário técnico onde registrará cada decisão — o artefato que mais impressiona em entrevista.",
    objectives: [
      "Explicar com clareza a diferença entre DevOps, SRE, Cloud e Platform Engineering.",
      "Ter um ambiente Linux funcional (WSL2, VM ou nativo) com shell configurado.",
      "Autenticar no GitHub por chave SSH e criar os repositórios do projeto.",
      "Instalar e validar Docker, Node, AWS CLI, Terraform, kubectl e Helm.",
      "Criar orçamento e alerta de custo na nuvem antes de provisionar qualquer recurso.",
    ],
    prerequisites: ["Computador com 8 GB de RAM ou mais", "Conta de e-mail para GitHub e nuvem"],
    topics: ["Carreira", "WSL2/Linux", "GitHub", "VS Code", "Docker", "Node", "AWS CLI", "Terraform", "kubectl", "Helm"],
    delivery: "Repositórios criados, chave SSH funcionando, orçamento de nuvem com alerta e diário técnico iniciado.",
    checklist: [
      "ssh -T git@github.com responde com o seu usuário",
      "docker run hello-world executa sem sudo",
      "terraform -version, kubectl version --client e helm version respondem",
      "aws sts get-caller-identity retorna a sua identidade",
      "Budget de 5 USD/mês criado com alerta por e-mail",
    ],
    troubleshooting:
      "Caso clássico: docker exige sudo. Sintoma: permission denied ao acessar /var/run/docker.sock. Causa: seu usuário não está no grupo docker. Correção: adicionar o usuário ao grupo e reabrir a sessão. Lição: erro de permissão quase nunca é bug da ferramenta.",
    interviewQuestions: [
      "Qual a diferença entre DevOps e SRE na prática do dia a dia?",
      "Como você garante que o ambiente da sua máquina não influencia o resultado do build?",
      "O que você faz no primeiro dia com acesso a uma conta de nuvem nova?",
    ],
    printQuest:
      "Criar os repositórios printquest-app, printquest-infra e printquest-gitops, que serão usados em todos os módulos seguintes.",
    lessons: [
      {
        id: "l-0-1",
        moduleId: "mod-0",
        title: "O que uma pessoa DevOps realmente faz (e o que as vagas pedem em 2026)",
        duration: 25,
        difficulty: "Iniciante",
        tools: ["Mercado", "Carreira"],
        xp: 25,
        objectives: [
          "Separar mito de rotina real na função",
          "Ler uma vaga e identificar o que é obrigatório e o que é desejável",
          "Escolher uma trilha de especialização coerente com seu ponto de partida",
        ],
        body: [
          "DevOps não é um cargo mágico entre dev e infra: é a responsabilidade de encurtar o caminho entre um commit e o valor entregue em produção, com segurança e reversibilidade. Na prática o seu dia envolve manter pipelines confiáveis, empacotar aplicações, provisionar infraestrutura em código, observar o comportamento em produção, responder a incidentes e reduzir custo. Quem vem do frontend, como você, tem uma vantagem real: já entende build, dependências, variáveis de ambiente e o que a aplicação precisa para rodar.",
          "As vagas atuais convergem para um núcleo bastante estável: Linux, redes e HTTP, Git, containers, um provedor de nuvem (AWS lidera as vagas em português), CI/CD (GitHub Actions e GitLab CI dominam), Terraform, Kubernetes, observabilidade (Prometheus/Grafana/OpenTelemetry) e noções firmes de segurança e custo. O que muda entre anúncios é a ênfase: uma vaga de Platform Engineering pede Kubernetes, Helm e experiência de plataforma interna; uma de SRE pede SLO, incidentes e performance; uma de DevSecOps pede scanners, supply chain e IAM.",
          "A forma correta de estudar é sempre a mesma: você aprende um conceito, aplica em um artefato do seu próprio projeto e escreve o que aprendeu. Nesta plataforma, esse artefato é o PrintQuest — um catálogo de produtos 3D com frontend Vue, API Node e PostgreSQL — que você vai containerizar, publicar em pipeline, provisionar na AWS via Terraform, migrar para Kubernetes, colocar sob GitOps e finalmente instrumentar com métricas, logs, traces e SLO.",
        ],
        code: [
          {
            label: "Diário técnico: modelo de entrada diária",
            language: "markdown",
            code: `## 2026-09-06 — Módulo 0

**O que fiz:** configurei chave SSH e criei os 3 repositórios do PrintQuest.
**Comando que aprendi:** ssh -T git@github.com
**Erro que enfrentei:** permission denied (publickey) — a chave não estava no agente.
**Como resolvi:** ssh-add ~/.ssh/id_ed25519
**Por que importa no trabalho:** acesso a repositório é o primeiro bloqueio de qualquer onboarding.`,
            securityNote:
              "Nunca cole tokens, senhas ou chaves privadas no diário. Registre apenas o nome da variável usada.",
          },
        ],
        whyItMatters:
          "Entrevistas técnicas de DevOps são conversas sobre decisões. Quem estudou por tópicos soltos responde teoria; quem construiu um projeto responde com trade-offs, e é isso que gera oferta.",
        commonMistake:
          "Começar por Kubernetes sem dominar Linux, rede e containers. O resultado é copiar YAML sem entender por que o Pod não sobe.",
        productionTip:
          "Mantenha o diário técnico no próprio repositório (docs/diario.md). Ele vira base do README, do currículo e das respostas de entrevista.",
        securityAlert:
          "Ao criar sua conta de nuvem, ative MFA na conta raiz imediatamente e nunca use a raiz para o trabalho diário.",
        interviewQuestion:
          "Conte um problema de produção que você investigou: quais sinais olhou primeiro e como confirmou a causa raiz?",
        glossary: [
          { term: "SRE", definition: "Engenharia de confiabilidade: aplica práticas de engenharia para manter serviços dentro de metas mensuráveis (SLO)." },
          { term: "Platform Engineering", definition: "Construir plataforma interna e caminhos padronizados para que times de produto entreguem sozinhos com segurança." },
        ],
        printQuestLink: "Definir o escopo do PrintQuest e escrever o primeiro registro do diário técnico.",
        quiz: [
          {
            question: "Qual afirmação descreve melhor a função de DevOps nas vagas atuais?",
            options: [
              "Substituir o time de desenvolvimento nas entregas",
              "Reduzir o tempo e o risco entre commit e produção, com automação e observabilidade",
              "Administrar apenas servidores físicos e backups",
              "Escrever somente scripts de deploy manuais",
            ],
            answerIndex: 1,
            explanation:
              "A entrega central é fluxo confiável até produção: automação, reversibilidade, observabilidade, segurança e custo.",
          },
        ],
      },
      {
        id: "l-0-2",
        moduleId: "mod-0",
        title: "Ambiente Linux profissional com WSL2 (ou VM)",
        duration: 35,
        difficulty: "Iniciante",
        tools: ["WSL2", "Ubuntu", "Shell"],
        xp: 25,
        objectives: [
          "Instalar e validar um Linux utilizável para trabalho real",
          "Configurar shell, histórico e aliases úteis",
          "Entender por que trabalhar dentro do filesystem Linux é mais rápido",
        ],
        body: [
          "Praticamente todo servidor que você vai administrar roda Linux, então o seu ambiente de estudo precisa ser Linux. No Windows, o caminho mais produtivo é WSL2 com Ubuntu LTS: você ganha kernel Linux real, integração com VS Code e Docker sem máquina virtual pesada. Em macOS, use o terminal nativo mais uma VM ou containers para praticar systemd. Em Linux nativo, você já está pronto.",
          "Depois de instalar, dedique quinze minutos ao conforto: prompt que mostra branch do Git, histórico grande, aliases para comandos repetidos e um diretório de trabalho dentro do próprio filesystem Linux (por exemplo ~/projetos), nunca em /mnt/c. Arquivos acessados via /mnt/c passam por tradução entre sistemas de arquivos e deixam builds e instalações de dependências drasticamente mais lentos.",
          "Valide sempre o ambiente com comandos, não com suposições: distro e versão, kernel, memória disponível e espaço em disco. Este hábito é o mesmo que você usará no primeiro minuto de qualquer incidente.",
        ],
        code: [
          {
            label: "Instalar e validar o ambiente",
            language: "bash",
            code: `# Windows PowerShell (como administrador)
wsl --install -d Ubuntu-24.04
wsl --set-default-version 2

# Dentro do Ubuntu
lsb_release -a          # distro e versao
uname -r                # versao do kernel
free -h                 # memoria
df -h /                 # disco
nproc                   # nucleos de CPU

sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git jq unzip build-essential`,
          },
          {
            label: "Aliases e histórico no ~/.bashrc",
            language: "bash",
            code: `cat >> ~/.bashrc <<'EOF'
export HISTSIZE=50000
export HISTFILESIZE=100000
export HISTTIMEFORMAT='%F %T '
alias ll='ls -alh'
alias gs='git status -sb'
alias k='kubectl'
alias tf='terraform'
alias dc='docker compose'
EOF
source ~/.bashrc`,
            securityNote:
              "Não guarde tokens em ~/.bashrc: qualquer processo do seu usuário lê o arquivo e ele acaba em backup e screenshot.",
          },
        ],
        whyItMatters:
          "Ambiente frágil gera falsos problemas. Metade dos 'bugs' de quem está começando é ambiente diferente do servidor.",
        commonMistake:
          "Trabalhar em /mnt/c/Users/... e concluir que Docker e npm são lentos. O gargalo é a ponte de filesystem.",
        productionTip:
          "Registre no diário a versão exata de cada ferramenta instalada. Diferença de versão é causa comum de 'na minha máquina funciona'.",
        interviewQuestion: "Como você reproduz localmente um problema que só acontece no servidor?",
        glossary: [
          { term: "WSL2", definition: "Subsistema Windows para Linux com kernel real, permitindo rodar distribuições Linux com bom desempenho." },
          { term: "LTS", definition: "Long Term Support: versão com suporte prolongado, preferida em servidores." },
        ],
        printQuestLink: "Criar ~/projetos/printquest, onde todo o código do projeto viverá.",
        quiz: [
          {
            question: "Por que evitar trabalhar em /mnt/c no WSL2?",
            options: [
              "Porque o Git não funciona lá",
              "Porque o acesso cruzado entre filesystems é lento",
              "Porque o Docker não enxerga a pasta",
              "Porque o Windows apaga os arquivos",
            ],
            answerIndex: 1,
            explanation: "A tradução entre NTFS e o filesystem Linux custa I/O e derruba a performance de builds.",
          },
        ],
      },
      {
        id: "l-0-3",
        moduleId: "mod-0",
        title: "Git, GitHub e chave SSH: acesso sem senha e sem dor",
        duration: 30,
        difficulty: "Iniciante",
        tools: ["Git", "GitHub", "SSH"],
        xp: 25,
        objectives: [
          "Gerar e registrar uma chave ed25519",
          "Configurar identidade e comportamento padrão do Git",
          "Criar os três repositórios do projeto",
        ],
        body: [
          "Autenticar por HTTPS com senha ou token colado a cada push é um atrito desnecessário e um risco. Chave SSH resolve os dois problemas: a chave privada nunca sai da sua máquina e o acesso é revogável em um clique. Use ed25519, que é curto, rápido e o padrão recomendado atualmente.",
          "Configure também os padrões de Git que evitam confusão em equipe: nome e e-mail corretos, branch inicial main, pull com rebase para manter histórico linear e push do branch atual apenas. Essas quatro configurações eliminam boa parte dos merges acidentais de quem está aprendendo.",
          "Por fim, crie os repositórios que sustentarão o restante do curso, cada um com propósito claro: aplicação, infraestrutura e manifests GitOps. Separar repositórios não é preciosismo: é o que permite proteger a infraestrutura com revisão diferente da aplicação.",
        ],
        code: [
          {
            label: "Chave SSH e configuração do Git",
            language: "bash",
            code: `ssh-keygen -t ed25519 -C "tiago@printquest" -f ~/.ssh/id_ed25519
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub   # cole em GitHub > Settings > SSH keys

ssh -T git@github.com       # deve responder com o seu usuario

git config --global user.name "Tiago Gomes"
git config --global user.email "voce@exemplo.com"
git config --global init.defaultBranch main
git config --global pull.rebase true
git config --global push.default current`,
            securityNote:
              "id_ed25519 (sem .pub) é a chave privada: nunca compartilhe, nunca comite, sempre proteja com passphrase.",
          },
        ],
        whyItMatters:
          "Todo fluxo de CI/CD começa em um repositório. Acesso mal configurado bloqueia deploy e vira incidente de entrega.",
        commonMistake:
          "Colar a chave privada em vez da pública no GitHub. Se isso acontecer, gere um novo par e revogue o antigo.",
        productionTip:
          "Em servidores e runners, use chaves de deploy com permissão de leitura apenas para o repositório necessário.",
        securityAlert: "Ative 2FA na sua conta GitHub. Conta comprometida em repositório de infra é acesso à produção.",
        interviewQuestion: "Qual a diferença entre chave de deploy, PAT e GitHub App para autenticação em automações?",
        glossary: [
          { term: "ed25519", definition: "Algoritmo de chave pública moderno, com chaves curtas e alta segurança." },
          { term: "ssh-agent", definition: "Processo que mantém a chave privada destravada em memória durante a sessão." },
        ],
        printQuestLink: "Criar printquest-app, printquest-infra e printquest-gitops com README inicial.",
        quiz: [
          {
            question: "Qual arquivo você registra no GitHub?",
            options: ["~/.ssh/id_ed25519", "~/.ssh/id_ed25519.pub", "~/.ssh/known_hosts", "~/.ssh/config"],
            answerIndex: 1,
            explanation: "Somente a chave pública (.pub) é enviada ao provedor; a privada permanece local.",
          },
        ],
      },
      {
        id: "l-0-4",
        moduleId: "mod-0",
        title: "Instalando o arsenal: Docker, Node, AWS CLI, Terraform, kubectl e Helm",
        duration: 40,
        difficulty: "Iniciante",
        tools: ["Docker", "Node", "AWS CLI", "Terraform", "kubectl", "Helm"],
        xp: 25,
        objectives: [
          "Instalar as ferramentas do curso e validar cada uma",
          "Entender o papel de cada ferramenta no ciclo de entrega",
          "Fixar versões para evitar surpresas",
        ],
        body: [
          "Cada ferramenta ocupa um lugar específico no ciclo: Docker empacota, Node roda a aplicação e seus testes, AWS CLI conversa com a nuvem, Terraform descreve a infraestrutura, kubectl opera o cluster e Helm empacota manifests em releases parametrizáveis. Instalar todas agora evita interrupção no meio dos módulos.",
          "Fixe versões sempre que possível e anote-as. Terraform, por exemplo, muda comportamento entre versões menores e o state é sensível a isso. Em pipelines, ferramentas sem versão fixa geram builds que quebram sem ninguém ter mudado código — um dos incidentes mais frustrantes que existe.",
          "Validar é parte da instalação: um comando que responda versão e um comando que exercite a ferramenta de verdade. Docker instalado não significa Docker funcionando para o seu usuário.",
        ],
        code: [
          {
            label: "Instalação e validação",
            language: "bash",
            code: `# Docker Engine (Ubuntu/WSL2)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"   # reabra a sessao depois
docker run --rm hello-world

# Node via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc && nvm install --lts && node -v && npm -v

# AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip
unzip -q awscliv2.zip && sudo ./aws/install && aws --version

# Terraform, kubectl e Helm
sudo snap install terraform --classic
curl -LO "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -m 0755 kubectl /usr/local/bin/kubectl
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

terraform -version && kubectl version --client && helm version`,
            securityNote:
              "Baixar script e executar direto no shell exige confiança na origem. Em ambiente corporativo, use o repositório de pacotes aprovado e verifique checksum.",
          },
        ],
        whyItMatters:
          "Ambiente padronizado é pré-requisito de automação. Se o comando não roda igual na sua máquina e no runner, o pipeline é loteria.",
        commonMistake:
          "Esquecer de reabrir a sessão após entrar no grupo docker e concluir que a instalação falhou.",
        productionTip:
          "Registre as versões em docs/ferramentas.md e use as mesmas versões nos workflows do GitHub Actions.",
        interviewQuestion: "Por que fixar versões de ferramentas em CI e como você faria isso no GitHub Actions?",
        glossary: [
          { term: "CLI", definition: "Interface de linha de comando: forma automatizável de operar uma ferramenta." },
          { term: "nvm", definition: "Gerenciador de versões do Node, permitindo trocar de runtime por projeto." },
        ],
        printQuestLink: "Documentar as versões usadas no PrintQuest para reproduzir builds no CI.",
        quiz: [
          {
            question: "Qual ferramenta descreve infraestrutura de forma declarativa e versionada?",
            options: ["kubectl", "Terraform", "Docker", "AWS CLI"],
            answerIndex: 1,
            explanation: "Terraform declara o estado desejado da infraestrutura e reconcilia com o real via state.",
          },
        ],
      },
      {
        id: "l-0-5",
        moduleId: "mod-0",
        title: "Conta de nuvem segura e orçamento antes do primeiro recurso",
        duration: 30,
        difficulty: "Iniciante",
        tools: ["AWS", "IAM", "Budgets"],
        xp: 25,
        objectives: [
          "Proteger a conta raiz e criar um usuário de trabalho",
          "Configurar credenciais locais com perfil nomeado",
          "Criar orçamento com alerta para não tomar susto na fatura",
        ],
        body: [
          "A primeira tarefa em qualquer conta nova de nuvem não é criar servidor: é reduzir risco. Ative MFA na raiz, guarde as credenciais raiz fora do computador de trabalho e crie um usuário ou identidade separada para o dia a dia, com permissões limitadas. Depois configure alerta de custo, porque quase todo estudante já esqueceu um recurso ligado e pagou por isso.",
          "Configure o AWS CLI com perfil nomeado em vez de credenciais padrão soltas. Perfis deixam explícito em qual conta você está agindo — proteção simples contra o clássico 'apliquei na conta errada'. Preferir credenciais temporárias (SSO/Identity Center) a chaves de longa duração é o padrão atual das empresas.",
          "Por último, adote a disciplina de destruição: todo recurso criado para estudo tem data de morte. Ao final de cada laboratório da nuvem você roda o comando de destroy e confere no console que nada sobrou.",
        ],
        code: [
          {
            label: "Perfil, identidade e orçamento",
            language: "bash",
            code: `aws configure --profile printquest
# AWS Access Key ID / Secret / região (ex.: us-east-1) / output json

export AWS_PROFILE=printquest
aws sts get-caller-identity

# Orçamento de 5 USD por mês com alerta em 80%
aws budgets create-budget --account-id "$(aws sts get-caller-identity --query Account --output text)" \\
  --budget '{"BudgetName":"estudo-printquest","BudgetLimit":{"Amount":"5","Unit":"USD"},"TimeUnit":"MONTHLY","BudgetType":"COST"}' \\
  --notifications-with-subscribers '[{"Notification":{"NotificationType":"ACTUAL","ComparisonOperator":"GREATER_THAN","Threshold":80,"ThresholdType":"PERCENTAGE"},"Subscribers":[{"SubscriptionType":"EMAIL","Address":"voce@exemplo.com"}]}]'`,
            securityNote:
              "~/.aws/credentials guarda chaves em texto puro. Prefira AWS IAM Identity Center (SSO) e nunca comite esse arquivo.",
          },
        ],
        whyItMatters:
          "Vagas de nuvem cobram responsabilidade financeira. Saber demonstrar controle de custo diferencia candidato júnior de candidato confiável.",
        commonMistake: "Usar a conta raiz para tudo e deixar NAT Gateway ou RDS ligados após o laboratório.",
        productionTip:
          "Marque todos os recursos com tags (projeto, ambiente, dono, validade). Sem tags, não existe FinOps.",
        securityAlert:
          "Chave de acesso vazada em repositório público é explorada em minutos. Se acontecer, revogue imediatamente e audite CloudTrail.",
        interviewQuestion: "Como você evitaria que um ambiente de teste gerasse custo indevido em uma conta compartilhada?",
        glossary: [
          { term: "MFA", definition: "Autenticação em múltiplos fatores: segundo fator além da senha." },
          { term: "Budget", definition: "Limite de gasto monitorado, com alertas configuráveis por percentual." },
        ],
        printQuestLink: "Criar o orçamento que protegerá a conta usada nos módulos 6 e 7.",
        quiz: [
          {
            question: "Qual é a primeira ação em uma conta de nuvem nova?",
            options: [
              "Criar uma instância EC2 para testar",
              "Ativar MFA na raiz e criar identidade de trabalho com menor privilégio",
              "Abrir todas as portas do Security Group para facilitar testes",
              "Gerar chaves de acesso permanentes e salvá-las no repositório",
            ],
            answerIndex: 1,
            explanation: "Segurança e controle de custo vêm antes de qualquer provisionamento.",
          },
        ],
      },
    ],
  },
  {
    id: "mod-1",
    index: 1,
    slug: "linux-e-sistemas",
    title: "Linux e Sistemas",
    tagline: "O terreno onde todo incidente é investigado.",
    weeks: 2,
    xp: 1500,
    badge: "linux-navigator",
    regionId: "vila-terminal",
    bossId: "boss-processo-zumbi",
    overview:
      "Linux é a base não negociável da carreira. Aqui você aprende a navegar no filesystem com intenção, entender permissões de verdade (inclusive as que causam falha de deploy), controlar processos e serviços com systemd, ler logs para encontrar causa raiz e diagnosticar CPU, memória e disco sob pressão. O módulo termina com um runbook próprio — documento que operadores de plantão realmente usam.",
    objectives: [
      "Navegar, buscar e inspecionar arquivos com eficiência",
      "Entender e corrigir permissões e propriedade",
      "Controlar processos e serviços com systemd",
      "Investigar logs com journalctl e /var/log",
      "Diagnosticar saturação de CPU, memória e disco",
    ],
    prerequisites: ["Módulo 0 concluído", "Ambiente Linux funcionando"],
    topics: ["Filesystem", "Permissões", "Usuários e grupos", "Processos", "systemd", "Logs", "SSH", "CPU/memória/disco", "Troubleshooting"],
    delivery: "Runbook com 30 comandos comentados e um serviço systemd próprio, controlado e resiliente a reboot.",
    checklist: [
      "Runbook em docs/runbook-linux.md com 30 comandos e para que servem",
      "Serviço systemd criado, habilitado no boot e com restart automático",
      "Consulta de logs por unidade e por intervalo de tempo dominada",
      "Diagnóstico de disco cheio executado com du/df",
      "Usuário sem sudo criado para rodar a aplicação",
    ],
    troubleshooting:
      "Disco cheio em produção: df -h mostra 100% em /, a aplicação para de escrever e o banco recusa conexões. Investigação: du -xh --max-depth=1 / para achar o diretório culpado, geralmente /var/log ou imagens Docker antigas. Correção imediata: rotacionar/limpar logs e podar imagens; correção definitiva: logrotate e alerta em 80%.",
    interviewQuestions: [
      "O que você olha primeiro quando um servidor está lento?",
      "Explique a diferença entre load average e uso de CPU.",
      "Como você faria um serviço voltar automaticamente após falha?",
    ],
    printQuest: "Preparar o host que hospedará a API do PrintQuest: usuário dedicado, serviço systemd e logs sob controle.",
    lessons: [
      {
        id: "l-1-1",
        moduleId: "mod-1",
        title: "Filesystem e navegação com intenção",
        duration: 35,
        difficulty: "Iniciante",
        tools: ["Shell", "coreutils", "find", "grep"],
        xp: 25,
        objectives: ["Entender a hierarquia FHS", "Buscar arquivos e conteúdo rapidamente", "Inspecionar arquivos grandes sem travar o terminal"],
        body: [
          "O Linux organiza tudo em uma árvore única a partir de /. Saber o significado de cada diretório acelera qualquer investigação: /etc guarda configuração, /var dados variáveis (logs, filas, bancos), /usr programas do sistema, /opt software de terceiros, /tmp arquivos temporários e /proc uma visão viva do kernel e dos processos. Quando alguém diz 'a config está errada', você já sabe onde procurar.",
          "Buscar é metade do trabalho. find localiza por nome, tamanho, data e permissão; grep -r localiza conteúdo; ripgrep faz isso mais rápido quando disponível. Em servidores de produção, combine com head e tail para nunca abrir um arquivo de gigabytes de uma vez — um cat descuidado em log de 4 GB congela sua sessão em plena crise.",
          "Duas noções salvam tempo: caminhos absolutos versus relativos (em scripts e serviços, sempre absolutos) e links simbólicos, muito usados em deploy para apontar 'current' para a release ativa e permitir rollback instantâneo.",
        ],
        code: [
          {
            label: "Comandos de navegação e busca que você usará todo dia",
            language: "bash",
            code: `pwd                                 # onde estou
ls -alh /etc | head                 # listar com tamanho legivel
tree -L 2 /var 2>/dev/null || ls -R /var | head

find /var/log -name "*.log" -size +50M          # logs grandes
find /etc -name "*.conf" -mtime -2              # config alterada nas ultimas 48h
grep -rn "DATABASE_URL" /etc/printquest/ 2>/dev/null

tail -n 100 -f /var/log/syslog       # acompanhar em tempo real
less +G /var/log/syslog              # abrir no fim sem carregar tudo
stat /etc/hosts                      # metadados: dono, permissao, datas
du -xh --max-depth=1 /var | sort -h  # quem ocupa espaco`,
            securityNote:
              "Evite grep recursivo em / como root: além de lento, pode expor conteúdo sensível no histórico do terminal.",
          },
        ],
        whyItMatters:
          "Em incidente, velocidade de navegação define quantos minutos o serviço fica fora. Quem procura arquivo com clique perde a janela.",
        commonMistake: "Usar cat em arquivos enormes e travar a sessão SSH durante a crise.",
        productionTip: "Prefira less +G e tail -f; e sempre confirme com stat quem é o dono do arquivo de configuração.",
        interviewQuestion: "Onde você procuraria a configuração e os logs de um serviço desconhecido em um servidor?",
        glossary: [
          { term: "FHS", definition: "Filesystem Hierarchy Standard: convenção sobre o propósito de cada diretório." },
          { term: "symlink", definition: "Atalho que aponta para outro caminho, usado em estratégias de release/rollback." },
        ],
        printQuestLink: "Definir /opt/printquest para a aplicação e /var/log/printquest para os logs.",
        quiz: [
          {
            question: "Onde ficam, por convenção, os arquivos de configuração do sistema?",
            options: ["/usr", "/etc", "/var", "/opt"],
            answerIndex: 1,
            explanation: "/etc concentra configuração estática do sistema e dos serviços instalados.",
          },
        ],
      },
      {
        id: "l-1-2",
        moduleId: "mod-1",
        title: "Permissões, usuários e grupos sem decoreba",
        duration: 40,
        difficulty: "Iniciante",
        tools: ["chmod", "chown", "usermod", "sudo"],
        xp: 25,
        objectives: ["Ler e escrever permissões em octal e simbólico", "Aplicar propriedade correta em diretórios de aplicação", "Usar sudo com responsabilidade"],
        body: [
          "Permissão em Linux responde a três perguntas: quem (dono, grupo, outros), o que (ler, escrever, executar) e sobre qual objeto. Em octal, leitura vale 4, escrita 2 e execução 1; portanto 640 significa dono lê e escreve, grupo lê, outros nada. Em diretórios, execução significa 'poder entrar', o que explica por que 644 em pasta quebra o acesso enquanto 755 funciona.",
          "A maioria das falhas reais de deploy é de propriedade, não de modo: o processo roda como usuário app, mas o diretório pertence a root. A correção correta é ajustar o dono com chown e conceder o mínimo necessário — não sair distribuindo 777, que é o equivalente a deixar a porta aberta e escrever 'entre'.",
          "Crie sempre um usuário de serviço sem shell de login para rodar a aplicação. Isso limita o dano em caso de comprometimento e é exigência de qualquer auditoria séria.",
        ],
        code: [
          {
            label: "Usuário de serviço e permissões corretas",
            language: "bash",
            code: `sudo useradd --system --no-create-home --shell /usr/sbin/nologin printquest
sudo mkdir -p /opt/printquest /var/log/printquest
sudo chown -R printquest:printquest /opt/printquest /var/log/printquest
sudo chmod 750 /opt/printquest        # dono total, grupo entra e le
sudo chmod 640 /etc/printquest/app.env

ls -ld /opt/printquest
id printquest
sudo -u printquest ls /opt/printquest  # testar como o servico enxerga

# auditoria rapida: arquivos com permissao perigosa
sudo find /opt -perm -o+w -type f`,
            securityNote:
              "chmod 777 em diretório de aplicação é falha de segurança: qualquer usuário local pode substituir seu binário ou script.",
          },
        ],
        whyItMatters:
          "Erros de permissão aparecem como falhas misteriosas de deploy, upload que não grava e serviço que não inicia. Diagnosticar em segundos é diferencial.",
        commonMistake: "Resolver 'permission denied' com chmod -R 777 em vez de corrigir o dono.",
        productionTip: "Arquivos com credenciais: 600 ou 640, dono do serviço, e jamais versionados no Git.",
        securityAlert: "Nunca dê sudo sem senha a um usuário de aplicação; se ele for comprometido, o servidor todo cai.",
        interviewQuestion: "Um upload falha com permission denied. Como você investiga em ordem?",
        glossary: [
          { term: "umask", definition: "Máscara que define as permissões padrão de arquivos recém-criados." },
          { term: "usuário de sistema", definition: "Conta sem login interativo, criada para executar serviços." },
        ],
        printQuestLink: "Criar o usuário printquest que executará a API e será dono dos diretórios da aplicação.",
        quiz: [
          {
            question: "O que significa 750 em um diretório?",
            options: [
              "Todos podem escrever",
              "Dono lê/escreve/entra, grupo lê e entra, outros nada",
              "Somente leitura para todos",
              "Dono lê apenas",
            ],
            answerIndex: 1,
            explanation: "7 = rwx para o dono, 5 = r-x para o grupo, 0 = nada para outros.",
          },
        ],
      },
      {
        id: "l-1-3",
        moduleId: "mod-1",
        title: "Processos, sinais e systemd na prática",
        duration: 45,
        difficulty: "Intermediário",
        tools: ["ps", "top", "kill", "systemd"],
        xp: 25,
        objectives: ["Investigar processos e portas", "Enviar sinais corretamente", "Escrever uma unit systemd resiliente"],
        body: [
          "Todo serviço é um processo com PID, dono, estado e recursos. ps auxf mostra a árvore, top e htop mostram o comportamento vivo, e ss -tulpn revela quem está escutando qual porta — comando que resolve metade dos 'a porta está em uso'. Estados importam: um processo em D (I/O ininterrupto) indica problema de disco ou rede, não de CPU; um zumbi (Z) indica pai que não coletou o filho.",
          "Sinais são a forma civilizada de conversar com processos. SIGTERM (15) pede encerramento e permite ao programa fechar conexões e finalizar requisições; SIGKILL (9) mata sem chance de limpeza, podendo corromper estado ou deixar arquivos de lock. Comece sempre por TERM; use KILL como último recurso.",
          "systemd é quem garante que o serviço suba no boot, reinicie após falha e tenha logs centralizados. Uma unit bem escrita define usuário sem privilégio, diretório de trabalho, variáveis de ambiente via EnvironmentFile, política de restart e limites básicos de segurança.",
        ],
        code: [
          {
            label: "Investigação de processos",
            language: "bash",
            code: `ps auxf | head -30
ps -eo pid,ppid,stat,etime,pcpu,pmem,cmd --sort=-pcpu | head
ss -tulpn | grep :3000            # quem escuta a porta da API
lsof -p 1234 | head               # arquivos abertos pelo processo
kill -TERM 1234                   # encerramento gracioso
kill -KILL 1234                   # ultimo recurso
pgrep -af node                    # localizar por nome`,
          },
          {
            label: "Unit systemd da API do PrintQuest",
            language: "ini",
            code: `# /etc/systemd/system/printquest-api.service
[Unit]
Description=PrintQuest API
After=network-online.target
Wants=network-online.target

[Service]
User=printquest
Group=printquest
WorkingDirectory=/opt/printquest
EnvironmentFile=/etc/printquest/app.env
ExecStart=/usr/bin/node /opt/printquest/server.js
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target`,
            securityNote:
              "EnvironmentFile deve ser 640, dono do serviço. Variáveis passadas em ExecStart aparecem em ps para qualquer usuário.",
          },
          {
            label: "Operar o serviço",
            language: "bash",
            code: `sudo systemctl daemon-reload
sudo systemctl enable --now printquest-api
systemctl status printquest-api --no-pager
sudo systemctl restart printquest-api
systemctl is-enabled printquest-api
journalctl -u printquest-api -n 50 --no-pager`,
          },
        ],
        whyItMatters:
          "Serviço que não volta sozinho depois de uma falha transforma incidente de dois minutos em madrugada perdida.",
        commonMistake: "Sair matando com kill -9 e depois descobrir dados corrompidos ou lock file preso.",
        productionTip: "Use Restart=on-failure com RestartSec para não entrar em laço de reinício agressivo, e sempre teste com reboot.",
        interviewQuestion: "Explique a diferença entre SIGTERM e SIGKILL e por que isso importa em deploy.",
        glossary: [
          { term: "unit", definition: "Arquivo de definição de um recurso gerenciado pelo systemd (serviço, timer, socket)." },
          { term: "zumbi", definition: "Processo que terminou mas cujo status ainda não foi coletado pelo processo pai." },
        ],
        printQuestLink: "Colocar a API do PrintQuest sob systemd, com restart automático e logs no journal.",
        quiz: [
          {
            question: "Qual comando mostra qual processo está escutando a porta 3000?",
            options: ["ps aux", "ss -tulpn", "df -h", "systemctl status"],
            answerIndex: 1,
            explanation: "ss -tulpn lista sockets em escuta com o processo associado.",
          },
        ],
      },
      {
        id: "l-1-4",
        moduleId: "mod-1",
        title: "Logs: encontrar a causa raiz com journalctl",
        duration: 40,
        difficulty: "Intermediário",
        tools: ["journalctl", "grep", "logrotate"],
        xp: 25,
        objectives: ["Filtrar logs por unidade, prioridade e tempo", "Correlacionar eventos entre serviços", "Evitar disco cheio por log"],
        body: [
          "Log é a fonte primária de verdade em incidente. Com journalctl você filtra por unidade (-u), por prioridade (-p err), por janela de tempo (--since/--until) e acompanha em tempo real (-f). O poder está na combinação: erros de uma unidade nos últimos dez minutos, em ordem, é geralmente o suficiente para achar a primeira falha — que costuma ser diferente do erro mais visível.",
          "A regra de ouro é procurar o primeiro erro, não o último. Cascatas escondem a origem: o timeout do frontend aparece depois do erro de conexão do banco. Correlacionar por timestamp entre proxy, aplicação e banco é a habilidade que separa quem adivinha de quem diagnostica.",
          "Log também é risco operacional e de segurança: enche disco e vaza dado sensível. Configure rotação e limite o journal, e revise o que a aplicação escreve — token, senha e dado pessoal jamais devem ir para log.",
        ],
        code: [
          {
            label: "Consultas essenciais",
            language: "bash",
            code: `journalctl -u printquest-api -n 200 --no-pager
journalctl -u printquest-api -p err --since "10 min ago"
journalctl --since "2026-09-06 09:00" --until "2026-09-06 09:30"
journalctl -u printquest-api -f              # seguir ao vivo
journalctl -k -p warning                     # mensagens do kernel
journalctl --disk-usage
sudo journalctl --vacuum-size=500M

# logs de aplicacao fora do journal
sudo grep -c "ERROR" /var/log/printquest/app.log
sudo awk '/ERROR/{print $1, $2, $NF}' /var/log/printquest/app.log | tail -20`,
            securityNote:
              "Antes de colar log em ticket ou chat, remova tokens, e-mails e IDs de clientes. Log compartilhado é vazamento frequente.",
          },
          {
            label: "Rotação de log da aplicação",
            language: "ini",
            code: `# /etc/logrotate.d/printquest
/var/log/printquest/*.log {
  daily
  rotate 14
  compress
  delaycompress
  missingok
  notifempty
  create 0640 printquest printquest
  sharedscripts
  postrotate
    systemctl reload printquest-api > /dev/null 2>&1 || true
  endscript
}`,
          },
        ],
        whyItMatters: "Vagas pedem troubleshooting. Na prática, isso significa ler log com método e provar a causa com evidência.",
        commonMistake: "Reiniciar o serviço antes de coletar log e perder a evidência do que aconteceu.",
        productionTip: "Padronize log estruturado em JSON com nível, requestId e contexto. Isso torna busca e alerta viáveis.",
        securityAlert: "Nunca logue Authorization, cookies de sessão ou dados de pagamento.",
        interviewQuestion: "Como você correlaciona uma falha vista pelo usuário com o log da aplicação e do banco?",
        glossary: [
          { term: "journald", definition: "Coletor de logs do systemd, com índice binário e filtros por metadados." },
          { term: "logrotate", definition: "Utilitário que rotaciona, comprime e remove logs antigos por política." },
        ],
        printQuestLink: "Padronizar o log JSON da API do PrintQuest e configurar rotação diária.",
        quiz: [
          {
            question: "Qual comando mostra apenas erros da unidade nos últimos 10 minutos?",
            options: [
              "journalctl -u app -f",
              "journalctl -u app -p err --since '10 min ago'",
              "journalctl --disk-usage",
              "tail -f /var/log/syslog",
            ],
            answerIndex: 1,
            explanation: "-p err filtra por prioridade e --since limita a janela de tempo.",
          },
        ],
      },
      {
        id: "l-1-5",
        moduleId: "mod-1",
        title: "SSH, acesso remoto e diagnóstico de recursos",
        duration: 40,
        difficulty: "Intermediário",
        tools: ["SSH", "top", "vmstat", "iostat", "df"],
        xp: 25,
        objectives: ["Acessar servidores com segurança e conforto", "Interpretar CPU, memória e disco", "Aplicar hardening básico no SSH"],
        body: [
          "SSH é a porta de entrada do trabalho remoto. Configure ~/.ssh/config com apelidos, usuário, chave e ProxyJump para bastion: além de digitar menos, você evita erro de conectar no host errado. No servidor, o hardening mínimo é desabilitar login por senha e login direto de root, deixando apenas chave.",
          "Ao entrar em um servidor com queixa de lentidão, siga uma ordem: carga e CPU (uptime, top), memória e swap (free -h, vmstat), disco em espaço e em I/O (df -h, iostat), depois rede e conexões. Load average acima do número de núcleos indica fila; swap ativo indica pressão de memória; %wa alto indica gargalo de I/O, não de processamento.",
          "Memória no Linux confunde: cache não é vazamento, é otimização. O que importa é available e a atividade de swap. E disco lotado, muitas vezes por logs ou imagens de container, produz sintomas que parecem falha de aplicação.",
        ],
        code: [
          {
            label: "SSH confortável e seguro",
            language: "bash",
            code: `cat >> ~/.ssh/config <<'EOF'
Host printquest-prod
  HostName 203.0.113.10
  User printquest-ops
  IdentityFile ~/.ssh/id_ed25519
  ServerAliveInterval 30

Host printquest-db
  HostName 10.0.2.15
  User printquest-ops
  ProxyJump printquest-prod
EOF

ssh printquest-prod
ssh -L 5432:localhost:5432 printquest-db   # tunel para acessar o banco local`,
            securityNote:
              "No servidor: PasswordAuthentication no, PermitRootLogin no. Aplique e teste em outra sessão antes de encerrar a atual.",
          },
          {
            label: "Diagnóstico em ordem",
            language: "bash",
            code: `uptime                       # load average 1/5/15 min
nproc                        # comparar load com nucleos
top -b -n1 | head -15
free -h                      # olhe a coluna available
vmstat 1 5                   # si/so indicam swap ativo
df -h && df -i               # espaco e inodes
iostat -xz 1 3 2>/dev/null   # %util e await por disco
ss -s                        # resumo de conexoes`,
          },
        ],
        whyItMatters:
          "Toda entrevista de infra faz a pergunta 'o servidor está lento, e agora?'. Ter um roteiro é a resposta que aprova.",
        commonMistake: "Concluir vazamento de memória olhando 'used' sem observar available e swap.",
        productionTip: "Monitore inodes além de espaço: milhões de arquivos pequenos enchem inodes com disco 'livre'.",
        securityAlert: "Cada pessoa com sua própria chave e usuário. Chave compartilhada elimina rastreabilidade.",
        interviewQuestion: "Load average 12 em uma máquina de 4 vCPUs: o que isso significa e o que você olha depois?",
        glossary: [
          { term: "load average", definition: "Média de processos prontos ou esperando execução; comparar sempre com o número de núcleos." },
          { term: "ProxyJump", definition: "Recurso do SSH para acessar host interno através de um bastion." },
        ],
        printQuestLink: "Preparar acesso seguro ao host de produção do PrintQuest via bastion.",
        quiz: [
          {
            question: "Em free -h, qual coluna melhor indica memória realmente utilizável?",
            options: ["used", "free", "available", "shared"],
            answerIndex: 2,
            explanation: "available estima quanto pode ser alocado sem swap, já considerando cache recuperável.",
          },
        ],
      },
    ],
  },
];
