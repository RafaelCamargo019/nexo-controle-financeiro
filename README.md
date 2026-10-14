# Nexo Flow

O Nexo Flow é um projeto acadêmico de Interação Homem-Máquina. A proposta é reunir movimentações, contas e planejamento financeiro em uma interface simples, com retorno visual imediato para as ações do usuário.

## Funcionalidades

- criação de conta e login local;
- painel com saldo, receitas, despesas e gráfico;
- cadastro, pesquisa, filtro e exclusão de lançamentos;
- exportação das movimentações em CSV;
- conexão demonstrativa de instituições financeiras;
- identificação do banco de origem em cada movimentação;
- remoção de uma instituição e dos dados vinculados a ela;
- planejamento por categorias;
- metas financeiras no formato de cofrinhos;
- opção para ocultar valores;
- temas claro e escuro;
- assistente financeiro com respostas calculadas a partir dos dados da conta.

## O que é real e o que é simulado

Este projeto é somente um protótipo de front-end. Por isso, algumas partes foram preparadas especificamente para a apresentação:

- **Open Finance:** o fluxo de conexão funciona visualmente, mas não acessa bancos reais. Cada instituição possui um conjunto de movimentações fictícias que é importado quando o usuário confirma a conexão.
- **Nexo IA:** as respostas são produzidas por regras em JavaScript. O assistente consulta receitas, despesas, saldo e a categoria com maior gasto, sem usar uma API externa de inteligência artificial.
- **Login e dados:** as contas são armazenadas no `localStorage` do navegador. Cada e-mail começa com o painel zerado e mantém informações separadas, mas isso não substitui autenticação e banco de dados de uma aplicação em produção.
- **Conta de demonstração:** o botão “Acessar demonstração” carrega dados prontos e inteiramente fictícios para permitir uma apresentação rápida das telas.
- **Período do gráfico:** os meses de abril a setembro de 2026 fazem parte do cenário usado no trabalho.

Nenhum dado bancário real é solicitado ou enviado pela aplicação.

## Tecnologias utilizadas

- HTML5 para a estrutura das páginas;
- CSS3 para layout, responsividade e temas;
- JavaScript para interações, cálculos e armazenamento local.

Não foi utilizado framework ou biblioteca externa no front-end.

## Como executar

O projeto pode ser aberto pelo endereço publicado no GitHub Pages:

<https://rafaelcamargo019.github.io/nexo-controle-financeiro/>

Para executar localmente, abra o arquivo `dist/index.html` no navegador. Outra opção é servir a pasta `dist` com uma extensão como Live Server.

## Organização dos arquivos

```text
dist/
├── index.html   Estrutura das telas
├── styles.css   Aparência e responsividade
└── app.js       Regras, interações e dados do protótipo
```

Os comentários no código destacam as divisões principais e as partes simuladas. Eles foram mantidos curtos para não atrapalhar a leitura.
