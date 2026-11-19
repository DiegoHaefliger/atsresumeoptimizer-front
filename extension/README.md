# Extensão do Chrome - perfil do LinkedIn

Lê o **seu próprio perfil**, aberto por você no navegador, e envia para o app local analisar. Não guarda senha nem cookie, não navega sozinha e só roda quando você clica.

## Instalar (modo desenvolvedor)

Na tela de LinkedIn do app, o botão **Baixar extensão** entrega o `.zip` (gerado por `npm run pack:extension`, também rodado em `dev` e `build`) com o passo a passo.

1. Abra `chrome://extensions` e ligue **Modo do desenvolvedor**.
2. **Carregar sem compactação** e escolha a pasta `front/extension`.

## Usar

### Automático (recomendado)

No app, na tela de LinkedIn, clique em **Analisar meu LinkedIn**. A extensão abre o seu perfil e as páginas "Mostrar tudo" em abas de segundo plano, lê, fecha as abas e envia sozinha. Só precisa estar com o LinkedIn logado neste navegador. Se nada mudou desde a última leitura, o app mostra a análise anterior.

Depois de atualizar a extensão (permissões novas), recarregue-a em `chrome://extensions` e recarregue a página do app.

### Manual

1. Abra o seu perfil em `linkedin.com/in/...` e role até o fim para carregar as seções.
2. Clique na extensão e em **Ler esta página**.
3. Competências, certificações, idiomas e recomendações só aparecem completas nas páginas "Mostrar tudo": abra cada uma e clique em **Ler esta página** de novo. As leituras se acumulam.
4. Clique em **Enviar para o app**. A extensão busca o token de pareamento sozinha; só mude o **Endereço do app** (padrão `http://localhost:8080`) se o backend rodar em outra porta.

## Como funciona o automático

`bridge.js` roda nas páginas do app (`localhost`) e repassa o pedido do app para `background.js`. `capture.js` abre cada página numa aba ativa (o LinkedIn só renderiza todas as seções em aba visível), devolve o foco à aba em que o usuário estava e, em cada página, `page-reader.js` espera renderizar e rola até carregar, e `extract.js` extrai. Por padrão a leitura tenta antes um iframe num documento offscreen (`frame.js`, `offscreen.js`, `frame-reader.js`, `frame-shim.js`), sem abrir aba; `chrome.storage.local.set({ hiddenFrames: false })` desliga. Capturas simultâneas são unificadas no `background.js`. O envio usa o mesmo `api.js` da leitura manual.

## Manutenção

O LinkedIn muda o HTML sem aviso e usa classes ofuscadas, por isso `extract.js` acha as seções pelo **título** (PT, EN e ES) e pela estrutura, nunca por classe CSS. Se uma seção parar de ser lida, ajuste `HEADINGS` ou o parser da seção em `extract.js` e rode `npm test`.
