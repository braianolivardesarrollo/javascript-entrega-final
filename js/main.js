let productos = [];

// Carga los productos desde el archivo JSON
async function cargarProductos() {
  const estadoCarga = document.getElementById("estado-carga");

  estadoCarga.textContent = "Cargando productos...";

  try {
    const respuesta = await fetch("./data/productos.json");

    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar los productos");
    }

    const productosIniciales = await respuesta.json();

    productos =
      JSON.parse(localStorage.getItem("productos")) || productosIniciales;

    imprimirElementosEnHTML(productos);

    Swal.fire({
      title: "Productos cargados",
      text: "Los productos se cargaron correctamente.",
      icon: "success",
    });
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: "No se pudieron cargar los productos.",
      icon: "error",
    });
  } finally {
    estadoCarga.textContent = "";
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
      <button class="card-boton" id="comprar${id}">
  Agregar al carrito
</button> 
    `;

    productosDOM.appendChild(card);

    const btnComprar = document.getElementById(`comprar${id}`);

    btnComprar.addEventListener("click", () => {
      agregarProductoAlCarrito(producto);
    });
  }
}



function agregarProductoAlCarrito(producto) {
  const productoEnCarrito = carrito.find(
    (elemento) => elemento.id === producto.id
  );

  if (productoEnCarrito) {
    productoEnCarrito.cantidad++;
  } else {
    carrito.push({
      ...producto,
      cantidad: 1,
    });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));

  Toastify({
    text: `${producto.nombre} agregado al carrito`,
    duration: 2000,
  }).showToast();

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
    const cantidad = producto.cantidad || 1;
    const subtotal = Number(producto.precio) * cantidad;

    total += subtotal;

    ul.innerHTML += `
      <li>
        ${producto.nombre}: $${producto.precio}
        <br>
        Cantidad: ${cantidad}
        <button class="boton-restar" data-indice="${indice}">−</button>
        <button class="boton-sumar" data-indice="${indice}">+</button>
        <br>
        Subtotal: $${subtotal}
        <button class="boton-eliminar-carrito" data-indice="${indice}">
          Eliminar
        </button>
      </li>
    `;
  });

  contenedorCarrito.appendChild(ul);

  const mensajeCarrito = document.createElement("p");
  mensajeCarrito.textContent = mensaje;
  contenedorCarrito.appendChild(mensajeCarrito);

  const precioTotal = document.createElement("p");
  precioTotal.textContent = `Total: $${total}`;
  contenedorCarrito.appendChild(precioTotal);

  // Botón para sumar unidades
  document.querySelectorAll(".boton-sumar").forEach((boton) => {
    boton.addEventListener("click", () => {
      const indice = Number(boton.dataset.indice);

      carrito[indice].cantidad = (carrito[indice].cantidad || 1) + 1;

      guardarCarrito();
    });
  });

  // Botón para restar unidades
  document.querySelectorAll(".boton-restar").forEach((boton) => {
    boton.addEventListener("click", () => {
      const indice = Number(boton.dataset.indice);

      carrito[indice].cantidad = (carrito[indice].cantidad || 1) - 1;

      if (carrito[indice].cantidad <= 0) {
        carrito.splice(indice, 1);
      }

      guardarCarrito();
    });
  });

  // Eliminar un producto del carrito
  document.querySelectorAll(".boton-eliminar-carrito").forEach((boton) => {
    boton.addEventListener("click", () => {
      const indice = Number(boton.dataset.indice);

      carrito.splice(indice, 1);

      guardarCarrito();
    });
  });

  // Botón para vaciar todo el carrito
  const botonVaciar = document.createElement("button");
  botonVaciar.textContent = "Vaciar carrito";
  contenedorCarrito.appendChild(botonVaciar);

  botonVaciar.addEventListener("click", () => {
    carrito = [];
    guardarCarrito();
  });

  // Botón para finalizar la compra
  const botonComprarCarrito = document.createElement("button");
  botonComprarCarrito.textContent = "Finalizar compra";
  contenedorCarrito.appendChild(botonComprarCarrito);

  botonComprarCarrito.addEventListener("click", async () => {
    if (carrito.length === 0) {
      Swal.fire({
        title: "Carrito vacío",
        text: "Agregá productos antes de realizar la compra.",
        icon: "warning",
      });

      return;
    }

    const resultado = await Swal.fire({
      title: "Confirmar compra",
      text: `¿Confirmás tu compra por $${total}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, comprar",
      cancelButtonText: "Cancelar",
    });

    if (resultado.isConfirmed) {
      carrito = [];
      guardarCarrito();

      Swal.fire({
        title: "¡Compra realizada!",
        text: `Tu compra por $${total} se realizó correctamente.`,
        icon: "success",
      });
    }
  });
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  imprimirCarritoEnHTML();
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

      if (!inputNombre.trim() || !inputPrecio || Number(inputPrecio) <= 0) {
  Swal.fire({
    title: "Datos incompletos",
    text: "Ingresá el nombre del producto y un precio mayor que cero.",
    icon: "warning",
  });

  return;
}

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