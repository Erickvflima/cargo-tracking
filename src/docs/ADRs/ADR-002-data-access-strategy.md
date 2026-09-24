# ADR-002 — Estratégia de acesso aos dados

## Contexto

O sistema utiliza SQL Server como banco obrigatório e possui isolamento de dados por schema para os tenants. A aplicação precisa acessar diferentes schemas mantendo uma estrutura consistente de repositórios e sem espalhar SQL pela camada de negócio.

## Decisão

Adotar **TypeORM como ORM**, utilizando Repository Pattern e uma `TenantRepositoryFactory` para resolver o repositório correspondente ao schema do tenant autenticado.

As operações de persistência ficam isoladas da camada de negócio, permitindo que os serviços trabalhem com repositórios sem conhecer detalhes da conexão ou do schema físico.

## Alternativas consideradas

**SQL puro** — Foi descartado como estratégia principal por aumentar o acoplamento entre regra de negócio e banco, além de exigir maior controle manual das consultas.

**Acesso direto ao DataSource** — Foi descartado como padrão por facilitar o espalhamento de detalhes de infraestrutura pelos serviços.

## Consequências

A abordagem mantém o acesso a dados padronizado e facilita o isolamento entre tenants.

Como consequência, a resolução dinâmica dos schemas adiciona complexidade à infraestrutura de persistência. Consultas específicas e otimizações de banco podem utilizar SQL quando justificadas, sem substituir o padrão principal.