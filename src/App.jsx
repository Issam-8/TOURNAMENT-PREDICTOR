import { useState, useRef } from "react";
import "./App.css";
import { teams } from "./data/teams";
import { toPng } from "html-to-image";
import { FaXTwitter } from "react-icons/fa6";
import { SiKofi } from "react-icons/si";
import { GiTrophyCup } from "react-icons/gi";

const initialQuarterFinals = [
  {
    id: 1,
    team1: teams.saudiArabia,
    team2: teams.spain,
    score1: "",
    score2: "",
  },
  {
    id: 2,
    team1: teams.germany,
    team2: teams.sweden,
    score1: "",
    score2: "",
  },
  {
    id: 3,
    team1: teams.france,
    team2: teams.australia,
    score1: "",
    score2: "",
  },
  {
    id: 4,
    team1: teams.unitedStates,
    team2: teams.southKorea,
    score1: "",
    score2: "",
  },
];

const emptyScore = { score1: "", score2: "" };
function TeamRow({
  team,
  score,
  onChange,
  disabled,
  winner,
  loser,
}) {
  return (
    <div
      className={`team-row ${
        winner ? "winner-row" : ""
      } ${
        loser ? "loser-row" : ""
      }`}
    >
      <span className="team-name">
        {team?.name || "TBD"}
      </span>

      <div className="team-logo-box">
        {team?.logo && (
          <img
            src={team.logo}
            alt={team.name}
            className="team-logo"
          />
        )}
      </div>

      <input
        className="score-input"
        type="number"
        min="0"
        max="3"
        value={score}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
  const isValidBO5 = (score1, score2) => {
    if (score1 === "" || score2 === "") return false;

    const s1 = Number(score1);
    const s2 = Number(score2);

    if (s1 < 0 || s2 < 0) return false;
    if (s1 > 3 || s2 > 3) return false;

    return (
      (s1 === 3 && s2 < 3) ||
      (s2 === 3 && s1 < 3)
    );
  };

  const getWinner = (team1, team2, score1, score2) => {
    if (!team1 || !team2) return null;
    if (!isValidBO5(score1, score2)) return null;

    return Number(score1) === 3 ? team1 : team2;
  };

  const getLoser = (team1, team2, score1, score2) => {
    if (!team1 || !team2) return null;
    if (!isValidBO5(score1, score2)) return null;

    return Number(score1) === 3 ? team2 : team1;
  };
  function Match({
  team1,
  team2,
  score1,
  score2,
  onScore1Change,
  onScore2Change,
  disabled = false,
}) {
  const winner = getWinner(
    team1,
    team2,
    score1,
    score2
  );

  const loser = getLoser(
    team1,
    team2,
    score1,
    score2
  );

  return (
    <div className="match-card">
      <TeamRow
        team={team1}
        score={score1}
        onChange={onScore1Change}
        disabled={disabled}
        winner={winner?.id === team1?.id}
        loser={loser?.id === team1?.id}
      />

      <TeamRow
        team={team2}
        score={score2}
        onChange={onScore2Change}
        disabled={disabled}
        winner={winner?.id === team2?.id}
        loser={loser?.id === team2?.id}
      />
    </div>
  );
}
function App() {
  const exportRef = useRef(null);
const exportBracket = async () => {
  if (!exportRef.current) return;

  try {
    const dataUrl = await toPng(exportRef.current, {
      pixelRatio: 2,
      backgroundColor: "#0d1218",
      cacheBust: true,
    });

    const link = document.createElement("a");

    link.download = "overwatch-world-cup-2026-prediction.png";
    link.href = dataUrl;

    link.click();
  } catch (error) {
    console.error("Export failed:", error);
  }
};
  const resetBracket = () => {
  setQuarterFinals(
    initialQuarterFinals.map((match) => ({
      ...match,
      score1: "",
      score2: "",
    }))
  );

  setSemiScores([
    { score1: "", score2: "" },
    { score1: "", score2: "" },
  ]);

  setFinalScores({
    score1: "",
    score2: "",
  });

  setThirdPlaceScores({
    score1: "",
    score2: "",
  });
};
  const [quarterFinals, setQuarterFinals] =
    useState(initialQuarterFinals);

  const [semiScores, setSemiScores] = useState([
    { ...emptyScore },
    { ...emptyScore },
  ]);

  const [finalScores, setFinalScores] = useState({
    ...emptyScore,
  });

  const [thirdPlaceScores, setThirdPlaceScores] =
    useState({ ...emptyScore });

  // BO5 VALIDATION


  // QF WINNERS
  const qfWinners = quarterFinals.map((match) =>
    getWinner(
      match.team1,
      match.team2,
      match.score1,
      match.score2
    )
  );

  // SEMIFINALS
  const semiFinals = [
    {
      team1: qfWinners[0],
      team2: qfWinners[1],
    },
    {
      team1: qfWinners[2],
      team2: qfWinners[3],
    },
  ];

  const semiWinners = semiFinals.map((match, index) =>
    getWinner(
      match.team1,
      match.team2,
      semiScores[index].score1,
      semiScores[index].score2
    )
  );

  const semiLosers = semiFinals.map((match, index) =>
    getLoser(
      match.team1,
      match.team2,
      semiScores[index].score1,
      semiScores[index].score2
    )
  );

  // GRAND FINAL
  const finalMatch = {
    team1: semiWinners[0],
    team2: semiWinners[1],
  };

  const champion = getWinner(
    finalMatch.team1,
    finalMatch.team2,
    finalScores.score1,
    finalScores.score2
  );

  // THIRD PLACE
  const thirdPlaceMatch = {
    team1: semiLosers[0],
    team2: semiLosers[1],
  };



  // UPDATE QF
  const updateQuarterScore = (id, field, value) => {
    setQuarterFinals((matches) =>
      matches.map((match) =>
        match.id === id
          ? { ...match, [field]: value }
          : match
      )
    );

    // Clear everything downstream
    setSemiScores([
      { ...emptyScore },
      { ...emptyScore },
    ]);
    setFinalScores({ ...emptyScore });
    setThirdPlaceScores({ ...emptyScore });
  };

  // UPDATE SEMI
  const updateSemiScore = (index, field, value) => {
    setSemiScores((scores) =>
      scores.map((score, i) =>
        i === index
          ? { ...score, [field]: value }
          : score
      )
    );

    setFinalScores({ ...emptyScore });
    setThirdPlaceScores({ ...emptyScore });
  };

  const updateFinalScore = (field, value) => {
    setFinalScores((scores) => ({
      ...scores,
      [field]: value,
    }));
  };

  const updateThirdPlaceScore = (field, value) => {
    setThirdPlaceScores((scores) => ({
      ...scores,
      [field]: value,
    }));
  };

  // TEAM ROW
function TeamRow({
  team,
  score,
  onChange,
  disabled,
  winner,
  loser,
}) {
  return (
    <div
      className={`team-row ${
        winner ? "winner-row" : ""
      } ${
        loser ? "loser-row" : ""
      }`}
    >
      <span className="team-name">
        {team?.name || "TBD"}
      </span>

      <div className="team-logo-box">
        {team?.logo && (
          <img
            src={team.logo}
            alt={team.name}
            className="team-logo"
          />
        )}
      </div>

      <input
        className="score-input"
        type="number"
        min="0"
        max="3"
        value={score}
        disabled={disabled}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />
    </div>
  );
}

  // MATCH CARD
  function Match({
    team1,
    team2,
    score1,
    score2,
    onScore1Change,
    onScore2Change,
    disabled = false,
  }) {
    const winner = getWinner(
      team1,
      team2,
      score1,
      score2
    );
const loser = getLoser(
  team1,
  team2,
  score1,
  score2
);
    return (
      <div className="match-card">
        <TeamRow
          team={team1}
          score={score1}
          onChange={onScore1Change}
          disabled={disabled}
          winner={winner?.id === team1?.id}
          loser={loser?.id === team1?.id}
        />

        <TeamRow
          team={team2}
          score={score2}
          onChange={onScore2Change}
          disabled={disabled}
          winner={winner?.id === team2?.id}
          loser={loser?.id === team2?.id}
        />
      </div>
    );
  }

  return (
    <div className="app">
<header className="site-header">

  {/* LEFT — BRAND */}
  <div className="brand">
<div className="brand-icon">
  <GiTrophyCup />
    </div>

    <div className="brand-text">
      <h1>PLAYOFFS</h1>
      <p>TOURNAMENT PREDICTOR</p>
    </div>
  </div>


  {/* CENTER — EVENT INFO */}
  <div className="event-info">

    <div className="event-title">
      OVERWATCH WORLD CUP 2026
    </div>

    <div className="event-meta">
      <span>BEST OF 5</span>

      <span className="meta-dot">•</span>

      <span>8 TEAMS</span>

      <span className="meta-dot">•</span>

      <span>SINGLE ELIMINATION</span>
    </div>

  </div>


  {/* RIGHT — ACTIONS */}
  <div className="header-actions">

    <button
      className="reset-button"
      onClick={resetBracket}
    >
      RESET
    </button>

    <button
      className="export-button"
      onClick={exportBracket}
    >
      EXPORT PREDICTION
    </button>

  </div>

</header>

      <div
  className="bracket-wrapper"
  ref={exportRef}
>
  <div className="export-event-title">
  <span>OVERWATCH WORLD CUP</span>
  <strong>2026</strong>
</div>
        <div className="bracket">

          {/* QUARTERFINALS */}
          <div className="round quarterfinals">
            <div className="round-title">
              Quarterfinals
            </div>

<div className="qf-matches">

  <div className="qf-pair">
    {quarterFinals.slice(0, 2).map((match) => (
      <div
        className="bracket-match qf-bracket-match"
        key={match.id}
      >
        <Match
          team1={match.team1}
          team2={match.team2}
          score1={match.score1}
          score2={match.score2}
          onScore1Change={(value) =>
            updateQuarterScore(
              match.id,
              "score1",
              value
            )
          }
          onScore2Change={(value) =>
            updateQuarterScore(
              match.id,
              "score2",
              value
            )
          }
        />
      </div>
    ))}
  </div>

  <div className="qf-pair">
    {quarterFinals.slice(2, 4).map((match) => (
      <div
        className="bracket-match qf-bracket-match"
        key={match.id}
      >
        <Match
          team1={match.team1}
          team2={match.team2}
          score1={match.score1}
          score2={match.score2}
          onScore1Change={(value) =>
            updateQuarterScore(
              match.id,
              "score1",
              value
            )
          }
          onScore2Change={(value) =>
            updateQuarterScore(
              match.id,
              "score2",
              value
            )
          }
        />
      </div>
    ))}
  </div>

</div>
          </div>

          {/* SEMIFINALS */}
          <div className="round semifinals">
            <div className="round-title">
              Semifinals
            </div>

<div className="semi-matches">

  <div className="semi-pair">
    {semiFinals.map((match, index) => (
      <div
        className="bracket-match semi-bracket-match"
        key={index}
      >
        <Match
          team1={match.team1}
          team2={match.team2}
          score1={semiScores[index].score1}
          score2={semiScores[index].score2}
          disabled={
            !match.team1 || !match.team2
          }
          onScore1Change={(value) =>
            updateSemiScore(
              index,
              "score1",
              value
            )
          }
          onScore2Change={(value) =>
            updateSemiScore(
              index,
              "score2",
              value
            )
          }
        />
      </div>
    ))}
  </div>

</div>
          </div>

{/* RIGHT SIDE */}
<div className="finals-area">

  <div className="round-title">
    Grand Final
  </div>

  <div className="final-stage">

    {/* GRAND FINAL MATCH */}
    <div className="final-match-container">
      <Match
        team1={finalMatch.team1}
        team2={finalMatch.team2}
        score1={finalScores.score1}
        score2={finalScores.score2}
        disabled={
          !finalMatch.team1 ||
          !finalMatch.team2
        }
        onScore1Change={(value) =>
          updateFinalScore("score1", value)
        }
        onScore2Change={(value) =>
          updateFinalScore("score2", value)
        }
      />
    </div>

    {/* CHAMPION */}
    <div className="champion-card">
      <div className="champion-label">
        🏆 CHAMPION
      </div>

      {champion ? (
        <>
          <img
            src={champion.logo}
            alt={champion.name}
          />

          <strong>
            {champion.name}
          </strong>
        </>
      ) : (
        <strong>TBD</strong>
      )}
    </div>

  </div>


  {/* THIRD PLACE */}
  <div className="third-place">

    <div className="round-title">
      Third Place Match
    </div>

    <Match
      team1={thirdPlaceMatch.team1}
      team2={thirdPlaceMatch.team2}
      score1={thirdPlaceScores.score1}
      score2={thirdPlaceScores.score2}
      disabled={
        !thirdPlaceMatch.team1 ||
        !thirdPlaceMatch.team2
      }
      onScore1Change={(value) =>
        updateThirdPlaceScore("score1", value)
      }
      onScore2Change={(value) =>
        updateThirdPlaceScore("score2", value)
      }
    />

  </div>

</div>


        </div>
      </div>
<footer className="footer">
  <div className="footer-top">
    <span>CREATED BY</span>
    <strong>ISS4M</strong>
  </div>

  <div className="footer-socials">
    <a
      href="https://x.com/IssamEam2"
      target="_blank"
      rel="noreferrer"
      className="footer-link"
      aria-label="X"
    >
      <FaXTwitter />
    </a>

    <a
      href="https://ko-fi.com/iss4m"
      target="_blank"
      rel="noreferrer"
      className="footer-link"
      aria-label="Ko-fi"
    >
      <SiKofi />
    </a>
  </div>

  <div className="footer-bottom">
    OVERWATCH WORLD CUP 2026 PREDICTOR
  </div>
</footer>
    </div>
    
  );
  
}
export default App;