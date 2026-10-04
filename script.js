// ===== VARIABLES GLOBALES =====

let operando1 = null;   // primer número de una operación binaria
let operador = null;    // operación binaria pendiente ("addition", "subtraction"...)
let registroErrores = [];
let ultimoBoton = null; // último botón pulsado (para resaltarlo)


// ===== VALIDACIÓN Y ERRORES =====

// Comprueba que el texto es un número (entero o decimal, positivo o negativo)
// y lo devuelve convertido. Si no lo es, lanza un error.
function validate(texto, campo) {
    texto = texto.split(" ").join(""); // quita los espacios

    if (texto === "") {
        throw { tipo: "Campo vacío", mensaje: `El campo "${campo}" está vacío. Introduce un número.` };
    }
    if (texto.indexOf(",") !== -1) {
        throw { tipo: "Formato", mensaje: "Esta operación necesita un solo número. Para los decimales usa el punto (ej: 3.5)." };
    }

    let numero = Number(texto);
    if (isNaN(numero)) {
        throw { tipo: "No numérico", mensaje: `"${texto}" no es un número. Solo se admiten números.` };
    }
    return numero;
}

// Convierte una lista CSV ("3,1,2") en un array de números [3, 1, 2]
function validarLista(texto, campo) {
    texto = texto.split(" ").join("");

    if (texto === "") {
        throw { tipo: "Campo vacío", mensaje: `El campo "${campo}" está vacío. Introduce números separados por comas.` };
    }

    let partes = texto.split(",");
    let lista = [];
    for (let i = 0; i < partes.length; i++) {
        if (partes[i] === "") {
            throw { tipo: "CSV incompleto", mensaje: "A la lista le falta algún valor (hay dos comas seguidas o una coma al principio o al final)." };
        }
        let numero = Number(partes[i]);
        if (isNaN(numero)) {
            throw { tipo: "CSV no válido", mensaje: `"${partes[i]}" no es un número válido dentro de la lista.` };
        }
        lista.push(numero);
    }
    return lista;
}

// Comprueba que el resultado se puede mostrar
function comprobar(resultado) {
    if (resultado === Infinity || resultado === -Infinity) {
        throw { tipo: "Fuera de rango", mensaje: "El resultado es demasiado grande para calcularlo." };
    }
    return resultado;
}

function mostrarError(error) {
    let info = document.getElementById("info");
    info.innerHTML = `Error: ${error.mensaje}`;
    info.className = "big error";
    document.getElementById("detalle").innerHTML = `Tipo de error: ${error.tipo}`;
    registrarError(error);
}


// ===== REGISTRO DE ERRORES (se guarda en localStorage) =====

function horaActual() {
    let fecha = new Date();
    return `${fecha.getHours()}:${fecha.getMinutes()}:${fecha.getSeconds()}`;
}

function registrarError(error) {
    registroErrores.push({ hora: horaActual(), tipo: error.tipo, mensaje: error.mensaje });
    localStorage.setItem("registro", JSON.stringify(registroErrores));
    mostrarRegistro();
}

function mostrarRegistro() {
    let html = "";
    for (let i = 0; i < registroErrores.length; i++) {
        let e = registroErrores[i];
        html += `<li><b>${e.hora} (${e.tipo})</b> ${e.mensaje}</li>`;
    }
    document.getElementById("lista-errores").innerHTML = html;
    document.getElementById("num-errores").innerHTML = registroErrores.length;
}

function limpiarRegistro() {
    registroErrores = [];
    localStorage.removeItem("registro");
    mostrarRegistro();
}


// ===== CAMPO DE INFORMACIÓN =====

// Redondea para evitar resultados como 0.30000000000000004
function formatear(n) {
    return Number(n.toFixed(10));
}

function fill_info(resultado, detalle) {
    let info = document.getElementById("info");
    info.className = "big";

    if (resultado < 100) {
        info.innerHTML = "Info: El resultado es menor que 100";
    } else if (resultado <= 200) {
        info.innerHTML = "Info: El resultado está entre 100 y 200";
    } else {
        info.innerHTML = "Info: El resultado es mayor que 200";
    }
    document.getElementById("detalle").innerHTML = detalle;
}

function mostrarResultado(resultado, detalle) {
    resultado = formatear(resultado);
    document.getElementById("n1").value = resultado;
    fill_info(resultado, detalle);
}


// ===== OPERACIONES UNARIAS (funciones flecha) =====

// Lee el número, aplica la función "calcular" y muestra el resultado
function operacionUnaria(nombre, calcular) {
    try {
        let x = validate(document.getElementById("n1").value, "número");
        let r = comprobar(calcular(x));
        mostrarResultado(r, `Operación: ${nombre} de ${x}. El resultado es ${formatear(r)}`);
    } catch (error) {
        mostrarError(error);
    }
}

const square = () => operacionUnaria("Cuadrado", x => x * x);

const cube = () => operacionUnaria("Cubo", x => x * x * x);

const mod = () => operacionUnaria("Valor absoluto", x => Math.abs(x));

const fact = () => operacionUnaria("Factorial", x => {
    if (x < 0) {
        throw { tipo: "Matemático", mensaje: "No existe el factorial de un número negativo." };
    }
    if (x !== Math.floor(x)) {
        throw { tipo: "Matemático", mensaje: "El factorial solo existe para números enteros." };
    }
    let r = 1;
    for (let i = 2; i <= x; i++) {
        r = r * i;
    }
    return r;
});

const sqrt = () => operacionUnaria("Raíz cuadrada", x => {
    if (x < 0) {
        throw { tipo: "Matemático", mensaje: `El número ${x} es negativo y no tiene raíz cuadrada.` };
    }
    return Math.sqrt(x);
});

const inverse = () => operacionUnaria("Inverso", x => {
    if (x === 0) {
        throw { tipo: "División entre 0", mensaje: "No se puede dividir entre 0." };
    }
    return 1 / x;
});

const power = () => {
    try {
        let base = validate(document.getElementById("n1").value, "número");
        let exp = validate(document.getElementById("exponente").value, "exponente");
        if (base === 0 && exp < 0) {
            throw { tipo: "División entre 0", mensaje: "0 elevado a un número negativo es una división entre 0." };
        }
        let r = comprobar(base ** exp);
        if (isNaN(r)) {
            throw { tipo: "Matemático", mensaje: "Un número negativo no se puede elevar a un exponente decimal." };
        }
        mostrarResultado(r, `Operación: Potencia. ${base} elevado a ${exp} es ${formatear(r)}`);
    } catch (error) {
        mostrarError(error);
    }
};


// ===== OPERACIONES BINARIAS =====

function calcular(a, op, b) {
    switch (op) {
        case "addition":
            return a + b;
        case "subtraction":
            return a - b;
        case "multiplication":
            return a * b;
        case "division":
            if (b === 0) {
                throw { tipo: "División entre 0", mensaje: "No se puede dividir entre 0." };
            }
            return a / b;
    }
}

function simbolo(op) {
    switch (op) {
        case "addition": return "+";
        case "subtraction": return "−";
        case "multiplication": return "×";
        case "division": return "÷";
    }
}

// Guarda el primer número y el operador en las variables globales
function setOperator(op) {
    try {
        let pantalla = document.getElementById("n1");

        if (operador !== null && pantalla.value === "") {
            // Solo se cambia el operador (todavía no hay segundo número)
            operador = op;
        } else {
            let x = validate(pantalla.value, "número");
            if (operador !== null) {
                // Encadenar operaciones: 2 + 3 × ... calcula primero 2 + 3
                x = comprobar(calcular(operando1, operador, x));
            }
            operando1 = formatear(x);
            operador = op;
        }

        pantalla.value = "";
        document.getElementById("pendiente").innerHTML = `${operando1} ${simbolo(operador)}`;
        fill_info(operando1, "Escribe el segundo número y pulsa =");
        pantalla.focus();
    } catch (error) {
        mostrarError(error);
    }
}

const addition = () => setOperator("addition");
const subtraction = () => setOperator("subtraction");
const multiplication = () => setOperator("multiplication");
const division = () => setOperator("division");

// Calcula el resultado de la operación binaria
function eq() {
    try {
        if (operador === null) {
            throw { tipo: "Operación incompleta", mensaje: "Primero pulsa +, −, × o ÷." };
        }
        let b = validate(document.getElementById("n1").value, "segundo número");
        let r = comprobar(calcular(operando1, operador, b));
        let detalle = `Operación: ${operando1} ${simbolo(operador)} ${b} = ${formatear(r)}. El resultado es ${formatear(r)}`;

        operando1 = null;
        operador = null;
        document.getElementById("pendiente").innerHTML = "";
        mostrarResultado(r, detalle);
    } catch (error) {
        mostrarError(error);
    }
}

function vaciar() {
    document.getElementById("n1").value = "";
    document.getElementById("n1").focus();
}

function reiniciar() {
    operando1 = null;
    operador = null;
    document.getElementById("pendiente").innerHTML = "";
    document.getElementById("exponente").value = "";
    document.getElementById("elemento").value = "";
    document.getElementById("info").className = "big";
    document.getElementById("info").innerHTML = "Información sobre el número";
    document.getElementById("detalle").innerHTML = "";
    vaciar();
}


// ===== OPERACIONES CON LISTAS CSV =====

// Lee la lista, muestra "Procesando..." medio segundo y después aplica "procesar"
function operacionCSV(procesar) {
    try {
        let pantalla = document.getElementById("n1");
        let lista = validarLista(pantalla.value, "lista");

        pantalla.className = "display cargando";
        document.getElementById("detalle").innerHTML = "Procesando lista...";

        setTimeout(() => {
            pantalla.className = "display";
            try {
                procesar(lista);
            } catch (error) {
                mostrarError(error);
            }
        }, 500);
    } catch (error) {
        mostrarError(error);
    }
}

// Muestra una lista en la pantalla
function mostrarLista(lista, detalle) {
    document.getElementById("n1").value = lista.join(",");
    document.getElementById("info").className = "big";
    document.getElementById("info").innerHTML = `Info: La lista tiene ${lista.length} valores`;
    document.getElementById("detalle").innerHTML = detalle;
}

const sum = () => operacionCSV(lista => {
    let total = 0;
    for (let i = 0; i < lista.length; i++) {
        total = total + lista[i];
    }
    mostrarResultado(total, `Lista de valores procesada: se han sumado ${lista.length} valores. El resultado es ${formatear(total)}`);
});

const average = () => operacionCSV(lista => {
    let total = 0;
    for (let i = 0; i < lista.length; i++) {
        total = total + lista[i];
    }
    let media = total / lista.length;
    mostrarResultado(media, `Lista de valores procesada: media de ${lista.length} valores. El resultado es ${formatear(media)}`);
});

// sort() sin parámetros ordena como texto (10 antes que 2),
// por eso se le pasa una función flecha que compara números
const sort = () => operacionCSV(lista => {
    lista.sort((a, b) => a - b);
    mostrarLista(lista, "Lista de valores procesada: ordenada de menor a mayor.");
});

const reverse = () => operacionCSV(lista => {
    lista.reverse();
    mostrarLista(lista, "Lista de valores procesada: se ha invertido el orden.");
});

const removelast = () => operacionCSV(lista => {
    if (lista.length === 1) {
        throw { tipo: "CSV vacío", mensaje: "La lista solo tiene un valor y quedaría vacía." };
    }
    let ultimo = lista.pop();
    mostrarLista(lista, `Lista de valores procesada: se ha eliminado el último valor (${ultimo}).`);
});

// Elimina de la lista todos los valores escritos en el campo "Valor(es) a eliminar"
const removeElements = () => operacionCSV(lista => {
    let quitar = validarLista(document.getElementById("elemento").value, "valor(es) a eliminar");

    for (let i = 0; i < quitar.length; i++) {
        if (lista.indexOf(quitar[i]) === -1) {
            throw { tipo: "CSV: valor inexistente", mensaje: `El valor ${quitar[i]} no está en la lista.` };
        }
        // Puede aparecer varias veces: se borra mientras se encuentre
        while (lista.indexOf(quitar[i]) !== -1) {
            lista.splice(lista.indexOf(quitar[i]), 1);
        }
    }
    if (lista.length === 0) {
        throw { tipo: "CSV vacío", mensaje: "No se pueden eliminar todos los valores de la lista." };
    }
    mostrarLista(lista, `Lista de valores procesada: se ha eliminado ${quitar.join(", ")}.`);
});


// ===== EVENTOS =====

document.addEventListener("DOMContentLoaded", () => {
    // Asociar cada botón con su función
    document.getElementById("square").addEventListener("click", square);
    document.getElementById("cube").addEventListener("click", cube);
    document.getElementById("modulo").addEventListener("click", mod);
    document.getElementById("factorial").addEventListener("click", fact);
    document.getElementById("raiz").addEventListener("click", sqrt);
    document.getElementById("inverso").addEventListener("click", inverse);
    document.getElementById("potencia").addEventListener("click", power);

    document.getElementById("addition").addEventListener("click", addition);
    document.getElementById("subtraction").addEventListener("click", subtraction);
    document.getElementById("multiplication").addEventListener("click", multiplication);
    document.getElementById("division").addEventListener("click", division);
    document.getElementById("igual").addEventListener("click", eq);
    document.getElementById("vaciar").addEventListener("click", vaciar);
    document.getElementById("reiniciar").addEventListener("click", reiniciar);

    document.getElementById("sum").addEventListener("click", sum);
    document.getElementById("media").addEventListener("click", average);
    document.getElementById("sort").addEventListener("click", sort);
    document.getElementById("reverse").addEventListener("click", reverse);
    document.getElementById("removelast").addEventListener("click", removelast);
    document.getElementById("eliminar").addEventListener("click", removeElements);

    document.getElementById("limpiar-registro").addEventListener("click", limpiarRegistro);

    // Teclado en la pantalla: Enter = igual, Escape = borrar
    document.getElementById("n1").addEventListener("keydown", ev => {
        if (ev.key === "Enter") {
            eq();
        } else if (ev.key === "Escape") {
            vaciar();
        }
    });

    // Evento delegado: resalta el último botón pulsado
    document.addEventListener("click", ev => {
        if (ev.target.matches("button")) {
            if (ultimoBoton !== null) {
                ultimoBoton.className = "";
            }
            ev.target.className = "ultimo";
            ultimoBoton = ev.target;
        }
    });

    // Recuperar el registro de errores guardado
    registroErrores = JSON.parse(localStorage.getItem("registro")) || [];
    mostrarRegistro();
});
