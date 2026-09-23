# Cargo Tracking API

API REST para gerenciamento e rastreamento de cargas, desenvolvida como parte do teste técnico para Desenvolvedor Back-end Sênior.

A solução foi construída com foco em **organização arquitetural, isolamento de dados por cliente, segurança, concorrência, rastreabilidade e capacidade de evolução**.

---

## 1. Tecnologias

### Backend

* **Node.js**
* **NestJS**
* **TypeScript**
* **TypeORM**
* **SQL Server**
* **JWT**
* **Jest**
* **Swagger/OpenAPI**

### Infraestrutura e suporte

* **Docker / Docker Compose**
* **Redis**
* **AWS** — arquitetura proposta
* **ECR**
* **ECS**
* **ALB**
* **RDS**
* **ElastiCache / Redis ou Valkey**
* **S3**
* **CloudWatch**
* **Route 53**
* **CloudFront**

---

## 2. Principais características

A aplicação possui:

* API REST para gerenciamento de cargas;
* autenticação baseada em JWT;
* autorização baseada em perfil;
* arquitetura multi-tenant;
* isolamento dos dados dos clientes por schema;
* controle de concorrência otimista;
* histórico de alterações de status;
* validação dos dados de entrada;
* tratamento padronizado de erros;
* integração preparada para geolocalização;
* mecanismos de cache, retry e fallback;
* migrations independentes para o banco central e tenants;
* testes automatizados;
* documentação através de Swagger;
* arquitetura preparada para execução em containers na AWS.

---

## 3. Arquitetura Multi-Tenant

A aplicação utiliza uma estratégia de **schema por tenant**.

O schema `dbo` concentra as informações globais da aplicação, enquanto cada cliente possui seu próprio schema.

```text
SQL Server
│
├── dbo
│   ├── tenants
│   └── User
│
├── tenant_001
│   ├── tracking
│   └── tracking_history
│
├── tenant_002
│   ├── tracking
│   └── tracking_history
│
└── ...
```

O tenant é identificado durante o processo de autenticação e utilizado para determinar em qual schema os dados devem ser acessados.

Fluxo simplificado:

```text
Request
   │
   ▼
JWT
   │
   ▼
tenantId
   │
   ▼
TenantService
   │
   ▼
schemaName
   │
   ▼
TenantRepositoryFactory
   │
   ▼
Schema do Tenant
```

Essa abordagem mantém os dados de cada cliente isolados e permite que a evolução das estruturas dos tenants seja controlada individualmente.

---

## 4. Estrutura da aplicação

A aplicação está organizada em módulos, seguindo a separação de responsabilidades do NestJS.

```text
src/
├── auth/
├── tenant/
├── tracking/
├── tracking-history/
├── geolocation/
├── common/
├── database/
└── config/
```

A aplicação utiliza abstrações de acesso a dados para evitar que as regras de negócio dependam diretamente da implementação específica do banco.

---

## 5. Tracking

O módulo de tracking é responsável pelo gerenciamento das cargas.

Entre as informações armazenadas estão:

* código da carga;
* status;
* origem;
* destino;
* data de partida;
* previsão de entrega;
* localização atual;
* versão do registro para controle de concorrência.

---

## 6. Atualização de Status e Concorrência

A alteração de status utiliza **concorrência otimista** através do campo `version`.

A atualização somente é realizada quando a versão enviada pelo cliente ainda corresponde à versão atual do registro.

```text
Cliente
   │
   │ status + version
   ▼
API
   │
   ▼
UPDATE ... WHERE version = X
   │
   ├── Atualizado
   │      └── version + 1
   │
   └── Nenhum registro atualizado
          └── HTTP 409 Conflict
```

Após uma alteração de status, uma ocorrência correspondente é registrada no histórico da carga.

Essa estratégia evita que uma atualização feita por um usuário sobrescreva silenciosamente uma alteração realizada por outro usuário.

---

## 7. Histórico

O módulo `TrackingHistory` mantém o histórico das ocorrências relacionadas às cargas.

O histórico permite registrar informações como:

* carga relacionada;
* status;
* data da ocorrência;
* localização;
* observação;
* usuário responsável pela operação.

A relação entre `tracking` e `tracking_history` é mantida dentro do schema específico do tenant.

---

## 8. Geolocalização

A aplicação possui uma estrutura preparada para integração com provedores externos de geolocalização.

A arquitetura considera mecanismos como:

* adapter/provider;
* timeout;
* retry;
* backoff;
* cache;
* fallback;
* logs e métricas.

A integração pode evoluir posteriormente para diferentes provedores sem acoplar a regra de negócio diretamente à API externa.

---

## 9. Banco de Dados e Migrations

As migrations são separadas entre o schema central e os schemas dos tenants.

### Schema central

```bash
yarn migration-dbo:run
```

### Todos os tenants

```bash
yarn tenant:migrate --all
```

### Tenant específico

```bash
yarn tenant:migrate --tenant=tenant_001
```

Para uma instalação inicial, a ordem deve ser:

```bash
yarn migration-dbo:run
yarn tenant:migrate --all
```

O primeiro comando cria a estrutura central e os tenants iniciais. O segundo executa as migrations específicas em cada schema.

Mais detalhes sobre migrations, seeds e inicialização estão disponíveis em:

`SupplementaryReadMe.md`

---

## 10. Execução local

### Pré-requisitos

* Node.js
* Yarn
* Docker
* Docker Compose

### Instalação

Clone o projeto e instale as dependências:

```bash
yarn install
```

Suba os serviços necessários:

```bash
docker compose up -d
```

Configure as variáveis de ambiente conforme o arquivo de exemplo do projeto.

Execute as migrations:

```bash
yarn migration-dbo:run
yarn tenant:migrate --all
```

Inicie a aplicação em desenvolvimento:

```bash
yarn start:dev
```

---

## 11. Swagger

Após iniciar a aplicação, a documentação da API pode ser acessada através do Swagger.

```text
/api-docs
```

O Swagger permite visualizar os endpoints, parâmetros, DTOs e mecanismos de autenticação disponíveis.

---

## 12. Testes

Os testes automatizados podem ser executados através dos scripts definidos no projeto.

Exemplo:

```bash
yarn test
```

Os testes abrangem principalmente regras relacionadas a:

* tracking;

Ficando como ponto de melhoria inserir os teste para:

* atualização de status;
* concorrência;
* isolamento entre tenants;
* validações;
* histórico;
* integrações externas.

---

## 13. Arquitetura AWS

A arquitetura de produção foi projetada considerando execução baseada em containers:

```text
                    Route 53
                       │
                       ▼
                   CloudFront
                       │
                       ▼
                      ALB
                       │
                       ▼
                 ECS / Containers
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       RDS SQL      Redis/Valkey     S3
          │
          ▼
      SQL Server

             CloudWatch
          Observabilidade
```

A proposta considera ambientes independentes de **Homologação** e **Produção**, com recursos dimensionados inicialmente para baixo custo e possibilidade de evolução conforme métricas reais de utilização.

A documentação detalhada da arquitetura de infraestrutura está disponível em:

`InfrastructureArchitecture.md`

---

## 14. CI/CD

O pipeline de CI/CD está sendo estruturado para automatizar as principais etapas de validação e construção da aplicação.

Fluxo previsto:

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
Container Registry
```

A estratégia de deploy e os detalhes do pipeline serão documentados separadamente.

---

## 15. Documentação

A documentação do projeto está dividida em diferentes níveis.

### README.md

Visão geral, tecnologias e instruções para execução.

### SupplementaryReadMe.md

Detalhamento dos fluxos da aplicação, banco de dados, segurança, concorrência, histórico, testes e decisões técnicas.

### InfrastructureArchitecture.md

Arquitetura de infraestrutura e proposta de execução na AWS.

### Architecture / ADRs

Documentação das principais decisões arquiteturais através de diagramas e Architecture Decision Records.

---

## 16. Melhorias futuras

Alguns pontos foram mantidos fora do escopo atual para preservar o foco da implementação, mas foram considerados na arquitetura.

### State Machine dinâmica

Implementar uma máquina de estados configurável através do banco de dados, permitindo que as transições válidas de status sejam alteradas sem modificar o código da aplicação.

### Correlation ID

Adicionar um identificador único para cada requisição, permitindo acompanhar o fluxo da operação entre API, banco, cache e integrações externas.

### Idempotência

Implementar mecanismos de idempotência para operações críticas, evitando processamento duplicado em situações de retry, timeout ou reenvio da mesma requisição.

### Auditoria e logs persistidos

Criar uma tabela específica para persistência de logs de operações críticas, complementando os logs de aplicação e ferramentas de observabilidade.

Esses registros poderiam armazenar informações como:

* correlation ID;
* usuário;
* tenant;
* método HTTP;
* endpoint;
* headers relevantes;
* dados-chave da operação;
* registro afetado;
* mensagem de erro;
* status HTTP;
* data/hora da operação.

Dados sensíveis, como tokens de autenticação e senhas, não devem ser persistidos.

### Geolocalização completa

Evoluir a integração para um provedor externo real, utilizando os mecanismos de resiliência já previstos na arquitetura.

### Infraestrutura como código

A utilização de Terraform pode ser adicionada posteriormente para automatizar o provisionamento dos recursos AWS.

---

## 17. Decisões de escopo

O projeto prioriza a demonstração das principais decisões técnicas e dos requisitos funcionais do desafio.

Algumas funcionalidades foram conscientemente mantidas como evolução futura para evitar aumento desnecessário da complexidade da implementação, mantendo a solução funcional, testável e coerente com o prazo proposto.

As decisões e justificativas detalhadas estão documentadas nos arquivos complementares.

---

## 18. Resumo

O projeto foi desenvolvido com foco em uma API de rastreamento de cargas preparada para múltiplos clientes, utilizando isolamento por schema, autenticação JWT, controle de concorrência otimista, histórico de alterações e arquitetura preparada para evolução em infraestrutura cloud.

A implementação prioriza **separação de responsabilidades, isolamento de dados, resiliência e capacidade de evolução**, mantendo a complexidade compatível com o escopo do teste técnico.

## Uso de Inteligência Artificial

Durante o desenvolvimento deste projeto foi utilizado o **OpenAI ChatGPT** como ferramenta de apoio à produtividade e otimização do processo de desenvolvimento.

A IA foi utilizada principalmente para auxiliar em atividades como:

* elaboração e revisão de partes verbosas da documentação;
* apoio na criação e revisão de testes;
* identificação de possíveis melhorias e inconsistências;
* auxílio em tarefas repetitivas durante o desenvolvimento.

As **decisões de arquitetura, padrões de desenvolvimento, modelagem, organização da aplicação, regras de negócio, estratégias de segurança e infraestrutura** foram definidas e validadas de forma independente pelo desenvolvedor, considerando os requisitos do projeto e os critérios técnicos adotados.

A utilização da IA teve como objetivo **acelerar e apoiar o desenvolvimento**, mantendo a responsabilidade técnica, validação e decisão final sob responsabilidade do desenvolvedor.
