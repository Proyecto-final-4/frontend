# Finance App — Frontend

App de finanzas personales. Este proyecto Next.js actúa como BFF (Backend For Frontend):
orquesta las llamadas a la API Java y gestiona toda la lógica de IA con LangChain/LangGraph.

---

## Stack

| Capa                    | Tecnología                      |
| ----------------------- | ------------------------------- |
| Framework               | Next.js 16 (App Router)         |
| UI                      | React 19 + Tailwind v4 + Shadcn |
| Lenguaje                | TypeScript 5                    |
| IA / Orquestación       | LangChain + LangGraph           |
| Backend                 | API Java (Spring Boot 4, JWT)   |
| Base de datos vectorial | pgvector vía el backend Java    |

---

## Requisitos funcionales

### Autenticación

- Registro de usuarios (nombre, email, contraseña)
- Login con JWT — el token se gestiona en el BFF (Next.js API routes)
- Perfil de usuario: ver y actualizar nombre y contraseña

### Transacciones

- Listar con filtros: tipo (INCOME / EXPENSE), categoría, rango de fechas, paginación
- Crear, editar y eliminar transacciones
- Ver detalle de una transacción

### Categorías

- Listar categorías del sistema y del usuario
- Crear, editar y eliminar categorías propias
- Jerarquía: una categoría puede tener una categoría padre

### Resumen financiero

- Balance, ingresos totales y gastos totales por período
- Desglose por categoría

### Presupuestos _(backend pendiente)_

- Crear presupuesto por categoría y período (DAILY / WEEKLY / MONTHLY)
- Ver estado: gasto actual vs límite

### Metas de ahorro _(backend pendiente)_

- Crear y gestionar metas con monto objetivo y fecha límite
- Marcar como completadas

### IA — Búsqueda RAG _(base lista, implementación futura)_

- Búsqueda semántica en el historial de transacciones
- Agentes LangGraph para análisis financiero conversacional

---

## API Java — Endpoints

Base URL (server-side): `BACKEND_JAVA_ENDPOINT` (env var)

### Health

| Método | Ruta      | Auth |
| ------ | --------- | ---- |
| GET    | `/health` | No   |

### Auth

| Método | Ruta             | Body                        | Respuesta                    |
| ------ | ---------------- | --------------------------- | ---------------------------- |
| POST   | `/auth/register` | `{ name, email, password }` | `{ token, id, name, email }` |
| POST   | `/auth/login`    | `{ email, password }`       | `{ token, id, name, email }` |

### Usuarios

| Método | Ruta        | Notas                                       |
| ------ | ----------- | ------------------------------------------- |
| GET    | `/users/me` | JWT requerido                               |
| PUT    | `/users/me` | `{ name?, currentPassword?, newPassword? }` |

### Categorías

| Método | Ruta               | Notas                                      |
| ------ | ------------------ | ------------------------------------------ |
| GET    | `/categories`      | Sistema + usuario                          |
| POST   | `/categories`      | `{ name, type, color?, icon?, parentId? }` |
| PUT    | `/categories/{id}` | Mismo body que POST                        |
| DELETE | `/categories/{id}` | Solo las del usuario                       |

`type`: `INCOME` \| `EXPENSE` \| `BOTH`

### Transacciones

| Método | Ruta                 | Query params                                                               |
| ------ | -------------------- | -------------------------------------------------------------------------- |
| GET    | `/transactions`      | `type?`, `categoryId?`, `from?`, `to?`, `page?` (0-idx), `size?` (def. 20) |
| GET    | `/transactions/{id}` | —                                                                          |
| POST   | `/transactions`      | `{ categoryId, amount, type, transactionDate, description, notes? }`       |
| PUT    | `/transactions/{id}` | Mismo body que POST                                                        |
| DELETE | `/transactions/{id}` | —                                                                          |

`type`: `INCOME` \| `EXPENSE` — fechas en `YYYY-MM-DD`

### Resumen

| Método | Ruta       | Query params                |
| ------ | ---------- | --------------------------- |
| GET    | `/summary` | `from?`, `to?` (YYYY-MM-DD) |

### RAG

| Método | Ruta          | Body                               |
| ------ | ------------- | ---------------------------------- |
| POST   | `/rag/search` | `{ query: string, limit: number }` |

Respuesta RAG: `Array<{ id, description, notes, amount, type, transactionDate, categoryName }>`

### Presupuestos _(pendiente en backend)_

| Método | Ruta                   |
| ------ | ---------------------- |
| GET    | `/budgets`             |
| POST   | `/budgets`             |
| PUT    | `/budgets/{id}`        |
| DELETE | `/budgets/{id}`        |
| GET    | `/budgets/{id}/status` |

### Metas de ahorro _(pendiente en backend)_

| Método | Ruta          |
| ------ | ------------- |
| GET    | `/goals`      |
| POST   | `/goals`      |
| PUT    | `/goals/{id}` |
| DELETE | `/goals/{id}` |

---

## Entidades del backend (tipos espejo en `types/`)

```
User         → id, email, name, createdAt, updatedAt
Category     → id, name, type, color, icon, isSystem, parentId, userId
Transaction  → id, categoryId, amount, type, transactionDate, description, notes
Budget       → id, categoryId, amountLimit, period, startDate, endDate, isActive
SavingsGoal  → id, name, description, targetAmount, currentAmount, targetDate, isCompleted
```

---

## Estructura de carpetas

```
frontend/
├── app/
│   ├── (auth)/               # Rutas sin autenticación
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/          # Rutas protegidas
│   │   ├── transactions/
│   │   ├── categories/
│   │   ├── budgets/
│   │   ├── goals/
│   │   └── ai/
│   └── api/                  # BFF: orquestación y AI
│       ├── auth/{login,register}/
│       ├── users/me/
│       ├── transactions/
│       ├── categories/
│       ├── budgets/
│       ├── goals/
│       ├── summary/
│       ├── rag/
│       └── ai/chat/
│
├── components/
│   ├── ui/                   # Shadcn (auto-generado, no editar manualmente)
│   ├── layout/               # Header, Sidebar, Nav, shell de la app
│   ├── features/             # Componentes por dominio
│   │   ├── transactions/
│   │   ├── categories/
│   │   ├── budgets/
│   │   ├── goals/
│   │   └── ai/
│   └── shared/               # Componentes genéricos reutilizables
│
├── hooks/                    # Custom React hooks
├── lib/                      # Shadcn utils (lib/utils.ts) + helpers
├── sdk/                      # Cliente HTTP para la API Java (1 archivo por dominio)
├── shared/
│   ├── constants/            # Constantes globales (rutas, enums, etc.)
│   └── utils/                # Funciones utilitarias transversales
├── types/                    # Tipos TypeScript espejo del backend
└── workflows/
    ├── agents/               # Agentes LangGraph
    └── tools/                # Tools/funciones para los agentes
```

### Regla de consistencia por dominio

Cada dominio sigue el mismo patrón en todas las capas:

```
types/transaction.ts              ← tipo base
sdk/transactions.ts               ← llamadas a la API Java
hooks/use-transactions.ts         ← estado y lógica React
components/features/transactions/ ← componentes visuales
app/(dashboard)/transactions/     ← página
app/api/transactions/             ← API route BFF
```

---

## Variables de entorno

```env
BACKEND_JAVA_ENDPOINT=   # URL de la API Java (server-side only)
OPENAI_API_KEY=          # Para LangChain/LangGraph (server-side only)
```
