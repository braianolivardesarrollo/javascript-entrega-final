let productos = [];

// Carga los productos desde el archivo JSON
async function cargarProductos() {
  const productosDOM = document.getElementById("productos");

  productosDOM.textContent = "Cargando productos...";

  try {
    const respuesta = await fetch("./data/productos.json");

    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar los productos");
    }

    const productosIniciales = await respuesta.json();

    productos =
      JSON.parse(localStorage.getItem("productos")) ?? productosIniciales;

    imprimirElementosEnHTML(productos);

    Swal.fire({
      title: "Productos cargados",
      text: "Los productos se cargaron correctamente.",
      icon: "success",
    });
  } catch (error) {
    console.error("Error al cargar los productos:", error);

    Swal.fire({
      title: "Error",
      text: "No se pudieron cargar los productos.",
      icon: "error",
    });
  } finally {
    console.log("Finalizó la carga de productos");
  }
}


// Obtiene el carrito guardado en localStorage
function obtenerCarritoDelStorage() {
  try {
    let carritoGuardado = localStorage.getItem("carrito");

    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  } catch (error) {
    console.error("No se pudieron obtener los datos del carrito:", error);

    return [];
  } finally {
    console.log("Fin del bloque try-catch");
  }
}

let carrito = obtenerCarritoDelStorage();

function guardarProductos() {
  localStorage.setItem("productos", JSON.stringify(productos));
}

// Muestra los productos en el DOM
function imprimirElementosEnHTML(listaProductos) {
  const productosDOM = document.getElementById("productos");

  productosDOM.innerHTML = "";

  for (const producto of listaProductos) {
    const { nombre, descripcion, precio, imagen, id } = producto;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${imagen}" alt="${nombre}">
      <h3>${nombre}</h3>
      <p>${descripcion}</p>
      <p>$${precio}</p>
      <button class="card-boton" id="comprar${id}">Comprar</button>
      <button class="card-boton" id="eliminar${id}">Eliminar</button>
    `;

    productosDOM.appendChild(card);

    const btnComprar = document.getElementById(`comprar${id}`);

    btnComprar.addEventListener("click", () => {
      agregarProductoAlCarrito(producto);
    });

    const btnEliminar = document.getElementById(`eliminar${id}`);

    btnEliminar.addEventListener("click", () => {
      productos.splice(productos.indexOf(producto), 1);

      guardarProductos();

      imprimirElementosEnHTML(productos);

      const mensajeCarrito = document.getElementById("mensaje-carrito");

      mensajeCarrito.textContent = `Producto "${producto.nombre}" eliminado correctamente`;

      setTimeout(() => {
        mensajeCarrito.textContent = "";
      }, 2000);
    });
  }
}

function agregarProductoAlCarrito(producto) {
  carrito.push(producto);

  localStorage.setItem("carrito", JSON.stringify(carrito));

  const mensajeCarrito = document.getElementById("mensaje-carrito");

  mensajeCarrito.textContent = `Agregaste ${producto.nombre} al carrito`;

  setTimeout(() => {
    mensajeCarrito.textContent = "";
  }, 2000);

  imprimirCarritoEnHTML();
}

function imprimirCarritoEnHTML() {
  const contenedorCarrito = document.getElementById("carrito");

  contenedorCarrito.innerHTML = "";

  const ul = document.createElement("ul");

  let total = 0;

  const mensaje =
    carrito.length === 0
      ? "El carrito está vacío"
      : "Productos en tu carrito";

  carrito.forEach((producto, indice) => {
    ul.innerHTML += `
      <li>
        ${producto.nombre}: $${producto.precio}
        <button class="boton-eliminar-carrito" id="eliminar-carrito${indice}">
          Eliminar
        </button>
      </li>
    `;

    total += Number(producto.precio);
  });

  contenedorCarrito.appendChild(ul);

  const botonesEliminar = document.querySelectorAll(
    ".boton-eliminar-carrito",
  );

  botonesEliminar.forEach((boton, indice) => {
    boton.addEventListener("click", () => {
      carrito.splice(indice, 1);

      localStorage.setItem("carrito", JSON.stringify(carrito));

      imprimirCarritoEnHTML();
    });
  });

  const mensajeCarrito = document.createElement("p");

  mensajeCarrito.textContent = mensaje;

  contenedorCarrito.appendChild(mensajeCarrito);

  const precioTotal = document.createElement("p");

  precioTotal.textContent = `Total: $${total}`;

  contenedorCarrito.appendChild(precioTotal);

  const botonComprarCarrito = document.createElement("button");

  botonComprarCarrito.textContent = "Comprar carrito";

  contenedorCarrito.appendChild(botonComprarCarrito);

  botonComprarCarrito.addEventListener("click", () => {
    carrito.length = 0;

    localStorage.setItem("carrito", JSON.stringify(carrito));

    imprimirCarritoEnHTML();

    const mensajeCompra = document.createElement("p");

    mensajeCompra.textContent = "Compra realizada correctamente";

    contenedorCarrito.appendChild(mensajeCompra);

    setTimeout(() => {
      mensajeCompra.textContent = "";
    }, 2000);
  });
}

imprimirCarritoEnHTML();

const formulario = document.getElementById("formulario");

formulario.addEventListener("submit", tomarDatosForm);

const inputBusqueda = document.querySelector("#formulario input[type='text']");

inputBusqueda.addEventListener("keyup", tomarDatosForm);

function tomarDatosForm(e) {
  e.preventDefault();

  let inputBuscar = document.querySelector(
    "#formulario input[type='text']",
  ).value;

  let productosFiltrados = productos.filter((elemento) =>
    elemento.nombre.toLowerCase().includes(inputBuscar.toLowerCase()),
  );

  imprimirElementosEnHTML(productosFiltrados);
}

// Obtiene los datos del formulario para agregar un producto
function obtenerProductoDelForm() {
  const formParaProducto = document.getElementById("form-agregar-producto");

  formParaProducto.addEventListener("submit", (e) => {
    e.preventDefault();

    const inputNombre = document.getElementById("input-nombre").value;
    const inputPrecio = document.getElementById("input-precio").value;
    const inputImagen = document.getElementById("input-imagen").value;
    const inputDescripcion =
      document.getElementById("input-descripcion").value;

    productos.push({
      id: productos.length + 1,
      nombre: inputNombre,
      precio: inputPrecio,
      imagen: inputImagen,
      descripcion: inputDescripcion,
    });

    guardarProductos();

    imprimirElementosEnHTML(productos);

    const mensajeCarrito = document.getElementById("mensaje-carrito");

    mensajeCarrito.textContent = `Producto "${inputNombre}" agregado correctamente al stock`;

    setTimeout(() => {
      mensajeCarrito.textContent = "";
    }, 2000);

    formParaProducto.reset();
  });
}

obtenerProductoDelForm();

cargarProductos();

setTimeout(() => {
  Swal.fire({
    title: "¡Bienvenido!",
    text: "Recordá revisar tu carrito antes de finalizar la compra.",
    icon: "info",
  });
}, 3000);