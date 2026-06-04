**force-hero-arc**


**structure**
```
force-hero/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Group route chính (không ảnh hưởng URL)
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Trang Lobby chính
│   │   └── games/
│   │       ├── page.tsx          # Danh sách tất cả game
│   │       ├── tugofwar/
│   │       │   └── page.tsx
│   │       └── penalty/
│   │           └── page.tsx
│   ├── api/                      # API routes (nếu cần server actions)
│   ├── globals.css
│   └── layout.tsx
│
├── components/                   # Các component tái sử dụng
│   ├── ui/                       # Shadcn/ui components
│   ├── wallet/                   # Wallet connect, balance, ticket
│   │   ├── WalletConnect.tsx
│   │   ├── TicketBalance.tsx
│   │   └── BuyTicketModal.tsx
│   ├── game/                     # Component chung cho game
│   ├── layout/                   # Navbar, Footer, Sidebar
│   └── common/                   # Button, Card, Toast...
│
├── contracts/                    # Tương tác blockchain
│   ├── abi/
│   │   ├── TicketSystem.json
│   │   └── USDC.json
│   ├── config.ts                 # Contract addresses + chain
│   ├── ticketSystem.ts           # Functions: buyTickets, getTickets...
│   └── usdc.ts
│
├── lib/                          # Utilities
│   ├── viemClient.ts             # Public + Wallet client
│   ├── wagmiConfig.ts            # Wagmi configuration
│   ├── utils.ts
│   └── constants.ts
│
├── games/                        # Logic & assets của từng game
│   ├── tugofwar/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── penalty/
│   └── ...                       # Dễ thêm game mới
│
├── hooks/                        # Custom React hooks
│   ├── useTickets.ts
│   ├── useWallet.ts
│   └── useGameStats.ts
│
├── public/                       # Static assets (ảnh, icon, sound, video...)
│   ├── images/
│   │   ├── common/               # Ảnh chung toàn app (logo, banner, avatar default, bg lobby...)
│   │   ├── games/                # Ảnh thumbnail, banner chung của các game
│   │   │   ├── thumbnails/
│   │   │   └── banners/
│   │   └── placeholders/         # Ảnh tạm (loading, empty state...)
│   │
│   ├── games/                    # ← Assets riêng theo từng game (Khuyến nghị mạnh)
│   │   ├── tugofwar/
│   │   │   ├── backgrounds/
│   │   │   ├── characters/
│   │   │   ├── items/
│   │   │   ├── ui/               # Button, icon, panel riêng của game
│   │   │   ├── thumbnails/
│   │   │   └── animations/       # (nếu có gif, sprite sheet)
│   │   │
│   │   ├── penalty/
│   │   │   ├── backgrounds/
│   │   │   ├── characters/
│   │   │   ├── items/
│   │   │   └── ui/
│   │   │
│   │   └── common/               # Assets chung giữa các game
│   │
│   ├── icons/                    # Icon SVG hoặc PNG nhỏ
│   │   ├── common/
│   │   ├── wallet/
│   │   └── game/
│   │
│   ├── sounds/                   # Âm thanh
│   │   ├── common/
│   │   ├── tugofwar/
│   │   └── penalty/
│   │
│   └── videos/                   # (tùy chọn) Video intro, tutorial...
│
├── types/                        # TypeScript global types
│   └── index.ts
│
├── config/                       # Config chung
│   └── site.ts
│
├── .env.example
├── .env.local                    # (không commit)
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```
