import type { Module } from "@/lib/types";

export const CLOUD_IAC_MODULES: Module[] = [
  {
    id: "mod-6",
    index: 6,
    slug: "aws-cloud-e-seguranca",
    title: "AWS, Cloud e Segurança",
    tagline: "Provisionar com responsabilidade técnica e financeira.",
    weeks: 6,
    xp: 3575,
    badge: "cloud-explorer",
    regionId: "imperio-cloud",
    bossId: "boss-security-group",
    overview:
      "AWS domina as vagas em português, e o que se cobra não é decorar serviço: é desenhar rede segura, aplicar menor privilégio, escolher o compute adequado, proteger dados e controlar custo. Neste módulo você constrói a VPC do CloudShop do zero, sobe API e banco em subnets corretas, publica o frontend com CDN e configura orçamento, tags e alarme antes de qualquer surpresa na fatura.",
    objectives: [
      "Aplicar IAM com menor privilégio usando roles em vez de chaves",
      "Desenhar VPC com subnets pública e privada, IGW e NAT",
      "Configurar Security Groups como firewall por instância",
      "Subir EC2, S3, RDS e ALB integrados com segurança",
      "Controlar custo com tags, budgets e desligamento programado",
    ],
    prerequisites: ["Módulos 1, 2 e 4 concluídos"],
    topics: [
      "IAM",
      "VPC",
      "Subnets",
      "Route tables",
      "IGW",
      "NAT",
      "Security Groups",
      "EC2",
      "S3",
      "CloudFront",
      "RDS",
      "ALB",
      "DNS",
      "Tags",
      "Custos",
    ],
    delivery:
      "Deploy seguro do CloudShop na AWS com orçamento configurado e checklist de destruição validado.",
    checklist: [
      "Nenhuma chave de acesso de longa duração em uso",
      "Banco em subnet privada, sem IP público",
      "Security Group do banco aceitando apenas o SG da aplicação",
      "S3 sem acesso público e com criptografia habilitada",
      "Budget ativo e todos os recursos com tags de projeto/ambiente/dono",
    ],
    troubleshooting:
      "Sintoma: a API não conecta ao RDS. Investigação: telnet/nc na porta 5432 dá timeout (não refused), o que aponta filtro de rede. Verificações em ordem: SG do RDS permite a origem correta? A subnet do RDS tem rota adequada? O RDS está no mesmo VPC? Causa raiz frequente: SG liberando um CIDR errado em vez de referenciar o SG da aplicação.",
    interviewQuestions: [
      "Diferença entre Security Group e Network ACL?",
      "Como você daria acesso ao S3 para uma aplicação em EC2 sem usar chaves?",
      "Como controlaria custo em uma conta usada por vários times?",
    ],
    printQuest:
      "Publicar o CloudShop na AWS: frontend no S3 com CloudFront, API em EC2 atrás de ALB e banco em RDS privado.",
    lessons: [
      {
        id: "l-6-1",
        moduleId: "mod-6",
        title: "IAM: identidades, roles e menor privilégio",
        duration: 45,
        difficulty: "Intermediário",
        tools: ["AWS IAM", "AWS CLI"],
        xp: 25,
        objectives: [
          "Distinguir usuário, role e política",
          "Escrever política mínima",
          "Eliminar chaves estáticas",
        ],
        body: [
          "IAM é o serviço mais importante da AWS porque erra caro: uma política permissiva transforma um bug em incidente de segurança. Usuário representa pessoa, role é identidade assumível por serviço ou federação, e política é o documento JSON que autoriza ações sobre recursos, com condições.",
          "Menor privilégio é um processo, não um estado: comece restrito, colete as negações reais e libere apenas o necessário. Ferramentas como Access Analyzer e os logs do CloudTrail mostram quais permissões foram efetivamente usadas — base objetiva para reduzir escopo.",
          "A regra prática mais valiosa: aplicação em EC2, Lambda ou ECS usa role anexada à instância/tarefa, e pipeline usa OIDC. Chave de acesso de longa duração só quando não houver alternativa, com rotação obrigatória e nunca em repositório.",
        ],
        code: [
          {
            label: "Política mínima e role para a API",
            language: "json",
            code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LerEscreverAssetsDoProjeto",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::cloudshop-assets/uploads/*"
    },
    {
      "Sid": "LerSegredoDoBanco",
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "arn:aws:secretsmanager:us-east-1:123456789012:secret:cloudshop/db-*"
    }
  ]
}`,
            securityNote:
              'Nunca use "Action": "*" com "Resource": "*". Se precisar de amplitude, delimite por tag e adicione condição de origem.',
          },
          {
            label: "Auditoria rápida de IAM",
            language: "bash",
            code: `aws sts get-caller-identity
aws iam list-users --query 'Users[].UserName'
aws iam list-access-keys --user-name deploy-antigo
aws iam get-account-summary --query 'SummaryMap.AccountMFAEnabled'
aws iam generate-credential-report >/dev/null && aws iam get-credential-report --query Content --output text | base64 -d | head -5
aws accessanalyzer list-findings --analyzer-arn "$ANALYZER_ARN" 2>/dev/null | head`,
          },
        ],
        whyItMatters:
          "Toda auditoria e todo incidente de nuvem passa por IAM. Explicar menor privilégio com exemplo é diferencial em entrevista.",
        commonMistake:
          "Anexar AdministratorAccess à role da aplicação 'para destravar' e nunca mais revisar.",
        productionTip:
          "Use tags nas roles e políticas baseadas em tag: escala melhor que política por recurso.",
        securityAlert:
          "Chave IAM em repositório público é explorada em minutos por bots. Revogue e audite CloudTrail imediatamente.",
        interviewQuestion:
          "Como você concederia acesso a um bucket específico para uma aplicação sem usar chaves?",
        glossary: [
          {
            term: "role",
            definition:
              "Identidade IAM assumível temporariamente por serviços, usuários ou federação.",
          },
          {
            term: "CloudTrail",
            definition: "Serviço de auditoria que registra chamadas de API na conta.",
          },
        ],
        printQuestLink:
          "Criar a role da API do CloudShop com acesso mínimo ao bucket de uploads e ao segredo do banco.",
        quiz: [
          {
            question: "Qual a forma recomendada de uma aplicação em EC2 acessar o S3?",
            options: [
              "Chave de acesso no .env",
              "Instance profile com role",
              "Usuário raiz",
              "Bucket público",
            ],
            answerIndex: 1,
            explanation: "A role fornece credenciais temporárias rotacionadas automaticamente.",
          },
        ],
      },
      {
        id: "l-6-2",
        moduleId: "mod-6",
        title: "VPC, subnets, rotas, IGW e NAT",
        duration: 50,
        difficulty: "Avançado",
        tools: ["AWS VPC", "Route tables"],
        xp: 25,
        objectives: [
          "Desenhar VPC com camadas",
          "Entender o que torna uma subnet pública",
          "Decidir sobre NAT considerando custo",
        ],
        body: [
          "VPC é a sua rede isolada na nuvem. O desenho padrão de produção tem três camadas: subnets públicas (ALB e NAT), subnets privadas de aplicação e subnets privadas de dados. Distribua em pelo menos duas zonas de disponibilidade — requisito de RDS multi-AZ e de tolerância a falha.",
          "O que torna uma subnet 'pública' não é o nome: é a tabela de rotas apontar 0.0.0.0/0 para um Internet Gateway. Subnet privada usa NAT Gateway para sair (atualizar pacotes, chamar APIs) sem aceitar conexões de entrada. Confundir isso é a origem clássica de banco exposto na internet.",
          "Atenção ao custo: NAT Gateway tem cobrança por hora e por dado processado, sendo um dos maiores vilões de fatura em ambiente de estudo. Alternativas: VPC endpoints para S3/ECR, instância NAT pequena em laboratório, ou simplesmente destruir o ambiente ao final do dia.",
        ],
        code: [
          {
            label: "Criar a VPC do CloudShop por CLI",
            language: "bash",
            code: `VPC_ID=$(aws ec2 create-vpc --cidr-block 10.20.0.0/16 \\
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=cloudshop},{Key=env,Value=dev}]' \\
  --query Vpc.VpcId --output text)

PUB=$(aws ec2 create-subnet --vpc-id "$VPC_ID" --cidr-block 10.20.1.0/24 \\
  --availability-zone us-east-1a --query Subnet.SubnetId --output text)
PRIV=$(aws ec2 create-subnet --vpc-id "$VPC_ID" --cidr-block 10.20.11.0/24 \\
  --availability-zone us-east-1a --query Subnet.SubnetId --output text)

IGW=$(aws ec2 create-internet-gateway --query InternetGateway.InternetGatewayId --output text)
aws ec2 attach-internet-gateway --vpc-id "$VPC_ID" --internet-gateway-id "$IGW"

RT=$(aws ec2 create-route-table --vpc-id "$VPC_ID" --query RouteTable.RouteTableId --output text)
aws ec2 create-route --route-table-id "$RT" --destination-cidr-block 0.0.0.0/0 --gateway-id "$IGW"
aws ec2 associate-route-table --route-table-id "$RT" --subnet-id "$PUB"

aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC_ID" \\
  --query 'RouteTables[].{RT:RouteTableId,Rotas:Routes[].DestinationCidrBlock}'`,
            securityNote:
              "Nunca associe a subnet do banco a uma route table com rota para IGW: isso o torna alcançável da internet.",
          },
        ],
        whyItMatters:
          "Sem entender rota e subnet você não depura 'a aplicação não alcança o banco' nem desenha ambiente auditável.",
        commonMistake: "Colocar RDS em subnet pública para 'facilitar o acesso' e expor o banco.",
        productionTip:
          "Reserve faixas por ambiente (dev 10.20/16, staging 10.30/16, prod 10.40/16) para permitir peering futuro sem conflito.",
        securityAlert:
          "Fluxo de saída irrestrito também é risco: exfiltração de dados sai por 443. Considere VPC endpoints.",
        interviewQuestion: "O que exatamente diferencia uma subnet pública de uma privada?",
        glossary: [
          {
            term: "IGW",
            definition:
              "Internet Gateway: componente que permite tráfego entre a VPC e a internet.",
          },
          {
            term: "NAT Gateway",
            definition: "Serviço que permite saída à internet de subnets privadas, sem entrada.",
          },
        ],
        printQuestLink:
          "Construir a VPC 10.20.0.0/16 do CloudShop com camadas pública, aplicação e dados.",
        quiz: [
          {
            question: "O que torna uma subnet pública?",
            options: [
              "Ter IP público nas instâncias",
              "Rota 0.0.0.0/0 apontando para o Internet Gateway",
              "Estar em duas zonas de disponibilidade",
              "Ter Security Group aberto",
            ],
            answerIndex: 1,
            explanation: "A tabela de rotas com destino ao IGW define a subnet como pública.",
          },
        ],
      },
      {
        id: "l-6-3",
        moduleId: "mod-6",
        title: "Security Groups, NACLs e exposição mínima",
        duration: 40,
        difficulty: "Intermediário",
        tools: ["AWS EC2", "Security Groups"],
        xp: 25,
        objectives: [
          "Configurar SG com referência entre grupos",
          "Distinguir SG de NACL",
          "Auditar exposição da conta",
        ],
        body: [
          "Security Group é firewall com estado, aplicado à interface de rede: você declara o que entra, e a resposta sai automaticamente. NACL é sem estado, aplicada à subnet, e exige regras de ida e volta — usada como camada adicional grosseira, não como controle principal.",
          "A técnica que separa amador de profissional é referenciar SG em vez de CIDR: o SG do banco permite 5432 apenas com origem no SG da aplicação. Assim, quando novas instâncias entram, a permissão acompanha automaticamente e nenhum IP precisa ser mantido à mão.",
          "Auditar exposição deveria ser rotina semanal: procurar regras com 0.0.0.0/0 em portas administrativas ou de banco. Encontrar 22 ou 5432 abertos ao mundo é o achado mais comum — e o mais explorado.",
        ],
        code: [
          {
            label: "SG referenciando SG e auditoria de exposição",
            language: "bash",
            code: `SG_APP=$(aws ec2 create-security-group --group-name cloudshop-app \\
  --description "API CloudShop" --vpc-id "$VPC_ID" --query GroupId --output text)
SG_DB=$(aws ec2 create-security-group --group-name cloudshop-db \\
  --description "RDS CloudShop" --vpc-id "$VPC_ID" --query GroupId --output text)

# somente o ALB acessa a aplicacao na 3000
aws ec2 authorize-security-group-ingress --group-id "$SG_APP" \\
  --protocol tcp --port 3000 --source-group "$SG_ALB"

# somente a aplicacao acessa o banco
aws ec2 authorize-security-group-ingress --group-id "$SG_DB" \\
  --protocol tcp --port 5432 --source-group "$SG_APP"

# auditoria: regras abertas ao mundo
aws ec2 describe-security-groups \\
  --query 'SecurityGroups[?IpPermissions[?IpRanges[?CidrIp==\`0.0.0.0/0\`]]].{ID:GroupId,Nome:GroupName}'`,
            securityNote:
              "SSH aberto ao mundo (22 em 0.0.0.0/0) sofre ataque contínuo. Use SSM Session Manager ou bastion com IP restrito.",
          },
        ],
        whyItMatters:
          "Este é literalmente o boss do módulo e um dos achados mais comuns em auditoria real.",
        commonMistake: "Liberar 0.0.0.0/0 'temporariamente' para testar e esquecer de fechar.",
        productionTip:
          "Prefira SSM Session Manager a SSH: acesso auditado, sem porta aberta e sem chave para vazar.",
        securityAlert:
          "Banco acessível pela internet com senha fraca é comprometido em horas por varredura automatizada.",
        interviewQuestion: "Diferencie Security Group e NACL e explique quando usar cada um.",
        glossary: [
          {
            term: "stateful",
            definition: "Firewall que rastreia conexões e libera a resposta automaticamente.",
          },
          {
            term: "referência de SG",
            definition: "Regra cuja origem é outro Security Group, e não um bloco de IPs.",
          },
        ],
        printQuestLink: "Fechar o acesso ao banco do CloudShop apenas ao SG da API.",
        quiz: [
          {
            question: "Qual origem é correta na regra 5432 do SG do banco?",
            options: [
              "0.0.0.0/0",
              "O SG da aplicação",
              "O IP público do ALB",
              "A faixa da internet do escritório",
            ],
            answerIndex: 1,
            explanation:
              "Referenciar o SG da aplicação mantém a regra correta conforme as instâncias mudam.",
          },
        ],
      },
      {
        id: "l-6-4",
        moduleId: "mod-6",
        title: "EC2, S3, RDS, ALB e CloudFront na prática",
        duration: 55,
        difficulty: "Avançado",
        tools: ["EC2", "S3", "RDS", "ALB", "CloudFront"],
        xp: 25,
        objectives: [
          "Escolher o compute adequado",
          "Publicar frontend estático com CDN",
          "Subir banco gerenciado com backup",
        ],
        body: [
          "Compute: EC2 dá controle total e é ótimo para aprender; ECS Fargate elimina gestão de servidor; Lambda serve carga por evento. Para o CloudShop, EC2 primeiro (para praticar Linux e Ansible) e depois Kubernetes, refletindo a trajetória real de muitas empresas.",
          "Frontend estático não deve ficar em servidor: publique no S3 com bucket privado e sirva via CloudFront usando Origin Access Control, com HTTPS e cache adequado. Isso reduz custo, melhora latência e elimina uma superfície de ataque.",
          "Banco em produção é serviço gerenciado: RDS com backup automatizado, retenção definida, criptografia em repouso, senha em Secrets Manager e — quando o SLA exigir — multi-AZ. Restaurar backup precisa ser testado, senão você tem apenas a esperança de ter backup.",
        ],
        code: [
          {
            label: "Provisionamento essencial",
            language: "bash",
            code: `# EC2 com role, sem chave de acesso e sem IP publico
aws ec2 run-instances --image-id ami-0abcdef1234567890 --instance-type t3.micro \\
  --subnet-id "$PRIV" --security-group-ids "$SG_APP" \\
  --iam-instance-profile Name=cloudshop-api \\
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=cloudshop-api},{Key=env,Value=dev},{Key=owner,Value=equipe-plataforma}]'

# S3 privado e criptografado para o frontend
aws s3api create-bucket --bucket cloudshop-web-dev --region us-east-1
aws s3api put-public-access-block --bucket cloudshop-web-dev \\
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws s3api put-bucket-encryption --bucket cloudshop-web-dev \\
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
aws s3 sync ./dist s3://cloudshop-web-dev --delete

# RDS privado com backup de 7 dias
aws rds create-db-instance --db-instance-identifier cloudshop-dev \\
  --db-instance-class db.t4g.micro --engine postgres --allocated-storage 20 \\
  --master-username cloudshop --manage-master-user-password \\
  --vpc-security-group-ids "$SG_DB" --db-subnet-group-name cloudshop-private \\
  --backup-retention-period 7 --storage-encrypted --no-publicly-accessible`,
            securityNote:
              "--manage-master-user-password guarda a senha no Secrets Manager e evita senha em histórico de shell ou script.",
          },
        ],
        whyItMatters:
          "Este é o conjunto que aparece em quase toda vaga júnior/pleno de nuvem em português.",
        commonMistake:
          "Deixar o bucket público 'para o site funcionar' em vez de usar CloudFront com OAC.",
        productionTip:
          "Teste a restauração do backup do RDS em outro identificador antes de considerar o ambiente pronto.",
        securityAlert:
          "Snapshot de RDS compartilhado publicamente já causou vazamentos famosos. Verifique sempre a visibilidade.",
        interviewQuestion: "Quando escolher EC2, ECS Fargate ou Lambda?",
        glossary: [
          {
            term: "OAC",
            definition: "Origin Access Control: permite ao CloudFront ler um bucket privado.",
          },
          {
            term: "multi-AZ",
            definition: "Replicação do banco em outra zona de disponibilidade para failover.",
          },
        ],
        printQuestLink:
          "Subir a infraestrutura de dev do CloudShop com frontend em CDN e banco privado.",
        quiz: [
          {
            question: "Como servir um site estático do S3 com segurança?",
            options: [
              "Tornar o bucket público",
              "CloudFront com Origin Access Control e bucket privado",
              "EC2 com Nginx lendo o bucket",
              "Compartilhar as chaves IAM no frontend",
            ],
            answerIndex: 1,
            explanation: "OAC dá acesso apenas ao CloudFront, mantendo o bucket fechado.",
          },
        ],
      },
      {
        id: "l-6-5",
        moduleId: "mod-6",
        title: "Custos, tags e a disciplina de destruir o ambiente",
        duration: 40,
        difficulty: "Intermediário",
        tools: ["Cost Explorer", "Budgets", "Tags"],
        xp: 25,
        objectives: [
          "Identificar os maiores geradores de custo",
          "Aplicar tags e budgets",
          "Executar checklist de destruição",
        ],
        body: [
          "Custo na nuvem é responsabilidade de engenharia. Os campeões de fatura inesperada são NAT Gateway, IPs elásticos ociosos, volumes EBS órfãos, snapshots antigos, balanceadores esquecidos e tráfego de saída. Conhecer essa lista já evita a maior parte dos sustos.",
          "Sem tags não existe análise: projeto, ambiente, dono e validade permitem atribuir gasto e caçar recurso órfão. Depois vêm budgets com alerta por percentual e anomaly detection para variações súbitas.",
          "Adote a disciplina de destruição: todo laboratório termina com destroy e uma verificação ativa de recursos remanescentes. Em Terraform isso é um comando; sem IaC, é um checklist manual — mais um argumento a favor de descrever tudo em código.",
        ],
        code: [
          {
            label: "Custo, órfãos e destruição",
            language: "bash",
            code: `aws ce get-cost-and-usage --time-period Start=2026-09-01,End=2026-09-30 \\
  --granularity MONTHLY --metrics UnblendedCost \\
  --group-by Type=DIMENSION,Key=SERVICE --query 'ResultsByTime[0].Groups[].{S:Keys[0],V:Metrics.UnblendedCost.Amount}'

# recursos orfaos
aws ec2 describe-addresses --query 'Addresses[?AssociationId==null].PublicIp'
aws ec2 describe-volumes --filters Name=status,Values=available --query 'Volumes[].{ID:VolumeId,GB:Size}'
aws ec2 describe-nat-gateways --filter Name=state,Values=available --query 'NatGateways[].NatGatewayId'
aws elbv2 describe-load-balancers --query 'LoadBalancers[].LoadBalancerName'

# checklist de destruicao do laboratorio
aws rds delete-db-instance --db-instance-identifier cloudshop-dev --skip-final-snapshot
aws ec2 terminate-instances --instance-ids "$INSTANCE_ID"
aws s3 rm s3://cloudshop-web-dev --recursive && aws s3api delete-bucket --bucket cloudshop-web-dev`,
            securityNote:
              "--skip-final-snapshot apaga o banco sem cópia. Use apenas em ambiente descartável e nunca em produção.",
          },
        ],
        whyItMatters:
          "Vagas atuais citam FinOps explicitamente. Saber falar de custo com números diferencia candidatos.",
        commonMistake: "Deixar NAT Gateway ligado a mês inteiro para um laboratório de duas horas.",
        productionTip:
          "Automatize desligamento noturno de ambientes de desenvolvimento; economia de 60% é comum.",
        securityAlert:
          "Pico inexplicado de custo pode ser sinal de conta comprometida usada para mineração. Investigue como incidente.",
        interviewQuestion:
          "Quais recursos você verificaria primeiro se a fatura dobrasse sem novo deploy?",
        glossary: [
          {
            term: "FinOps",
            definition: "Prática de gestão financeira da nuvem, unindo engenharia e finanças.",
          },
          {
            term: "recurso órfão",
            definition: "Recurso que continua cobrando sem estar associado a nada em uso.",
          },
        ],
        printQuestLink:
          "Documentar o custo mensal estimado do CloudShop e o procedimento de destruição.",
        quiz: [
          {
            question: "Qual recurso frequentemente gera custo inesperado em laboratórios?",
            options: ["Security Group", "NAT Gateway", "IAM Role", "Tag de recurso"],
            answerIndex: 1,
            explanation: "NAT Gateway cobra por hora e por dado processado, mesmo com pouco uso.",
          },
        ],
      },
      {
        id: "l-6-6",
        moduleId: "mod-6",
        title: "IAM na prática: diagnosticar acesso sem ampliar privilégios",
        duration: 55,
        difficulty: "Intermediário",
        tools: ["AWS CLI", "IAM Policy Simulator", "CloudTrail"],
        xp: 25,
        objectives: [
          "Identificar a identidade efetiva de uma chamada",
          "Separar confiança de role e autorização de recursos",
          "Investigar AccessDenied com evidências",
          "Validar permissões positivas e negativas",
          "Entender limites de políticas e criptografia",
        ],
        body: [
          "Uma role já foi criada para a API, mas o upload falha com `AccessDenied`. Nesta aula, o foco é **diagnosticar autorização**, não criar outra identidade. Comece anotando ação, recurso, horário e identidade envolvida; sem isso, qualquer alteração de política vira tentativa e erro.",
          "A primeira pergunta é **quem está chamando a AWS**. Execute `aws sts get-caller-identity` no mesmo contexto da aplicação ou do pipeline. O perfil do seu notebook pode funcionar enquanto a role da aplicação falha; testar com outra identidade não comprova a correção.",
          "A **política de confiança** define quem pode assumir uma role, enquanto a política de permissões define o que ela pode fazer depois. Se `sts:AssumeRole` falha, investigue a confiança e as permissões do chamador antes de alterar acesso ao S3.",
          "Uma autorização considera mais que a política anexada à role. **SCPs**, permissions boundaries, políticas de sessão e políticas de recurso também participam da avaliação; um `Deny` explícito aplicável prevalece sobre um Allow. Adicionar outra política permissiva não remove essa negação.",
          "No S3, diferencie **bucket de objeto**: `s3:ListBucket` usa o ARN do bucket e pode ser limitado por prefixo; `s3:GetObject` usa o ARN com caminho do objeto. Uma aplicação que lê uma chave conhecida pode não precisar listar todo o bucket.",
          "Use o **simulador como diagnóstico**, não como prova definitiva. `simulate-principal-policy` ajuda a comparar ações e recursos, mas não reproduz todos os cenários de políticas de recurso, sessão e organização. Confirme com uma chamada real controlada e examine a mensagem de erro.",
          "Criptografia pode acrescentar outra camada: ler objeto protegido por **SSE-KMS** pode exigir `kms:Decrypt`, além da autorização no S3. Verifique a key policy e a região da chave, sem substituir criptografia por acesso público para destravar o teste.",
          "Feche a mudança com **testes negativos**: o arquivo permitido deve ser lido e outro prefixo deve continuar negado. Registre evidências no PR e consulte CloudTrail quando houver eventos disponíveis; para operações de objetos S3, os `data events` precisam ser habilitados e podem gerar custo.",
        ],
        code: [
          {
            label: "Confirmar identidade e simular leitura de objeto",
            language: "bash",
            code: "# Execute com o perfil autorizado a diagnosticar IAM; troque conta e bucket.\naws sts get-caller-identity\naws iam simulate-principal-policy \\\n  --policy-source-arn arn:aws:iam::123456789012:role/cloudshop-api \\\n  --action-names s3:GetObject \\\n  --resource-arns arn:aws:s3:::cloudshop-assets/uploads/teste.txt \\\n  --query 'EvaluationResults[].{Acao:EvalActionName,Decisao:EvalDecision}'\n# A simulação exige permissão IAM própria; não a conceda à aplicação.",
          },
          {
            label: "Validar acesso permitido e acesso proibido",
            language: "bash",
            code: "# Execute no contexto da role da API, com objetos de teste existentes.\naws s3api get-object --bucket cloudshop-assets \\\n  --key uploads/teste.txt /tmp/cloudshop-permitido.txt\n# Este comando deve retornar AccessDenied, não o conteúdo financeiro.\naws s3api get-object --bucket cloudshop-assets \\\n  --key financeiro/teste.txt /tmp/cloudshop-proibido.txt\n# Se o segundo funcionar, revise as políticas antes de publicar.",
          },
        ],
        whyItMatters:
          "Diagnosticar a causa de uma negação evita transformar um problema operacional em exposição permanente.",
        commonMistake:
          "Adicionar AdministratorAccess sem identificar a ação e o recurso que falharam.",
        productionTip:
          "Mantenha uma matriz de ações permitidas e negadas por role e repita os testes após mudanças.",
        securityAlert:
          "Não copie tokens temporários ou objetos sensíveis para tickets e logs; use dados sintéticos nos testes.",
        interviewQuestion:
          "Uma role tem Allow para GetObject, mas a chamada falha: quais camadas você investigaria?",
        glossary: [
          {
            term: "política de confiança",
            definition: "Documento que define quais identidades podem assumir uma role.",
          },
          {
            term: "permissions boundary",
            definition: "Limite das permissões que políticas de identidade podem conceder.",
          },
          {
            term: "SCP",
            definition: "Política de organização que limita permissões nas contas abrangidas.",
          },
          {
            term: "negação explícita",
            definition: "Regra Deny aplicável que prevalece sobre permissões Allow.",
          },
          {
            term: "SSE-KMS",
            definition: "Criptografia no S3 integrada ao serviço de gerenciamento de chaves KMS.",
          },
        ],
        printQuestLink:
          "Adicionar ao CloudShop evidências de leitura autorizada em uploads/ e negação em financeiro/, usando a role da API.",
        quiz: [
          {
            question: "Qual verificação confirma a identidade efetiva da CLI?",
            options: [
              "aws s3 ls",
              "aws sts get-caller-identity",
              "terraform validate",
              "aws configure list-profiles",
            ],
            answerIndex: 1,
            explanation: "STS informa a conta e o ARN da identidade usada pela chamada.",
          },
          {
            question: "Um Deny explícito aplicável pode ser superado por outro Allow?",
            options: [
              "Sim, com uma policy mais nova",
              "Sim, anexando duas policies",
              "Não; a negação precisa ser resolvida",
              "Sim, mudando o nome da role",
            ],
            answerIndex: 2,
            explanation: "Deny explícito prevalece na avaliação de autorização.",
          },
          {
            question: "Por que testar um prefixo proibido?",
            options: [
              "Para conceder acesso global",
              "Para desativar logs",
              "Para validar apenas latência",
              "Para comprovar que o escopo continua restrito",
            ],
            answerIndex: 3,
            explanation:
              "Teste negativo verifica que a correção não ampliou permissões indevidamente.",
          },
        ],
      },
      {
        id: "l-6-7",
        moduleId: "mod-6",
        title: "Redes na prática: rastrear o caminho de uma conexão",
        duration: 55,
        difficulty: "Intermediário",
        tools: ["AWS VPC", "VPC Flow Logs", "AWS CLI"],
        xp: 25,
        objectives: [
          "Descrever o fluxo ALB, aplicação e banco",
          "Distinguir falha de DNS, rota e filtragem",
          "Inspecionar associações de tabelas de rotas",
          "Usar Flow Logs sem concluir além da evidência",
          "Planejar saída privada e endpoints",
        ],
        body: [
          "Agora que VPC e Security Groups já existem, vamos **investigar o caminho do pacote**. No CloudShop, o navegador chega ao ALB, o ALB abre outra conexão com a API e a API inicia uma conexão com o banco em `5432`. Cada trecho tem origem e destino próprios.",
          "Comece por **resolução de nome**. Se `getent hosts` não resolve o endpoint do banco dentro da aplicação, revisar o SG não é o primeiro passo. Confira DNS da VPC, nome configurado e resolvedores; nunca fixe o IP do RDS, que pode mudar após failover.",
          "Depois investigue **rota e associação**. Uma subnet usa a tabela associada explicitamente ou, na ausência dela, a tabela principal da VPC. Consulte `describe-route-tables` e confirme qual é efetiva, em vez de confiar no nome da subnet ou na etiqueta private.",
          "A rota **local da VPC** permite o caminho entre suas subnets, mas não autoriza portas por si só. Para a API acessar o banco, o SG do RDS deve permitir origem no SG da API e a saída da API precisa permitir o destino. Referências de SG não criam rotas nem transferem todas as regras do grupo de origem.",
          "Um **Security Group é stateful**: respostas a conexões autorizadas são reconhecidas. Uma NACL é stateless e precisa permitir também o retorno, incluindo portas efêmeras adequadas. Se `nc -vz` expira mesmo com os SGs corretos, investigue NACL e caminho de retorno.",
          "**Timeout não identifica sozinho a causa**: pode indicar descarte, rota ausente ou destino indisponível. Já uma recusa imediata costuma apontar ausência de listener ou rejeição ativa. Compare o resultado de `nc` com saúde do serviço e logs, sem tratar a mensagem como diagnóstico definitivo.",
          "**VPC Flow Logs** registram metadados como interfaces, endereços, portas e ACCEPT/REJECT; não registram o corpo da requisição. Um `ACCEPT` não comprova autenticação no PostgreSQL e um REJECT exige correlacionar regras e direção para localizar o bloqueio.",
          "Por fim, separe **tráfego interno de saída externa**. A API não precisa de NAT para falar com um RDS na mesma VPC; para S3, um gateway endpoint pode evitar NAT nesse caminho. Avalie políticas do endpoint, DNS e custo; endpoints de interface têm cobrança e SGs próprios.",
        ],
        code: [
          {
            label: "Checar DNS e porta no host da aplicação",
            language: "bash",
            code: '# Defina o endpoint real do RDS; execute de dentro da rede da API.\nexport DB_HOST="cloudshop-dev.exemplo.us-east-1.rds.amazonaws.com"\ngetent hosts "$DB_HOST"\n# Testa TCP, não senha nem permissões do PostgreSQL.\nnc -vz -w 5 "$DB_HOST" 5432\n# A ausência de resposta ICMP não prova falha de TCP.',
          },
          {
            label: "Inspecionar rota explícita e tabela principal",
            language: "bash",
            code: '# Informe a VPC e a subnet da API antes da execução.\n: "${VPC_ID:?Defina VPC_ID}" "${SUBNET_ID:?Defina SUBNET_ID}"\naws ec2 describe-route-tables \\\n  --filters "Name=association.subnet-id,Values=$SUBNET_ID" \\\n  --query \'RouteTables[].{ID:RouteTableId,Rotas:Routes}\'\n# Sem associação explícita, a tabela efetiva é a principal da VPC.\naws ec2 describe-route-tables \\\n  --filters "Name=vpc-id,Values=$VPC_ID" "Name=association.main,Values=true" \\\n  --query \'RouteTables[].{ID:RouteTableId,Rotas:Routes}\' ',
          },
        ],
        whyItMatters:
          "Um roteiro por camadas reduz indisponibilidade e evita abrir portas aleatoriamente durante incidentes.",
        commonMistake:
          "Adicionar NAT para corrigir uma conexão interna com o RDS sem verificar DNS e SG.",
        productionTip:
          "Documente origem, destino, porta e evidência de cada salto; habilite Flow Logs com retenção e acesso definidos.",
        securityAlert:
          "Não abra 5432 para 0.0.0.0/0 como teste; use a origem restrita da API e registre a alteração.",
        interviewQuestion:
          "O DNS resolve, mas a conexão API–RDS expira: como você organiza a investigação?",
        glossary: [
          {
            term: "porta efêmera",
            definition: "Porta temporária usada pelo cliente e necessária no caminho de retorno.",
          },
          {
            term: "Flow Logs",
            definition: "Registros de metadados do tráfego em interfaces da VPC.",
          },
          {
            term: "tabela principal",
            definition: "Tabela usada por subnets sem associação explícita a outra tabela.",
          },
          {
            term: "gateway endpoint",
            definition: "Destino de rota privado para serviços compatíveis, como S3 e DynamoDB.",
          },
          {
            term: "listener",
            definition: "Processo ou configuração que aceita conexões em uma porta.",
          },
        ],
        printQuestLink:
          "Produzir o mapa de conectividade ALB–API–RDS do CloudShop e anexar testes de DNS, TCP e rotas.",
        quiz: [
          {
            question: "A API precisa de NAT para acessar RDS privado na mesma VPC?",
            options: [
              "Sempre",
              "Somente na porta 5432",
              "Não; o caminho interno usa as rotas da VPC",
              "Sim, se o banco usa TLS",
            ],
            answerIndex: 2,
            explanation: "NAT não é necessário para o caminho privado interno da VPC.",
          },
          {
            question: "Flow Logs com ACCEPT garantem login no banco?",
            options: [
              "Não; registram tráfego, não sucesso da autenticação",
              "Sim, inclusive a senha",
              "Sim, se a porta for 5432",
              "Apenas com NAT",
            ],
            answerIndex: 0,
            explanation: "Aceitação de tráfego não comprova a camada de aplicação.",
          },
          {
            question: "Sem associação explícita, qual tabela uma subnet usa?",
            options: ["A do ALB", "A principal da VPC", "A do Security Group", "Nenhuma"],
            answerIndex: 1,
            explanation: "A tabela principal atende subnets sem associação explícita.",
          },
        ],
      },
      {
        id: "l-6-8",
        moduleId: "mod-6",
        title: "FinOps na prática: custo por pedido e decisões com evidências",
        duration: 55,
        difficulty: "Intermediário",
        tools: ["Cost Explorer", "AWS Budgets", "Planilha de custos"],
        xp: 25,
        objectives: [
          "Calcular custo unitário por pedido",
          "Distinguir custo fixo, variável e compartilhado",
          "Consultar custos por tag ativada",
          "Priorizar economia sem comprometer serviço",
          "Definir ciclo de revisão com responsáveis",
        ],
        body: [
          "Budgets e limpeza já protegem o laboratório; agora o objetivo é **relacionar custo ao valor entregue**. No CloudShop, uma métrica útil é `custo mensal / pedidos concluídos`. Ela ajuda a distinguir crescimento saudável de desperdício sem tratar toda alta de fatura como erro.",
          "Defina primeiro o **perímetro da conta**: quais serviços, ambientes, impostos e créditos entram na análise? Compare períodos equivalentes usando a mesma métrica, como `UnblendedCost`. Misturar valores líquidos de um mês com brutos de outro gera conclusões enganosas.",
          "Separe **custo fixo de variável**. Um ALB ou NAT ligado pode cobrar com pouco uso; armazenamento e transferência acompanham volume de formas diferentes. Reduzir tamanho de EC2 não resolve um gasto dominado por `DataTransfer`, então agrupe por serviço antes de escolher uma ação.",
          "As **tags de alocação de custo** precisam ser ativadas no faturamento para aparecerem como dimensões de análise. Ter `project=cloudshop` no recurso não garante disponibilidade imediata no Cost Explorer; há atraso de processamento e nem todo item de cobrança aceita atribuição direta por tag.",
          "Despesas compartilhadas exigem uma **regra explícita de rateio**. Você pode distribuir observabilidade por volume de logs ou rede por consumo medido. Documente a aproximação e mantenha a parcela não alocada visível, em vez de fingir que uma divisão arbitrária é precisão contábil.",
          "Calcule a **economia com hipótese verificável**. Se o ambiente de dev fica ocioso à noite, estime horas evitadas, confirme quais serviços podem ser desligados e meça depois. Parar EC2 não elimina cobrança de volumes EBS; `stop` não significa custo zero.",
          "**Compromissos de uso** exigem estabilidade. Antes de Savings Plans ou reservas, faça rightsizing e observe a base de consumo; compromisso pode continuar sendo cobrado mesmo se a aplicação diminuir. Compare economia esperada com prazo e risco, não só com o desconto anunciado.",
          "Feche um ciclo **informar, decidir e medir**: responsável, ação, prazo e indicador antes/depois. Alertas de `AWS Budgets` não são um teto automático nem chegam necessariamente em tempo real. Preserve backups, criptografia e SLOs; economia que causa incidente pode custar mais que a infraestrutura.",
        ],
        code: [
          {
            label: "Consultar custo do projeto em um período fechado",
            language: "bash",
            code: '# Ajuste as datas; End é exclusivo. A tag project deve estar ativada para custos.\naws ce get-cost-and-usage \\\n  --time-period Start=2026-08-01,End=2026-09-01 \\\n  --granularity MONTHLY --metrics UnblendedCost \\\n  --filter \'{"Tags":{"Key":"project","Values":["cloudshop"]}}\' \\\n  --group-by Type=DIMENSION,Key=SERVICE\n# Confira a moeda e itens sem alocação antes de consolidar o relatório.',
          },
          {
            label: "Calcular custo por pedido e meta de economia",
            language: "python",
            code: '# Dados fictícios: substitua por custo e pedidos do mesmo período/perímetro.\ncusto_mensal = 420.0\npedidos_concluidos = 12000\ncusto_dev_ocioso = 60.0\nif pedidos_concluidos <= 0:\n    raise ValueError("Não há pedidos suficientes para calcular custo unitário")\nprint(f"Custo por pedido: USD {custo_mensal / pedidos_concluidos:.4f}")\n# Estimativa, não garantia: valide cobranças residuais após executar a ação.\nprint(f"Custo projetado após economia: USD {custo_mensal - custo_dev_ocioso:.2f}")',
          },
        ],
        whyItMatters:
          "Custo unitário permite discutir eficiência com produto e finanças sem penalizar crescimento de receita.",
        commonMistake:
          "Comprar compromisso de longo prazo antes de eliminar ociosidade e medir a carga real.",
        productionTip:
          "Revise semanalmente as maiores variações com um responsável técnico e verifique a economia realizada no mês seguinte.",
        securityAlert:
          "Não reduza retenção de auditoria ou proteção de backups sem avaliação de risco e exigências de conformidade.",
        interviewQuestion:
          "A fatura cresceu 20%, mas os pedidos dobraram: como você avaliaria a eficiência?",
        glossary: [
          {
            term: "custo unitário",
            definition: "Custo atribuído a uma unidade de resultado, como pedido concluído.",
          },
          {
            term: "rateio",
            definition:
              "Distribuição documentada de custos compartilhados entre produtos ou equipes.",
          },
          {
            term: "rightsizing",
            definition: "Ajuste de capacidade ao consumo medido e aos requisitos de serviço.",
          },
          {
            term: "UnblendedCost",
            definition: "Métrica de custo que usa as tarifas não combinadas dos itens de cobrança.",
          },
          {
            term: "Savings Plans",
            definition: "Compromissos de gasto por período em troca de descontos em uso elegível.",
          },
        ],
        printQuestLink:
          "Acrescentar ao orçamento do CloudShop custo por pedido, regra de rateio e uma ação de economia com validação posterior.",
        quiz: [
          {
            question: "Custo sobe 20% e pedidos dobram; o custo por pedido tende a:",
            options: [
              "Dobrar",
              "Ficar igual",
              "Cair, mantendo o mesmo perímetro",
              "Ser impossível de calcular sempre",
            ],
            answerIndex: 2,
            explanation: "1,2 dividido por 2 resulta em 0,6 do custo unitário anterior.",
          },
          {
            question: "Uma tag no recurso aparece imediatamente como filtro de custo?",
            options: [
              "Sim, sempre",
              "Não; depende de ativação e processamento",
              "Somente se for Name",
              "Sim, com AdministratorAccess",
            ],
            answerIndex: 1,
            explanation:
              "Tags para alocação precisam ser ativadas e os dados podem demorar a aparecer.",
          },
          {
            question: "Um alerta de Budget bloqueia automaticamente toda cobrança?",
            options: [
              "Sim, no limite exato",
              "Sim, em todas as regiões",
              "Sim, inclusive impostos",
              "Não; alerta não é um teto automático",
            ],
            answerIndex: 3,
            explanation:
              "Budget monitora e notifica; ações específicas são separadas e não garantem teto rígido.",
          },
        ],
      },
    ],
  },
  {
    id: "mod-7",
    index: 7,
    slug: "terraform-e-ansible",
    title: "Terraform e Ansible",
    tagline: "Infraestrutura que existe em código, revisão e histórico.",
    weeks: 6,
    xp: 3575,
    badge: "infrastructure-mage",
    regionId: "terra-iac",
    bossId: "boss-drift-terraform",
    overview:
      "Clicar no console não escala nem se audita. Com Terraform você declara a infraestrutura, versiona no Git e aplica com revisão; com Ansible você configura o que roda dentro dos hosts de forma idempotente. Aqui você provisiona dev e staging idênticos, aprende state remoto com lock, módulos reutilizáveis e como identificar e resolver drift — a diferença entre o código e a realidade.",
    objectives: [
      "Escrever configuração Terraform com variáveis e outputs",
      "Configurar backend remoto com lock e isolar ambientes",
      "Criar e consumir módulos reutilizáveis",
      "Detectar e resolver drift com plan e import",
      "Configurar hosts com playbooks e roles idempotentes",
    ],
    prerequisites: ["Módulo 6 concluído"],
    topics: [
      "IaC",
      "Providers",
      "Resources",
      "Variables",
      "Outputs",
      "State",
      "Modules",
      "Backends",
      "Drift",
      "Playbooks",
      "Roles",
      "Idempotência",
    ],
    delivery:
      "Ambientes dev e staging provisionados por Terraform e host configurado por Ansible sem passos manuais.",
    checklist: [
      "State em S3 com lock e versionamento habilitado",
      "Ambientes separados por diretório ou workspace, com variáveis próprias",
      "Módulo de rede reutilizado pelos dois ambientes",
      "terraform plan limpo após apply (sem drift)",
      "Playbook aplicado duas vezes com resultado 'changed=0' na segunda",
    ],
    troubleshooting:
      "Sintoma: terraform plan quer destruir um recurso que ninguém mexeu no código. Investigação: alguém alterou o recurso no console (drift) ou o provider mudou o valor padrão. Correção: comparar com terraform state show, ajustar o código para refletir a realidade desejada, ou importar/atualizar o state. Prevenção: proibir alteração manual e rodar plan em CI a cada PR.",
    interviewQuestions: [
      "Por que o state do Terraform precisa de lock?",
      "Como você isolaria dev, staging e produção?",
      "O que é idempotência e como o Ansible a garante?",
    ],
    printQuest:
      "Descrever toda a infraestrutura do CloudShop em código e configurar o host com Ansible.",
    lessons: [
      {
        id: "l-7-1",
        moduleId: "mod-7",
        title: "Terraform: linguagem, ciclo e o papel do state",
        duration: 50,
        difficulty: "Intermediário",
        tools: ["Terraform"],
        xp: 25,
        objectives: [
          "Escrever provider, resource, variable e output",
          "Entender init/plan/apply/destroy",
          "Compreender o que o state guarda",
        ],
        body: [
          "Terraform é declarativo: você descreve o estado desejado e ele calcula o plano de mudança. O ciclo é init (baixa providers e configura backend), plan (mostra o diff), apply (executa) e destroy (remove). Ler o plano antes de aplicar é obrigação profissional, não formalidade.",
          "O state é o mapa entre o código e os recursos reais, incluindo atributos e dependências. Perder o state significa que o Terraform não sabe mais o que gerencia; corrompê-lo por duas execuções simultâneas significa recurso duplicado ou destruído. Por isso: backend remoto, versionamento e lock.",
          "Atenção de segurança: o state contém valores sensíveis em texto (senhas geradas, endpoints, chaves). Ele nunca vai para o Git; vai para bucket privado, criptografado e com acesso restrito.",
        ],
        code: [
          {
            label: "Configuração base do CloudShop",
            language: "hcl",
            code: `terraform {
  required_version = "~> 1.9"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.60" }
  }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = {
      project = "cloudshop"
      env     = var.env
      owner   = "equipe-plataforma"
      managed = "terraform"
    }
  }
}

variable "region" { type = string, default = "us-east-1" }
variable "env"    { type = string }
variable "vpc_cidr" {
  type        = string
  description = "Faixa da VPC do ambiente"
  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "vpc_cidr deve ser um CIDR valido."
  }
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  tags                 = { Name = "cloudshop-\${var.env}" }
}

output "vpc_id" {
  value       = aws_vpc.main.id
  description = "ID da VPC criada"
}`,
            securityNote:
              "Marque outputs sensíveis com sensitive = true e nunca imprima segredo em log de pipeline.",
          },
          {
            label: "Ciclo de trabalho",
            language: "bash",
            code: `terraform init
terraform fmt -recursive && terraform validate
terraform plan -var-file=env/dev.tfvars -out=plan.tfplan
terraform apply plan.tfplan
terraform output -json | jq
terraform state list
terraform state show aws_vpc.main
terraform destroy -var-file=env/dev.tfvars`,
          },
        ],
        whyItMatters:
          "IaC é requisito quase universal nas vagas; explicar state e plano é pergunta recorrente em entrevista.",
        commonMistake: "Rodar apply sem ler o plano e destruir um recurso com dados.",
        productionTip:
          "Salve o plano em arquivo e aplique exatamente esse plano: evita surpresa entre revisar e aplicar.",
        securityAlert:
          "State em bucket público é vazamento de credenciais e topologia. Bloqueie acesso público e habilite criptografia.",
        interviewQuestion:
          "O que acontece se dois engenheiros rodarem apply ao mesmo tempo sem lock?",
        glossary: [
          {
            term: "provider",
            definition:
              "Plugin que traduz configuração Terraform em chamadas de API de uma plataforma.",
          },
          {
            term: "state",
            definition:
              "Arquivo que mapeia recursos declarados aos recursos reais e seus atributos.",
          },
        ],
        printQuestLink:
          "Criar a VPC do CloudShop via Terraform, substituindo os comandos manuais do módulo anterior.",
        quiz: [
          {
            question: "Para que serve o state do Terraform?",
            options: [
              "Guardar logs de execução",
              "Mapear recursos declarados aos recursos reais e seus atributos",
              "Armazenar credenciais do provider",
              "Substituir o repositório Git",
            ],
            answerIndex: 1,
            explanation: "É o mapa que permite calcular diferenças entre desejado e existente.",
          },
        ],
      },
      {
        id: "l-7-2",
        moduleId: "mod-7",
        title: "Backend remoto, lock e separação de ambientes",
        duration: 45,
        difficulty: "Avançado",
        tools: ["Terraform", "S3", "DynamoDB"],
        xp: 25,
        objectives: [
          "Configurar backend S3 com lock",
          "Separar ambientes com segurança",
          "Proteger o state",
        ],
        body: [
          "Assim que uma segunda pessoa toca a infraestrutura, o state precisa sair da sua máquina. O padrão na AWS é bucket S3 com versionamento e criptografia, mais lock (DynamoDB nas versões clássicas, ou lockfile S3 nas mais recentes). Lock impede execuções concorrentes, e versionamento permite recuperar um state corrompido.",
          "Para ambientes, dois caminhos: workspaces (mais simples, mesmo backend, chaves diferentes) ou diretórios por ambiente com tfvars próprios (mais explícito e mais comum em produção, porque permite permissões diferentes por conta e evita apply acidental no ambiente errado).",
          "Independentemente da escolha, rode plan automaticamente em cada PR de infraestrutura e exija aprovação para apply em produção. Infraestrutura merece o mesmo rigor de revisão que código de aplicação — na prática, mais.",
        ],
        code: [
          {
            label: "Backend com lock e estrutura por ambiente",
            language: "hcl",
            code: `# backend.tf
terraform {
  backend "s3" {
    bucket       = "cloudshop-tfstate"
    key          = "dev/infra.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true    # lock nativo no S3 (Terraform >= 1.10)
  }
}

# estrutura de diretorios
# infra/
#   modules/network/
#   modules/app/
#   envs/dev/main.tf   -> module "network" { source = "../../modules/network" }
#   envs/staging/main.tf`,
            securityNote:
              "O bucket de state deve ter versionamento, bloqueio de acesso público e política restrita às roles de deploy.",
          },
          {
            label: "Operações com state",
            language: "bash",
            code: `terraform init -reconfigure
terraform workspace list
terraform state pull > backup-state.json     # copia de seguranca antes de operar
terraform state mv aws_instance.old aws_instance.api
terraform import aws_s3_bucket.assets cloudshop-assets
terraform force-unlock <LOCK_ID>             # somente se o lock ficou orfao`,
          },
        ],
        whyItMatters:
          "State compartilhado sem lock é a receita comprovada de infraestrutura corrompida em equipe.",
        commonMistake: "Comitar terraform.tfstate no Git — e com ele senhas e endpoints internos.",
        productionTip:
          "Contas AWS separadas por ambiente é a isolação mais forte; dentro da mesma conta, use roles distintas por ambiente.",
        securityAlert:
          "force-unlock sem confirmar que ninguém está aplicando pode corromper o state de vez.",
        interviewQuestion:
          "Como você organizaria Terraform para três ambientes com times diferentes?",
        glossary: [
          { term: "backend", definition: "Onde o Terraform armazena o state e coordena o lock." },
          {
            term: "workspace",
            definition: "Instâncias separadas de state dentro da mesma configuração.",
          },
        ],
        printQuestLink:
          "Mover o state do CloudShop para S3 com lock e criar os ambientes dev e staging.",
        quiz: [
          {
            question: "Qual a função do lock no backend remoto?",
            options: [
              "Criptografar o state",
              "Impedir execuções simultâneas que corromperiam o state",
              "Versionar o código",
              "Autenticar no provider",
            ],
            answerIndex: 1,
            explanation: "O lock serializa as operações sobre o mesmo state.",
          },
        ],
      },
      {
        id: "l-7-3",
        moduleId: "mod-7",
        title: "Módulos, reuso e combate ao drift",
        duration: 50,
        difficulty: "Avançado",
        tools: ["Terraform", "CI"],
        xp: 25,
        objectives: [
          "Escrever módulo com interface clara",
          "Reutilizar entre ambientes",
          "Detectar drift automaticamente",
        ],
        body: [
          "Módulo é a unidade de reuso: entradas (variables), lógica (resources) e saídas (outputs). Um bom módulo tem interface pequena, valores padrão sensatos e nenhuma suposição escondida sobre o ambiente. Módulo de rede, de aplicação e de banco cobrem a maior parte das necessidades de um projeto do porte do CloudShop.",
          "Drift é a divergência entre o código e a realidade, geralmente causada por alteração manual no console durante uma emergência. O problema não é apenas estético: o próximo apply pode desfazer uma correção urgente ou destruir algo que passou a ser necessário.",
          "A defesa é processo: plan agendado em CI que falha quando há diferença, notificação para o time e regra clara de que alteração manual precisa ser refletida no código no mesmo dia. Quando o recurso já existe fora do Terraform, use import (ou blocos import) para trazê-lo ao controle.",
        ],
        code: [
          {
            label: "Módulo de rede e consumo por ambiente",
            language: "hcl",
            code: `# modules/network/variables.tf
variable "env"       { type = string }
variable "cidr"      { type = string }
variable "azs"       { type = list(string), default = ["us-east-1a", "us-east-1b"] }

# modules/network/main.tf
resource "aws_vpc" "this" {
  cidr_block = var.cidr
  tags       = { Name = "cloudshop-\${var.env}" }
}

resource "aws_subnet" "private" {
  for_each          = { for i, az in var.azs : az => i }
  vpc_id            = aws_vpc.this.id
  availability_zone = each.key
  cidr_block        = cidrsubnet(var.cidr, 8, each.value + 10)
  tags              = { Name = "cloudshop-\${var.env}-priv-\${each.key}" }
}

output "vpc_id"      { value = aws_vpc.this.id }
output "private_ids" { value = [for s in aws_subnet.private : s.id] }

# envs/staging/main.tf
module "network" {
  source = "../../modules/network"
  env    = "staging"
  cidr   = "10.30.0.0/16"
}`,
          },
          {
            label: "Detecção de drift em CI",
            language: "yaml",
            code: `name: drift-check
on:
  schedule: [{ cron: "0 7 * * 1-5" }]
  workflow_dispatch:

permissions:
  contents: read
  id-token: write

jobs:
  plan:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        env: [dev, staging]
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/cloudshop-plan
          aws-region: us-east-1
      - uses: hashicorp/setup-terraform@v3
      - run: terraform -chdir=infra/envs/\${{ matrix.env }} init
      - name: Plan detecta drift
        run: terraform -chdir=infra/envs/\${{ matrix.env }} plan -detailed-exitcode -no-color
        # exit 2 = ha mudancas pendentes (drift)`,
            securityNote:
              "A role de plan deve ter permissão somente de leitura; apply usa role separada com aprovação.",
          },
        ],
        whyItMatters:
          "Drift é o boss deste território e uma dor real de todo time que opera nuvem em escala.",
        commonMistake:
          "Criar módulo gigante com dezenas de variáveis que ninguém entende nem reutiliza.",
        productionTip:
          "Fixe versão do módulo (tag Git) ao consumi-lo: atualização de módulo deve ser decisão explícita.",
        interviewQuestion: "Como você detecta e corrige drift em uma infraestrutura de produção?",
        glossary: [
          {
            term: "drift",
            definition:
              "Divergência entre o estado descrito no código e o estado real da infraestrutura.",
          },
          {
            term: "import",
            definition: "Trazer um recurso existente para o controle do Terraform.",
          },
        ],
        printQuestLink: "Extrair o módulo de rede do CloudShop e usá-lo em dev e staging.",
        quiz: [
          {
            question: "O que o exit code 2 de terraform plan -detailed-exitcode indica?",
            options: [
              "Erro de sintaxe",
              "Nenhuma mudança",
              "Há mudanças pendentes (possível drift)",
              "Falha de autenticação",
            ],
            answerIndex: 2,
            explanation: "0 = sem mudanças, 1 = erro, 2 = existem diferenças a aplicar.",
          },
        ],
      },
      {
        id: "l-7-4",
        moduleId: "mod-7",
        title: "Ansible: inventário, playbooks e idempotência",
        duration: 50,
        difficulty: "Intermediário",
        tools: ["Ansible", "SSH"],
        xp: 25,
        objectives: [
          "Escrever inventário e playbook",
          "Garantir idempotência",
          "Usar handlers e variáveis",
        ],
        body: [
          "Terraform cria a infraestrutura; Ansible configura o que roda dentro dela. Ele age por SSH, sem agente, e é declarativo por módulo: você diz 'o pacote deve estar presente' e 'o serviço deve estar rodando' — não escreve os comandos. Isso é o que produz idempotência.",
          "Idempotência é o coração do Ansible: aplicar o playbook duas vezes deve resultar em changed=0 na segunda. Quando você recorre ao módulo shell/command sem creates ou changed_when, perde essa garantia e volta ao mundo dos scripts imprevisíveis.",
          "Organize com roles quando o playbook cresce: tasks, handlers, templates, defaults e vars separados. Templates Jinja2 geram configuração por ambiente, e handlers reiniciam serviço apenas quando a configuração realmente mudou.",
        ],
        code: [
          {
            label: "Playbook do host da API",
            language: "yaml",
            code: `# inventory.ini
# [api]
# 10.20.11.20 ansible_user=ubuntu

- name: Configurar host da API do CloudShop
  hosts: api
  become: true
  vars:
    app_dir: /opt/cloudshop
    node_version: "22"
  tasks:
    - name: Pacotes base presentes
      ansible.builtin.apt:
        name: [curl, git, ufw, nginx]
        state: present
        update_cache: true

    - name: Usuario de servico existe
      ansible.builtin.user:
        name: cloudshop
        system: true
        shell: /usr/sbin/nologin

    - name: Diretorio da aplicacao com dono correto
      ansible.builtin.file:
        path: "{{ app_dir }}"
        state: directory
        owner: cloudshop
        group: cloudshop
        mode: "0750"

    - name: Configuracao do Nginx a partir do template
      ansible.builtin.template:
        src: templates/nginx-api.conf.j2
        dest: /etc/nginx/conf.d/cloudshop.conf
        mode: "0644"
      notify: reload nginx

    - name: Firewall permite apenas 22, 80 e 443
      community.general.ufw:
        rule: allow
        port: "{{ item }}"
        proto: tcp
      loop: ["22", "80", "443"]

    - name: Servico habilitado e rodando
      ansible.builtin.systemd:
        name: cloudshop-api
        enabled: true
        state: started

  handlers:
    - name: reload nginx
      ansible.builtin.systemd:
        name: nginx
        state: reloaded`,
            securityNote:
              "Segredos vão em ansible-vault ou variáveis de ambiente do executor, nunca em texto no playbook ou no inventário.",
          },
          {
            label: "Execução e validação de idempotência",
            language: "bash",
            code: `ansible-inventory -i inventory.ini --list
ansible all -i inventory.ini -m ping
ansible-playbook -i inventory.ini site.yml --check --diff    # dry-run
ansible-playbook -i inventory.ini site.yml
ansible-playbook -i inventory.ini site.yml                   # 2a vez: changed=0
ansible-vault encrypt group_vars/api/vault.yml
ansible-lint site.yml`,
          },
        ],
        whyItMatters:
          "Muitas empresas ainda operam frotas de VMs; Ansible é o padrão para configurá-las com previsibilidade.",
        commonMistake:
          "Usar shell para tudo e perder idempotência — o playbook passa a 'mudar' algo em toda execução.",
        productionTip:
          "Rode sempre com --check --diff antes de aplicar em produção e mantenha ansible-lint no CI.",
        securityAlert:
          "Playbook com become e módulo shell recebendo variável externa é vetor de execução arbitrária.",
        interviewQuestion: "Como você garante que um playbook é idempotente?",
        glossary: [
          {
            term: "role",
            definition:
              "Estrutura padronizada que agrupa tasks, templates e variáveis reutilizáveis.",
          },
          {
            term: "handler",
            definition: "Task executada apenas quando notificada por uma mudança.",
          },
        ],
        printQuestLink: "Configurar o host de produção do CloudShop inteiramente por Ansible.",
        quiz: [
          {
            question: "Um playbook idempotente executado duas vezes deve resultar em:",
            options: [
              "changed sempre maior que 0",
              "changed=0 na segunda execução",
              "erro na segunda execução",
              "reinício de todos os serviços",
            ],
            answerIndex: 1,
            explanation: "Nada muda porque o estado desejado já foi alcançado.",
          },
        ],
      },
      {
        id: "l-7-5",
        moduleId: "mod-7",
        title: "Terraform e Ansible juntos no fluxo de entrega",
        duration: 45,
        difficulty: "Avançado",
        tools: ["Terraform", "Ansible", "GitHub Actions"],
        xp: 25,
        objectives: [
          "Encadear provisionamento e configuração",
          "Gerar inventário dinâmico",
          "Aplicar IaC pelo pipeline com aprovação",
        ],
        body: [
          "O fluxo maduro é: Terraform provisiona e expõe outputs (IPs, IDs, endpoints), um inventário dinâmico consome esses dados e o Ansible configura os hosts. Nada de copiar IP à mão — o acoplamento por output é o que torna o processo repetível.",
          "No pipeline, separe claramente plan (em PR, com role somente leitura, resultado comentado no PR) de apply (em main ou tag, com ambiente protegido e aprovação humana). Essa separação é o que permite revisar infraestrutura como se revisa código.",
          "Registre no repositório a ordem de execução, os pré-requisitos e o procedimento de rollback de infraestrutura — que raramente é 'destroy'. Em recursos com dados, rollback significa restaurar backup, não apagar e recriar.",
        ],
        code: [
          {
            label: "Pipeline de IaC com plan e apply separados",
            language: "yaml",
            code: `name: infra

on:
  pull_request:
    paths: ["infra/**"]
  push:
    branches: [main]
    paths: ["infra/**"]

permissions:
  contents: read
  id-token: write
  pull-requests: write

jobs:
  plan:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/cloudshop-plan
          aws-region: us-east-1
      - uses: hashicorp/setup-terraform@v3
      - run: terraform -chdir=infra/envs/staging init
      - run: terraform -chdir=infra/envs/staging validate
      - run: terraform -chdir=infra/envs/staging plan -no-color | tee plan.txt
      - uses: actions/upload-artifact@v4
        with: { name: plan, path: plan.txt }

  apply:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/cloudshop-apply
          aws-region: us-east-1
      - uses: hashicorp/setup-terraform@v3
      - run: terraform -chdir=infra/envs/staging init
      - run: terraform -chdir=infra/envs/staging apply -auto-approve
      - name: Configurar hosts com Ansible
        run: |
          pip install ansible boto3
          ansible-playbook -i inventory_aws_ec2.yml ansible/site.yml`,
          },
          {
            label: "Inventário dinâmico por tags",
            language: "yaml",
            code: `# inventory_aws_ec2.yml
plugin: amazon.aws.aws_ec2
regions: [us-east-1]
filters:
  tag:project: cloudshop
  tag:env: staging
  instance-state-name: running
keyed_groups:
  - key: tags.role
    prefix: role
hostnames:
  - private-ip-address`,
            securityNote:
              "Inventário dinâmico exige credenciais de leitura EC2. Use a mesma role OIDC do pipeline, sem chave estática.",
          },
        ],
        whyItMatters:
          "Provisionar e configurar em um fluxo único e auditável é exatamente o que a vaga chama de automação de infraestrutura.",
        commonMistake: "Aplicar Terraform da máquina local e depois não saber quem mudou o quê.",
        productionTip:
          "Comente o plano no PR automaticamente: revisão de infraestrutura fica acessível a todo o time.",
        securityAlert: "Nunca dê permissão de apply a workflow disparado por PR de fork.",
        interviewQuestion:
          "Como você conecta a saída do Terraform à configuração feita pelo Ansible?",
        glossary: [
          {
            term: "inventário dinâmico",
            definition: "Inventário gerado consultando a API da nuvem em vez de arquivo fixo.",
          },
          {
            term: "output",
            definition: "Valor exportado pelo Terraform para consumo por outras ferramentas.",
          },
        ],
        printQuestLink:
          "Automatizar provisionamento e configuração do staging do CloudShop em um único fluxo.",
        quiz: [
          {
            question: "Onde o apply do Terraform deve rodar em um time maduro?",
            options: [
              "Na máquina de cada engenheiro",
              "No pipeline, com role dedicada e aprovação",
              "Direto no console da nuvem",
              "No servidor de produção",
            ],
            answerIndex: 1,
            explanation: "Centralizar no pipeline dá auditoria, revisão e credenciais controladas.",
          },
        ],
      },
      {
        id: "l-7-6",
        moduleId: "mod-7",
        title: "Módulos reutilizáveis: contratos, validação e evolução segura",
        duration: 55,
        difficulty: "Avançado",
        tools: ["Terraform", "HCL", "Git"],
        xp: 25,
        objectives: [
          "Desenhar uma interface pequena de módulo",
          "Validar entradas antes do provisionamento",
          "Expor outputs sem acoplar consumidores",
          "Planejar mudanças de endereço com moved",
          "Versionar e revisar atualizações de módulo",
        ],
        body: [
          "O módulo de rede já demonstrou reuso; agora vamos tratar um módulo como **produto interno com contrato**. Quem o consome precisa entender entradas, saídas e garantias sem ler todos os recursos. Um módulo que exige conhecer sua implementação apenas moveu a complexidade para outra pasta.",
          "Escolha uma **responsabilidade coesa**. Neste exercício, `modules/private-subnet` cria uma subnet sem IP público automático e devolve seu ID. Ele não cria VPC, NAT ou banco escondidos; a composição dessas peças fica no módulo raiz, onde o ambiente é decidido.",
          "**Valide o que puder antes da API**. Uma variável `cidr` com validation evita um erro básico de formato, mas não comprova ausência de sobreposição nem capacidade futura de endereçamento. Documente essas limitações e revise o desenho de rede junto com o plano.",
          "Use **outputs estáveis** como interface: o consumidor depende de `subnet_id`, não de caminhos internos de recursos. Evite exportar objetos inteiros quando um ID basta. Isso reduz acoplamento e permite reorganizar a implementação sem obrigar cada ambiente a mudar.",
          "O **provider deve ser configurado no módulo raiz** e recebido pelo filho, que declara seus requisitos. Assim dev e staging podem usar contas e regiões distintas sem credenciais embutidas no módulo. `required_providers` especifica compatibilidade, não autenticação.",
          "Uma mudança de nome interno pode alterar o **endereço no state** sem alterar o recurso desejado. Um bloco `moved` informa a migração de endereço; não o use para esconder substituições reais. O plano deve mostrar a movimentação esperada e ausência de recriação indevida.",
          "**Versão fixa é decisão de atualização**, não abandono de manutenção. Para módulo remoto, use versão de registry ou referência Git imutável revisada; para módulo local, a versão acompanha o commit do repositório. `.terraform.lock.hcl` fixa providers, não versões de módulos remotos.",
          "Valide o **contrato em um ambiente descartável**: formato, validate, plano e saída esperada. Depois execute um segundo plano para conferir convergência. Antes de publicar uma mudança incompatível em `subnet_id` ou nas entradas obrigatórias, documente migração e combine a atualização com os consumidores.",
        ],
        code: [
          {
            label: "Contrato e implementação de modules/private-subnet/main.tf",
            language: "hcl",
            code: '# O provider será herdado do módulo raiz.\nterraform {\n  required_providers {\n    aws = { source = "hashicorp/aws" }\n  }\n}\nvariable "vpc_id" {\n  type = string\n}\nvariable "az" {\n  type = string\n}\nvariable "cidr" {\n  type = string\n  validation {\n    condition     = can(cidrnetmask(var.cidr))\n    error_message = "Informe um CIDR IPv4 válido."\n  }\n}\nresource "aws_subnet" "this" {\n  vpc_id                  = var.vpc_id\n  availability_zone       = var.az\n  cidr_block              = var.cidr\n  map_public_ip_on_launch = false\n  # Privacidade também depende da tabela de rotas associada pelo módulo raiz.\n}\noutput "subnet_id" {\n  description = "ID da subnet para composição no módulo raiz."\n  value       = aws_subnet.this.id\n}',
          },
          {
            label: "Migração de nome dentro do módulo",
            language: "hcl",
            code: "# Inclua apenas se uma versão anterior usava aws_subnet.private.\n# Requer Terraform >= 1.1; mantenha o bloco durante a janela de migração.\nmoved {\n  from = aws_subnet.private\n  to   = aws_subnet.this\n}\n# Rode plan em cada consumidor e confira que não há destruição inesperada.",
          },
        ],
        whyItMatters:
          "Interfaces previsíveis permitem atualizar infraestrutura de vários ambientes sem multiplicar correções manuais.",
        commonMistake:
          "Renomear um resource sem migração e aceitar um plano de destruição por parecer apenas uma refatoração.",
        productionTip:
          "Publique exemplos mínimos de consumo e uma lista de mudanças incompatíveis por versão do módulo.",
        securityAlert:
          "Não coloque access_key, secret_key ou credenciais de backend em módulos; autentique a execução por role.",
        interviewQuestion:
          "Como renomear um recurso dentro de um módulo sem recriá-lo nos ambientes consumidores?",
        glossary: [
          {
            term: "contrato de módulo",
            definition: "Entradas, saídas e garantias públicas para os consumidores.",
          },
          {
            term: "módulo raiz",
            definition:
              "Configuração executada diretamente, que compõe módulos filhos e providers.",
          },
          {
            term: "moved",
            definition: "Bloco declarativo de migração entre endereços de recursos no state.",
          },
          {
            term: "acoplamento",
            definition: "Dependência de um consumidor em detalhes internos de outra parte.",
          },
          {
            term: "mudança incompatível",
            definition: "Alteração que exige adaptação dos consumidores existentes.",
          },
        ],
        printQuestLink:
          "Evoluir o módulo de rede do CloudShop com entradas validadas, outputs documentados e plano de migração sem recriação.",
        quiz: [
          {
            question: "O que .terraform.lock.hcl fixa?",
            options: [
              "Todo módulo Git",
              "Os nomes de recursos",
              "As seleções e checksums de providers",
              "As credenciais AWS",
            ],
            answerIndex: 2,
            explanation:
              "O lockfile de dependências registra providers, não fixa versões dos módulos remotos.",
          },
          {
            question: "Qual recurso ajuda em uma renomeação de endereço no state?",
            options: ["moved", "destroy automático", "ignore_changes em tudo", "Um novo backend"],
            answerIndex: 0,
            explanation:
              "moved declara a migração de endereço preservando o vínculo com o recurso.",
          },
          {
            question: "Um módulo com map_public_ip_on_launch=false garante subnet privada?",
            options: [
              "Sim, sem condições",
              "Não; é necessário avaliar também as rotas",
              "Sim, se tiver output",
              "Somente com tag private",
            ],
            answerIndex: 1,
            explanation:
              "A classificação pública ou privada depende do caminho de roteamento, não só de IP automático.",
          },
        ],
      },
      {
        id: "l-7-7",
        moduleId: "mod-7",
        title: "State remoto: migração, contenção de concorrência e recuperação",
        duration: 55,
        difficulty: "Avançado",
        tools: ["Terraform", "Amazon S3", "AWS CLI"],
        xp: 25,
        objectives: [
          "Migrar state local sem perder vínculos",
          "Configurar lock nativo no S3",
          "Distinguir permissões do state e do lockfile",
          "Investigar locks antes de removê-los",
          "Planejar recuperação com versionamento",
        ],
        body: [
          "O backend já foi apresentado; esta aula aprofunda **operação segura do state**. Migrar não é simplesmente copiar um arquivo para S3: o Terraform precisa passar a usar a localização correta sem criar um segundo inventário independente. Faça a mudança em janela controlada, sem outros plans ou applies.",
          "Prepare o **backend antes da migração**. O bucket precisa existir com versionamento, bloqueio público, criptografia e acesso restrito. Use uma configuração de bootstrap separada ou infraestrutura corporativa existente; não dependa do backend que ainda está tentando criar.",
          "O **lockfile nativo do S3** exige Terraform `>= 1.10` e `use_lockfile = true`. Padronize essa versão em todas as máquinas e pipelines que acessam o state. Uma configuração compatível não protege contra clientes antigos que não adotam o mesmo mecanismo de lock.",
          "As **permissões são distintas**: a role precisa ler e gravar o objeto de state e listar o prefixo necessário no bucket; no objeto `.tflock`, precisa também excluir o lock ao terminar. Se houver SSE-KMS, as permissões da chave entram na análise. Não conceda DeleteObject ao state sem necessidade operacional.",
          "Execute `init -migrate-state` após configurar o backend e confirme a migração solicitada. **Não confunda com reconfigure**: `-reconfigure` aceita uma configuração de backend sem migrar o state anterior. Compare inventário antes/depois e só prossiga quando estiver certo de conta, bucket e chave.",
          "Com concorrência legítima, **aguarde o lock**, não o desative. `-lock-timeout=5m` dá tempo para outra operação terminar. O lock coordena um state específico; não serializa automaticamente stacks diferentes que alteram o mesmo recurso por desenho incorreto.",
          "Um lock aparentemente preso exige **investigação de execução ativa**: confira job, operador, horário e logs. Só use `force-unlock` após confirmar que o dono não está mais escrevendo e preservar evidências. Destravar um apply ainda vivo pode permitir duas gravações concorrentes.",
          "**Recuperação é procedimento ensaiado**, não restauração impulsiva de versão. Pare os escritores, preserve state atual, identifique a versão boa e reconcilie o que mudou na AWS desde então. Após recuperar sob controle, execute plan e revise; restaurar um state antigo não desfaz recursos já criados ou removidos.",
        ],
        code: [
          {
            label: "Backend parcial e configuração do ambiente",
            language: "hcl",
            code: '# backend.tf no módulo raiz; o bucket é criado por bootstrap separado.\nterraform {\n  required_version = ">= 1.10, < 2.0"\n  backend "s3" {}\n}\n# Salve o conteúdo abaixo em dev.s3.tfbackend, sem credenciais.\n# bucket       = "cloudshop-tfstate-CONTA"\n# key          = "dev/infra.tfstate"\n# region       = "us-east-1"\n# encrypt      = true\n# use_lockfile = true\n# Troque CONTA pelo identificador do bucket privado já provisionado.',
          },
          {
            label: "Janela de migração e validação do inventário",
            language: "bash",
            code: "# Execute no diretório raiz correto, sem outros escritores ativos.\nset -euo pipefail\numask 077\n# Backup sensível fora do repositório; aplique a política de retenção do time.\nterraform state pull > /tmp/cloudshop-before-migration.tfstate\nterraform state list > /tmp/cloudshop-before-migration.txt\nterraform init -migrate-state -backend-config=dev.s3.tfbackend\nterraform state list > /tmp/cloudshop-after-migration.txt\ndiff -u /tmp/cloudshop-before-migration.txt /tmp/cloudshop-after-migration.txt\n# Revise qualquer diferença; este comando não aplica mudanças.\nterraform plan -lock-timeout=5m\n# Não use -lock=false para contornar outro job.",
          },
        ],
        whyItMatters:
          "Procedimentos de migração e recuperação evitam perder o vínculo entre código e infraestrutura durante incidentes.",
        commonMistake:
          "Usar -reconfigure achando que ele transfere automaticamente o state local para o backend remoto.",
        productionTip:
          "Teste recuperação em ambiente isolado e registre responsáveis, permissões de emergência e tempo de restauração.",
        securityAlert:
          "Backups de state contêm dados sensíveis: restrinja acesso, criptografe o armazenamento durável e nunca publique em artifacts abertos.",
        interviewQuestion:
          "Como migrar state local para S3 e comprovar que nenhum recurso perdeu seu vínculo?",
        glossary: [
          {
            term: "bootstrap",
            definition:
              "Etapa inicial que provisiona dependências necessárias à infraestrutura principal.",
          },
          {
            term: "lockfile S3",
            definition: "Objeto .tflock usado pelo backend para coordenar operações sobre o state.",
          },
          {
            term: "migrate-state",
            definition: "Opção do init que conduz a transferência do state ao mudar o backend.",
          },
          {
            term: "reconfigure",
            definition:
              "Opção do init que descarta a configuração anterior de backend sem migrar o state.",
          },
          {
            term: "versionamento S3",
            definition: "Manutenção de versões de objetos para recuperação e auditoria.",
          },
        ],
        printQuestLink:
          "Migrar o state de dev do CloudShop em janela controlada, comparar inventários e documentar investigação de lock órfão.",
        quiz: [
          {
            question: "Qual versão mínima suporta use_lockfile no backend S3?",
            options: ["0.12", "1.1", "1.10", "Qualquer versão"],
            answerIndex: 2,
            explanation: "O lock nativo S3 foi introduzido no Terraform 1.10.",
          },
          {
            question: "Antes de force-unlock, o que é indispensável?",
            options: [
              "Apagar o bucket",
              "Confirmar que não existe escritor ativo",
              "Desativar versionamento",
              "Executar destroy",
            ],
            answerIndex: 1,
            explanation:
              "Remover lock com escritor ativo pode causar concorrência e corrupção lógica do state.",
          },
          {
            question: "Restaurar uma versão antiga de state desfaz mudanças na AWS?",
            options: [
              "Não; é preciso reconciliar state e recursos reais",
              "Sim, imediatamente",
              "Sim, se houver criptografia",
              "Apenas para bancos",
            ],
            answerIndex: 0,
            explanation:
              "State é inventário, não um backup dos próprios recursos nem um rollback das APIs.",
          },
        ],
      },
      {
        id: "l-7-8",
        moduleId: "mod-7",
        title: "Pipeline de IaC: plano aprovado, apply rastreável e drift triado",
        duration: 55,
        difficulty: "Avançado",
        tools: ["GitHub Actions", "Terraform", "AWS OIDC"],
        xp: 25,
        objectives: [
          "Separar credenciais de plan e apply",
          "Aplicar o mesmo plano aprovado",
          "Interpretar códigos de saída sem mascarar falhas",
          "Distinguir mudanças esperadas de possível drift",
          "Definir limites de confiança em workflows",
        ],
        body: [
          "O pipeline anterior conectou ferramentas; agora o foco é **garantir o que foi aprovado**. Um plano é uma proposta calculada para código, variáveis, providers e state específicos. Rodar outro `plan` silenciosamente no job de apply pode executar algo diferente do que a revisão autorizou.",
          "Separe **validação sem credenciais** de acesso à nuvem. `fmt` e verificações estáticas podem rodar em PRs não confiáveis; planos autenticados ficam restritos a código revisado e origens confiáveis. Nunca combine checkout de código de fork com segredos usando um gatilho privilegiado como atalho.",
          "Autentique com **OIDC e roles distintas**. A trust policy deve restringir repositório, branch ou environment e audience. A role de plan lê recursos, lê state e, quando necessário, escreve o lockfile; isso não significa conceder alteração dos recursos de produção.",
          "No **plan persistido**, fixe a revisão e salve `plan.tfplan`. O job de apply recebe esse mesmo arquivo, usa a mesma versão do Terraform e providers compatíveis e depende de aprovação do environment. Se outro apply alterar o state, o plano pode ficar obsoleto: gere outro e solicite nova aprovação.",
          "**Artifacts são sensíveis**: o plano binário e sua representação JSON podem conter valores que a interface normalmente oculta. Restrinja acesso, retenção e origem do artifact. Não publique o plano completo em comentários abertos; apresente um resumo revisável sem segredos.",
          "Trate **exit codes como protocolo**: com `-detailed-exitcode`, `0` indica ausência de mudanças, `1` indica erro e `2` indica mudanças propostas. O shell de CI pode encerrar no código 2 antes de você classificá-lo; capture o resultado explicitamente sem converter um erro real em sucesso.",
          "Para **drift detection**, rode um plano agendado sobre a revisão implantada e as mesmas entradas aprovadas. Um código 2 apenas sinaliza diferença: ela também pode vir de alteração de código, variáveis ou provider. Correlacione o plano com histórico de deploy e auditoria antes de chamar tudo de drift.",
          "O fluxo seguro é **detectar, triar e aprovar**, não corrigir automaticamente qualquer diferença. Abra um incidente ou tarefa com responsável e prazo; decida se a alteração externa deve virar código ou ser revertida. Use concorrência por ambiente no CI e mantenha o lock do backend como proteção adicional.",
        ],
        code: [
          {
            label: "Capturar o resultado do plano em um job autenticado",
            language: "yaml",
            code: '# Trecho de steps após checkout confiável, setup-terraform com\n# terraform_wrapper: false, autenticação OIDC e terraform init.\n- name: Gerar plano e classificar resultado\n  id: plan\n  shell: bash\n  working-directory: infra/envs/dev\n  run: |\n    set +e\n    terraform plan -input=false -lock-timeout=5m -detailed-exitcode -out=plan.tfplan\n    rc=$?\n    set -e\n    case "$rc" in\n      0) echo "changes=false" >> "$GITHUB_OUTPUT" ;;\n      2) echo "changes=true" >> "$GITHUB_OUTPUT" ;;\n      *) echo "Falha ao calcular plano" >&2; exit "$rc" ;;\n    esac\n# No fluxo completo, envie o plano como artifact privado de curta retenção.\n# O job de apply protegido baixa exclusivamente o artifact desta execução.',
          },
          {
            label: "Aplicar o plano revisado no job protegido",
            language: "bash",
            code: "# Pré-condições: aprovação de environment, checkout do mesmo commit,\n# role de apply via OIDC e plano íntegro baixado desta mesma execução.\nset -euo pipefail\ncd infra/envs/dev\nterraform init -input=false -lockfile=readonly\n# Não executar um novo plan neste job: aplique o arquivo já aprovado.\nterraform apply -input=false -lock-timeout=5m plan.tfplan\n# Se o plano estiver obsoleto, interrompa e reinicie plan + aprovação.\n# Em execução separada, valide convergência e notifique diferenças.",
          },
        ],
        whyItMatters:
          "Vincular revisão, plano e execução reduz mudanças inesperadas e permite reconstruir quem aprovou cada alteração.",
        commonMistake:
          "Capturar qualquer falha de plan com || true e publicar o job como sucesso sem distinguir código 1 de 2.",
        productionTip:
          "Use environment protegido, concorrência por ambiente sem cancelar apply em andamento e retenção curta de artifacts.",
        securityAlert:
          "Código de PR pode executar comandos arbitrários: não dê credenciais de plan ou acesso ao state a contribuições não confiáveis.",
        interviewQuestion:
          "Como garantir que o apply executa exatamente a mudança revisada e como tratar um plano obsoleto?",
        glossary: [
          {
            term: "plano persistido",
            definition:
              "Arquivo produzido por plan -out para aplicação posterior da mesma proposta.",
          },
          {
            term: "OIDC",
            definition:
              "Protocolo usado para trocar identidade do job por credenciais temporárias na nuvem.",
          },
          {
            term: "environment protegido",
            definition:
              "Contexto de implantação com restrições e aprovação antes da execução autorizada.",
          },
          {
            term: "artifact",
            definition:
              "Arquivo preservado por uma execução de CI para uso controlado em outros jobs.",
          },
          {
            term: "drift detection",
            definition:
              "Verificação periódica de divergências que exige triagem de causa e intenção.",
          },
        ],
        printQuestLink:
          "Fortalecer o pipeline do CloudShop com plano persistido, aprovação, roles separadas e triagem de diferenças agendadas.",
        quiz: [
          {
            question: "O plan retorna 2 com -detailed-exitcode. Isso significa:",
            options: [
              "Falha de autenticação",
              "Mudanças propostas que precisam ser classificadas",
              "Nenhuma mudança",
              "Permissão para aplicar sem revisão",
            ],
            answerIndex: 1,
            explanation:
              "O código 2 indica diferenças, não necessariamente erro nem drift confirmado.",
          },
          {
            question: "O state mudou após a aprovação e o plano ficou obsoleto. O que fazer?",
            options: [
              "Forçar o apply sem lock",
              "Editar o arquivo binário",
              "Gerar novo plano e obter nova aprovação",
              "Destruir e recriar",
            ],
            answerIndex: 2,
            explanation:
              "A aprovação anterior não cobre uma proposta recalculada para outro estado.",
          },
          {
            question: "Quem pode receber acesso ao state em um workflow de PR?",
            options: [
              "Qualquer fork",
              "Todo usuário que abrir issue",
              "Qualquer job com checkout",
              "Somente execuções confiáveis autorizadas pela política do time",
            ],
            answerIndex: 3,
            explanation:
              "State e credenciais expõem dados e exigem uma fronteira explícita de confiança.",
          },
        ],
      },
    ],
  },
];
