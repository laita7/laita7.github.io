# Calculadora pequeña

Calculadora web desarrollada para la práctica de Tecnologías Móviles y Web, usando solo HTML, CSS y JavaScript.

Página publicada: https://laita7.github.io

## Archivos
- `index.html`: estructura de la página.
- `style.css`: estilos (cargado con `<link>` en la cabecera).
- `script.js`: funcionalidad (cargado con `<script>` en la cabecera; los botones se conectan con `addEventListener` al ocurrir el evento `DOMContentLoaded`).

## Funcionalidades

### Campo de información
- `<h2 id="info" class="big" title="Información sobre el número">`, actualizado por `fill_info()` tras cada operación:
  "El resultado es menor que 100", "está entre 100 y 200" o "es mayor que 200".
- Debajo se muestra qué operación se ha hecho (ej: "Operación: 2 + 3 = 5. El resultado es 5").

### Operaciones unarias (funciones flecha)
- `square()` x², `cube()` x³, `mod()` valor absoluto (botón `modulo`), `fact()` factorial (botón `factorial`), `sqrt()` raíz cuadrada, `inverse()` 1/x.
- `power()` eleva el número al exponente escrito en el campo "Exponente".

### Operaciones binarias
- Suma (`addition`), resta, multiplicación (`multiplication`) y división.
- `setOperator()` guarda el primer número y el operador en las variables globales `operando1` y `operador`; `eq()` calcula el resultado al pulsar `=`.
- Se pueden encadenar operaciones (2 + 3 × 4 ...).

### Operaciones con listas CSV
- `sum()`, `average()` (media), `sort()`, `reverse()`, `removelast()` y `removeElements()` (elimina los valores indicados).
- Mientras se procesa la lista se muestra "Procesando lista..." durante medio segundo.

### Gestión de errores
- `validate()` (un número) y `validarLista()` (lista CSV) comprueban lo introducido.
- Mensajes para: campo vacío, texto en vez de números, decimal escrito con coma, lista incompleta, división entre 0, factorial de negativos o decimales, raíz de negativos, resultado demasiado grande y operación incompleta.
- Los errores se guardan con su hora y tipo en `localStorage` (con `JSON.stringify`) y se muestran en la sección "Registro de errores".

### Estilo y teclado
- Botones en grupos con CSS Grid, filas con Flex, bordes redondeados, sombras, `:hover` y `transition`.
- Se resalta el último botón pulsado (evento delegado con `matches`).
- Teclado: Tab para moverse entre botones, Enter calcula (=) y Escape borra la pantalla.
