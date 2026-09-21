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
      "Criar os repositórios cloudshop-app, cloudshop-infra e cloudshop-gitops, que serão usados em todos os módulos seguintes.",
    lessons: [
      {
        id: "l-0-1",
        moduleId: "mod-0",
        title: "O que uma pessoa DevOps realmente faz (e o que as vagas pedem em 2026)",
        duration: 35,
        difficulty: "Iniciante",
        tools: ["Mercado", "Carreira"],
        xp: 25,
        objectives: [
          "Explicar em uma frase o que a área entrega para a empresa",
          "Descrever o caminho completo de uma mudança, do commit até produção",
          "Separar mito de rotina real na função",
          "Ler uma vaga e identificar o que é obrigatório e o que é desejável",
          "Escolher uma trilha de especialização coerente com seu ponto de partida",
          "Montar um método de estudo que gera portfólio enquanto você aprende",
        ],
        body: [
          "<h3>1. O que é DevOps, em uma frase</h3><p>DevOps é a responsabilidade de <strong>encurtar e tornar seguro o caminho entre uma ideia escrita em código e o valor rodando em produção</strong>. Não é um programa que se instala nem um cargo mágico entre desenvolvimento e infraestrutura: é um conjunto de práticas (automação, versionamento, testes, observabilidade) sustentado por ferramentas.</p><p>Uma comparação ajuda: se a aplicação é o produto, o DevOps monta e opera a <em>linha de produção</em> que leva esse produto até a prateleira — várias vezes por dia, sem quebrar a prateleira.</p>",
          "<h3>2. O caminho de uma mudança (o fluxo que você vai automatizar)</h3><p>Todo o curso gira em torno destas etapas. Leia devagar, porque cada módulo à frente aprofunda uma delas:</p><ul><li><strong>Código</strong> — alguém escreve a mudança e faz commit em um repositório Git.</li><li><strong>Integração (CI)</strong> — um servidor baixa o código, instala dependências, roda testes e verifica segurança.</li><li><strong>Empacotamento</strong> — o resultado vira um artefato imutável: uma imagem de container com versão.</li><li><strong>Publicação (registry)</strong> — a imagem é enviada para um repositório de imagens.</li><li><strong>Infraestrutura</strong> — servidores, rede, banco e balanceador existem porque foram descritos em código (Terraform).</li><li><strong>Entrega (CD)</strong> — a versão nova sobe em ambiente de teste e depois em produção, de forma gradual e reversível.</li><li><strong>Operação</strong> — métricas, logs e traces mostram se está saudável; alertas avisam antes do cliente reclamar.</li><li><strong>Melhoria</strong> — incidentes geram aprendizado documentado e automação nova.</li></ul>",
          "<h3>3. Como se mede se esse fluxo é bom (métricas DORA)</h3><p>O mercado usa quatro indicadores. Guarde-os, porque aparecem em entrevista:</p><ul><li><strong>Frequência de deploy</strong>: com que frequência você entrega. Times maduros entregam várias vezes por dia.</li><li><strong>Lead time para mudança</strong>: quanto tempo passa entre o commit e a mudança em produção.</li><li><strong>Taxa de falha de mudança</strong>: quantos deploys causam problema.</li><li><strong>Tempo de restauração</strong>: quanto tempo leva para voltar ao normal depois de uma falha.</li></ul><p>Tudo que você vai aprender existe para melhorar um desses quatro números. Quando você automatiza um pipeline, está atacando lead time; quando cria um alerta com base em SLO, está atacando tempo de restauração.</p>",
          "<h3>4. Cargos vizinhos: quem faz o quê</h3><p>Os nomes variam por empresa, mas a divisão costuma ser esta:</p><ul><li><strong>DevOps Engineer</strong> — pipelines, containers, infraestrutura como código, automação de entrega.</li><li><strong>SRE (Site Reliability Engineer)</strong> — confiabilidade medida: SLI, SLO, orçamento de erro, plantão, postmortem.</li><li><strong>Platform Engineer</strong> — constrói a plataforma interna (Kubernetes, templates, catálogos) para que os times de produto entreguem sozinhos.</li><li><strong>Cloud Engineer</strong> — foco em provedor de nuvem: rede, identidade, contas, custo.</li><li><strong>DevSecOps</strong> — segurança dentro do pipeline: scanners, segredos, cadeia de suprimentos, permissões.</li></ul><p>O núcleo técnico é quase o mesmo. A diferença está na ênfase, e é isso que você identifica lendo a vaga.</p>",
          "<h3>5. O núcleo que praticamente toda vaga pede</h3><p>Analisando anúncios atuais em português e inglês, o conjunto repetido é estável:</p><ul><li><strong>Linux</strong> (permissões, processos, systemd, logs) e <strong>rede/HTTP</strong> (DNS, TLS, portas, proxy).</li><li><strong>Git</strong> com fluxo de branches e revisão de código.</li><li><strong>Containers</strong> (Docker) e <strong>orquestração</strong> (Kubernetes).</li><li><strong>Uma nuvem</strong> — AWS lidera as vagas, Azure e GCP aparecem em seguida.</li><li><strong>CI/CD</strong> — GitHub Actions e GitLab CI dominam.</li><li><strong>Infraestrutura como código</strong> — Terraform, com Ansible para configuração.</li><li><strong>Observabilidade</strong> — Prometheus, Grafana, OpenTelemetry, Loki.</li><li><strong>Scripting</strong> — Bash sempre, Python com frequência.</li><li><strong>Segurança e custo</strong> — menor privilégio, gestão de segredos, controle de gasto.</li></ul>",
          "<h3>6. Como ler uma vaga sem se intimidar</h3><p>Anúncios são lista de desejos, não requisitos absolutos. Faça esta triagem, sempre por escrito:</p><ul><li>Separe <strong>obrigatório</strong> (aparece no título, na primeira frase e repetido) de <strong>desejável</strong> (aparece em \"diferencial\", \"plus\", \"nice to have\").</li><li>Conte quantas ferramentas são do mesmo grupo: cinco nomes de observabilidade significam \"entenda observabilidade\", não \"domine cinco produtos\".</li><li>Identifique o <strong>problema da empresa</strong>: vaga que fala de plantão e SLO busca estabilidade; vaga que fala de esteira e onboarding busca velocidade.</li><li>Traduza cada requisito em uma pergunta de prova: \"o que eu mostraria em tela para provar isso?\".</li></ul>",
          "<h3>7. Como é uma semana real na função</h3><p>Para desfazer a fantasia: a maior parte do tempo não é criar coisa nova. Uma semana típica mistura</p><ul><li>manutenção de pipelines que quebraram por dependência, versão ou credencial expirada;</li><li>revisão de código de infraestrutura de colegas;</li><li>ajuste de limites de CPU/memória e custo;</li><li>atendimento a dúvidas de times de produto (\"meu deploy não subiu\");</li><li>investigação de um alerta ou incidente;</li><li>e um bloco de trabalho de melhoria: automatizar algo que hoje é manual.</li></ul><p>Quem vem do desenvolvimento tem vantagem real: já entende build, dependências, variáveis de ambiente e o que a aplicação precisa para rodar.</p>",
          "<h3>8. O método de estudo que funciona: conceito → artefato → registro</h3><p>Estudar DevOps lendo documentação solta não gera competência. O ciclo correto tem três passos, e você vai repeti-lo em cada aula:</p><ol><li><strong>Conceito</strong>: entenda o problema que a ferramenta resolve antes do comando.</li><li><strong>Artefato</strong>: aplique no seu projeto e deixe um arquivo versionado (Dockerfile, workflow, módulo Terraform, manifest, dashboard).</li><li><strong>Registro</strong>: escreva no diário técnico o que fez, o erro que apareceu e como resolveu.</li></ol><p>Ao final do curso o registro vale tanto quanto o código: é dele que saem as respostas de entrevista e o texto do seu portfólio.</p>",
          "<h3>9. O projeto que atravessa o curso: CloudShop</h3><p>Todas as aulas usam o mesmo sistema fictício, o <strong>CloudShop</strong>: um catálogo de produtos com frontend em Vue, API em Node e banco PostgreSQL. Por que um único projeto? Porque a dificuldade real não é rodar um comando, é integrar as partes.</p><p>A evolução é esta: rodar local → containerizar → pipeline de testes e imagem → infraestrutura na AWS com Terraform → migrar para Kubernetes → entrega automática por GitOps → observabilidade com métricas, logs, traces e SLO → revisão de custo e segurança.</p>",
          "<h3>10. Do zero ao ninja: o que provar em cada etapa</h3><ul><li><strong>Iniciante</strong>: opera Linux com confiança, usa Git corretamente, sobe a aplicação em container.</li><li><strong>Intermediário</strong>: escreve pipeline com testes e publicação de imagem, provisiona infraestrutura em código, entende rede da nuvem.</li><li><strong>Avançado</strong>: opera Kubernetes com probes, limites e Ingress, faz entrega por GitOps, instrumenta observabilidade.</li><li><strong>Ninja</strong>: define SLO, conduz incidente e postmortem, reduz custo com dados, fecha brechas de segurança e explica cada decisão com trade-off.</li></ul><p>A diferença entre os níveis não é quantidade de ferramentas: é a qualidade da justificativa por trás das escolhas.</p>",
          "<h3>11. Erros que mais atrasam quem começa</h3><ul><li>Começar por Kubernetes sem Linux, rede e containers — resulta em copiar YAML sem entender por que o Pod não sobe.</li><li>Colecionar cursos sem produzir artefato; sem repositório, não há prova.</li><li>Trocar de ferramenta a cada semana em vez de aprofundar em uma stack.</li><li>Ignorar custo e segurança, que são justamente os assuntos que aparecem na entrevista final.</li><li>Não anotar erros: você resolverá o mesmo problema três vezes.</li></ul>",
          "<h3>12. O que você deve conseguir fazer antes de seguir</h3><p>Antes da próxima aula, deixe pronto: uma frase sua explicando o que DevOps entrega; a leitura de três vagas reais com obrigatório e desejável separados; e a primeira entrada do diário técnico no repositório de documentação. Se conseguir explicar em voz alta o caminho do commit até produção, está pronto para montar o ambiente.</p>",
        ],
        code: [
          {
            label: "Diário técnico: modelo de entrada diária",
            language: "markdown",
            code: `## 2026-09-06 — Módulo 0

**O que fiz:** configurei chave SSH e criei os 3 repositórios do CloudShop.
**Comando que aprendi:** ssh -T git@github.com
**Erro que enfrentei:** permission denied (publickey) — a chave não estava no agente.
**Como resolvi:** ssh-add ~/.ssh/id_ed25519
**Por que importa no trabalho:** acesso a repositório é o primeiro bloqueio de qualquer onboarding.`,
            securityNote:
              "Nunca cole tokens, senhas ou chaves privadas no diário. Registre apenas o nome da variável usada.",
          },
          {
            label: "Ficha de leitura de vaga (copie e preencha para 3 vagas)",
            language: "markdown",
            code: `# Vaga: DevOps Engineer — empresa X (remoto)

## Obrigatorios (repetidos no anuncio)
- Linux, Docker, Kubernetes, AWS, Terraform, GitHub Actions

## Desejaveis (diferenciais)
- Prometheus/Grafana, Python, certificacao AWS

## Problema que a empresa tem
- Deploy manual e demorado -> quer velocidade e reversibilidade

## O que eu ja provo com artefato
- Docker: sim (Dockerfile do CloudShop)
- Terraform: ainda nao -> modulo 7

## Pergunta que eu faria na entrevista
- Como voces medem lead time hoje?`,
          },
          {
            label: "Medindo lead time de forma simples com Git",
            language: "bash",
            code: `# Data do commit mais antigo que ainda nao foi para producao (branch main vs tag de release)
git log --pretty='%h %ad %s' --date=iso origin/main ^v1.4.0 | tail -1
# Saida esperada: 9f2c1ab 2026-09-02 10:12:00 -0300 feat: cupom de desconto

# Quantos commits estao aguardando entrega
git rev-list --count v1.4.0..origin/main
# Saida esperada: 12   <- 12 mudancas prontas e paradas: lead time alto

# Frequencia de deploy: quantas tags de release nos ultimos 30 dias
git tag --sort=-creatordate --format='%(creatordate:short) %(refname:short)' | head -10
# Saida esperada: lista de datas; se houver 1 tag por mes, a frequencia e baixa`,
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
          { term: "DevOps", definition: "Conjunto de práticas para entregar mudanças em produção com rapidez, segurança e possibilidade de reverter." },
          { term: "SRE", definition: "Engenharia de confiabilidade: aplica práticas de engenharia para manter serviços dentro de metas mensuráveis (SLO)." },
          { term: "Platform Engineering", definition: "Construir plataforma interna e caminhos padronizados para que times de produto entreguem sozinhos com segurança." },
          { term: "CI", definition: "Integração contínua: a cada commit, o código é construído e testado automaticamente." },
          { term: "CD", definition: "Entrega/implantação contínua: publicação automatizada da versão aprovada nos ambientes." },
          { term: "Lead time", definition: "Tempo entre o commit e a mudança disponível em produção." },
          { term: "DORA", definition: "Conjunto de quatro métricas usadas para avaliar a maturidade de entrega de um time." },
          { term: "Artefato", definition: "Resultado imutável e versionado de um build, como uma imagem de container." },
        ],
        printQuestLink: "Definir o escopo do CloudShop e escrever o primeiro registro do diário técnico.",
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
          {
            question: "Qual métrica DORA mede o tempo entre o commit e a mudança em produção?",
            options: ["Frequência de deploy", "Lead time para mudança", "Tempo de restauração", "Taxa de falha de mudança"],
            answerIndex: 1,
            explanation: "Lead time mede a travessia do commit até produção; frequência mede quantas vezes você entrega.",
          },
          {
            question: "Em um anúncio, dez ferramentas de observabilidade aparecem em 'diferenciais'. Como interpretar?",
            options: [
              "É obrigatório dominar todas antes de se candidatar",
              "A empresa quer que você entenda observabilidade; uma stack bem dominada basta",
              "O anúncio está errado e deve ser ignorado",
              "Significa que a vaga é apenas para nível sênior",
            ],
            answerIndex: 1,
            explanation: "Diferenciais indicam contexto e ênfase; o conceito domina, o produto específico se aprende no trabalho.",
          },
          {
            question: "Qual é o ciclo de estudo recomendado no curso?",
            options: [
              "Assistir vídeo, decorar comandos, repetir",
              "Conceito, artefato versionado no projeto e registro do que aprendeu",
              "Ler documentação inteira antes de praticar",
              "Começar por Kubernetes para acelerar",
            ],
            answerIndex: 1,
            explanation: "Entender o problema, produzir artefato e registrar a decisão é o que gera portfólio e resposta de entrevista.",
          },
        ],
      },
      {
        id: "l-0-2",
        moduleId: "mod-0",
        title: "Ambiente Linux profissional com WSL2 (ou VM)",
        duration: 45,
        difficulty: "Iniciante",
        tools: ["WSL2", "Ubuntu", "Shell"],
        xp: 25,
        objectives: [
          "Instalar e validar um Linux utilizável para trabalho real",
          "Entender a estrutura de diretórios e o modelo de permissões",
          "Inspecionar processos, serviços e logs com comandos básicos",
          "Configurar shell, histórico e aliases úteis",
          "Entender por que trabalhar dentro do filesystem Linux é mais rápido",
        ],
        body: [
          "<h3>1. Por que Linux é obrigatório</h3><p>Praticamente todo servidor, container e nó de Kubernetes que você vai administrar roda Linux. Containers, inclusive, são um recurso do <strong>kernel Linux</strong>: sem kernel Linux não existe container nativo. Por isso o seu ambiente de estudo precisa ser Linux — não por gosto, mas por semelhança com produção.</p>",
          "<h3>2. Três caminhos: WSL2, máquina virtual ou nativo</h3><ul><li><strong>WSL2 (Windows)</strong>: kernel Linux real rodando ao lado do Windows, com integração com o editor e com Docker. É o caminho mais produtivo em Windows.</li><li><strong>Máquina virtual</strong> (VirtualBox, UTM, Multipass): útil quando você quer praticar systemd, reboot, disco e rede isolada.</li><li><strong>Linux nativo</strong>: melhor desempenho e nenhuma camada intermediária.</li></ul><p>Em macOS, use o terminal nativo para o dia a dia mais uma VM leve (por exemplo Multipass) quando precisar de systemd.</p>",
          "<h3>3. Instalando passo a passo (Windows)</h3><ol><li>Abra o PowerShell <strong>como administrador</strong>.</li><li>Rode <code>wsl --install -d Ubuntu-24.04</code>: isso habilita o subsistema, baixa a distribuição e pede reinício.</li><li>Garanta a versão 2 com <code>wsl --set-default-version 2</code>.</li><li>No primeiro início, crie usuário e senha do Linux — eles são independentes do Windows.</li><li>Atualize os pacotes e instale utilitários básicos.</li></ol><p>Escolha sempre uma versão <strong>LTS</strong> (suporte longo). Servidores usam LTS, e você quer praticar no mesmo terreno.</p>",
          "<h3>4. A anatomia do filesystem</h3><p>Diretórios que você vai usar todo dia:</p><ul><li><code>/etc</code> — arquivos de configuração do sistema e dos serviços.</li><li><code>/var/log</code> — logs; o primeiro lugar a olhar em um problema.</li><li><code>/home/seu-usuario</code> (ou <code>~</code>) — seus arquivos e configurações pessoais.</li><li><code>/usr/local/bin</code> — binários que você instala manualmente (kubectl, helm).</li><li><code>/tmp</code> — arquivos temporários, apagados no reinício.</li><li><code>/proc</code> e <code>/sys</code> — visões do kernel em tempo real, não arquivos de verdade.</li></ul>",
          "<h3>5. Permissões: o modelo que explica metade dos erros</h3><p>Cada arquivo tem <strong>dono</strong>, <strong>grupo</strong> e três conjuntos de permissões: leitura (r=4), escrita (w=2) e execução (x=1). Por isso <code>chmod 640</code> significa dono lê e escreve, grupo lê, outros nada. Em diretórios, <code>x</code> é permissão de <em>entrar</em>.</p><p>Quando um comando devolve <code>permission denied</code>, a pergunta correta não é \"qual sudo resolve\", é: <em>qual usuário está executando e o que ele precisa acessar?</em> Isso vale para chave SSH (<code>600</code>), para o socket do Docker e para volumes de container.</p>",
          "<h3>6. Processos: quem está consumindo a máquina</h3><p>Um processo tem um identificador (PID), um dono e um estado. Ferramentas essenciais: <code>ps aux</code> para listar, <code>top</code>/<code>htop</code> para acompanhar em tempo real, <code>kill</code> para pedir encerramento (sinal TERM) e <code>kill -9</code> para forçar (sinal KILL). Containers usam exatamente os mesmos conceitos — um container é um processo isolado.</p>",
          "<h3>7. Serviços e systemd</h3><p>Em servidores, programas de longa duração são gerenciados pelo <strong>systemd</strong>: <code>systemctl status nginx</code> mostra se está rodando, <code>systemctl enable --now</code> ativa no boot e inicia agora, e <code>journalctl -u nginx -f</code> acompanha os logs. No WSL2 o systemd precisa ser habilitado em <code>/etc/wsl.conf</code>; se preferir, pratique serviços em uma VM.</p>",
          "<h3>8. Pacotes: instalar sem quebrar o sistema</h3><p><code>apt update</code> atualiza a lista de pacotes disponíveis; <code>apt upgrade</code> atualiza o que está instalado; <code>apt install -y pacote</code> instala. Regra prática: em servidores, atualização é mudança — deve ser planejada, registrada e testada, não feita no impulso.</p>",
          "<h3>9. Deixando o shell confortável (15 minutos que você usa por anos)</h3><p>Configure histórico grande com data, aliases para comandos repetidos e um diretório de trabalho próprio. Histórico com data vira documentação do que você fez em um incidente; aliases reduzem erro de digitação em comandos longos como <code>kubectl</code> e <code>terraform</code>.</p>",
          "<h3>10. A armadilha do /mnt/c</h3><p>No WSL2 você pode acessar os arquivos do Windows em <code>/mnt/c</code>, mas cada leitura atravessa uma ponte entre sistemas de arquivos diferentes. O efeito prático é build e instalação de dependências drasticamente mais lentos. Trabalhe sempre em <code>~/projetos</code>, dentro do filesystem Linux, e abra a pasta pelo editor com integração WSL.</p>",
          "<h3>11. Validar em vez de supor</h3><p>Ao terminar qualquer instalação, confirme com comando: distro e versão, kernel, memória, disco e núcleos de CPU. Esse é exatamente o reflexo que você usará no primeiro minuto de um incidente: coletar fatos antes de formular hipótese.</p>",
          "<h3>12. Checagem final da aula</h3><p>Você deve conseguir: abrir o Linux, dizer a versão do kernel, listar processos, ver espaço em disco, explicar o que significa <code>644</code> e mostrar seu <code>~/projetos/cloudshop</code> criado. Anote no diário as versões encontradas.</p>",
        ],
        code: [
          {
            label: "Instalar e validar o ambiente",
            language: "bash",
            code: `# Windows PowerShell (como administrador)
wsl --install -d Ubuntu-24.04     # instala o subsistema + Ubuntu LTS
wsl --set-default-version 2       # garante WSL2 (kernel real)

# Dentro do Ubuntu
lsb_release -a          # distro e versao   -> Ubuntu 24.04.1 LTS
uname -r                # versao do kernel  -> 5.15.167.4-microsoft-standard-WSL2
free -h                 # memoria           -> Mem: 7,7Gi  disponivel 6,9Gi
df -h /                 # disco             -> /dev/sdc 1007G  3% /
nproc                   # nucleos de CPU    -> 8

sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git jq unzip build-essential tree htop`,
          },
          {
            label: "Permissões e processos na prática",
            language: "bash",
            code: `mkdir -p ~/projetos/cloudshop && cd ~/projetos/cloudshop
echo "segredo=nao" > config.txt
ls -l config.txt          # -rw-r--r-- 1 user user 13 ... config.txt  (644)
chmod 600 config.txt      # so o dono le e escreve (padrao para arquivos sensiveis)
ls -l config.txt          # -rw------- 1 user user

ps aux | head -5          # lista processos: USER PID %CPU %MEM COMMAND
ps aux --sort=-%mem | head -5   # os 5 que consomem mais memoria
sleep 300 &               # cria um processo em segundo plano -> [1] 4211
kill 4211                 # pede encerramento (sinal TERM)
kill -9 4211 2>/dev/null  # forca, se o processo ignorou o TERM`,
            securityNote:
              "Arquivos de configuração com credencial devem ser 600. Chave SSH com permissão aberta é recusada pelo próprio cliente.",
          },
          {
            label: "Serviços e logs com systemd (VM ou WSL2 com systemd ativo)",
            language: "bash",
            code: `sudo apt install -y nginx
systemctl status nginx          # Active: active (running) since ...
sudo systemctl enable --now nginx   # ativa no boot e inicia agora
curl -sI localhost | head -1    # HTTP/1.1 200 OK
journalctl -u nginx -n 20 --no-pager   # ultimas 20 linhas de log do servico
sudo systemctl restart nginx    # reinicia o servico apos mudar configuracao`,
          },
          {
            label: "Aliases e histórico no ~/.bashrc",
            language: "bash",
            code: `cat >> ~/.bashrc <<'EOF'
export HISTSIZE=50000
export HISTFILESIZE=100000
export HISTTIMEFORMAT='%F %T '   # historico com data: vira documentacao de incidente
alias ll='ls -alh'
alias gs='git status -sb'
alias k='kubectl'
alias tf='terraform'
alias dc='docker compose'
EOF
source ~/.bashrc
history | tail -3        # confirma que as datas aparecem`,
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
          { term: "systemd", definition: "Gerenciador de serviços do Linux moderno: inicia, reinicia e supervisiona processos de longa duração." },
          { term: "journalctl", definition: "Ferramenta que consulta os logs coletados pelo systemd, por serviço e por período." },
          { term: "PID", definition: "Identificador numérico de um processo em execução." },
          { term: "chmod", definition: "Comando que altera permissões de leitura, escrita e execução de arquivos e diretórios." },
          { term: "apt", definition: "Gerenciador de pacotes das distribuições Debian/Ubuntu." },
          { term: "shell", definition: "Programa que interpreta seus comandos; no curso usamos Bash." },
        ],
        printQuestLink: "Criar ~/projetos/cloudshop, onde todo o código do projeto viverá.",
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
          {
            question: "O que significa a permissão 640 em um arquivo?",
            options: [
              "Todos leem e escrevem",
              "Dono lê e escreve, grupo lê, outros não acessam",
              "Somente execução para o dono",
              "Dono lê, grupo escreve, outros executam",
            ],
            answerIndex: 1,
            explanation: "6 = leitura+escrita para o dono, 4 = leitura para o grupo, 0 = nenhum acesso para outros.",
          },
          {
            question: "Qual comando mostra os logs de um serviço gerenciado pelo systemd?",
            options: ["cat /etc/nginx/nginx.conf", "journalctl -u nginx", "ps aux | grep nginx", "df -h"],
            answerIndex: 1,
            explanation: "journalctl consulta o log do systemd; a opção -u filtra por unidade (serviço).",
          },
          {
            question: "Ao receber 'permission denied', qual é a primeira pergunta correta?",
            options: [
              "Qual sudo resolve mais rápido?",
              "Qual usuário está executando e a que recurso ele precisa acessar?",
              "A ferramenta está com bug?",
              "Preciso reinstalar o sistema?",
            ],
            answerIndex: 1,
            explanation: "Erro de permissão é quase sempre identidade e dono/grupo do recurso, não defeito da ferramenta.",
          },
        ],
      },
      {
        id: "l-0-3",
        moduleId: "mod-0",
        title: "Git, GitHub e chave SSH: acesso sem senha e sem dor",
        duration: 40,
        difficulty: "Iniciante",
        tools: ["Git", "GitHub", "SSH"],
        xp: 25,
        objectives: [
          "Entender como funciona a criptografia de chave pública no acesso ao repositório",
          "Gerar e registrar uma chave ed25519",
          "Configurar identidade e comportamento padrão do Git",
          "Criar os três repositórios do projeto e fazer o primeiro push",
          "Escolher entre chave de deploy, token e GitHub App em automações",
        ],
        body: [
          "<h3>1. Por que não usar senha</h3><p>Autenticar por HTTPS colando token a cada push é atrito e risco: o token costuma parar em arquivo, em histórico de shell ou em print de tela. Com <strong>chave SSH</strong>, a parte secreta nunca sai da sua máquina e o acesso pode ser revogado em um clique no provedor.</p>",
          "<h3>2. Como funciona um par de chaves</h3><p>Você gera <strong>duas</strong> chaves ligadas matematicamente: a <em>privada</em> (<code>id_ed25519</code>) fica na sua máquina; a <em>pública</em> (<code>id_ed25519.pub</code>) é cadastrada no GitHub. Na conexão, o servidor envia um desafio, sua máquina responde assinando com a chave privada e o servidor valida com a pública. A chave privada nunca é transmitida.</p><p>Use o algoritmo <strong>ed25519</strong>: chaves curtas, rápidas e recomendadas hoje. Proteja com passphrase — se o notebook for roubado, a chave sozinha não serve.</p>",
          "<h3>3. ssh-agent: digitar a passphrase uma vez só</h3><p>O <code>ssh-agent</code> é um processo que mantém sua chave destravada em memória durante a sessão. Sem ele, cada operação pede a passphrase. O erro <code>permission denied (publickey)</code> em 90% dos casos significa: a chave não está no agente, ou a chave pública certa não está cadastrada.</p>",
          "<h3>4. known_hosts e confiança no servidor</h3><p>Na primeira conexão, o SSH pergunta se você confia na impressão digital do servidor e salva a resposta em <code>~/.ssh/known_hosts</code>. Isso protege contra alguém se passar pelo GitHub na sua rede. Se a impressão mudar sem motivo, <strong>pare</strong> e investigue em vez de apagar o arquivo.</p>",
          "<h3>5. Configurações de Git que evitam confusão</h3><ul><li><code>user.name</code> e <code>user.email</code>: aparecem em todo commit e são usados na revisão.</li><li><code>init.defaultBranch main</code>: nome padrão do branch inicial.</li><li><code>pull.rebase true</code>: traz mudanças remotas sem criar commits de merge desnecessários.</li><li><code>push.default current</code>: envia apenas o branch atual, evitando push acidental em outros.</li></ul>",
          "<h3>6. O vocabulário mínimo do Git</h3><ul><li><strong>Working directory</strong>: seus arquivos como estão agora.</li><li><strong>Staging (index)</strong>: o que você selecionou com <code>git add</code> para o próximo commit.</li><li><strong>Commit</strong>: uma fotografia imutável com autor, data e mensagem.</li><li><strong>Branch</strong>: um ponteiro para um commit; serve para trabalhar em paralelo.</li><li><strong>Remote</strong>: o repositório no servidor (<code>origin</code>).</li><li><strong>Pull request</strong>: proposta de mudança revisada antes de entrar em main.</li></ul>",
          "<h3>7. O fluxo diário, em cinco comandos</h3><p><code>git switch -c feat/preco</code> → edita → <code>git add -p</code> (revisa trecho a trecho) → <code>git commit -m \"feat: exibe preço com desconto\"</code> → <code>git push -u origin feat/preco</code> → abre pull request. Mensagens no padrão <em>Conventional Commits</em> (<code>feat:</code>, <code>fix:</code>, <code>chore:</code>) permitem gerar versão e changelog automaticamente mais tarde.</p>",
          "<h3>8. Três repositórios, três responsabilidades</h3><p>O CloudShop usa repositórios separados de propósito:</p><ul><li><code>cloudshop-app</code> — código da aplicação e seus testes.</li><li><code>cloudshop-infra</code> — infraestrutura como código (Terraform).</li><li><code>cloudshop-gitops</code> — manifests que descrevem o que roda no cluster.</li></ul><p>Separar não é preciosismo: permite exigir revisão mais rígida na infraestrutura do que na aplicação e reduz o estrago de um acesso comprometido.</p>",
          "<h3>9. .gitignore e o que nunca deve entrar no repositório</h3><p>Antes do primeiro commit, crie o <code>.gitignore</code>: dependências (<code>node_modules</code>), artefatos de build (<code>dist</code>), arquivos de ambiente (<code>.env</code>) e estado do Terraform local. Segredo comitado é incidente: mesmo apagado depois, continua no histórico e precisa ser rotacionado.</p>",
          "<h3>10. Automação: chave de deploy, token ou GitHub App</h3><ul><li><strong>Deploy key</strong>: chave SSH ligada a <em>um</em> repositório, ideal para leitura em servidor ou runner.</li><li><strong>Personal Access Token (PAT)</strong>: vinculado a uma pessoa; simples, mas carrega as permissões dela e expira mal gerenciado.</li><li><strong>GitHub App</strong>: identidade própria, permissões finas e token de curta duração — o padrão em empresa.</li></ul>",
          "<h3>11. Diagnóstico quando o acesso falha</h3><p>Sequência que resolve quase tudo: <code>ssh -T git@github.com</code> para testar identidade; <code>ssh -vT git@github.com</code> para ver qual chave foi oferecida; <code>ssh-add -l</code> para conferir o que está no agente; <code>git remote -v</code> para verificar se o remote é SSH e não HTTPS.</p>",
          "<h3>12. Checagem final da aula</h3><p>Ao final você deve ter: chave cadastrada, <code>ssh -T</code> respondendo com seu usuário, os três repositórios criados com README e <code>.gitignore</code>, e um commit enviado em cada um.</p>",
        ],
        code: [
          {
            label: "Chave SSH e configuração do Git",
            language: "bash",
            code: `ssh-keygen -t ed25519 -C "voce@exemplo.com" -f ~/.ssh/id_ed25519
# Enter passphrase: (defina uma) -> gera id_ed25519 (privada) e id_ed25519.pub (publica)

eval "$(ssh-agent -s)"        # Agent pid 3120
ssh-add ~/.ssh/id_ed25519     # Identity added
cat ~/.ssh/id_ed25519.pub     # cole em GitHub > Settings > SSH keys

ssh -T git@github.com         # Hi seu-usuario! You've successfully authenticated...

git config --global user.name "Seu Nome"
git config --global user.email "voce@exemplo.com"
git config --global init.defaultBranch main
git config --global pull.rebase true
git config --global push.default current
git config --global --list | head -10   # confere o resultado`,
            securityNote:
              "id_ed25519 (sem .pub) é a chave privada: nunca compartilhe, nunca comite, sempre proteja com passphrase.",
          },
          {
            label: "Diagnóstico de 'permission denied (publickey)'",
            language: "bash",
            code: `ssh-add -l                    # lista chaves no agente; "The agent has no identities" = problema
ssh-add ~/.ssh/id_ed25519     # adiciona novamente
ssh -vT git@github.com 2>&1 | grep -i "offering\\|Authenticated"
# debug1: Offering public key: ~/.ssh/id_ed25519 ED25519
# debug1: Authenticated to github.com

git remote -v                 # origin git@github.com:usuario/repo.git (fetch)  <- SSH, correto
# Se aparecer https://github.com/... troque o remote:
git remote set-url origin git@github.com:usuario/cloudshop-app.git`,
          },
          {
            label: "Criando os três repositórios e o primeiro commit",
            language: "bash",
            code: `cd ~/projetos
for repo in cloudshop-app cloudshop-infra cloudshop-gitops; do
  mkdir -p "$repo" && cd "$repo"
  git init -b main
  printf '# %s\\n\\nParte do projeto CloudShop.\\n' "$repo" > README.md
  printf 'node_modules/\\ndist/\\n.env\\n*.tfstate*\\n.terraform/\\n' > .gitignore
  git add . && git commit -m "chore: estrutura inicial do repositorio"
  git remote add origin "git@github.com:SEU_USUARIO/$repo.git"
  git push -u origin main      # Branch 'main' set up to track 'origin/main'
  cd ..
done`,
            securityNote:
              "O .gitignore com .env e *.tfstate entra no primeiro commit de propósito: evita vazar credencial e estado de infraestrutura.",
          },
          {
            label: "~/.ssh/config: múltiplas contas e chaves",
            language: "bash",
            code: `cat >> ~/.ssh/config <<'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes        # oferece somente esta chave (evita bloqueio por tentativas)
EOF
chmod 600 ~/.ssh/config     # permissao aberta faz o cliente recusar o arquivo
ssh -T git@github.com       # Hi seu-usuario!`,
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
          { term: "known_hosts", definition: "Arquivo que guarda a impressão digital dos servidores já aceitos, protegendo contra impostores." },
          { term: "staging area", definition: "Área intermediária do Git onde você seleciona o que entrará no próximo commit." },
          { term: "remote", definition: "Referência ao repositório hospedado no servidor, normalmente chamada origin." },
          { term: "pull request", definition: "Proposta de mudança aberta para revisão antes de ser integrada ao branch principal." },
          { term: "deploy key", definition: "Chave SSH com acesso restrito a um único repositório, usada por máquinas e automações." },
          { term: "Conventional Commits", definition: "Padrão de mensagem (feat, fix, chore) que permite gerar versão e changelog automaticamente." },
        ],
        printQuestLink: "Criar cloudshop-app, cloudshop-infra e cloudshop-gitops com README inicial.",
        quiz: [
          {
            question: "Qual arquivo você registra no GitHub?",
            options: ["~/.ssh/id_ed25519", "~/.ssh/id_ed25519.pub", "~/.ssh/known_hosts", "~/.ssh/config"],
            answerIndex: 1,
            explanation: "Somente a chave pública (.pub) é enviada ao provedor; a privada permanece local.",
          },
          {
            question: "O que faz o ssh-agent?",
            options: [
              "Envia a chave privada ao servidor a cada conexão",
              "Mantém a chave privada destravada em memória para não pedir a passphrase toda hora",
              "Gera um novo par de chaves por conexão",
              "Guarda a impressão digital dos servidores conhecidos",
            ],
            answerIndex: 1,
            explanation: "A chave privada nunca é enviada; o agente apenas a mantém disponível para assinar desafios.",
          },
          {
            question: "Qual credencial é mais adequada para um runner de CI que só precisa ler um repositório?",
            options: ["Senha da conta pessoal", "Deploy key com permissão de leitura", "Token de administrador da organização", "A chave privada do seu notebook"],
            answerIndex: 1,
            explanation: "Deploy key limita o acesso a um repositório e a um nível de permissão, seguindo o menor privilégio.",
          },
          {
            question: "Você comitou um arquivo .env com senha e apagou no commit seguinte. O que fazer?",
            options: [
              "Nada, o arquivo já foi removido",
              "Rotacionar imediatamente a credencial, porque ela continua no histórico",
              "Apenas adicionar ao .gitignore",
              "Renomear o arquivo para .env.bak",
            ],
            answerIndex: 1,
            explanation: "O histórico do Git preserva o conteúdo; a única correção real é invalidar e trocar a credencial.",
          },
        ],
      },
      {
        id: "l-0-4",
        moduleId: "mod-0",
        title: "Instalando o arsenal: Docker, Node, AWS CLI, Terraform, kubectl e Helm",
        duration: 50,
        difficulty: "Iniciante",
        tools: ["Docker", "Node", "AWS CLI", "Terraform", "kubectl", "Helm"],
        xp: 25,
        objectives: [
          "Entender o papel de cada ferramenta no ciclo de entrega",
          "Instalar as ferramentas do curso e validar cada uma com um teste real",
          "Fixar versões para evitar surpresas em máquina e em pipeline",
          "Diagnosticar os erros de instalação mais comuns",
        ],
        body: [
          "<h3>1. Cada ferramenta tem um lugar no ciclo</h3><ul><li><strong>Docker</strong> — empacota a aplicação com suas dependências em uma imagem que roda igual em qualquer lugar.</li><li><strong>Node</strong> — runtime do CloudShop; roda a aplicação e seus testes.</li><li><strong>AWS CLI</strong> — conversa com a nuvem pela linha de comando, de forma automatizável.</li><li><strong>Terraform</strong> — descreve a infraestrutura em arquivos versionados.</li><li><strong>kubectl</strong> — opera o cluster Kubernetes.</li><li><strong>Helm</strong> — empacota manifests em releases parametrizáveis.</li></ul><p>Instalar tudo agora evita interromper o estudo no meio de um módulo.</p>",
          "<h3>2. Duas formas de instalar, e quando usar cada uma</h3><p><strong>Gerenciador de pacotes</strong> (apt, snap, brew) traz atualização automática e é bom para a máquina de trabalho. <strong>Gerenciador de versão</strong> (nvm para Node, tfenv para Terraform) permite ter várias versões e trocar por projeto — indispensável quando um repositório exige Terraform 1.6 e outro 1.9.</p>",
          "<h3>3. Docker: instalar e entender o que aconteceu</h3><p>O instalador coloca no sistema o <em>daemon</em> (serviço que cria e gerencia containers) e o <em>cliente</em> <code>docker</code>. O cliente conversa com o daemon por um socket em <code>/var/run/docker.sock</code>, que pertence ao grupo <code>docker</code>. Por isso você adiciona seu usuário a esse grupo — e por isso precisa reabrir a sessão para o novo grupo valer.</p><p>Consciência de segurança: pertencer ao grupo <code>docker</code> equivale, na prática, a acesso administrativo à máquina, porque você pode montar qualquer diretório dentro de um container.</p>",
          "<h3>4. Validar Docker de verdade</h3><p><code>docker --version</code> só prova que o binário existe. A validação real é rodar um container (<code>docker run --rm hello-world</code>), listar imagens e conferir o serviço com <code>docker info</code>. Se aparecer <code>permission denied ... /var/run/docker.sock</code>, o problema é grupo/sessão, não instalação.</p>",
          "<h3>5. Node com nvm</h3><p>Instale o <strong>nvm</strong> e depois a versão LTS. Com <code>nvm install --lts</code> e <code>nvm use</code>, cada projeto pode fixar sua versão em um arquivo <code>.nvmrc</code>. Isso evita o clássico \"funciona na minha máquina\": a versão do runtime passa a ser parte do repositório.</p>",
          "<h3>6. AWS CLI v2</h3><p>A versão 2 é distribuída como pacote próprio (não via pip) e inclui recursos como login por SSO. Após instalar, valide com <code>aws --version</code>; a validação de credencial vem na próxima aula, com <code>aws sts get-caller-identity</code>.</p>",
          "<h3>7. Terraform, kubectl e Helm</h3><p><strong>Terraform</strong> é um binário único; prefira instalar por repositório oficial ou tfenv para controlar a versão. <strong>kubectl</strong> deve estar próximo da versão do cluster (a regra suportada é uma versão menor de diferença). <strong>Helm</strong> v3 não tem componente no cluster, é só um cliente que gera e aplica manifests.</p>",
          "<h3>8. Por que fixar versão é tão importante</h3><p>Terraform muda comportamento entre versões menores e o arquivo de estado é sensível a isso. Em pipelines, ferramenta sem versão fixa gera build que quebra <em>sem ninguém ter mudado código</em> — um dos incidentes mais frustrantes que existe. A regra é: versão explícita na máquina, no arquivo do repositório e no workflow de CI.</p>",
          "<h3>9. Documentando o arsenal</h3><p>Crie <code>docs/ferramentas.md</code> com a versão de cada ferramenta e a data. Esse arquivo responde em segundos a pergunta \"o que mudou desde que funcionava?\" e é o mesmo hábito que empresas formalizam em bill of materials.</p>",
          "<h3>10. Erros comuns e o que eles significam</h3><ul><li><code>permission denied /var/run/docker.sock</code> → falta grupo docker ou sessão não reaberta.</li><li><code>command not found</code> após instalar manualmente → binário fora do PATH; mova para <code>/usr/local/bin</code>.</li><li><code>nvm: command not found</code> em novo terminal → falta carregar o nvm no <code>~/.bashrc</code>.</li><li>kubectl muito novo/antigo em relação ao cluster → mensagens estranhas de API; alinhe versões.</li></ul>",
          "<h3>11. Cuidado com instalação por script da internet</h3><p>Baixar um script e executá-lo direto no shell exige confiança total na origem. Em ambiente corporativo, use o repositório de pacotes aprovado, verifique checksum ou assinatura e prefira versões fixas em vez de \"latest\".</p>",
          "<h3>12. Checagem final da aula</h3><p>Rode a bateria de validação: <code>docker run --rm hello-world</code>, <code>node -v</code>, <code>aws --version</code>, <code>terraform -version</code>, <code>kubectl version --client</code>, <code>helm version</code>. Registre a saída no diário e no <code>docs/ferramentas.md</code>.</p>",
        ],
        code: [
          {
            label: "Instalação e validação",
            language: "bash",
            code: `# Docker Engine (Ubuntu/WSL2)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"   # reabra a sessao depois (exit e entrar de novo)
docker run --rm hello-world       # "Hello from Docker!" = cliente + daemon ok

# Node via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc && nvm install --lts && node -v && npm -v   # v22.x / 10.x

# AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip
unzip -q awscliv2.zip && sudo ./aws/install && aws --version  # aws-cli/2.x

# Terraform, kubectl e Helm
sudo snap install terraform --classic
curl -LO "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -m 0755 kubectl /usr/local/bin/kubectl
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

terraform -version && kubectl version --client && helm version`,
            securityNote:
              "Baixar script e executar direto no shell exige confiança na origem. Em ambiente corporativo, use o repositório de pacotes aprovado e verifique checksum.",
          },
          {
            label: "Diagnóstico rápido de Docker",
            language: "bash",
            code: `docker info | head -8        # mostra versao do servidor, storage driver, containers ativos
# Se der: permission denied while trying to connect to the Docker daemon socket
id -nG                       # confira se 'docker' aparece nos seus grupos
newgrp docker                # aplica o grupo na sessao atual (alternativa a reabrir o terminal)
docker run --rm alpine sh -c 'echo dentro do container; uname -r'
# dentro do container
# 5.15.167.4-microsoft-standard-WSL2   <- mesmo kernel do host: container nao e VM`,
            securityNote:
              "Quem está no grupo docker pode montar / dentro de um container e ler qualquer arquivo: trate como acesso administrativo.",
          },
          {
            label: "Fixando versões no repositório",
            language: "bash",
            code: `cd ~/projetos/cloudshop-app
node -v | sed 's/^v//' > .nvmrc          # ex.: 22.11.0 -> quem clonar roda 'nvm use'

cat > docs/ferramentas.md <<EOF
# Ferramentas (atualizado em $(date +%F))
- docker: $(docker --version | awk '{print $3}' | tr -d ,)
- node: $(node -v)
- aws-cli: $(aws --version | awk '{print $1}')
- terraform: $(terraform -version | head -1 | awk '{print $2}')
- kubectl: $(kubectl version --client -o json | jq -r .clientVersion.gitVersion)
- helm: $(helm version --short)
EOF
cat docs/ferramentas.md`,
          },
          {
            label: "As mesmas versões no GitHub Actions",
            language: "yaml",
            code: `name: ci
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc      # usa a MESMA versao da sua maquina
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.9.8       # versao fixa, nunca "latest"
      - run: node -v && terraform -version`,
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
          { term: "daemon", definition: "Processo que roda em segundo plano prestando um serviço, como o motor do Docker." },
          { term: "socket Unix", definition: "Arquivo especial usado para comunicação entre processos na mesma máquina, como /var/run/docker.sock." },
          { term: "PATH", definition: "Lista de diretórios onde o shell procura os comandos que você digita." },
          { term: "tfenv", definition: "Gerenciador de versões do Terraform, útil quando cada repositório exige uma versão diferente." },
          { term: "Helm", definition: "Empacotador de manifests Kubernetes em charts com valores parametrizáveis." },
          { term: "checksum", definition: "Impressão digital de um arquivo, usada para verificar se o download não foi alterado." },
        ],
        printQuestLink: "Documentar as versões usadas no CloudShop para reproduzir builds no CI.",
        quiz: [
          {
            question: "Qual ferramenta descreve infraestrutura de forma declarativa e versionada?",
            options: ["kubectl", "Terraform", "Docker", "AWS CLI"],
            answerIndex: 1,
            explanation: "Terraform declara o estado desejado da infraestrutura e reconcilia com o real via state.",
          },
          {
            question: "Por que é necessário reabrir a sessão após 'usermod -aG docker $USER'?",
            options: [
              "Porque o Docker precisa reinstalar",
              "Porque a lista de grupos do seu usuário só é recarregada em nova sessão",
              "Porque o socket muda de lugar",
              "Porque o kernel precisa reiniciar",
            ],
            answerIndex: 1,
            explanation: "Grupos são atribuídos no login; sem nova sessão (ou newgrp), o processo continua sem a permissão.",
          },
          {
            question: "Qual é o risco de usar 'latest' para a versão do Terraform no pipeline?",
            options: [
              "Nenhum, é sempre mais seguro",
              "O build pode quebrar sem mudança de código, por alteração de comportamento da ferramenta",
              "O Terraform não aceita a palavra latest",
              "O state deixa de existir",
            ],
            answerIndex: 1,
            explanation: "Versão flutuante torna o build não reproduzível; fixar versão é requisito de pipeline confiável.",
          },
          {
            question: "Qual comando valida de verdade que o Docker está funcional?",
            options: ["docker --version", "which docker", "docker run --rm hello-world", "ls /var/run/docker.sock"],
            answerIndex: 2,
            explanation: "Executar um container exercita cliente, daemon, rede e permissões — o binário existir não prova nada.",
          },
        ],
      },
      {
        id: "l-0-5",
        moduleId: "mod-0",
        title: "Conta de nuvem segura e orçamento antes do primeiro recurso",
        duration: 40,
        difficulty: "Iniciante",
        tools: ["AWS", "IAM", "Budgets"],
        xp: 25,
        objectives: [
          "Entender o modelo de responsabilidade compartilhada da nuvem",
          "Proteger a conta raiz e criar uma identidade de trabalho com menor privilégio",
          "Configurar credenciais locais com perfil nomeado ou SSO",
          "Criar orçamento com alerta para não tomar susto na fatura",
          "Adotar disciplina de tags e de destruição de recursos de estudo",
        ],
        body: [
          "<h3>1. O que muda quando a infraestrutura é alugada</h3><p>Na nuvem, o provedor cuida do data center, do hardware e da virtualização; <strong>você</strong> continua responsável por identidade, configuração, rede, dados e custo. Esse é o <em>modelo de responsabilidade compartilhada</em>. Quase todo vazamento noticiado vem do lado do cliente: permissão ampla, bucket público, credencial vazada.</p>",
          "<h3>2. A primeira tarefa não é criar servidor</h3><p>Em uma conta nova, a ordem correta é: ativar <strong>MFA</strong> na conta raiz, guardar as credenciais raiz fora do computador de trabalho, criar uma identidade separada para o dia a dia e configurar <strong>alerta de custo</strong>. Só depois se provisiona qualquer recurso.</p>",
          "<h3>3. Conta raiz: o que ela é e por que não se usa</h3><p>A raiz é o dono da conta e não tem limite de permissão — não é possível restringi-la. Use-a apenas para tarefas exclusivas dela (encerrar a conta, mudar plano de suporte, dados de cobrança). Para o restante, identidade normal.</p>",
          "<h3>4. Identidade: usuário IAM ou Identity Center (SSO)</h3><p>O padrão atual das empresas é <strong>IAM Identity Center</strong>, que entrega credenciais <em>temporárias</em> por login. Chaves de acesso de longa duração (aquele par de Access Key ID e Secret) são práticas para estudar, mas são o item mais vazado do mercado. Se usar chaves, trate-as como senha e rotacione.</p>",
          "<h3>5. Menor privilégio na prática</h3><p>Uma <em>policy</em> é um documento JSON que diz quais ações são permitidas em quais recursos. O princípio do menor privilégio é começar restrito e abrir conforme a necessidade real, não o contrário. Para estudar, um perfil administrativo em uma conta isolada e descartável é aceitável; em conta com dados reais, nunca.</p>",
          "<h3>6. Perfis nomeados no CLI</h3><p>Configure <code>--profile cloudshop</code> em vez de credencial padrão solta. Perfis deixam explícito em qual conta você está agindo — proteção simples contra o clássico \"apliquei na conta errada\". Confirme sempre com <code>aws sts get-caller-identity</code> antes de um comando destrutivo.</p>",
          "<h3>7. Como a nuvem cobra</h3><p>Três padrões de cobrança explicam quase toda fatura: <strong>por tempo ligado</strong> (instância, banco, NAT Gateway), <strong>por volume armazenado</strong> (disco, objetos, backup, snapshot) e <strong>por tráfego</strong> (saída para a internet e entre zonas). O recurso mais esquecido por estudantes é o NAT Gateway, que cobra por hora mesmo sem tráfego.</p>",
          "<h3>8. Orçamento e alerta</h3><p>Crie um budget mensal pequeno (por exemplo 5 USD) com alerta em 80% do valor, tanto no gasto real quanto no previsto. O alerta não impede o gasto: ele compra tempo para você agir. Combine com um painel de custo revisado toda semana.</p>",
          "<h3>9. Tags: sem elas não existe controle de custo</h3><p>Marque todo recurso com <code>projeto</code>, <code>ambiente</code>, <code>dono</code> e <code>validade</code>. Tags permitem responder \"quanto custou o CloudShop em setembro?\" e localizar o que pode ser destruído. Padronize as chaves desde o primeiro recurso — corrigir tags depois é trabalho manual e caro.</p>",
          "<h3>10. Disciplina de destruição</h3><p>Todo recurso criado para estudo tem data de morte. Ao final de cada laboratório de nuvem: rode o <em>destroy</em>, confira no console que nada sobrou e verifique itens que ficam órfãos (volumes, snapshots, IPs elásticos, balanceadores, logs). Registre no diário quanto o laboratório custou.</p>",
          "<h3>11. Reagindo a um vazamento de credencial</h3><p>Se uma chave for exposta: desative-a imediatamente, crie outra, revise o que foi executado na auditoria (CloudTrail), procure recursos criados sem sua autorização e troque também tokens relacionados. Velocidade importa — chaves públicas são exploradas em minutos por robôs.</p>",
          "<h3>12. Checagem final da aula</h3><p>Você deve ter: MFA ativo na raiz, identidade de trabalho separada, <code>aws sts get-caller-identity</code> respondendo com o perfil correto, budget de 5 USD com alerta por e-mail e a convenção de tags escrita em <code>docs/tags.md</code>.</p>",
        ],
        code: [
          {
            label: "Perfil, identidade e orçamento",
            language: "bash",
            code: `aws configure --profile cloudshop
# AWS Access Key ID / Secret / regiao (ex.: us-east-1) / output json

export AWS_PROFILE=cloudshop
aws sts get-caller-identity
# { "UserId": "AIDA...", "Account": "123456789012", "Arn": "arn:aws:iam::123456789012:user/estudo" }

# Orcamento de 5 USD por mes com alerta em 80%
aws budgets create-budget --account-id "$(aws sts get-caller-identity --query Account --output text)" \\
  --budget '{"BudgetName":"estudo-cloudshop","BudgetLimit":{"Amount":"5","Unit":"USD"},"TimeUnit":"MONTHLY","BudgetType":"COST"}' \\
  --notifications-with-subscribers '[{"Notification":{"NotificationType":"ACTUAL","ComparisonOperator":"GREATER_THAN","Threshold":80,"ThresholdType":"PERCENTAGE"},"Subscribers":[{"SubscriptionType":"EMAIL","Address":"voce@exemplo.com"}]}]'
# Sem saida = criado. Confirme com: aws budgets describe-budgets --account-id <conta>`,
            securityNote:
              "~/.aws/credentials guarda chaves em texto puro. Prefira AWS IAM Identity Center (SSO) e nunca comite esse arquivo.",
          },
          {
            label: "Credenciais temporárias com Identity Center (SSO)",
            language: "bash",
            code: `aws configure sso --profile cloudshop-sso
# SSO start URL: https://sua-org.awsapps.com/start
# Abre o navegador para autenticar e escolher a conta/permissao

aws sso login --profile cloudshop-sso     # renova o token quando expirar
aws sts get-caller-identity --profile cloudshop-sso
# Arn: arn:aws:sts::123456789012:assumed-role/AWSReservedSSO_.../voce
# Observe "assumed-role": e uma credencial temporaria, nao uma chave permanente`,
          },
          {
            label: "Tags padrão e caça a recursos esquecidos",
            language: "bash",
            code: `# Convencao de tags do projeto (docs/tags.md)
# projeto=cloudshop | ambiente=dev|prod | dono=estudo | validade=2026-10-01

# Recursos ligados que mais geram custo silencioso
aws ec2 describe-instances --filters Name=instance-state-name,Values=running \\
  --query 'Reservations[].Instances[].[InstanceId,InstanceType,Tags[?Key==\`projeto\`].Value|[0]]' --output table
aws ec2 describe-nat-gateways --filter Name=state,Values=available --query 'NatGateways[].NatGatewayId'
aws ec2 describe-volumes --filters Name=status,Values=available --query 'Volumes[].VolumeId'   # discos orfaos
aws ec2 describe-addresses --query 'Addresses[?AssociationId==null].PublicIp'                  # IPs pagos sem uso`,
            securityNote:
              "Rode essa varredura com um perfil somente-leitura quando possível; auditoria não precisa de permissão de escrita.",
          },
          {
            label: "Se uma chave vazar: resposta imediata",
            language: "bash",
            code: `# 1) Desativar a chave comprometida
aws iam update-access-key --access-key-id AKIAEXEMPLO --status Inactive --user-name estudo
# 2) Criar uma nova e atualizar o perfil local
aws iam create-access-key --user-name estudo
# 3) Auditar o que foi feito com ela nas ultimas horas
aws cloudtrail lookup-events --max-results 20 \\
  --lookup-attributes AttributeKey=Username,AttributeValue=estudo \\
  --query 'Events[].[EventTime,EventName,SourceIPAddress]' --output table
# 4) Excluir a chave antiga depois de confirmar que nada dependia dela
aws iam delete-access-key --access-key-id AKIAEXEMPLO --user-name estudo`,
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
          { term: "Conta raiz", definition: "Identidade dona da conta de nuvem, sem limite de permissão; usada apenas em tarefas exclusivas." },
          { term: "IAM", definition: "Serviço de identidade e acesso da AWS: usuários, papéis e políticas de permissão." },
          { term: "Menor privilégio", definition: "Conceder apenas as permissões necessárias para a tarefa, nada além." },
          { term: "Identity Center (SSO)", definition: "Serviço que entrega credenciais temporárias por login, substituindo chaves permanentes." },
          { term: "CloudTrail", definition: "Registro de auditoria das chamadas de API feitas na conta de nuvem." },
          { term: "FinOps", definition: "Prática de gerenciar custo de nuvem com dados, responsáveis e metas." },
          { term: "NAT Gateway", definition: "Recurso que dá saída à internet para redes privadas e cobra por hora ligada e por tráfego." },
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
          {
            question: "No modelo de responsabilidade compartilhada, o que é sua responsabilidade?",
            options: [
              "Segurança física do data center",
              "Manutenção do hipervisor",
              "Configuração de identidade, rede, dados e custo",
              "Troca de discos com falha",
            ],
            answerIndex: 2,
            explanation: "O provedor cuida da infraestrutura; o cliente responde pela configuração e pelos dados.",
          },
          {
            question: "Qual recurso costuma gerar custo mesmo sem uso aparente em laboratórios?",
            options: ["Security Group", "NAT Gateway", "Tag de recurso", "Chave SSH"],
            answerIndex: 1,
            explanation: "NAT Gateway é cobrado por hora ligada, independentemente do tráfego.",
          },
          {
            question: "Por que preferir credenciais temporárias (SSO) a chaves de acesso permanentes?",
            options: [
              "São mais rápidas",
              "Expiram sozinhas, reduzindo o impacto de um vazamento",
              "Permitem mais permissões",
              "Dispensam MFA",
            ],
            answerIndex: 1,
            explanation: "Credencial de curta duração limita a janela de exploração se for exposta.",
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
    printQuest: "Preparar o host que hospedará a API do CloudShop: usuário dedicado, serviço systemd e logs sob controle.",
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
grep -rn "DATABASE_URL" /etc/cloudshop/ 2>/dev/null

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
        printQuestLink: "Definir /opt/cloudshop para a aplicação e /var/log/cloudshop para os logs.",
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
            code: `sudo useradd --system --no-create-home --shell /usr/sbin/nologin cloudshop
sudo mkdir -p /opt/cloudshop /var/log/cloudshop
sudo chown -R cloudshop:cloudshop /opt/cloudshop /var/log/cloudshop
sudo chmod 750 /opt/cloudshop        # dono total, grupo entra e le
sudo chmod 640 /etc/cloudshop/app.env

ls -ld /opt/cloudshop
id cloudshop
sudo -u cloudshop ls /opt/cloudshop  # testar como o servico enxerga

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
        printQuestLink: "Criar o usuário cloudshop que executará a API e será dono dos diretórios da aplicação.",
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
            label: "Unit systemd da API do CloudShop",
            language: "ini",
            code: `# /etc/systemd/system/cloudshop-api.service
[Unit]
Description=CloudShop API
After=network-online.target
Wants=network-online.target

[Service]
User=cloudshop
Group=cloudshop
WorkingDirectory=/opt/cloudshop
EnvironmentFile=/etc/cloudshop/app.env
ExecStart=/usr/bin/node /opt/cloudshop/server.js
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
sudo systemctl enable --now cloudshop-api
systemctl status cloudshop-api --no-pager
sudo systemctl restart cloudshop-api
systemctl is-enabled cloudshop-api
journalctl -u cloudshop-api -n 50 --no-pager`,
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
        printQuestLink: "Colocar a API do CloudShop sob systemd, com restart automático e logs no journal.",
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
            code: `journalctl -u cloudshop-api -n 200 --no-pager
journalctl -u cloudshop-api -p err --since "10 min ago"
journalctl --since "2026-09-06 09:00" --until "2026-09-06 09:30"
journalctl -u cloudshop-api -f              # seguir ao vivo
journalctl -k -p warning                     # mensagens do kernel
journalctl --disk-usage
sudo journalctl --vacuum-size=500M

# logs de aplicacao fora do journal
sudo grep -c "ERROR" /var/log/cloudshop/app.log
sudo awk '/ERROR/{print $1, $2, $NF}' /var/log/cloudshop/app.log | tail -20`,
            securityNote:
              "Antes de colar log em ticket ou chat, remova tokens, e-mails e IDs de clientes. Log compartilhado é vazamento frequente.",
          },
          {
            label: "Rotação de log da aplicação",
            language: "ini",
            code: `# /etc/logrotate.d/cloudshop
/var/log/cloudshop/*.log {
  daily
  rotate 14
  compress
  delaycompress
  missingok
  notifempty
  create 0640 cloudshop cloudshop
  sharedscripts
  postrotate
    systemctl reload cloudshop-api > /dev/null 2>&1 || true
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
        printQuestLink: "Padronizar o log JSON da API do CloudShop e configurar rotação diária.",
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
Host cloudshop-prod
  HostName 203.0.113.10
  User cloudshop-ops
  IdentityFile ~/.ssh/id_ed25519
  ServerAliveInterval 30

Host cloudshop-db
  HostName 10.0.2.15
  User cloudshop-ops
  ProxyJump cloudshop-prod
EOF

ssh cloudshop-prod
ssh -L 5432:localhost:5432 cloudshop-db   # tunel para acessar o banco local`,
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
        printQuestLink: "Preparar acesso seguro ao host de produção do CloudShop via bastion.",
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
