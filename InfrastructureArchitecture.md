# Infrastructure Architecture

## 1. Objetivo

Este documento descreve as decisões de infraestrutura adotadas para o sistema de rastreamento de cargas, considerando os requisitos de disponibilidade, segurança, escalabilidade, observabilidade, recuperação de dados e controle de custos.

A arquitetura foi definida buscando inicialmente uma infraestrutura de baixo custo e complexidade controlada, permitindo evolução progressiva conforme métricas reais de utilização e necessidades do negócio.

O princípio adotado é:

> **Começar simples, observável e seguro, evoluindo a infraestrutura conforme a necessidade real da aplicação.**

A infraestrutura considera dois ambientes independentes:

* Homologação (HML)
* Produção (PROD)

### 1.1 Ambiente de Desenvolvimento

As orientações para configuração, execução e utilização do ambiente de desenvolvimento local estão documentadas no `README.md` do projeto.

Este documento concentra-se principalmente na arquitetura dos ambientes de homologação e produção, bem como nas estratégias de infraestrutura, segurança, observabilidade, recuperação e evolução.

---

# 2. Visão Geral da Arquitetura

A arquitetura proposta utiliza Azure DevOps para gerenciamento do ciclo de desenvolvimento e AWS para execução da aplicação.

O Amazon ECS será responsável pelo gerenciamento e orquestração dos containers, enquanto as instâncias EC2 fornecerão a capacidade computacional utilizada pelas tasks do ECS.

```text
                         AZURE DEVOPS
                              │
                    Build / Test / Docker
                              │
                              ▼
                             ECR
                              │
                           Deploy
                              │
                              ▼
                      ┌────────────────┐
                      │      ECS       │
                      │ Task / Service │
                      └───────┬────────┘
                              │
                         ECS Tasks
                              │
                              ▼
                     ┌─────────────────┐
                     │      EC2        │
                     │ ECS Capacity    │
                     └─────────────────┘


Cliente
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
   ▼
ECS Tasks
   │
   ├──────────────► RDS SQL Server
   │
   ├──────────────► Redis / Valkey
   │
   └──────────────► S3
```

Os componentes de observabilidade, segurança, custos e recuperação atuam transversalmente sobre a arquitetura:

```text
                    ┌─────────────────────┐
                    │     CloudWatch      │
                    │ IAM / Billing       │
                    │ Backup / Recovery   │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
       Compute              Database             Storage
          │                    │                    │
         EC2                  RDS                  S3
          │
         ECS
```

---

# 3. Ambientes

Serão utilizados dois ambientes cloud independentes:

```text
HML
├── ECS
├── EC2
├── RDS SQL Server
├── Redis/Valkey
├── S3
└── CloudWatch

PROD
├── ECS
├── EC2
├── RDS SQL Server
├── Redis/Valkey
├── S3
└── CloudWatch
```

A separação evita que testes, cargas ou alterações realizadas em homologação afetem os recursos de produção.

Além disso, a utilização de recursos independentes permite obter métricas específicas de cada ambiente e avaliar o comportamento da aplicação antes de aumentar a capacidade produtiva.

---

# 4. Azure DevOps

O Azure DevOps será utilizado como plataforma central do ciclo de desenvolvimento.

Os principais recursos utilizados são:

* Backlog;
* Repositório Git;
* Pull Requests;
* Pipelines;
* gerenciamento de variáveis e secrets;
* rastreabilidade entre requisito, alteração de código e deploy.

## 4.1 Justificativa

A centralização do backlog, código e pipeline permite estabelecer rastreabilidade entre:

```text
Requisito
   ↓
Task
   ↓
Branch
   ↓
Pull Request
   ↓
Pipeline
   ↓
Build / Test
   ↓
Docker Image
   ↓
ECR
   ↓
ECS Deployment
```

Essa rastreabilidade facilita auditoria, manutenção e acompanhamento das alterações realizadas no sistema.

---

# 5. CI/CD

O pipeline será responsável por validar, empacotar e disponibilizar a aplicação para execução na AWS.

Fluxo proposto:

```text
Commit
   ↓
Pull Request
   ↓
Build
   ↓
Testes
   ↓
Docker Build
   ↓
Push para ECR
   ↓
Atualização do ECS
   ↓
ECS Deployment
   ↓
ECS Tasks
```

O pipeline deve impedir a publicação de uma versão caso as etapas obrigatórias de validação falhem.

O deploy será direcionado ao serviço correspondente do ECS, que será responsável por iniciar ou atualizar as tasks utilizando a imagem publicada no ECR.

## 5.1 Docker

A aplicação será empacotada como imagem Docker.

A imagem deve possuir uma identificação versionada, preferencialmente associada ao commit ou build:

```text
cargo-tracking:<commit>
```

ou:

```text
cargo-tracking:build-1026
```

Isso permite identificar exatamente qual versão da aplicação está executando.

---

# 6. Amazon ECR

O Amazon Elastic Container Registry será utilizado para armazenamento das imagens Docker da aplicação.

O ECR funcionará como repositório central dos artefatos de aplicação utilizados pelos ambientes AWS.

Exemplo:

```text
Azure DevOps
      │
      ▼
Docker Build
      │
      ▼
ECR
      │
      ├── versão HML
      ├── versão HML anterior
      ├── versão PROD
      └── versões anteriores
```

A retenção das imagens deverá ser configurada de acordo com a necessidade de rollback e custo de armazenamento.

As imagens versionadas também representam um mecanismo de recuperação da aplicação, permitindo realizar novamente o deploy de uma versão conhecida.

O ECR representa a disponibilidade dos artefatos da aplicação e não substitui os mecanismos de backup dos dados persistidos.

---

# 7. Container Orchestration — Amazon ECS

O Amazon Elastic Container Service será utilizado como camada de gerenciamento e orquestração dos containers da aplicação.

O ECS será responsável pelo gerenciamento do ciclo de vida das tasks e serviços da aplicação.

Entre suas responsabilidades estão:

* execução das tasks;
* gerenciamento de serviços;
* controle do número desejado de tasks;
* substituição de tasks com falha;
* integração com health checks;
* integração com o ECR;
* atualização das versões durante deployments;
* gerenciamento do estado desejado da aplicação.

Conceitualmente:

```text
ECS Service
     │
     ├── Task
     ├── Task
     └── Task
```

A quantidade de tasks poderá evoluir conforme a necessidade de carga e disponibilidade.

---

# 8. Compute — Amazon EC2

As instâncias Amazon EC2 serão utilizadas como capacidade computacional para execução das tasks do ECS.

A EC2 não será responsável pela orquestração da aplicação.

Sua responsabilidade principal será fornecer:

* CPU;
* memória;
* rede;
* armazenamento necessário para execução das workloads;
* capacidade computacional para o ECS.

A relação entre ECS e EC2 será:

```text
ECS
 │
 │ gerencia
 ▼
ECS Tasks
 │
 │ executadas sobre
 ▼
EC2
```

Dessa forma, o ECS representa a camada de orquestração, enquanto a EC2 representa a camada de compute.

A capacidade inicial será dimensionada buscando o menor custo compatível com os requisitos do sistema.

O objetivo não é realizar um provisionamento superdimensionado antes de possuir métricas reais.

A estratégia será:

```text
Baixa capacidade inicial
        ↓
Monitoramento
        ↓
Métricas reais
        ↓
Identificação de gargalos
        ↓
Aumento de capacidade
        ↓
Escalabilidade horizontal quando necessária
```

---

# 9. Escalabilidade Horizontal

Caso uma única instância não seja suficiente, a arquitetura permite evolução para múltiplas instâncias EC2.

```text
                    ALB
                     │
                     ▼
                ECS Service
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
       ECS Task              ECS Task
          │                     │
          ▼                     ▼
        EC2 #1                 EC2 #2
```

O Application Load Balancer será responsável pela distribuição das requisições.

O ECS será responsável pelo gerenciamento das tasks.

O Auto Scaling Group poderá ser utilizado para controlar a quantidade de instâncias EC2 disponíveis para execução das tasks.

Portanto:

* **ALB:** distribui o tráfego;
* **ECS:** gerencia os containers/tasks;
* **Auto Scaling Group:** gerencia a quantidade de instâncias EC2;
* **EC2:** fornece capacidade computacional.

Essa separação permite escalar horizontalmente sem transferir a responsabilidade de orquestração para as próprias instâncias.

---

# 10. Route 53

O Amazon Route 53 será utilizado para gerenciamento do DNS da aplicação.

O DNS será responsável por direcionar o domínio para a camada de entrada da aplicação.

Fluxo:

```text
Cliente
   ↓
Route 53
   ↓
CloudFront
```

A utilização de DNS desacopla o endereço utilizado pelos consumidores da infraestrutura interna.

---

# 11. CloudFront

O Amazon CloudFront será utilizado como camada de distribuição e edge da aplicação.

Fluxo:

```text
Cliente
   ↓
Route 53
   ↓
CloudFront
   ↓
ALB
   ↓
ECS
   ↓
EC2
```

Além da distribuição de conteúdo, essa camada permite uma evolução futura para utilização de recursos de cache e proteção na borda.

A necessidade de cache deve ser avaliada de acordo com o comportamento real da aplicação.

---

# 12. Application Load Balancer

O Application Load Balancer será utilizado como ponto de entrada para o serviço da aplicação.

Responsabilidades:

* distribuição de requisições;
* health checks;
* direcionamento do tráfego para targets disponíveis;
* suporte à escalabilidade horizontal;
* integração com os serviços do ECS.

O ALB não será responsável por criar novas instâncias.

Essa responsabilidade pertence ao Auto Scaling Group quando a estratégia de capacidade baseada em EC2 exigir escalabilidade horizontal.

---

# 13. Banco de Dados — Amazon RDS

O banco principal da aplicação será executado utilizando Amazon RDS for SQL Server.

A utilização do RDS reduz a necessidade de administrar manualmente tarefas de infraestrutura relacionadas ao banco, permitindo concentrar a responsabilidade da aplicação no desenvolvimento e nas regras de negócio.

A aplicação acessará o banco através da rede privada da AWS.

```text
ECS Task
   │
   │ TCP 1433
   │
   ▼
RDS SQL Server
```

O banco não deverá ser exposto diretamente à Internet.

---

# 14. Isolamento de Rede do Banco

O acesso ao RDS será controlado por Security Groups.

A regra esperada é conceitualmente:

```text
Application Security Group
          │
          │ TCP 1433
          ▼
Database Security Group
          │
          ▼
     RDS SQL Server
```

Somente os recursos autorizados da aplicação deverão possuir acesso ao banco.

O acesso administrativo ao banco deverá possuir regras específicas e controladas.

Não é necessário utilizar VPN simplesmente pelo fato de os recursos estarem na mesma conta AWS.

Quando os recursos estiverem configurados na mesma VPC e com o roteamento e Security Groups adequados, a comunicação privada pode ocorrer diretamente pela infraestrutura AWS.

---

# 15. SQL Server — Licenciamento

O Amazon RDS for SQL Server oferece opções de licenciamento que devem ser avaliadas de acordo com o ambiente e os requisitos do sistema.

Para ambientes de desenvolvimento/homologação, uma edição com menor custo pode ser utilizada quando compatível com os limites técnicos e funcionais necessários.

A escolha da edição para produção deverá considerar:

* capacidade;
* recursos necessários;
* limites da edição;
* disponibilidade;
* desempenho;
* custo;
* requisitos do negócio.

A decisão final da edição não deve ser baseada somente no custo inicial.

---

# 16. Redis / ElastiCache

O Redis será utilizado como mecanismo de cache quando houver benefício mensurável.

No ambiente AWS, a opção gerenciada será o Amazon ElastiCache para Redis/Valkey, e não o Amazon RDS.

Exemplos de utilização:

```text
Aplicação
   │
   ├── Cache de informações frequentemente consultadas
   │
   ├── Cache de integração de geolocalização
   │
   └── Dados temporários
```

O cache não será aplicado indiscriminadamente.

A estratégia será identificar pontos onde:

* existe alto número de consultas repetidas;
* os dados possuem baixa frequência de alteração;
* o custo da consulta original é relevante;
* o cache reduz latência ou carga no banco.

---

# 17. Estratégia para Geolocalização

A integração de geolocalização possui potencial para utilização de cache.

Um exemplo é armazenar temporariamente o resultado de uma consulta para determinada coordenada/endereço.

```text
Aplicação
    │
    ▼
Redis
    │
    ├── Cache encontrado
    │       ↓
    │     Retorna
    │
    └── Cache não encontrado
            ↓
        API externa
            ↓
        Redis + aplicação
```

Essa estratégia reduz chamadas repetitivas à API externa e pode diminuir latência e custo.

A definição do TTL deverá considerar a frequência de alteração dos dados e as regras da API utilizada.

---

# 18. Armazenamento Histórico — Amazon S3

O sistema possui requisito de manutenção histórica de até cinco anos.

Não necessariamente todo o histórico precisa permanecer no banco transacional com a mesma característica de acesso.

Uma estratégia possível é:

```text
Dados recentes
      ↓
RDS
      │
      │ após período definido
      ▼
Arquivamento
      ↓
     S3
```

Como estratégia inicial de estudo, considera-se manter aproximadamente dois anos no RDS e utilizar o S3 para dados históricos mais antigos.

Entretanto, essa decisão deverá ser validada com Produto considerando:

* frequência de consulta;
* necessidade de pesquisa histórica;
* SLA de recuperação;
* requisitos legais;
* requisitos de auditoria;
* volume de dados;
* custo.

O S3 será utilizado como camada de armazenamento histórico, não como substituto direto do banco transacional.

---

# 19. Backup e Recuperação

Backup será considerado uma camada obrigatória da infraestrutura.

A estratégia deve proteger principalmente os dados persistidos e permitir recuperação da aplicação para uma versão conhecida.

A recuperação será tratada em três camadas:

```text
              RECUPERAÇÃO
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
     Dados      Aplicação   Infraestrutura
       │           │           │
      RDS          ECR       IaC futuro
       │           │           │
    Backup      Imagem     Terraform
```

---

# 20. Backup do Banco

Os bancos RDS deverão possuir rotina de backup configurada.

A retenção inicial proposta é:

| Ambiente    | Retenção inicial |
| ----------- | ---------------: |
| Homologação |         1 versão |
| Produção    |        2 versões |

Esses valores representam a configuração inicial proposta e poderão ser alterados conforme os requisitos de negócio.

---

# 21. Frequência dos Backups

A frequência dos backups não será definida exclusivamente pela equipe técnica.

A definição deverá ser realizada considerando:

* RPO (Recovery Point Objective);
* RTO (Recovery Time Objective);
* volume de dados;
* impacto sobre o banco;
* janela disponível;
* necessidade de recuperação;
* custo de armazenamento.

Exemplo:

```text
Necessidade de negócio
        ↓
Definição do RPO/RTO
        ↓
Definição da frequência
        ↓
Configuração do backup
        ↓
Teste de recuperação
```

A janela de execução deve ser analisada com o time de Produto para minimizar impacto sobre o sistema.

---

# 22. Recuperação de Banco

Backup somente possui valor operacional se existir capacidade de recuperação.

Por isso, a estratégia deve contemplar testes periódicos de restauração.

O processo esperado é:

```text
Backup
  ↓
Armazenamento
  ↓
Restauração controlada
  ↓
Validação
  ↓
Confirmação da integridade
```

Os testes devem validar não apenas a existência do backup, mas a capacidade efetiva de recuperar o banco.

---

# 23. Backup e Versionamento das Imagens Docker

As imagens Docker serão armazenadas no ECR e identificadas por versões.

Exemplo:

```text
cargo-tracking:build-1024
cargo-tracking:build-1025
cargo-tracking:build-1026
```

Isso permite rollback para uma versão conhecida da aplicação.

O versionamento das imagens complementa o backup do banco:

```text
Banco
 └── Backup dos dados

Aplicação
 └── Imagem Docker versionada no ECR
```

Essa separação é importante porque o backup da aplicação e o backup dos dados possuem objetivos diferentes.

A política de retenção das imagens deverá equilibrar:

* capacidade de rollback;
* custo;
* quantidade de versões;
* frequência de deploy.

---

# 24. CloudWatch

O Amazon CloudWatch será utilizado para observabilidade da infraestrutura.

As principais métricas a serem acompanhadas incluem:

## 24.1 ECS

* quantidade de tasks;
* tasks em execução;
* tasks interrompidas;
* utilização de CPU;
* utilização de memória;
* falhas de deployment;
* health checks.

## 24.2 EC2

* CPU;
* memória, quando disponível via agente;
* utilização de disco;
* rede;
* disponibilidade da aplicação.

## 24.3 RDS

* CPU;
* memória;
* armazenamento;
* conexões;
* latência;
* I/O;
* comportamento em períodos de pico.

## 24.4 ALB

* requisições;
* latência;
* respostas HTTP;
* targets saudáveis/não saudáveis.

## 24.5 Aplicação

Logs e métricas da aplicação também deverão ser disponibilizados para investigação de erros e comportamento operacional.

---

# 25. Estratégia de Escalabilidade

A infraestrutura não será dimensionada com base apenas em estimativas teóricas.

Será adotada uma estratégia progressiva.

```text
                    ┌──────────────────────┐
                    │ Capacidade inicial   │
                    └──────────┬───────────┘
                               │
                               ▼
                         CloudWatch
                               │
                               ▼
                      Análise de métricas
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
             Capacidade                 Capacidade
              suficiente               insuficiente
                 │                           │
                 ▼                           ▼
              Mantém                 Aumenta capacidade
                                             │
                                  ┌──────────┴──────────┐
                                  ▼                     ▼
                              ECS Tasks             EC2 Capacity
                                  │                     │
                                  └──────────┬──────────┘
                                             ▼
                                      ALB + ASG
```

Essa estratégia reduz custo inicial e evita complexidade prematura.

---

# 26. Filas — Amazon SQS

O uso de filas não será obrigatório na primeira versão da arquitetura.

A aplicação possui mecanismos próprios para lidar com concorrência e, portanto, a introdução de uma fila somente por existir possibilidade de crescimento não seria suficiente para justificar a complexidade adicional.

O Amazon SQS será considerado como evolução caso as métricas demonstrem:

* picos de processamento;
* necessidade de desacoplamento;
* processamento assíncrono;
* necessidade de absorver grandes variações de carga;
* necessidade de retry independente;
* necessidade de controlar throughput.

Possível evolução:

```text
              API
               │
               ▼
             SQS
               │
       ┌───────┴───────┐
       ▼               ▼
   Worker #1        Worker #2
       │               │
       └───────┬───────┘
               ▼
              RDS
```

A adoção será baseada em métricas e requisitos reais, evitando adicionar infraestrutura sem necessidade.

---

# 27. IAM

O AWS IAM será utilizado para controle de identidade e permissões.

O princípio adotado será o de menor privilégio:

> Cada usuário, serviço ou recurso deve possuir somente as permissões necessárias para executar sua função.

As permissões deverão ser separadas por responsabilidade.

Exemplos:

```text
Developer
   ↓
Permissões necessárias para desenvolvimento

CI/CD
   ↓
Permissões necessárias para publicar no ECR
e atualizar os serviços ECS

ECS Task
   ↓
Permissões necessárias para acessar recursos AWS

Administrativo
   ↓
Permissões administrativas controladas
```

Credenciais sensíveis não devem ser armazenadas diretamente no código-fonte.

---

# 28. Secrets e Configurações

Informações sensíveis deverão ser mantidas fora do código da aplicação.

Exemplos:

* senha do banco;
* tokens;
* credenciais;
* chaves de APIs;
* secrets JWT.

O mecanismo definitivo de armazenamento poderá utilizar os serviços de gerenciamento de secrets da AWS ou integração equivalente com o pipeline, conforme o desenho final de deployment.

A aplicação deve receber essas informações através de configuração de ambiente ou mecanismo seguro equivalente.

---

# 29. Segurança de Rede

A infraestrutura deverá utilizar segmentação de rede e regras explícitas de acesso.

Conceitualmente:

```text
Internet
   │
   ▼
CloudFront
   │
   ▼
ALB
   │
   ▼
ECS
   │
   ├──────────────► Redis
   │
   └──────────────► RDS
```

O banco e os componentes internos não devem ser expostos diretamente à Internet.

As regras de Security Groups devem permitir somente as comunicações necessárias.

---

# 30. Billing e Controle de Custos

O AWS Billing and Cost Management será utilizado para acompanhamento dos custos da infraestrutura.

A estratégia de custos será baseada em observabilidade:

```text
Infraestrutura
      ↓
Consumo real
      ↓
CloudWatch / Billing
      ↓
Análise
      ↓
Otimização
```

O ambiente de homologação será utilizado também como referência para observar:

* consumo de CPU;
* memória;
* armazenamento;
* tráfego;
* comportamento do banco;
* utilização do cache.

Essas informações podem auxiliar na estimativa do dimensionamento necessário para produção.

Entretanto, produção não deverá ser dimensionada exclusivamente copiando a capacidade de homologação.

Os requisitos de carga, disponibilidade e crescimento devem ser considerados separadamente.

---

# 31. Estratégia de Custo Inicial

A arquitetura inicial busca evitar recursos superdimensionados.

A estratégia é:

1. utilizar capacidade inicial reduzida;
2. monitorar utilização;
3. identificar gargalos;
4. analisar custo;
5. aumentar recursos somente quando necessário;
6. utilizar escalabilidade horizontal quando o comportamento justificar.

Isso reduz o custo inicial sem bloquear a evolução futura da arquitetura.

---

# 32. Homologação como Ambiente de Observação

O ambiente de homologação terá papel adicional ao de validação funcional.

Ele também permitirá observar o comportamento da infraestrutura.

Exemplos de métricas:

```text
Aplicação
 ├── CPU
 ├── memória
 ├── latência
 └── erros

Banco
 ├── CPU
 ├── conexões
 ├── I/O
 └── armazenamento

Infraestrutura
 ├── rede
 ├── tráfego
 └── custo
```

Essas informações poderão ser utilizadas para melhorar as estimativas de produção.

---

# 33. Alta Disponibilidade e Evolução

A arquitetura inicial não parte de uma configuração altamente distribuída sem evidência de necessidade.

A evolução planejada é:

```text
Fase 1
ECS + capacidade EC2 inicial
   ↓
Fase 2
Monitoramento
   ↓
Fase 3
Múltiplas Tasks ECS
   ↓
Fase 4
Múltiplas EC2 + ALB
   ↓
Fase 5
Auto Scaling Group
   ↓
Fase 6
Filas / processamento assíncrono
```

Essa abordagem permite aumentar a disponibilidade e capacidade progressivamente.

---

# 34. Infraestrutura como Código

Terraform foi considerado para provisionamento da infraestrutura.

Entretanto, a adoção imediata de Infrastructure as Code não será considerada obrigatória nesta primeira etapa.

A decisão é deliberada: a infraestrutura deve ser implementada com conhecimento suficiente para que suas decisões possam ser justificadas e mantidas pela equipe.

A evolução planejada é transformar a infraestrutura validada em código posteriormente:

```text
Arquitetura validada
        ↓
Infraestrutura estabilizada
        ↓
Terraform
        ↓
Provisionamento reproduzível
        ↓
Versionamento da infraestrutura
```

A adoção futura de Terraform permitirá:

* reprodutibilidade;
* versionamento;
* revisão por Pull Request;
* redução de configuração manual;
* criação padronizada de ambientes;
* recuperação mais rápida da infraestrutura.

---

# 35. Estratégia de Recuperação

A recuperação deve considerar três componentes principais:

```text
        RECUPERAÇÃO
             │
     ┌───────┼────────┐
     ▼       ▼        ▼
   Dados   Aplicação  Infraestrutura
     │       │        │
    RDS      ECR      IaC futuro
     │       │        │
  Backup   Imagem   Terraform
```

Atualmente:

* os dados possuem backup no RDS;
* as imagens da aplicação são versionadas no ECR;
* a infraestrutura possui configuração documentada;
* Terraform é uma evolução planejada.

A transformação da infraestrutura em IaC aumentará a capacidade de reconstrução completa do ambiente.

---

# 36. Trade-offs

## 36.1 ECS + EC2 vs. gerenciamento manual dos containers

A utilização do ECS permite separar a responsabilidade de orquestração da capacidade computacional.

O ECS gerencia tasks e serviços, enquanto as instâncias EC2 fornecem os recursos computacionais necessários para execução.

Essa abordagem mantém controle sobre o custo e sobre a capacidade das instâncias, enquanto reduz a necessidade de gerenciar diretamente o ciclo de vida dos containers.

O trade-off é a existência de uma camada adicional de gerenciamento e configuração.

---

## 36.2 ECS com EC2 vs. ECS com Fargate

O ECS permite diferentes modelos de execução.

A utilização inicial de EC2 permite maior controle sobre a capacidade computacional e pode oferecer vantagens de custo em workloads previsíveis e persistentes.

Fargate poderá ser avaliado posteriormente caso a redução da responsabilidade operacional sobre as instâncias seja mais relevante do que o controle direto da capacidade.

A decisão deve considerar:

* custo;
* quantidade de workloads;
* perfil de utilização;
* disponibilidade;
* esforço operacional;
* necessidade de controle sobre a infraestrutura.

---

## 36.3 RDS vs. SQL Server administrado manualmente

RDS reduz a responsabilidade operacional sobre o banco e disponibiliza mecanismos gerenciados de backup, monitoramento e recuperação.

O trade-off é o custo e as limitações específicas da plataforma gerenciada.

---

## 36.4 Redis desde o início vs. cache sob demanda

Redis não será utilizado indiscriminadamente.

O cache será introduzido nos pontos onde as métricas demonstrarem benefício.

Isso evita adicionar uma dependência operacional sem necessidade.

---

## 36.5 SQS desde o início vs. processamento atual

SQS será tratado como evolução.

A aplicação já possui mecanismos para lidar com concorrência, portanto a fila será introduzida quando houver necessidade de desacoplamento ou absorção de carga que justifique a nova camada.

---

## 36.6 Terraform imediato vs. implementação manual controlada

Terraform oferece benefícios importantes de reprodutibilidade, mas a implementação deve ser feita com domínio suficiente da ferramenta.

Neste projeto, opta-se inicialmente por documentar a arquitetura e validar os componentes antes de transformá-los em IaC.

---

# 37. Decisões Arquiteturais

As principais decisões são:

| Área                       | Decisão                           |
| -------------------------- | --------------------------------- |
| Gestão do código           | Azure DevOps                      |
| CI/CD                      | Azure DevOps Pipelines            |
| Containerização            | Docker                            |
| Orquestração de containers | Amazon ECS                        |
| Registry                   | Amazon ECR                        |
| Compute inicial            | Amazon EC2                        |
| Balanceamento              | Application Load Balancer         |
| Escalabilidade de compute  | Auto Scaling Group como evolução  |
| DNS                        | Route 53                          |
| Edge/CDN                   | CloudFront                        |
| Banco                      | Amazon RDS SQL Server             |
| Cache                      | ElastiCache Redis/Valkey          |
| Histórico                  | Amazon S3                         |
| Observabilidade            | CloudWatch                        |
| Permissões                 | IAM                               |
| Backup                     | Rotina de backup do RDS           |
| Versionamento da aplicação | Imagens Docker versionadas no ECR |
| Filas                      | SQS como evolução                 |
| IaC                        | Terraform como evolução           |

---

# 38. Componentes Implementados x Evoluções

Para evitar confundir arquitetura proposta com infraestrutura efetivamente provisionada, as decisões são classificadas em dois grupos.

## 38.1 Infraestrutura definida para a arquitetura

* Azure DevOps;
* Docker;
* ECR;
* ECS;
* EC2;
* Route 53;
* CloudFront;
* ALB;
* RDS;
* ElastiCache;
* S3;
* CloudWatch;
* IAM;
* Billing;
* estratégia de backup.

## 38.2 Evoluções condicionadas a métricas ou maturidade

* múltiplas Tasks ECS;
* múltiplas instâncias EC2;
* Auto Scaling Group;
* SQS;
* ampliação da estratégia de cache;
* arquivamento automatizado para S3;
* Terraform;
* estratégias mais avançadas de alta disponibilidade;
* otimizações específicas de custo;
* avaliação de ECS com Fargate.

A classificação evita introduzir complexidade antes que exista uma necessidade técnica ou de negócio comprovada.

---

# 39. Considerações Finais

A arquitetura foi desenhada para permitir evolução progressiva.

O objetivo não é utilizar o maior número possível de serviços AWS, mas construir uma infraestrutura que atenda aos requisitos atuais e possua caminhos claros para crescimento.

A estratégia adotada pode ser resumida em:

```text
                    REQUISITOS
                        │
                        ▼
                 Arquitetura simples
                        │
                        ▼
                  Segurança básica
                        │
                        ▼
                   Observabilidade
                        │
                        ▼
                  Backup / Recovery
                        │
                        ▼
                   Métricas reais
                        │
                        ▼
              Escalabilidade conforme
                   necessidade
                        │
                        ▼
               Infraestrutura como código
```

As decisões de infraestrutura devem ser continuamente reavaliadas conforme o sistema obtenha dados reais de utilização, crescimento, custos e requisitos de negócio.

Dessa forma, a infraestrutura permanece alinhada ao produto, evitando tanto subdimensionamento quanto complexidade prematura.

O ambiente de desenvolvimento local permanece documentado no `README.md`, enquanto este documento estabelece as decisões e diretrizes para a infraestrutura cloud de homologação e produção.
