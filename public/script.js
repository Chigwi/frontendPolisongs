// Shared functions (e.g., for all pages)
function showOutput(message) {
    const output = document.getElementById('output');
    if (output) output.innerText = message;
}

// Home page logic
if (document.getElementById('fetchData')) {
    document.getElementById('fetchData').addEventListener('click', async () => {
        try {
            const response = await fetch('http://localhost:8080/api/playlist');
            const data = await response.json();
            showOutput(JSON.stringify(data));
        } catch (error) {
            showOutput('Error: ' + error.message);
        }
    });
}

// Login page logic
if (document.getElementById('loginSubmit')) {
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
            if (response.ok) window.location.href = 'songs.html';  // Redirect on success
        } catch (error) {
            document.getElementById('loginOutput').innerText = 'Error: ' + error.message;
        }
    });
}

// Songs page logic
if (document.getElementById('loadSongs')) {
    document.getElementById('loadSongs').addEventListener('click', async () => {
        try {
            const response = await fetch('http://localhost:8080/api/canciones');
            const songs = await response.json();
            displaySongs(songs);
        } catch (error) {
            document.getElementById('songsContainer').innerText = 'Error: ' + error.message;
        }
    });

   function displaySongs(songs) {
    const container = document.getElementById('songsContainer');
    container.innerHTML = '';  // Clear previous content
    songs.forEach(song => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        songCard.innerHTML = `
            <h3>${song.nombre}</h3>  <!-- Changed from song.title to song.nombre -->
            <p>Artist: ${song.artista}</p>  <!-- Changed from song.artist to song.artista -->
            <p>Year: ${song.annoPublicacion}</p>  <!-- Changed from song.album to song.annoPublicacion -->
            <p>Price: $${song.precio}</p>  <!-- Added price -->
            <p>Format: ${song.formato.nombre}</p>  <!-- Added format -->
            <button onclick="playSong(${song.nombre})">Play</button>  <!-- Use nombre if no ID -->
        `;
        container.appendChild(songCard);
    });
}


    function playSong(nomre) {
        alert(`Playing song ID: ${nombre}`);
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