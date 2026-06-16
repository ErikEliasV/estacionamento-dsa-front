# Smart Parking — Frontend (Next.js + Tailwind)

Interface web do sistema de estacionamento inteligente. Consome a API REST do
backend Spring Boot (`Estacionamento_backend`) e apresenta:

- Painel de estatísticas (total, ocupadas, livres, taxa de ocupação, fila).
- Mapa visual de vagas (in-order da BST) com botão de liberar vaga.
- Fila de espera (Min-Heap) com badges de prioridade.
- Formulários de entrada e saída de veículos.
- Reset do estado para apresentação.
- Indicador de conexão e auto-refresh a cada 4 segundos.

## Stack
- Next.js 14 (App Router) + React 18
- TypeScript estrito
- Tailwind CSS 3 com tema customizado

## Como rodar

1. Suba o backend (porta 8080):
   ```bash
   cd ../Estacionamento_backend
   mvn spring-boot:run
   ```

2. Instale dependências e inicie o frontend (porta 3000):
   ```bash
   npm install
   npm run dev
   ```

3. Acesse `http://localhost:3000`.

## Variáveis de ambiente

`.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Aponte para outra origem caso queira consumir um backend remoto.

## Build de produção

```bash
npm run build
npm start
```
