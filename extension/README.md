# Extensão do Chrome - perfil do LinkedIn

Lê o **seu próprio perfil**, aberto por você no navegador, e envia para o app local analisar. Não guarda senha nem cookie, não navega sozinha e só roda quando você clica.

## Instalar (modo desenvolvedor)

1. Abra `chrome://extensions` e ligue **Modo do desenvolvedor**.
2. **Carregar sem compactação** e escolha a pasta `front/extension`.
3. No app, abra a tela de análise do LinkedIn e copie o **token de pareamento**.

## Usar

1. Abra o seu perfil em `linkedin.com/in/...` e role até o fim para carregar as seções.
2. Clique na extensão e em **Ler esta página**.
3. Competências, certificações, idiomas e recomendações só aparecem completas nas páginas "Mostrar tudo": abra cada uma e clique em **Ler esta página** de novo. As leituras se acumulam.
4. Em **Conexão com o app**, informe o endereço (padrão `http://localhost:8080`) e o token, e clique em **Enviar para o app**.

## Manutenção

O LinkedIn muda o HTML sem aviso e usa classes ofuscadas, por isso `extract.js` acha as seções pelo **título** (PT, EN e ES) e pela estrutura, nunca por classe CSS. Se uma seção parar de ser lida, ajuste `HEADINGS` ou o parser da seção em `extract.js` e rode `npm test`.
