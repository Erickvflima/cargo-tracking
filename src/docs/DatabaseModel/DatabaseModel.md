# Database Model

## Visão geral

O banco utiliza **multi-tenancy baseada em schemas**, separando as informações centrais da aplicação dos dados operacionais de cada cliente.

A estrutura é dividida entre o schema **`dbo`**, responsável pelo controle dos tenants e usuários, e os schemas individuais de cada tenant, responsáveis pelos dados operacionais.

## Chaves e relacionamentos

As entidades possuem **chaves primárias (PK)** para identificação única dos registros. As **chaves estrangeiras (FK)** são utilizadas quando existe relacionamento referencial entre entidades dentro do mesmo contexto de dados.

No schema `dbo`:

* `tenants` possui sua PK como identificador único do tenant.
* `User` possui sua PK própria e uma FK `tenantId` referenciando `tenants`.
* A cardinalidade entre `tenants` e `User` é **1:N**: um tenant pode possuir vários usuários, enquanto cada usuário pertence a um único tenant.

Nos schemas dos tenants:

* `tracking` possui uma PK própria para identificação da carga.
* A tabela de histórico possui sua própria PK e uma FK referenciando a carga em `tracking`.
* A cardinalidade entre carga e histórico é **1:N**: uma carga pode possuir vários registros históricos, enquanto cada registro de histórico pertence a uma única carga.

## Isolamento entre tenants

O relacionamento entre `dbo.tenants` e o schema físico do tenant não é representado por uma FK tradicional.

O campo `schema_name` funciona como referência lógica para identificar o schema correspondente:

```text
dbo.tenants
    │
    │ schema_name
    ▼
tenant_001
    │
    ├── tracking
    └── tracking_history
```

Assim, o isolamento dos dados é realizado pelo próprio schema, enquanto as relações entre as entidades operacionais são mantidas através de PKs e FKs.

## Cardinalidades

| Relacionamento       | Cardinalidade |
| -------------------- | ------------- |
| Tenant → User        | 1:N           |
| Tracking → Histórico | 1:N           |

As cardinalidades e os detalhes das PKs, FKs e atributos estão representados visualmente nos **DERs anexados ao projeto**.
