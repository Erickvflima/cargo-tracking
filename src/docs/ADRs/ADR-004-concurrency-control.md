# ADR-004 — Controle de concorrência

## Contexto

A atualização de status de uma carga pode ocorrer de forma concorrente. O sistema deve impedir que uma atualização sobrescreva outra silenciosamente e garantir a consistência entre o status atual da carga e seu histórico.

A estratégia também deve evitar bloqueios desnecessários no banco, considerando a possibilidade de execução de múltiplas instâncias da aplicação.

## Decisão

Adotar **controle de concorrência otimista por versionamento**.

Cada carga possui uma versão utilizada na atualização. A operação somente é realizada quando a versão informada pela requisição corresponde à versão atual do registro. Em caso de sucesso, a versão é incrementada atomicamente.

Quando outra operação já tiver alterado a carga, a versão não corresponderá e a atualização não será realizada, retornando conflito ao cliente.

A atualização do status e a criação do respectivo histórico devem ocorrer dentro da **mesma transação**, garantindo atomicidade entre as operações.

## Alternativas consideradas

**Bloqueio pessimista:** poderia garantir exclusividade durante a operação, porém aumentaria a contenção sobre os registros e o custo de processamento do banco em cenários de concorrência.

**Atualização sem controle de concorrência:** descartada por permitir perda silenciosa de atualizações e inconsistência entre o estado da carga e seu histórico.

## Consequências

A abordagem permite **escalabilidade horizontal** sem depender de bloqueios mantidos pela aplicação e reduz a contenção no banco.

Em situações de concorrência, uma das operações poderá receber conflito e deverá ser tratada pelo cliente ou pela aplicação conforme a regra definida.

A estratégia mantém o controle de concorrência no nível dos dados, permitindo que múltiplas instâncias processem requisições simultaneamente.
