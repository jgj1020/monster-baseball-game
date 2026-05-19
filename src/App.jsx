import { useState, useEffect } from 'react';

// 👾 랜덤 정답 생성 함수 (중복 없는 숫자 생성)
const generateRandomNumbers = (length) => {
  const candidates = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const picked = [];
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * candidates.length);
    picked.push(candidates[randomIndex]);
    candidates.splice(randomIndex, 1);
  }
  return picked;
};

// 👾 레벨별 설정 데이터 (요청하신 '분' 단위를 초(seconds) 값으로 환산하여 세팅)
const LEVEL_CONFIG = {
  1: { digits: 3, timeLimit: null, name: "졸린 보라 몬스터", emoji: "🔮", color: "#7e57c2", baseLine: "쿨쿨...💤 깨우면 화낼꼬야... 야구공 던지지 마!", touchLine: "💤 아우 졸려어어... 건들지 마라 더 잘거야아앙... 😴", description: "항상 졸려 눈을 제대로 뜨지 못하는 보라색 생명체. 잠을 방해하는 야구공을 세상에서 가장 싫어합니다." },
  2: { digits: 3, timeLimit: 40 * 60, name: "초록 눈망울 몬스터", emoji: "🌱", color: "#9ccc65", baseLine: "헉!😮 방금 던진 공 뭐야?! 깜짝 놀랐잖아!", touchLine: "⚡ 앗 깜짝이야!! 갑자기 만지면 어떡해!! 튀용~ 😲", description: "소심하고 겁이 많아 작은 소리에도 통통 튀어 오르는 초록 몬스터. 놀라게 하면 삐질지도 몰라요." },
  3: { digits: 4, timeLimit: 30 * 60, name: "노란 귀 몬스터", emoji: "🍊", color: "#ffca28", baseLine: "4자리 숫자인가? 냠냠~ 내 귀 맛있겠다! 🍊", touchLine: "🍊 냠냠! 내 귀는 귤이 아니라구! 먹는 거 아니야!! 😡", description: "머리에 달린 상큼한 귤 모양 귀가 매력 포인트. 자꾸 먹을 것으로 오해받아 스트레스를 받고 있습니다." },
  4: { digits: 4, timeLimit: 25 * 60, name: "빨간 에너지 몬스터", emoji: "🔥", color: "#ef5350", baseLine: "크오오오!!🔥 에너지가 끓어오른다! 다 맞춰봐!", touchLine: "🔥 앗 뜨거! 지금 내 몸은 불타오르고 있으니 조심해라 크르릉!!", description: "전신이 불타는 마그마로 이루어진 열정적인 파이터. 정답을 맞추기 전까진 절대 화를 가라앉히지 않습니다." },
  5: { digits: 5, timeLimit: 20 * 60, name: "파란 날개 몬스터", emoji: "❄️", color: "#29b6f6", baseLine: "5자리나 되는데 과연? 😠 내 날개로 다 쳐내주지!", touchLine: "💨 내 날개 깃털 만지지 마! 간지럽단 말이야 흐흥!! 😤", description: "단단하고 거대한 얼음 날개를 지닌 수호신. 5자리의 복잡한 숫자로 투수들의 혼을 쏙 빼놓습니다." },
  6: { digits: 5, timeLimit: 15 * 60, name: "핑크 전설 몬스터 ✨", emoji: "👑", color: "#ec407a", baseLine: "✨ 전설의 별 왕관 등장! 최종 마스터에 도전해라! ✨", touchLine: "✨ 감히 전설의 왕관을 터치하다니! 무례하도다 소년이여!! ✨", description: "이 스타디움의 지배자이자 전설적인 존재. 화려한 별 왕관을 쓰고 있으며, 완벽한 투구만이 그를 굴복시킬 수 있습니다." }
};

const INITIAL_RANKING = [
  { nickname: "홈런왕김타자", maxLvl: 6, date: "2026-05-18" },
  { nickname: "삼진아웃", maxLvl: 5, date: "2026-05-17" },
  { nickname: "몬스터사냥꾼", maxLvl: 4, date: "2026-05-18" },
  { nickname: "야구초보", maxLvl: 2, date: "2026-05-15" },
];

function App() {
  const [activeTab, setActiveTab] = useState('home');

  // 👤 로그인/랭킹 상태
  const [nickname, setNickname] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inputNickname, setInputNickname] = useState('');
  const [rankingList, setRankingList] = useState(INITIAL_RANKING);

  // ⚾ 야구 게임 상태
  const [lvl, setLvl] = useState(1); 
  const [digitLength, setDigitLength] = useState(3); 
  const [answer, setAnswer] = useState(() => generateRandomNumbers(3)); 
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState([]);
  const [xp, setXp] = useState(0);
  const [isPitching, setIsPitching] = useState(false); 
  const [monsterEffect, setMonsterEffect] = useState('monster-appear'); 
  
  const [touchLine, setTouchLine] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  // ⏱️ 타이머 및 패배(게임오버) 상태
  const [timeLeft, setTimeLeft] = useState(null); // 1단계는 기본 무제한(null)
  const [isGameOver, setIsGameOver] = useState(false);

  const maxXp = 30; 
  const currentConfig = LEVEL_CONFIG[lvl] || LEVEL_CONFIG[1];

  // 🛠️ 고정된 부분: 무한루프를 발생시키던 무분별한 useEffect 제거 후, 
  // 1초씩 빼주는 순수 타이머 인터벌만 이펙트로 유지합니다.
  useEffect(() => {
    if (timeLeft === null || isGameOver || activeTab !== 'home') return;

    if (timeLeft <= 0) {
      setIsGameOver(true);
      setMonsterEffect('monster-lose-giant'); 
      return;
    }

    const timerInterval = setInterval(() => {
      setTimeLeft(prev => prev !== null ? prev - 1 : null);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timeLeft, isGameOver, activeTab]);

  const getMonsterImageUrl = (level) => {
    return `${import.meta.env.BASE_URL}images/monster${level}.png`;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!inputNickname.trim()) {
      alert("닉네임을 정확히 입력해주세요!");
      return;
    }
    setNickname(inputNickname);
    setIsLoggedIn(true);

    const newUser = { nickname: inputNickname, maxLvl: lvl, date: "2026-05-18" };
    setRankingList(prev => {
      if (prev.some(user => user.nickname === inputNickname)) return prev;
      return [...prev, newUser].sort((a, b) => b.maxLvl - a.maxLvl);
    });
  };

  const handleMonsterTouch = () => {
    if (isPitching || isTouched || isGameOver) return; 
    setIsTouched(true);
    setMonsterEffect('monster-poke'); 
    setTouchLine(currentConfig.touchLine);
    setTimeout(() => {
      setIsTouched(false);
      setMonsterEffect('');
      setTouchLine('');
    }, 2000);
  };

  const resetGame = () => {
    setAnswer(generateRandomNumbers(digitLength));
    setInput('');
    setLogs([]);
    setXp(0);
    // 현재 단계 다시하기를 눌렀을 때도 타이머를 동기화해줍니다.
    setTimeLeft(currentConfig.timeLimit);
    setIsGameOver(false);
  };

  const restartFromScratch = () => {
    setLvl(1);
    setDigitLength(LEVEL_CONFIG[1].digits);
    setAnswer(generateRandomNumbers(LEVEL_CONFIG[1].digits));
    setInput('');
    setLogs([]);
    setXp(0);
    setIsGameOver(false);
    setImgFailed(false);
    setMonsterEffect('monster-appear');
    setTimeLeft(LEVEL_CONFIG[1].timeLimit); // 1단계의 시간 한도로 명확히 세팅
  };

  const handleGuess = (e) => {
    e.preventDefault();
    if (isGameOver) return;

    if (input.length !== digitLength || isNaN(input)) {
      alert(`${digitLength}자리 숫자를 정확히 입력해주세요!`);
      return;
    }

    const inputSet = new Set(input.split(''));
    if (inputSet.size !== digitLength) {
      alert("❌ 중복된 숫자가 있습니다! 서로 다른 숫자를 입력해 주세요.");
      return;
    }

    setIsPitching(true);
    setMonsterEffect('');
    setTouchLine(''); 

    setTimeout(() => {
      setIsPitching(false);
      const inputArr = input.split('').map(Number);
      let strikes = 0;
      let balls = 0;

      for (let i = 0; i < digitLength; i++) {
        if (inputArr[i] === answer[i]) {
          strikes++;
        } else if (answer.includes(inputArr[i])) {
          balls++;
        }
      }

      if (strikes === digitLength) {
        setMonsterEffect('hit-success');
        
        setTimeout(() => {
          const nextLvl = lvl + 1;
          if (lvl < 6) {
            const nextConfig = LEVEL_CONFIG[nextLvl];
            
            // 💡 [해결 핵심] 이펙트 대신, 정답을 맞춰 다음 레벨로 넘어가는 이벤트 내부에서 직접 상태들을 업데이트합니다!
            setLvl(nextLvl);
            setDigitLength(nextConfig.digits);
            setAnswer(generateRandomNumbers(nextConfig.digits));
            setInput('');
            setLogs([]);
            setXp(0);
            setImgFailed(false);
            setMonsterEffect('monster-appear');
            
            // 다음 레벨에 배정된 분 단위를 타임리프에 동기식으로 밀어 넣어줍니다.
            setTimeLeft(nextConfig.timeLimit);
            setIsGameOver(false);

            if (isLoggedIn) {
              setRankingList(prev => prev.map(u => u.nickname === nickname ? { ...u, maxLvl: nextLvl } : u).sort((a, b) => b.maxLvl - a.maxLvl));
            }

            alert(`🎉 정답!! 홈런!! [${currentConfig.name}]을(를) 격파하고 레벨업합니다!`);
          } else {
            alert(`🏆 대단합니다! 최종 보스 핑크 전설 몬스터까지 마스터하셨습니다!`);
            restartFromScratch();
          }
        }, 800);
      } else {
        setMonsterEffect(strikes > 0 ? 'hit-shake' : 'miss-dodge');
        setLogs([{ input, strikes, balls }, ...logs]);
        setXp(prev => Math.min(prev + 5, maxXp));
        setInput('');
      }
    }, 600);
  };

  const renderTimerText = () => {
    if (timeLeft === null) return "⏱️ 제한시간: 무제한";
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `⏱️ 남은 시간: ${mins}분 ${secs < 10 ? '0' : ''}${secs}초`;
  };

  return (
    <div style={styles.phoneScreen}>
      <style>{animations}</style>

      {/* 📱 폰 상태바 */}
      <div style={styles.statusBar}>
        <span>9:41</span>
        <span style={{ fontWeight: 'bold' }}>⚾ 스타디움 숫자야구 3D</span>
        <span>🔋 100%</span>
      </div>

      {/* 📦 게임 메인 본문 영역 */}
      <div style={styles.contentBody}>
        {/* 🟢 1. 홈 경기장 탭 */}
        {activeTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div style={styles.spectatorDecoration}>
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} style={{ ...styles.decoBlock, backgroundColor: i % 3 === 0 ? '#ffb74d' : i % 3 === 1 ? '#4fc3f7' : '#aed581' }}></div>
              ))}
            </div>

            <div style={styles.monsterGround}>
              <div style={styles.baseballOutfieldPattern}></div>
              <div style={styles.baseballInfieldDirt}></div>
              <div style={styles.baseballFoulLineLeft}></div>
              <div style={styles.baseballFoulLineRight}></div>

              <div style={{
                ...styles.timerBanner,
                backgroundColor: timeLeft !== null && timeLeft <= 60 ? '#d32f2f' : '#333333',
                animation: timeLeft !== null && timeLeft <= 60 ? 'pulseGlow 1s infinite' : 'none'
              }}>
                {renderTimerText()}
              </div>

              <div style={styles.badgeRow}>
                <div style={styles.levelBadge}>⚡ {lvl}단계</div>
                <div style={styles.digitBadge}>🔢 {digitLength}자리 중복없음</div>
              </div>

              <div style={styles.monsterNameTag}>타석 : {currentConfig.name}</div>

              <div style={styles.interactiveArea}>
                <div 
                  style={{...styles.monsterWrapper, cursor: isPitching || isGameOver ? 'not-allowed' : 'pointer'}} 
                  className={monsterEffect || (isGameOver ? 'monster-lose-giant' : 'monster-breathing')} 
                  onClick={handleMonsterTouch}
                >
                  {!imgFailed ? (
                    <img src={getMonsterImageUrl(lvl)} alt={currentConfig.name} style={styles.monsterImg} onError={() => setImgFailed(true)} />
                  ) : (
                    <div style={{ ...styles.fallbackCard, backgroundColor: currentConfig.color }}>
                      <div style={styles.fallbackEmoji}>{currentConfig.emoji}</div>
                      <div style={styles.fallbackLevelText}>Lv.{lvl}</div>
                    </div>
                  )}
                  <div style={styles.shadow}></div>
                </div>

                <div style={{
                  ...styles.sideSpeechBubble,
                  borderColor: isGameOver ? '#d32f2f' : (isTouched ? '#ff9800' : '#1e4620'),
                  backgroundColor: isGameOver ? '#ffebee' : (isTouched ? '#fffde7' : '#ffffff'),
                  color: isGameOver ? '#c62828' : (isTouched ? '#d84315' : '#111111'),
                }}>
                  {isGameOver ? "⚠️ 크오오오!! 시간 타임아웃!! 내가 이겼다 경기장은 내 차지다!! 💥" : (isTouched ? touchLine : currentConfig.baseLine)}
                  <div style={{ ...styles.bubbleArrow, borderRightColor: isGameOver ? '#d32f2f' : (isTouched ? '#ff9800' : '#1e4620') }}></div>
                </div>
              </div>

              {isGameOver && (
                <div style={styles.defeatOverlay}>
                  <div style={styles.defeatTitle}>패배 💀</div>
                  <div style={styles.defeatSub}>시간 내에 공략하지 못해 몬스터가 무지막지하게 거대해졌습니다!</div>
                  <button onClick={restartFromScratch} style={styles.restartButton}>1단계(처음부터) 재도전하기 🔄</button>
                </div>
              )}

              {isPitching && <div style={styles.baseballNode}>⚾</div>}

              <div style={styles.xpContainer}>
                <div style={styles.xpTrack}>
                  <div style={{ ...styles.xpFill, width: `${(xp / maxXp) * 100}%` }}></div>
                </div>
                <div style={{ fontSize: '11px', color: '#fff', marginTop: '5px', fontWeight: 'bold' }}>
                  다음 레벨까지: {xp} / {maxXp} 경험치
                </div>
              </div>
            </div>

            <div style={styles.darkGreenField}>
              <div style={styles.inputArea}>
                <form onSubmit={handleGuess} style={styles.formRow}>
                  <div style={styles.inputWrapper}>
                    <input
                      type="text"
                      maxLength={digitLength}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={isGameOver ? "시간 초과 패배" : `${digitLength}자리 정답 투구`}
                      style={styles.mainInput}
                      disabled={isPitching || isGameOver}
                    />
                    <div style={styles.inputSubText}>💡 각 숫자는 서로 중복될 수 없습니다!</div>
                  </div>
                  <button type="submit" style={styles.pitchButton} disabled={isPitching || isGameOver}>
                    {isPitching ? '⏳' : '⚾ 던지기!'}
                  </button>
                </form>

                <button onClick={resetGame} style={styles.newGameButton} disabled={isGameOver}>🔄 현재 단계 다시하기</button>

                <div style={styles.logLabel}>📋 스코어보드 (기록 테이블)</div>
                <div style={styles.logList}>
                  {logs.map((log, index) => (
                    <div key={index} style={styles.logRow} className="log-fade-in">
                      <span style={styles.logInputNumber}>투구 : {log.input}</span>
                      <div style={styles.badgeGroup}>
                        <span style={styles.strikeBadge}>{log.strikes} 스트라이크</span>
                        <span style={styles.ballBadge}>{log.balls} 볼</span>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && <div style={styles.emptyLog}>스트라이크 존에 야구공을 던져보세요!</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🏆 2. 랭킹 탭 */}
        {activeTab === 'ranking' && (
          <div style={styles.subPageContainer}>
            {!isLoggedIn ? (
              <div style={styles.card}>
                <h2 style={styles.pageTitle}>🔐 플레이어 로그인</h2>
                <p style={styles.pageDesc}>게임 기록과 랭킹을 저장하기 위해 닉네임을 등록하세요!</p>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" placeholder="사용할 닉네임 입력" value={inputNickname} onChange={(e) => setInputNickname(e.target.value)} style={styles.nickInput} maxLength={10} />
                  <button type="submit" style={styles.subPageButton}>구장 입장하기</button>
                </form>
              </div>
            ) : (
              <div style={styles.card}>
                <div style={styles.userInfoBanner}>
                  <span>👤 <strong>{nickname}</strong>님 대기실</span>
                  <span style={styles.userBadge}>현재 {lvl}단계 주자</span>
                </div>
              </div>
            )}

            <div style={styles.card}>
              <h2 style={styles.pageTitle}>🏆 명예의 전당 (실시간 랭킹)</h2>
              <div style={styles.rankList}>
                {rankingList.map((user, idx) => (
                  <div key={idx} style={{
                    ...styles.rankRow,
                    backgroundColor: user.nickname === nickname ? '#e8f5e9' : '#fff',
                    border: user.nickname === nickname ? '2px solid #4caf50' : '1px solid #e0e0e0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ ...styles.rankNumber, color: idx === 0 ? '#ffb300' : idx === 1 ? '#9e9e9e' : idx === 2 ? '#cd7f32' : '#757575' }}>{idx + 1}등</span>
                      <span style={styles.rankName}>{user.nickname}</span>
                    </div>
                    <span style={styles.rankLevelBadge}>최대 {user.maxLvl}단계 격파</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ⚙️ 3. 몬스터 도감 탭 */}
        {activeTab === 'settings' && (
          <div style={styles.subPageContainer}>
            <div style={styles.card}>
              <h2 style={styles.pageTitle}>📖 스타디움 타자 몬스터 도감</h2>
              <p style={styles.pageDesc}>상대할 몬스터들의 특성과 자릿수 룰을 파악해 보세요.</p>
            </div>
            <div style={styles.bookContainer}>
              {Object.keys(LEVEL_CONFIG).map((key) => {
                const item = LEVEL_CONFIG[key];
                return (
                  <div key={key} style={styles.bookRow}>
                    <div style={styles.bookLeft}>
                      <div style={{ ...styles.bookMonsterCircle, backgroundColor: item.color + "22", color: item.color }}>{item.emoji}</div>
                      <span style={{ ...styles.bookLevelLabel, backgroundColor: item.color }}>단계 {key}</span>
                    </div>
                    <div style={styles.bookRight}>
                      <h3 style={styles.bookMonsterName}>{item.name} <small style={{color: '#1976d2'}}>({item.digits}자리)</small></h3>
                      <p style={styles.bookMonsterDesc}>{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 📱 인터랙티브 볼록 내비게이션 바 */}
      <div style={styles.navBarWrapper}>
        <div style={styles.navBarContainer}>
          <div style={styles.navSlot}>
            <button 
              onClick={() => setActiveTab('home')}
              style={{
                ...styles.dynamicBtn,
                transform: activeTab === 'home' ? 'translateY(-20px)' : 'translateY(0)',
                backgroundColor: activeTab === 'home' ? '#253f18' : 'transparent',
                boxShadow: activeTab === 'home' ? '0 8px 16px rgba(37,63,24,0.35)' : 'none',
                color: activeTab === 'home' ? '#ffffff' : '#757575',
              }}
            >
              <div style={styles.iconCircle}>
                <svg style={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span style={{...styles.navLabel, color: activeTab === 'home' ? '#ffffff' : '#757575'}}>홈 구장</span>
            </button>
          </div>

          <div style={styles.navSlot}>
            <button 
              onClick={() => setActiveTab('ranking')}
              style={{
                ...styles.dynamicBtn,
                transform: activeTab === 'ranking' ? 'translateY(-20px)' : 'translateY(0)',
                backgroundColor: activeTab === 'ranking' ? '#253f18' : 'transparent',
                boxShadow: activeTab === 'ranking' ? '0 8px 16px rgba(37,63,24,0.35)' : 'none',
                color: activeTab === 'ranking' ? '#ffffff' : '#757575',
              }}
            >
              <div style={styles.iconCircle}>
                <svg style={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span style={{...styles.navLabel, color: activeTab === 'ranking' ? '#ffffff' : '#757575'}}>순위 기록</span>
            </button>
          </div>

          <div style={styles.navSlot}>
            <button 
              onClick={() => setActiveTab('settings')}
              style={{
                ...styles.dynamicBtn,
                transform: activeTab === 'settings' ? 'translateY(-20px)' : 'translateY(0)',
                backgroundColor: activeTab === 'settings' ? '#253f18' : 'transparent',
                boxShadow: activeTab === 'settings' ? '0 8px 16px rgba(37,63,24,0.35)' : 'none',
                color: activeTab === 'settings' ? '#ffffff' : '#757575',
              }}
            >
              <div style={styles.iconCircle}>
                <svg style={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </div>
              <span style={{...styles.navLabel, color: activeTab === 'settings' ? '#ffffff' : '#757575'}}>몬스터 도감</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  phoneScreen: { width: '100%', maxWidth: '480px', height: '100vh', margin: '0 auto', background: '#eef2eb', display: 'flex', flexDirection: 'column', position: 'relative', boxSizing: 'border-box', fontFamily: '"Malgun Gothic", sans-serif', overflow: 'hidden', boxShadow: '0 0 20px rgba(0,0,0,0.3)' },
  statusBar: { display: 'flex', justifyContent: 'space-between', padding: '12px 20px 6px 20px', color: '#fff', fontSize: '13px', background: '#253f18', zIndex: 10 },
  contentBody: { flex: 1, overflowY: 'auto', paddingBottom: '110px', display: 'flex', flexDirection: 'column' },
  spectatorDecoration: { display: 'flex', height: '10px', background: '#1c3012', zIndex: 10 },
  decoBlock: { flex: 1, height: '100%', opacity: 0.8 },
  monsterGround: { background: '#457530', position: 'relative', padding: '15px 0 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', borderBottom: '5px dashed #fff' },
  timerBanner: { zIndex: 5, padding: '6px 16px', borderRadius: '12px', color: '#fff', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', minWidth: '160px', textAlign: 'center' },
  baseballOutfieldPattern: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'repeating-linear-gradient(45deg, #457530, #457530 20px, #3d692a 20px, #3d692a 40px)', opacity: 0.6, zIndex: 1 },
  baseballInfieldDirt: { position: 'absolute', bottom: '-40px', width: '360px', height: '200px', background: '#c87d55', borderRadius: '50%', border: '4px solid #b0663e', zIndex: 2, opacity: 0.95, boxShadow: 'inset 0 0 15px rgba(0,0,0,0.2)' },
  baseballFoulLineLeft: { position: 'absolute', bottom: 0, left: '15%', width: '3px', height: '180px', background: '#fff', transform: 'rotate(-25deg)', zIndex: 3, opacity: 0.7 },
  baseballFoulLineRight: { position: 'absolute', bottom: 0, right: '15%', width: '3px', height: '180px', background: '#fff', transform: 'rotate(25deg)', zIndex: 3, opacity: 0.7 },
  badgeRow: { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '5px', zIndex: 5 },
  levelBadge: { background: '#d32f2f', color: '#fff', padding: '5px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' },
  digitBadge: { background: '#1976d2', color: '#fff', padding: '5px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' },
  monsterNameTag: { background: '#1c3012', color: '#fff', fontSize: '12px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '6px', margin: '4px 0', zIndex: 5, border: '1px solid #457530' },
  interactiveArea: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '94%', minHeight: '160px', marginTop: '5px', zIndex: 5 },
  monsterWrapper: { position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent', flexShrink: 0 },
  monsterImg: { width: '115px', height: '115px', objectFit: 'contain', zIndex: 6, filter: 'drop-shadow(0px 10px 14px rgba(0,0,0,0.35))', transition: 'all 0.4s ease' },
  fallbackCard: { width: '100px', height: '100px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 6, boxShadow: '0 8px 20px rgba(0,0,0,0.25)', border: '3px solid #ffffff', color: '#ffffff', transition: 'all 0.4s ease' },
  fallbackEmoji: { fontSize: '42px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' },
  fallbackLevelText: { fontSize: '12px', fontWeight: 'bold', marginTop: '2px', background: 'rgba(0,0,0,0.2)', padding: '1px 8px', borderRadius: '10px' },
  shadow: { width: '65px', height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '50%', position: 'absolute', bottom: '-4px', left: '27px', zIndex: 4 },
  sideSpeechBubble: { position: 'relative', maxWidth: '200px', padding: '12px 14px', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold', lineHeight: '1.45', boxShadow: '0 6px 16px rgba(0,0,0,0.2)', border: '3px solid #1e4620', transition: 'all 0.25s ease', wordBreak: 'keep-all' },
  bubbleArrow: { position: 'absolute', left: '-10px', top: '50%', transform: 'translateY(-50%)', borderWidth: '6px 10px 6px 0', borderStyle: 'solid', borderColor: 'transparent #1e4620 transparent transparent', width: 0, height: 0 },
  defeatOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.82)', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', animation: 'fadeIn 0.4s ease-out' },
  defeatTitle: { fontSize: '42px', color: '#ff2a00', fontWeight: 'bold', textShadow: '0 3px 6px rgba(0,0,0,0.6)', marginBottom: '12px' },
  defeatSub: { fontSize: '15px', color: '#fff', marginBottom: '24px', wordBreak: 'keep-all', lineHeight: '1.4' },
  restartButton: { background: '#2e7d32', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '14px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 5px 12px rgba(0,0,0,0.4)' },
  baseballNode: { position: 'absolute', fontSize: '36px', zIndex: 9, left: '25%', bottom: '-20px', animation: 'ballThrow 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' },
  xpContainer: { width: '85%', marginTop: '15px', textAlign: 'right', zIndex: 5 },
  xpTrack: { width: '100%', height: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' },
  xpFill: { height: '100%', background: 'linear-gradient(to right, #ffb74d, #ffa726)', borderRadius: '10px', transition: 'width 0.3s ease' },
  darkGreenField: { background: '#253f18', padding: '5px 0', display: 'flex', flexDirection: 'column', flex: 1 },
  inputArea: { background: '#f4f6f0', margin: '12px', padding: '16px', borderRadius: '24px', display: 'flex', flexDirection: 'column', flex: 1, boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.05)' },
  formRow: { display: 'flex', gap: '10px', width: '100%' },
  inputWrapper: { flex: 1, display: 'flex', flexDirection: 'column' },
  mainInput: { width: '100%', padding: '14px', fontSize: '18px', textAlign: 'center', borderRadius: '16px', border: '2px solid #9ccc65', background: '#fff', color: '#2e4d1e', fontWeight: 'bold', outline: 'none', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  inputSubText: { fontSize: '11px', color: '#e53935', textAlign: 'center', marginTop: '5px', fontWeight: 'bold' },
  pitchButton: { background: '#e64a19', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '16px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 0 #bf360c', height: '54px' },
  newGameButton: { width: '100%', background: '#558b2f', color: '#fff', border: 'none', padding: '10px', borderRadius: '14px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginTop: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  logLabel: { fontSize: '13px', color: '#253f18', fontWeight: 'bold', marginTop: '14px', marginBottom: '6px' },
  logList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  logRow: { background: '#fff', borderRadius: '12px', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.06)', borderLeft: '5px solid #558b2f' },
  logInputNumber: { color: '#253f18', fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px' },
  badgeGroup: { display: 'flex', gap: '5px' },
  strikeBadge: { background: '#6a1b9a', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' },
  ballBadge: { background: '#0277bd', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' },
  emptyLog: { textAlign: 'center', color: '#757575', fontSize: '13px', padding: '25px 0' },
  subPageContainer: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', boxSizing: 'border-box' },
  card: { background: '#fff', padding: '18px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  pageTitle: { fontSize: '18px', color: '#253f18', fontWeight: 'bold', marginBottom: '6px', marginTop: 0 },
  pageDesc: { fontSize: '13px', color: '#666', margin: '0 0 14px 0', lineHeight: '1.4' },
  nickInput: { width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #ccc', outline: 'none', boxSizing: 'border-box', fontSize: '15px' },
  subPageButton: { width: '100%', padding: '12px', background: '#2e4d1e', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' },
  userInfoBanner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: '#333' },
  userBadge: { background: '#e8f5e9', color: '#2e4d1e', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px' },
  rankList: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' },
  rankRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '12px' },
  rankNumber: { fontWeight: 'bold', fontSize: '15px', minWidth: '30px' },
  rankName: { fontWeight: 'bold', color: '#333', fontSize: '14px' },
  rankLevelBadge: { background: '#f5f5f5', color: '#666', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' },
  bookContainer: { display: 'flex', flexDirection: 'column', gap: '10px' },
  bookRow: { display: 'flex', gap: '12px', background: '#fff', padding: '14px', borderRadius: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' },
  bookLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', minWidth: '60px' },
  bookMonsterCircle: { width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' },
  bookLevelLabel: { fontSize: '11px', color: '#fff', padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold' },
  bookRight: { flex: 1 },
  bookMonsterName: { fontSize: '15px', color: '#253f18', margin: '0 0 4px 0', fontWeight: 'bold' },
  bookMonsterDesc: { fontSize: '12px', color: '#666', margin: 0, lineHeight: '1.4', wordBreak: 'keep-all' },
  navBarWrapper: { position: 'absolute', bottom: '0', left: '0', right: '0', height: '85px', background: 'transparent', zIndex: 100 },
  navBarContainer: { width: '100%', height: '100%', background: '#ffffff', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', boxShadow: '0 -6px 25px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', padding: '0 10px 0 10px', boxSizing: 'border-box' },
  navSlot: { width: '80px', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', position: 'relative' },
  dynamicBtn: { background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none', width: '68px', height: '68px', borderRadius: '50%', transition: 'transform 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.2), background-color 0.2s', position: 'absolute', bottom: '12px' },
  iconCircle: { width: '32px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  navIcon: { width: '22px', height: '22px' },
  navLabel: { fontSize: '10px', fontWeight: 'bold', marginTop: '3px', whiteSpace: 'nowrap' }
};

const animations = `
  .monster-breathing { animation: breathingEffect 2.5s ease-in-out infinite; }
  @keyframes breathingEffect { 0%, 100% { transform: scale(1) translateY(0); } 50% { transform: scale(1.05, 0.95) translateY(-6px); } }
  .monster-appear { animation: appearEffect 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
  @keyframes appearEffect { 0% { transform: translateY(-150px) scale(0.3); opacity: 0; } 60% { transform: translateY(10px) scale(1.1, 0.8); opacity: 1; } 80% { transform: translateY(-5px) scale(0.95, 1.05); } 100% { transform: translateY(0) scale(1); } }
  .monster-poke { animation: pokeEffect 0.3s ease-in-out; }
  @keyframes pokeEffect { 0%, 100% { transform: scale(1); } 30% { transform: scale(0.85) translateY(5px); } 70% { transform: scale(1.1) translateY(-8px); } }
  .hit-shake { animation: shakeEffect 0.4s ease-in-out; }
  @keyframes shakeEffect { 0%, 100% { transform: scale(1); } 20%, 60% { transform: scale(0.9, 1.1) rotate(-4deg) translateX(-10px); } 40%, 80% { transform: scale(1.1, 0.9) rotate(4deg) translateX(10px); } }
  .miss-dodge { animation: dodgeEffect 0.4s ease-in-out; }
  @keyframes dodgeEffect { 0%, 100% { transform: translateX(0); } 30% { transform: translateX(20px) skewX(-10deg); } 70% { transform: translateX(-10px) skewX(5deg); } }
  .hit-success { animation: successEffect 0.8s ease-out; }
  @keyframes successEffect { 0% { transform: scale(1); } 30% { transform: scale(1.25) rotate(12deg); filter: brightness(1.4); } 70% { transform: scale(0.85) rotate(-12deg); } 100% { transform: scale(1); } }
  .monster-lose-giant { animation: giantEffect 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
  @keyframes giantEffect { 0% { transform: scale(1); } 100% { transform: scale(2.4) translateY(-12px); filter: saturate(1.8) drop-shadow(0px 20px 35px rgba(0,0,0,0.6)); } }
  @keyframes pulseGlow { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.85; } }
  @keyframes ballThrow { 0% { transform: translateY(200px) translateX(0) scale(0.4); opacity: 0; } 20% { opacity: 1; } 90% { transform: translateY(-40px) translateX(-40px) scale(1.1); opacity: 1; } 100% { transform: translateY(-50px) translateX(-50px) scale(0); opacity: 0; } }
  .log-fade-in { animation: fadeIn 0.3s ease-out; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
`;

export default App;