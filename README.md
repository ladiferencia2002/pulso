# 💚 Pulso

App móvil de seguimiento de hábitos de salud: **sueño, piel, dieta** y un **cuarto hábito a tu elección**. Registras cada día en segundos y la app dibuja tu evolución mensual, la compara con meses anteriores y, a fin de mes, te genera un **PDF con todo**. Funciona sin conexión y se instala como app en el móvil (PWA). Sin cuentas ni servidor: los datos viven en tu dispositivo.

**Stack:** Next.js 16 (App Router, exportación estática) · TypeScript · Tailwind · Recharts · jsPDF · `localStorage` · GitHub Pages / Vercel.

---

## 1. Flujo de pantallas

```
                    ┌───────────────────────── barra de navegación ─────────────────────────┐
                    │   ✅ Hoy          📈 Mes          ⚖️ Comparar          ⚙️ Ajustes       │
                    └────────────────────────────────────────────────────────────────────────┘

 ✅ HOY (pantalla principal)              📈 MES                        ⚖️ COMPARAR
 ┌──────────────────────────┐            ┌──────────────────────┐      ┌──────────────────────┐
 │ [aviso fin de mes → PDF] │            │ ← Octubre 2026 →     │      │ Mes A  ⇄  Contra B   │
 │ ← Hoy →  (cambiar de día)│            │ días con registro    │      │ días con registro    │
 │ ◔ 2/4   🔥 racha         │            │ [Descargar PDF]      │      │ ── Sueño ──          │
 │ L M X J V S D  (semana)  │            │ ── Sueño ──          │      │  gráfica A vs B      │
 │ ┌ Sueño   − + 6h 7h 8h ┐ │            │  área + meta         │      │  promedio A / B      │
 │ ┌ Piel    1 2 3 … 10   ┐ │            │  promedio·mejor·%    │      │  ▲ +0,5 h            │
 │ ┌ Dieta   − +          ┐ │            │  ▲ vs mes anterior   │      │ ── Piel / Dieta / …  │
 │ ┌ Tu hábito  (según tipo)│            │ ── Piel / Dieta / …  │      └──────────────────────┘
 └──────────────────────────┘            └──────────────────────┘
                                                                        ⚙️ AJUSTES
  Registrar = 1 toque (chips) o − / +.                                  metas · cuarto hábito ·
  Se puede editar cualquier día pasado                                  copia de seguridad · borrar
  con las flechas o la tira semanal.
```

- **Hoy:** acceso rápido a los 4 hábitos. Anillo de progreso del día, racha de días completos (los 4 registrados), tira de la semana y mensaje motivador. Al cerrar el mes aparece un aviso para descargar el PDF.
- **Mes:** una gráfica por hábito (área para horas, línea para escalas, barras para cantidades y sí/no) con línea de meta, promedio, mejor día, días registrados, % de cumplimiento y variación frente al mes anterior.
- **Comparar:** eliges dos meses cualesquiera; cada hábito se dibuja con ambos meses superpuestos (continua vs. punteada) y la diferencia de promedios.
- **Ajustes:** metas diarias, configuración del cuarto hábito, copia de seguridad (exportar/importar JSON) y borrado de datos.

## 2. Hábitos y cómo se miden

| Hábito | Tipo | Rango | Meta por defecto |
|---|---|---|---|
| 😴 Sueño | horas (paso 0,5) | 0–14 | 8 h |
| ✨ Piel | escala | 1–10 | 7 |
| 🥗 Dieta | contador de comidas saludables | 0–8 | 4 |
| ⭐ Libre (por defecto 💧 Agua) | contador, escala 1–10 o sí/no | configurable | configurable |

Un día "cumple" cuando el valor es **igual o mayor que la meta**. La app asume que más es mejor en todos los hábitos.

## 3. Estructura de datos

Todo el estado es un único JSON en `localStorage` (`pulso-data-v1`), validado al cargar (`sanitize` en `clientStore.ts`):

```ts
type AppData = {
  goals: { sleep: number; skin: number; diet: number; custom: number };
  custom: { name: string; emoji: string; kind: "count" | "scale" | "check"; unit: string; max: number };
  logs: Record<"YYYY-MM-DD", Partial<{ sleep: number; skin: number; diet: number; custom: number }>>;
  exportedMonths: string[]; // "YYYY-MM" con PDF ya descargado
};
```

- **Clave por fecha** → leer un día o un mes es inmediato y editar el pasado es trivial. Un día solo existe si tiene al menos un valor.
- Los hábitos se construyen en tiempo de ejecución (`buildHabits`) mezclando `goals` + `custom` con las definiciones fijas, así que cambiar una meta no toca el histórico.
- Migrar a otro almacenamiento (IndexedDB, SQLite, backend) solo exige reemplazar `clientStore.ts`.

## 4. Informe de fin de mes (PDF)

`src/lib/pdfExport.ts` genera el PDF en el propio dispositivo (jsPDF, sin servidor):

1. Cabecera con mes, días con registro y días completos.
2. Por hábito: promedio, mejor, peor, días registrados, % de cumplimiento de la meta, variación frente al mes anterior y una gráfica dibujada.
3. Tabla con el registro día a día.

**Cuándo se ofrece:** el último día del mes, o al abrir la app si hay un mes cerrado que aún no descargaste, aparece un aviso en *Hoy*. También puedes descargarlo de cualquier mes desde *Mes*.

**Límite:** una app sin servidor no puede crear ni enviarte el PDF por su cuenta con la app cerrada. El PDF se genera cuando abres la app y pulsas el botón.

## 5. Tecnologías y por qué

| Decisión | Motivo |
|---|---|
| **PWA estática** (Next.js `output: "export"`) | Se instala desde el navegador, sin tiendas de apps, y se hospeda gratis |
| **Service worker** (`public/sw.js`) | Caché de la app: funciona sin internet tras la primera visita |
| **`localStorage`** | Datos persistentes y offline sin backend; el volumen (4 números/día) es minúsculo |
| **Recharts** | Gráficas declarativas con tooltips y accesibles |
| **jsPDF** | PDF en el cliente, sin servidor |
| **Copia JSON** | Mitiga el riesgo de `localStorage` (se pierde si se borran los datos del navegador) |

Si más adelante quieres sincronizar entre dispositivos o recibir recordatorios push reales, haría falta un backend; el resto de la app no cambiaría.

### Color y accesibilidad de las gráficas

Los cuatro colores de hábito (azul, naranja, aqua, ámbar) salen de una paleta categórica validada para fondo oscuro (contraste ≥ 3:1, separación para daltonismo superada). Cada gráfica lleva el nombre del hábito en el título, hay línea de meta dibujada, la comparación usa línea continua vs. punteada (no solo color) y el texto nunca toma el color de la serie.

## 6. Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # genera el sitio estático en out/
npm run preview    # sirve out/ en local
```

## 7. Despliegue

- **GitHub Pages:** cada push a `main` ejecuta `.github/workflows/deploy.yml` (compila con `GITHUB_PAGES=true`, que añade el `basePath` `/pulso`).
- **Vercel:** importa el repo; detecta Next.js solo.

## 8. Estructura

```
src/
  app/            page.tsx (Hoy) · mes/ · comparar/ · ajustes/ · layout.tsx · manifest.ts
  components/     today/ (HabitCard, DayRing, WeekStrip, MonthEndBanner) · charts/ · nav/
  lib/
    habits.ts       definiciones de hábitos, formato y metas
    clientStore.ts  persistencia y validación
    stats.ts        series mensuales, resúmenes, racha, mes pendiente de PDF
    chartSpec.ts    escala de ejes (compartida por la app y el PDF)
    pdfExport.ts    informe mensual en PDF
    useAppData.tsx  estado global + guardado automático
public/sw.js        service worker (modo sin conexión)
```
