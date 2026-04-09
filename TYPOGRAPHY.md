# Guía de Tipografía Responsive — Máxima Formación

## Escala tipográfica (definida en globals.css)

| Tier    | sm (móvil) | md (tablet) | lg/xl (desktop) |
|---------|-----------|-------------|-----------------|
| display | 48px      | 72px        | 120px           |
| heading | 20px      | 28px        | 42px            |
| body    | 14px      | 16px        | 20px            |
| label   | 10px      | 12px        | 16px            |

## Breakpoints Tailwind utilizados

- **(base)** — móvil (<768px) → usa `-sm`
- **md:** — tablet (≥768px) → usa `-md`
- **xl:** — desktop (≥1280px) → usa `-lg`

> Se usa `xl:` en vez de `lg:` para el tercer salto porque el layout a 2 columnas
> no aparece hasta `xl`, y la tipografía debe escalar acorde al espacio disponible.

---

## Reglas por elemento

### Hero — Título principal (h1)

```
text-display-sm md:text-display-md
```

- 48px → 72px
- No se usa display-lg (120px) porque en la mayoría de páginas sería excesivo.
- Si una página tiene un hero de tipo "landing" a pantalla completa, se puede añadir `xl:text-display-lg`.

### Hero — Etiqueta superior (span uppercase)

```
text-label-sm md:text-label-md xl:text-label-lg
```

- 10px → 12px → 16px
- Siempre con `tracking-[0.5em] uppercase font-medium`

### Hero — Descripción / subtítulo

```
text-body-sm md:text-body-md xl:text-body-lg
```

- 14px → 16px → 20px

### Títulos de sección (h2)

```
text-heading-sm md:text-heading-md xl:text-heading-lg
```

- 20px → 28px → 42px

### Párrafos y texto de contenido

```
text-body-sm md:text-body-md
```

- 14px → 16px
- Solo 2 niveles. El texto de contenido general no necesita escalar a 20px en desktop.

### Labels de formulario

```
text-label-sm md:text-label-md xl:text-label-lg
```

- 10px → 12px → 16px
- Con `uppercase tracking-widest font-medium`

### Inputs y textareas (incluye placeholders)

```
text-body-sm md:text-body-md
```

- 14px → 16px
- El placeholder hereda el tamaño del input.
- En inputs con más espacio disponible se puede añadir `xl:text-body-lg`.

### Botones

```
text-label-sm md:text-label-md
```

- 10px → 12px
- Con `uppercase tracking-widest font-bold`

### Texto secundario / metadata (dentro de cards, listas, info)

```
text-body-sm
```

- 14px fijo.
- Para elementos compactos (filas de contacto, badges, items de lista) un solo tamaño es suficiente.

---

## Resumen rápido de clases

| Elemento                  | Clases                                              |
|---------------------------|-----------------------------------------------------|
| Hero h1                   | `text-display-sm md:text-display-md`                |
| Hero label                | `text-label-sm md:text-label-md xl:text-label-lg`   |
| Hero descripción          | `text-body-sm md:text-body-md xl:text-body-lg`       |
| Título sección (h2)       | `text-heading-sm md:text-heading-md xl:text-heading-lg` |
| Párrafos                  | `text-body-sm md:text-body-md`                       |
| Labels de formulario      | `text-label-sm md:text-label-md xl:text-label-lg`   |
| Inputs / placeholders     | `text-body-sm md:text-body-md`                       |
| Botones                   | `text-label-sm md:text-label-md`                     |
| Texto secundario en cards | `text-body-sm`                                       |
