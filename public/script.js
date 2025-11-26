// ===========================
// np Función compartida
// ===========================
function showOutput(message) {
    const output = document.getElementById("output");
    if (output) output.innerText = message;
}

    async function cargarPedidos() {
        try {
            const response = await fetch("http://localhost:8080/api/usuarios/misPedidos", {
                headers: {
                    "Authorization": "Basic " + encodeBasicAuth("usuario", "clave123")
                }
            });
            const pedidos = await response.json();

            const contenedor = document.getElementById("mis-pedidos");
            contenedor.innerHTML = `
                <table>
                    <tr><th>ID</th><th>Producto</th><th>Estado</th></tr>
                    ${pedidos.map(p => `<tr><td>${p.id}</td><td>${p.producto}</td><td>${p.estado}</td></tr>`).join("")}
                </table>
            `;
        } catch (error) {
            console.error(error);
        }
    }


// ===========================
//  HOME PAGE (fetchData and nav logic)
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    // Lógica para navegación condicional
    const auth = sessionStorage.getItem('auth');
    const userRole = sessionStorage.getItem('userRole');
    const isAuthenticated = !!auth;
    const isBasicUser = isAuthenticated && userRole === 'basicusuario';
    const isSuperUser = isAuthenticated && userRole === 'superusuario';

    // Función para mostrar/ocultar enlaces
    const toggleNavLinks = () => {
        // Ocultar todos los enlaces por defecto
        document.querySelectorAll('.nav-link').forEach(link => link.style.display = 'none');

        if (!isAuthenticated) {
            // Mostrar enlaces públicos y solo para no autenticados (como Login)
            document.querySelectorAll('.nav-link.public, .nav-link.unauth-only').forEach(link => link.style.display = 'inline-block');
        } else if (isBasicUser) {
            // Mostrar enlaces públicos + requeridos para basicusuario
            document.querySelectorAll('.nav-link.public, .nav-link.basic-required').forEach(link => link.style.display = 'inline-block');
        } else if (isSuperUser) {
            // Mostrar enlaces públicos + requeridos para basicusuario + superusuario
            document.querySelectorAll('.nav-link.public, .nav-link.basic-required, .nav-link.super-required').forEach(link => link.style.display = 'inline-block');
        }
    };

    toggleNavLinks();  // Ejecutar al cargar

    // Lógica existente para fetchData
    if (document.getElementById("fetchData")) {
        console.log("Script loaded. Title is:", document.title);
        document.getElementById("fetchData").addEventListener("click", async () => {
            try {
                const response = await fetch("http://localhost:8080/api/playlist");
                const data = await response.json();
                showOutput(JSON.stringify(data, null, 2));
            } catch (error) {
                showOutput("Error: " + error.message);
            }
        });
    }
});

// ===========================
// LOGIN PAGE
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const credentials = btoa(`${username}:${password}`);

      try {
        // Fetch user data to validate credentials and get role
        const res = await fetch(`http://localhost:8080/api/usuarios/user/${username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${credentials}`
          }
        });

        if (res.ok) {
          const userData = await res.json();  // Asumiendo que devuelve el objeto usuario
          const userRole = userData.rol.nombre || userData.tipoUsuario || 'basicusuario';  // Ajusta según tu backend (e.g., campo 'rol')

          // Login successful - store credentials and role
          sessionStorage.setItem('auth', credentials);
          sessionStorage.setItem('userRole', userRole);  // Almacenar rol para navegación
          window.location.href = '/usuario.html';  // Adjust path if needed
        } else if (res.status === 401 || res.status === 403) {
          alert('Credenciales incorrectas o usuario no autorizado');
        } else if (res.status === 404) {
          alert('Usuario no encontrado');
        } else {
          alert('Error del servidor: ' + res.status);
        }
      } catch (err) {
        alert('Error de conexión con el servidor');
        console.error(err);
      }
    });
  }
});

// ===========================
// LOGOUT METHOD
// ===========================
async function logout() {
    // Clear the auth credentials from sessionStorage
    sessionStorage.removeItem('auth');
    
    // Optional: Clear any other session data (e.g., user info)
    sessionStorage.clear();  // Or remove specific items if you store more
    
    // Redirect to the login page
    window.location.href = '/login.html';  // Adjust to your login page path (e.g., 'login.html' or '/')
    
    // Optional: Prevent back button from accessing the user page
    // history.pushState(null, null, window.location.href);
    // window.onpopstate = () => { window.location.href = '/login.html'; };
}

// ===========================
//  PANTALLA DE USUARIO
// ===========================

if (document.getElementById("perfil-container")) {
   // Retrieve and decode the Base64 credentials from sessionStorage (moved inside for scoping)
    const credentials = sessionStorage.getItem('auth');
    if (!credentials) {
        throw new Error("No se encontraron credenciales en la sesión");
    }
    
    // Decode the Base64 string to get "username:password"
    const decoded = atob(credentials);
    const [username, password] = decoded.split(':');  // Extract username (first part)
    
    // Build the dynamic URL with the extracted username
    const url = `http://localhost:8080/api/usuarios/user/${username}`;

    // Al cargar la página, obtenemos los datos del usuario autenticado desde la API
    async function cargarDatosUsuario() {

        try {
            const response = await fetch(url, {  // Use the dynamic URL here
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Basic ${credentials}`
                }
            });

            if (!response.ok) throw new Error("Error al obtener datos del usuario");

            const usuario = await response.json();

            // Renderizamos los datos en el perfil
            const userInfo = document.getElementById("user-info");
            userInfo.innerHTML = `
                <h2>Datos del Usuario</h2>
                <p><strong>Nombre:</strong> ${usuario.nombre}</p>
                <p><strong>Email:</strong> ${usuario.correo.direccion}</p>
                <p><strong>Rol:</strong> ${usuario.rol.nombre}</p>
            `;

            // Guardamos los datos para usarlos en otras secciones
            window.usuario = usuario;

        } catch (error) {
            console.error(error);
        }
    }

    // Mostrar secciones según el botón
    function mostrarSeccion(seccionId) {
        const secciones = document.querySelectorAll(".section");
        secciones.forEach(sec => sec.style.display = "none");

        const seccion = document.getElementById(seccionId);
        seccion.style.display = "block";

        if (seccionId === "canciones") {
            cargarCanciones();
        } else if (seccionId === "playlists") {
            cargarPlaylists();
        } else if (seccionId === "pedidos") {
            cargarPedidos();
        }
    }

    // Ejemplo: obtener canciones del usuario desde la API con Basic Auth
    async function cargarCanciones() {
        try {
            const response = await fetch("http://localhost:8080/api/usuarios/misCanciones", {
                headers: {
                    "Authorization": `Basic ${credentials}`
                }
            });
            const canciones = await response.json();

            const contenedor = document.getElementById("mis-canciones");
            contenedor.innerHTML = `
                <table>
                    <tr><th>Título</th><th>Artista</th></tr>
                    ${canciones.map(c => `<tr><td>${c.nombre}</td><td>${c.artista}</td></tr>`).join("")}
                </table>
            `;
        } catch (error) {
            console.error(error);
        }
    }

async function cargarPlaylists() {
    try {
        const response = await fetch("http://localhost:8080/api/usuarios/misPlaylist", {
            headers: {
                "Authorization":  `Basic ${credentials}` // Update to use session credentials if needed
            }
        });
        const playlists = await response.json();
        const contenedor = document.getElementById("mis-playlists");
        contenedor.innerHTML = `
            <table>
                <tr><th>Nombre de Playlist</th><th>Canciones</th></tr>
                ${playlists.map(p => {
                    // Build a list of song titles from the p.canciones array
                    const cancionesList = p.canciones && p.canciones.length > 0 
                        ? p.canciones.map(c => `--> ${c.nombre} (por ${c.artista || 'Desconocido'})`).join('<br>')  // Join with line breaks for readability
                        : 'No hay canciones en esta playlist';
                    
                    return `<tr><td>${p.nombre}</td><td>${cancionesList}</td></tr>`;
                }).join("")}
            </table>
        `;
    } catch (error) {
        console.error("Error loading playlists:", error);
        // Optional: Display an error message in the container
        document.getElementById("mis-playlists").innerHTML = "<p>Error al cargar playlists.</p>";
    }
}
    async function cargarPedidos() {
      try {
        const response = await fetch("http://localhost:8080/api/usuarios/misPedidos", {

            headers: {

                "Authorization": `Basic ${credentials}`

            }

        });

        const pedidos = await response.json();



        const contenedor = document.getElementById("mis-pedidos");

        contenedor.innerHTML = `

            <table>

                <tr><th>ID</th><th>Empresa de envios</th><th>Fecha de compra</th></tr>

                ${pedidos.map(p => `<tr><td>${p.idPedido}</td><td>${p.envio.empresaEnvios}</td><td>${p.fecha}</td></tr>`).join("")}

            </table>

        `;

    } catch (error) {

        console.error(error);

    }

}
cargarDatosUsuario();
}

//pantalla de canciones

if (document.getElementById("songsContainer")) {

    const loader = document.getElementById("loader");

    async function addToCart(id, cantidad) {
    try {
        const credentials = sessionStorage.getItem("auth");
        const response = await fetch(`http://localhost:8080/api/carritoCompras/add2cart/cancion/${id}/${cantidad}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${credentials}`
            }
        });

        if (!response.ok) {
            console.error("Error al agregar al carrito:", response.status, response.statusText);
        }
    } catch (e) {
        console.error("Error al agregar al carrito", e);
    }
    }

    async function removeFromCart(id, cantidad) {
    try {
        const credentials = sessionStorage.getItem("auth");
        const response = await fetch(`http://localhost:8080/api/carritoCompras/remove/cancion/${id}/${cantidad}`, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${credentials}`
            }
        });

        if (!response.ok) {
            console.error("Error al remover del carrito:", response.status, response.statusText);
        }
    } catch (e) {
        console.error("Error al remover del carrito", e);
    }
}

    async function displaySongs(url = "http://localhost:8080/api/canciones") {
        loader.style.display = "flex";

        try {
            const response = await fetch(url);
            const songs = await response.json();

            const container = document.getElementById("songsContainer");
            container.innerHTML = "";

            songs.forEach(song => {
                const songCard = document.createElement("div");
                songCard.className = "cancion";

                songCard.innerHTML = `
                    <img src="img/musica.png" alt="cover">
                    <div class="cancion-title">${song.nombre}</div>

                    <div class="song-details" style="display:none;">
                        <p><strong>Artista:</strong> ${song.artista}</p>
                        <p><strong>Año:</strong> ${song.annoPublicacion}</p>
                        <p><strong>Precio:</strong> ${song.precio}</p>
                        <p><strong>Formato:</strong> ${song.formato.nombre}</p>
                    </div>

                    <button class="toggleBtn">Ver detalles</button>
                    
                    <button class="add-cart-btn addBtn">Agregar al carrito</button>

                    <div class="cantidad-controller" style="display:none;">
                        <img src="img/menos.png" class="cantidad-btn menosBtn">
                        <span>1</span>
                        <img src="img/mas.png" class="cantidad-btn masBtn">
                    </div>
                `;

                // detalles
                const btn = songCard.querySelector(".toggleBtn");
                const details = songCard.querySelector(".song-details");

                btn.addEventListener("click", () => {
                    const visible = details.style.display === "block";
                    details.style.display = visible ? "none" : "block";
                    btn.textContent = visible ? "Ver detalles" : "Ocultar detalles";
                });

                // carrito
                const addBtn = songCard.querySelector(".addBtn");
                const controller = songCard.querySelector(".cantidad-controller");
                const spanCant = controller.querySelector("span");
                const masBtn = controller.querySelector(".masBtn");
                const menosBtn = controller.querySelector(".menosBtn");

               addBtn.addEventListener("click", () => {
                    addBtn.style.display = "none";
                    controller.style.display = "flex";
                    addToCart(song.id, 1); // al inicio siempre cantidad = 1
                });

                masBtn.addEventListener("click", () => {
                    let val = parseInt(spanCant.textContent) + 1;
                    spanCant.textContent = val;
                    addToCart(song.id, val); // ahora sí envías la cantidad actual
                });

                menosBtn.addEventListener("click", () => {
                    let val = parseInt(spanCant.textContent);
                    if (val > 1) {
                        spanCant.textContent = val - 1;
                        removeFromCart(song.id, val - 1); // envías la nueva cantidad
                    }
                });

                container.appendChild(songCard);
            });

        } catch (error) {
            document.getElementById("songsContainer").innerText = "Error: " + error.message;
        } finally {
            loader.style.display = "none";
        }
    }

    displaySongs();

    document.getElementById("refreshBtn")?.addEventListener("click", () => {
        displaySongs("http://localhost:8080/api/canciones");
    });

    document.getElementById("viniloBtn")?.addEventListener("click", () => {
        displaySongs("http://localhost:8080/api/canciones/formato/vinilo");
    });

    document.getElementById("digitalBtn")?.addEventListener("click", () => {
        displaySongs("http://localhost:8080/api/canciones/formato/digital");
    });

    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", () => {
            const proveedor = searchInput.value.trim();
            if (proveedor === "") {
                alert("Por favor ingresa un proveedor");
                return;
            }
            displaySongs(`http://localhost:8080/api/canciones/proveedor/${proveedor}`);
        });

        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") searchBtn.click();
        });
    }
}

// ===========================
//  VENTA CANCIONES
// ===========================
if (document.getElementById("form-card-cancion")) {
    const form = document.getElementById("form-card-cancion");
    const loader = document.getElementById("loader");  // Asumiendo que tienes un loader global

    // Definir crearCancion como función global para compatibilidad con onclick (si lo usas)
    window.crearCancion = async function(event) {
        if (event) event.preventDefault();  // Prevenir envío si viene de un form submit

        // Obtener credenciales (asumiendo que están en localStorage tras login)
        const credentials = sessionStorage.getItem('auth');

        if (!credentials) {
            alert("Debes iniciar sesión primero.");
            return;  // No proceder si no hay credenciales
        }

        // Crear el objeto canción (igual que antes)
        const cancion = {
            nombre: document.getElementById("nombre").value,
            artista: document.getElementById("artista").value,
            annoPublicacion: document.getElementById("año").value,
            precio: 5000,
            formato: {
                nombre: "Digital",
                cantidad: parseInt(document.getElementById("formatoCantidad").value)
            }
        };

        // Mostrar loader mientras se envía
        if (loader) loader.style.display = "flex";

        try {

            // Enviar POST al backend con autenticación
            const response = await fetch("http://localhost:8080/api/canciones", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${credentials}` // Header para Basic Auth
                },
                credentials: 'include',  // Incluir cookies para sesiones (omite si no usas cookies)
                body: JSON.stringify(cancion)
            });

            if (response.ok) {
                // Éxito: mostrar mensaje y recargar la lista si existe
                alert("Canción creada exitosamente!");
                document.getElementById("preview").style.display = "none";  // Ocultar preview
                // Recargar la lista de canciones si estamos en la página de songs
                if (document.getElementById("songsContainer")) {
                    displaySongs();  // Llamar a la función de displaySongs para actualizar
                }
            } else if (response.status === 401) {
                // Error de autenticación
                alert("Autenticación fallida. Inicia sesión nuevamente.");
                // Opcional: redirigir a página de login
            } else {
                // Otro error del servidor
                const errorData = await response.json();
                alert("Error al crear la canción: " + (errorData.message || response.statusText));
            }
        } catch (error) {
            // Error de red o fetch
            alert("Error de conexión: " + error.message);
        } finally {
            // Ocultar loader
            if (loader) loader.style.display = "none";
        }

        console.log("Objeto creado:", cancion);  // Mantener el log para debug
    };

    // Agregar event listener al formulario para manejar el submit (recomendado)
    form.addEventListener("submit", crearCancion);
}
// CATALOGO //

if (document.getElementById("catalogo")) {
  // ---------------------------
  // 🔹 FUNCIÓN PRINCIPAL
  // ---------------------------
  async function cargarCatalogo(url = "http://localhost:8080/api/playlist") {
    const loader = document.getElementById("loader");
    loader.style.display = "flex";  // Mostrar pantalla de carga (agregado aquí)

    try {
      const response = await fetch(url);
      const playlists = await response.json();

      const contenedor = document.getElementById("catalogo");
      contenedor.innerHTML = "";

      playlists.forEach(pl => {
        const card = document.createElement("div");
        card.className = "playlist"; // MISMA CLASE QUE TU CSS

        card.innerHTML = `
          <img src="img/disco.jpg" alt="${pl.nombre}">
          <div class="playlist-title">${pl.nombre}</div>

          <button class="btn btn-primary toggleBtn">
              Ver detalles
          </button>
        `;

        const btn = card.querySelector(".toggleBtn");

        btn.addEventListener("click", async () => {
          try {
            const res = await fetch(`http://localhost:8080/api/playlist/${pl.idPlaylist}`);
            const playlistDetails = await res.json();

            // Setear título del modal
            document.getElementById("modalTitle").textContent = playlistDetails.nombre;

            // Crear canciones
            const songsHtml =
              playlistDetails.canciones?.length > 0
                ? playlistDetails.canciones
                    .map(song => `
                      <div class="cancion" style="
                        background:#eef4ff;
                        padding:12px;
                        border-radius:10px;
                        margin-bottom:10px;
                      ">
                        <strong>${song.nombre}</strong> — ${song.artista}
                      </div>
                    `)
                    .join("")
                : "<p>Esta playlist no tiene canciones.</p>";

            document.getElementById("modalSongs").innerHTML = songsHtml;

            // Mostrar modal
            document.getElementById("playlistModal").style.display = "block";
          } catch (err) {
            console.error("Error al cargar detalles:", err);
          }
        });

        contenedor.appendChild(card);
      });

    } catch (error) {
      document.getElementById("catalogo").innerText =
        "Error cargando catálogo: " + error.message;
    }
    finally {
        loader.style.display = "none";  // Ocultar pantalla de carga
    }
  }

  // 🚀 Cargar todo al iniciar
  cargarCatalogo();


  // -----------------------------------------
  // 🔹 FUNCIÓN DE BÚSQUEDA POR PROVEEDOR
  // -----------------------------------------

  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchBtn");

  if (searchButton && searchInput) {
    searchButton.addEventListener("click", () => {
      const nombre = searchInput.value.trim();

      if (nombre.length === 0) {
        // Si está vacío → cargar todo
        cargarCatalogo("http://localhost:8080/api/playlist");
        return;
      }

      // Buscar por proveedor
      const url = `http://localhost:8080/api/playlist/proveedor/${nombre}`;
      cargarCatalogo(url);
    });
  }


  // -----------------------------------------
  // 🔹 CERRAR MODAL
  // -----------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("playlistModal");
    const closeBtn = document.querySelector(".close");

    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  });

}


// Venta de Playlists

if (document.getElementById("form-card-playlist")) {

// Definir funciones globalmente para que onclick las encuentre
let songIndex = 0;

function addSong() {
    const container = document.getElementById("songsContainer");

    const box = document.createElement("div");
    box.className = "song-box";
    box.setAttribute("data-index", songIndex);

    box.innerHTML = `
        <label>Nombre</label>
        <input type="text" id="nombre_${songIndex}" placeholder="Ej: Geyser">

        <label>Artista</label>
        <input type="text" id="artista_${songIndex}" placeholder="Ej: Mitski">

        <label>Año de Publicación</label>
        <input type="text" id="anno_${songIndex}" placeholder="Ej: 2018">

        <label>Precio (fijo)</label>
        <input type="number" id="precio_${songIndex}" value="5000" readonly>

        <label>Formato</label>
        <input type="text" id="formato_${songIndex}" value="Digital" readonly>

        <label>Cantidad</label>
        <input type="number" id="cantidad_${songIndex}" placeholder="Ej: 30">

        <button class="remove-btn" onclick="removeSong(${songIndex})">Eliminar Canción</button>
    `;

    container.appendChild(box);
    songIndex++;
}

function removeSong(index) {
    const box = document.querySelector(`[data-index="${index}"]`);
    if (box) box.remove();
}
window.crearPlaylist=async function(event) {
     if (event) event.preventDefault();  // Prevenir envío si viene de un form submit
    const nombre = document.getElementById("playlistNombre").value.trim();
    const songs = [];

    // Validación básica: nombre no vacío y al menos una canción
    if (!nombre) {
        alert("Por favor, ingresa un nombre para la playlist.");
        return;
    }

    document.querySelectorAll(".song-box").forEach(box => {
        const i = box.getAttribute("data-index");

        const songNombre = document.getElementById(`nombre_${i}`).value.trim();
        const songArtista = document.getElementById(`artista_${i}`).value.trim();
        const songAnno = document.getElementById(`anno_${i}`).value.trim();
        const songCantidad = Number(document.getElementById(`cantidad_${i}`).value);

        // Validación básica por canción (opcional, pero recomendado)
        if (!songNombre || !songArtista || !songAnno || isNaN(songCantidad) || songCantidad <= 0) {
            alert(`Completa todos los campos para la canción ${parseInt(i) + 1}.`);
            return; // Detiene la creación si hay error
        }

        songs.push({
            nombre: songNombre,
            artista: songArtista,
            annoPublicacion: songAnno,
            precio: 5000,
            formato: {
                nombre: "Digital",
                cantidad: songCantidad
            }
        });
    });

    if (songs.length === 0) {
        alert("Agrega al menos una canción a la playlist.");
        return;
    }

    const playlist = {
        nombre: nombre,
        canciones: songs
    };

    // Obtener credenciales de sessionStorage (para Basic Auth)
    const credentials = sessionStorage.getItem('auth');
    if (!credentials) {
        alert("No estás autenticado. Por favor, inicia sesión.");
        // Opcional: redirigir a login: window.location.href = "login.html";
        return;
    }

    try {
        // Enviar POST al backend con Basic Auth
        const response = await fetch("http://localhost:8080/api/playlist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${credentials}`  // Header para Basic Auth
            },
            body: JSON.stringify(playlist)
        });

        if (response.ok) {
            const result = await response.json(); // Asume que el backend devuelve JSON
            alert("Playlist creada exitosamente: " + result.nombre); // Ajusta según la respuesta del backend
            // Opcional: resetear formulario
            document.getElementById("playlistNombre").value = "";
            document.getElementById("songsContainer").innerHTML = "";
            songIndex = 0;
        } else if (response.status === 401) {
            alert("Credenciales inválidas. Por favor, inicia sesión nuevamente.");
            // Opcional: limpiar credenciales y redirigir: sessionStorage.removeItem("auth"); window.location.href = "login.html";
        } else {
            alert("Error al crear la playlist: " + response.status + " - " + response.statusText);
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("Error de conexión al servidor. Revisa la consola para detalles.");
    }
}
}


 
// ===========================
//  HISTORIAL DE PEDIDOS
// ===========================



if (document.getElementById("contenedor-pedidos")) {
     const loader = document.getElementById("loader");
    loader.style.display = "flex";  // Mostrar pantalla de carga
    const credentials = sessionStorage.getItem('auth');

    if (!credentials) {
        alert("No estás autenticado. Redirigiendo al login...");
        window.location.href = '/login.html'; // o la ruta de tu login
    } else {
        fetch("http://localhost:8080/api/pedidos", {
            method: "GET",
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al obtener los pedidos");
            }
            return response.json();
        })
        .then(pedidos => {
            mostrarPedidos(pedidos);
            loader.style.display = "none";  // Ocultar pantalla de carga
        })
        .catch(error => {
            console.error("Error:", error);
        });

        function mostrarPedidos(lista) {
            let html = "<table>";
            html += "<tr><th>ID</th><th>Empresa Envíos</th><th>Calificación</th><th>Descripción</th><th>Fecha</th><th>Comprador</th></tr>";
            lista.forEach(pedido => {
                html += `<tr>
                            <td>${pedido.idPedido}</td>
                            <td>${pedido.envio.empresaEnvios}</td>
                            <td>${pedido.experiencia.calificacion || "Experiencia pendiente"}</td>
                            <td>${pedido.experiencia.descripcion || "Experiencia pendiente"}</td>
                            <td>${pedido.fecha}</td>
                            <td>${pedido.comprador}</td>
                         </tr>`;
            });
            html += "</table>";
            document.getElementById("contenedor-pedidos").innerHTML = html;
        }
    }
}

// ===========================
// LISTAR USUARIOS
// ===========================
if (document.getElementById("contenedor-usuarios")) {
    
    const loader = document.getElementById("loader");
    loader.style.display = "flex";  // Mostrar pantalla de carga

    const credentials = sessionStorage.getItem('auth');

    if (!credentials) {
        alert("No estás autenticado. Redirigiendo al login...");
        window.location.href = '/login.html';
    } 
    else {

        fetch("http://localhost:8080/api/usuarios", {
            method: "GET",
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al obtener los usuarios");
            }
            return response.json();
        })
        .then(usuarios => {
            mostrarUsuarios(usuarios);
            loader.style.display = "none";  // Ocultar pantalla de carga
        })
        .catch(error => {
            console.error("Error:", error);
            loader.style.display = "none";
        });

        function mostrarUsuarios(lista) {
            let html = "<table>";
            html += `
                <tr>
                    <th>ID Persona</th>
                    <th>Usuario</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Tipo ID</th>
                    <th>Dirección</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th>Rol</th>
                </tr>
            `;

            lista.forEach(persona => {
                html += `
                    <tr>
                        <td>${persona.idPersona}</td>
                        <td>${persona.nombreUsuario}</td>
                        <td>${persona.nombre}</td>
                        <td>${persona.apellido}</td>
                        <td>${persona.tipoID}</td>
                        <td>${persona.direccion}</td>
                        <td>${persona.telefono?.codigoNacion || ""} ${persona.telefono?.numero || ""}</td>
                        <td>${persona.correo?.direccion || ""}</td>
                        <td>${persona.rol?.nombre || "Sin rol"}</td>
                    </tr>
                `;
            });

            html += "</table>";
            document.getElementById("contenedor-usuarios").innerHTML = html;
        }
    }
}


// SCRIPT PARA REGISTRO DE USUARIO
if (document.getElementById("form-container")) {

    const form = document.getElementById("registro-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Obtener valores del formulario
        const nombreUsuario = document.getElementById("nombreUsuario").value;
        const nombre = document.getElementById("nombre").value;
        const apellido = document.getElementById("apellido").value;
        const contrasenna = document.getElementById("contrasenna").value;
        const tipoID = document.getElementById("tipoID").value;
        const direccion = document.getElementById("direccion").value;
        const telefono = document.getElementById("telefono").value;
        const codigoNacion = document.getElementById("codigoNacion").value;
        const correo = document.getElementById("correo").value;

        const nuevoUsuario = {
            nombreUsuario,
            nombre,
            apellido,
            contrasenna,
            tipoID,
            direccion,
            telefono: {
                numero: telefono,
                codigoNacion
            },
            correo: {
                direccion: correo
            },
            canciones: [],
            playlists: [],
            pedidos: []
        };

        console.log("Enviando usuario:", nuevoUsuario);

        try {
            const response = await fetch("http://localhost:8080/api/usuarios/crearusuarios", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(nuevoUsuario)
            });

            if (!response.ok) {
                const errorText = await response.text();
                alert("Error al registrar usuario:\n" + errorText);
                return;
            }

           const data = await response.text();
console.log("Respuesta del servidor:", data);


            // Guardar credenciales
            const base64Credentials = btoa(`${nombreUsuario}:${contrasenna}`);
            sessionStorage.setItem("auth", base64Credentials);

            alert("Registro exitoso. ¡Bienvenido!");

            window.location.href = "login.html";

        } catch (error) {
            console.error("Error durante el registro:", error);
            alert("No se pudo registrar el usuario (error en la petición).");
        }
    });
}

//GESTION USUARIO


// VENTA DE VINILO
if (document.getElementById("form-card-vinilo")) {
    let songIndex = 0;

    function addSong() {
        const container = document.getElementById("songsContainer");

        const box = document.createElement("div");
        box.className = "song-box";
        box.setAttribute("data-index", songIndex);

        box.innerHTML = `
            <label>Nombre</label>
            <input type="text" id="nombre_${songIndex}" placeholder="Ej: Geyser">

            <label>Artista</label>
            <input type="text" id="artista_${songIndex}" placeholder="Ej: Mitski">

            <label>Año de Publicación</label>
            <input type="text" id="anno_${songIndex}" placeholder="Ej: 2018">

            <label>Formato</label>
            <input type="text" id="formato_${songIndex}" value="Vinilo" readonly>

            <label>Cantidad</label>
            <input type="number" id="cantidad_${songIndex}" placeholder="Ej: 30">

            <button class="remove-btn" onclick="removeSong(${songIndex})">Eliminar Canción</button>
        `;

        container.appendChild(box);
        songIndex++;
    }

    function removeSong(index) {
        const box = document.querySelector(`[data-index="${index}"]`);
        if (box) box.remove();
    }

    // ✅ Adaptación con fetch al backend
    window.crearVinilo = async function(event) {
        if (event) event.preventDefault();

        const nombre = document.getElementById("viniloNombre").value.trim();
        const precioTotal = document.getElementById("viniloPrecio").value.trim();
        const songs = [];

        // Validación básica
        if (!nombre) {
            alert("Por favor, ingresa un nombre para el vinilo.");
            return;
        }

        document.querySelectorAll(".song-box").forEach(box => {
            const i = box.getAttribute("data-index");

            const songNombre = document.getElementById(`nombre_${i}`).value.trim();
            const songArtista = document.getElementById(`artista_${i}`).value.trim();
            const songAnno = document.getElementById(`anno_${i}`).value.trim();
            const songCantidad = Number(document.getElementById(`cantidad_${i}`).value);

            if (!songNombre || !songArtista || !songAnno || isNaN(songCantidad) || songCantidad <= 0) {
                alert(`Completa todos los campos para la canción ${parseInt(i) + 1}.`);
                return;
            }

            songs.push({
                nombre: songNombre,
                artista: songArtista,
                annoPublicacion: songAnno,
                precio: precioTotal,
                formato: {
                    nombre: "Vinilo",
                    cantidad: songCantidad
                }
            });
        });

        if (songs.length === 0) {
            alert("Agrega al menos una canción al vinilo.");
            return;
        }

        const vinilo = {
            nombre: nombre,
            canciones: songs,
            precioTotal: precioTotal/ songs.length  // Precio promedio por canción
        };

        // Credenciales
        const credentials = sessionStorage.getItem('auth');
        if (!credentials) {
            alert("No estás autenticado. Por favor, inicia sesión.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/api/playlist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Basic ${credentials}`
                },
                body: JSON.stringify(vinilo)
            });

            if (response.ok) {
                const result = await response.json();
                alert("Vinilo creado exitosamente: " + result.nombre);
                // Resetear formulario
                document.getElementById("viniloNombre").value = "";
                document.getElementById("viniloPrecio").value = "";
                document.getElementById("songsContainer").innerHTML = "";
                songIndex = 0;
            } else if (response.status === 401) {
                alert("Credenciales inválidas. Por favor, inicia sesión nuevamente.");
            } else {
                alert("Error al crear el vinilo: " + response.status + " - " + response.statusText);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("Error de conexión al servidor. Revisa la consola para detalles.");
        }
    };
}

