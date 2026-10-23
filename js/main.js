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

await Swal.fire({
  title: "¡Bienvenido!",
  text: "Recordá revisar tu carrito antes de finalizar la compra.",
  icon: "info",
});

Toastify({
  text: "Productos cargados correctamente",
  duration: 3000,
  gravity: "top",
  position: "right",
}).showToast();

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
     precio: Number(inputPrecio),
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