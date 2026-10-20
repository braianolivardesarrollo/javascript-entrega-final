// Obtiene el carrito guardado en localStorage
function obtenerCarritoDelStorage() {
  try {
    let carritoGuardado = localStorage.getItem("carrito");

    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  } catch (error) {
    console.error("No se pudieron obtener los datos del carrito:", error);

    return [];
  }
}

let carrito = obtenerCarritoDelStorage();

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
