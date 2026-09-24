# ADR-001 — Arquitetura da aplicação

## Contexto

A definição da arquitetura considerou a relação entre **custo, benefício, manutenção e escalabilidade**. O objetivo é manter o sistema evolutivo e reduzir o impacto de futuras alterações.

O sistema possui regras de negócio relacionadas ao ciclo de vida e rastreamento das cargas, além de integrações com banco de dados e serviços externos. Essas responsabilidades precisam permanecer desacopladas para evitar que mudanças em uma camada provoquem alterações desnecessárias nas demais.

## Decisão

Adotar os princípios de **Clean Architecture e SOLID**, buscando maior desacoplamento entre as regras de negócio e os componentes de infraestrutura.

A aplicação possui separação de responsabilidades entre:

* **Backend:** regras de negócio, validações e processamento das operações.
* **Banco de dados:** armazenamento e integridade dos dados.
* **Aplicação cliente:** consumo da API por meio de HTTP.

As principais validações de negócio são realizadas no backend. O banco também possui mecanismos de integridade como uma camada adicional de proteção.

A comunicação entre cliente e backend utiliza **API RESTful**, seguindo padronização de rotas, métodos HTTP e respostas.

## Alternativas consideradas

**Arquitetura em camadas tradicional:** poderia atender ao escopo, porém tende a aumentar o acoplamento entre regras de negócio e detalhes técnicos quando essas responsabilidades não são bem isoladas.


## Consequências

A decisão favorece **manutenção, testes e evolução**, reduzindo o impacto de alterações em componentes específicos.

Como consequência, a solução possui maior quantidade de abstrações e separação de responsabilidades em comparação a uma implementação diretamente acoplada ao framework.

A arquitetura poderá ser revisitada caso a complexidade do domínio aumente e justifique a adoção de conceitos mais aprofundados de DDD.
