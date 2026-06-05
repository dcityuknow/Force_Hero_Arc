# Force Hero – SMIC Game Hub

A blockchain-powered mini-game hub built with **Next.js 14 App Router**, **Wagmi v2**, **Viem v2**, and **Tailwind CSS**.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + custom CSS vars |
| Blockchain | Wagmi v2 + Viem v2 |
| State | TanStack Query v5 |
| Chain | Base (EVM) |
| Language | TypeScript |

## Project Structure

```
force-hero/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Main route group
│   │   ├── layout.tsx            # Navbar + star background
│   │   ├── page.tsx              # Lobby
│   │   └── games/
│   │       ├── page.tsx          # All games list
│   │       ├── tugofwar/page.tsx
│   │       └── penalty/page.tsx
│   ├── api/health/route.ts
│   ├── globals.css
│   ├── layout.tsx                # Root layout (fonts, metadata)
│   └── providers.tsx             # Wagmi + QueryClient
│
├── components/
│   ├── wallet/                   # WalletConnect, TicketBalance, BuyTicketModal
│   ├── game/                     # GameCard, GameGrid
│   ├── layout/                   # Navbar, Footer
│   └── common/                   # Button, Card, Toast, StarBackground
│
├── contracts/
│   ├── abi/                      # TicketSystem.json, USDC.json
│   ├── config.ts
│   ├── ticketSystem.ts
│   └── usdc.ts
│
├── lib/
│   ├── wagmiConfig.ts
│   ├── viemClient.ts
│   ├── utils.ts
│   └── constants.ts
│
├── games/
│   ├── tugofwar/                 # components/, hooks/, types.ts, utils.ts
│   └── penalty/                  # components/, hooks/, types.ts, utils.ts
│
├── hooks/
│   ├── useWallet.ts
│   ├── useTickets.ts
│   └── useGameStats.ts
│
├── types/index.ts
└── config/site.ts
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy env and fill in values
cp .env.example .env.local

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See `.env.example` for all required vars:

```
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_TICKET_SYSTEM_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
```

## Adding a New Game

1. Create `games/yourgame/` with `components/`, `hooks/`, `types.ts`, `utils.ts`
2. Add a page at `app/(main)/games/yourgame/page.tsx`
3. Add the game entry to `config/site.ts` in the `GAMES` array
4. Add assets to `public/images/yourgame/` and `public/sounds/yourgame/`

## Smart Contracts

The ticket system lives on Base. See `contracts/` for:
- `TicketSystem.sol` — `buyTickets(uint256)`, `getTicketBalance(address)`, `spendTickets(address, uint256)`
- `USDC` — standard ERC-20 approve/transfer flow

## Deployment

```bash
npm run build
# Deploy to Vercel, Netlify, or any Next.js-compatible host
```
