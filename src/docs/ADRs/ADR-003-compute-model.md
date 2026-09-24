# ADR-003 — Modelo de Compute

## Contexto

A aplicação será executada em containers e precisa atender uma volumetria de referência de até **45.000 cargas ativas**, aproximadamente **120.000 atualizações de status por dia** e picos de **150 a 200 requisições por segundo** no portal do cliente.

A infraestrutura deve permitir **escalabilidade horizontal**, mantendo controle sobre os custos e sobre a capacidade computacional utilizada pela aplicação.

## Decisão

Adotar **Amazon ECS com EC2** como modelo de compute.

A aplicação será empacotada em imagens Docker e executada como **ECS Tasks**, gerenciadas por ECS Services sobre uma capacidade computacional baseada em EC2.

A estratégia prioriza a execução de múltiplas instâncias da aplicação e o **scale-out horizontal**, permitindo aumentar ou reduzir a quantidade de Tasks conforme a demanda.

A aplicação possui tratamento de concorrência na rota crítica, permitindo que a escalabilidade horizontal ocorra sem depender de uma única instância para controle das operações concorrentes.

## Alternativas consideradas

**ECS Fargate** — Ofereceria menor responsabilidade sobre a infraestrutura, porém foi considerado menos adequado ao objetivo de manter maior controle sobre a capacidade computacional e os custos da execução contínua.

**Lambda** — Não adotado como modelo principal devido ao perfil contínuo da API e à execução da aplicação como container NestJS.

**EKS** — Ofereceria maior flexibilidade de orquestração, porém adicionaria complexidade operacional desnecessária para o escopo atual.

## Consequências

A solução permite **escalabilidade horizontal e vertical**, maior controle sobre a capacidade computacional e melhor previsibilidade da infraestrutura.

Como consequência, existe responsabilidade adicional sobre o gerenciamento da capacidade EC2 e seus custos. A arquitetura pode evoluir para outro modelo caso a volumetria ou os requisitos operacionais justifiquem a mudança.
