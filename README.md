<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

# cargo-tracking
This project aims to create a small cargo tracking management system.


## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

----------------------------------------------------------------

## Migrations e Inicialização do Banco

O projeto utiliza migrations separadas para o schema central `dbo` e para os schemas dos tenants.

A execução deve respeitar a seguinte ordem:

### 1. Migration do `dbo`

Primeiro devem ser executadas as migrations responsáveis pela estrutura central da aplicação:

```bash
yarn migration-dbo:run
```

Essa etapa é responsável por:

* Criar as tabelas do schema `dbo`;
* Criar a tabela `dbo.tenants`;
* Criar a tabela `dbo.User`;
* Criar os schemas dos tenants definidos no seed inicial;
* Popular a tabela `dbo.tenants` com os clientes iniciais.

Após essa etapa, a estrutura central estará disponível para identificar os tenants que deverão receber as migrations específicas.

### 2. Migration dos tenants

Com os tenants criados no `dbo`, devem ser executadas as migrations dos schemas dos clientes:

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

Cada tenant possui seu próprio histórico de migrations e suas próprias tabelas.

Por exemplo:

```text
tenant_001.migrations
tenant_001.tracking

tenant_002.migrations
tenant_002.tracking

tenant_003.migrations
tenant_003.tracking
```

Isso permite que a evolução do banco dos tenants seja controlada independentemente do schema central.

### Ordem completa

Para uma instalação inicial do projeto, executar:

```bash
yarn migration-dbo:run
```

e depois:

```bash
yarn tenant:migrate --all
```

A ordem é importante porque os tenants precisam existir no `dbo.tenants` antes que o runner possa localizá-los e executar suas respectivas migrations.

### Execução para um único tenant

Também é possível executar as migrations de apenas um tenant:

```bash
yarn tenant:migrate --tenant=tenant_001
```

Isso é útil durante o desenvolvimento ou quando uma migration precisa ser validada isoladamente.

### Migrations iniciais

As migrations atualmente presentes no projeto foram inicialmente criadas como parte da configuração e validação do mecanismo de migrations e multi-tenancy.

Portanto, os dados presentes nos seeds iniciais têm finalidade de **configuração inicial e teste da infraestrutura**, servindo para validar:

* Criação do schema `dbo`;
* Criação dos tenants;
* Criação dinâmica dos schemas dos clientes;
* Execução das migrations nos diferentes tenants;
* Isolamento das tabelas entre os schemas;
* Execução de migrations e seeds de forma independente por tenant.

Esses dados iniciais não representam uma carga de produção.

### Fluxo da arquitetura

```text
                    DATABASE
                       │
                       │
                    dbo
                       │
              ┌────────┴────────┐
              │                 │
           tenants             User
              │
              │ identifica
              │ os tenants
              ▼
      ┌───────┼────────┬────────┐
      ▼       ▼        ▼        ▼
 tenant_001 tenant_002 ... tenant_010
      │         │                 │
      ▼         ▼                 ▼
  tracking  tracking          tracking
      │         │                 │
 migrations migrations       migrations
```

O `dbo` funciona como a estrutura central da aplicação, enquanto os schemas `tenant_*` armazenam os dados específicos de cada cliente.
