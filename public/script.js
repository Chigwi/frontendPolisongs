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
//  HOME PAGE (fetchData)
// ===========================
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
        const res = await fetch('http://localhost:8080/api/pedidos', {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${credentials}`
          }
        });

        if (res.ok) {
          sessionStorage.setItem('auth', credentials);
          window.location.href = '/usuario.html';
        } else {
          alert('Credenciales incorrectas');
        }
      } catch (err) {
        alert('Error de conexión con el servidor');
        console.error(err);
      }
    });
  }
});

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

   



// ===========================
//  SONGS PAGE
// ===========================
if (document.getElementById("songsContainer")) {

    const loader = document.getElementById("loader");
    loader.style.display = "flex";  // Mostrar pantalla de carga

    async function displaySongs() {
        try {
            const response = await fetch("http://localhost:8080/api/canciones");
            const songs = await response.json();
            
            const container = document.getElementById("songsContainer");
            container.innerHTML = "";

            songs.forEach(song => {
                const songCard = document.createElement("div");
                songCard.className = "cancion";

                // PRIMERO agregamos el HTML
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
                `;

                // LUEGO seleccionamos los elementos
                const btn = songCard.querySelector(".toggleBtn");
                const details = songCard.querySelector(".song-details");

                // Y AHORA agregamos el evento
                btn.addEventListener("click", () => {
                    const visible = details.style.display === "block";

                    details.style.display = visible ? "none" : "block";
                    btn.textContent = visible ? "Ver detalles" : "Ocultar detalles";
                });

                container.appendChild(songCard);
            });

        } catch (error) {
            document.getElementById("songsContainer").innerText =
                "Error: " + error.message;
        }
         finally {
        loader.style.display = "none";  // Ocultar pantalla de carga
    }
    }

    displaySongs();
}

//CATALOGO//



if (document.getElementById("catalogo")) {
   const loader = document.getElementById("loader");
    loader.style.display = "flex";  // Mostrar pantalla de carga
  async function cargarCatalogo() {
    try {
      const response = await fetch("http://localhost:8080/api/playlist");
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

            // Crear canciones con estilo limpio
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

  cargarCatalogo();

  // Cerrar modal
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


