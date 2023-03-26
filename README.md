# Katido

_Gamified translation system_

## Requirements

- libreoffice
- unoserver
- translate-toolkit (odf2xliff and xliff2odf)
- redis
- postgresql

## Development

Install packages:

```bash
npm i
```

Initialize PostgreSQL (also create .env.local according to .env):

```bash
psql -U katido -d katido --file ./prisma/schema.sql
```

Generate Prisma client:

```bash
npm run prisma:generate
```

Run unoserver:

```bash
python3 -m unoserver.server
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
