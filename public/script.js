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
if (document.getElementById("loginSubmit")) {
    document.getElementById("loginSubmit").addEventListener("click", async () => {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://localhost:8080/api/usuarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            document.getElementById("loginOutput").innerText =
                result.message || "Login successful!";

            if (response.ok) {
                window.location.href = "songs.html";
            }
        } catch (error) {
            document.getElementById("loginOutput").innerText =
                "Error: " + error.message;
        }
    });
}



// ===========================
//  SONGS PAGE
// ===========================
if (document.getElementById("songsContainer")) {

     async function displaySongs(songs) {
        try {
            const response = await fetch("http://localhost:8080/api/canciones");
            const songs = await response.json();
            
            const container = document.getElementById("songsContainer");
            container.innerHTML = "";

            songs.forEach(song => {
            const songCard = document.createElement("div");
            songCard.className = "cancion";

            songCard.innerHTML = `
                <img src="https://via.placeholder.com/200x200?text=No+Cover" alt="cover">
                <div class="cancion-title">${song.nombre}</div>
                <p>Formato: ${song.formato.nombre}</p>
                <button onclick="playSong('${song.nombre.replace(/'/g, "\\'")}')">Play</button>
            `;

            container.appendChild(songCard);
            });
        } catch (error) {
            document.getElementById("songsContainer").innerText =
                "Error: " + error.message;
        }
    }
        displaySongs();


    window.playSong = function (songName) {
        alert(`Reproduciendo: ${songName}`);
    };

}



// ===========================
//  CATÁLOGO DE PLAYLISTS
// ===========================
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
                    <img src="${pl.cover}" alt="${pl.nombre}">
                    <h3>${pl.nombre}</h3>
                `;

                contenedor.appendChild(card);
            });

        } catch (error) {
            showOutput("Error cargando catálogo: " + error.message);
        }
    }

   cargarCatalogo();
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