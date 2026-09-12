# Quatro entregas: conteúdo real, Minha Trilha, certificados em PDF e área de administração

## 1. Conteúdo das aulas mais real e prático

Revisar as aulas dos 12 módulos para que cada uma traga exemplos de verdade do dia a dia:

- Pipelines e CI/CD: arquivos completos de GitHub Actions e GitLab CI (build, testes, scan, deploy), estratégias de release, rollback.
- Contêineres: Dockerfile multi-stage, imagem enxuta, cache de camadas, registry.
- Kubernetes: Deployment, Service, Ingress, probes, HPA, limites de recursos, Helm e GitOps com Argo CD.
- Cloud e automação: Terraform (VPC, cluster, banco), políticas de acesso, observabilidade (Prometheus/Grafana), alertas e SLO.

Cada exemplo continua acompanhado de "por que importa", erro comum, dica de produção e alerta de segurança, e as três versões de idioma (português, espanhol, inglês) são regeradas para os textos alterados. Comandos, código e nomes de ferramentas permanecem no original.

## 2. Tela "Minha Trilha"

Nova página no menu principal com um plano de estudo semanal:

- Semanas montadas a partir da carga de cada módulo, distribuindo aulas, laboratórios e o exame do módulo.
- Cada semana mostra o que fazer, o tempo estimado e o que já foi concluído.
- A semana atual é destacada automaticamente conforme o progresso; itens concluídos ficam marcados e o próximo passo aparece em evidência.
- Botão "continuar de onde parei" e barra de progresso geral (semana X de Y, % concluído).
- Respeita o bloqueio por exame: semanas de módulos ainda travados aparecem como bloqueadas.

## 3. Certificados em PDF de verdade

- Certificado do módulo e certificado final gerados como arquivo PDF para download (paisagem A4), não só impressão da tela.
- Contém logo da Jornada DevOps, nome do aluno, módulo ou curso completo, nota do exame, carga horária calculada a partir das aulas e labs, data de emissão e código de verificação.
- Textos no idioma escolhido; botão "Baixar PDF" ao lado do "Imprimir".

## 4. Área de administração

- Nova página `/admin`, visível apenas para administradores.
- Permite criar e editar módulos, aulas e perguntas de exame por formulário, sem tocar no código.
- O conteúdo editado fica salvo no banco e passa a substituir o conteúdo padrão do curso na hora, para todos os alunos.
- Campos por idioma (PT/ES/EN) em título, objetivos, texto e perguntas.
- Papéis de administrador ficam em tabela própria no banco, com verificação no servidor; seu usuário é definido como o primeiro administrador.

## Detalhes técnicos

- PDF: `jspdf` no cliente, logo embutido como imagem, layout desenhado em pontos; reaproveita os dados já usados em `Certificate.tsx`.
- Minha Trilha: nova rota `src/routes/minha-trilha.tsx` + helper `src/lib/study-plan.ts` que deriva as semanas de `MODULES`, `LABS` e do progresso; nada de novo no banco.
- Admin: migração criando `app_role`, `user_roles`, função `has_role` (security definer) e tabela `content_overrides` (tipo, id da entidade, idioma, JSON do conteúdo). Leitura pública via política `TO anon` de select; escrita apenas para admin. Server functions em `src/lib/admin.functions.ts` com `requireSupabaseAuth` + verificação de papel.
- Overrides aplicados em uma camada acima de `contentText`/`contentTranslate`, carregada por React Query no root, com fallback para o conteúdo estático.
- Rota `/admin` sob o layout autenticado; redireciona quem não é admin.

## Ordem de execução

1. Migração (papéis + overrides) e área de administração.
2. Minha Trilha.
3. Certificados em PDF.
4. Revisão e ampliação do conteúdo das aulas com os exemplos reais (maior volume, feito por último e por módulo).
