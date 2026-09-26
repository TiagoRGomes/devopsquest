import type { LessonDeep } from "./deep-redes-git";

/** Aprofundamento dos módulos 6 (AWS/Cloud/Segurança) e 7 (Terraform/Ansible). */
export const DEEP_CLOUD_IAC: Record<string, LessonDeep> = {
  "l-6-1": {
    body: [
      "<h3>1. Quem é quem no IAM</h3><ul><li><strong>Usuário</strong>: identidade de longa duração (evite para pessoas; prefira IAM Identity Center)</li><li><strong>Grupo</strong>: conjunto de usuários que herdam políticas</li><li><strong>Role</strong>: identidade assumida temporariamente por pessoas, serviços (EC2, Lambda) ou sistemas externos (GitHub via OIDC)</li><li><strong>Política</strong>: documento JSON que diz o que é permitido ou negado</li></ul>",
      "<h3>2. Como a AWS avalia uma requisição</h3><p>Por padrão, tudo é negado. Um <code>Allow</code> explícito libera; um <code>Deny</code> explícito vence qualquer Allow. Além das políticas da identidade, entram políticas de recurso (bucket policy), SCPs da organização e permission boundaries.</p>",
      "<h3>3. Anatomia de uma política</h3><p><code>Effect</code>, <code>Action</code> (ex.: <code>s3:GetObject</code>), <code>Resource</code> (ARN específico) e <code>Condition</code> (ex.: exigir MFA, restringir região ou tag). Menor privilégio significa ações e recursos específicos, nunca <code>\"*\"</code> sem necessidade.</p>",
      "<h3>4. Roles para serviços</h3><p>Uma EC2 ou um Pod no EKS (via IRSA/Pod Identity) recebe credenciais temporárias pela role. Nenhuma chave em arquivo, variável ou imagem.</p>",
      "<h3>5. Descobrindo o mínimo necessário</h3><p>Comece restrito, veja o erro <em>AccessDenied</em> no CloudTrail e adicione apenas a ação faltante. O IAM Access Analyzer sugere políticas a partir do uso real.</p>",
      "<h3>6. Checagem final</h3><p>Você deve escrever uma política que permite à API do CloudShop ler só o bucket de imagens e explicar por que um Deny vence um Allow.</p>",
    ],
    code: [
      {
        label: "Política de menor privilégio para a API",
        language: "json",
        code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::cloudshop-dev-images/*"
    },
    {
      "Effect": "Deny",
      "Action": "s3:*",
      "Resource": "*",
      "Condition": { "Bool": { "aws:SecureTransport": "false" } }
    }
  ]
}`,
      },
      {
        label: "Testar permissões antes de aplicar",
        language: "bash",
        code: `aws sts get-caller-identity --profile cloudshop-dev
aws iam simulate-principal-policy \\
  --policy-source-arn arn:aws:iam::123456789012:role/cloudshop-api \\
  --action-names s3:DeleteObject --resource-arns arn:aws:s3:::cloudshop-dev-images/x.png
# EvalDecision: implicitDeny  <- delete nao permitido, como esperado`,
      },
    ],
    glossary: [
      { term: "ARN", definition: "Identificador único de um recurso na AWS." },
      { term: "SCP", definition: "Service Control Policy: limite máximo de permissões aplicado a contas da organização." },
      { term: "IRSA", definition: "IAM Roles for Service Accounts: roles AWS para Pods do Kubernetes." },
      { term: "CloudTrail", definition: "Registro de auditoria de todas as chamadas de API na conta." },
    ],
    quiz: [
      { question: "Uma política dá Allow e outra dá Deny para a mesma ação. Resultado?", options: ["Allow", "Deny", "Depende da ordem", "Erro"], answerIndex: 1, explanation: "Deny explícito sempre vence." },
      { question: "Como uma EC2 deve acessar o S3?", options: ["Chave no código", "Chave em variável de ambiente", "Role anexada à instância", "Usuário root"], answerIndex: 2, explanation: "A role fornece credenciais temporárias automaticamente." },
    ],
  },
  "l-6-2": {
    body: [
      "<h3>1. VPC é a sua rede privada na nuvem</h3><p>Você escolhe o bloco (ex.: <code>10.20.0.0/16</code>) e o divide em subnets, cada uma em uma zona de disponibilidade (AZ). Espalhar por pelo menos duas AZs é o que dá resiliência a falhas de datacenter.</p>",
      "<h3>2. Subnet pública x privada</h3><p>O que torna uma subnet pública não é o nome: é a <strong>rota</strong> <code>0.0.0.0/0</code> apontando para um Internet Gateway. Subnets privadas mandam <code>0.0.0.0/0</code> para um NAT Gateway (só saída) ou não têm saída alguma.</p>",
      "<h3>3. Desenho em três camadas</h3><ul><li><strong>Pública</strong>: ALB e NAT Gateway</li><li><strong>Privada de aplicação</strong>: EC2, ECS ou nós do EKS</li><li><strong>Privada de dados</strong>: RDS e ElastiCache, sem rota para a internet</li></ul>",
      "<h3>4. Custo do NAT e VPC endpoints</h3><p>NAT Gateway cobra por hora e por GB. Tráfego para S3 e DynamoDB pode passar por <strong>gateway endpoints</strong> gratuitos; para outros serviços, interface endpoints (pagos, mas às vezes mais baratos que o NAT).</p>",
      "<h3>5. Checagem final</h3><p>Você deve desenhar a VPC do CloudShop com 2 AZs e 3 camadas e explicar por que o banco não tem rota para a internet.</p>",
    ],
    code: [
      {
        label: "Plano de endereçamento da VPC dev",
        language: "text",
        code: `VPC 10.20.0.0/16
  public-a   10.20.0.0/24    rota 0.0.0.0/0 -> igw
  public-b   10.20.1.0/24    rota 0.0.0.0/0 -> igw
  app-a      10.20.10.0/24   rota 0.0.0.0/0 -> nat-a
  app-b      10.20.11.0/24   rota 0.0.0.0/0 -> nat-a  (dev: 1 NAT para economizar)
  data-a     10.20.20.0/24   sem rota externa
  data-b     10.20.21.0/24   sem rota externa`,
      },
      {
        label: "Inspecionar rotas com a CLI",
        language: "bash",
        code: `aws ec2 describe-route-tables --filters Name=vpc-id,Values=vpc-0abc \\
  --query 'RouteTables[].{id:RouteTableId,routes:Routes[].[DestinationCidrBlock,GatewayId,NatGatewayId]}'`,
      },
    ],
    glossary: [
      { term: "AZ", definition: "Zona de disponibilidade: datacenter isolado dentro de uma região." },
      { term: "Internet Gateway", definition: "Componente que conecta a VPC à internet nos dois sentidos." },
      { term: "NAT Gateway", definition: "Permite saída para a internet a partir de subnets privadas." },
      { term: "VPC endpoint", definition: "Acesso privado a serviços AWS sem passar pela internet." },
    ],
    quiz: [
      { question: "O que torna uma subnet pública?", options: ["O nome", "Rota 0.0.0.0/0 para um Internet Gateway", "Ter IP público", "Estar na AZ a"], answerIndex: 1, explanation: "É a tabela de rotas que define." },
      { question: "Como reduzir custo de tráfego privado para o S3?", options: ["Mais NATs", "Gateway endpoint do S3", "Subnet pública", "VPN"], answerIndex: 1, explanation: "Gateway endpoints de S3 são gratuitos." },
    ],
  },
  "l-6-3": {
    body: [
      "<h3>1. Security Group é stateful</h3><p>Se a entrada foi permitida, a resposta sai automaticamente. SGs só têm regras de <strong>allow</strong> e se aplicam a interfaces de rede (instância, ALB, RDS).</p>",
      "<h3>2. Referenciar SG em vez de IP</h3><p>A regra do banco diz 'aceito 5432 vindo do SG da API'. Se a API escalar para 50 instâncias, nada muda. Essa é a forma idiomática de encadear camadas.</p>",
      "<h3>3. NACL é stateless</h3><p>Aplica-se à subnet, tem allow e deny numerados e precisa liberar também as portas efêmeras de retorno (1024–65535). Use raramente, como camada extra de bloqueio.</p>",
      "<h3>4. Acesso administrativo sem porta 22</h3><p>O AWS Systems Manager Session Manager abre shell sem SSH, sem bastion e com auditoria. Assim nenhum SG precisa de 22 aberto para a internet.</p>",
      "<h3>5. Checagem final</h3><p>Apenas o ALB aceita 443 da internet; a API aceita só do ALB; o banco só da API.</p>",
    ],
    code: [
      {
        label: "Cadeia de security groups",
        language: "text",
        code: `sg-alb  : inbound 443 de 0.0.0.0/0
sg-api  : inbound 3000 de sg-alb        <- referencia ao SG, nao IP
sg-db   : inbound 5432 de sg-api
(nenhum SG com 22 aberto; acesso via SSM Session Manager)`,
      },
      {
        label: "Encontrar exposições perigosas",
        language: "bash",
        code: `aws ec2 describe-security-groups \\
  --query "SecurityGroups[?IpPermissions[?IpRanges[?CidrIp=='0.0.0.0/0'] && (FromPort==\\\`22\\\` || FromPort==\\\`5432\\\`)]].GroupId"
aws ssm start-session --target i-0123456789abcdef0   # shell sem SSH`,
        securityNote: "Porta 22 ou de banco aberta para 0.0.0.0/0 é um dos achados mais explorados em ataques automatizados.",
      },
    ],
    glossary: [
      { term: "stateful", definition: "Lembra conexões; a resposta de um tráfego permitido é liberada automaticamente." },
      { term: "NACL", definition: "Lista de controle de acesso stateless aplicada à subnet." },
      { term: "Session Manager", definition: "Acesso a instâncias via SSM, sem SSH nem portas abertas." },
    ],
    quiz: [
      { question: "Qual a forma idiomática de liberar o banco só para a API?", options: ["IP fixo da API", "Referenciar o SG da API", "0.0.0.0/0", "NACL allow all"], answerIndex: 1, explanation: "Referência a SG acompanha o escalonamento." },
      { question: "NACL precisa liberar portas de retorno?", options: ["Não", "Sim, por ser stateless", "Só em IPv6", "Só para UDP"], answerIndex: 1, explanation: "Stateless não lembra conexões." },
    ],
  },
  "l-6-4": {
    body: [
      "<h3>1. EC2: escolher tipo e imagem</h3><p>Famílias <code>t</code> (burst, dev), <code>m</code> (geral), <code>c</code> (CPU), <code>r</code> (memória). Sufixo <code>g</code> indica Graviton (ARM), geralmente 20% mais barato. Use Launch Templates e Auto Scaling Groups em vez de instâncias soltas.</p>",
      "<h3>2. S3: armazenamento de objetos</h3><p>Bloqueie acesso público por padrão, ative criptografia e versionamento, e use lifecycle para mover dados antigos para classes mais baratas. Para servir arquivos ao público, use CloudFront com Origin Access Control.</p>",
      "<h3>3. RDS: banco gerenciado</h3><p>A AWS cuida de patches, backups e failover (Multi-AZ). Você cuida de tamanho, parâmetros, índices e de nunca deixá-lo público. Teste o restore de snapshot periodicamente.</p>",
      "<h3>4. ALB: balanceador HTTP</h3><p>Termina TLS com certificado do ACM, roteia por host/caminho para target groups e faz health check. Se o health check falhar, o alvo sai do rodízio.</p>",
      "<h3>5. CloudFront: CDN</h3><p>Cache perto do usuário para o frontend Vue e imagens; reduz latência e custo de saída.</p>",
      "<h3>6. Checagem final</h3><p>Você deve montar o caminho CloudFront → S3 (frontend) e ALB → EC2/ECS → RDS (API) e explicar a função de cada peça.</p>",
    ],
    code: [
      {
        label: "Bucket seguro por padrão",
        language: "bash",
        code: `aws s3api create-bucket --bucket cloudshop-dev-images --region us-east-1
aws s3api put-public-access-block --bucket cloudshop-dev-images \\
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws s3api put-bucket-versioning --bucket cloudshop-dev-images --versioning-configuration Status=Enabled`,
      },
      {
        label: "Verificar saúde dos alvos do ALB",
        language: "bash",
        code: `aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:...:targetgroup/cloudshop-api/abc \\
  --query 'TargetHealthDescriptions[].[Target.Id,TargetHealth.State,TargetHealth.Reason]'
# i-0aa healthy / i-0bb unhealthy Target.ResponseCodeMismatch  <- /health nao devolveu 200`,
      },
    ],
    glossary: [
      { term: "Auto Scaling Group", definition: "Grupo que mantém e ajusta o número de instâncias automaticamente." },
      { term: "Multi-AZ", definition: "Réplica em outra zona com failover automático." },
      { term: "target group", definition: "Conjunto de alvos para onde o ALB envia tráfego." },
      { term: "ACM", definition: "Serviço de certificados TLS gerenciados e renovados pela AWS." },
    ],
    quiz: [
      { question: "Como servir um bucket privado ao público com segurança?", options: ["Deixar o bucket público", "CloudFront com Origin Access Control", "Presigned URL para todos", "NAT"], answerIndex: 1, explanation: "O bucket fica privado e só o CloudFront lê." },
      { question: "Alvo unhealthy com ResponseCodeMismatch significa:", options: ["Rede fora", "O health check recebeu status diferente do esperado", "Certificado", "DNS"], answerIndex: 1, explanation: "A rota de health não devolveu o código configurado." },
    ],
  },
  "l-6-5": {
    body: [
      "<h3>1. Os vilões da conta</h3><p>NAT Gateway parado, instâncias esquecidas, volumes EBS órfãos, IPs públicos (agora cobrados), snapshots antigos, logs sem retenção e transferência entre AZs. Conheça-os antes da primeira fatura.</p>",
      "<h3>2. Tags como contrato</h3><p>Toda peça leva <code>Project</code>, <code>Environment</code>, <code>Owner</code> e <code>ManagedBy</code>. Ative-as como <em>cost allocation tags</em> para ver custo por ambiente no Cost Explorer. No Terraform, use <code>default_tags</code> no provider.</p>",
      "<h3>3. Alertas de orçamento e anomalia</h3><p>AWS Budgets avisa por valor; Cost Anomaly Detection avisa quando algo foge do padrão (ex.: um job gerando terabytes de tráfego).</p>",
      "<h3>4. Destruir é uma habilidade</h3><p>Ambientes de estudo e de PR devem ser efêmeros: <code>terraform destroy</code> ao fim do dia. Se destruir dá medo, é sinal de que a infraestrutura não está 100% em código.</p>",
      "<h3>5. Otimizações clássicas</h3><p>Graviton, Savings Plans para carga estável, Spot para carga tolerante a interrupção, rightsizing com base em métricas reais e desligar dev fora do horário.</p>",
      "<h3>6. Checagem final</h3><p>Você deve listar recursos sem tags, ver o custo por ambiente e recriar o dev do zero sem ansiedade.</p>",
    ],
    code: [
      {
        label: "Achar recursos sem tag e órfãos",
        language: "bash",
        code: `aws resourcegroupstaggingapi get-resources \\
  --query "ResourceTagMappingList[?!not_null(Tags[?Key=='Project'])].ResourceARN"
aws ec2 describe-volumes --filters Name=status,Values=available \\
  --query 'Volumes[].[VolumeId,Size]'           # volumes sem dono
aws ec2 describe-addresses --query 'Addresses[?AssociationId==null].PublicIp'   # IPs parados`,
      },
      {
        label: "Tags padrão no Terraform",
        language: "hcl",
        code: `provider "aws" {
  region = "us-east-1"
  default_tags {
    tags = {
      Project     = "cloudshop"
      Environment = var.env
      Owner       = "plataforma"
      ManagedBy   = "terraform"
    }
  }
}`,
      },
    ],
    glossary: [
      { term: "FinOps", definition: "Prática de gerir custos de nuvem com engenharia, finanças e produto juntos." },
      { term: "Spot", definition: "Capacidade ociosa com grande desconto, que pode ser interrompida." },
      { term: "rightsizing", definition: "Ajustar o tamanho do recurso ao uso real." },
    ],
    quiz: [
      { question: "Qual recurso é um vilão clássico de custo em ambiente de estudo?", options: ["IAM role", "NAT Gateway ligado", "Security group", "Tag"], answerIndex: 1, explanation: "NAT cobra por hora mesmo sem uso." },
      { question: "Para que servem cost allocation tags?", options: ["Segurança", "Ver custo agrupado por tag", "Performance", "Backup"], answerIndex: 1, explanation: "Permitem separar custo por projeto/ambiente." },
    ],
  },
  "l-7-1": {
    body: [
      "<h3>1. Declarativo, não imperativo</h3><p>Você descreve o estado desejado; o Terraform calcula a diferença e executa as chamadas de API na ordem certa, usando o grafo de dependências entre recursos.</p>",
      "<h3>2. Blocos da linguagem HCL</h3><ul><li><code>terraform</code>/<code>provider</code>: versões e configuração do provedor</li><li><code>resource</code>: algo que o Terraform cria e gerencia</li><li><code>data</code>: leitura de algo que já existe</li><li><code>variable</code>/<code>output</code>/<code>locals</code>: entradas, saídas e valores calculados</li></ul>",
      "<h3>3. O ciclo</h3><p><code>init</code> baixa providers e configura backend; <code>fmt</code> e <code>validate</code> checam; <code>plan</code> mostra o que vai mudar; <code>apply</code> executa. Leia o plan sempre: <code>-/+</code> significa destruir e recriar.</p>",
      "<h3>4. O state</h3><p>O state mapeia cada recurso do código ao ID real na nuvem. Sem ele, o Terraform não sabe o que já criou. Ele contém dados sensíveis: nunca vá para o Git.</p>",
      "<h3>5. Lock file e versões</h3><p><code>.terraform.lock.hcl</code> fixa versões exatas dos providers e deve ser commitado. Restrinja versões com <code>~&gt; 5.0</code>.</p>",
      "<h3>6. Checagem final</h3><p>Você deve ler um plan e dizer o que será criado, alterado ou recriado, e explicar por que o state é crítico.</p>",
    ],
    code: [
      {
        label: "Recurso, variável e output",
        language: "hcl",
        code: `terraform {
  required_version = ">= 1.8"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}
variable "env" { type = string }

resource "aws_s3_bucket" "images" {
  bucket = "cloudshop-\${var.env}-images"
}
output "images_bucket" { value = aws_s3_bucket.images.bucket }`,
      },
      {
        label: "Ciclo com plano salvo",
        language: "bash",
        code: `terraform init
terraform fmt -check && terraform validate
terraform plan -var env=dev -out tfplan
# Plan: 1 to add, 0 to change, 0 to destroy.
terraform apply tfplan          # aplica exatamente o que foi revisado`,
      },
    ],
    glossary: [
      { term: "provider", definition: "Plugin que traduz recursos Terraform em chamadas de API de um serviço." },
      { term: "state", definition: "Arquivo que liga recursos do código aos objetos reais." },
      { term: "data source", definition: "Bloco que lê informações existentes sem gerenciá-las." },
    ],
    quiz: [
      { question: "No plan, o que significa -/+?", options: ["Atualizar in-place", "Destruir e recriar", "Ignorar", "Importar"], answerIndex: 1, explanation: "O recurso será substituído." },
      { question: "O .terraform.lock.hcl deve ir para o Git?", options: ["Não", "Sim", "Só em produção", "Só o state"], answerIndex: 1, explanation: "Garante as mesmas versões de providers para todos." },
    ],
  },
  "l-7-2": {
    body: [
      "<h3>1. Por que backend remoto</h3><p>State local some com o notebook e impede trabalho em equipe. Backend S3 guarda o state versionado e criptografado, acessível a quem tem permissão.</p>",
      "<h3>2. Lock</h3><p>Dois applies simultâneos corrompem o state. Desde o Terraform 1.10, o backend S3 faz lock nativo com <code>use_lockfile = true</code>; antes era usada uma tabela DynamoDB.</p>",
      "<h3>3. Separando ambientes</h3><p>Prefira diretórios separados (<code>envs/dev</code>, <code>envs/prod</code>) com states e contas distintos a workspaces: o isolamento é explícito e um erro em dev não toca prod.</p>",
      "<h3>4. Lendo saídas de outro state</h3><p><code>terraform_remote_state</code> ou, melhor, parâmetros no SSM permitem que o stack da aplicação leia o ID da VPC criada pelo stack de rede.</p>",
      "<h3>5. Checagem final</h3><p>Você deve configurar backend S3 com lock e mostrar que um segundo apply simultâneo é bloqueado.</p>",
    ],
    code: [
      {
        label: "Backend S3 com lock nativo",
        language: "hcl",
        code: `terraform {
  backend "s3" {
    bucket       = "cloudshop-tfstate-123456789012"
    key          = "envs/dev/network.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true      # lock sem DynamoDB (Terraform >= 1.10)
  }
}`,
      },
      {
        label: "Estrutura por ambiente",
        language: "text",
        code: `infra/
  modules/network/   modules/app/
  envs/dev/     main.tf backend.tf dev.tfvars
  envs/staging/ main.tf backend.tf staging.tfvars
  envs/prod/    main.tf backend.tf prod.tfvars`,
      },
    ],
    glossary: [
      { term: "backend", definition: "Onde o Terraform guarda o state e faz lock." },
      { term: "state lock", definition: "Bloqueio que impede duas execuções simultâneas sobre o mesmo state." },
      { term: "workspace", definition: "Múltiplos states para a mesma configuração." },
    ],
    quiz: [
      { question: "O que acontece sem lock com dois applies ao mesmo tempo?", options: ["Nada", "Risco de corromper o state", "Fica mais rápido", "Erro de sintaxe"], answerIndex: 1, explanation: "Escritas concorrentes podem perder mudanças." },
      { question: "Forma mais segura de isolar prod?", options: ["Mesmo state", "Diretório, state e conta separados", "Só variáveis", "Branch Git"], answerIndex: 1, explanation: "Isolamento explícito reduz o raio de impacto." },
    ],
  },
  "l-7-3": {
    body: [
      "<h3>1. O que é um módulo</h3><p>Qualquer diretório com arquivos <code>.tf</code>. Um bom módulo tem interface pequena (variáveis com tipos e validação), outputs claros e um propósito só, como 'rede do CloudShop'.</p>",
      "<h3>2. Versionar módulos</h3><p>Referencie por tag Git (<code>?ref=v1.2.0</code>) ou registry. Assim prod pode ficar em v1.2 enquanto dev testa v1.3.</p>",
      "<h3>3. count e for_each</h3><p><code>for_each</code> sobre um map gera recursos com chaves estáveis; <code>count</code> usa índices, e remover um item do meio recria os seguintes. Prefira <code>for_each</code>.</p>",
      "<h3>4. Drift</h3><p>Drift é quando alguém altera a nuvem pelo console. <code>terraform plan -refresh-only</code> revela; a correção é trazer a mudança para o código ou reaplicar. Rode um plan agendado no CI que alerta quando há diferença.</p>",
      "<h3>5. Importar e mover</h3><p>Blocos <code>import</code> trazem recursos existentes para o código; blocos <code>moved</code> renomeiam sem destruir.</p>",
      "<h3>6. Checagem final</h3><p>Você deve criar um módulo de rede reutilizado por dev e prod e detectar uma mudança manual feita no console.</p>",
    ],
    code: [
      {
        label: "for_each com chaves estáveis",
        language: "hcl",
        code: `variable "subnets" {
  type = map(object({ cidr = string, az = string }))
}
resource "aws_subnet" "this" {
  for_each          = var.subnets            # chave = nome da subnet
  vpc_id            = aws_vpc.this.id
  cidr_block        = each.value.cidr
  availability_zone = each.value.az
  tags              = { Name = each.key }
}`,
      },
      {
        label: "Detectar drift e renomear sem destruir",
        language: "hcl",
        code: `# terraform plan -refresh-only -detailed-exitcode  (exit 2 = ha drift)
moved {
  from = aws_s3_bucket.imgs
  to   = aws_s3_bucket.images
}
import {
  to = aws_s3_bucket.logs
  id = "cloudshop-dev-logs"
}`,
      },
    ],
    glossary: [
      { term: "drift", definition: "Diferença entre o código/state e o que existe de fato na nuvem." },
      { term: "for_each", definition: "Meta-argumento que cria uma instância por item de um map ou set." },
      { term: "moved block", definition: "Declaração que renomeia um recurso no state sem recriá-lo." },
    ],
    quiz: [
      { question: "Por que preferir for_each a count em listas que mudam?", options: ["Mais rápido", "Chaves estáveis evitam recriações", "Obrigatório", "Menos código"], answerIndex: 1, explanation: "Com count, remover um item desloca os índices." },
      { question: "Como detectar drift sem alterar nada?", options: ["apply", "plan -refresh-only", "destroy", "init"], answerIndex: 1, explanation: "Compara state e realidade sem aplicar." },
    ],
  },
  "l-7-4": {
    body: [
      "<h3>1. Terraform cria, Ansible configura</h3><p>Terraform é ótimo para provisionar recursos de nuvem. Ansible é ótimo para configurar o que está dentro das máquinas: pacotes, arquivos, usuários, serviços. Ele se conecta por SSH (ou SSM) e não exige agente.</p>",
      "<h3>2. Inventário</h3><p>Lista de hosts e grupos, estática (INI/YAML) ou dinâmica (plugin <code>aws_ec2</code> busca instâncias por tag). Variáveis ficam em <code>group_vars</code> e <code>host_vars</code>.</p>",
      "<h3>3. Idempotência</h3><p>Módulos como <code>apt</code>, <code>copy</code>, <code>template</code> e <code>systemd</code> só mudam algo se necessário. Rodar duas vezes deve mostrar <code>changed=0</code> na segunda. Evite <code>shell</code> quando existir módulo.</p>",
      "<h3>4. Handlers e roles</h3><p>Handlers rodam só quando notificados (ex.: reiniciar Nginx após mudar config). Roles organizam tasks, templates e defaults para reuso.</p>",
      "<h3>5. Segredos com Ansible Vault</h3><p><code>ansible-vault encrypt</code> cifra arquivos de variáveis sensíveis que podem ir para o Git.</p>",
      "<h3>6. Checagem final</h3><p>Seu playbook deve instalar e configurar o Nginx e rodar a segunda vez com <code>changed=0</code>.</p>",
    ],
    code: [
      {
        label: "Playbook idempotente com handler",
        language: "yaml",
        code: `- hosts: web
  become: true
  tasks:
    - name: instalar nginx
      ansible.builtin.apt: { name: nginx, state: present, update_cache: true }
    - name: configurar site
      ansible.builtin.template:
        src: cloudshop.conf.j2
        dest: /etc/nginx/sites-enabled/cloudshop.conf
      notify: reload nginx          # so dispara se o arquivo mudou
  handlers:
    - name: reload nginx
      ansible.builtin.systemd: { name: nginx, state: reloaded }`,
      },
      {
        label: "Executar com segurança",
        language: "bash",
        code: `ansible-inventory -i aws_ec2.yml --graph           # hosts por tag
ansible-playbook -i aws_ec2.yml site.yml --check --diff   # simula
ansible-playbook -i aws_ec2.yml site.yml
# PLAY RECAP: web-1 ok=3 changed=0  <- segunda execucao, idempotente`,
      },
    ],
    glossary: [
      { term: "playbook", definition: "Arquivo YAML com a sequência de tarefas a aplicar em hosts." },
      { term: "handler", definition: "Tarefa executada apenas quando notificada por uma mudança." },
      { term: "inventário dinâmico", definition: "Lista de hosts obtida em tempo real de uma fonte como a AWS." },
    ],
    quiz: [
      { question: "O que indica changed=0 na segunda execução?", options: ["Erro", "Playbook idempotente", "Host offline", "Modo check"], answerIndex: 1, explanation: "Nada precisava mudar." },
      { question: "Quando um handler roda?", options: ["Sempre", "Quando notificado por uma task que mudou algo", "No início", "Nunca"], answerIndex: 1, explanation: "Evita reinícios desnecessários." },
    ],
  },
  "l-7-5": {
    body: [
      "<h3>1. A divisão de responsabilidades</h3><p>Terraform cria VPC, instâncias e banco e exporta outputs (IPs, IDs). Ansible usa esses dados, via inventário dinâmico por tag, para configurar os hosts. Cada ferramenta faz o que faz melhor.</p>",
      "<h3>2. Imagens prontas (golden images)</h3><p>Em vez de configurar no boot, o Packer + Ansible gera uma AMI pronta; o Terraform só a referencia. O servidor sobe mais rápido e sempre igual.</p>",
      "<h3>3. Pipeline de infraestrutura</h3><ol><li>PR: fmt, validate, tflint, checkov/trivy config, plan comentado no PR</li><li>Revisão humana do plan</li><li>Merge: apply com o plano aprovado</li><li>Ansible aplica configuração</li><li>Smoke test</li></ol>",
      "<h3>4. Segurança do pipeline de infra</h3><p>OIDC para a AWS, role de plan (somente leitura) separada da role de apply, e apply de prod apenas via environment com aprovação.</p>",
      "<h3>5. Checagem final</h3><p>Um PR de infraestrutura do CloudShop mostra o plan, passa nos scanners e, após o merge, provisiona e configura sem passos manuais.</p>",
    ],
    code: [
      {
        label: "Plan no PR com scanners",
        language: "yaml",
        code: `jobs:
  plan:
    runs-on: ubuntu-latest
    permissions: { contents: read, id-token: write, pull-requests: write }
    defaults: { run: { working-directory: infra/envs/dev } }
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - uses: aws-actions/configure-aws-credentials@v4
        with: { role-to-assume: arn:aws:iam::123456789012:role/tf-plan-readonly, aws-region: us-east-1 }
      - run: terraform init -input=false
      - run: terraform fmt -check && terraform validate
      - run: trivy config --exit-code 1 --severity HIGH,CRITICAL .
      - run: terraform plan -input=false -no-color -out tfplan | tee plan.txt`,
      },
    ],
    glossary: [
      { term: "golden image", definition: "Imagem de máquina pré-configurada e versionada." },
      { term: "Packer", definition: "Ferramenta para construir imagens de máquina de forma automatizada." },
      { term: "tflint", definition: "Linter para código Terraform." },
    ],
    quiz: [
      { question: "Por que separar role de plan e role de apply?", options: ["Custo", "Menor privilégio: plan só precisa ler", "Velocidade", "Obrigatório"], answerIndex: 1, explanation: "PRs de qualquer branch não devem poder alterar a infraestrutura." },
      { question: "Vantagem da golden image?", options: ["Mais barata", "Boot rápido e servidores idênticos", "Sem Terraform", "Sem rede"], answerIndex: 1, explanation: "A configuração já vem pronta na imagem." },
    ],
  },
};
