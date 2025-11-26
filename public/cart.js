// -------------------------------------------
//     Cargar Carrito del Usuario al inicio
// -------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    loadCart();
});


// =====================================
//         CARGAR CARRITO
// =====================================
async function loadCart() {
    const credentials = sessionStorage.getItem("auth");

    const cartBox = document.getElementById("cartItems");
    const emptyCart = document.getElementById("emptyCart");

    cartBox.innerHTML = "Cargando...";

    try {
        const response = await fetch(`http://localhost:8080/api/carritoCompras/cart`, {
            headers: { "Authorization": `Basic ${credentials}` }
        });

        const cart = await response.json();

        // Si el carrito está vacío → cambiar vista
        if (!cart.items || cart.items.length === 0) {
            cartBox.style.display = "none";
            emptyCart.style.display = "block";

            document.getElementById("subtotalValue").textContent = "0";
            document.getElementById("ivaValue").textContent = "0";
            document.getElementById("totalValue").textContent = "0";
            return;
        }

        renderCart(cart);

    } catch (error) {
        cartBox.innerHTML = "Error cargando el carrito.";
        console.error(error);
    }
}



// =====================================
//   RENDERIZAR CARRITO Y TOTALES
// =====================================
function renderCart(cart) {
    const container = document.getElementById("cartItems");
    const emptyCart = document.getElementById("emptyCart");

    emptyCart.style.display = "none";
    container.style.display = "block";

    container.innerHTML = "";
    let subtotal = 0;

    cart.items.forEach(item => {

        const precioUnit = item.precio / item.cantidad;
        subtotal += precioUnit * item.cantidad;

        const div = document.createElement("div");
        div.className = "cart-item";

        div.innerHTML = `
            <div class="info">
                <div class="item-title">Item #${item.itemId}</div>
                <div class="item-type">Tipo: ${item.tipoItem}</div>
            </div>

            <div class="cantidad-controller">
                <img src="img/menos.png" class="btnRestar">
                <span class="cantidad">${item.cantidad}</span>
                <img src="img/mas.png" class="btnSumar">
            </div>

            <div class="price">
                $${(precioUnit * item.cantidad).toFixed(2)}
            </div>
        `;

        const btnSumar = div.querySelector(".btnSumar");
        const btnRestar = div.querySelector(".btnRestar");
        const spanCant = div.querySelector(".cantidad");
        const priceDiv = div.querySelector(".price");

        btnSumar.addEventListener("click", async () => {
            const nueva = parseInt(spanCant.textContent) + 1;
            spanCant.textContent = nueva;

            priceDiv.textContent = `$${(precioUnit * nueva).toFixed(2)}`;

            await updateItem(item, nueva);
        });

        btnRestar.addEventListener("click", async () => {
            const actual = parseInt(spanCant.textContent);
            if (actual > 1) {
                const nueva = actual - 1;
                spanCant.textContent = nueva;

                priceDiv.textContent = `$${(precioUnit * nueva).toFixed(2)}`;

                await updateItem(item, nueva);
            }
        });

        container.appendChild(div);
    });

    const iva = subtotal * 0.19;
    const envio = 0;
    const total = subtotal + iva;

    document.getElementById("subtotalValue").textContent = subtotal.toFixed(2);
    document.getElementById("ivaValue").textContent = iva.toFixed(2);
    document.getElementById("totalValue").textContent = total.toFixed(2);
}



// =====================================
//   Actualizar cantidad en backend
// =====================================
async function updateItem(item, newQuantity) {
    const credentials = sessionStorage.getItem("auth");

    try {
        if (newQuantity > item.cantidad) {
            await fetch(`http://localhost:8080/api/carritoCompras/add2cart/${item.tipoItem}/${item.itemId}/1`, {
                method: "POST",
                headers: { "Authorization": `Basic ${credentials}` }
            });
        } else {
            await fetch(`http://localhost:8080/api/carritoCompras/remove/${item.tipoItem}/${item.itemId}/1`, {
                method: "POST",
                headers: { "Authorization": `Basic ${credentials}` }
            });
        }

        loadCart();

    } catch (error) {
        console.error("Error actualizando item:", error);
    }
}



// =====================================
//         CHECKOUT (BOTÓN FINAL)
// =====================================
async function checkout() {
    const credentials = sessionStorage.getItem("auth");

    try {
        const response = await fetch(`http://localhost:8080/api/carritoCompras/cart/checkout`, {
            method: "POST",
            headers: { "Authorization": `Basic ${credentials}` }
        });

        const result = await response.json();

        // --------------------------
        //   COMPRA EXITOSA
        // --------------------------
        if (!result.items || result.items.length === 0) {

            mostrarModal("Compra Exitosa", "Tu pago fue procesado correctamente. 🎉");

            // Vaciar carrito en la vista
            document.getElementById("cartItems").innerHTML = "";
            document.getElementById("cartItems").style.display = "none";

            document.getElementById("emptyCart").style.display = "block";

            document.getElementById("subtotalValue").textContent = "0";
            document.getElementById("ivaValue").textContent = "0";
            document.getElementById("totalValue").textContent = "0";

            return;
        }

        // --------------------------
        //   COMPRA FALLIDA
        // --------------------------
        mostrarModal("Error en la Compra", "Ocurrió un problema. Intenta nuevamente.");

    } catch (error) {
        mostrarModal("Error", "No se pudo conectar con el servidor.");
        console.error(error);
    }
}



// =====================================
//           MODAL DE MENSAJE
// =====================================
function mostrarModal(titulo, mensaje) {
    document.getElementById("modalTitulo").textContent = titulo;
    document.getElementById("modalMensaje").textContent = mensaje;

    document.getElementById("modalCompra").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modalCompra").style.display = "none";
}
