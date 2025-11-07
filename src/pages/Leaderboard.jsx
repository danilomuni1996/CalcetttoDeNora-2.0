import { useState, useEffect } from 'react';
import { API_URL } from '../api';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const calculateStatsAndFetchLeaderboard = async () => {
            setLoading(true);
            try {
                const [playersRes, matchesRes] = await Promise.all([
                    fetch(`${API_URL}/players`),
                    fetch(`${API_URL}/matches`)
                ]);
                if (!playersRes.ok || !matchesRes.ok) throw new Error('Errore caricamento dati');

                const players = await playersRes.json();
                const matches = await matchesRes.json();
                
                const stats = {};
                players.forEach(p => {
                    stats[p.id] = { ...p, points: 0, wins: 0, losses: 0, matches_played: 0 };
                });

                matches.forEach(match => {
                    const teamA_ids = [match.teamA_attacker_id, match.teamA_goalkeeper_id];
                    const teamB_ids = [match.teamB_attacker_id, match.teamB_goalkeeper_id];
                    
                    [...teamA_ids, ...teamB_ids].forEach(id => {
                        if (stats[id]) stats[id].matches_played += 1;
                    });

                    if (match.score_a > match.score_b) { // Team A vince
                        const isCappotto = match.score_a === 6;
                        const points_A = isCappotto ? 4 : 3;
                        const points_B = isCappotto ? -1 : 1; // Corretto
                        
                        teamA_ids.forEach(id => { if (stats[id]) { stats[id].points += points_A; stats[id].wins += 1; } });
                        teamB_ids.forEach(id => { if (stats[id]) { stats[id].points += points_B; stats[id].losses += 1; } });

                    } else if (match.score_b > match.score_a) { // Team B vince
                        const isCappotto = match.score_b === 6;
                        const points_B = isCappotto ? 4 : 3;
                        const points_A = isCappotto ? -1 : 1; // Corretto

                        teamB_ids.forEach(id => { if (stats[id]) { stats[id].points += points_B; stats[id].wins += 1; } });
                        teamA_ids.forEach(id => { if (stats[id]) { stats[id].points += points_A; stats[id].losses += 1; } });
                    }
                });

                const finalLeaderboard = Object.values(stats).sort((a, b) => b.points - a.points);
                setLeaderboard(finalLeaderboard);

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        calculateStatsAndFetchLeaderboard();
    }, []);

    const calculateWinRate = (player) => {
        if (player.matches_played === 0) return (0).toFixed(2);
        return (player.wins / player.matches_played).toFixed(2);
    };

    if (loading) return <p>Caricamento...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="leaderboard">
            <h2>Classifica Generale</h2>
            <table>
                <thead>
                    <tr>
                        <th>Pos.</th>
                        <th>Nome</th>
                        <th>Punti</th>
                        <th>Partite</th>
                        <th>V-S</th>
                        <th>Win Rate</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map((player, index) => (
                        <tr key={player.id}>
                            <td>{index + 1}</td>
                            <td>{player.name}</td>
                            <td>{player.points}</td>
                            <td>{player.matches_played}</td>
                            <td>{`${player.wins}-${player.losses}`}</td>
                            <td>{calculateWinRate(player)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Leaderboard;
