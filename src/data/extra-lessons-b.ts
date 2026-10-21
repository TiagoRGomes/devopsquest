import type { Lesson } from "@/lib/types";

// Aulas extras (didáticas, do zero) dos módulos 3, 8 e 9.
export const EXTRA_LESSONS_B: Record<string, Lesson[]> = {
  "mod-3": [
    {
      id: "l-3-6",
      moduleId: "mod-3",
      title: "Conflitos de merge sem medo: entendendo e resolvendo",
      duration: 30,
      difficulty: "Iniciante",
      tools: ["Git"],
      xp: 25,
      objectives: [
        "Entender por que conflitos acontecem",
        "Ler os marcadores de conflito (<<<<<<<, =======, >>>>>>>)",
        "Resolver conflitos passo a passo com segurança",
        "Evitar conflitos com boas práticas de branch",
      ],
      body: [
        "Um **conflito de merge** acontece quando duas pessoas alteram **a mesma região do mesmo arquivo** em branches diferentes. O Git não consegue decidir sozinho qual versão manter — e pede ajuda para você. Não é erro seu: é parte normal do trabalho em equipe.",
        "Quando o conflito aparece, o Git marca o arquivo assim: `<<<<<<< HEAD` mostra a **sua** versão, `=======` separa, e `>>>>>>> outra-branch` mostra a versão que está chegando. Seu trabalho é escolher o que fica — pode ser uma das duas, as duas juntas, ou algo novo.",
        "O passo a passo seguro: (1) rode `git status` para ver os arquivos em conflito, (2) abra cada um, (3) encontre os marcadores, (4) edite deixando o conteúdo correto **e apague os marcadores**, (5) `git add` no arquivo, (6) `git commit` para concluir o merge.",
        "Se entrar em pânico no meio, `git merge --abort` cancela tudo e volta ao estado anterior. Nada se perde — use sem medo.",
        "Depois de resolver, **teste o código antes de commitar**: o merge pode compilar mas quebrar a lógica (ex.: as duas versões mexeram na mesma função).",
        "Ferramentas ajudam: `git mergetool`, o editor do VS Code (botões “Accept Current/Incoming/Both”) e interfaces do GitHub para conflitos simples.",
        "A melhor forma de lidar com conflitos é **evitá-los**: branches curtas (dias, não semanas), `git pull --rebase` frequente da branch principal, e comunicação quando duas pessoas mexem no mesmo arquivo.",
        "Para conflitos em arquivos gerados (lockfiles, builds), normalmente o correto é aceitar uma versão e **regenerar** o arquivo, em vez de editar na mão.",
      ],
      code: [
        {
          label: "Resolvendo um conflito na prática",
          language: "bash",
          code: `git merge feature/cupom
# CONFLICT (content): Merge conflict in src/preco.ts
git status                       # lista os arquivos em conflito
# ...edita o arquivo, remove os marcadores...
git add src/preco.ts
git commit                       # conclui o merge
# se quiser desistir no meio:
# git merge --abort`,
        },
        {
          label: "Como o conflito aparece no arquivo",
          language: "text",
          code: `<<<<<<< HEAD
const desconto = 0.10;
=======
const desconto = 0.15;
>>>>>>> feature/cupom`,
        },
      ],
      whyItMatters: "Todo time usa Git diariamente; quem resolve conflitos com calma e método destrava o trabalho de todos.",
      commonMistake: "Apagar os marcadores sem ler as duas versões, escolhendo uma versão no escuro e perdendo código do colega.",
      productionTip: "Em conflito de lockfile (package-lock.json), aceite uma versão e rode o instalador de novo para regenerar.",
      interviewQuestion: "Explique o que significam os marcadores <<<<<<<, ======= e >>>>>>> num conflito de merge.",
      glossary: [
        { term: "Conflito", definition: "Quando o Git não consegue unir duas alterações na mesma região." },
        { term: "HEAD", definition: "Referência para o commit atual da sua branch." },
        { term: "merge --abort", definition: "Cancela o merge e volta ao estado anterior." },
        { term: "Lockfile", definition: "Arquivo gerado que trava versões exatas de dependências." },
      ],
      printQuestLink: "No CloudShop, duas pessoas mexem no serviço de preços ao mesmo tempo — você resolve o conflito sem perder nada.",
      quiz: [
        { question: "Quando ocorre um conflito de merge?", options: ["Sempre que há merge", "Quando duas branches alteram a mesma região do mesmo arquivo", "Quando a internet cai", "Quando o repositório é grande"], answerIndex: 1, explanation: "O Git só pede ajuda quando as mudanças colidem." },
        { question: "O que `git merge --abort` faz?", options: ["Apaga a branch", "Cancela o merge e volta ao estado anterior", "Resolve o conflito sozinho", "Faz push"], answerIndex: 1, explanation: "É a saída de emergência segura." },
        { question: "Como evitar conflitos?", options: ["Branches longas", "Branches curtas e sincronização frequente", "Nunca usar merge", "Editar direto na main"], answerIndex: 1, explanation: "Quanto menor a distância entre branches, menor a chance de colisão." },
      ],
    },
    {
      id: "l-3-7",
      moduleId: "mod-3",
      title: "Recuperação de desastres no Git: reflog, stash, reset e restore",
      duration: 30,
      difficulty: "Intermediário",
      tools: ["Git"],
      xp: 25,
      objectives: [
        "Usar git stash para guardar trabalho em andamento",
        "Desfazer alterações com restore e reset",
        "Recuperar commits “perdidos” com reflog",
        "Escolher a ferramenta certa para cada situação",
      ],
      body: [
        "Todo mundo já pensou “estragou tudo” no Git. A boa notícia: **quase nada se perde de verdade**. Esta aula é o seu kit de primeiros socorros.",
        "**git stash** guarda temporariamente o que você está fazendo: precisa trocar de branch mas não quer commitar ainda? `git stash` limpa a mesa; `git stash pop` devolve as alterações depois.",
        "**git restore** desfaz alterações não commitadas: `git restore arquivo` descarta mudanças no arquivo (volta ao último commit); `git restore --staged arquivo` tira do stage sem perder o conteúdo.",
        "**git reset** move o ponteiro da branch: `--soft` mantém tudo no stage, `--mixed` (padrão) mantém os arquivos mas tira do stage, `--hard` **descarta tudo** — use com muito cuidado.",
        "**git revert** é o jeito seguro de desfazer um commit **já publicado**: cria um commit novo que desfaz o anterior, sem reescrever o histórico. Em branches compartilhadas, prefira revert a reset.",
        "**git reflog** é o salva-vidas: registra para onde o HEAD apontou nos últimos tempos, inclusive commits “perdidos” por reset ou branch apagada. Ache o hash e faça `git checkout -b resgate <hash>`.",
        "Resumo de emergência: alteração não commitada → `restore`; commit local errado → `reset`; commit já enviado → `revert`; perdi tudo → `reflog`.",
        "Regra de ouro: **nunca reescreva histórico já publicado** (push force em branch compartilhada) sem combinar com o time.",
      ],
      code: [
        {
          label: "Kit de primeiros socorros",
          language: "bash",
          code: `git stash && git stash pop          # guarda e devolve
git restore src/app.ts              # descarta mudanças locais
git restore --staged src/app.ts     # tira do stage
git reset --soft HEAD~1             # desfaz o último commit, mantém stage
git revert HEAD                     # desfaz o último commit com commit novo
git reflog                          # histórico de onde o HEAD esteve
git checkout -b resgate a1b2c3d     # recupera commit “perdido”`,
        },
      ],
      whyItMatters: "Saber se recuperar de erros no Git dá confiança para experimentar — e evita pânico em sexta-feira à tarde.",
      commonMistake: "Usar `git reset --hard` por hábito e descartar horas de trabalho não commitado.",
      productionTip: "Antes de qualquer operação destrutiva, crie uma branch de backup: `git branch backup/antes-do-reset`.",
      interviewQuestion: "Qual a diferença entre `git revert` e `git reset`? Quando usar cada um?",
      glossary: [
        { term: "stash", definition: "Prateleira temporária para alterações não commitadas." },
        { term: "reflog", definition: "Registro local de todos os lugares por onde o HEAD passou." },
        { term: "revert", definition: "Commit novo que desfaz um commit anterior." },
        { term: "reset --hard", definition: "Descarta commits e alterações locais (destrutivo)." },
      ],
      printQuestLink: "Um deploy errado no CloudShop é revertido com `git revert` e o histórico fica limpo para auditoria.",
      quiz: [
        { question: "Para desfazer um commit já enviado ao time, use:", options: ["reset --hard", "revert", "stash", "reflog"], answerIndex: 1, explanation: "Revert cria um commit inverso sem reescrever o histórico." },
        { question: "Apagou uma branch com commits importantes. O que te salva?", options: ["git status", "git reflog", "git push", "git clean"], answerIndex: 1, explanation: "O reflog mostra o hash do commit perdido." },
        { question: "O que `git stash` faz?", options: ["Apaga alterações", "Guarda alterações temporariamente", "Publica a branch", "Cria tag"], answerIndex: 1, explanation: "Guarda o trabalho em andamento para retomar depois." },
      ],
    },
    {
      id: "l-3-8",
      moduleId: "mod-3",
      title: "Bash na vida real: scripts com parâmetros, laços e tratamento de erros",
      duration: 35,
      difficulty: "Intermediário",
      tools: ["Bash"],
      xp: 25,
      objectives: [
        "Escrever scripts com parâmetros e valores padrão",
        "Usar laços e condições para automatizar tarefas",
        "Tratar erros com set -euo pipefail e trap",
        "Criar um script de verificação de saúde reutilizável",
      ],
      body: [
        "Você já viu `set -euo pipefail`; agora vamos escrever scripts que **parecem profissionais**: recebem parâmetros, validam entradas, repetem tarefas e falham com mensagens claras.",
        "**Parâmetros:** dentro do script, `$1` é o primeiro argumento, `$2` o segundo. Use valores padrão com `${1:-valor}`. Sempre valide: se faltar algo obrigatório, mostre como usar e saia com erro.",
        "**Condições:** `if [ -f arquivo ]` testa se um arquivo existe; `[ -z \"$var\" ]` testa se está vazia; `comando && echo ok || echo falhou` é o atalho mais usado.",
        "**Laços:** `for f in *.log; do ...; done` repete para cada arquivo; `while read -r linha` processa um arquivo linha a linha. Combinado com pipes, resolve tarefas de minutos em segundos.",
        "**Tratamento de erros:** além do `set -euo pipefail`, use `trap 'echo \"falhou na linha $LINENO\"' ERR` para saber exatamente onde quebrou. Scripts de deploy precisam disso.",
        "**Funções** organizam scripts grandes: agrupe passos com nomes claros (`checar_dependencias`, `fazer_backup`) e o script vira documentação executável.",
        "Boas práticas: coloque `#!/usr/bin/env bash` na primeira linha, use aspas em variáveis (`\"$var\"`), comente o *porquê* (não o óbvio) e teste com `shellcheck`.",
        "Exercício mental: tudo que você digita mais de três vezes por semana merece virar um script versionado no Git.",
      ],
      code: [
        {
          label: "Script de health check com parâmetros",
          language: "bash",
          code: `#!/usr/bin/env bash
set -euo pipefail
trap 'echo "ERRO na linha $LINENO" >&2' ERR

HOST="\${1:-localhost}"
PORTA="\${2:-3000}"

checar() {
  if curl -fsS "http://$HOST:$PORTA/health" > /dev/null; then
    echo "OK: $HOST:$PORTA respondeu"
  else
    echo "FALHA: $HOST:$PORTA não respondeu" >&2
    return 1
  fi
}

for i in 1 2 3; do
  checar && exit 0
  echo "tentativa $i falhou, aguardando..."
  sleep 5
done
exit 1`,
        },
        {
          label: "Laço processando arquivos",
          language: "bash",
          code: `for f in /var/log/app/*.log; do
  echo "$f: $(wc -l < "$f") linhas"
done

# linha a linha:
while read -r servidor; do
  ping -c1 "$servidor" > /dev/null && echo "$servidor ok" || echo "$servidor FORA"
done < servidores.txt`,
        },
      ],
      whyItMatters: "Automação em Bash está em todo lugar: pipelines, provisionamento, backups e runbooks executáveis.",
      commonMistake: "Não usar aspas em variáveis: um nome de arquivo com espaço quebra o script inteiro.",
      productionTip: "Rode `shellcheck` em todo script antes de commitar — ele aponta erros que você nem imaginava.",
      securityAlert: "Nunca passe senhas como argumento de script (`script.sh senha123`): ficam visíveis no `ps` e no histórico. Use variáveis de ambiente.",
      interviewQuestion: "O que faz `set -euo pipefail` e por que usar em scripts de deploy?",
      glossary: [
        { term: "$1, $2", definition: "Argumentos passados ao script, em ordem." },
        { term: "trap", definition: "Executa um comando quando o script recebe um sinal ou erro." },
        { term: "shellcheck", definition: "Ferramenta que analisa scripts Bash e aponta problemas." },
        { term: "${var:-padrao}", definition: "Usa o valor de var ou um padrão se estiver vazia." },
      ],
      printQuestLink: "O backup diário dos logs do CloudShop é um script Bash com laço, parâmetros e trap de erro.",
      quiz: [
        { question: "O que significa `${1:-dev}` num script?", options: ["Sempre dev", "Usa $1 ou 'dev' se vazio", "Erro de sintaxe", "Soma 1"], answerIndex: 1, explanation: "É o valor padrão para o primeiro argumento." },
        { question: "Por que usar aspas em \"$var\"?", options: ["Estética", "Evita quebra com espaços e caracteres especiais", "Obrigatório no Bash", "Acelera o script"], answerIndex: 1, explanation: "Sem aspas, espaços separam o valor em vários argumentos." },
        { question: "Para que serve o `trap ... ERR`?", options: ["Ignorar erros", "Executar ação quando o script falha", "Criar laço", "Ler arquivos"], answerIndex: 1, explanation: "Permite registrar onde e como o script quebrou." },
      ],
    },
  ],
  "mod-8": [
    {
      id: "l-8-6",
      moduleId: "mod-8",
      title: "Persistência no Kubernetes: PV, PVC e StorageClass sem mistério",
      duration: 35,
      difficulty: "Intermediário",
      tools: ["Kubernetes", "kubectl"],
      xp: 25,
      objectives: [
        "Entender por que contêineres perdem dados e quando isso importa",
        "Diferenciar PV, PVC e StorageClass",
        "Montar um volume num Deployment",
        "Escolher entre volume efêmero e persistente",
      ],
      body: [
        "Contêineres são **descartáveis**: quando um Pod morre e renasce, tudo que estava gravado nele some. Para cache isso é ótimo; para um **banco de dados**, é um desastre. É aí que entra a persistência.",
        "O Kubernetes separa o problema em três peças. O **PersistentVolume (PV)** é o disco de verdade (um volume na nuvem, por exemplo). O **PersistentVolumeClaim (PVC)** é o pedido da aplicação: “preciso de 10 GB”. A **StorageClass** é a “loja” que cria discos automaticamente conforme os pedidos chegam.",
        "Pense numa analogia: a StorageClass é o cardápio (disco rápido SSD, disco barato), o PVC é o pedido do cliente e o PV é o prato que chega à mesa. Na prática moderna você quase só escreve o PVC — o resto acontece sozinho.",
        "Para usar, você cria o PVC e o referencia no Deployment em duas partes: `volumes` (liga o PVC ao Pod) e `volumeMounts` (diz em qual pasta do contêiner o disco aparece).",
        "Detalhe importante: o PVC fica **bound** (ligado) a um PV. Se ficar `Pending`, normalmente a StorageClass não existe ou a nuvem não conseguiu criar o disco — veja com `kubectl describe pvc`.",
        "Bancos de dados em produção geralmente usam **StatefulSet** em vez de Deployment: cada réplica ganha seu próprio PVC estável (db-0, db-1...), com identidade de rede fixa.",
        "Para dados temporários (cache, arquivos de trabalho), use `emptyDir`: um volume que vive enquanto o Pod vive e some junto. Mais rápido e sem custo de disco persistente.",
        "Regra prática: aplicações stateless não precisam de PVC; bancos, filas e uploads de usuários precisam — e de backup.",
      ],
      code: [
        {
          label: "PVC + Deployment",
          language: "yaml",
          code: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: dados-app
spec:
  accessModes: ["ReadWriteOnce"]   # um nó por vez
  storageClassName: standard
  resources:
    requests:
      storage: 10Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 1
  selector:
    matchLabels: { app: app }
  template:
    metadata:
      labels: { app: app }
    spec:
      containers:
        - name: app
          image: minha/app:1.0
          volumeMounts:
            - name: dados
              mountPath: /var/lib/app   # pasta persistente
      volumes:
        - name: dados
          persistentVolumeClaim:
            claimName: dados-app`,
        },
        {
          label: "Diagnosticando PVC pendente",
          language: "bash",
          code: `kubectl get pvc                 # STATUS deve ser Bound
kubectl describe pvc dados-app  # veja os Events no final
kubectl get storageclass        # existe a classe pedida?`,
        },
      ],
      whyItMatters: "Sem entender persistência, você perde dados de banco em produção no primeiro restart de Pod.",
      commonMistake: "Rodar banco de dados em Deployment sem PVC: os dados somem quando o Pod é recriado.",
      productionTip: "Disco persistente não é backup. Configure snapshots automáticos dos volumes críticos.",
      securityAlert: "Volumes com dados sensíveis devem usar StorageClass com criptografia ativada.",
      interviewQuestion: "Explique a diferença entre PV, PVC e StorageClass como se fosse para alguém de fora de tecnologia.",
      glossary: [
        { term: "PV", definition: "O disco real disponível no cluster." },
        { term: "PVC", definition: "Pedido de armazenamento feito pela aplicação." },
        { term: "StorageClass", definition: "Modelo que cria discos automaticamente." },
        { term: "StatefulSet", definition: "Controlador para apps com identidade e disco estáveis." },
        { term: "emptyDir", definition: "Volume temporário que morre com o Pod." },
      ],
      printQuestLink: "O PostgreSQL do CloudShop roda em StatefulSet com PVC de 20 GB e snapshots diários.",
      quiz: [
        { question: "Quem pede armazenamento no Kubernetes?", options: ["PV", "PVC", "StorageClass", "Ingress"], answerIndex: 1, explanation: "O PVC é o pedido; o PV é o disco atendido." },
        { question: "PVC em Pending geralmente significa:", options: ["Pod sem memória", "StorageClass inexistente ou falha ao criar o disco", "DNS quebrado", "Imagem errada"], answerIndex: 1, explanation: "Veja os eventos com kubectl describe pvc." },
        { question: "Para dados de cache temporários, use:", options: ["PVC", "emptyDir", "StatefulSet", "NFS"], answerIndex: 1, explanation: "emptyDir vive só enquanto o Pod vive." },
      ],
    },
    {
      id: "l-8-7",
      moduleId: "mod-8",
      title: "kubectl do dia a dia: os 15 comandos que resolvem 90% dos problemas",
      duration: 30,
      difficulty: "Intermediário",
      tools: ["kubectl"],
      xp: 25,
      objectives: [
        "Investigar Pods com get, describe e logs",
        "Executar comandos dentro de contêineres com exec",
        "Acompanhar rollouts e voltar versões",
        "Usar aliases e flags que economizam tempo",
      ],
      body: [
        "No dia a dia de quem opera Kubernetes, tudo passa pelo `kubectl`. Dominar um pequeno conjunto de comandos resolve a grande maioria dos incidentes. Vamos direto aos que importam.",
        "**Ver o estado:** `kubectl get pods` (adicione `-o wide` para ver o nó e o IP, `-A` para todos os namespaces). `kubectl get all` mostra Pods, Services e Deployments juntos.",
        "**Entender um problema:** `kubectl describe pod <nome>` mostra os **Events** no final — é onde o cluster explica por que algo falhou (imagem não encontrada, probe falhando, disco pendente).",
        "**Ler logs:** `kubectl logs <pod>`; com `-f` acompanha em tempo real; com `--previous` mostra o log do contêiner **que morreu** (essencial em CrashLoopBackOff).",
        "**Entrar no contêiner:** `kubectl exec -it <pod> -- sh` abre um shell dentro — para testar DNS, conectividade e variáveis de ambiente de dentro da aplicação.",
        "**Deployments:** `kubectl rollout status deploy/app` acompanha o deploy; `kubectl rollout history deploy/app` lista revisões; `kubectl rollout undo deploy/app` volta para a anterior.",
        "**Debug rápido:** `kubectl run tmp --rm -it --image=busybox:1.36 -- sh` cria um Pod descartável para testar a rede de dentro do cluster.",
        "Dicas de velocidade: crie o alias `k=kubectl`, use `-n namespace` para não misturar ambientes e `--dry-run=client -o yaml` para gerar manifests sem aplicar nada.",
      ],
      code: [
        {
          label: "Sequência de investigação de um Pod com problema",
          language: "bash",
          code: `kubectl get pods -n producao -o wide
kubectl describe pod api-7d9f -n producao     # leia os Events!
kubectl logs api-7d9f -n producao --previous  # log de quem morreu
kubectl exec -it api-7d9f -n producao -- env | grep DB`,
        },
        {
          label: "Rollout e rollback",
          language: "bash",
          code: `kubectl rollout status deploy/api -n producao
kubectl rollout history deploy/api -n producao
kubectl rollout undo deploy/api -n producao --to-revision=3`,
        },
      ],
      whyItMatters: "Em incidentes, cada minuto conta: quem conhece esses comandos diagnostica em minutos o que outros levam horas.",
      commonMistake: "Olhar só `kubectl get pods` e ignorar o `describe` — os Events quase sempre dizem a causa.",
      productionTip: "Sempre confirme o contexto (`kubectl config current-context`) antes de comandos destrutivos, para não agir no cluster errado.",
      interviewQuestion: "Um Pod está em CrashLoopBackOff. Quais comandos você usa, em ordem?",
      glossary: [
        { term: "describe", definition: "Mostra detalhes e eventos de um recurso." },
        { term: "--previous", definition: "Log do contêiner que terminou antes do atual." },
        { term: "rollout undo", definition: "Volta o Deployment para uma revisão anterior." },
        { term: "context", definition: "Combinação de cluster + usuário que o kubectl usa." },
      ],
      printQuestLink: "A caça ao bug do CloudShop no reino Kubernetes começa com get, describe e logs --previous.",
      quiz: [
        { question: "Onde o cluster explica por que um Pod falhou?", options: ["kubectl get", "Eventos do kubectl describe", "kubectl version", "No Dockerfile"], answerIndex: 1, explanation: "Os Events do describe mostram a causa." },
        { question: "Como ver o log do contêiner que crashou?", options: ["logs -f", "logs --previous", "logs --tail", "logs -A"], answerIndex: 1, explanation: "--previous mostra a instância anterior." },
        { question: "Para voltar um Deployment à revisão anterior:", options: ["kubectl delete", "kubectl rollout undo", "kubectl scale 0", "kubectl apply"], answerIndex: 1, explanation: "rollout undo faz o rollback." },
      ],
    },
    {
      id: "l-8-8",
      moduleId: "mod-8",
      title: "Troubleshooting de Pods: CrashLoopBackOff, ImagePullBackOff e Pending",
      duration: 35,
      difficulty: "Avançado",
      tools: ["Kubernetes", "kubectl"],
      xp: 25,
      objectives: [
        "Diagnosticar CrashLoopBackOff passo a passo",
        "Resolver ImagePullBackOff e erros de imagem",
        "Entender Pods presos em Pending",
        "Interpretar OOMKilled e probes falhando",
      ],
      body: [
        "Todo mundo que opera Kubernetes já viu um Pod vermelho no `get pods`. A boa notícia: os status de erro são **poucos e previsíveis**. Aprenda os quatro principais e você resolve a maioria dos casos.",
        "**CrashLoopBackOff:** o contêiner inicia e morre, repetidamente. Ordem de investigação: `kubectl logs <pod> --previous` mostra por que ele morreu da última vez; `kubectl describe pod` mostra se foi a aplicação (exit code) ou o kubelet (probe, OOM). Causas comuns: variável de ambiente faltando, banco inacessível, comando errado na imagem.",
        "**ImagePullBackOff:** o cluster não consegue baixar a imagem. Quase sempre é: nome/tag errado (typo), registry privado sem **imagePullSecret**, ou limite de requisições do Docker Hub. O `describe` mostra o erro exato.",
        "**Pending:** o Pod nem começou. O `describe` diz o motivo: nenhum nó tem CPU/memória suficiente (aumente o cluster ou reduza requests), PVC não atendido, ou regras de afinidade impossíveis.",
        "**OOMKilled:** o contêiner passou do limite de memória (`resources.limits.memory`) e o kernel o matou. Soluções: aumentar o limite, ou investigar vazamento de memória na aplicação. Veja com `describe` no campo `Last State`.",
        "**Probes falhando:** se a **liveness probe** falha, o Pod reinicia em loop; se a **readiness** falha, ele fica fora do Service. Teste o endpoint da probe de dentro: `kubectl exec -it <pod> -- curl localhost:8080/healthz`.",
        "Monte o hábito: **status → describe (Events) → logs --previous**. Essa sequência, nessa ordem, resolve a enorme maioria dos casos sem adivinhação.",
        "Documente cada incidente novo no seu repositório de notas: status, causa raiz e correção. Em seis meses você terá seu próprio manual de plantão.",
      ],
      code: [
        {
          label: "Diagnóstico dos quatro status clássicos",
          language: "bash",
          code: `kubectl get pods -n app
# CrashLoopBackOff:
kubectl logs api-xxx -n app --previous
# ImagePullBackOff:
kubectl describe pod api-xxx -n app | grep -A5 Events
# Pending:
kubectl describe pod api-xxx -n app | grep -i "insufficient\\|pvc"
# OOMKilled:
kubectl describe pod api-xxx -n app | grep -i -A3 "last state"`,
        },
        {
          label: "Limites de memória no Deployment",
          language: "yaml",
          code: `resources:
  requests:
    memory: "128Mi"   # garantido para o agendador
    cpu: "100m"
  limits:
    memory: "256Mi"   # passou disso = OOMKilled
    cpu: "500m"`,
        },
      ],
      whyItMatters: "Esses quatro status cobrem a maior parte dos incidentes de Kubernetes em qualquer empresa.",
      commonMistake: "Aumentar o limite de memória sem investigar o vazamento — o problema volta maior alguns dias depois.",
      productionTip: "Configure alertas para Pods reiniciando muito (`kube_pod_container_status_restarts_total`) antes que os usuários percebam.",
      interviewQuestion: "Um Pod está em CrashLoopBackOff logo após um deploy. Como você investiga?",
      glossary: [
        { term: "CrashLoopBackOff", definition: "Contêiner morrendo e reiniciando em loop." },
        { term: "ImagePullBackOff", definition: "Falha ao baixar a imagem do registry." },
        { term: "OOMKilled", definition: "Contêiner morto por exceder o limite de memória." },
        { term: "imagePullSecret", definition: "Credencial que permite baixar imagens privadas." },
      ],
      printQuestLink: "O Boss do reino Kubernetes é um Pod em CrashLoopBackOff por causa de uma variável de ambiente ausente.",
      quiz: [
        { question: "Primeiro comando para investigar CrashLoopBackOff:", options: ["kubectl delete pod", "kubectl logs --previous", "kubectl scale", "kubectl apply"], answerIndex: 1, explanation: "O log anterior mostra por que o contêiner morreu." },
        { question: "ImagePullBackOff em registry privado geralmente é falta de:", options: ["CPU", "imagePullSecret", "Ingress", "PVC"], answerIndex: 1, explanation: "Sem credencial, o cluster não baixa a imagem." },
        { question: "OOMKilled significa:", options: ["Disco cheio", "Memória acima do limite", "DNS quebrado", "Imagem grande"], answerIndex: 1, explanation: "O contêiner excedeu resources.limits.memory." },
      ],
    },
  ],
  "mod-9": [
    {
      id: "l-9-6",
      moduleId: "mod-9",
      title: "Argo CD na prática: sync, health e rollback pela interface",
      duration: 30,
      difficulty: "Intermediário",
      tools: ["Argo CD", "Git"],
      xp: 25,
      objectives: [
        "Ler os estados de sync e health de uma Application",
        "Sincronizar manualmente e entender o auto-sync",
        "Fazer rollback para um commit anterior pelo Argo CD",
        "Usar prune e selfHeal com consciência",
      ],
      body: [
        "Você já instalou o Argo CD e criou uma Application. Agora vamos operar o dia a dia: entender o que a tela mostra, sincronizar com segurança e desfazer deploys ruins.",
        "Cada Application tem dois estados independentes. **Sync:** o cluster está igual ao Git? `Synced` (igual) ou `OutOfSync` (diferente). **Health:** os recursos estão saudáveis? `Healthy`, `Progressing` (subindo) ou `Degraded` (com problema).",
        "Com **auto-sync** ligado, qualquer commit na branch observada é aplicado sozinho. Com sync manual, você aperta `Sync` quando quiser — comum em produção, onde alguém precisa aprovar.",
        "A opção **prune** apaga do cluster o que foi removido do Git; **selfHeal** corrige alterações feitas à mão no cluster (kubectl) voltando ao estado do Git. Entenda antes de ligar: prune apaga recursos de verdade.",
        "**Rollback:** na aba `History and Rollback` da Application, cada sync anterior vira um botão de rollback. O Argo reaplica o manifesto daquela revisão — sem precisar reverter commits no Git na hora do incêndio.",
        "Pela linha de comando: `argocd app get api`, `argocd app sync api`, `argocd app rollback api`. Útil quando a interface não abre ou para automatizar.",
        "Quando algo fica `Degraded`, clique no recurso na árvore da Application: o Argo mostra os eventos do Kubernetes e até os logs do Pod, sem sair da tela.",
        "Boas práticas: produção com sync manual ou janelas de sync, auto-sync em staging, e notificações (Slack/e-mail) para syncs falhos.",
      ],
      code: [
        {
          label: "Operando pela CLI",
          language: "bash",
          code: `argocd login argocd.exemplo.com
argocd app list
argocd app get api                    # sync + health + histórico
argocd app sync api                   # aplica o que está no Git
argocd app rollback api               # volta à revisão anterior
argocd app history api                # lista as revisões`,
        },
        {
          label: "Application com auto-sync seguro",
          language: "yaml",
          code: `spec:
  syncPolicy:
    automated:
      prune: true      # remove o que saiu do Git
      selfHeal: true   # desfaz mudanças manuais no cluster
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 3
      backoff:
        duration: 5s
        maxDuration: 3m`,
        },
      ],
      whyItMatters: "Saber operar sync e rollback no Argo CD transforma incidentes de deploy em correções de minutos.",
      commonMistake: "Ligar prune sem entender: recursos criados fora do Git (ou removidos por engano) são apagados do cluster.",
      productionTip: "Mantenha selfHeal ligado em produção para que ‘correções rápidas’ manuais não virem drift silencioso.",
      interviewQuestion: "Qual a diferença entre os estados OutOfSync e Degraded no Argo CD?",
      glossary: [
        { term: "Synced", definition: "Cluster idêntico ao que está no Git." },
        { term: "OutOfSync", definition: "Há diferença entre Git e cluster." },
        { term: "prune", definition: "Apaga do cluster recursos removidos do Git." },
        { term: "selfHeal", definition: "Reverte alterações manuais feitas no cluster." },
      ],
      printQuestLink: "Um deploy ruim no CloudShop é desfeito em 30 segundos pelo rollback do Argo CD.",
      quiz: [
        { question: "OutOfSync significa:", options: ["App quebrada", "Cluster diferente do Git", "Sem internet", "Pod sem memória"], answerIndex: 1, explanation: "Há diferença entre o desejado (Git) e o atual (cluster)." },
        { question: "O que selfHeal faz?", options: ["Cura Pods", "Reverte mudanças manuais no cluster", "Atualiza o Argo", "Cria backups"], answerIndex: 1, explanation: "Ele impõe o estado do Git sobre edições manuais." },
        { question: "Como desfazer um deploy ruim rapidamente?", options: ["Apagar o cluster", "Rollback na aba History do Argo CD", "Reinstalar o Argo", "Editar o Pod"], answerIndex: 1, explanation: "Cada sync anterior vira um ponto de restauração." },
      ],
    },
    {
      id: "l-9-7",
      moduleId: "mod-9",
      title: "Organizando o repositório GitOps: ambientes, overlays e App of Apps",
      duration: 35,
      difficulty: "Avançado",
      tools: ["Kustomize", "Argo CD"],
      xp: 25,
      objectives: [
        "Estruturar um repositório GitOps para vários ambientes",
        "Usar base + overlays do Kustomize sem duplicar YAML",
        "Gerenciar muitas Applications com o padrão App of Apps",
        "Definir quem pode mudar o quê no repositório",
      ],
      body: [
        "GitOps começa simples — uma pasta com YAMLs — e vira caos quando aparecem staging, produção e dez microsserviços. Esta aula mostra a estrutura que escala sem duplicar arquivo.",
        "O padrão mais usado é **base + overlays** do Kustomize: a pasta `base/` tem os manifests comuns (Deployment, Service); cada ambiente em `overlays/staging` e `overlays/producao` só declara **o que muda** — réplicas, imagem, domínio, recursos.",
        "Exemplo de diferença entre ambientes: staging com 1 réplica e imagem `:latest`, produção com 3 réplicas e imagem com tag fixa. Tudo isso em patches pequenos, sem copiar o Deployment inteiro.",
        "O **App of Apps** resolve outra escala: em vez de criar cada Application na mão, você cria uma Application “mãe” que aponta para uma pasta cheia de definições de Applications filhas. Adicionar um app novo = commitar um arquivo.",
        "Estrutura recomendada: `apps/` (uma pasta por aplicação, com base e overlays), `clusters/producao/` (as Applications filhas apontando para os overlays certos) e um `root-app.yaml` apontando para `clusters/producao`.",
        "**Um repositório ou vários?** Comece com um só (monorepo de config). Separe quando precisar de permissões diferentes por time ou de históricos independentes.",
        "Controle de mudanças: toda alteração de produção passa por **Pull Request com revisão**. O Git vira a auditoria completa de quem mudou o quê, quando e por quê.",
        "Dica final: valide os manifests no CI (`kustomize build` + `kubeconform`) antes do merge, para que YAML quebrado nunca chegue ao cluster.",
      ],
      code: [
        {
          label: "Estrutura de pastas",
          language: "text",
          code: `gitops-repo/
├── apps/
│   └── api/
│       ├── base/
│       │   ├── deployment.yaml
│       │   ├── service.yaml
│       │   └── kustomization.yaml
│       └── overlays/
│           ├── staging/      # 1 réplica, imagem :latest
│           └── producao/     # 3 réplicas, tag fixa, mais recursos
└── clusters/
    └── producao/
        ├── root-app.yaml     # App of Apps
        └── api.yaml          # Application apontando p/ overlay`,
        },
        {
          label: "Overlay de produção (só o que muda)",
          language: "yaml",
          code: `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../../base
replicas:
  - name: api
    count: 3
images:
  - name: minha/api
    newTag: 1.4.2`,
        },
      ],
      whyItMatters: "Uma estrutura clara de repositório é o que separa GitOps sustentável de uma pilha de YAML copiado e colado.",
      commonMistake: "Copiar a pasta inteira por ambiente: qualquer correção precisa ser lembrada e repetida em todos.",
      productionTip: "Proteja a branch main com revisão obrigatória — em GitOps, merge em main é deploy.",
      interviewQuestion: "Como você estrutura um repositório GitOps para staging e produção sem duplicar manifests?",
      glossary: [
        { term: "Kustomize", definition: "Ferramenta que monta YAMLs a partir de base + patches." },
        { term: "Overlay", definition: "Conjunto de mudanças de um ambiente sobre a base." },
        { term: "App of Apps", definition: "Application que gerencia outras Applications." },
        { term: "Monorepo", definition: "Um único repositório para toda a configuração." },
      ],
      printQuestLink: "O repositório GitOps do CloudShop usa base + overlays: staging e produção compartilham 90% do YAML.",
      quiz: [
        { question: "Para que serve o overlay do Kustomize?", options: ["Criptografar secrets", "Declarar só o que muda por ambiente", "Buildar imagens", "Criar clusters"], answerIndex: 1, explanation: "A base é comum; o overlay traz as diferenças." },
        { question: "O que é App of Apps?", options: ["Um app móvel", "Uma Application que gerencia outras Applications", "Um plugin do Argo", "Um tipo de Ingress"], answerIndex: 1, explanation: "A mãe aplica as filhas automaticamente." },
        { question: "Em GitOps, um merge na main equivale a:", options: ["Nada", "Um deploy", "Um backup", "Um teste"], answerIndex: 1, explanation: "O Argo aplica o que está na branch observada." },
      ],
    },
    {
      id: "l-9-8",
      moduleId: "mod-9",
      title: "Deploy progressivo com GitOps: canary e sync waves",
      duration: 35,
      difficulty: "Avançado",
      tools: ["Argo Rollouts", "Argo CD"],
      xp: 25,
      objectives: [
        "Entender deploy canary e por que ele reduz risco",
        "Configurar um Rollout canary com análise de métricas",
        "Ordenar aplicação de recursos com sync waves",
        "Combinar GitOps com deploy progressivo",
      ],
      body: [
        "Deploy tradicional: a versão nova substitui a antiga de uma vez. Se vier com bug, **100% dos usuários** sofrem juntos. O **deploy canary** manda a versão nova para uma fatia pequena do tráfego (5%, depois 25%, 50%) e só completa se tudo estiver saudável.",
        "O nome vem dos canários que mineiros levavam para detectar gás: se o canário (a fatia pequena) passa bem, o resto avança. Se dá problema, o rollback atinge poucos usuários.",
        "No Kubernetes isso é feito pelo **Argo Rollouts**, que substitui o Deployment por um `Rollout`: você define os passos (`setWeight: 10`, `pause: {duration: 5m}`...) e ele controla quantas réplicas novas recebem tráfego.",
        "O ponto forte é a **análise automática**: o Rollout consulta métricas (taxa de erro no Prometheus, por exemplo) a cada passo. Se os erros passarem do limite, ele faz rollback sozinho — sem ninguém acordar de madrugada.",
        "As **sync waves** do Argo CD resolvem outra ordem de problema: aplicar recursos na sequência certa. Anote `argocd.argoproj.io/sync-wave: \"-1\"` no que deve vir primeiro (ex.: namespace, migração de banco) e ondas maiores para o que depende deles.",
        "Combinando tudo: o pipeline publica a imagem, atualiza a tag no repositório GitOps, o Argo CD sincroniza (na ordem das waves) e o Rollout libera o tráfego gradualmente com análise de métricas.",
        "Quando usar canary? Em serviços com tráfego real e métricas confiáveis. Para apps internas pequenas, um rolling update com readiness probe já basta.",
        "Cuidado: canary exige que a aplicação tolere **duas versões rodando juntas** (API compatível, migrações de banco para trás-compatíveis).",
      ],
      code: [
        {
          label: "Rollout canary com análise",
          language: "yaml",
          code: `apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: api
spec:
  replicas: 5
  selector:
    matchLabels: { app: api }
  template:
    metadata:
      labels: { app: api }
    spec:
      containers:
        - name: api
          image: minha/api:1.5.0
  strategy:
    canary:
      steps:
        - setWeight: 10        # 10% do tráfego
        - pause: { duration: 5m }
        - setWeight: 50
        - pause: { duration: 10m }
      analysis:                # rollback automático se errar
        templates:
          - templateName: taxa-de-erro`,
        },
        {
          label: "Sync waves: banco antes da app",
          language: "yaml",
          code: `metadata:
  annotations:
    argocd.argoproj.io/sync-wave: "-1"   # migração primeiro
# aplicação sem anotação entra na onda 0, depois`,
        },
      ],
      whyItMatters: "Deploy progressivo é o padrão das empresas que fazem dezenas de deploys por dia sem derrubar o serviço.",
      commonMistake: "Ativar canary sem métricas de análise: vira só um deploy lento, sem proteção automática.",
      productionTip: "Comece com pesos pequenos e pausas longas; encurte conforme a confiança nas métricas aumentar.",
      interviewQuestion: "Como funciona um deploy canary e o que acontece quando a taxa de erro sobe no meio dele?",
      glossary: [
        { term: "Canary", definition: "Liberação gradual da versão nova para parte do tráfego." },
        { term: "Argo Rollouts", definition: "Controlador que faz deploys progressivos no Kubernetes." },
        { term: "Sync wave", definition: "Ordem de aplicação de recursos no Argo CD." },
        { term: "Analysis", definition: "Checagem de métricas que decide avançar ou voltar." },
      ],
      printQuestLink: "O checkout do CloudShop usa canary de 10% com análise de erros antes de liberar para todos.",
      quiz: [
        { question: "Qual a vantagem do canary sobre o deploy direto?", options: ["É mais rápido", "Limita o impacto de bugs a uma fatia pequena", "Usa menos CPU", "Não precisa de testes"], answerIndex: 1, explanation: "Só uma parte dos usuários vê a versão nova primeiro." },
        { question: "O que a análise de métricas faz num Rollout?", options: ["Gera relatórios", "Faz rollback automático se os erros subirem", "Cria dashboards", "Escala o cluster"], answerIndex: 1, explanation: "Ela decide automaticamente entre avançar e voltar." },
        { question: "Para que servem sync waves?", options: ["Acelerar o sync", "Aplicar recursos na ordem certa", "Criptografar secrets", "Balancear tráfego"], answerIndex: 1, explanation: "Ex.: migração de banco antes da aplicação." },
      ],
    },
  ],
};
