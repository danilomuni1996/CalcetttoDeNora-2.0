import { useState, useEffect } from 'react';
import { API_URL } from '../api';

const NewMatch = () => {
    const [players, setPlayers] = useState([]);
    const [teamA, setTeamA] = useState({ attacker: '', goalkeeper: '' });
    const [teamB, setTeamB] = useState({ attacker: '', goalkeeper: '' });
    const [winner, setWinner] = useState(null); // 'A' o 'B'
    const [isCappotto, setIsCappotto] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/players`)
            .then(res => res.json())
            .then(data => setPlayers(data.sort((a, b) => a.name.localeCompare(b.name))))
            .catch(err => console.error("Errore caricamento giocatori:", err));
    }, []);

    const handleSave = async () => {
        setError('');
        setSuccess('');

        const allPlayerIds = [teamA.attacker, teamA.goalkeeper, teamB.attacker, teamB.goalkeeper];
        if (allPlayerIds.some(id => !id)) {
            setError('Tutti i ruoli devono essere assegnati.');
            return;
        }
        if (new Set(allPlayerIds).size !== 4) {
            setError('Ogni giocatore deve essere unico.');
            return;
        }
        if (!winner) {
            setError('Seleziona un vincitore.');
            return;
        }
        
        let score_a = 0;
        let score_b = 0;

        if (winner === 'A') {
            score_a = isCappotto ? 6 : 1;
            score_b = 0;
        } else if (winner === 'B') {
            score_a = 0;
            score_b = isCappotto ? 6 : 1;
        }

        const matchData = {
            teamA_attacker_id: parseInt(teamA.attacker),
            teamA_goalkeeper_id: parseInt(teamA.goalkeeper),
            teamB_attacker_id: parseInt(teamB.attacker),
            teamB_goalkeeper_id: parseInt(teamB.goalkeeper),
            score_a,
            score_b,
        };

        try {
            const response = await fetch(`${API_URL}/matches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(matchData)
            });

            if (response.ok) {
                setSuccess('Partita registrata con successo!');
                setTeamA({ attacker: '', goalkeeper: '' });
                setTeamB({ attacker: '', goalkeeper: '' });
                setWinner(null);
                setIsCappotto(false);
            } else {
                const err = await response.json();
                setError(err.detail || 'Errore nella registrazione della partita.');
            }
        } catch (err) {
            setError('Errore di connessione al server.');
        }
    };
    
    return (
        <div className="form-container">
            <h2>Registra Nuova Partita</h2>
            
            <div className="teams-container">
                {/* Team A & B (invariati) */}
                <div className="team-column">
                    <fieldset>
                        <legend>Team A</legend>
                        <div className="form-field">
                            <label htmlFor="teamA-attacker">Attaccante:</label>
                            <select id="teamA-attacker" value={teamA.attacker} onChange={e => setTeamA({ ...teamA, attacker: e.target.value })}>
                                <option value="">Seleziona</option>
                                {players.map(p => <option key={`tA-att-${p.id}`} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label htmlFor="teamA-goalkeeper">Portiere:</label>
                            <select id="teamA-goalkeeper" value={teamA.goalkeeper} onChange={e => setTeamA({ ...teamA, goalkeeper: e.target.value })}>
                                <option value="">Seleziona</option>
                                {players.map(p => <option key={`tA-gk-${p.id}`} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </fieldset>
                </div>
                <div className="team-column">
                    <fieldset>
                        <legend>Team B</legend>
                        <div className="form-field">
                            <label htmlFor="teamB-attacker">Attaccante:</label>
                            <select id="teamB-attacker" value={teamB.attacker} onChange={e => setTeamB({ ...teamB, attacker: e.target.value })}>
                                <option value="">Seleziona</option>
                                {players.map(p => <option key={`tB-att-${p.id}`} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label htmlFor="teamB-goalkeeper">Portiere:</label>
                            <select id="teamB-goalkeeper" value={teamB.goalkeeper} onChange={e => setTeamB({ ...teamB, goalkeeper: e.target.value })}>
                                <option value="">Seleziona</option>
                                {players.map(p => <option key={`tB-gk-${p.id}`} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </fieldset>
                </div>
            </div>

            {/* SELEZIONE VINCITORE */}
            <fieldset>
                <legend>Chi ha vinto?</legend>
                <div className="cappotto-buttons">
                    <button type="button" className={`cappotto-btn cappotto-a ${winner === 'A' ? 'active' : ''}`} onClick={() => setWinner('A')}>Team A</button>
                    <button type="button" className={`cappotto-btn cappotto-b ${winner === 'B' ? 'active' : ''}`} onClick={() => setWinner('B')}>Team B</button>
                </div>
            </fieldset>

            {/* CHECKBOX CAPPOTTO */}
            {winner && ( // Mostra la checkbox se un vincitore è stato selezionato
                 <fieldset>
                    <div className="form-field" style={{ justifyContent: 'center' }}>
                        <input 
                            type="checkbox" 
                            id="cappotto-check"
                            checked={isCappotto} 
                            onChange={(e) => setIsCappotto(e.target.checked)} 
                        />
                        <label htmlFor="cappotto-check" style={{ flexBasis: 'auto', textAlign: 'left' }}>
                            Vittoria per cappotto (6-0)?
                        </label>
                    </div>
                </fieldset>
            )}

            <button type="button" onClick={handleSave} style={{backgroundColor: '#007bff'}}>Salva Partita</button>
            
            {error && <p className="form-error">{error}</p>}
            {success && <p className="form-success">{success}</p>}
        </div>
    );
};

export default NewMatch;
