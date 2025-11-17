document.getElementById('fetchData').addEventListener('click', async () => {
    try {
        // Replace with your Spring Boot API endpoint (e.g., http://localhost:8080/api/data)
        const response = await fetch('http://localhost:8080/api/your-endpoint');
        const data = await response.json();
        document.getElementById('output').innerText = JSON.stringify(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});