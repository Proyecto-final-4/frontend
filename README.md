<div align="center">

<img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/LangGraph%20SDK-1.x-3b82f6?style=for-the-badge" />
<img src="https://img.shields.io/badge/Vercel-deploy-000000?style=for-the-badge&logo=vercel&logoColor=white" />

# FinanzIA — Frontend

**Interfaz conversacional · BFF · Orquestación de IA**

_Donde el usuario vive la experiencia. Donde la seguridad empieza._

</div>

---

## Responsabilidad

Este repositorio tiene dos roles simultáneos e inseparables:

### Interfaz de usuario

La experiencia conversacional que el usuario ve y usa. Chat-first, diseño premium "The Intelligent Curator", autenticación completa con registro y recuperación de contraseña.

### BFF (Backend For Frontend)

Una capa de servidor implementada como API Routes de Next.js que gestiona el JWT del usuario, encripta credenciales con RSA antes de enviarlas al backend Java, y actúa como proxy seguro entre el navegador y los servicios backend.

Ninguna clave de API, token de autenticación ni endpoint del backend llega al navegador del usuario final.

---

## Stack tecnológico

| Capa                   | Tecnología                             | Versión |
| ---------------------- | -------------------------------------- | ------- |
| Framework              | Next.js App Router                     | 16.x    |
| UI                     | React                                  | 19      |
| Lenguaje               | TypeScript strict mode                 | 5       |
| Estilos                | Tailwind CSS                           | v4      |
| Componentes UI         | Shadcn UI + Base UI                    | —       |
| Validación formularios | Zod                                    | 4.x     |
| Animaciones            | Framer Motion                          | 12.x    |
| SDK agente IA          | `@langchain/langgraph-sdk`             | 1.x     |
| Renderizado markdown   | `react-markdown`                       | 10.x    |
| Testing                | Vitest + Testing Library               | —       |
| Calidad de código      | ESLint · Prettier · Husky · commitlint | —       |
| Despliegue             | Vercel                                 | —       |

---

## Inicio rápido

### Prerrequisitos

- Node.js 22+
- npm
- Backend Java corriendo localmente

Repositorio backend:

```text
https://github.com/Proyecto-final-4/backend
```

### Configuración local

```bash
# 1. Clonar el repositorio
git clone https://github.com/Proyecto-final-4/frontend.git
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# Editar .env.local:
# BACKEND_JAVA_ENDPOINT=http://localhost:8080
# OPENAI_API_KEY=sk-...

# 4. Iniciar servidor de desarrollo
npm run dev
```

La aplicación queda disponible en:

```text
http://localhost:3000
```

---

## Scripts disponibles

| Comando                | Descripción                                           |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo con hot reload                 |
| `npm run build`        | Build producción con verificación TypeScript completa |
| `npm run start`        | Servidor producción                                   |
| `npm run lint`         | ESLint — debe salir con 0 errores                     |
| `npm run format`       | Prettier — auto-formatea archivos                     |
| `npm run format:check` | Verifica formato sin modificar                        |
| `npm run test`         | Vitest modo CI                                        |
| `npm run test:watch`   | Vitest modo watch                                     |
| `npm run validate:env` | Verifica variables requeridas                         |

---

## Estructura del proyecto

```text
frontend/
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   ├── (dashboard)/
│   │   ├── transactions/
│   │   ├── categories/
│   │   ├── budgets/
│   │   ├── goals/
│   │   └── ai/
│   │
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   ├── forgot-password/route.ts
│       │   └── reset-password/route.ts
│       ├── users/me/route.ts
│       ├── transactions/route.ts
│       ├── categories/route.ts
│       ├── summary/route.ts
│       ├── rag/route.ts
│       └── ai/chat/route.ts
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── features/
│   │   ├── auth/
│   │   ├── transactions/
│   │   ├── categories/
│   │   ├── budgets/
│   │   ├── goals/
│   │   └── ai/
│   └── shared/
│
├── hooks/
│   ├── use-auth.ts
│   ├── use-transactions.ts
│   ├── use-categories.ts
│   └── ...
│
├── sdk/
│   ├── auth.ts
│   ├── transactions.ts
│   ├── categories.ts
│   ├── summary.ts
│   └── rag.ts
│
├── types/
│   ├── auth.ts
│   ├── transaction.ts
│   ├── category.ts
│   ├── budget.ts
│   └── savings-goal.ts
│
├── shared/
│   ├── constants/
│   └── utils/
│
└── workflows/
    ├── agents/
    └── tools/
```

---

## Patrón de consistencia por dominio

Cada dominio sigue exactamente la misma cadena de capas:

```text
types/transaction.ts
         ↓
sdk/transactions.ts
         ↓
hooks/use-transactions.ts
         ↓
components/features/transactions/
         ↓
app/(dashboard)/transactions/
         ↓
app/api/transactions/route.ts
```

Este patrón se aplica a:

- `auth`
- `transactions`
- `categories`
- `budgets`
- `goals`

---

## Rol del BFF y flujo de seguridad

El BFF es crítico para la postura de seguridad del sistema. El navegador nunca recibe ni gestiona directamente:

- JWT del usuario autenticado
- Clave de OpenAI
- Endpoint del backend Java
- Claves RSA

Todo vive exclusivamente en el servidor de Next.js gracias al patrón de API Routes.

---

## Flujo de registro con RSA

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant BFF as BFF (Next.js)
    participant Backend as Backend Java

    Browser->>BFF: POST /api/auth/register
    Note over Browser,BFF: { name, email, password }

    BFF->>Backend: GET /auth/public-key
    Backend-->>BFF: { publicKey }

    Note over BFF: Encripta con RSA-2048

    BFF->>Backend: POST /auth/register
    Note over BFF,Backend: { encryptedName, encryptedEmail, encryptedPassword }

    Backend-->>BFF: { token, id, name }
    BFF-->>Browser: { token, id, name }
```

---

## Flujo de recuperación de contraseña

```mermaid
flowchart TD
    A["Usuario ingresa email"] --> B["POST /forgot-password"]
    B --> C["BFF llama backend"]
    C --> D["Backend busca por HMAC y genera token"]
    D --> E["Backend envía email"]
    E --> F["Usuario abre enlace"]
    F --> G["/reset-password?token=uuid"]
    G --> H["Usuario ingresa nueva contraseña"]
    H --> I["Backend valida token"]
    I --> J["Contraseña actualizada"]
    J --> K["Redirect al login"]
```

---

## Sistema de diseño — The Intelligent Curator

El diseño de FinanzIA sigue la filosofía **Architectural Clarity**: la interfaz no presenta datos, los distila.

---

## Principios fundamentales

### Regla sin bordes

Las separaciones entre secciones se definen exclusivamente mediante cambios de superficie.

```css
/* Evitar este patrón */
border: 1px solid;
```

### Jerarquía tonal de superficies

| Elemento        | Token de color                           |
| --------------- | ---------------------------------------- |
| Fondo principal | `surface` — `#f8f9fa`                    |
| Sidebar         | `surface_container_low`                  |
| Cards           | `surface_container`                      |
| Burbujas IA     | `surface_container`                      |
| Usuario         | `primary_container` — `#006064`          |
| Modales         | `surface_lowest` + `backdrop-blur: 24px` |

### Tipografía editorial dual

| Uso       | Fuente  | Criterio                               |
| --------- | ------- | -------------------------------------- |
| Headlines | Manrope | `letter-spacing: -0.02em`              |
| Cuerpo    | Inter   | Legibilidad alta para texto financiero |

### Sombras con identidad

```css
box-shadow: 0 12px 32px rgba(0, 70, 74, 0.06);
```

### Animaciones premium

```css
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
```

---

## CI/CD

Pipeline GitHub Actions:

```mermaid
flowchart LR
    A["validate:env"] --> B["lint"]
    B --> C["format:check"]
    C --> D["test"]
    D --> E["build"]
```

| Paso           | Qué valida                           |
| -------------- | ------------------------------------ |
| `validate:env` | Variables requeridas presentes en CI |
| `lint`         | ESLint sin errores                   |
| `format:check` | Prettier sin diferencias             |
| `test`         | Todos los tests pasan                |
| `build`        | `next build` sin errores             |

El deploy a Vercel ocurre automáticamente al hacer merge a `main`.

---

## Commits y pre-commit hooks

Husky gestiona dos hooks automáticos.

### pre-commit

Bloquea commits si detecta:

- Claves OpenAI
- Errores ESLint
- Archivos sin formato

### commit-msg

Valida formato vía commitlint.

```bash
git commit -m "feat(auth): add forgot password flow with email recovery"

git commit -m "fix(transactions): handle null category in transaction list"

git commit -m "chore(deps): update next to 16.2.1"
```

### Prefijos permitidos

- `feat`
- `fix`
- `docs`
- `style`
- `refactor`
- `perf`
- `test`
- `build`
- `ci`
- `chore`
- `revert`

---

## Variables de entorno

| Variable                | Scope            | Requerida | Descripción                 |
| ----------------------- | ---------------- | --------- | --------------------------- |
| `BACKEND_JAVA_ENDPOINT` | Server-side only | ✅ Sí     | URL completa backend Java   |
| `OPENAI_API_KEY`        | Server-side only | ✅ Sí     | Clave OpenAI para LangGraph |

Ambas variables son exclusivamente server-side. Next.js garantiza que no lleguen al navegador.
