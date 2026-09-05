import { useState, useRef } from "react";
import "./App.css";
import { teams } from "./data/teams";
import { toPng } from "html-to-image";
import { FaXTwitter } from "react-icons/fa6";
import { SiKofi } from "react-icons/si";
import { Trophy } from "lucide-react";


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

const emptyScore = {
  score1: "",
  score2: "",
};


/* ========================================
   BO5 FUNCTIONS
======================================== */

const isValidSeries = (score1, score2, bestOf = 5) => {
  if (score1 === "" || score2 === "") return false;

  const s1 = Number(score1);
  const s2 = Number(score2);

  const winsNeeded = Math.ceil(bestOf / 2);

  if (s1 < 0 || s2 < 0) return false;
  if (s1 > winsNeeded || s2 > winsNeeded) return false;

  return (
    (s1 === winsNeeded && s2 < winsNeeded) ||
    (s2 === winsNeeded && s1 < winsNeeded)
  );
};


const getWinner = (
  team1,
  team2,
  score1,
  score2,
  bestOf = 5
) => {
  if (!team1 || !team2) return null;

  if (!isValidSeries(score1, score2, bestOf)) {
    return null;
  }

  const winsNeeded = Math.ceil(bestOf / 2);

  return Number(score1) === winsNeeded
    ? team1
    : team2;
};


const getLoser = (
  team1,
  team2,
  score1,
  score2,
  bestOf = 5
) => {
  if (!team1 || !team2) return null;

  if (!isValidSeries(score1, score2, bestOf)) {
    return null;
  }

  const winsNeeded = Math.ceil(bestOf / 2);

  return Number(score1) === winsNeeded
    ? team2
    : team1;
};


/* ========================================
   TEAM ROW
======================================== */

function TeamRow({
  team,
  score,
  onChange,
  disabled,
  winner,
  loser,
  maxScore = 3,
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
  max={maxScore}
  value={score}
  disabled={disabled}
  onChange={(e) => {
    const value = e.target.value;

    if (value === "") {
      onChange("");
      return;
    }

    const number = Number(value);

    if (number >= 0 && number <= maxScore) {
      onChange(value);
    }
  }}
/>
    </div>
  );
}


/* ========================================
   MATCH
======================================== */

function Match({
  team1,
  team2,
  score1,
  score2,
  onScore1Change,
  onScore2Change,
  disabled = false,
  bestOf = 5,
}) {
  const winsNeeded = Math.ceil(bestOf / 2);

  const winner = getWinner(
    team1,
    team2,
    score1,
    score2,
    bestOf
  );

  const loser = getLoser(
    team1,
    team2,
    score1,
    score2,
    bestOf
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
        maxScore={winsNeeded}
      />

      <TeamRow
        team={team2}
        score={score2}
        onChange={onScore2Change}
        disabled={disabled}
        winner={winner?.id === team2?.id}
        loser={loser?.id === team2?.id}
        maxScore={winsNeeded}
      />
    </div>
  );
}


/* ========================================
   APP
======================================== */

function App() {

  const exportRef = useRef(null);

  const [showExportPreview, setShowExportPreview] =
    useState(false);
const [exportImage, setExportImage] = useState(null);
  const [
    quarterFinals,
    setQuarterFinals
  ] = useState(initialQuarterFinals);

  const [
    semiScores,
    setSemiScores
  ] = useState([
    { ...emptyScore },
    { ...emptyScore },
  ]);

  const [
    finalScores,
    setFinalScores
  ] = useState({
    ...emptyScore,
  });

  const [
    thirdPlaceScores,
    setThirdPlaceScores
  ] = useState({
    ...emptyScore,
  });


  /* ========================================
     EXPORT
  ======================================== */

const exportBracket = async () => {
  if (!exportImage) return;

  const link = document.createElement("a");

  link.download =
    "overwatch-world-cup-2026-prediction.png";

  link.href = exportImage;

  link.click();
};


 const openExportPreview = async () => {
  if (!exportRef.current) return;

  try {
    const node = exportRef.current;

    const dataUrl = await toPng(node, {
      pixelRatio: 2,
      backgroundColor: "#101720",
      cacheBust: true,
      width: node.scrollWidth,
      height: node.scrollHeight,
    });

    setExportImage(dataUrl);
    setShowExportPreview(true);

  } catch (error) {
    console.error("Preview failed:", error);
  }
};


  const closeExportPreview = () => {
    setShowExportPreview(false);
  };


  /* ========================================
     RESET
  ======================================== */

  const resetBracket = () => {

    setQuarterFinals(
      initialQuarterFinals.map(
        (match) => ({
          ...match,
          score1: "",
          score2: "",
        })
      )
    );

    setSemiScores([
      { ...emptyScore },
      { ...emptyScore },
    ]);

    setFinalScores({
      ...emptyScore,
    });

    setThirdPlaceScores({
      ...emptyScore,
    });

  };


  /* ========================================
     WINNERS
  ======================================== */

  const qfWinners =
    quarterFinals.map((match) =>
      getWinner(
        match.team1,
        match.team2,
        match.score1,
        match.score2
      )
    );


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


  const semiWinners =
    semiFinals.map((match, index) =>
      getWinner(
        match.team1,
        match.team2,
        semiScores[index].score1,
        semiScores[index].score2
      )
    );


  const semiLosers =
    semiFinals.map((match, index) =>
      getLoser(
        match.team1,
        match.team2,
        semiScores[index].score1,
        semiScores[index].score2
      )
    );


  const finalMatch = {
    team1: semiWinners[0],
    team2: semiWinners[1],
  };


  const champion = getWinner(
    finalMatch.team1,
    finalMatch.team2,
    finalScores.score1,
    finalScores.score2,
    7,
  );


  const thirdPlaceMatch = {
    team1: semiLosers[0],
    team2: semiLosers[1],
  };


  /* ========================================
     UPDATE SCORES
  ======================================== */

  const updateQuarterScore = (
    id,
    field,
    value
  ) => {

    setQuarterFinals((matches) =>
      matches.map((match) =>
        match.id === id
          ? {
              ...match,
              [field]: value,
            }
          : match
      )
    );

    setSemiScores([
      { ...emptyScore },
      { ...emptyScore },
    ]);

    setFinalScores({
      ...emptyScore,
    });

    setThirdPlaceScores({
      ...emptyScore,
    });

  };


  const updateSemiScore = (
    index,
    field,
    value
  ) => {

    setSemiScores((scores) =>
      scores.map((score, i) =>
        i === index
          ? {
              ...score,
              [field]: value,
            }
          : score
      )
    );

    setFinalScores({
      ...emptyScore,
    });

    setThirdPlaceScores({
      ...emptyScore,
    });

  };


  const updateFinalScore = (
    field,
    value
  ) => {

    setFinalScores((scores) => ({
      ...scores,
      [field]: value,
    }));

  };


  const updateThirdPlaceScore = (
    field,
    value
  ) => {

    setThirdPlaceScores((scores) => ({
      ...scores,
      [field]: value,
    }));

  };


  /* ========================================
     RETURN
  ======================================== */

  return (

    <div className="app">

      {/* HEADER */}

      <header className="site-header">

        <div className="brand">

          <div className="brand-icon">
             <Trophy />
          </div>

          <div className="brand-text">
            <h1>PLAYOFFS</h1>
            <p>
              TOURNAMENT PREDICTOR
            </p>
          </div>

        </div>


        <div className="event-info">

          <div className="event-title">
            OVERWATCH WORLD CUP 2026
          </div>

          <div className="event-meta">

            <span>BEST OF 5</span>

            <span className="meta-dot">
              •
            </span>

            <span>8 TEAMS</span>

            <span className="meta-dot">
              •
            </span>

            <span>
              SINGLE ELIMINATION
            </span>

          </div>

        </div>


        <div className="header-actions">

          <button
            className="reset-button"
            onClick={resetBracket}
          >
            RESET
          </button>


          <button
            className="export-button"
            onClick={openExportPreview}
          >
            EXPORT PREDICTION
          </button>

        </div>

      </header>


      {/* BRACKET */}

      <div
        className="bracket-wrapper"
        ref={exportRef}
      >

        <div className="export-event-title">

          <span>
            OVERWATCH WORLD CUP
          </span>

          <strong>
            2026
          </strong>

        </div>


        <div className="bracket">


          {/* QUARTERFINALS */}

          <div className="round quarterfinals">

            <div className="round-title">
              Quarterfinals
            </div>


            <div className="qf-matches">

              <div className="qf-pair">

                {quarterFinals
                  .slice(0, 2)
                  .map((match) => (

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

                {quarterFinals
                  .slice(2, 4)
                  .map((match) => (

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

                {semiFinals.map(
                  (match, index) => (

                    <div
                      className="bracket-match semi-bracket-match"
                      key={index}
                    >

                      <Match
                        team1={match.team1}
                        team2={match.team2}
                        score1={
                          semiScores[index].score1
                        }
                        score2={
                          semiScores[index].score2
                        }
                        disabled={
                          !match.team1 ||
                          !match.team2
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

                  )
                )}

              </div>

            </div>

          </div>


          {/* FINALS */}

          <div className="finals-area">

            <div className="round-title">
              Grand Final
            </div>


            <div className="final-stage">


              <div className="final-match-container">

                <Match
  team1={finalMatch.team1}
  team2={finalMatch.team2}
  score1={finalScores.score1}
  score2={finalScores.score2}
  bestOf={7}
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

                  <strong>
                    TBD
                  </strong>

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
                score1={
                  thirdPlaceScores.score1
                }
                score2={
                  thirdPlaceScores.score2
                }
                disabled={
                  !thirdPlaceMatch.team1 ||
                  !thirdPlaceMatch.team2
                }
                onScore1Change={(value) =>
                  updateThirdPlaceScore(
                    "score1",
                    value
                  )
                }
                onScore2Change={(value) =>
                  updateThirdPlaceScore(
                    "score2",
                    value
                  )
                }
              />

            </div>

          </div>

        </div>

      </div>


      {/* FOOTER */}

      <footer className="footer">

        <div className="footer-top">

          <span>
            CREATED BY
          </span>

          <strong>
            ISS4M.
          </strong>

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


      {/* EXPORT PREVIEW */}

{showExportPreview && (

  <div className="export-preview">

    <div className="export-preview-top">

      <span>
        TAKE A SCREENSHOT OR DOWNLOAD YOUR PREDICTION
      </span>

      <button
        className="close-export-preview"
        onClick={closeExportPreview}
      >
        ✕
      </button>

    </div>


    <div className="export-preview-content">

      {exportImage && (

        <img
          src={exportImage}
          alt="Tournament prediction"
          className="export-preview-image"
        />

      )}


      <div className="export-preview-actions">

        <button
          className="download-export-button"
          onClick={exportBracket}
        >
          DOWNLOAD PNG
        </button>

      </div>

    </div>

  </div>

)}

    </div>

  );

}


export default App;