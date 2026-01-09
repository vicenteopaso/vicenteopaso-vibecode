---
name: Gobernanza Técnica
title: Technical Governance
slug: technical-governance
description: Cómo Spec-Driven Development (SDD) y la ingeniería basada en documentación dieron forma a este proyecto, habilitando desarrollo asistido por IA con una arquitectura guiada por gobernanza.
---

## Ingeniería Basada en Documentación

Este proyecto se construyó utilizando un enfoque de **Documentación-First**, en el cual documentos comprehensivos de gobernanza, especificaciones de arquitectura y estándares de ingeniería se redactaron antes y durante el desarrollo. Estos documentos sirven como base tanto para la toma de decisiones humanas como para la implementación asistida por IA.

### La Filosofía

En lugar de escribir código primero y documentar después, este proyecto invierte el flujo de trabajo tradicional:

1. **Definir la Intención** — Los estándares de ingeniería, decisiones de arquitectura y principios de gobernanza se capturan en documentos markdown
2. **Establecer Gobernanza** — Se documentan reglas claras, quality gates y marcos de toma de decisiones
3. **Construir con Guía** — El código se escribe con estos documentos como fuente de verdad, asegurando consistencia y alineación
4. **IA como Co-Piloto** — Las herramientas de IA (como [Cursor](https://cursor.com)) usan estos documentos para entender el contexto, hacer sugerencias informadas y mantener la integridad arquitectónica

## Spec-Driven Development (SDD) en Práctica

### Documentos Clave de Gobernanza

La gobernanza técnica del proyecto se define a través de varios documentos clave:

#### Engineering Standards (`docs/ENGINEERING_STANDARDS.md`)

Un documento **north-star** comprehensivo que captura la intención de ingeniería en:

- **Fundamentos Arquitectónicos** — Principios de arquitectura modular basada en componentes
- **Estándares de Ingeniería Frontend** — Calidad de código, ingeniería de componentes y guías de design system
- **Accesibilidad (A11y)** — Objetivos WCAG 2.1 AA, prácticas de testing y tooling
- **Fortalecimiento de Seguridad** — Seguridad en runtime, checks en build-time y patrones de autenticación
- **Performance & Web Vitals** — Objetivos de Core Web Vitals, umbrales de Lighthouse y estrategias de optimización
- **SEO & Descubribilidad** — SEO técnico, structured data y optimización de contenido
- **Estándares de Testing** — Expectativas de testing unitario, integración y E2E con umbrales de coverage
- **Estándares de Design System** — Design tokens, guías de componentes y prácticas de documentación

Este documento sirve como **fuente única de verdad** para qué significa "bueno" en esta base de código.

### Política Agnóstica de Solución, Constitution y SDD

- **Supremacía**: `docs/CONSTITUTION.md` define los invariantes inmutables y la precedencia de resolución de conflictos para este repositorio.
- Dentro de esas restricciones, el SDD legible por máquina en `/sdd.yaml` es autoritativo para principios, límites y expectativas de CI.
- La gobernanza y los estándares son agnósticos de solución: las elecciones tecnológicas pueden evolucionar, pero los principios deben permanecer intactos.
- Cualquier cambio que afecte la arquitectura o preocupaciones transversales debe actualizar el SDD y la documentación relevante en el mismo PR.

#### Architecture Overview (`docs/ARCHITECTURE.md`)

Define la arquitectura técnica incluyendo:

- Componentes del sistema y sus relaciones
- Decisiones de stack tecnológico (Next.js, React, Tailwind, etc.)
- Arquitectura de contenido (Markdown + Contentlayer)
- Modelo de deployment (Vercel)
- Flujos de datos clave e integraciones

#### Engineering Constitution (`docs/CONSTITUTION.md`)

Define los **invariantes inmutables** del repositorio y el **orden de precedencia** de gobernanza.

- Es intencionalmente corto y estable (solo declaraciones MUST / MUST NOT / NEVER).
- El SDD (`sdd.yaml`) y los ADRs proveen los detalles cambiables y la justificación.

#### Documentos Adicionales de Gobernanza

- **Architecture Decision Records** (`docs/adr/`) — Registros ligeros de decisiones arquitectónicas con contexto, alternativas y consecuencias
- **AI Guardrails** (`docs/AI_GUARDRAILS.md`) — Reglas de codificación IA, prácticas requeridas, patrones prohibidos y checklist de revisión
- **Design System** (`docs/DESIGN_SYSTEM.md`) — Tokens de diseño visual, patrones de componentes, guías de uso
- **Accessibility Guidelines** (`docs/ACCESSIBILITY.md`) — Prácticas técnicas de accesibilidad y tooling
- **SEO Guide** (`docs/SEO_GUIDE.md`) — Patrones de implementación SEO y mejores prácticas
- **Error Handling** (`docs/ERROR_HANDLING.md`) — Error boundaries, logging y estrategias de monitoreo
- **Security Policy** (`docs/SECURITY_POLICY.md`) — Prácticas de seguridad y reporte de vulnerabilidades

## Architecture Decision Records (ADRs)

Para complementar la documentación comprehensiva, este proyecto usa **Architecture Decision Records (ADRs)** para capturar decisiones arquitectónicas significativas con su contexto y consecuencias.

### Propósito

Los ADRs proveen documentación ligera y buscable que:

- **Captura Contexto** — Documenta por qué se tomaron las decisiones, no solo qué se implementó
- **Preserva Justificación** — Previene que futuros contribuidores deshagan buenas decisiones
- **Muestra Alternativas** — Registra qué opciones se consideraron y por qué no se eligieron
- **Rastrea Consecuencias** — Documenta explícitamente trade-offs y limitaciones conocidas
- **Habilita Contexto IA** — Provee contexto arquitectónico estructurado para desarrollo asistido por IA

### Cuándo Escribir un ADR

Crea un ADR para decisiones sobre:

- **Cambios de arquitectura** — Estructura del sistema, límites o patrones
- **Elecciones tecnológicas** — Adopción de nuevas librerías, frameworks o herramientas
- **Preocupaciones transversales** — Error handling, logging, seguridad, performance
- **Breaking changes** — Cambios en APIs, contratos
- **Patrones de diseño** — Nuevos patrones o deprecación de existentes

Ver `docs/adr/README.md` para el proceso completo de ADR y template.

### Integración de ADR

Los ADRs se integran con el flujo de trabajo de desarrollo:

1. **Proponer Decisión** — Borrador de ADR con estado "Proposed" antes de la implementación
2. **Abrir PR** — Link al ADR en la descripción del PR
3. **Revisar Juntos** — Revisar tanto el código como el ADR
4. **Aceptar Decisión** — Actualizar el estado del ADR a "Accepted" después del merge
5. **Referenciar Después** — Futuros PRs y agentes IA referencian ADRs para contexto

## Cómo Funciona el Desarrollo Asistido por IA

### Desarrollo Consciente del Contexto

Con documentación comprehensiva y ADRs en su lugar, las herramientas de IA pueden:

1. **Entender la Intención** — Leyendo `ENGINEERING_STANDARDS.md`, la IA entiende el nivel de calidad, patrones arquitectónicos y estándares de codificación
2. **Aprender de Decisiones** — Leyendo ADRs, la IA entiende decisiones arquitectónicas pasadas y su justificación
3. **Mantener Consistencia** — Al sugerir código, la IA referencia el design system, guías de accesibilidad y estándares de testing
4. **Aplicar Gobernanza** — La IA puede señalar desviaciones de los estándares documentados y sugerir correcciones
5. **Generar Tests** — Las expectativas de testing y umbrales de coverage en el SDD/CI guían a la IA para generar suites de test apropiadas
6. **Documentar Decisiones** — La IA ayuda a mantener la documentación y escribir ADRs a medida que el código evoluciona

### Flujo de Trabajo de Ejemplo

Al implementar una nueva característica:

1. **Referenciar Estándares** — La IA lee `ENGINEERING_STANDARDS.md` para entender patrones de componentes, requisitos de accesibilidad y expectativas de testing
2. **Revisar Decisiones Pasadas** — La IA consulta ADRs en `docs/adr/` para entender elecciones arquitectónicas previas y su justificación
3. **Verificar Arquitectura** — La IA consulta `ARCHITECTURE.md` para asegurar que la implementación se alinea con el diseño del sistema
4. **Aplicar Design System** — La IA usa `DESIGN_SYSTEM.md` para sugerir design tokens y patrones de componentes apropiados
5. **Documentar Decisión** — Si la característica requiere una decisión arquitectónica, la IA ayuda a redactar un ADR
6. **Generar Tests** — La IA crea tests que cumplen umbrales de coverage aplicados en el SDD/CI
7. **Mantener Documentación** — La IA ayuda a actualizar documentos relevantes si la característica introduce nuevos patrones

## Beneficios de Este Enfoque

### Para Desarrollo

- **Onboarding Más Rápido** — Nuevos contribuidores (humanos o IA) pueden entender el proyecto rápidamente a través de la documentación
- **Calidad Consistente** — Los estándares son explícitos, no implícitos, reduciendo la varianza en la calidad del código
- **Deuda Técnica Reducida** — Las decisiones están documentadas, facilitando entender el "por qué" y evitar regresiones
- **Mejor Asistencia IA** — Las herramientas de IA tienen contexto rico para proveer sugerencias más precisas

### Para Mantenimiento

- **Historial Claro de Decisiones** — Las decisiones arquitectónicas están capturadas, no perdidas en mensajes de commit
- **Refactoring Más Fácil** — Entender la intención original ayuda a hacer cambios seguros
- **Quality Gates** — CI/CD aplica estándares documentados automáticamente
- **Documentación Viva** — Los documentos evolucionan con la base de código, manteniéndose actuales

### Para Colaboración

- **Entendimiento Compartido** — Todos (incluyendo la IA) trabajan desde la misma fuente de verdad
- **Trade-offs Explícitos** — Las decisiones y su justificación están documentadas
- **Gobernanza como Código** — Los estándares están versionados y son revisables
- **Transparencia** — La estructura del proyecto y las expectativas de calidad son claras

## Detalles de Implementación

### Estructura de Documentación

Todos los documentos de gobernanza viven en el directorio `docs/`:

```
docs/
├── adr/ # Architecture Decision Records
│ ├── README.md # Proceso de ADR e índice
│ ├── 0000-adr-template.md # Template para nuevos ADRs
│ └── 0001-adopt-architecture-decision-records.md
├── ENGINEERING_STANDARDS.md # Intención de ingeniería north-star
├── ARCHITECTURE.md # Arquitectura técnica
├── CONSTITUTION.md # Gobernanza del repositorio
├── DESIGN_SYSTEM.md # Sistema de diseño visual
├── ACCESSIBILITY.md # Guías A11y
├── SEO_GUIDE.md # Prácticas SEO
├── ERROR_HANDLING.md # Gestión de errores
└── SECURITY_POLICY.md # Prácticas de seguridad
```

### Integración CI/CD

Los estándares de documentación se aplican a través de:

- **Linting** — Reglas ESLint aplican estándares de calidad de código
- **Type Checking** — TypeScript strict mode asegura seguridad de tipos
- **Testing** — Umbrales de coverage aplican estándares de testing
- **Accesibilidad** — Checks automatizados de a11y en CI
- **Seguridad** — CodeQL y escaneo de dependencias
- **Performance** — Lighthouse CI aplica presupuestos de performance

### Control de Versiones

Toda la documentación es:

- **Versionada** — Rastreada en Git junto al código
- **Revisable** — Los cambios pasan por revisión de PR
- **Enlazada** — Los documentos se referencian entre sí para contexto
- **Viva** — Actualizada a medida que el proyecto evoluciona

## Modelo de Gobernanza IA

### Principios

Este proyecto abraza **desarrollo IA-first con guardrails fuertes**:

1. **IA como Acelerador, No Tomador de Decisiones** — Las herramientas de IA sugieren implementaciones, pero las decisiones arquitectónicas permanecen guiadas por humanos y documentadas
2. **Documentación como Contexto IA** — Documentos comprehensivos permiten a la IA entender la intención y mantener consistencia
3. **Quality Gates Son No-Negociables** — Todo código generado por IA debe pasar los mismos checks rigurosos que el código humano
4. **Restricciones de Seguridad Son Obligatorias** — La IA no puede evadir controles de seguridad o introducir vulnerabilidades
5. **Supervisión Humana para Cambios Críticos** — Cambios sensibles a seguridad y arquitectónicos requieren revisión manual

### Responsabilidades

**Herramientas IA (Copilot, Cursor):**

- Referenciar documentos de gobernanza para contexto (`docs/CONSTITUTION.md`, `sdd.yaml`, `ENGINEERING_STANDARDS.md`, `ARCHITECTURE.md`)
- Sugerir código siguiendo patrones documentados
- Generar tests cumpliendo requisitos de coverage
- Actualizar documentación al introducir nuevos patrones
- Ejecutar checks de validación antes de hacer commit

**Revisores Humanos:**

- Verificar alineación arquitectónica
- Evaluar implicaciones de seguridad
- Validar mantenibilidad
- Aprobar/rechazar sugerencias de IA
- Actualizar documentos de gobernanza según sea necesario

**CI/CD Automatizado:**

- Aplicar linting, type checking, test coverage
- Ejecutar escaneos de seguridad (CodeQL, auditoría de dependencias)
- Validar accesibilidad (WCAG 2.1 AA)
- Verificar performance (presupuestos Lighthouse)
- Bloquear merge en caso de fallos

### Guardrails y Restricciones

**Guardrails obligatorios** previenen que la IA:

- Evada controles de seguridad (Turnstile, rate limiting, validación de input)
- Debilite accesibilidad (navegación por teclado, ARIA, contraste de color)
- Viole límites arquitectónicos (imports cross-layer, estado mutable compartido)
- Introduzca patrones prohibidos (secrets hard-coded, HTML sin sanitizar, tests omitidos)

**Quality gates** que todos los cambios deben pasar:

- Linting (`pnpm lint`) y formateo (Prettier)
- Type checking (`pnpm typecheck`) en modo strict
- Tests unitarios con 90% de coverage de líneas
- Tests E2E para cambios de cara al usuario
- Auditoría de accesibilidad
- Escaneo de seguridad (CodeQL, npm audit)
- Lighthouse performance ≥90, accessibility ≥90, SEO ≥95

Ver **[AI Guardrails](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/AI_GUARDRAILS.md)** para restricciones completas.

### Proceso de Revisión

**Todos los PRs** (IA o humanos) siguen el mismo flujo de revisión:

1. **Auto-Revisión** — El autor valida cambios contra [Review Checklist](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/REVIEW_CHECKLIST.md)
2. **Validación CI** — Los checks automatizados deben pasar (ver `.github/workflows/`)
3. **Revisión Humana** — Revisión arquitectónica y de seguridad (requerida para cambios sensibles)
4. **Decisión de Merge** — Auto-merge elegible para cambios seguros, aprobación manual en otros casos

**Elegible para auto-merge** (con label `copilot-automerge`):

- Cambios solo de documentación
- Actualizaciones de dependencias (Dependabot)
- Actualizaciones de tests sin cambios de comportamiento
- Fixes de formateo/linting

**Requiere revisión manual:**

- Cambios relacionados con seguridad (rutas API, auth, validación)
- Cambios arquitectónicos (límites, patrones)
- Breaking changes
- Nuevas dependencias

### Ruta de Escalación

**Cuando las cosas salen mal:**

1. **Fallo CI** — Revisar logs, arreglar localmente, re-ejecutar checks, push de fixes
2. **Vulnerabilidad de Seguridad** — Detener inmediatamente, revisar [Security Policy](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/SECURITY_POLICY.md), arreglar vulnerabilidad, re-escanear
3. **Regresión de Accesibilidad** — Revisar [Accessibility Guidelines](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ACCESSIBILITY.md), probar con teclado/lector de pantalla, arreglar
4. **Violación de Arquitectura** — Revisar `sdd.yaml` y `ARCHITECTURE.md`, refactorizar para alinear, obtener aprobación humana

**Condiciones de parada de emergencia:**

- Vulnerabilidades de seguridad altas/críticas
- Spike de errores de producción
- Ruptura severa de accesibilidad
- Pérdida o corrupción de datos
- Secrets expuestos en commits

**Contactos de escalación:**

- Propietario del repositorio: @vicenteopaso
- Problemas de seguridad: GitHub Security Advisories (reporte privado)

### Documentación de Gobernanza

- **[AI Guardrails](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/AI_GUARDRAILS.md)** — Restricciones y quality gates para desarrollo IA
- **[Forbidden Patterns](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/FORBIDDEN_PATTERNS.md)** — Anti-patrones y cambios prohibidos
- **[Review Checklist](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/REVIEW_CHECKLIST.md)** — Checklist de validación pre-merge

## Consideraciones Futuras

Este enfoque documentation-first escala bien:

- **Crecimiento del Equipo** — Nuevos miembros del equipo pueden onboarding rápidamente
- **Evolución IA** — A medida que las herramientas de IA mejoran, un contexto más rico produce mejores resultados
- **Preservación de Conocimiento** — El conocimiento institucional se captura, no se pierde
- **Cumplimiento** — Los estándares pueden ser auditados y verificados
- **Tooling** — La documentación puede impulsar herramientas automatizadas y checks

## Documentación Relacionada

Para desarrolladores y contribuidores:

- [Tech Stack](/es/tech-stack) — Stack tecnológico completo y resumen de tooling
- [Engineering Standards](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ENGINEERING_STANDARDS.md) — Intención de ingeniería comprehensiva
- [Architecture Overview](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ARCHITECTURE.md) — Arquitectura técnica
- [Engineering Constitution](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/CONSTITUTION.md) — Gobernanza del repositorio
- [Design System](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/DESIGN_SYSTEM.md) — Tokens de diseño visual y patrones
- [Accessibility Guidelines](https://github.com/vicenteopaso/vicenteopaso-vibecode/blob/main/docs/ACCESSIBILITY.md) — Prácticas técnicas de a11y

## Plantillas de Issues y Feedback de la Comunidad

El repositorio usa plantillas de issues estructuradas para facilitar reportes de bugs, solicitudes de características y mejoras de documentación:

- **Reportes de Bugs** — Formulario estructurado para reportar problemas funcionales con contexto de navegador/dispositivo
- **Solicitudes de Características** — Template para proponer mejoras con caso de uso y evaluación de prioridad
- **Problemas de Documentación** — Formulario para reportar gaps de documentación o mejoras

Las plantillas de issues aseguran consistencia, capturan el contexto necesario e integran con flujos de trabajo CI/CD a través de etiquetado automático. Las vulnerabilidades de seguridad deben reportarse privadamente a través de GitHub Security Advisories en lugar de issues públicos.

Ver `.github/ISSUE_TEMPLATE/` para definiciones de plantillas y guías de uso.

## Última Actualización

Esta documentación de gobernanza técnica fue revisada y actualizada por última vez el 13 de diciembre de 2024.
