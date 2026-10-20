import type { Lesson } from "@/lib/types";

// Aulas extras (didáticas, do zero) dos módulos 0, 1 e 2.
export const EXTRA_LESSONS_A: Record<string, Lesson[]> = {
  "mod-0": [
    {
      id: "l-0-6",
      moduleId: "mod-0",
      title: "Terminal e shell do zero: conversando com o computador",
      duration: 35,
      difficulty: "Iniciante",
      tools: ["Bash", "Terminal"],
      xp: 25,
      objectives: [
        "Entender a diferença entre terminal, shell e comando",
        "Ler a estrutura de um comando: programa, opções e argumentos",
        "Navegar, criar e apagar arquivos com segurança",
        "Usar histórico, autocompletar e o manual (man/--help)",
        "Encadear comandos com pipe e redirecionamento",
      ],
      body: [
        "Antes de qualquer ferramenta DevOps, existe uma habilidade base: **conversar com o computador por texto**. O **terminal** é a janela onde você digita; o **shell** (normalmente `bash` ou `zsh`) é o programa que entende o que você escreveu e executa. Quase todo servidor de produção não tem interface gráfica — só terminal.",
        "Todo comando segue um padrão: **programa + opções + argumentos**. Em `ls -l /etc`, `ls` é o programa (listar), `-l` é uma opção (formato longo) e `/etc` é o argumento (qual pasta). Quando você entende esse padrão, qualquer comando novo fica mais fácil de ler.",
        "Para se localizar use `pwd` (onde estou?), `ls` (o que tem aqui?) e `cd` (ir para outro lugar). `cd ..` sobe uma pasta, `cd ~` volta para sua casa (home) e `cd -` volta para onde você estava antes. Pense como andar por pastas num explorador de arquivos, mas digitando.",
        "Criar e mexer em arquivos: `mkdir projeto` cria pasta, `touch notas.txt` cria arquivo vazio, `cp` copia, `mv` move ou renomeia e `rm` apaga. **Atenção:** no terminal não existe lixeira. `rm -rf` apaga tudo sem perguntar — por isso, sempre confira com `ls` antes de apagar.",
        "Você não precisa decorar nada. Use **Tab** para autocompletar nomes, **seta para cima** para repetir comandos anteriores e `Ctrl+R` para buscar no histórico. Para aprender um comando, `comando --help` mostra um resumo e `man comando` abre o manual completo (saia com `q`).",
        "O superpoder do shell é **combinar comandos pequenos**. O **pipe** `|` envia a saída de um comando para outro: `ls /etc | grep ssh` lista a pasta e filtra só o que contém “ssh”. É assim que profissionais resolvem problemas grandes com peças simples.",
        "**Redirecionamento** guarda resultados em arquivos: `>` sobrescreve, `>>` adiciona ao final e `2>` captura erros. Exemplo: `comando > saida.log 2>&1` grava saída normal e erros juntos — muito usado em scripts e automações.",
        "Por fim, entenda o **código de saída**: todo comando termina com um número. `0` significa sucesso; qualquer outro valor indica erro. Veja com `echo $?`. Pipelines de CI/CD usam exatamente isso para decidir se um passo passou ou falhou.",
      ],
      code: [
        {
          label: "Primeiros passos no terminal",
          language: "bash",
          code: `pwd                 # mostra a pasta atual
ls -la              # lista tudo, inclusive arquivos ocultos
mkdir -p ~/lab/dia1 # cria a pasta (e as intermediárias)
cd ~/lab/dia1
echo "olá DevOps" > notas.txt   # cria arquivo com conteúdo
cat notas.txt                   # mostra o conteúdo
echo "linha 2" >> notas.txt     # adiciona no final
wc -l notas.txt                 # conta linhas`,
        },
        {
          label: "Pipe, filtros e código de saída",
          language: "bash",
          code: `history | grep docker     # quais comandos docker usei?
ps aux | grep nginx | head -5
ls arquivo-inexistente; echo "saída: $?"   # imprime valor diferente de 0
ls /tmp; echo "saída: $?"                 # imprime 0`,
        },
      ],
      whyItMatters: "Servidores, contêineres e pipelines são operados por linha de comando. Quem domina o terminal investiga incidentes em minutos em vez de horas.",
      commonMistake: "Copiar e colar comandos da internet sem entender o que fazem — principalmente com `sudo` ou `rm -rf`. Leia cada parte antes de apertar Enter.",
      productionTip: "Antes de um comando destrutivo, rode a versão que só lista (ex.: `ls` com o mesmo caminho) para conferir o alvo.",
      securityAlert: "Nunca cole senhas ou tokens direto na linha de comando: eles ficam salvos no histórico (`~/.bash_history`).",
      interviewQuestion: "O que acontece quando você digita `cat app.log | grep ERROR | wc -l`? Explique cada etapa.",
      glossary: [
        { term: "Terminal", definition: "Janela onde você digita comandos de texto." },
        { term: "Shell", definition: "Programa (bash, zsh) que interpreta e executa os comandos." },
        { term: "Pipe (|)", definition: "Envia a saída de um comando como entrada do próximo." },
        { term: "Exit code", definition: "Número que indica se o comando deu certo (0) ou falhou." },
        { term: "Home (~)", definition: "Pasta pessoal do usuário logado." },
      ],
      printQuestLink: "No CloudShop, toda investigação começa no terminal: ler logs, ver processos e testar a API com curl.",
      quiz: [
        { question: "Em `ls -l /var/log`, o que é `-l`?", options: ["O programa", "Uma opção", "O argumento", "Um pipe"], answerIndex: 1, explanation: "`-l` muda o comportamento do `ls` (formato longo)." },
        { question: "Qual código de saída indica sucesso?", options: ["1", "-1", "0", "255"], answerIndex: 2, explanation: "Por convenção, 0 é sucesso; qualquer outro valor é erro." },
        { question: "Qual a diferença entre `>` e `>>`?", options: ["Nenhuma", "`>` sobrescreve, `>>` adiciona", "`>` adiciona, `>>` sobrescreve", "`>>` apaga o arquivo"], answerIndex: 1, explanation: "`>` substitui o conteúdo; `>>` acrescenta no final." },
      ],
    },
    {
      id: "l-0-7",
      moduleId: "mod-0",
      title: "Do código à produção: o caminho completo de uma aplicação",
      duration: 30,
      difficulty: "Iniciante",
      tools: ["Git", "Docker", "CI/CD", "Cloud"],
      xp: 25,
      objectives: [
        "Visualizar o ciclo completo: código, build, teste, deploy e operação",
        "Entender o papel de cada ferramenta do curso nesse ciclo",
        "Diferenciar ambientes de desenvolvimento, staging e produção",
        "Reconhecer onde DevOps reduz riscos e retrabalho",
      ],
      body: [
        "Muita gente começa DevOps aprendendo ferramentas soltas e fica perdida. Esta aula mostra o **mapa inteiro** para que cada módulo futuro faça sentido. Imagine uma loja online fictícia, o CloudShop, recebendo uma pequena melhoria.",
        "**1. Código:** a pessoa desenvolvedora altera o código no computador e salva a mudança no **Git**, que guarda o histórico de tudo. Ela abre um **Pull Request** no GitHub para que outra pessoa revise.",
        "**2. Integração contínua (CI):** assim que o PR é aberto, um **pipeline** roda sozinho: instala dependências, executa testes e verifica segurança. Se algo falhar, o código não segue. É uma esteira automática de qualidade.",
        "**3. Empacotamento:** se tudo passou, o pipeline gera uma **imagem Docker** — uma caixa com a aplicação e tudo que ela precisa para rodar igual em qualquer lugar. Essa imagem vai para um **registry** (um depósito de imagens).",
        "**4. Infraestrutura:** onde essa caixa vai rodar? Em servidores na **nuvem**, criados por código com **Terraform** (Infraestrutura como Código). Assim, o ambiente pode ser recriado de forma idêntica quando quiser.",
        "**5. Entrega contínua (CD):** o **Kubernetes** executa as imagens, e o **GitOps** (Argo CD) garante que o que está no cluster é exatamente o que está descrito no Git. Mudou o Git, o cluster se atualiza.",
        "**6. Operação:** com a aplicação no ar, **observabilidade** (métricas, logs e traces) mostra se está tudo saudável. Se algo quebra, alertas avisam e a equipe faz **rollback** ou corrige. Depois, escreve-se um postmortem para aprender.",
        "Repare nos **ambientes**: `dev` é onde se experimenta, `staging` é o ensaio geral parecido com produção, e `produção` é onde estão os clientes reais. DevOps existe para que a mudança percorra esse caminho **rápida, segura e repetível**.",
      ],
      code: [
        {
          label: "O ciclo em comandos (visão geral)",
          language: "bash",
          code: `git checkout -b feat/cupom          # 1. nova branch
git commit -am "feat: cupom de desconto"
git push origin feat/cupom          # abre o PR -> CI roda
docker build -t cloudshop/api:1.4.0 .   # 3. empacota
docker push cloudshop/api:1.4.0
terraform apply                     # 4. infraestrutura
kubectl rollout status deploy/api   # 5. acompanha o deploy`,
        },
      ],
      whyItMatters: "Entender o fluxo inteiro permite enxergar gargalos e falhas que quem conhece só uma ferramenta não percebe.",
      commonMistake: "Achar que DevOps é só uma ferramenta (\"DevOps = Kubernetes\"). É a cultura e a automação de todo o caminho.",
      productionTip: "Desenhe o fluxo da sua empresa (ou do seu projeto) num papel: onde há passo manual, há oportunidade de automação.",
      interviewQuestion: "Descreva o caminho de uma linha de código desde o commit até estar em produção.",
      glossary: [
        { term: "Pipeline", definition: "Sequência automática de etapas (build, teste, deploy)." },
        { term: "Registry", definition: "Repositório onde ficam as imagens de contêiner." },
        { term: "Staging", definition: "Ambiente de ensaio, parecido com produção." },
        { term: "Rollback", definition: "Voltar para a versão anterior que funcionava." },
      ],
      printQuestLink: "Este é o roteiro do projeto CloudShop: cada módulo constrói uma das etapas desse caminho.",
      quiz: [
        { question: "Qual etapa executa testes automaticamente a cada mudança?", options: ["Registry", "CI", "Rollback", "Staging"], answerIndex: 1, explanation: "A integração contínua (CI) testa cada mudança." },
        { question: "Para que serve o ambiente de staging?", options: ["Guardar imagens", "Ensaiar a mudança antes da produção", "Escrever código", "Armazenar logs"], answerIndex: 1, explanation: "Staging imita produção para validar antes dos clientes." },
        { question: "O que o Terraform faz nesse fluxo?", options: ["Testa código", "Cria infraestrutura por código", "Executa contêineres", "Revisa PRs"], answerIndex: 1, explanation: "Terraform descreve e cria a infraestrutura como código." },
      ],
    },
    {
      id: "l-0-8",
      moduleId: "mod-0",
      title: "Como estudar DevOps de verdade: laboratório, notas e mentalidade de investigação",
      duration: 25,
      difficulty: "Iniciante",
      tools: ["Markdown", "Git"],
      xp: 25,
      objectives: [
        "Montar uma rotina de estudo prática e sustentável",
        "Documentar aprendizados num repositório próprio",
        "Aplicar um método simples para investigar erros",
        "Transformar estudo em portfólio",
      ],
      body: [
        "DevOps se aprende **fazendo e quebrando coisas**, não só lendo. A regra de ouro deste curso: para cada aula, rode os comandos você mesmo, mude algo e observe o que acontece.",
        "Crie uma **rotina curta e constante**: 45 a 60 minutos por dia rendem mais do que 8 horas num único fim de semana. O cérebro fixa conhecimento com repetição espaçada.",
        "Tenha um **repositório de notas** no GitHub (ex.: `devops-notes`). Para cada tema, escreva em Markdown: o que é, comando principal, um erro que você encontrou e como resolveu. Esse repositório vira prova do seu aprendizado.",
        "Quando algo der errado — e vai dar — use o **método de investigação**: (1) leia a mensagem de erro inteira, (2) descubra *onde* falhou, (3) forme uma hipótese, (4) teste uma mudança por vez, (5) anote a solução.",
        "**Leia a mensagem de erro com calma.** Iniciantes pulam direto para buscar no Google; profissionais leem a última linha do erro, que normalmente diz exatamente o problema (arquivo não encontrado, permissão negada, porta em uso).",
        "Use a documentação oficial como fonte principal e aprenda a pesquisar bem: copie o trecho único da mensagem de erro entre aspas. Ferramentas de IA ajudam, mas **valide sempre** testando no seu laboratório.",
        "Seu laboratório pode ser simples: Linux (WSL2 ou VM), Docker e uma conta de nuvem com alerta de orçamento. Destrua recursos de nuvem ao terminar para não pagar à toa.",
        "Por fim, **ensine o que aprendeu**: explicar para outra pessoa (ou na comunidade do DevOpsQuest) revela lacunas e consolida o conhecimento. Quem explica bem, aprende duas vezes.",
      ],
      code: [
        {
          label: "Criando seu repositório de notas",
          language: "bash",
          code: `mkdir devops-notes && cd devops-notes
git init
cat > linux-permissoes.md <<'EOF'
# Permissões no Linux
- Comando: chmod 640 arquivo
- Erro que tive: "Permission denied" ao ler log
- Solução: adicionei meu usuário ao grupo adm
EOF
git add . && git commit -m "docs: nota sobre permissões"`,
        },
      ],
      whyItMatters: "Constância e método de investigação são o que diferenciam quem trava de quem evolui até o nível sênior.",
      commonMistake: "Assistir horas de vídeo sem praticar — dá a sensação de aprender, mas o conhecimento some em poucos dias.",
      productionTip: "Em incidentes reais, anote cada passo e horário enquanto investiga: isso vira o rascunho do postmortem.",
      interviewQuestion: "Conte como você investigou e resolveu um problema técnico difícil recentemente.",
      glossary: [
        { term: "Markdown", definition: "Formato de texto simples usado em documentação e READMEs." },
        { term: "Hipótese", definition: "Suposição testável sobre a causa de um problema." },
        { term: "Laboratório", definition: "Ambiente seguro para experimentar e quebrar coisas." },
        { term: "Repetição espaçada", definition: "Revisar em intervalos para fixar o conhecimento." },
      ],
      printQuestLink: "Suas notas e labs do CloudShop formam o portfólio que você mostrará nas entrevistas.",
      quiz: [
        { question: "Qual o primeiro passo ao encontrar um erro?", options: ["Reinstalar tudo", "Ler a mensagem de erro inteira", "Perguntar em fórum", "Mudar várias coisas de uma vez"], answerIndex: 1, explanation: "A mensagem costuma indicar a causa." },
        { question: "Por que testar uma mudança por vez?", options: ["É mais rápido", "Para saber qual mudança resolveu", "Exigência do Git", "Não importa"], answerIndex: 1, explanation: "Assim você identifica a causa real." },
        { question: "O que fazer com recursos de nuvem após o lab?", options: ["Deixar ligados", "Destruir para evitar custos", "Duplicar", "Tornar públicos"], answerIndex: 1, explanation: "Recursos ligados geram cobrança." },
      ],
    },
  ],
  "mod-1": [
    {
      id: "l-1-6",
      moduleId: "mod-1",
      title: "Pacotes e repositórios: instalando software do jeito certo",
      duration: 30,
      difficulty: "Iniciante",
      tools: ["apt", "Linux"],
      xp: 25,
      objectives: [
        "Entender o que é um gerenciador de pacotes",
        "Atualizar, instalar, remover e pesquisar pacotes com apt",
        "Adicionar repositórios oficiais com chave de assinatura",
        "Fixar versões para ambientes previsíveis",
      ],
      body: [
        "No Linux você não baixa instaladores de sites aleatórios: usa um **gerenciador de pacotes**. No Ubuntu/Debian é o `apt`; no Red Hat/Fedora, `dnf`; no Alpine (muito usado em contêineres), `apk`.",
        "Um **pacote** é o programa empacotado com suas dependências e metadados. Um **repositório** é o servidor de onde os pacotes vêm, assinado digitalmente para garantir que ninguém os alterou.",
        "O fluxo básico: `sudo apt update` atualiza a **lista** de pacotes disponíveis (não instala nada); `sudo apt install nginx` instala; `sudo apt upgrade` atualiza o que já está instalado; `sudo apt remove` desinstala.",
        "Para descobrir pacotes use `apt search termo` e para ver detalhes `apt show pacote`. Para saber o que já está instalado: `apt list --installed | grep nome`.",
        "Alguns softwares (Docker, Terraform, kubectl) recomendam **repositórios próprios**. O processo seguro é: baixar a **chave GPG** oficial, registrá-la e adicionar o repositório apontando para essa chave. Isso garante a autenticidade.",
        "Em servidores e contêineres, **fixe versões** (`apt install nginx=1.24.*`) para que dois ambientes não fiquem diferentes sem querer. Mudanças de versão devem ser decisões, não surpresas.",
        "Em Dockerfiles, combine `apt update` e `apt install` no mesmo comando e limpe o cache (`rm -rf /var/lib/apt/lists/*`) para gerar imagens menores.",
        "Atualizações de segurança são vitais: configure `unattended-upgrades` em servidores para aplicar correções críticas automaticamente.",
      ],
      code: [
        {
          label: "Ciclo básico com apt",
          language: "bash",
          code: `sudo apt update                 # atualiza a lista
apt search htop                 # procura
sudo apt install -y htop        # instala sem perguntar
apt show htop | head            # detalhes
sudo apt remove -y htop         # remove`,
        },
        {
          label: "Repositório oficial com chave (exemplo HashiCorp)",
          language: "bash",
          code: `wget -O- https://apt.releases.hashicorp.com/gpg | \\
  sudo gpg --dearmor -o /usr/share/keyrings/hashicorp.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp.gpg] \\
https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \\
  sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install -y terraform`,
          securityNote: "Sempre use a chave do site oficial e o `signed-by` para limitar a confiança a esse repositório.",
        },
      ],
      whyItMatters: "Instalar software de forma reprodutível e segura é a base de servidores, imagens Docker e automação com Ansible.",
      commonMistake: "Esquecer `apt update` e receber “Unable to locate package”, ou instalar scripts com `curl | sudo bash` sem verificar a origem.",
      productionTip: "Registre as versões instaladas em código (Dockerfile, Ansible) em vez de instalar manualmente em produção.",
      securityAlert: "Repositórios não oficiais podem distribuir malware. Prefira fontes oficiais e assinadas.",
      interviewQuestion: "Qual a diferença entre `apt update` e `apt upgrade`?",
      glossary: [
        { term: "Pacote", definition: "Software empacotado com dependências e metadados." },
        { term: "Repositório", definition: "Servidor que distribui pacotes assinados." },
        { term: "GPG", definition: "Sistema de assinatura que garante a autenticidade." },
        { term: "Pin de versão", definition: "Fixar uma versão específica de um pacote." },
      ],
      printQuestLink: "As VMs do CloudShop recebem Nginx e agentes de monitoramento por pacotes com versão fixada.",
      quiz: [
        { question: "O que `apt update` faz?", options: ["Instala pacotes", "Atualiza a lista de pacotes disponíveis", "Remove pacotes", "Reinicia o sistema"], answerIndex: 1, explanation: "Só atualiza o índice; não instala nada." },
        { question: "Gerenciador de pacotes do Alpine?", options: ["apt", "dnf", "apk", "brew"], answerIndex: 2, explanation: "Alpine usa `apk`." },
        { question: "Por que fixar versões?", options: ["Deixa mais lento", "Garante ambientes previsíveis", "É obrigatório", "Economiza disco"], answerIndex: 1, explanation: "Evita diferenças inesperadas entre ambientes." },
      ],
    },
    {
      id: "l-1-7",
      moduleId: "mod-1",
      title: "Disco e memória: quando o servidor fica lento ou cheio",
      duration: 35,
      difficulty: "Intermediário",
      tools: ["df", "du", "free", "top"],
      xp: 25,
      objectives: [
        "Diagnosticar disco cheio com df e du",
        "Encontrar os maiores arquivos e pastas",
        "Interpretar uso de memória e swap",
        "Identificar processos que consomem CPU e RAM",
        "Resolver o caso clássico de log que enche o disco",
      ],
      body: [
        "Dois dos incidentes mais comuns em produção são **disco cheio** e **falta de memória**. Quando o disco enche, bancos param de gravar e aplicações caem; quando a memória acaba, o kernel mata processos.",
        "Comece pelo panorama: `df -h` mostra cada partição, quanto está usado e quanto sobra, em formato legível (`-h` = human). Acima de 90%, acenda o alerta.",
        "Depois descubra **quem** ocupa espaço: `du -sh /var/* | sort -h` soma o tamanho de cada pasta e ordena. Vá descendo pelas maiores até achar o culpado — quase sempre logs, imagens Docker antigas ou backups esquecidos.",
        "Caso clássico: você apaga um log gigante, mas o espaço não volta. Motivo: o processo ainda tem o arquivo **aberto**. Veja com `lsof +L1` e reinicie o serviço, ou esvazie o arquivo com `truncate -s 0 arquivo.log` em vez de apagá-lo.",
        "A solução definitiva é o **logrotate**, que gira, comprime e apaga logs antigos automaticamente. No Docker, limpe com `docker system prune` (com cuidado) e configure limites de log.",
        "Para memória use `free -h`. A coluna importante é **available** (quanto pode ser usado de fato). O Linux usa RAM livre como cache, então “used” alto nem sempre é problema.",
        "**Swap** é memória extra no disco — muito mais lenta. Swap muito usado indica falta de RAM. Para achar o vilão, `top` ou `htop` ordenados por memória (`M`) ou CPU (`P`).",
        "Se o kernel mata processos por falta de memória, aparece no log: `journalctl -k | grep -i oom`. Em Kubernetes, isso vira o famoso status **OOMKilled**.",
      ],
      code: [
        {
          label: "Investigando disco cheio",
          language: "bash",
          code: `df -h                               # visão geral das partições
sudo du -sh /var/* 2>/dev/null | sort -h | tail
sudo find / -xdev -type f -size +500M -exec ls -lh {} \\; 2>/dev/null
sudo lsof +L1                       # arquivos apagados ainda abertos
sudo truncate -s 0 /var/log/app.log # esvazia sem apagar`,
        },
        {
          label: "Memória e processos",
          language: "bash",
          code: `free -h                             # olhe a coluna 'available'
ps aux --sort=-%mem | head -5       # top 5 por memória
journalctl -k | grep -i "out of memory"`,
        },
      ],
      whyItMatters: "Disco e memória causam incidentes recorrentes; saber investigar rápido evita horas de indisponibilidade.",
      commonMistake: "Apagar arquivos aleatórios de /var ou /usr para liberar espaço, quebrando o sistema.",
      productionTip: "Crie alertas em 80% de disco e configure logrotate em todo servidor desde o primeiro dia.",
      interviewQuestion: "Você apagou um log de 20 GB, mas o `df` continua mostrando o disco cheio. Por quê e como resolver?",
      glossary: [
        { term: "df", definition: "Mostra o uso de espaço por partição." },
        { term: "du", definition: "Mostra o tamanho de pastas e arquivos." },
        { term: "Swap", definition: "Área do disco usada como memória extra (lenta)." },
        { term: "OOM killer", definition: "Mecanismo do kernel que mata processos sem memória." },
        { term: "logrotate", definition: "Ferramenta que gira e limpa logs automaticamente." },
      ],
      printQuestLink: "O Boss do reino Linux simula um servidor CloudShop com disco 100% cheio por logs.",
      quiz: [
        { question: "Qual comando mostra o uso por partição?", options: ["du", "df -h", "free", "ls"], answerIndex: 1, explanation: "`df -h` mostra o espaço de cada partição." },
        { question: "Na saída do `free`, qual coluna indica a memória realmente disponível?", options: ["used", "shared", "available", "total"], answerIndex: 2, explanation: "`available` considera o cache que pode ser liberado." },
        { question: "Por que o espaço não volta após apagar um log aberto?", options: ["Bug do Linux", "O processo ainda mantém o arquivo aberto", "Falta de swap", "O disco é lento"], answerIndex: 1, explanation: "O espaço só é liberado quando o arquivo é fechado." },
      ],
    },
    {
      id: "l-1-8",
      moduleId: "mod-1",
      title: "Variáveis de ambiente, PATH e configuração de aplicações",
      duration: 25,
      difficulty: "Iniciante",
      tools: ["Bash", "env"],
      xp: 25,
      objectives: [
        "Entender o que são variáveis de ambiente",
        "Ler, criar e exportar variáveis",
        "Entender o PATH e o erro “command not found”",
        "Configurar aplicações com variáveis (12-factor)",
      ],
      body: [
        "**Variáveis de ambiente** são pares nome=valor que todo processo recebe ao iniciar. Elas configuram o comportamento de programas sem mudar o código: porta, endereço do banco, nível de log.",
        "Veja todas com `env` ou uma específica com `echo $HOME`. Crie com `NOME=valor`, mas ela só fica visível para programas filhos se você usar `export NOME=valor`.",
        "A variável mais importante é o **PATH**: uma lista de pastas onde o shell procura programas. Quando você digita `terraform`, o shell percorre cada pasta do PATH até encontrar. Se não acha, aparece **command not found**.",
        "Para adicionar uma pasta: `export PATH=\"$HOME/bin:$PATH\"`. Para tornar permanente, coloque essa linha no `~/.bashrc` (ou `~/.zshrc`) e recarregue com `source ~/.bashrc`.",
        "Use `which programa` ou `type programa` para descobrir qual executável está sendo usado — útil quando há duas versões instaladas.",
        "Na metodologia **12-factor**, toda configuração que muda entre ambientes vem de variáveis: o mesmo código roda em dev e produção, mudando só `DATABASE_URL`, por exemplo. Docker e Kubernetes seguem esse modelo.",
        "Em desenvolvimento é comum usar um arquivo `.env`, carregado pela aplicação. **Nunca** faça commit desse arquivo com segredos reais: coloque `.env` no `.gitignore` e publique apenas um `.env.example`.",
        "Em serviços systemd, as variáveis são definidas com `Environment=` ou `EnvironmentFile=` dentro do arquivo do serviço.",
      ],
      code: [
        {
          label: "Variáveis e PATH",
          language: "bash",
          code: `echo $PATH | tr ':' '\\n'      # uma pasta por linha
export APP_PORT=8080
python3 -c 'import os; print(os.environ["APP_PORT"])'
which kubectl                   # qual kubectl está no PATH
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc`,
        },
        {
          label: ".env.example (pode ir para o Git)",
          language: "bash",
          code: `# Copie para .env e preencha os valores reais
APP_PORT=8080
LOG_LEVEL=info
DATABASE_URL=postgres://usuario:senha@localhost:5432/app`,
        },
      ],
      whyItMatters: "Configuração por variáveis é o padrão em contêineres, CI/CD e Kubernetes; entender PATH evita horas de “command not found”.",
      commonMistake: "Definir a variável sem `export` e não entender por que o programa não a enxerga.",
      productionTip: "Valide variáveis obrigatórias na inicialização da aplicação e falhe com uma mensagem clara se faltarem.",
      securityAlert: "Variáveis podem vazar em logs e no `ps`. Segredos devem vir de um cofre (Secrets Manager, Vault) e nunca ser impressos.",
      interviewQuestion: "O que acontece quando aparece `command not found` mesmo com o programa instalado?",
      glossary: [
        { term: "Variável de ambiente", definition: "Par nome=valor herdado pelos processos." },
        { term: "export", definition: "Torna a variável visível para processos filhos." },
        { term: "PATH", definition: "Lista de pastas onde o shell procura programas." },
        { term: "12-factor", definition: "Boas práticas de apps modernas, como configuração por ambiente." },
      ],
      printQuestLink: "A API do CloudShop lê porta e banco de variáveis — o mesmo código roda em todos os ambientes.",
      quiz: [
        { question: "Para que serve o PATH?", options: ["Guardar senhas", "Listar pastas onde o shell procura programas", "Definir a porta", "Armazenar logs"], answerIndex: 1, explanation: "O shell procura executáveis nas pastas do PATH." },
        { question: "O que `export` faz?", options: ["Apaga a variável", "Torna a variável visível para processos filhos", "Salva no Git", "Criptografa"], answerIndex: 1, explanation: "Sem export, programas filhos não recebem a variável." },
        { question: "O que deve ir para o Git?", options: [".env com segredos", ".env.example sem segredos", "Ambos", "Nenhum"], answerIndex: 1, explanation: "Só o exemplo, sem valores reais." },
      ],
    },
  ],
  "mod-2": [
    {
      id: "l-2-6",
      moduleId: "mod-2",
      title: "Firewall e portas: quem pode falar com o seu servidor",
      duration: 30,
      difficulty: "Intermediário",
      tools: ["ufw", "ss", "nc"],
      xp: 25,
      objectives: [
        "Entender portas e o que significa um serviço “escutando”",
        "Listar portas abertas com ss",
        "Configurar regras de firewall com ufw",
        "Testar conectividade de porta com nc e curl",
      ],
      body: [
        "Um servidor tem um endereço IP, e cada serviço dentro dele usa uma **porta** — como apartamentos num prédio. SSH usa a 22, HTTP a 80, HTTPS a 443, PostgreSQL a 5432.",
        "Um serviço está **escutando** (listening) quando aguarda conexões numa porta. Veja quem escuta com `sudo ss -tulpn`: mostra protocolo, endereço, porta e o processo dono.",
        "Repare no endereço: `127.0.0.1:5432` significa que só a própria máquina acessa; `0.0.0.0:5432` significa **qualquer rede** — um banco exposto assim na internet é um enorme risco.",
        "O **firewall** decide quais conexões entram. No Ubuntu, o `ufw` simplifica: a política padrão deve ser **negar entrada** e liberar só o necessário (`22`, `80`, `443`).",
        "**Cuidado clássico:** ativar o firewall sem liberar a porta 22 corta seu próprio acesso SSH. Sempre rode `ufw allow OpenSSH` antes de `ufw enable`.",
        "Para testar se uma porta está acessível de fora, use `nc -zv host porta` ou `curl -v telnet://host:porta`. “Connection refused” = nada escutando; “timeout” = firewall bloqueando no caminho.",
        "Na nuvem existem firewalls adicionais, os **Security Groups**. Um serviço pode estar escutando e o ufw liberado, mas o Security Group bloquear. Investigue camada por camada.",
        "Princípio que guia tudo: **menor exposição possível**. Bancos e painéis administrativos nunca devem estar abertos para a internet.",
      ],
      code: [
        {
          label: "Ver portas e configurar ufw",
          language: "bash",
          code: `sudo ss -tulpn                  # quem está escutando
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH          # ANTES de ativar!
sudo ufw allow 80,443/tcp
sudo ufw enable
sudo ufw status verbose`,
        },
        {
          label: "Testar conectividade",
          language: "bash",
          code: `nc -zv api.exemplo.com 443      # succeeded = porta acessível
nc -zv 10.0.1.20 5432           # refused = nada escutando; timeout = bloqueado`,
        },
      ],
      whyItMatters: "Portas expostas sem necessidade são a porta de entrada da maioria dos ataques automatizados.",
      commonMistake: "Ativar o firewall remotamente sem liberar SSH e perder acesso ao servidor.",
      productionTip: "Faça os serviços internos escutarem só em 127.0.0.1 ou na rede privada, e exponha apenas o proxy.",
      securityAlert: "Bancos de dados expostos em 0.0.0.0 na internet são encontrados por robôs em minutos.",
      interviewQuestion: "Qual a diferença entre receber “connection refused” e “timeout” ao acessar uma porta?",
      glossary: [
        { term: "Porta", definition: "Número que identifica um serviço dentro de um host." },
        { term: "Listening", definition: "Estado de um serviço aguardando conexões." },
        { term: "ufw", definition: "Interface simplificada de firewall no Ubuntu." },
        { term: "Security Group", definition: "Firewall virtual de recursos na nuvem." },
      ],
      printQuestLink: "No CloudShop só o Nginx fica público; API e banco escutam apenas na rede privada.",
      quiz: [
        { question: "Qual comando lista portas escutando?", options: ["ls", "ss -tulpn", "df", "top"], answerIndex: 1, explanation: "`ss -tulpn` mostra sockets em escuta e o processo." },
        { question: "“Timeout” ao conectar geralmente indica:", options: ["Serviço parado", "Firewall bloqueando", "DNS ok", "Senha errada"], answerIndex: 1, explanation: "Pacotes descartados no caminho geram timeout." },
        { question: "O que fazer antes de `ufw enable` num servidor remoto?", options: ["Reiniciar", "Liberar SSH", "Abrir todas as portas", "Desligar a rede"], answerIndex: 1, explanation: "Senão você perde o acesso." },
      ],
    },
    {
      id: "l-2-7",
      moduleId: "mod-2",
      title: "Load balancer e alta disponibilidade explicados do zero",
      duration: 30,
      difficulty: "Intermediário",
      tools: ["Nginx", "Load Balancer"],
      xp: 25,
      objectives: [
        "Entender por que uma única instância é um ponto único de falha",
        "Conhecer algoritmos de balanceamento",
        "Configurar upstream com várias instâncias no Nginx",
        "Usar health checks para retirar instâncias doentes",
      ],
      body: [
        "Se sua aplicação roda em **um único servidor** e ele cai, todos os clientes ficam sem serviço. Isso é um **ponto único de falha** (SPOF). Alta disponibilidade significa ter réplicas para que a falha de uma não derrube tudo.",
        "Um **load balancer** (balanceador de carga) fica na frente das réplicas e distribui as requisições entre elas. Para o cliente, existe um único endereço; por trás, várias instâncias trabalham.",
        "Algoritmos comuns: **round robin** (uma de cada vez, em sequência), **least connections** (manda para quem está menos ocupado) e **ip hash** (o mesmo cliente vai sempre para a mesma instância).",
        "Os **health checks** são essenciais: o balanceador testa periodicamente cada instância (ex.: `GET /health`). Se falhar, ela é retirada do rodízio até se recuperar.",
        "Existem balanceadores de **camada 4** (TCP, olham só IP e porta, muito rápidos) e de **camada 7** (HTTP, conseguem rotear por caminho, domínio e cabeçalhos).",
        "Na nuvem você usa serviços gerenciados (AWS ALB/NLB, Google Cloud Load Balancing). No Kubernetes, o **Service** e o **Ingress** fazem esse papel.",
        "Para funcionar bem, a aplicação precisa ser **stateless**: nenhuma informação de sessão guardada só na memória de uma instância. Sessões vão para Redis ou banco.",
        "Distribua réplicas em **zonas de disponibilidade** diferentes: se um datacenter inteiro falhar, as outras zonas continuam atendendo.",
      ],
      code: [
        {
          label: "Nginx balanceando três instâncias",
          language: "nginx",
          code: `upstream api_backend {
    least_conn;                     # manda para a menos ocupada
    server 10.0.1.11:3000 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:3000 max_fails=3 fail_timeout=30s;
    server 10.0.1.13:3000 backup;   # só entra se as outras caírem
}

server {
    listen 80;
    location / {
        proxy_pass http://api_backend;
        proxy_next_upstream error timeout http_502;
    }
}`,
        },
      ],
      whyItMatters: "Clientes esperam serviços sempre no ar; balanceamento e réplicas são a base de qualquer SLA sério.",
      commonMistake: "Guardar sessão na memória da instância: o usuário é deslogado quando o balanceador o manda para outra réplica.",
      productionTip: "Faça o /health verificar dependências críticas de forma leve e rápida, sem sobrecarregar o banco.",
      interviewQuestion: "Qual a diferença entre um load balancer de camada 4 e de camada 7?",
      glossary: [
        { term: "SPOF", definition: "Ponto único de falha: se cair, tudo cai." },
        { term: "Round robin", definition: "Distribuição em rodízio sequencial." },
        { term: "Health check", definition: "Teste periódico de saúde de uma instância." },
        { term: "Stateless", definition: "Aplicação que não guarda estado local entre requisições." },
      ],
      printQuestLink: "A API do CloudShop roda com três réplicas atrás de um balanceador com health check em /health.",
      quiz: [
        { question: "O que é um SPOF?", options: ["Um tipo de cache", "Ponto único de falha", "Protocolo", "Firewall"], answerIndex: 1, explanation: "Componente cuja falha derruba o sistema todo." },
        { question: "Qual algoritmo envia para a instância menos ocupada?", options: ["Round robin", "IP hash", "Least connections", "Random"], answerIndex: 2, explanation: "Least connections considera as conexões ativas." },
        { question: "Por que a app deve ser stateless?", options: ["Ocupa menos disco", "Qualquer réplica pode atender qualquer requisição", "Exigência do DNS", "Fica mais bonita"], answerIndex: 1, explanation: "Sem estado local, o balanceamento é transparente." },
      ],
    },
    {
      id: "l-2-8",
      moduleId: "mod-2",
      title: "Troubleshooting de rede ponta a ponta: método em 5 camadas",
      duration: 35,
      difficulty: "Intermediário",
      tools: ["ping", "dig", "traceroute", "curl", "ss"],
      xp: 25,
      objectives: [
        "Aplicar um roteiro sistemático para “o site não abre”",
        "Isolar se o problema é DNS, rede, porta, TLS ou aplicação",
        "Usar a ferramenta certa para cada camada",
        "Documentar a investigação de forma clara",
      ],
      body: [
        "“O site não abre” é a frase mais ouvida em plantão. Em vez de chutar, use um **método em camadas**: comece de baixo e só suba quando a camada atual estiver comprovadamente ok.",
        "**Camada 1 — DNS:** o nome resolve para o IP correto? `dig +short app.exemplo.com`. Se não resolve ou aponta errado, o problema é DNS — pare aqui.",
        "**Camada 2 — Alcance:** o IP responde? `ping` testa (mas muitos servidores bloqueiam ICMP). `traceroute` ou `mtr` mostram em que salto os pacotes se perdem.",
        "**Camada 3 — Porta:** o serviço aceita conexão? `nc -zv ip 443`. Refused = nada escutando; timeout = firewall/Security Group.",
        "**Camada 4 — TLS:** o certificado é válido? `curl -vI https://app` mostra o handshake; `openssl s_client -connect app:443` revela expiração e cadeia.",
        "**Camada 5 — Aplicação:** a resposta HTTP faz sentido? Status 200, 4xx ou 5xx? Logs do Nginx e da aplicação dizem o resto. Um 502 aponta para o backend.",
        "Teste **de dentro e de fora**: se funciona de dentro do servidor (`curl localhost:3000`) mas não de fora, o problema está entre os dois (proxy, firewall, balanceador).",
        "Anote cada teste e resultado com horário. Além de ajudar o time, vira o rascunho do postmortem e evita repetir verificações.",
      ],
      code: [
        {
          label: "Roteiro rápido de diagnóstico",
          language: "bash",
          code: `HOST=app.exemplo.com
dig +short $HOST                       # 1. DNS
mtr -rwc 10 $HOST                      # 2. caminho de rede
nc -zv $HOST 443                       # 3. porta
curl -svI https://$HOST 2>&1 | grep -E "expire|HTTP/"   # 4. TLS + status
ssh servidor 'curl -s -o /dev/null -w "%{http_code}\\n" localhost:3000/health'  # 5. app por dentro`,
        },
      ],
      whyItMatters: "Um método sistemático reduz drasticamente o tempo de resolução (MTTR) e evita mudanças às cegas em produção.",
      commonMistake: "Reiniciar servidores antes de investigar, apagando evidências e sem descobrir a causa.",
      productionTip: "Transforme esse roteiro em um runbook do time e em verificações sintéticas automáticas.",
      interviewQuestion: "Um usuário diz que o site não abre. Quais passos você segue, em ordem?",
      glossary: [
        { term: "mtr", definition: "Combina ping e traceroute em tempo real." },
        { term: "Handshake TLS", definition: "Negociação inicial que estabelece a conexão segura." },
        { term: "MTTR", definition: "Tempo médio para restaurar o serviço." },
        { term: "Runbook", definition: "Roteiro documentado para resolver um tipo de problema." },
      ],
      printQuestLink: "O Dragão 502 do reino das Redes é derrotado exatamente com este roteiro em camadas.",
      quiz: [
        { question: "Qual a primeira camada a verificar?", options: ["Aplicação", "TLS", "DNS", "Banco de dados"], answerIndex: 2, explanation: "Sem resolver o nome, nada mais funciona." },
        { question: "Funciona via `curl localhost` mas não de fora. Onde está o problema provável?", options: ["No código", "Entre cliente e servidor (proxy/firewall)", "No DNS do servidor", "No disco"], answerIndex: 1, explanation: "A app está ok; o caminho até ela não." },
        { question: "Que ferramenta mostra a expiração do certificado?", options: ["ping", "dig", "openssl s_client", "df"], answerIndex: 2, explanation: "`openssl s_client` exibe o certificado." },
      ],
    },
  ],
};
