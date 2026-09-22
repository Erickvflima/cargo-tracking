# Supplementary ReadMe

Este documento complementa o `README.md` com informações técnicas e arquiteturais da solução de rastreamento de cargas.

O objetivo é apresentar com maior profundidade os principais fluxos, decisões de implementação, estratégia de persistência, multi-tenancy, concorrência, resiliência e pontos de evolução considerados durante o desenvolvimento.

---

# 1. Visão Geral da Solução

A aplicação foi desenvolvida utilizando NestJS e TypeScript, com SQL Server como banco de dados relacional e TypeORM como camada de persistência.

A solução foi estruturada em módulos de negócio, buscando separar responsabilidades e manter baixo acoplamento entre regras de negócio, acesso a dados e infraestrutura.

Os principais módulos são:

```text
src/
├── Auth
├── Tenant
├── Tracking
├── TrackingHistory
├── Geolocation
├── Common
├── Database
└── Config
```

O fluxo geral da aplicação pode ser representado da seguinte forma:

```text
Cliente
   │
   ▼
HTTP Request
   │
   ▼
Authentication / Authorization
   │
   ▼
Controller
   │
   ▼
Service
   │
   ├── Business Rules
   │
   ├── Tenant Resolution
   │
   └── Repository
   │
   ▼
SQL Server / Redis / External Services
```

---

# 2. Autenticação

A autenticação utiliza JWT.

Após a autenticação, o token representa o usuário autenticado e contém as informações necessárias para identificar o tenant ao qual o usuário pertence.

Fluxo simplificado:

```text
Login
  │
  ▼
User
  │
  ▼
Tenant
  │
  ▼
JWT
  │
  ├── user information
  ├── tenantId
  └── role
```

Nas requisições autenticadas, o `JwtAuthGuard` valida o token antes que a requisição alcance os módulos protegidos.

Rotas que não necessitam de autenticação podem ser explicitamente marcadas como públicas através do mecanismo de rota pública existente na aplicação.

---

# 3. Multi-Tenancy

## 3.1 Estratégia

A aplicação utiliza **schema por tenant** no SQL Server.

O schema `dbo` concentra informações globais:

```text
dbo
├── tenants
└── User
```

Cada cliente possui seu próprio schema:

```text
tenant_001
├── tracking
└── tracking_history

tenant_002
├── tracking
└── tracking_history

tenant_003
├── tracking
└── tracking_history
```

Essa estratégia proporciona isolamento lógico dos dados entre clientes.

---

## 3.2 Resolução do Tenant

O fluxo utilizado pela aplicação é:

```text
JWT
 │
 ▼
tenantId
 │
 ▼
TenantService
 │
 ▼
Tenant
 │
 ▼
schemaName
 │
 ▼
TenantRepositoryFactory
 │
 ▼
Repository da entidade
 │
 ▼
Schema do tenant
```

A aplicação não utiliza diretamente o `tenantId` para definir o schema.

O `tenantId` é utilizado para localizar o registro correspondente na tabela `dbo.tenants`.

A partir desse registro é obtido o `schemaName`.

Isso permite que a aplicação mantenha a associação entre:

```text
tenantId
    │
    ▼
dbo.tenants
    │
    ▼
schemaName
    │
    ▼
tenant_XXX
```

---

# 4. TenantRepositoryFactory

O acesso aos dados dos tenants é realizado através de uma Factory responsável por criar/obter o repository utilizando o schema correto.

Conceitualmente:

```text
TenantRepositoryFactory
        │
        ├── tenant_001 → TrackingRepository
        │
        ├── tenant_002 → TrackingRepository
        │
        └── tenant_003 → TrackingRepository
```

Essa abstração evita que as regras de negócio precisem conhecer diretamente a implementação de criação dos repositories ou a configuração específica do schema.

O mesmo conceito pode ser utilizado para outras entidades pertencentes ao tenant.

---

# 5. Banco de Dados

O banco foi estruturado em duas camadas.

## 5.1 Schema central

O schema `dbo` possui dados compartilhados entre a aplicação:

```text
dbo
├── tenants
└── User
```

A tabela `tenants` mantém informações como:

* identificação do tenant;
* nome;
* schema;
* status de ativação.

A tabela `User` mantém os usuários da aplicação e sua associação com o tenant.

---

## 5.2 Schemas dos tenants

Cada tenant possui suas próprias tabelas de negócio.

Atualmente:

```text
tenant_001
├── tracking
└── tracking_history
```

O isolamento permite que uma consulta executada em `tenant_001` não tenha acesso direto aos registros de `tenant_002`.

---

# 6. Migrations

As migrations são separadas entre o schema central e os schemas dos tenants.

Essa separação é necessária porque a estrutura do banco possui responsabilidades diferentes.

---

## 6.1 Migration do `dbo`

Primeiro devem ser executadas as migrations responsáveis pela estrutura central:

```bash
yarn migration-dbo:run
```

Essa etapa é responsável por:

* criar as tabelas do schema `dbo`;
* criar a tabela `dbo.tenants`;
* criar a tabela `dbo.User`;
* criar os schemas dos tenants definidos no seed inicial;
* popular `dbo.tenants` com os clientes iniciais.

Após essa etapa, a aplicação possui a estrutura necessária para identificar os tenants.

---

## 6.2 Migration dos tenants

Com os tenants criados, são executadas as migrations específicas:

```bash
yarn tenant:migrate --all
```

O comando consulta os tenants ativos cadastrados em `dbo.tenants` e executa as migrations individualmente em cada schema.

Exemplo:

```text
dbo.tenants
    │
    ├── tenant_001
    ├── tenant_002
    ├── tenant_003
    ├── ...
    └── tenant_010
```

Cada tenant possui seu próprio histórico de migrations.

Exemplo:

```text
tenant_001.migrations
tenant_001.tracking
tenant_001.tracking_history

tenant_002.migrations
tenant_002.tracking
tenant_002.tracking_history
```

---

## 6.3 Migration de tenant específico

Também é possível executar as migrations de somente um tenant:

```bash
yarn tenant:migrate --tenant=tenant_001
```

Isso é útil para desenvolvimento, testes e validação isolada de uma migration.

---

## 6.4 Ordem de inicialização

Para uma instalação inicial:

```bash
yarn migration-dbo:run
yarn tenant:migrate --all
```

A ordem é obrigatória porque o runner dos tenants depende dos registros existentes em `dbo.tenants`.

---

# 7. Seeds

Os seeds iniciais têm finalidade de configuração e demonstração do funcionamento da infraestrutura.

Eles são utilizados para validar:

* criação do schema central;
* criação dos tenants;
* criação dinâmica dos schemas;
* execução das migrations por tenant;
* isolamento das tabelas;
* funcionamento do mecanismo de seed;
* execução independente entre schemas.

Os dados de seed não representam uma carga real de produção.

---

# 8. Tracking

A entidade `Tracking` representa uma carga em processo de transporte.

Entre os principais dados estão:

```text
trackingCode
status
originCity
originCountry
destinationCity
destinationCountry
departureAt
estimatedDeliveryAt
currentLatitude
currentLongitude
version
```

O `trackingCode` possui restrição de unicidade.

A entidade também possui o campo `version`, utilizado para controle de concorrência otimista.

---

# 9. Atualização de Status

A atualização de status foi separada da atualização genérica do tracking.

Isso ocorre porque a alteração de status possui regras adicionais relacionadas a:

* concorrência;
* histórico;
* controle da versão;
* rastreabilidade da operação.

Fluxo:

```text
PATCH /tracking/{codigo}/status
        │
        ▼
Validação
        │
        ▼
Consulta versão atual
        │
        ▼
UPDATE ... WHERE version = X
        │
        ├── Sucesso
        │      │
        │      ├── version + 1
        │      └── cria histórico
        │
        └── Falha
               │
               ▼
         HTTP 409 Conflict
```

A operação utiliza a versão enviada pelo cliente para garantir que o registro não tenha sido alterado por outro processo desde a leitura anterior.

---

# 10. Concorrência Otimista

A estratégia utilizada é baseada em **Optimistic Concurrency Control**.

O registro possui:

```text
version = 1
```

O cliente realiza uma alteração informando:

```text
version = 1
```

A aplicação executa conceitualmente:

```sql
UPDATE tracking
SET
    status = @status,
    version = version + 1
WHERE
    tracking_code = @trackingCode
    AND version = @version;
```

Se o registro for atualizado:

```text
version 1 → version 2
```

Caso outro processo já tenha alterado o registro:

```text
version atual = 2
version enviada = 1
```

A condição não será satisfeita e nenhuma linha será atualizada.

Nesse cenário a API retorna:

```text
409 Conflict
```

Isso evita sobrescrita silenciosa de alterações concorrentes.

---

# 11. Tracking History

O histórico representa as ocorrências relacionadas a uma carga.

A relação é:

```text
Tracking
   │
   │ 1:N
   ▼
TrackingHistory
```

O histórico possui seu próprio identificador primário.

Exemplo conceitual:

```text
tracking
---------
id
tracking_code
status
...

tracking_history
----------------
id
tracking_id
status
occurred_at
latitude
longitude
observation
...
```

O histórico pertence ao mesmo schema do tracking.

---

# 12. Histórico Automático

Uma alteração de status gera automaticamente uma ocorrência no histórico.

Fluxo:

```text
Status Update
     │
     ▼
Tracking Update
     │
     ▼
TrackingHistoryService
     │
     ▼
TrackingHistory
```

A criação do histórico foi centralizada no `TrackingHistoryService`, permitindo reutilização da regra em outros pontos da aplicação.

---

# 13. Endpoints de Histórico

Foram consideradas as seguintes operações:

### Listar histórico

```http
GET /historico
```

A operação é restrita conforme as regras de autorização da aplicação.

### Adicionar ocorrência manual

```http
POST /historico/{codigoCarga}
```

Essa operação permite registrar uma ocorrência ou movimentação manual associada à carga.

---

# 14. Factory de Resposta do Histórico

A resposta do histórico utiliza uma Factory para evitar exposição desnecessária da entidade completa de tracking.

O objetivo é retornar somente os dados relevantes:

```text
id
trackingId
trackingCode
status
occurredAt
latitude
longitude
observation
createdAt
createdBy
```

Isso reduz o acoplamento entre a estrutura interna das entidades e o contrato da API.

---

# 15. Datas no SQL Server

As datas persistidas no SQL Server utilizam `datetime2`.

Essa decisão é importante porque `timestamp` no SQL Server não representa data/hora.

No SQL Server, `timestamp` é um alias histórico relacionado ao mecanismo `rowversion`.

Portanto:

```text
Data/Hora
   ↓
datetime2

Concorrência / versão
   ↓
version
```

O campo `version` da aplicação é utilizado explicitamente para controle de concorrência.

---

# 16. Geolocalização

A aplicação possui uma camada específica para geolocalização.

O objetivo é evitar que a regra de negócio fique diretamente acoplada ao fornecedor externo.

Estrutura conceitual:

```text
Tracking Service
      │
      ▼
Geolocation Service
      │
      ▼
Geolocation Provider / Adapter
      │
      ▼
External API
```

A arquitetura permite substituir o provedor sem modificar diretamente as regras de tracking.

---

# 17. Resiliência da Geolocalização

A integração foi estruturada considerando possíveis falhas de serviços externos.

Os mecanismos considerados são:

```text
Request
   │
   ▼
Cache
   │
   ├── Hit → retorna resultado
   │
   └── Miss
        │
        ▼
     Provider
        │
        ├── Success
        │
        └── Failure
             │
             ▼
          Retry
             │
             ▼
          Backoff
             │
             ▼
          Fallback
```

Esses mecanismos permitem reduzir o impacto de indisponibilidade ou lentidão do fornecedor externo.

---

# 18. Cache

O Redis é a proposta de utilização como componente de suporte para cache e mecanismos relacionados à resiliência. Hoje esta feito em memoria, via codigo, para exemplificação.

O cache pode reduzir chamadas repetitivas a serviços externos e melhorar o tempo de resposta em informações que não precisam ser consultadas novamente a cada requisição.

A estratégia de cache deve considerar:

* TTL;
* invalidação;
* consistência;
* comportamento em caso de indisponibilidade do Redis.

---

# 19. Tratamento de Erros

A aplicação utiliza tratamento padronizado de exceções.

As regras de negócio podem lançar exceções específicas, como:

```text
NotFoundException
ConflictException
BadRequestException
UnauthorizedException
ForbiddenException
```

Os erros são tratados através da camada comum da aplicação, mantendo respostas HTTP consistentes.

---

# 20. Validação

Os DTOs utilizam validação de entrada.

Entre as validações utilizadas estão:

* campos obrigatórios;
* tamanho máximo;
* formato de datas;
* latitude;
* longitude;
* valores permitidos conforme o contexto da operação.

O objetivo é impedir que dados inválidos avancem para as regras de negócio ou para a persistência.

---

# 21. Segurança

A API utiliza JWT para autenticação.

Além da autenticação, o usuário possui informações de perfil/role utilizadas para autorização.

A aplicação também utiliza isolamento por tenant como uma camada adicional de proteção dos dados.

O fluxo esperado é:

```text
Authenticated User
       │
       ▼
JWT
       │
       ├── tenantId
       └── role
             │
             ▼
       Authorization
             │
             ▼
        Tenant Data
```

---

# 22. Índices e Chaves

Os índices devem estar relacionados aos padrões reais de consulta.

O `tracking_code` possui unicidade e, consequentemente, suporte de índice adequado para buscas pelo código da carga.

Índices adicionais podem ser utilizados para consultas frequentes, como filtros por:

```text
status
estimated_delivery_at
departure_at
```

A criação de índices deve ser justificada pelo padrão de acesso, evitando adicionar índices indiscriminadamente.

Índices adicionais serão mantidos principalmente na tabela `tracking`, conforme a necessidade demonstrada pelos endpoints e consultas da aplicação.

---

# 23. Visão para BI

Como alternativa à criação de uma tabela de fatos específica para o teste, foi considerada a criação de uma **view analítica**.

A ideia é disponibilizar uma visão consolidada de informações relevantes para análise, como:

```text
Tracking
+
Tenant
+
Client information
+
Status
+
Dates
+
Location
```

Essa abordagem demonstra a possibilidade de disponibilizar dados preparados para consumo analítico sem duplicar desnecessariamente os dados operacionais.

Como os dados dos tenants estão separados por schema, uma visão consolidada entre todos os tenants exige uma estratégia adicional de reporting.

Para o cenário atual, a abordagem pode evoluir para:

```text
Operational Database
        │
        ▼
Reporting View
        │
        ▼
BI / Analytics
```

---

# 24. Testes

Os testes automatizados têm como objetivo validar principalmente regras críticas da aplicação.

Entre os cenários considerados:

* criação de tracking;
* list de tracking;

Os teste abaixos são considerados como necessarios, sendo uma priorização para o desenvolvimento em novas features.

* atualização de status;
* concorrência;
* conflito de versão;
* isolamento entre tenants;
* código de tracking único;
* validação de datas;
* criação automática do histórico;
* comportamento em falha de histórico;
* comportamento em falha de geolocalização.

Os testes de multi-tenancy são especialmente importantes porque um dos principais requisitos da arquitetura é garantir que um tenant não consiga acessar os dados de outro.

---

# 25. Observabilidade

A aplicação utiliza logs para acompanhamento de eventos relevantes durante a execução.

A arquitetura também considera o uso de ferramentas de observabilidade na infraestrutura AWS, como CloudWatch.

O fluxo esperado é:

```text
Application
    │
    ▼
Application Logs
    │
    ▼
CloudWatch
    │
    ├── Monitoring
    ├── Troubleshooting
    └── Operational Analysis
```
A ideia proposta é que seja construida tambem uma tabela de logs para monitoramento mais detalhado e simples via banco de dados, tendo rotinas de backup e de limpeza.

---

# 26. Correlation ID

Uma evolução planejada é a implementação de um **Correlation ID** por requisição.

A ideia é gerar ou receber um identificador único e propagá-lo durante o processamento:

```text
Client
  │
  │ Correlation ID
  ▼
ALB
  │
  ▼
NestJS
  │
  ├── Service
  ├── SQL Server
  ├── Redis
  └── External API
```

Isso permite relacionar diferentes eventos pertencentes à mesma requisição.

Por exemplo:

```text
Correlation ID: abc-123

Request
  ↓
TrackingService
  ↓
SQL
  ↓
Geolocation API
  ↓
Response
```

Em um ambiente distribuído, esse identificador facilita a investigação de erros e problemas de performance.

---

# 27. Idempotência

Associado ao Correlation ID, outro ponto de evolução é a implementação de **idempotência para operações críticas**.

O objetivo é impedir que uma mesma operação seja processada mais de uma vez devido a:

* retry do cliente;
* timeout;
* reenvio da requisição;
* falha de comunicação;
* processamento duplicado.

Uma abordagem possível seria utilizar uma chave de idempotência enviada pelo cliente:

```text
Idempotency-Key
        │
        ▼
API
        │
        ▼
Verifica operação anterior
        │
        ├── Já processada → retorna resultado existente
        │
        └── Não processada → executa operação
```

Essa funcionalidade não foi implementada no escopo atual e permanece como melhoria futura.

---

# 28. Auditoria e Logs Persistidos

Atualmente os logs são tratados pela camada de aplicação e pela infraestrutura de observabilidade.

Uma evolução prevista é a criação de uma tabela específica para **logs de auditoria de eventos críticos**.

O objetivo não seria substituir os logs técnicos, mas complementar a observabilidade com informações persistidas no banco.

Conceitualmente:

```text
                    Evento
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
       Application Log      Audit Log
             │                   │
             ▼                   ▼
       Observability        SQL Server
```

---

## 28.1 Informações de auditoria

Para operações críticas, o registro poderia armazenar:

* `correlationId`;
* usuário responsável;
* tenant;
* método HTTP;
* endpoint;
* headers relevantes;
* dados-chave da requisição;
* entidade afetada;
* identificador do registro;
* mensagem de erro;
* status HTTP;
* resultado da operação;
* data e hora.

Informações sensíveis não devem ser armazenadas indiscriminadamente.

Por exemplo:

* senha;
* `Authorization`;
* tokens;
* credenciais;
* dados sensíveis desnecessários.

A implementação futura deverá aplicar mascaramento ou exclusão desses campos.

---

# 29. State Machine

O status da carga é um dado crítico do domínio.

Uma evolução planejada é transformar as transições de status em uma **State Machine configurável**.

No modelo atual, as regras permanecem controladas pela aplicação.

Uma evolução possível seria:

```text
Status atual
     │
     ▼
Regras de transição
     │
     ▼
Banco de dados
     │
     ▼
Status permitido?
     │
 ┌───┴────┐
 ▼        ▼
Sim       Não
 │         │
 ▼         ▼
Update    400/409
```

A vantagem de uma configuração persistida seria permitir alterações nas transições sem necessidade de modificar o código da aplicação.

Essa evolução não foi implementada devido ao escopo e ao prazo do teste.

---

# 30. Arquitetura AWS

A arquitetura cloud utiliza **Amazon ECS com capacidade computacional baseada em EC2**.

O ECS será responsável pelo gerenciamento dos serviços e tasks, enquanto as instâncias EC2 fornecerão os recursos computacionais para execução dos containers.

```text
Internet
   │
   ▼
Route 53
   │
   ▼
CloudFront
   │
   ▼
ALB
   │
   ▼
ECS Service
   │
   ├── ECS Tasks
   │      │
   │      ▼
   │     EC2
   │
   ├──────────────► RDS SQL Server
   ├──────────────► Redis / Valkey
   ├──────────────► S3
   └──────────────► External Services
```

As imagens Docker serão armazenadas no **Amazon ECR** e disponibilizadas pelo pipeline do Azure DevOps para deployment no ECS.

A separação de responsabilidades será:

* **ECS:** gerenciamento e orquestração das tasks;
* **EC2:** capacidade computacional;
* **ALB:** distribuição do tráfego;
* **ECR:** armazenamento das imagens Docker;
* **RDS:** banco de dados;
* **Redis/Valkey:** cache;
* **S3:** armazenamento histórico.

O Docker Compose será utilizado somente no ambiente de desenvolvimento local.

A capacidade inicial de EC2 será dimensionada de forma conservadora. Conforme as métricas reais forem obtidas, a arquitetura poderá evoluir para múltiplas instâncias EC2, múltiplas tasks e Auto Scaling Group.

```text
Capacidade inicial
       ↓
Monitoramento
       ↓
Métricas reais
       ↓
Expansão de Tasks / EC2
       ↓
Auto Scaling
```

---

# 31. Ambientes

A arquitetura considera ambientes independentes:

```text
Homologação
     │
     ├── Application
     ├── Database
     └── Cache

Produção
     │
     ├── Application
     ├── Database
     └── Cache
```

A separação reduz o risco de alterações de homologação afetarem diretamente o ambiente produtivo.

---

# 32. Backup

A arquitetura considera rotinas de backup para os bancos de dados e os artefatos necessários para recuperação da aplicação.

Para o banco:

```text
HML
└── retenção inicial de 1 versão

PROD
└── retenção inicial de 2 versões
```

Os valores podem ser ajustados posteriormente conforme os requisitos reais de negócio e as políticas de retenção.

A estratégia deve ser alinhada aos objetivos de RPO e RTO definidos para o sistema.

---

# 33. RPO e RTO

Os conceitos considerados são:

### RPO — Recovery Point Objective

Determina quanto de dados pode ser perdido em um cenário de recuperação.

### RTO — Recovery Time Objective

Determina quanto tempo a aplicação pode permanecer indisponível durante a recuperação.

Esses valores devem ser definidos com o negócio e utilizados para dimensionar:

* frequência de backup;
* retenção;
* estratégia de recuperação;
* redundância;
* infraestrutura.

---

# 34. Histórico de Dados

A arquitetura considera a possibilidade de retenção de histórico por vários anos.

Uma estratégia futura poderia separar:

```text
Dados recentes
      │
      ▼
RDS SQL Server

Dados históricos
      │
      ▼
S3 / Data Lake / Storage
```

Um possível cenário inicial seria manter aproximadamente dois anos de dados operacionais no banco e posteriormente arquivar dados mais antigos.

Essa decisão deve ser baseada no volume real e nos requisitos de consulta histórica.

---

# 35. SQS

A utilização de SQS foi considerada como uma evolução futura.

Não foi adicionada à primeira versão porque o fluxo atual não exige processamento assíncrono suficiente para justificar a complexidade adicional.

Uma possível evolução seria:

```text
API
 │
 ▼
SQS
 │
 ▼
Worker
 │
 ├── Geolocation
 ├── Notifications
 └── Other asynchronous operations
```

A adoção pode ser feita posteriormente caso métricas indiquem necessidade de desacoplamento ou processamento assíncrono.

---

# 36. CI/CD

O pipeline previsto possui como principais etapas:

```text
Commit
  │
  ▼
Lint
  │
  ▼
Tests
  │
  ▼
Build
  │
  ▼
Docker Build
  │
  ▼
Push Image
  │
  ▼
Deployment
```

O objetivo é garantir que somente código validado seja transformado em uma imagem de aplicação.

O pipeline também pode incluir posteriormente:

* execução das migrations;
* health check;
* validação do container;
* rollback;
* aprovação para produção.

---

# 37. Terraform

A infraestrutura AWS foi projetada considerando os recursos necessários para uma implantação real, porém o provisionamento completo através de Terraform não foi implementado no escopo atual.

A decisão foi manter a arquitetura documentada e priorizar a implementação da aplicação e das principais regras de negócio.

Uma implementação futura poderia utilizar Terraform para provisionar:

* VPC;
* subnets;
* security groups;
* ECS;
* ALB;
* ECR;
* RDS;
* ElastiCache;
* S3;
* CloudFront;
* Route 53;
* CloudWatch;
* IAM.

---

# 38. ADRs

As principais decisões arquiteturais serão registradas através de Architecture Decision Records.

As decisões consideradas relevantes incluem:

```text
ADR-001
Arquitetura da aplicação

ADR-002
Estratégia de acesso aos dados

ADR-003
Modelo de computação

ADR-004
Controle de concorrência

ADR-005
Estratégia de Multi-Tenancy
```

O objetivo dos ADRs é registrar não apenas a decisão escolhida, mas também o contexto, alternativas consideradas e motivos para a escolha.

---

# 39. Diagramas

A documentação arquitetural será complementada pelos seguintes diagramas:

### Context Diagram

Apresenta os atores externos e a aplicação.

```text
Operator
    │
    ▼
Cargo Tracking API
    │
    ├── SQL Server
    ├── Redis
    └── Geolocation Provider
```

### Container Diagram

Apresenta os principais componentes da aplicação.

```text
Client
  │
  ▼
ALB / API
  │
  ▼
NestJS
  ├── Auth
  ├── Tenant
  ├── Tracking
  ├── TrackingHistory
  └── Geolocation
       │
       ├── SQL Server
       ├── Redis
       └── External Provider
```
---

# 40. Estrutura de Documentação

A documentação do projeto é organizada da seguinte forma:

```text
README.md
SupplementaryReadMe.md

docs/
├── architecture/
│   ├── ContextDiagram.md
│   ├── ContainerDiagram.md
│   └── ADRs/
│       ├── ADR-001-Architecture.md
│       ├── ADR-002-DataAccess.md
│       ├── ADR-003-Compute.md
│       ├── ADR-004-Concurrency.md
│       └── ADR-005-MultiTenancy.md
│
└── infrastructure/
    └── InfrastructureArchitecture.md
```

---

# 41. Decisões de Escopo

Durante o desenvolvimento, algumas funcionalidades foram conscientemente mantidas fora da implementação principal.

A decisão foi priorizar os requisitos essenciais do sistema e demonstrar as principais decisões arquiteturais sem introduzir complexidade desnecessária.

Entre os pontos mantidos como evolução estão:

* State Machine dinâmica;
* Correlation ID;
* Idempotência;
* auditoria persistida;
* integração completa de geolocalização;
* processamento assíncrono com SQS;
* Terraform;
* estratégias avançadas de arquivamento;
* evolução da camada de BI.

Esses itens foram considerados na arquitetura e documentados como possíveis evoluções.

---

# 42. Considerações Finais

A solução foi construída buscando equilíbrio entre implementação, arquitetura e capacidade de evolução.

As principais preocupações consideradas foram:

```text
Segurança
    │
    ├── JWT
    └── Tenant Isolation

Consistência
    │
    └── Optimistic Concurrency

Rastreabilidade
    │
    ├── Tracking History
    ├── Application Logs
    └── Future Audit Logs

Resiliência
    │
    ├── Cache
    ├── Retry
    ├── Backoff
    └── Fallback

Escalabilidade
    │
    ├── Containers
    ├── ECS
    ├── Redis
    └── RDS

Evolução
    │
    ├── State Machine
    ├── Idempotência
    ├── Correlation ID
    ├── SQS
    └── Terraform
```

O objetivo não foi implementar todas as possibilidades de uma plataforma de produção, mas construir uma base funcional e arquiteturalmente consistente, deixando explícitos os pontos que poderiam ser evoluídos conforme volume, requisitos de negócio, métricas operacionais e necessidade de escala.
