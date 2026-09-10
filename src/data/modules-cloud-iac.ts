import type { Module } from "@/lib/types";

export const CLOUD_IAC_MODULES: Module[] = [
  {
    id: "mod-6",
    index: 6,
    slug: "aws-cloud-e-seguranca",
    title: "AWS, Cloud e Segurança",
    tagline: "Provisionar com responsabilidade técnica e financeira.",
    weeks: 6,
    xp: 3500,
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
    topics: ["IAM", "VPC", "Subnets", "Route tables", "IGW", "NAT", "Security Groups", "EC2", "S3", "CloudFront", "RDS", "ALB", "DNS", "Tags", "Custos"],
    delivery: "Deploy seguro do CloudShop na AWS com orçamento configurado e checklist de destruição validado.",
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
    printQuest: "Publicar o CloudShop na AWS: frontend no S3 com CloudFront, API em EC2 atrás de ALB e banco em RDS privado.",
    lessons: [
      {
        id: "l-6-1",
        moduleId: "mod-6",
        title: "IAM: identidades, roles e menor privilégio",
        duration: 45,
        difficulty: "Intermediário",
        tools: ["AWS IAM", "AWS CLI"],
        xp: 25,
        objectives: ["Distinguir usuário, role e política", "Escrever política mínima", "Eliminar chaves estáticas"],
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
        whyItMatters: "Toda auditoria e todo incidente de nuvem passa por IAM. Explicar menor privilégio com exemplo é diferencial em entrevista.",
        commonMistake: "Anexar AdministratorAccess à role da aplicação 'para destravar' e nunca mais revisar.",
        productionTip: "Use tags nas roles e políticas baseadas em tag: escala melhor que política por recurso.",
        securityAlert: "Chave IAM em repositório público é explorada em minutos por bots. Revogue e audite CloudTrail imediatamente.",
        interviewQuestion: "Como você concederia acesso a um bucket específico para uma aplicação sem usar chaves?",
        glossary: [
          { term: "role", definition: "Identidade IAM assumível temporariamente por serviços, usuários ou federação." },
          { term: "CloudTrail", definition: "Serviço de auditoria que registra chamadas de API na conta." },
        ],
        printQuestLink: "Criar a role da API do CloudShop com acesso mínimo ao bucket de uploads e ao segredo do banco.",
        quiz: [
          {
            question: "Qual a forma recomendada de uma aplicação em EC2 acessar o S3?",
            options: ["Chave de acesso no .env", "Instance profile com role", "Usuário raiz", "Bucket público"],
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
        objectives: ["Desenhar VPC com camadas", "Entender o que torna uma subnet pública", "Decidir sobre NAT considerando custo"],
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
        whyItMatters: "Sem entender rota e subnet você não depura 'a aplicação não alcança o banco' nem desenha ambiente auditável.",
        commonMistake: "Colocar RDS em subnet pública para 'facilitar o acesso' e expor o banco.",
        productionTip: "Reserve faixas por ambiente (dev 10.20/16, staging 10.30/16, prod 10.40/16) para permitir peering futuro sem conflito.",
        securityAlert: "Fluxo de saída irrestrito também é risco: exfiltração de dados sai por 443. Considere VPC endpoints.",
        interviewQuestion: "O que exatamente diferencia uma subnet pública de uma privada?",
        glossary: [
          { term: "IGW", definition: "Internet Gateway: componente que permite tráfego entre a VPC e a internet." },
          { term: "NAT Gateway", definition: "Serviço que permite saída à internet de subnets privadas, sem entrada." },
        ],
        printQuestLink: "Construir a VPC 10.20.0.0/16 do CloudShop com camadas pública, aplicação e dados.",
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
        objectives: ["Configurar SG com referência entre grupos", "Distinguir SG de NACL", "Auditar exposição da conta"],
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
        whyItMatters: "Este é literalmente o boss do módulo e um dos achados mais comuns em auditoria real.",
        commonMistake: "Liberar 0.0.0.0/0 'temporariamente' para testar e esquecer de fechar.",
        productionTip: "Prefira SSM Session Manager a SSH: acesso auditado, sem porta aberta e sem chave para vazar.",
        securityAlert: "Banco acessível pela internet com senha fraca é comprometido em horas por varredura automatizada.",
        interviewQuestion: "Diferencie Security Group e NACL e explique quando usar cada um.",
        glossary: [
          { term: "stateful", definition: "Firewall que rastreia conexões e libera a resposta automaticamente." },
          { term: "referência de SG", definition: "Regra cuja origem é outro Security Group, e não um bloco de IPs." },
        ],
        printQuestLink: "Fechar o acesso ao banco do CloudShop apenas ao SG da API.",
        quiz: [
          {
            question: "Qual origem é correta na regra 5432 do SG do banco?",
            options: ["0.0.0.0/0", "O SG da aplicação", "O IP público do ALB", "A faixa da internet do escritório"],
            answerIndex: 1,
            explanation: "Referenciar o SG da aplicação mantém a regra correta conforme as instâncias mudam.",
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
        objectives: ["Escolher o compute adequado", "Publicar frontend estático com CDN", "Subir banco gerenciado com backup"],
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
        whyItMatters: "Este é o conjunto que aparece em quase toda vaga júnior/pleno de nuvem em português.",
        commonMistake: "Deixar o bucket público 'para o site funcionar' em vez de usar CloudFront com OAC.",
        productionTip: "Teste a restauração do backup do RDS em outro identificador antes de considerar o ambiente pronto.",
        securityAlert: "Snapshot de RDS compartilhado publicamente já causou vazamentos famosos. Verifique sempre a visibilidade.",
        interviewQuestion: "Quando escolher EC2, ECS Fargate ou Lambda?",
        glossary: [
          { term: "OAC", definition: "Origin Access Control: permite ao CloudFront ler um bucket privado." },
          { term: "multi-AZ", definition: "Replicação do banco em outra zona de disponibilidade para failover." },
        ],
        printQuestLink: "Subir a infraestrutura de dev do CloudShop com frontend em CDN e banco privado.",
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
        objectives: ["Identificar os maiores geradores de custo", "Aplicar tags e budgets", "Executar checklist de destruição"],
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
        whyItMatters: "Vagas atuais citam FinOps explicitamente. Saber falar de custo com números diferencia candidatos.",
        commonMistake: "Deixar NAT Gateway ligado a mês inteiro para um laboratório de duas horas.",
        productionTip: "Automatize desligamento noturno de ambientes de desenvolvimento; economia de 60% é comum.",
        securityAlert: "Pico inexplicado de custo pode ser sinal de conta comprometida usada para mineração. Investigue como incidente.",
        interviewQuestion: "Quais recursos você verificaria primeiro se a fatura dobrasse sem novo deploy?",
        glossary: [
          { term: "FinOps", definition: "Prática de gestão financeira da nuvem, unindo engenharia e finanças." },
          { term: "recurso órfão", definition: "Recurso que continua cobrando sem estar associado a nada em uso." },
        ],
        printQuestLink: "Documentar o custo mensal estimado do CloudShop e o procedimento de destruição.",
        quiz: [
          {
            question: "Qual recurso frequentemente gera custo inesperado em laboratórios?",
            options: ["Security Group", "NAT Gateway", "IAM Role", "Tag de recurso"],
            answerIndex: 1,
            explanation: "NAT Gateway cobra por hora e por dado processado, mesmo com pouco uso.",
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
    xp: 3500,
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
    topics: ["IaC", "Providers", "Resources", "Variables", "Outputs", "State", "Modules", "Backends", "Drift", "Playbooks", "Roles", "Idempotência"],
    delivery: "Ambientes dev e staging provisionados por Terraform e host configurado por Ansible sem passos manuais.",
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
    printQuest: "Descrever toda a infraestrutura do CloudShop em código e configurar o host com Ansible.",
    lessons: [
      {
        id: "l-7-1",
        moduleId: "mod-7",
        title: "Terraform: linguagem, ciclo e o papel do state",
        duration: 50,
        difficulty: "Intermediário",
        tools: ["Terraform"],
        xp: 25,
        objectives: ["Escrever provider, resource, variable e output", "Entender init/plan/apply/destroy", "Compreender o que o state guarda"],
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
        whyItMatters: "IaC é requisito quase universal nas vagas; explicar state e plano é pergunta recorrente em entrevista.",
        commonMistake: "Rodar apply sem ler o plano e destruir um recurso com dados.",
        productionTip: "Salve o plano em arquivo e aplique exatamente esse plano: evita surpresa entre revisar e aplicar.",
        securityAlert: "State em bucket público é vazamento de credenciais e topologia. Bloqueie acesso público e habilite criptografia.",
        interviewQuestion: "O que acontece se dois engenheiros rodarem apply ao mesmo tempo sem lock?",
        glossary: [
          { term: "provider", definition: "Plugin que traduz configuração Terraform em chamadas de API de uma plataforma." },
          { term: "state", definition: "Arquivo que mapeia recursos declarados aos recursos reais e seus atributos." },
        ],
        printQuestLink: "Criar a VPC do CloudShop via Terraform, substituindo os comandos manuais do módulo anterior.",
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
        objectives: ["Configurar backend S3 com lock", "Separar ambientes com segurança", "Proteger o state"],
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
        whyItMatters: "State compartilhado sem lock é a receita comprovada de infraestrutura corrompida em equipe.",
        commonMistake: "Comitar terraform.tfstate no Git — e com ele senhas e endpoints internos.",
        productionTip: "Contas AWS separadas por ambiente é a isolação mais forte; dentro da mesma conta, use roles distintas por ambiente.",
        securityAlert: "force-unlock sem confirmar que ninguém está aplicando pode corromper o state de vez.",
        interviewQuestion: "Como você organizaria Terraform para três ambientes com times diferentes?",
        glossary: [
          { term: "backend", definition: "Onde o Terraform armazena o state e coordena o lock." },
          { term: "workspace", definition: "Instâncias separadas de state dentro da mesma configuração." },
        ],
        printQuestLink: "Mover o state do CloudShop para S3 com lock e criar os ambientes dev e staging.",
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
        objectives: ["Escrever módulo com interface clara", "Reutilizar entre ambientes", "Detectar drift automaticamente"],
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
            securityNote: "A role de plan deve ter permissão somente de leitura; apply usa role separada com aprovação.",
          },
        ],
        whyItMatters: "Drift é o boss deste território e uma dor real de todo time que opera nuvem em escala.",
        commonMistake: "Criar módulo gigante com dezenas de variáveis que ninguém entende nem reutiliza.",
        productionTip: "Fixe versão do módulo (tag Git) ao consumi-lo: atualização de módulo deve ser decisão explícita.",
        interviewQuestion: "Como você detecta e corrige drift em uma infraestrutura de produção?",
        glossary: [
          { term: "drift", definition: "Divergência entre o estado descrito no código e o estado real da infraestrutura." },
          { term: "import", definition: "Trazer um recurso existente para o controle do Terraform." },
        ],
        printQuestLink: "Extrair o módulo de rede do CloudShop e usá-lo em dev e staging.",
        quiz: [
          {
            question: "O que o exit code 2 de terraform plan -detailed-exitcode indica?",
            options: ["Erro de sintaxe", "Nenhuma mudança", "Há mudanças pendentes (possível drift)", "Falha de autenticação"],
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
        objectives: ["Escrever inventário e playbook", "Garantir idempotência", "Usar handlers e variáveis"],
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
        whyItMatters: "Muitas empresas ainda operam frotas de VMs; Ansible é o padrão para configurá-las com previsibilidade.",
        commonMistake: "Usar shell para tudo e perder idempotência — o playbook passa a 'mudar' algo em toda execução.",
        productionTip: "Rode sempre com --check --diff antes de aplicar em produção e mantenha ansible-lint no CI.",
        securityAlert: "Playbook com become e módulo shell recebendo variável externa é vetor de execução arbitrária.",
        interviewQuestion: "Como você garante que um playbook é idempotente?",
        glossary: [
          { term: "role", definition: "Estrutura padronizada que agrupa tasks, templates e variáveis reutilizáveis." },
          { term: "handler", definition: "Task executada apenas quando notificada por uma mudança." },
        ],
        printQuestLink: "Configurar o host de produção do CloudShop inteiramente por Ansible.",
        quiz: [
          {
            question: "Um playbook idempotente executado duas vezes deve resultar em:",
            options: ["changed sempre maior que 0", "changed=0 na segunda execução", "erro na segunda execução", "reinício de todos os serviços"],
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
        objectives: ["Encadear provisionamento e configuração", "Gerar inventário dinâmico", "Aplicar IaC pelo pipeline com aprovação"],
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
        whyItMatters: "Provisionar e configurar em um fluxo único e auditável é exatamente o que a vaga chama de automação de infraestrutura.",
        commonMistake: "Aplicar Terraform da máquina local e depois não saber quem mudou o quê.",
        productionTip: "Comente o plano no PR automaticamente: revisão de infraestrutura fica acessível a todo o time.",
        securityAlert: "Nunca dê permissão de apply a workflow disparado por PR de fork.",
        interviewQuestion: "Como você conecta a saída do Terraform à configuração feita pelo Ansible?",
        glossary: [
          { term: "inventário dinâmico", definition: "Inventário gerado consultando a API da nuvem em vez de arquivo fixo." },
          { term: "output", definition: "Valor exportado pelo Terraform para consumo por outras ferramentas." },
        ],
        printQuestLink: "Automatizar provisionamento e configuração do staging do CloudShop em um único fluxo.",
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
    ],
  },
];
