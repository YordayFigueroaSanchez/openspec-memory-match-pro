# Project Specification: Memory Match Game (Angular Edition)

## 1. Vision & Purpose
Aplicación web del juego de memoria n x n, enfocada en la reactividad y rendimiento utilizando Angular.

## 2. Tech Stack
- **Framework:** Angular 18+ (Standalone Components)
- **Estado:** Angular Signals (para reactividad fina en el tablero)
- **Estilos:** Tailwind CSS
- **Iconos:** Lucide Angular
- **Animaciones:** Angular Animations (@trigger) para el flip de las cartas.

## 3. Core Features & Business Rules
- **Generación de Tablero:** Dinámica basada en $n \times n$ (siempre con un número par de celdas).
- **Mecánica de Juego:**
    1. El jugador selecciona una carta (se voltea).
    2. El jugador selecciona una segunda carta.
    3. **Validación de Par:**
        - Si coinciden: Se mantienen visibles y se marcan como `matched`.
        - Si no coinciden: Se muestran brevemente (ej. 1s) y vuelven a su posición inicial (boca abajo).
- **Sistema de Bloqueo:** Mientras se validan dos cartas, el tablero no debe permitir más clics.
- **Contadores:** Registro de "Movimientos" (pares intentados) y "Tiempo de juego".
- **Condición de Victoria:** Se activa cuando todas las cartas tienen el estado `matched`.

## 4. Architecture & Design Principles
- **Signals-First:** Utilizar `signal`, `computed` y `effect` para el manejo del estado del juego.
- **Standalone Components:** Evitar el uso de NgModules. Estructura basada en componentes independientes.
- **Control Flow:** Usar la nueva sintaxis `@if`, `@for` y `@switch`.
- **Servicios:** La lógica de validación y el cronómetro deben vivir en un `GameService`.
- **Inmutabilidad:** Las señales deben actualizarse mediante funciones que devuelvan nuevos estados (evitar mutar arrays directamente).

## 5. Directory Structure (Angular Style)
- `src/app/components/`: Componentes UI (Card, Board).
- `src/app/services/`: Lógica de negocio (GameService).
- `src/app/models/`: Interfaces y Tipos (Card interface).
- `src/app/utils/`: Algoritmo Fisher-Yates.