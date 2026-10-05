# atsresumeoptimizer-front

Frontend do [ATSResumeOptimizer](https://github.com/DiegoHaefliger/atsresumeoptimizer): interface para upload e análise de currículos contra filtros de ATS.

## Telas

Upload de currículo, currículos, vagas, preferências, configurações de IA, resultado da análise e reescrita
(diff de bullets, edição e download em PDF/DOCX).

## Stack

React + TypeScript + Vite, roteamento com react-router-dom. Sem lib de
estado — Context/hooks bastam pro tamanho atual do app.

## Como rodar

```bash
npm install
cp .env.example .env.local   # ajusta VITE_API_BASE_URL se a API não estiver em localhost:8080
npm run dev
```

Outros scripts: `npm run build` (tipos + build) e `npm run lint`.

Precisa do backend (`atsresumeoptimizer-backend`) rodando com CORS
liberado pra origem do Vite (`app.cors.allowed-origins`).

## Contrato de API

Tipos TypeScript do contrato (`src/api/generated/schema.ts`) são gerados a
partir do OpenAPI exposto pelo backend (`/v3/api-docs`), nunca escritos à mão.

Pra regerar depois de qualquer mudança de contrato no backend (com o backend
rodando local em `VITE_API_BASE_URL`, padrão `http://localhost:8080`):

```bash
npm run gen:api
```

O arquivo gerado é versionado no repositório (o build do front não depende
de um backend no ar).


## Licença

[PolyForm Noncommercial 1.0.0](LICENSE). Uso, estudo e modificação livres para fins não comerciais. Vender,
revender ou embutir em produto ou serviço pago não é permitido.
