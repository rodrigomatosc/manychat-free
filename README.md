# ManyChat próprio 📩

Comentou a palavra-chave no seu post → recebe uma DM automática. Grátis, sem mensalidade.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frodrigomatosc%2Fmanychat-free&project-name=manychat-proprio&repository-name=manychat-proprio&env=IG_ACCESS_TOKEN,VERIFY_TOKEN,KEYWORD,DM_MESSAGE&envDescription=Token%20do%20Instagram%2C%20senha%20do%20webhook%2C%20palavra-chave%20e%20mensagem%20da%20DM&envLink=https%3A%2F%2Fgithub.com%2FSEU-USUARIO%2Fmanychat-proprio%23variáveis)

## Antes de clicar no botão

Você precisa de:

1. Instagram **Profissional** (Business ou Criador).
2. Um **app na Meta** com o produto Instagram e um **token de acesso**.
   [Guia oficial](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/get-started)
3. Conta no **GitHub** e na **Vercel** (entre na Vercel usando o GitHub).

## Como instalar (5 minutos)

1. Clique no botão **Deploy** acima.
2. Entre com o GitHub. A Vercel cria uma cópia deste projeto na sua conta.
3. Preencha as variáveis (veja a tabela abaixo) e clique em **Deploy**.
4. Copie a URL do projeto e acrescente `/api/webhook` no final:
   `https://manychat-proprio-xxxx.vercel.app/api/webhook`
5. No app da Meta, vá em **Instagram > Webhooks**:
   - Cole a URL acima em **Callback URL**.
   - Cole o mesmo `VERIFY_TOKEN` em **Verify token**.
   - Clique em **Verificar e salvar**.
   - Assine os eventos **comments** e **messages**.
6. Teste: com outra conta (testadora do app), comente a palavra-chave num post.

## Variáveis

| Nome | O que é | Exemplo |
| --- | --- | --- |
| `IG_ACCESS_TOKEN` | Token gerado no app da Meta | `IGAA...` |
| `VERIFY_TOKEN` | Senha que você inventa (a mesma vai na Meta) | `minhasenha123` |
| `KEYWORD` | Palavra-chave; várias separadas por vírgula | `QUERO,LINK` |
| `DM_MESSAGE` | Texto da DM | `Oi! Aqui está o link: https://...` |
| `PUBLIC_REPLY` | *(opcional)* Resposta pública no comentário | `Te mandei no direct!` |
| `GRAPH_VERSION` | *(opcional)* Versão da API | `v23.0` |

Para mudar depois: Vercel > seu projeto > **Settings > Environment Variables**, edite e clique em **Redeploy**.

## Deu problema?

- **A Meta não verifica o webhook** → o `VERIFY_TOKEN` está diferente nos dois lados.
- **Não chega a DM** → veja os erros em Vercel > projeto > **Logs**.
- **Só funciona com algumas contas** → o app está em modo desenvolvimento; adicione a conta como testadora.
- **Parou do nada** → o token expirou (dura ~60 dias). Gere outro e atualize na Vercel.

## Como funciona

```
Comentário no Instagram → Meta → /api/webhook (Vercel) → API do Instagram → DM
```

Todo o código está em [`api/webhook.js`](api/webhook.js).
