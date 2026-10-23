// script.js
// Comportamiento común del sitio: menú activo, tarjetas de producto,
// aviso al agregar, destacados del inicio, catálogo con filtros y carrito.

const CAT_NOMBRES = {
  tecnologia: "Tecnología", hogar: "Hogar", mascotas: "Mascotas",
  "aire-libre": "Aire Libre", deportes: "Deportes"
};
const DESTACADOS = [27, 14, 26, 19, 29, 3, 21, 16];

function formatoPrecio(n) {
  return "S/ " + n.toFixed(2);
}

function escapar(texto) {
  const d = document.createElement("div");
  d.textContent = texto;
  return d.innerHTML;
}

// ---------- Menú: marca la página actual ----------
function marcarMenuActivo() {
  const actual = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("#menuPrincipal .nav-link").forEach(function (a) {
    const destino = a.getAttribute("href");
    if (destino === actual) a.classList.add("active");
  });
}

// ---------- Aviso (toast) ----------
function mostrarAviso(mensaje) {
  let cont = document.querySelector(".toast-container");
  if (!cont) {
    cont = document.createElement("div");
    cont.className = "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.appendChild(cont);
  }
  const el = document.createElement("div");
  el.className = "toast align-items-center text-bg-dark border-0";
  el.setAttribute("role", "status");
  el.innerHTML = '<div class="d-flex"><div class="toast-body">' + escapar(mensaje) +
    '</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button></div>';
  cont.appendChild(el);
  const t = new bootstrap.Toast(el, { delay: 2200 });
  el.addEventListener("hidden.bs.toast", function () { el.remove(); });
  t.show();
}

// ---------- Tarjeta de producto ----------
function crearTarjeta(p) {
  const col = document.createElement("div");
  col.className = "col";
  col.innerHTML =
    '<article class="producto-card c-' + p.categoria + '" style="--c:var(--cat-' + p.categoria + ')">' +
      '<div class="producto-img"><img src="' + p.imagen + '" alt="' + escapar(p.nombre) + '" loading="lazy"></div>' +
      '<div class="producto-body">' +
        '<span class="producto-cat">' + CAT_NOMBRES[p.categoria] + '</span>' +
        '<h3>' + escapar(p.nombre) + '</h3>' +
        '<p class="producto-precio mb-1">' + formatoPrecio(p.precio) + '</p>' +
        '<button type="button" class="btn btn-add" data-id="' + p.id + '">Agregar al carrito</button>' +
      '</div>' +
    '</article>';
  return col;
}

// Un solo listener para todos los botones "Agregar"
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".btn-add");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const p = obtenerProductoPorId(id);
  agregarAlCarrito(id, 1);
  if (p) mostrarAviso(p.nombre + " se agregó al carrito");
});

// ---------- Inicio: destacados ----------
function pintarDestacados() {
  const grid = document.getElementById("destacados-grid");
  if (!grid) return;
  DESTACADOS.forEach(function (id) {
    const p = obtenerProductoPorId(id);
    if (p) grid.appendChild(crearTarjeta(p));
  });
}

// ---------- Catálogo ----------
function iniciarCatalogo() {
  const grid = document.getElementById("catalogo-grid");
  if (!grid) return;

  const txt = document.getElementById("filtro-texto");
  const rango = document.getElementById("filtro-precio");
  const salida = document.getElementById("precio-salida");
  const info = document.getElementById("resultado-texto");
  const vacio = document.getElementById("sin-resultados");

  // Cuántos productos hay por categoría
  document.querySelectorAll("[data-cuenta]").forEach(function (s) {
    const c = s.dataset.cuenta;
    const n = c === "todas" ? PRODUCTOS.length : PRODUCTOS.filter(function (p) { return p.categoria === c; }).length;
    s.textContent = "(" + n + ")";
  });

  // Valores iniciales desde la URL (?cat= y ?q=)
  const params = new URLSearchParams(location.search);
  const catUrl = params.get("cat");
  if (catUrl) {
    const r = document.querySelector('input[name="categoria"][value="' + catUrl + '"]');
    if (r) r.checked = true;
  }
  if (params.get("q")) txt.value = params.get("q");

  function categoriaElegida() {
    return document.querySelector('input[name="categoria"]:checked').value;
  }

  function aplicar() {
    const cat = categoriaElegida();
    const q = txt.value.trim().toLowerCase();
    const max = Number(rango.value);
    salida.textContent = "S/ " + max;

    const lista = PRODUCTOS.filter(function (p) {
      return (cat === "todas" || p.categoria === cat) &&
             p.precio <= max &&
             (q === "" || (p.nombre + " " + p.descripcion).toLowerCase().indexOf(q) !== -1);
    });

    grid.innerHTML = "";
    lista.forEach(function (p) { grid.appendChild(crearTarjeta(p)); });
    vacio.classList.toggle("d-none", lista.length > 0);
    info.textContent = lista.length === 1 ? "1 producto" : lista.length + " productos";
  }

  function limpiar() {
    txt.value = "";
    rango.value = rango.max;
    document.getElementById("cat-todas").checked = true;
    aplicar();
  }

  txt.addEventListener("input", aplicar);
  rango.addEventListener("input", aplicar);
  document.querySelectorAll('input[name="categoria"]').forEach(function (r) { r.addEventListener("change", aplicar); });
  document.getElementById("btn-limpiar").addEventListener("click", limpiar);
  document.getElementById("btn-limpiar-2").addEventListener("click", limpiar);
  aplicar();
}

// ---------- Carrito ----------
function pintarCarrito() {
  const lista = document.getElementById("carrito-lista");
  if (!lista) return;
  const carrito = leerCarrito();
  const vacio = document.getElementById("carrito-vacio");
  const contenido = document.getElementById("carrito-contenido");
  const hayItems = carrito.length > 0;
  vacio.classList.toggle("d-none", hayItems);
  contenido.classList.toggle("d-none", !hayItems);

  lista.innerHTML = "";
  carrito.forEach(function (item) {
    const p = obtenerProductoPorId(item.id);
    if (!p) return;
    const fila = document.createElement("div");
    fila.className = "carrito-item";
    fila.innerHTML =
      '<img src="' + p.imagen + '" alt="' + escapar(p.nombre) + '">' +
      '<div><h3>' + escapar(p.nombre) + '</h3>' +
        '<div class="text-secondary small mb-2">' + formatoPrecio(p.precio) + ' c/u</div>' +
        '<div class="cantidad">' +
          '<button type="button" data-accion="menos" data-id="' + p.id + '" aria-label="Quitar uno">−</button>' +
          '<span>' + item.cantidad + '</span>' +
          '<button type="button" data-accion="mas" data-id="' + p.id + '" aria-label="Agregar uno">+</button>' +
        '</div></div>' +
      '<div class="text-end"><strong>' + formatoPrecio(p.precio * item.cantidad) + '</strong><br>' +
        '<button type="button" class="btn btn-link btn-sm text-danger p-0" data-accion="quitar" data-id="' + p.id + '">Quitar</button></div>';
    lista.appendChild(fila);
  });

  document.getElementById("resumen-items").textContent = calcularTotalItems(carrito);
  document.getElementById("resumen-total").textContent = formatoPrecio(calcularTotalPrecio(carrito));
}

function iniciarCarrito() {
  const lista = document.getElementById("carrito-lista");
  if (!lista) return;
  lista.addEventListener("click", function (e) {
    const b = e.target.closest("[data-accion]");
    if (!b) return;
    const id = Number(b.dataset.id);
    const item = leerCarrito().find(function (i) { return i.id === id; });
    if (!item) return;
    if (b.dataset.accion === "mas") actualizarCantidad(id, item.cantidad + 1);
    if (b.dataset.accion === "menos") actualizarCantidad(id, item.cantidad - 1);
    if (b.dataset.accion === "quitar") quitarDelCarrito(id);
    pintarCarrito();
  });
  document.getElementById("btn-vaciar").addEventListener("click", function () {
    vaciarCarrito();
    pintarCarrito();
  });
  pintarCarrito();
}

// ---------- Arranque ----------
document.addEventListener("DOMContentLoaded", function () {
  marcarMenuActivo();
  pintarDestacados();
  iniciarCatalogo();
  iniciarCarrito();
});
