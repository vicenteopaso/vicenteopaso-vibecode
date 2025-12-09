---
name: Tech Stack
title: Tech Stack
slug: tech-stack
---

## Visión General

Este sitio está construido con un stack moderno y type-safe optimizado para rendimiento, accesibilidad y experiencia de desarrollador. La arquitectura sigue los principios de [Spec-Driven Development (SDD)](/en/technical-governance), con documentación de gobernanza que guía las decisiones de implementación.

## Framework Principal y Runtime

- **Next.js 16** — App Router con React Server Components (RSC), generación estática (SSG) y rutas tipadas
- **React 19.2** — Librería UI con server components y mejora progresiva
- **TypeScript 5.6** — Tipado estricto de extremo a extremo
- **Node.js 22** — Entorno de ejecución (LTS)

## Estilos y Componentes UI

- **Tailwind CSS v4** — Framework CSS utility-first con design tokens personalizados
- **Radix UI** — Primitivas accesibles de componentes:
  - `@radix-ui/react-dialog` — Diálogos modales
  - `@radix-ui/react-navigation-menu` — Componentes de navegación
  - `@radix-ui/react-avatar` — Avatares
  - `@radix-ui/react-popover` — Popovers
- **next-themes** — Theming claro/oscuro con detección del sistema
- **tailwindcss-animate** — Utilidades de animación
- **tailwindcss-radix** — Integración de Radix UI con Tailwind
- **@tailwindcss/typography** — Tipografía optimizada para contenido en formato prosa

## Gestión de Contenido

- **Markdown** — Archivos fuente en el directorio `content/`
- **Contentlayer** — Capa de contenido tipada (configurada para uso futuro)
- **gray-matter** — Parsing de frontmatter
- **react-markdown** — Renderizado de Markdown en React
- **sanitize-html** — Saneamiento HTML para seguridad

## Formularios y Servicios Backend

- **Cloudflare Turnstile** — Protección contra bots y spam
- **Formspree** — Backend para formularios de correo
- **Next.js Route Handlers** — Rutas API para procesamiento de formularios y contenido
- **Zod** — Validación de esquemas para datos de formularios y peticiones API

## Testing y Aseguramiento de Calidad

- **Vitest 2.1** — Framework de tests unitarios con entorno jsdom
- **@vitest/coverage-v8** — Reportes de cobertura
- **Playwright 1.57** — End-to-end testing
- **@testing-library/react** — Utilidades para testear componentes React
- **@testing-library/jest-dom** — Matchers DOM
- **@testing-library/dom** — Utilidades para pruebas DOM

## Calidad de Código y Linting

- **ESLint 9.39** — Linter con configuraciones:
  - `eslint-config-next` — Reglas recomendadas para Next.js
  - `@typescript-eslint/eslint-plugin` — Reglas específicas para TypeScript
  - `eslint-plugin-jsx-a11y` — Accesibilidad
  - `eslint-plugin-security` — Reglas de seguridad
  - `eslint-plugin-simple-import-sort` — Ordenación de imports
  - `eslint-config-prettier` — Integración con Prettier
- **Prettier 3.7** — Formateo de código
- **Husky 9.1** — Git hooks
- **lint-staged 15.2** — Linting y formateo pre-commit

## Observabilidad y Monitoreo

- **Vercel Analytics** — Métricas de interacción y visitas
- **Vercel Speed Insights** — Core Web Vitals y métricas de rendimiento
- **Sentry (@sentry/nextjs 10.29)** — Tracking de errores, session replay y alertas
- **Vercel Logs** — Logs de errores del servidor

## Build y Deployment

- **Vercel** — Hosting, CDN y despliegue en edge network
- **next-sitemap 4.2** — Generación automática de sitemap y robots.txt
- **@vercel/og 0.6** — Generación de imágenes Open Graph
- **pnpm 10.24** — Gestor de paquetes

## Herramientas de Desarrollo

- **[Warp](https://app.warp.dev/referral/8X3W39)** — Terminal para flujos de desarrollo
- **[Cursor](https://cursor.com)** — Editor con asistencia IA
- **PostCSS 8.4** — Procesador CSS
- **autoprefixer 10.4** — Prefijos CSS automáticos

## Rendimiento y SEO

- **Static Site Generation (SSG)** — Páginas prerenderizadas en build
- **Server Components** — Menos JavaScript en el cliente
- **Optimización de Imágenes** — Optimización automática de Next.js
- **Optimización de Fuentes** — Fuentes variables autoalojadas (Inter) con `font-display: swap`
- **JSON-LD Structured Data** — Marcado Schema.org para SEO
- **Open Graph y Twitter Cards** — Previews sociales

## Seguridad

- **Content Security Policy (CSP)** — Protección contra XSS
- **Rate Limiting** — Limitación de peticiones en rutas API
- **Validación de Entrada** — Validación con Zod
- **Saneamiento de Salida** — Saneamiento HTML para contenido generado por usuario
- **Security Headers** — Cabeceras de seguridad configuradas vía Next.js
- **CodeQL** — Escaneo automatizado de seguridad en CI

## CI/CD y Automatización

- **GitHub Actions** — Integración y despliegue continuo
- **Dependabot** — Actualizaciones automatizadas de dependencias
- **Lighthouse CI** — Auditorías de rendimiento y accesibilidad
- **Coverage Thresholds** — Límites de cobertura aplicados vía Vitest (90% líneas, 85% ramas, 90% funciones)

## Design System

El sitio utiliza un design system personalizado basado en CSS custom properties (design tokens) definido en `styles/globals.css`. Las decisiones de diseño se documentan en [docs/DESIGN_SYSTEM.md](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/DESIGN_SYSTEM.md).

Principios clave de diseño:

- Estética minimalista, orientada al contenido
- Cumplimiento de accesibilidad WCAG AA
- Compatibilidad con tema claro/oscuro
- Inspiración brutalista con radio de borde configurable

## Arquitectura y Gobernanza

Este proyecto sigue los principios de [Spec-Driven Development (SDD)](/en/technical-governance), acompañado de documentación de gobernanza que incluye:

- **[Engineering Standards](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ENGINEERING_STANDARDS.md)** — Intención de ingeniería y estándares guía
- **[Architecture Overview](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ARCHITECTURE.md)** — Arquitectura técnica y diseño del sistema
- **[Engineering Constitution](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/CONSTITUTION.md)** — Gobernanza del repositorio y quality gates

Para más detalles sobre cómo estos documentos guían el desarrollo y habilitan flujos asistidos por IA, consulta la página de [Technical Governance](/en/technical-governance).

## Enlaces del Proyecto

- [Repositorio GitHub](https://github.com/vicenteopaso/vicenteopaso-vibecode)
- [Alojado en Vercel](https://vercel.com)
- [Technical Governance](/en/technical-governance) — Cómo SDD y la ingeniería basada en documentación dieron forma a este proyecto
