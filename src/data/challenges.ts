import type { BossBattle, Challenge } from "@/lib/types";

export const CHALLENGES: Challenge[] = [
  {
    id: "ch-01",
    title: "Runbook de plantão em 30 comandos",
    level: "Iniciante",
    xp: 250,
    tools: ["Linux", "systemd", "journalctl"],
    brief:
      "Escreva o runbook que qualquer pessoa usaria nos primeiros cinco minutos de um incidente em um servidor Linux, com ordem de investigação e critério de escalada.",
    acceptance: [
      "30 comandos agrupados por objetivo, cada um com uma frase própria explicando o que responde",
      "Seção 'primeiros 5 minutos' com ordem de execução justificada",
      "Critério objetivo de escalada (quando envolver outra pessoa)",
      "Arquivo versionado em docs/runbook-linux.md",
    ],
    feedback:
      "Avaliação simulada: runbooks reprovam quando listam comandos sem ordem de uso. O diferencial é dizer o que fazer com cada resultado.",
  },
  {
    id: "ch-02",
    title: "Diagnóstico do 502 sem tocar no código",
    level: "Intermediário",
    xp: 250,
    tools: ["Nginx", "curl", "ss", "journalctl"],
    brief:
      "Dado um Nginx retornando 502 intermitente, produza um relatório com evidências que prove a causa raiz sem alterar a aplicação.",
    acceptance: [
      "Evidência do error.log do Nginx com a mensagem entre parênteses",
      "Teste direto no upstream com curl e verificação de porta com ss",
      "Correlação temporal entre reinícios do serviço e ocorrências de 502",
      "Conclusão com causa raiz e correção proposta (com e sem alteração de código)",
    ],
    feedback:
      "Relatórios fortes distinguem 502 de 504 pela evidência, não pela suposição, e propõem correção estrutural além do paliativo.",
  },
  {
    id: "ch-03",
    title: "Automação de plantão em Bash",
    level: "Intermediário",
    xp: 250,
    tools: ["Bash", "systemd timers", "ShellCheck"],
    brief:
      "Entregue dois scripts (health-check e backup com retenção) com tratamento de erro, códigos de saída distintos e agendamento por systemd timer.",
    acceptance: [
      "set -euo pipefail, trap de limpeza e log com timestamp em stderr",
      "Códigos de saída diferentes por tipo de falha, documentados no cabeçalho",
      "ShellCheck sem avisos",
      "Timer ativo com Persistent=true e restauração de backup testada",
    ],
    feedback:
      "O que reprova aqui é script que retorna 0 em falha: a automação a jusante toma decisão errada e o problema passa silencioso.",
  },
  {
    id: "ch-04",
    title: "Imagem enxuta e endurecida",
    level: "Intermediário",
    xp: 250,
    tools: ["Docker", "Trivy", "BuildKit"],
    brief:
      "Reduza a imagem da API para menos de 200 MB, rodando como usuário não-root, com filesystem somente leitura e sem vulnerabilidade crítica corrigível.",
    acceptance: [
      "Tamanho antes e depois documentado, com as três mudanças que produziram o ganho",
      "Multi-stage com .dockerignore e dependências de produção apenas",
      "Container roda com --read-only, --cap-drop ALL e usuário não-root",
      "Trivy sem HIGH/CRITICAL corrigíveis",
    ],
    feedback:
      "Bons candidatos explicam o ganho por camada; medianos só trocam a base para alpine e param aí.",
  },
  {
    id: "ch-05",
    title: "Stack completo com um comando",
    level: "Intermediário",
    xp: 250,
    tools: ["Docker Compose", "PostgreSQL"],
    brief:
      "Entregue um docker compose up que sobe frontend, API e banco com healthchecks, persistência e nenhum segredo em texto no repositório.",
    acceptance: [
      "Healthcheck no banco e depends_on com condition: service_healthy",
      "Volume nomeado com persistência comprovada após down/up",
      "Rede interna para o banco, sem porta publicada no host",
      "Segredos por arquivo ou secret, com .gitignore correspondente",
    ],
    feedback:
      "Avaliadores testam exatamente duas coisas: subir do zero em máquina limpa e sobreviver a um restart sem perder dados.",
  },
  {
    id: "ch-06",
    title: "Pipeline que protege a main",
    level: "Intermediário",
    xp: 250,
    tools: ["GitHub Actions", "Branch protection"],
    brief:
      "Configure CI obrigatório com lint, testes unitários e de integração, cache eficiente e duração total abaixo de cinco minutos.",
    acceptance: [
      "Merge bloqueado quando o check falha",
      "Testes de integração com service container e migrações aplicadas",
      "Cache com chave baseada no lockfile, com ganho medido",
      "Duração do pipeline documentada antes e depois das otimizações",
    ],
    feedback:
      "Pipeline lento é o problema mais comum: mostre o número antes e depois e explique o que causou o ganho.",
  },
  {
    id: "ch-07",
    title: "Deploy com rollback automático",
    level: "Avançado",
    xp: 250,
    tools: ["GitHub Actions", "GHCR", "Bash"],
    brief:
      "Implemente publicação de imagem com tag imutável e deploy que reverte automaticamente quando a verificação de saúde falha. Meça o RTO.",
    acceptance: [
      "Imagem publicada com versão semântica, tag por SHA e digest registrado",
      "Verificação de saúde pós-deploy com retry e backoff",
      "Rollback automático em falha, com evidência de execução",
      "RTO medido e publicado no README",
    ],
    feedback:
      "Quem mede o RTO se destaca. Rollback existente mas nunca testado é considerado inexistente por bons avaliadores.",
  },
  {
    id: "ch-08",
    title: "Ambiente AWS seguro e auditável",
    level: "Avançado",
    xp: 250,
    tools: ["AWS", "IAM", "VPC", "RDS"],
    brief:
      "Entregue um ambiente com banco privado, aplicação em subnet privada, IAM sem chaves estáticas, orçamento configurado e checklist de destruição executado.",
    acceptance: [
      "Nenhuma chave de acesso de longa duração em uso (OIDC ou instance profile)",
      "Auditoria mostrando zero regras 0.0.0.0/0 em portas administrativas ou de banco",
      "Budget ativo e todos os recursos com tags de projeto/ambiente/dono",
      "Evidência de que a conta ficou sem recursos remanescentes ao final",
    ],
    feedback:
      "O achado que mais reprova em auditoria real é SSH ou porta de banco aberta ao mundo — verifique antes de entregar.",
  },
  {
    id: "ch-09",
    title: "Dois ambientes idênticos por IaC",
    level: "Avançado",
    xp: 250,
    tools: ["Terraform", "Ansible"],
    brief:
      "Provisione dev e staging com o mesmo módulo, state remoto com lock, e configure os hosts com playbook idempotente.",
    acceptance: [
      "State em backend remoto com versionamento, lock e criptografia",
      "Módulo reutilizado; diferenças apenas em tfvars",
      "terraform plan com exit code 0 após apply em ambos os ambientes",
      "Playbook com changed=0 na segunda execução",
    ],
    feedback:
      "Reprova quem duplica código por ambiente. O objetivo é uma definição, várias configurações.",
  },
  {
    id: "ch-10",
    title: "Kubernetes com rollback comprovado",
    level: "Avançado",
    xp: 250,
    tools: ["Kubernetes", "Helm"],
    brief:
      "Rode o PrintQuest no cluster com Ingress, probes corretas, limites dimensionados por medição e rollback executado com tempo registrado.",
    acceptance: [
      "Probes separando liveness (sem dependências) de readiness (com dependências)",
      "requests/limits justificados por kubectl top, não por chute",
      "Chart Helm com values por ambiente e image.tag obrigatório",
      "Evidência de rollback com tempo medido",
    ],
    feedback:
      "Liveness que checa o banco é o erro clássico: explique por que você não fez isso e ganhe pontos.",
  },
  {
    id: "ch-11",
    title: "GitOps de ponta a ponta",
    level: "Ninja",
    xp: 250,
    tools: ["ArgoCD", "Kustomize", "External Secrets"],
    brief:
      "Coloque staging e produção sob ArgoCD, com promoção por PR, segredos fora do Git e rollback por revert comprovado.",
    acceptance: [
      "Applications Synced/Healthy com selfHeal ativo em staging",
      "Promoção para produção por PR com a versão validada em staging",
      "Nenhum valor sensível no repositório GitOps (verificado por scanner)",
      "Rollback por git revert com tempo registrado",
    ],
    feedback:
      "Diferencial de nível sênior: explicar por que produção não tem auto-sync e como o self-heal interage com o HPA.",
  },
  {
    id: "ch-12",
    title: "SLO, incidente e postmortem",
    level: "Ninja",
    xp: 250,
    tools: ["Prometheus", "Grafana", "OpenTelemetry"],
    brief:
      "Defina os SLOs do PrintQuest, conduza um incidente controlado e publique o postmortem sem culpa com ações, donos e prazos.",
    acceptance: [
      "Dois SLIs com consulta PromQL e metas justificadas",
      "Alertas por sintoma e por burn rate, com runbook vinculado",
      "Linha do tempo do incidente com impacto medido em minutos e em error budget",
      "Postmortem com causas contribuintes, o que funcionou e ações com prazo",
    ],
    feedback:
      "Postmortem que culpa pessoa é reprovado. O que se avalia é a capacidade de encontrar a falha de sistema que permitiu o erro.",
  },
];

export const BOSSES: BossBattle[] = [
  {
    id: "boss-processo-zumbi",
    regionId: "vila-terminal",
    name: "Processo Zumbi",
    scenario:
      "Depois de um deploy manual, o serviço da API não sobe: a porta 3000 está ocupada, o systemd reporta falha e há processos órfãos na árvore. O time pede a API de volta em dez minutos.",
    symptoms: [
      "systemctl start falha com 'Address already in use'",
      "ps mostra processos node em estado Z (zumbi) e um pai antigo ainda vivo",
      "journalctl registra reinícios sucessivos",
    ],
    investigation: [
      { step: "Ver o estado da unidade e o erro exato", command: "systemctl status printquest-api --no-pager -l" },
      { step: "Descobrir quem ocupa a porta", command: "ss -tulpn | grep :3000" },
      { step: "Mapear a árvore de processos e os zumbis", command: "ps -eo pid,ppid,stat,etime,cmd | awk '$3 ~ /Z/ || /node/'" },
      { step: "Ler o primeiro erro da unidade", command: "journalctl -u printquest-api -p err --since '20 min ago' --no-pager" },
      { step: "Confirmar arquivos e sockets abertos", command: "sudo lsof -i :3000" },
    ],
    rootCause:
      "Uma execução manual anterior deixou um processo node em segundo plano segurando a porta 3000. Seus filhos terminaram sem serem coletados (zumbis), e o systemd não conseguia iniciar a unidade porque o socket já estava em uso.",
    resolution: [
      "Encerrar o processo pai órfão com SIGTERM (kill -TERM) para permitir limpeza",
      "Confirmar que os zumbis desapareceram junto com o pai",
      "Verificar que a porta ficou livre com ss -tulpn",
      "Iniciar a unidade pelo systemd e confirmar 200 em /health",
      "Prevenção: proibir execução manual do binário e usar sempre systemctl; adicionar KillMode=control-group na unit",
    ],
    xp: 750,
    requiredLevel: 3,
  },
  {
    id: "boss-dragao-502",
    regionId: "floresta-redes",
    name: "Dragão 502",
    scenario:
      "Usuários recebem 502 em rajadas de dois minutos, várias vezes por hora. O time de aplicação garante que 'não mudou nada'. Você tem acesso ao proxy e ao host da API.",
    symptoms: [
      "Nginx retorna 502 intermitente; entre as rajadas, tudo normal",
      "error.log traz 'connect() failed (111: Connection refused) while connecting to upstream'",
      "Uso de memória do host cresce até o momento das rajadas",
    ],
    investigation: [
      { step: "Ler a mensagem exata do proxy", command: "sudo tail -100 /var/log/nginx/printquest.error.log" },
      { step: "Testar o upstream diretamente", command: "curl -s -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:3000/health" },
      { step: "Confirmar quem escuta a porta", command: "ss -tulpn | grep :3000" },
      { step: "Ver reinícios e OOM na unidade", command: "journalctl -u printquest-api --since '1 hour ago' | grep -iE 'oom|killed|restart'" },
      { step: "Correlacionar horário dos 502 com os reinícios", command: "awk '$9==502 {print $4}' /var/log/nginx/printquest.access.log | tail -20" },
    ],
    rootCause:
      "A API era encerrada pelo OOM killer por vazamento de memória e reiniciada pelo systemd. Durante os segundos de reinício, o Nginx não conseguia conectar ao upstream e devolvia 502 — daí o padrão em rajadas.",
    resolution: [
      "Mitigar imediatamente: aumentar memória disponível e reduzir a janela de indisponibilidade com readiness antes de receber tráfego",
      "Configurar max_fails/fail_timeout e retry no upstream do Nginx",
      "Corrigir o vazamento (evidência: heap crescente entre reinícios)",
      "Adicionar alerta por taxa de 5xx e por reinícios da unidade",
      "Documentar no runbook: 502 = upstream indisponível; 504 = upstream lento",
    ],
    xp: 750,
    requiredLevel: 8,
  },
  {
    id: "boss-conflito-merge",
    regionId: "reino-codigo",
    name: "Conflito de Merge",
    scenario:
      "Uma correção urgente precisa entrar na main, mas sua branch está três dias atrás e conflita em dois arquivos, incluindo um de configuração de timeout que outra pessoa também alterou.",
    symptoms: [
      "git rebase interrompe com CONFLICT em dois arquivos",
      "A branch tem commits já enviados e revisados no PR",
      "Um dos conflitos é semântico: os dois valores são plausíveis",
    ],
    investigation: [
      { step: "Ver quais arquivos conflitam", command: "git status --short" },
      { step: "Entender o que cada lado mudou", command: "git log --oneline --left-right main...HEAD" },
      { step: "Ver o diff do arquivo em conflito", command: "git diff --diff-filter=U" },
      { step: "Descobrir quem e por que mudou o valor", command: "git log -p -1 --format='%an %s' -- config.env" },
      { step: "Após resolver, validar com os testes", command: "npm test" },
    ],
    rootCause:
      "Divergência longa entre branch e main mais alteração simultânea no mesmo parâmetro. O conflito textual esconde uma decisão de engenharia: qual timeout é o correto.",
    resolution: [
      "Resolver o conflito escolhendo o valor correto (que pode não ser nenhum dos dois) e registrar o porquê no commit",
      "Rodar os testes antes de concluir o rebase",
      "Concluir com git rebase --continue e push com --force-with-lease (nunca --force)",
      "Se o PR já tinha aprovações, avisar os revisores da reescrita",
      "Prevenção: branches curtas, integração diária com a main e testes cobrindo o parâmetro alterado",
    ],
    xp: 750,
    requiredLevel: 10,
  },
  {
    id: "boss-crashloop-container",
    regionId: "vale-containers",
    name: "Container CrashLoop",
    scenario:
      "Após adicionar o banco ao Compose, a API entra em laço de reinício. O frontend responde, mas nenhuma rota que usa dados funciona.",
    symptoms: [
      "docker compose ps mostra api reiniciando continuamente",
      "Logs terminam sempre com ECONNREFUSED 127.0.0.1:5432",
      "O banco está healthy",
    ],
    investigation: [
      { step: "Ver o erro real da aplicação", command: "docker compose logs --tail=50 api" },
      { step: "Confirmar a saúde do banco", command: "docker compose ps && docker compose exec db pg_isready -U printquest" },
      { step: "Testar a resolução de nome dentro do container", command: "docker compose exec api getent hosts db" },
      { step: "Inspecionar as variáveis efetivas", command: "docker compose exec api env | grep -i database" },
      { step: "Verificar o entrypoint e o comando", command: "docker inspect printquest-api --format '{{.Config.Entrypoint}} {{.Config.Cmd}}'" },
    ],
    rootCause:
      "A aplicação conectava em 127.0.0.1, que dentro do container é o próprio container, e não o serviço do banco. Somado a isso, faltava healthcheck com depends_on condicionado, então a API subia antes de o banco aceitar conexões.",
    resolution: [
      "Definir DATABASE_HOST=db (nome do serviço no Compose)",
      "Adicionar healthcheck com pg_isready no banco e condition: service_healthy na API",
      "Implementar retry com backoff na conexão inicial da aplicação",
      "Colocar o banco em rede internal, sem porta publicada",
      "Prevenção: validar com docker compose config no CI e testar subida a partir de máquina limpa",
    ],
    xp: 750,
    requiredLevel: 15,
  },
  {
    id: "boss-pipeline-quebrado",
    regionId: "fortaleza-cicd",
    name: "Pipeline Quebrado",
    scenario:
      "O CI está verde nos PRs e vermelho na main desde ontem à noite. Ninguém alterou o workflow, e o time está bloqueado para publicar a versão.",
    symptoms: [
      "Job de integração falha apenas na main, na etapa de migração",
      "Log mostra 'password authentication failed for user'",
      "Localmente tudo passa",
    ],
    investigation: [
      { step: "Ver o primeiro erro do job que falhou", command: "gh run view --log-failed | head -60" },
      { step: "Comparar as execuções verde e vermelha", command: "gh run list --workflow=ci.yml --limit 10" },
      { step: "Conferir diferenças de variáveis entre os gatilhos", command: "gh api repos/:owner/:repo/actions/variables --jq '.variables[].name'" },
      { step: "Reproduzir localmente com as mesmas versões", command: "act push -j integracao" },
      { step: "Confirmar o service container e a string de conexão", command: "grep -n 'DATABASE_URL' -r .github/workflows" },
    ],
    rootCause:
      "O job da main usava um secret de ambiente que só existe no ambiente de PR; após uma rotação de credencial, a variável ficou divergente entre os dois caminhos. A duplicação de configuração entre workflows escondeu o problema.",
    resolution: [
      "Unificar as etapas comuns em workflow reutilizável (workflow_call) com as mesmas variáveis",
      "Usar credenciais de teste efêmeras do service container, nunca segredo real em teste",
      "Adicionar validação que falha cedo quando uma variável obrigatória está ausente",
      "Reexecutar apenas os jobs que falharam para confirmar a correção",
      "Prevenção: proibir duplicação de configuração entre workflows e revisar rotação de secrets como mudança",
    ],
    xp: 750,
    requiredLevel: 19,
  },
  {
    id: "boss-security-group",
    regionId: "imperio-cloud",
    name: "Security Group Exposto",
    scenario:
      "Uma varredura de segurança encontrou a porta 5432 do banco acessível de 0.0.0.0/0 e SSH aberto ao mundo. Você tem uma hora para corrigir sem derrubar a aplicação.",
    symptoms: [
      "Regra 0.0.0.0/0 na porta 5432 do SG do banco",
      "Regra 0.0.0.0/0 na porta 22 do SG da aplicação",
      "CloudTrail registra tentativas de autenticação de IPs desconhecidos",
    ],
    investigation: [
      { step: "Listar SGs com regras abertas ao mundo", command: "aws ec2 describe-security-groups --query 'SecurityGroups[?IpPermissions[?IpRanges[?CidrIp==`0.0.0.0/0`]]].{ID:GroupId,Nome:GroupName}'" },
      { step: "Confirmar se o banco é publicamente acessível", command: "aws rds describe-db-instances --query 'DBInstances[].{ID:DBInstanceIdentifier,Publico:PubliclyAccessible}'" },
      { step: "Descobrir quem realmente precisa acessar", command: "aws ec2 describe-instances --filters Name=tag:project,Values=printquest --query 'Reservations[].Instances[].{ID:InstanceId,SGs:SecurityGroups[].GroupId}'" },
      { step: "Auditar tentativas de acesso", command: "aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=ConsoleLogin --max-results 10" },
      { step: "Validar a nova regra antes de remover a antiga", command: "nc -zv $DB_ENDPOINT 5432" },
    ],
    rootCause:
      "Regras criadas manualmente 'para testar' durante o provisionamento inicial, sem IaC e sem revisão. O banco ficou alcançável da internet e o SSH exposto a força bruta.",
    resolution: [
      "Adicionar a regra correta (5432 com origem no SG da aplicação) antes de remover a aberta, evitando indisponibilidade",
      "Remover as regras 0.0.0.0/0 de 22 e 5432 e substituir SSH por SSM Session Manager",
      "Confirmar PubliclyAccessible=false no RDS e rotacionar as credenciais do banco",
      "Descrever os SGs em Terraform para que a mudança fique versionada e revisável",
      "Prevenção: verificação automatizada no CI que falha em regra aberta ao mundo",
    ],
    xp: 750,
    requiredLevel: 24,
  },
  {
    id: "boss-drift-terraform",
    regionId: "terra-iac",
    name: "Drift Terraform",
    scenario:
      "O plan de rotina quer destruir uma regra de firewall e alterar tags que ninguém mudou no código. Houve uma correção emergencial no console na madrugada anterior.",
    symptoms: [
      "terraform plan retorna exit code 2 com mudanças inesperadas",
      "Uma regra criada manualmente resolveu um incidente e não está no código",
      "Tags de um recurso divergem do padrão do projeto",
    ],
    investigation: [
      { step: "Ver exatamente o que difere", command: "terraform plan -detailed-exitcode -no-color | tee drift.txt" },
      { step: "Comparar o state com a realidade", command: "terraform state show aws_security_group.app" },
      { step: "Descobrir quem alterou e quando", command: "aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=AuthorizeSecurityGroupIngress --max-results 5" },
      { step: "Refletir a mudança legítima no código", command: "terraform plan -target=aws_security_group.app" },
      { step: "Confirmar convergência após o ajuste", command: "terraform plan -detailed-exitcode; echo $?" },
    ],
    rootCause:
      "Alteração manual no console durante um incidente (drift). O apply seguinte iria remover uma correção legítima, transformando a rotina de IaC em novo incidente.",
    resolution: [
      "NÃO aplicar antes de entender: identificar quais diferenças são legítimas e quais são acidentais",
      "Trazer a correção legítima para o código (ou importar o recurso criado à mão)",
      "Reverter as diferenças acidentais aplicando o código",
      "Confirmar plan com exit code 0 nos dois ambientes",
      "Prevenção: plan agendado diário em CI, alerta de drift e regra de que correção manual vira PR no mesmo dia",
    ],
    xp: 750,
    requiredLevel: 29,
  },
  {
    id: "boss-crashloopbackoff",
    regionId: "montanhas-k8s",
    name: "CrashLoopBackOff",
    scenario:
      "Após um upgrade, dois pods da API ficam em CrashLoopBackOff com 14 restarts. A versão anterior funcionava e o cluster está com recursos disponíveis.",
    symptoms: [
      "kubectl get pods mostra CrashLoopBackOff e contagem crescente de restarts",
      "describe indica Last State: Terminated, Reason: OOMKilled em um pod e falha de liveness no outro",
      "Logs do container terminam durante a inicialização",
    ],
    investigation: [
      { step: "Ver estado e restarts", command: "kubectl -n printquest get pods -l component=api -o wide" },
      { step: "Ler eventos e o motivo do término", command: "kubectl -n printquest describe pod <pod> | tail -30" },
      { step: "Ler o log da execução anterior", command: "kubectl -n printquest logs <pod> --previous --tail=80" },
      { step: "Confirmar OOMKilled", command: "kubectl -n printquest get pod <pod> -o jsonpath='{.status.containerStatuses[0].lastState.terminated.reason}'" },
      { step: "Medir consumo real da versão saudável", command: "kubectl top pods -n printquest" },
    ],
    rootCause:
      "A nova versão aumentou o consumo de memória na inicialização e excedeu o limite de 256Mi (OOMKilled). Em paralelo, a liveness probe com initialDelay curto matava o container antes de terminar a inicialização, criando o laço.",
    resolution: [
      "Mitigar com rollback imediato: kubectl rollout undo (ou helm rollback) para restaurar o serviço",
      "Dimensionar requests/limits com base no consumo medido da nova versão",
      "Adicionar startupProbe com failureThreshold generoso e manter a liveness simples, sem dependências",
      "Reaplicar a versão com os ajustes e observar rollout status",
      "Prevenção: teste de carga no CI comparando consumo entre versões e alerta de OOMKilled",
    ],
    xp: 750,
    requiredLevel: 34,
  },
  {
    id: "boss-out-of-sync",
    regionId: "portal-gitops",
    name: "Deployment Fora de Sincronia",
    scenario:
      "A Application de produção está OutOfSync há horas e o self-heal fica desfazendo o número de réplicas ajustado pelo autoscaling, oscilando a capacidade em horário de pico.",
    symptoms: [
      "ArgoCD reporta OutOfSync no campo spec.replicas",
      "Réplicas oscilam entre o valor do Git e o valor do HPA",
      "Latência sobe durante as oscilações",
    ],
    investigation: [
      { step: "Ver o status e a última sincronização", command: "argocd app get printquest-producao" },
      { step: "Descobrir exatamente qual campo difere", command: "argocd app diff printquest-producao" },
      { step: "Confirmar que o HPA está atuando", command: "kubectl -n printquest get hpa printquest-api" },
      { step: "Ver o histórico de sync", command: "argocd app history printquest-producao" },
      { step: "Verificar se alguém editou o cluster à mão", command: "kubectl -n printquest get deploy printquest-api -o jsonpath='{.metadata.annotations}'" },
    ],
    rootCause:
      "Conflito entre duas fontes de verdade para o mesmo campo: o Git declara replicas e o HPA também os gerencia. O self-heal revertia o autoscaling, e o HPA voltava a escalar — um cabo de guerra em produção.",
    resolution: [
      "Remover replicas do manifest versionado (ou usar ignoreDifferences em /spec/replicas)",
      "Deixar o HPA como única autoridade sobre a quantidade de réplicas, com minReplicas seguro",
      "Sincronizar e confirmar Synced/Healthy com o HPA operando",
      "Documentar no repositório quem é dono de cada campo",
      "Prevenção: revisar todo campo mutado por controllers antes de versioná-lo",
    ],
    xp: 750,
    requiredLevel: 38,
  },
  {
    id: "boss-queda-producao",
    regionId: "torre-confiabilidade",
    name: "Queda em Produção",
    scenario:
      "14:03. Alerta crítico: 78% das requisições falhando após o deploy da v1.4.0. Você é o comandante do incidente. Cada minuto consome error budget de um SLO de 99,9%.",
    symptoms: [
      "Taxa de 5xx acima de 70%, p95 acima de 8 segundos",
      "Traces mostram espera longa antes da consulta ao banco",
      "Logs do banco indicam limite de conexões atingido",
    ],
    investigation: [
      { step: "Confirmar impacto e escopo no dashboard", command: "curl -sG localhost:9090/api/v1/query --data-urlencode 'query=sum(rate(http_request_duration_seconds_count{status=~\"5..\"}[5m]))/sum(rate(http_request_duration_seconds_count[5m]))'" },
      { step: "Verificar o que mudou nos últimos 30 minutos", command: "argocd app history printquest-producao | tail -3" },
      { step: "Localizar o gargalo no trace", command: "curl -s 'localhost:3200/api/search?tags=service.name%3Dprintquest-api&minDuration=2s&limit=5'" },
      { step: "Confirmar a hipótese nos logs do banco", command: "kubectl -n printquest logs deploy/printquest-db --tail=50 | grep -i 'too many connections'" },
      { step: "Após mitigar, validar recuperação", command: "kubectl -n printquest rollout status deploy/printquest-api" },
    ],
    rootCause:
      "A v1.4.0 abria uma conexão por requisição sem devolvê-la ao pool. Sob tráfego normal, o limite de conexões do banco foi atingido em dois minutos, causando falha generalizada. O teste de carga não cobria a nova rota.",
    resolution: [
      "Mitigar primeiro: rollback por git revert e sync (serviço restaurado antes da análise completa)",
      "Comunicar status a cada 10 minutos, com impacto e próxima atualização",
      "Confirmar recuperação por métricas, não por sensação",
      "Corrigir o vazamento de conexão e cobrir com teste que falha sem a correção",
      "Adicionar alerta de saturação do pool e escrever o postmortem sem culpa com ações, donos e prazos",
    ],
    xp: 750,
    requiredLevel: 43,
  },
];

export function getBoss(id: string) {
  return BOSSES.find((b) => b.id === id);
}
