# SalaJuegos

**Alumno:** Maria Pia Franetovich

**Deploy:** https://sala-juegos-murex.vercel.app


**Repositorio:** https://github.com/franetovichpia/sala-juegos


**Tecnologias:**
- Angular
- Typescript
- Supabase (Auth + base de datos + realtime)
- Vercel (deploy)
- Bootstrap

## Sprints

## Sprint #1
- creacion del proyecto Angular
- Deploy en Vercel
- Componentes: Login,Registro, Home, Quién Soy
- Navegación entre componentes
- Datos del alumno desde la API de GitHub
- Favicon personalizado

### Sprint #2
- Autenticación con Supabase (login, registro, logout)
- Guards de ruta para proteger páginas privadas
- Home condicional según estado de autenticación
- 3 botones de acceso rápido para testing
- Registro guarda datos en base de datos

### Sprint #3
- **Ahorcado:** entrada por botones del abecedario, guarda resultados en DB
- **Mayor o Menor:** baraja española, guarda resultados en DB
- **Sala de Chat:** mensajes en tiempo real con Supabase Realtime, muestra usuario y hora, mensaje propio diferenciado

### Sprint #4
- **Preguntados:** preguntas obtenidas desde la API Open Trivia Database, guarda resultados en DB
- **Número Secreto:** juego propio, adivinar número entre 1 y 100 con pistas, guarda resultados en DB
- **Página de Resultados:** 4 tablas ordenadas por desempeño de cada juego

---

##  Juego propio — Número Secreto

El juego genera un número al azar entre 1 y 100. El jugador debe adivinarlo seleccionando números de una grilla. Después de cada intento, el juego indica si el número secreto es mayor o menor. El jugador tiene 10 intentos para acertar. Se registran la cantidad de intentos y el tiempo que tardó en adivinar.

---

##  Usuarios de prueba

| Email | Contraseña |
|-------|-----------|
| test1@test.com | 123456 |
| test2@test.com | 123456 |
| test3@test.com | 123456 |