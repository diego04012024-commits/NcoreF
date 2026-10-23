// formularios.js
// Validación y envío simulado de los tres formularios del sitio:
// contacto, pedido y libro de reclamaciones.

// Valida con Bootstrap: marca los campos y devuelve true si todo está bien
function validar(form) {
  form.classList.add("was-validated");
  if (!form.checkValidity()) {
    const primero = form.querySelector(":invalid");
    if (primero) primero.focus();
    return false;
  }
  return true;
}

// ---------- Contacto ----------
(function () {
  const form = document.getElementById("form-contacto");
  if (!form) return;
  const mensaje = document.getElementById("c-mensaje");
  const contador = document.getElementById("contador");
  mensaje.addEventListener("input", function () { contador.textContent = mensaje.value.length; });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validar(form)) return;
    const aviso = document.getElementById("contacto-exito");
    aviso.textContent = "Gracias, " + document.getElementById("c-nombres").value.trim() +
      ". Recibimos tu mensaje y te responderemos pronto.";
    aviso.classList.remove("d-none");
    form.reset();
    form.classList.remove("was-validated");
    contador.textContent = "0";
    aviso.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

// ---------- Pedido ----------
(function () {
  const form = document.getElementById("form-pedido");
  if (!form) return;

  const carrito = leerCarrito();
  const lista = document.getElementById("pedido-lista");
  const total = document.getElementById("pedido-total");

  if (carrito.length === 0) {
    document.getElementById("pedido-vacio").classList.remove("d-none");
    form.querySelectorAll("input, select, button").forEach(function (c) { c.disabled = true; });
  }
  carrito.forEach(function (item) {
    const p = obtenerProductoPorId(item.id);
    if (!p) return;
    const li = document.createElement("li");
    li.className = "d-flex justify-content-between gap-2 mb-2";
    li.innerHTML = "<span>" + item.cantidad + " × " + escapar(p.nombre) + "</span><span>" + formatoPrecio(p.precio * item.cantidad) + "</span>";
    lista.appendChild(li);
  });
  total.textContent = formatoPrecio(calcularTotalPrecio(carrito));

  // El texto de ayuda cambia según el medio de pago
  const ayudas = {
    yape: "Al confirmar te mostraremos el número al que yapear.",
    tarjeta: "Pagarás con tarjeta de forma segura al confirmar el pedido.",
    contraentrega: "Pagas en efectivo cuando recibes el pedido."
  };
  form.querySelectorAll('input[name="pago"]').forEach(function (r) {
    r.addEventListener("change", function () {
      document.getElementById("detalle-pago").textContent = ayudas[r.value];
      document.getElementById("pago-error").classList.add("d-none");
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const pagoOk = form.querySelector('input[name="pago"]:checked');
    document.getElementById("pago-error").classList.toggle("d-none", !!pagoOk);
    if (!validar(form) || !pagoOk) return;

    const numero = "NC-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 90000) + 10000);
    document.getElementById("numero-pedido").textContent = numero;
    vaciarCarrito();
    new bootstrap.Modal(document.getElementById("modalPedido")).show();
  });
})();

// ---------- Libro de reclamaciones ----------
(function () {
  const form = document.getElementById("form-reclamo");
  if (!form) return;

  // El formato del documento cambia según el tipo elegido
  const tipo = document.getElementById("r-tipodoc");
  const num = document.getElementById("r-numdoc");
  const err = document.getElementById("r-numdoc-error");
  tipo.addEventListener("change", function () {
    if (tipo.value === "dni") {
      num.pattern = "[0-9]{8}"; num.maxLength = 8; err.textContent = "El DNI tiene 8 números.";
    } else if (tipo.value === "ce") {
      num.pattern = "[0-9]{9,12}"; num.maxLength = 12; err.textContent = "Entre 9 y 12 números.";
    } else {
      num.pattern = "[A-Za-z0-9]{6,12}"; num.maxLength = 12; err.textContent = "Entre 6 y 12 letras o números.";
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validar(form)) return;

    let correlativo = 1;
    try { correlativo = Number(localStorage.getItem("ncoref_reclamos") || 0) + 1; localStorage.setItem("ncoref_reclamos", correlativo); } catch (x) {}
    const numero = "HR-" + new Date().getFullYear() + "-" + String(correlativo).padStart(4, "0");
    document.getElementById("numero-reclamo").textContent = numero;
    new bootstrap.Modal(document.getElementById("modalReclamo")).show();
    form.reset();
    form.classList.remove("was-validated");
  });
})();
