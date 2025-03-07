document.addEventListener('DOMContentLoaded', () => {
    loadArtists();
});

async function loadArtists() {
    const container = document.getElementById('artists-container');
    try {
        container.innerHTML = '<div class="loading">Loading artists...</div>';
        
        const response = await fetch('http://localhost:5000/api/artists');
        if (!response.ok) throw new Error('Failed to load artists');
        
        const artists = await response.json();
        renderArtists(artists);
    } catch (error) {
        container.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        console.error('Error:', error);
    }
}

function renderArtists(artists) {
    const container = document.getElementById('artists-container');

    if (artists.length === 0) {
        container.innerHTML = '<div class="empty-state">No artists found</div>';
        return;
    }

    container.innerHTML = artists.map(artist => `
        <div class="artist-card" data-id="${artist.artist_id}">
            <div class="artist-header">
                <h3>${artist.name}</h3>
                <button class="icon-btn" onclick="deleteArtist(${artist.artist_id})">×</button>
            </div>
            <div class="artist-body">
                <p>✉️ ${artist.email || artist.contact_info}</p>
                <p>🎨 ${artist.specialization}</p>
            </div>
        </div>
    `).join('');
}
async function addArtist() {
    const newArtist = {
        name: document.getElementById('artistName').value,
        email: document.getElementById('artistEmail').value,
        specialization: document.getElementById('artistSpecialization').value
    };

    try {
        const response = await fetch('http://localhost:5000/api/artists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newArtist)
        });

        if (response.ok) {
            loadArtists();
            clearForm();
        }
    } catch (error) {
        alert('Error adding artist: ' + error.message);
        console.error('Error:', error);
    }
}

async function deleteArtist(artistId) {
    if (confirm('Are you sure you want to delete this artist?')) {
        try {
            await fetch(`http://localhost:5000/api/artists/${artistId}`, { method: 'DELETE' });
            loadArtists();
        } catch (error) {
            alert('Error deleting artist: ' + error.message);
            console.error('Error:', error);
        }
    }
}

function clearForm() {
    ['artistName', 'artistEmail', 'artistSpecialization'].forEach(id => {
        document.getElementById(id).value = '';
    });
}