// ===========================
// np Función compartida
// ===========================
function showOutput(message) {
    const output = document.getElementById("output");
    if (output) output.innerText = message;
}



// ===========================
//  HOME PAGE (fetchData)
// ===========================
if (document.getElementById("fetchData")) {
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
          alert('Credenciales correctas');
          window.location.href = '/pedidos.html';
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
//  SONGS PAGE
// ===========================
if (document.getElementById("songsContainer")) {

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
    }

    displaySongs();
}


if (document.getElementById("catalogo")) {
  async function cargarCatalogo() {
    try {
      const response = await fetch("http://localhost:8080/api/playlist");
      const playlists = await response.json();

      const contenedor = document.getElementById("catalogo");
      contenedor.innerHTML = "";

      playlists.forEach(pl => {
        const card = document.createElement("div");
        card.className = "playlist-card";

        card.innerHTML = `
          <img src="img/disco.jpg" alt="${pl.nombre}">
          <h3>${pl.nombre}</h3>
          <button class="toggleBtn">Ver detalles</button>
        `;

        const btn = card.querySelector(".toggleBtn");

        btn.addEventListener("click", async () => {
          try {
            const res = await fetch(`http://localhost:8080/api/playlist/${pl.idPlaylist}`);
            const playlistDetails = await res.json();

            // Título del modal
            document.getElementById("modalTitle").textContent = playlistDetails.nombre;

            // Canciones en el modal
            const songsHtml = playlistDetails.canciones && playlistDetails.canciones.length > 0
              ? playlistDetails.canciones.map(song => `
                  <div class="cancion">
                    <p><strong>${song.nombre}</strong> - ${song.artista}</p>
                  </div>
                `).join("")
              : "<p>Esta playlist no tiene canciones.</p>";

            document.getElementById("modalSongs").innerHTML = songsHtml;

            // Mostrar el modal
            document.getElementById("playlistModal").style.display = "block";
          } catch (err) {
            console.error("Error al cargar detalles:", err);
          }
        });

        contenedor.appendChild(card);
      });

    } catch (error) {
      document.getElementById("catalogo").innerText = "Error cargando catálogo: " + error.message;
    }
  }

  cargarCatalogo();

  // Lógica para cerrar el modal
  document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("playlistModal");
    const closeBtn = document.querySelector(".close");

    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  });
}



// ===========================
//  HISTORIAL DE PEDIDOS
// ===========================

if (document.getElementById("contenedor-pedidos")) {
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


/*
// Screen switching
document.getElementById('homeBtn').addEventListener('click', () => showScreen('homeScreen'));
document.getElementById('loginBtn').addEventListener('click', () => showScreen('loginScreen'));
document.getElementById('dashboardBtn').addEventListener('click', () => showScreen('dashboardScreen'));

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(screenId).style.display = 'block';
}

// Login example (connect to backend)
document.getElementById('loginSubmit').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch('http://localhost:8080/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        document.getElementById('loginOutput').innerText = result.message || 'Login successful!';
        // On success, switch to dashboard
        if (response.ok) showScreen('dashboardScreen');
    } catch (error) {
        document.getElementById('loginOutput').innerText = 'Error: ' + error.message;
    }
});

document.getElementById('fetchData').addEventListener('click', async () => {
    try {
        // Replace with your actual Spring Boot endpoint (e.g., http://localhost:8080/api/users)
        const response = await fetch('http://localhost:8080/api/playlist');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        console.log('Data from backend:', data);
        // Display data on the page (e.g., update #output div)
        document.getElementById('output').innerText = JSON.stringify(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('output').innerText = 'Error: ' + error.message;
    }
});

// Existing fetch code for home screen...*/