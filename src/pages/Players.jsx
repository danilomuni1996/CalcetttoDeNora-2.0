import { useState, useEffect } from 'react';
import { API_URL } from '../api';

const PlayersList = ({ players, setPlayers }) => {
    const deletePlayer = async (id) => {
        if (!confirm(`Sei sicuro di voler eliminare il giocatore con ID ${id}?`)) return;
        try {
            const response = await fetch(`${API_URL}/players/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setPlayers(players.filter(p => p.id !== id));
                alert('Giocatore eliminato!');
            } else {
                const errorData = await response.json();
                alert(`Errore: ${errorData.detail}`);
            }
        } catch (error) {
            alert('Errore di rete.');
        }
    };

    return (
        <div className="players-list">
            <h2>Elenco Giocatori</h2>
            {/* TRASFORMAZIONE DA LISTA A TABELLA */}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Foto</th>
                        <th>Nome</th>
                        <th>Ruolo Preferito</th>
                        <th>Punti</th>
                        <th>Azioni</th>
                    </tr>
                </thead>
                <tbody>
                    {players.map(player => (
                        <tr key={player.id}>
                            {/* AGGIUNTA ID GIOCATORE */}
                            <td>{player.id}</td>
                            <td>
                                {player.photo_url ? <img src={`${API_URL}${player.photo_url}`} alt={player.name} width="50" /> : 'N/A'}
                            </td>
                            <td>{player.name}</td>
                            <td>{player.preferred_role || 'N/D'}</td>
                            <td>{player.points}</td>
                            <td>
                                <button className='delete-button' onClick={() => deletePlayer(player.id)}>Elimina</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AddPlayerForm = ({ setPlayers }) => {
    const [name, setName] = useState('');
    const [preferredRole, setPreferredRole] = useState('');
    const [photo, setPhoto] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        if (preferredRole) formData.append('preferred_role', preferredRole);
        if (photo) formData.append('photo', photo);

        try {
            const response = await fetch(`${API_URL}/players`, { method: 'POST', body: formData });
            if (response.ok) {
                const newPlayer = await response.json();
                setPlayers(prev => [...prev, newPlayer].sort((a, b) => a.name.localeCompare(b.name)));
                setName('');
                setPreferredRole('');
                setPhoto(null);
                e.target.reset();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Errore');
            }
        } catch (err) {
            setError('Errore di connessione.');
        }
    };

    return (
        <div className="add-player-form">
            <h2>Aggiungi Giocatore</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" required />
                <select value={preferredRole} onChange={(e) => setPreferredRole(e.target.value)}>
                    <option value="">Seleziona ruolo</option>
                    <option value="attaccante">Attaccante</option>
                    <option value="portiere">Portiere</option>
                </select>
                <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
                <button type="submit">Aggiungi</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
};

const Players = () => {
    const [players, setPlayers] = useState([]);
    useEffect(() => {
        fetch(`${API_URL}/players`).then(res => res.json()).then(data => setPlayers(data.sort((a, b) => a.name.localeCompare(b.name))));
    }, []);

    return (
        <div>
            <AddPlayerForm setPlayers={setPlayers} />
            <PlayersList players={players} setPlayers={setPlayers} />
        </div>
    );
};

export default Players;
