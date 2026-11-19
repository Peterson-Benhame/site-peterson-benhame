# Site Peterson Benhame

## Requisitos

- Node.js 20.19.x ou 22.12 ou superior
- npm

## Instalação

```bash
npm ci
```

## Desenvolvimento

```bash
npm run dev
```

## Build de produção

Configure `SITE_URL` com a origem HTTPS real, sem caminho ou barra final. Exemplo em PowerShell:

```powershell
$env:SITE_URL = 'https://SEU-DOMINIO-CONFIRMADO'
npm run build
npm run preview
```

O build publicável falha sem `SITE_URL`. Substitua o valor acima pelo domínio real antes de executar; não publique o diretório de testes `dist-test/`.

## Testes

```bash
npm test
npm run test:build
```

`test:build` usa uma origem reservada de teste e gera `dist-test/`, separado de `dist/`.

Consulte [docs/seo-blog.md](docs/seo-blog.md) para arquitetura, fluxo editorial, hospedagem, Search Console e medição.
