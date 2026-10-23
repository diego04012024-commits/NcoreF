// carrito.js
// Maneja el carrito de compras usando localStorage para que persista
// entre recargas de página y entre las distintas páginas del sitio.

const CARRITO_KEY = "ncoref_carrito";

function leerCarrito() {
  try {
    const data = localStorage.getItem(CARRITO_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("No se pudo leer el carrito:", error);
    return [];
  }
}

function guardarCarrito(carrito) {
  try {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
  } catch (error) {
    console.error("No se pudo guardar el carrito:", error);
  }
  actualizarContadorCarrito();
}

function agregarAlCarrito(idProducto, cantidad) {
  cantidad = cantidad || 1;
  const carrito = leerCarrito();
  const existente = carrito.find(function (item) { return item.id === idProducto; });

  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({ id: idProducto, cantidad: cantidad });
  }

  guardarCarrito(carrito);
}

function quitarDelCarrito(idProducto) {
  let carrito = leerCarrito();
  carrito = carrito.filter(function (item) { return item.id !== idProducto; });
  guardarCarrito(carrito);
}

function actualizarCantidad(idProducto, nuevaCantidad) {
  const carrito = leerCarrito();
  const item = carrito.find(function (i) { return i.id === idProducto; });
  if (!item) return;

  if (nuevaCantidad <= 0) {
    quitarDelCarrito(idProducto);
    return;
  }
  item.cantidad = nuevaCantidad;
  guardarCarrito(carrito);
}

function vaciarCarrito() {
  guardarCarrito([]);
}

function calcularTotalItems(carrito) {
  return carrito.reduce(function (total, item) { return total + item.cantidad; }, 0);
}

function calcularTotalPrecio(carrito) {
  return carrito.reduce(function (total, item) {
    const producto = obtenerProductoPorId(item.id);
    if (!producto) return total;
    return total + producto.precio * item.cantidad;
  }, 0);
}

function actualizarContadorCarrito() {
  const contador = document.getElementById("cart-count");
  if (!contador) return;
  const carrito = leerCarrito();
  contador.textContent = calcularTotalItems(carrito);
}

// Actualiza el contador apenas carga cualquier página del sitio.
document.addEventListener("DOMContentLoaded", actualizarContadorCarrito);
