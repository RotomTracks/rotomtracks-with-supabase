// HTML Report Generator - Maintains Python system styling
import { 
  Tournament, 
  TournamentParticipant, 
  TournamentMatch, 
  TournamentResult,
  MatchOutcome 
} from '@/lib/types/tournament';
import { PlayerResult, MatchResult } from './tdf-parser';

interface ReportData {
  tournament: Tournament;
  participants: PlayerResult[];
  matches: MatchResult[];
  results: PlayerResult[];
}

export async function generateHTMLReport(data: ReportData): Promise<string> {
  const { tournament, participants, matches, results } = data;
  
  // Sort results by placement
  const sortedResults = results.sort((a, b) => {
    if (a.placement && b.placement) {
      return a.placement - b.placement;
    }
    // If no placement, sort by points then by wins
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    return b.wins - a.wins;
  });

  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    const round = match.round;
    if (!acc[round]) {
      acc[round] = [];
    }
    acc[round].push(match);
    return acc;
  }, {} as Record<number, MatchResult[]>);

  const rounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  // Generate HTML
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${tournament.name} - Resultados</title>
    <style>
        ${getReportCSS()}
    </style>
</head>
<body>
    <div class="container">
        ${generateHeader(tournament)}
        ${generateStandings(sortedResults, participants)}
        ${generateRounds(matchesByRound, rounds, participants)}
        ${generateFooter()}
    </div>
    
    <script>
        ${getReportJavaScript()}
    </script>
</body>
</html>`;

  return html;
}

function generateHeader(tournament: Tournament): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return `
    <header class="tournament-header">
        <div class="header-content">
            <h1 class="tournament-title">${tournament.name}</h1>
            <div class="tournament-info">
                <div class="info-item">
                    <span class="label">Ubicación:</span>
                    <span class="value">${tournament.city}, ${tournament.country}</span>
                </div>
                <div class="info-item">
                    <span class="label">Fecha:</span>
                    <span class="value">${formatDate(tournament.start_date)}</span>
                </div>
                <div class="info-item">
                    <span class="label">Tipo:</span>
                    <span class="value">${tournament.tournament_type}</span>
                </div>
                <div class="info-item">
                    <span class="label">Jugadores:</span>
                    <span class="value">${tournament.current_players}</span>
                </div>
                <div class="info-item">
                    <span class="label">ID Oficial:</span>
                    <span class="value">${tournament.official_tournament_id}</span>
                </div>
            </div>
        </div>
    </header>`;
}

function generateStandings(results: PlayerResult[], participants: PlayerResult[]): string {
  const participantMap = participants.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {} as Record<string, PlayerResult>);

  const standingsRows = results.map((result, index) => {
    const participant = participantMap[result.id];
    const standing = result.placement || (index + 1);
    
    return `
      <tr class="standing-row ${standing <= 3 ? `place-${standing}` : ''}">
        <td class="standing-position">${standing}</td>
        <td class="player-name">
          ${participant?.name || 'Jugador Desconocido'}
          <span class="player-id">(${participant?.id || 'N/A'})</span>
        </td>
        <td class="stat-wins">${result.wins}</td>
        <td class="stat-losses">${result.losses}</td>
        <td class="stat-draws">${result.draws}</td>
        <td class="stat-byes">0</td>
        <td class="stat-points">${result.points}</td>
      </tr>`;
  }).join('');

  return `
    <section class="standings-section">
        <h2 class="section-title">
            <span class="title-icon">🏆</span>
            Clasificación Final
        </h2>
        <div class="table-container">
            <table class="standings-table">
                <thead>
                    <tr>
                        <th class="col-position">Pos.</th>
                        <th class="col-player">Jugador</th>
                        <th class="col-wins">V</th>
                        <th class="col-losses">D</th>
                        <th class="col-draws">E</th>
                        <th class="col-byes">B</th>
                        <th class="col-points">Pts</th>
                    </tr>
                </thead>
                <tbody>
                    ${standingsRows}
                </tbody>
            </table>
        </div>
    </section>`;
}

function generateRounds(
  matchesByRound: Record<number, MatchResult[]>, 
  rounds: number[], 
  participants: PlayerResult[]
): string {
  const participantMap = participants.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {} as Record<string, PlayerResult>);

  const roundSections = rounds.map(roundNumber => {
    const roundMatches = matchesByRound[roundNumber];
    const matchRows = roundMatches.map(match => {
      const player1 = participantMap[match.player1];
      const player2 = match.player2 !== 'BYE' ? participantMap[match.player2] : null;
      
      const isPlayer1Winner = match.result === '1-0';
      const isPlayer2Winner = match.result === '0-1';
      const isDraw = match.result === '0.5-0.5';
      const isBye = match.result === 'bye';

      let resultDisplay = '';
      if (isBye) {
        resultDisplay = '<span class="result-bye">BYE</span>';
      } else if (isDraw) {
        resultDisplay = '<span class="result-draw">EMPATE</span>';
      } else if (isPlayer1Winner) {
        resultDisplay = '<span class="result-win">VICTORIA</span>';
      } else if (isPlayer2Winner) {
        resultDisplay = '<span class="result-loss">DERROTA</span>';
      }

      return `
        <tr class="match-row">
          <td class="match-table">${match.table || '-'}</td>
          <td class="match-player ${isPlayer1Winner ? 'winner' : ''}">
            ${player1?.name || 'Jugador 1'}
            <span class="player-id">(${player1?.id || 'N/A'})</span>
          </td>
          <td class="match-vs">vs</td>
          <td class="match-player ${isPlayer2Winner ? 'winner' : ''}">
            ${player2 ? `${player2.name} <span class="player-id">(${player2.id})</span>` : 'BYE'}
          </td>
          <td class="match-result">${resultDisplay}</td>
        </tr>`;
    }).join('');

    return `
      <section class="round-section">
          <h3 class="round-title" onclick="toggleRound(${roundNumber})">
              <span class="round-toggle">▼</span>
              Ronda ${roundNumber}
              <span class="match-count">(${roundMatches.length} partidas)</span>
          </h3>
          <div class="round-content" id="round-${roundNumber}">
              <div class="table-container">
                  <table class="matches-table">
                      <thead>
                          <tr>
                              <th class="col-table">Mesa</th>
                              <th class="col-player1">Jugador 1</th>
                              <th class="col-vs"></th>
                              <th class="col-player2">Jugador 2</th>
                              <th class="col-result">Resultado</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${matchRows}
                      </tbody>
                  </table>
              </div>
          </div>
      </section>`;
  }).join('');

  return `
    <section class="rounds-section">
        <h2 class="section-title">
            <span class="title-icon">⚔️</span>
            Rondas del Torneo
        </h2>
        ${roundSections}
    </section>`;
}

function generateFooter(): string {
  const now = new Date();
  return `
    <footer class="report-footer">
        <div class="footer-content">
            <p class="generated-info">
                Reporte generado el ${now.toLocaleDateString('es-ES')} a las ${now.toLocaleTimeString('es-ES')}
            </p>
            <p class="system-info">
                Generado por RotomTracks Tournament Management System
            </p>
        </div>
    </footer>`;
}

function getReportCSS(): string {
  return `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f5f5f5;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        background-color: white;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
        min-height: 100vh;
    }

    /* Header Styles */
    .tournament-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        border-radius: 10px;
        margin-bottom: 30px;
    }

    .tournament-title {
        font-size: 2.5em;
        font-weight: bold;
        margin-bottom: 20px;
        text-align: center;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .tournament-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-top: 20px;
    }

    .info-item {
        background: rgba(255,255,255,0.1);
        padding: 10px 15px;
        border-radius: 5px;
        backdrop-filter: blur(10px);
    }

    .info-item .label {
        font-weight: bold;
        display: block;
        font-size: 0.9em;
        opacity: 0.9;
    }

    .info-item .value {
        font-size: 1.1em;
        margin-top: 5px;
        display: block;
    }

    /* Section Styles */
    .section-title {
        font-size: 1.8em;
        color: #2c3e50;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 3px solid #3498db;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .title-icon {
        font-size: 1.2em;
    }

    /* Table Styles */
    .table-container {
        overflow-x: auto;
        margin-bottom: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    table {
        width: 100%;
        border-collapse: collapse;
        background: white;
    }

    th {
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
        padding: 15px 10px;
        text-align: left;
        font-weight: bold;
        font-size: 0.9em;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    td {
        padding: 12px 10px;
        border-bottom: 1px solid #ecf0f1;
    }

    tr:hover {
        background-color: #f8f9fa;
    }

    /* Standings Table */
    .standings-table {
        font-size: 0.95em;
    }

    .standing-position {
        font-weight: bold;
        font-size: 1.1em;
        text-align: center;
        width: 60px;
    }

    .player-name {
        font-weight: bold;
        min-width: 200px;
    }

    .player-id {
        font-weight: normal;
        color: #7f8c8d;
        font-size: 0.9em;
    }

    .stat-wins, .stat-losses, .stat-draws, .stat-byes, .stat-points {
        text-align: center;
        font-weight: bold;
        width: 50px;
    }

    .stat-wins { color: #27ae60; }
    .stat-losses { color: #e74c3c; }
    .stat-draws { color: #f39c12; }
    .stat-byes { color: #9b59b6; }
    .stat-points { color: #2c3e50; font-size: 1.1em; }

    /* Podium Places */
    .place-1 {
        background: linear-gradient(135deg, #ffd700, #ffed4e);
        color: #333;
    }

    .place-2 {
        background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
        color: #333;
    }

    .place-3 {
        background: linear-gradient(135deg, #cd7f32, #daa520);
        color: white;
    }

    /* Rounds Section */
    .round-section {
        margin-bottom: 25px;
        border: 1px solid #e1e8ed;
        border-radius: 8px;
        overflow: hidden;
    }

    .round-title {
        background: linear-gradient(135deg, #34495e, #2c3e50);
        color: white;
        padding: 15px 20px;
        margin: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1.2em;
        transition: background 0.3s ease;
    }

    .round-title:hover {
        background: linear-gradient(135deg, #2c3e50, #34495e);
    }

    .round-toggle {
        transition: transform 0.3s ease;
        font-size: 0.8em;
    }

    .round-content {
        padding: 0;
        transition: max-height 0.3s ease;
        overflow: hidden;
    }

    .round-content.collapsed {
        max-height: 0;
    }

    .match-count {
        margin-left: auto;
        font-size: 0.9em;
        opacity: 0.8;
    }

    /* Matches Table */
    .matches-table {
        font-size: 0.9em;
    }

    .match-table {
        text-align: center;
        font-weight: bold;
        width: 60px;
    }

    .match-player {
        min-width: 180px;
    }

    .match-player.winner {
        background-color: #d5f4e6;
        font-weight: bold;
        color: #27ae60;
    }

    .match-vs {
        text-align: center;
        font-weight: bold;
        color: #7f8c8d;
        width: 40px;
    }

    .match-result {
        text-align: center;
        font-weight: bold;
        width: 100px;
    }

    .result-win { color: #27ae60; }
    .result-loss { color: #e74c3c; }
    .result-draw { color: #f39c12; }
    .result-bye { color: #9b59b6; }

    /* Footer */
    .report-footer {
        margin-top: 50px;
        padding: 30px;
        background: #ecf0f1;
        border-radius: 8px;
        text-align: center;
        color: #7f8c8d;
    }

    .generated-info {
        font-size: 0.9em;
        margin-bottom: 5px;
    }

    .system-info {
        font-size: 0.8em;
        font-weight: bold;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .container {
            padding: 10px;
        }

        .tournament-title {
            font-size: 2em;
        }

        .tournament-info {
            grid-template-columns: 1fr;
        }

        .section-title {
            font-size: 1.5em;
        }

        table {
            font-size: 0.8em;
        }

        th, td {
            padding: 8px 5px;
        }
    }

    @media print {
        body {
            background: white;
        }

        .container {
            box-shadow: none;
            max-width: none;
        }

        .round-content {
            max-height: none !important;
        }

        .round-toggle {
            display: none;
        }
    }
  `;
}

function getReportJavaScript(): string {
  return `
    function toggleRound(roundNumber) {
        const content = document.getElementById('round-' + roundNumber);
        const toggle = document.querySelector('#round-' + roundNumber).previousElementSibling.querySelector('.round-toggle');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            toggle.textContent = '▼';
        } else {
            content.style.display = 'none';
            toggle.textContent = '▶';
        }
    }

    // Initialize all rounds as expanded
    document.addEventListener('DOMContentLoaded', function() {
        const rounds = document.querySelectorAll('.round-content');
        rounds.forEach(round => {
            round.style.display = 'block';
        });
    });

    // Print functionality
    function printReport() {
        window.print();
    }

    // Add print button
    document.addEventListener('DOMContentLoaded', function() {
        const header = document.querySelector('.tournament-header .header-content');
        const printButton = document.createElement('button');
        printButton.textContent = '🖨️ Imprimir Reporte';
        printButton.style.cssText = 'position: absolute; top: 20px; right: 20px; padding: 10px 15px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 5px; cursor: pointer; font-size: 0.9em;';
        printButton.onclick = printReport;
        
        header.style.position = 'relative';
        header.appendChild(printButton);
    });
  `;
}

export const HTMLGenerator = {
  generateReport: generateHTMLReport,
};