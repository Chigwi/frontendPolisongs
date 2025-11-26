// -------------------------------------------
//     Cargar Carrito del Usuario al inicio
// -------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    loadCart();
});


async function loadCart() {
    const credentials = sessionStorage.getItem("auth");

    const cartBox = document.getElementById("cartItems");
    cartBox.innerHTML = "Cargando...";

    try {
        const response = await fetch(`http://localhost:8080/api/carritoCompras/cart`, {
            headers: { "Authorization": `Basic ${credentials}` }
        });

        const cart = await response.json();
        renderCart(cart);

    } catch (error) {
        cartBox.innerHTML = "Error cargando el carrito.";
        console.error(error);
    }
}



// ----------------------------------------------------
//   Renderizar carrito y calcular totales correctamente
// ----------------------------------------------------
function renderCart(cart) {
    const container = document.getElementById("cartItems");
    container.innerHTML = "";

    let subtotal = 0;

    cart.items.forEach(item => {
        // Precio unitario real → evita errores cuando el backend trae precio total
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

    // ---- CALCULOS ----
    const iva = subtotal * 0.19;
    const envio = 0; // Según tu diseño → NO se cobra envío
    const total = subtotal + iva + envio;

    // ---- ACTUALIZAR EN LA PANTALLA ----
    document.getElementById("subtotalValue").textContent = subtotal.toFixed(2);
    document.getElementById("ivaValue").textContent = iva.toFixed(2);
    document.getElementById("totalValue").textContent = total.toFixed(2);
}



// --------------------------------------------------
//   Actualizar cantidad en el backend y recargar
// --------------------------------------------------
async function updateItem(item, newQuantity) {
    const credentials = sessionStorage.getItem("auth");

    try {
        if (newQuantity > item.cantidad) {
            // Aumentar
            await fetch(`http://localhost:8080/api/carritoCompras/add2cart/${item.tipoItem}/${item.itemId}/1`, {
                method: "POST",
                headers: { "Authorization": `Basic ${credentials}` }
            });
        } else {
            // Disminuir
            await fetch(`http://localhost:8080/api/carritoCompras/remove/${item.tipoItem}/${item.itemId}/1`, {
                method: "POST",
                headers: { "Authorization": `Basic ${credentials}` }
            });
        }

        // Recargar para obtener cantidades reales desde el backend
        loadCart();

    } catch (error) {
        console.error("Error actualizando item:", error);
    }
}
