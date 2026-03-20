# R3CHAT - Frontend

Aplicación React + TypeScript + Vite para R3Chat SaaS.

## Tecnologías

- **React 19** - UI Library
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Estilos
- **Zustand** - State management
- **Socket.io-client** - WebSockets
- **Axios** - HTTP client

## Estructura de Variables de Entorno

```
r3-chat/
├── .env.development    # Variables para desarrollo (commit)
├── .env.production     # Variables para producción (commit)
├── .env.example        # Template (commit)
└── .env.local          # Overrides locales (no commit)
```

## Desarrollo Local

### Prerrequisitos

- Node.js 18+
- Backend corriendo localmente (docker-r3chat)

### Iniciar

```bash
# Instalar dependencias
npm install

# Desarrollo contra backend local
cp .env.example .env.local  # Opcional: para overrides
npm run dev

# Abrir http://localhost:5173
```

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo local (modo development) |
| `npm run dev:prod` | Desarrollo contra producción |
| `npm run build` | Build para producción |
| `npm run build:prod` | Build explícito modo production |
| `npm run preview` | Preview del build local |
| `npm run lint` | Linting con ESLint |

## Variables de Entorno

### `.env.development` (Local)

```bash
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
VITE_APP_URL=http://localhost:5173
```

### `.env.production` (Deploy)

```bash
VITE_API_URL=https://api.r0lm0.dev/api
VITE_WS_URL=wss://api.r0lm0.dev
VITE_APP_URL=https://r3chat.r0lm0.dev
```

### Uso en Código

```typescript
// constants/index.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const WS_BASE_URL = import.meta.env.VITE_WS_URL;
```

## Flujo de Desarrollo con Backend Local

```bash
# Terminal 1: Backend
cd ../docker-r3chat
npm run start:local

# Terminal 2: Frontend
cd r3-chat
npm run dev

# Abrir http://localhost:5173
# El frontend se conectará automáticamente a http://localhost:3000/api
```

## Estructura de Carpetas

```
src/
├── components/         # Componentes React
│   ├── account/       # Configuración de cuenta
│   ├── auth/          # Autenticación
│   ├── chat/          # Chat y mensajes
│   ├── layout/        # Layouts
│   ├── legal/         # Legal (TOS, Privacy)
│   ├── payment/       # Pagos
│   ├── routing/       # Router
│   └── ui/            # Componentes UI base
├── constants/         # Constantes y config
├── hooks/             # Custom React hooks
├── services/          # Servicios (API, etc)
├── store/             # Zustand stores
├── types/             # TypeScript types
└── utils/             # Utilidades
```

## Build para Producción

```bash
npm run build:prod
```

El build se genera en la carpeta `dist/` lista para deploy en Vercel o similar.

## Troubleshooting

### CORS errors

Verificar que el backend tenga `CORS_ALLOW_ALL=true` en desarrollo.

### No se conecta al backend

Verificar que:
1. Docker compose está corriendo: `docker-compose ps`
2. Las URLs en `.env.development` son correctas
3. El puerto 3000 está disponible
