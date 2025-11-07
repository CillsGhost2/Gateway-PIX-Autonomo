# Verificador de Pagamentos PIX (Mercado Pago) com Netlify Functions

Um sistema serverless de baixo custo para automatizar a verificação de pagamentos PIX recebidos em sua conta Mercado Pago e liberar o acesso a produtos digitais de forma segura.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/drop)

> ### ⚠️ AVISO IMPORTANTE E AVISO LEGAL ⚠️
>
> Este projeto utiliza um método **NÃO OFICIAL** para monitorar transações, acessando uma API interna do Mercado Pago. Este método é, essencialmente, uma forma de scraping.
>
> 1.  **FRAGILIDADE:** O Mercado Pago pode alterar, limitar ou remover o acesso a esta API a **QUALQUER MOMENTO** e sem aviso prévio, o que fará este sistema parar de funcionar.
> 2.  **TERMOS DE SERVIÇO:** A automação de requisições desta forma pode violar os Termos de Serviço do Mercado Pago. Use este sistema por sua conta e risco. Eu (autor deste repositório) não me responsabilizo por qualquer problema, suspensão ou bloqueio em sua conta.
> 3.  **SEGURANÇA:** As credenciais utilizadas (`Cookie` e `Token`) são extremamente sensíveis. Trate-as como a senha da sua conta. **JAMAIS** as exponha em código-fonte de repositórios públicos.

---

## Como Funciona

O sistema utiliza a arquitetura "Jamstack" para criar um fluxo de verificação seguro e eficiente sem a necessidade de um servidor tradicional:

1.  **Frontend (`index.html`):** Uma página estática simples onde o cliente, após fazer o pagamento PIX, insere seu nome e o valor do produto.
2.  **Função de Verificação (`verify-payment.js`):** O frontend envia os dados para esta Netlify Function. A função, executando de forma segura no backend, usa suas credenciais para fazer uma chamada à API de atividades do Mercado Pago.
3.  **Lógica de Checagem:** A função analisa a lista de transações recentes, procurando por um PIX recebido que corresponda ao nome e valor informados pelo cliente.
4.  **Resposta Segura:** A função retorna um status de `aprovado` ou `pendente` para o frontend.
5.  **Liberação do Produto:** Se o pagamento for aprovado, o frontend gera um link que aponta para a segunda Netlify Function.
6.  **Função de Download (`download-file.js`):** Esta função atua como um "portão", lendo o arquivo do seu produto digital de uma pasta privada e transmitindo-o diretamente para o navegador do cliente, garantindo que o arquivo nunca tenha uma URL pública.

## Estrutura de Arquivos

Para que o deploy na Netlify funcione corretamente, seu projeto **DEVE** seguir esta estrutura:

```
/mp-checker
│
├── netlify/
│   │
│   ├── functions/
│   │   ├── verify-payment.js          (Função de verificação de pagamento)
│   │   ├── download-file.js           (Função de download)
│   │   └── private/
│   │       └── meu-produto-secreto.zip  (Seu produto digital vai aqui)
│
├── index.html                         (Página do usuário)
├── netlify.toml                       (Configuração do Netlify)
└── package.json                       (Dependências do projeto)
```

## Requisitos

*   Uma conta no [Netlify](https://www.netlify.com/).
*   Uma conta no [Mercado Pago](https://www.mercadopago.com.br/).
*   [Node.js](https://nodejs.org/) e npm instalados em sua máquina.
*   [Git](https://git-scm.com/) instalado.

## Tutorial de Instalação e Deploy (Ambiente Netlify)

### Passo 1: Preparar o Projeto Localmente

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/Gateway-PIX-Autonomo.git
    cd mp-checker
    ```

2.  **Instale as Dependências:**
    ```bash
    npm install
    ```

3.  **Adicione seu Produto Digital:**
    *   Navegue até a pasta `netlify/functions/private/`.
    *   Delete o arquivo `meu-produto-secreto.zip` de exemplo.
    *   Coloque o seu próprio arquivo `.zip` (ou `.pdf`, etc.) nesta pasta.
    *   **Importante:** Abra o arquivo `netlify/functions/download-file.js` e atualize a constante `FILENAME` com o nome exato do seu arquivo.

### Passo 2: Obter suas Credenciais do Mercado Pago

Esta é a etapa mais crítica. As credenciais expiram periodicamente (horas ou dias), exigindo que você repita este processo.

1.  Abra o navegador (Chrome ou Firefox), acesse o site do Mercado Pago e faça login.
2.  Navegue até a sua página de **"Atividade"**.
3.  Pressione **F12** para abrir as **Ferramentas de Desenvolvedor**.
4.  Vá para a aba **"Rede"** (ou "Network").
5.  Atualize a página (F5). Uma lista de requisições aparecerá.
6.  No campo de filtro, digite `list` para encontrar a requisição `list?page=1...`. Clique nela.
7.  Na janela que se abre, role para baixo até a seção **"Cabeçalhos da Requisição"** (Request Headers). Você precisará de duas informações:
    *   `Cookie`: Copie **TODO o valor** desta linha. É um texto extremamente longo.
    *   `x-csrf-token`: Copie o valor desta linha.
8.  **Guarde esses dois valores em um local seguro temporariamente.**

### Passo 3: Fazer o Deploy na Netlify

1.  **Crie um repositório no GitHub** e envie o código do projeto para ele.
2.  Acesse seu painel na Netlify.
3.  Clique em **"Add new site"** -> **"Import an existing project"**.
4.  Conecte ao seu provedor Git (GitHub) e selecione o repositório do projeto.
5.  A Netlify detectará o `netlify.toml` e `package.json` e configurará o build automaticamente. Antes de fazer o deploy, clique em **"Show advanced"** e depois em **"New variable"**.
6.  **Adicione as Variáveis de Ambiente:**
    *   **Chave:** `MP_COOKIE`
    *   **Valor:** Cole aqui o valor do `Cookie` que você copiou.
    *   **Chave:** `MP_CSRF_TOKEN`
    *   **Valor:** Cole aqui o valor do `x-csrf-token` que você copiou.
7.  Clique em **"Deploy site"**.

A Netlify irá construir o site e as funções. Após a conclusão, sua aplicação estará no ar e pronta para ser testada.

## Manutenção: O Que Fazer Quando Parar de Funcionar?

Eventualmente, o sistema irá falhar com um erro de "Falha de autenticação". Isso é normal e significa que suas credenciais expiraram.

Para corrigir, simplesmente repita o **Passo 2** para obter os novos valores de `Cookie` e `x-csrf-token` e atualize as variáveis de ambiente no painel da Netlify em `Project configuration > Environment variables > Add a variable`. Não é necessário fazer um novo deploy do código.

## Teste Rápido via Upload Manual

Como este projeto foi configurado com deploy manual, uma forma rápida de verificar se a lógica ainda é válida (se o Mercado Pago não mudou a API) é fazer um upload direto:

1.  Comprima a pasta inteira do projeto em um único arquivo `.zip`.
2.  No seu painel Netlify, vá para a aba "Deploys" do seu site.
3.  Arraste e solte o arquivo `.zip` na área indicada.
4.  A Netlify irá fazer o deploy do conteúdo. Adicione as variáveis de ambiente e teste.

Se funcionar, significa que a automação ainda é viável.
