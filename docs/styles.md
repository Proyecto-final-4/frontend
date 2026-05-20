# FinanzIA — Guía de estilos

> Referencia canónica para UI, animaciones y patrones de componentes.

## 1. Sistema de color (tema oscuro Stackwise)

| Token CSS              | Hex / valor             | Uso                            |
| ---------------------- | ----------------------- | ------------------------------ |
| `--background`         | `#0B0F09`               | Fondo de página                |
| `--foreground`         | `#EEF2EB`               | Texto principal                |
| `--card`               | `#141A11`               | Tarjetas y paneles             |
| `--primary`            | `#7FE44B`               | CTAs, enlaces activos, acentos |
| `--primary-foreground` | `#0B0F09`               | Texto sobre botón lime         |
| `--secondary`          | `#2A3327`               | Fondos secundarios             |
| `--muted`              | `#1C2319`               | Inputs, áreas deprimidas       |
| `--muted-foreground`   | `#7A8C76`               | Texto secundario               |
| `--border`             | `rgba(127,228,75,0.12)` | Bordes                         |
| `--destructive`        | `#F87171`               | Errores                        |

**Regla:** no usar hex hardcodeados en componentes; usar tokens Tailwind (`text-primary`, `bg-card`, etc.).

## 2. Tipografía

| Variable        | Familia    | Uso                      |
| --------------- | ---------- | ------------------------ |
| `font-headline` | Manrope    | Títulos h1–h3            |
| `font-body`     | Inter      | Cuerpo, labels, UI       |
| `font-mono`     | Geist Mono | Código, números técnicos |

Escala recomendada: `text-2xl font-headline font-bold` (h1), `text-lg` (h3 card), `text-sm` (cuerpo), `text-xs` (metadatos).

Etiquetas de sección: `<SectionLabel>` o clase `.section-tag`.

## 3. Animaciones (`lib/animations.ts`)

| Constante                          | Cuándo usar                            |
| ---------------------------------- | -------------------------------------- |
| `springEnter`                      | Entradas con rebote suave              |
| `tweenDecel`                       | Entradas fade/slide (0.5s, ease cubic) |
| `tweenFast`                        | Hover, micro-interacciones (0.22s)     |
| `staggerContainer` + `staggerItem` | Listas de tarjetas                     |

```tsx
import { AnimateIn } from "@/components/ui/animate-in";

<AnimateIn variant="fade-up">
  <Card>...</Card>
</AnimateIn>;
```

Valores fijos (no cambiar sin consenso):

- Spring: `stiffness: 400, damping: 30, mass: 1`
- Tween: `ease: [0.27, 0, 0.51, 1]`, `duration: 0.5`
- Stagger: `staggerChildren: 0.07`

**Accesibilidad:** respetar `prefers-reduced-motion` (CSS global + `shouldAnimate()`).

## 4. Hovers e interacciones

| Elemento               | Efecto                                            |
| ---------------------- | ------------------------------------------------- |
| `Button` default       | glow lime + `scale(0.97)` al tap                  |
| `Button` outline/ghost | borde/texto lime en hover                         |
| `Card` `hoverable`     | `.hover-lift` + borde lime                        |
| Nav links              | `group-hover:translate-x-0.5` en ícono            |
| Thread items           | `hover:translate-x-1`, acciones `opacity-0 → 100` |
| Transaction rows       | `hover:border-primary/15`, ícono `scale-110`      |
| `Input`                | `hover:border-primary/30`, focus ring lime        |

## 5. Componentes UI (`components/ui/`)

| Componente        | Import                          | Uso                 |
| ----------------- | ------------------------------- | ------------------- |
| `Card`            | `@/components/ui/card`          | Contenedores        |
| `Badge`           | `@/components/ui/badge`         | Estados, etiquetas  |
| `Avatar`          | `@/components/ui/avatar`        | Perfil              |
| `Spinner`         | `@/components/ui/spinner`       | Carga inline        |
| `Skeleton`        | `@/components/ui/skeleton`      | Placeholders        |
| `Progress`        | `@/components/ui/progress`      | Barras de progreso  |
| `EmptyState`      | `@/components/ui/empty-state`   | Listas vacías       |
| `SectionLabel`    | `@/components/ui/section-label` | `// SECCIÓN`        |
| `AnimateIn`       | `@/components/ui/animate-in`    | Entrada al viewport |
| `Counter`         | `@/components/ui/counter`       | Números animados    |
| `Button`, `Input` | shadcn/base-ui                  | Formularios         |

## 6. Utilidades CSS globales

| Clase            | Efecto                  |
| ---------------- | ----------------------- |
| `.section-tag`   | Label uppercase lime    |
| `.gradient-text` | Gradiente lime → blanco |
| `.glow-border`   | Borde con glow          |
| `.dot-texture`   | Patrón de puntos        |
| `.glass-card`    | Glassmorphism oscuro    |
| `.hover-lift`    | Elevación en hover      |
| `.fluid-bg`      | Hero/login              |
| `.chat-gradient` | Área de chat            |
| `.shimmer`       | Skeleton animado        |

## 7. Convenciones de código

- Componentes: **PascalCase**; archivos: **kebab-case**
- Variantes con **CVA**, no condicionales inline de clases
- `data-slot="nombre"` en el elemento raíz de cada UI dumb
- **Named exports** en `components/ui/` (no `export default`)
- **shadcn** solo para primitivos interactivos (Button, Input, Dialog…); el resto es custom CVA

## 8. Anti-patrones

- No `!important` ni estilos inline para colores
- No duplicar barras de progreso (usar `<Progress>`)
- No animar sin considerar `prefers-reduced-motion`
- No mezclar paleta teal antigua con tokens lime nuevos

## 9. Enfoque híbrido shadcn

- **shadcn + Base UI:** Button, Input, Checkbox, Label (+ Dialog/Select cuando se necesiten)
- **Custom CVA:** Card, Badge, Avatar, Progress, EmptyState, AnimateIn, etc.
