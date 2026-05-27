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

// 👾 레벨별 설정 데이터 (10단계 5분으로 변경)
const LEVEL_CONFIG = {
  1: { digits: 3, timeLimit: null, name: "졸린 보라 몬스터", emoji: "🔮", color: "#7e57c2", baseLine: "쿨쿨...💤 깨우면 화낼꼬야... 야구공 던지지 마!", touchLine: "💤 아우 졸려어어... 건들지 마라 더 잘거야아앙... 😴", description: "항상 졸려 눈을 제대로 뜨지 못하는 보라색 생명체. 잠을 방해하는 야구공을 세상에서 가장 싫어합니다." },
  2: { digits: 3, timeLimit: 40 * 60, name: "초록 눈망울 몬스터", emoji: "🌱", color: "#9ccc65", baseLine: "헉!😮 방금 던진 공 뭐야?! 깜짝 놀랐잖아!", touchLine: "⚡ 앗 깜짝이야!! 갑자기 만지면 어떡해!! 튀용~ 😲", description: "소심하고 겁이 많아 작은 소리에도 통통 튀어 오르는 초록 몬스터. 놀라게 하면 삐질지도 몰라요." },
  3: { digits: 4, timeLimit: 30 * 60, name: "노란 귀 몬스터", emoji: "🍊", color: "#ffca28", baseLine: "4자리 숫자인가? 냠냠~ 내 귀 맛있겠다! 🍊", touchLine: "🍊 냠냠! 내 귀는 귤이 아니라구! 먹는 거 아니야!! 😡", description: "머리에 달린 상큼한 귤 모양 귀가 매력 포인트. 자꾸 먹을 것으로 오해받아 스트레스를 받고 있습니다." },
  4: { digits: 4, timeLimit: 25 * 60, name: "빨간 에너지 몬스터", emoji: "🔥", color: "#ef5350", baseLine: "크오오오!!🔥 에너지가 끓어오른다! 다 맞춰봐!", touchLine: "🔥 앗 뜨거! 지금 내 몸은 불타오르고 있으니 조심해라 크르릉!!", description: "전신이 불타는 마그마로 이루어진 열정적인 파이터. 정답을 맞추기 전까진 절대 화를 가라앉히지 않습니다." },
  5: { digits: 5, timeLimit: 20 * 60, name: "파란 날개 몬스터", emoji: "❄️", color: "#29b6f6", baseLine: "5자리나 되는데 과연? 😠 내 날개로 다 쳐내주지!", touchLine: "💨 내 날개 깃털 만지지 마! 간지럽단 말이야 흐흥!! 😤", description: "단단하고 거대한 얼음 날개를 지닌 수호신. 5자리의 복잡한 숫자로 투수들의 혼을 쏙 빼놓습니다." },
  6: { digits: 5, timeLimit: 15 * 60, name: "핑크 전설 몬스터 ✨", emoji: "👑", color: "#ec407a", baseLine: "✨ 전설의 별 왕관 등장! 최종 마스터에 도전해라! ✨", touchLine: "✨ 감히 전설의 왕관을 터치하다니! 무례하도다 소년이여!! ✨", description: "이 스타디움의 지배자이자 전설적인 존재. 화려한 별 왕관을 쓰고 있으며, 완벽한 투구만이 그를 굴복시킬 수 있습니다." },
  7: { digits: 6, timeLimit: 10 * 60, name: "심연의 기계 드래곤", emoji: "🐉", color: "#37474f", baseLine: "인간의 야구공 따위, 내 강철 비늘을 뚫을 수 없다! 🤖", touchLine: "⚙️ 위이잉! 내 시스템을 자극하지 마라, 폭주할지니!!", description: "지하 깊은 곳에서 깨어난 반인반기계 드래곤. 6자리의 복잡한 코드 조합을 풀어야만 가동을 중지시킬 수 있습니다." },
  8: { digits: 6, timeLimit: 7 * 60, name: "은하계 은둔자", emoji: "🌌", color: "#4a148c", baseLine: "우주의 경지에 도달한 투구만이 나에게 닿을 것이다... 🌠", touchLine: "💫 내 가운을 만지다니... 네 영혼이 우주 저편으로 날아갈 수도 있다.", description: "수천 년 동안 은하의 끝에서 야구의 진리를 깨우친 미스터리한 존재. 그의 스트라이크 존은 왜곡되어 있습니다." },
  9: { digits: 7, timeLimit: 5 * 60, name: "시공간의 지배자", emoji: "⏳", color: "#006064", baseLine: "시간이 얼마 남지 않았다... 네 미래는 패배뿐이지! ⏱️", touchLine: "🌀 콰아아아! 시공간의 균열이 느껴지느냐? 함부로 손대지 마라!", description: "과거와 미래를 자유롭게 넘나드는 신비로운 보스. 무려 7자리의 정답 숫자를 요구하며 유저들의 멘탈을 흔들어 놓습니다." },
  10: { digits: 7, timeLimit: 5 * 60, name: "종말의 다크 메테오 ✨", emoji: "☄️", color: "#212121", baseLine: "✨ 마지막 5분의 기적을 보여줘라, 하찮은 인간 투수여! ✨", touchLine: "💥 쾅!!! 감히 종말의 운석을 건드려?! 지구가 멸망할 수도 있다!! ✨", description: "우주가 폭발할 때 태어난 암흑 물질의 결정체이자 이 게임의 최종 진 보스. 5분 안에 7자리를 맞추는 기적을 행해야만 격파할 수 있습니다." }
};

const INITIAL_RANKING = [
  { nickname: "홈런왕김타자", maxLvl: 10, date: "2026-05-18" },
  { nickname: "삼진아웃", maxLvl: 8, date: "2026-05-17" },
  { nickname: "몬스터사냥꾼", maxLvl: 6, date: "2026-05-18" },
  { nickname: "야구초보", maxLvl: 2, date: "2026-05-15" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  // 👤 로그인/랭킹 상태
  const [nickname, setNickname] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inputNickname, setInputNickname] = useState('');
  const [rankingList, setRankingList] = useState(INITIAL_RANKING);

  // 👑 관리자(개발자 치트) 상태 관련 추가
  const [isAdmin, setIsAdmin] = useState(false);
  const [secretCode, setSecretCode] = useState('');

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
  const [timeLeft, setTimeLeft] = useState(null); 
  const [isGameOver, setIsGameOver] = useState(false);
  
  // 🚨 추가: 보스전(5, 10단계) 전용 투구 횟수 및 패배 사유 상태
  const [pitchCount, setPitchCount] = useState(null); 
  const [defeatReason, setDefeatReason] = useState(null); // 'time' or 'count'

  const maxXp = 30; 
  const currentConfig = LEVEL_CONFIG[lvl] || LEVEL_CONFIG[1];

  // 💡 투구 횟수 초기화 헬퍼 함수
  const getInitialPitchCount = (level) => (level === 5 || level === 10) ? 15 : null;

  useEffect(() => {
    if (timeLeft === null || isGameOver || activeTab !== 'home') return;

    if (timeLeft <= 0) {
      setIsGameOver(true);
      setDefeatReason('time');
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

  // 🛠️ 관리자 패스코드 검증 함수
  const handleVerifyAdmin = (e) => {
    e.preventDefault();
    if (secretCode === 'lmnbvcx10#') { 
      setIsAdmin(true);
      alert("⚙️ 개발자 관리자 모드가 활성화되었습니다! 홈 구장에서 단계를 자유롭게 변경하세요.");
      setSecretCode('');
    } else {
      alert("❌ 잘못된 관리자 암호 코드입니다.");
    }
  };

  // 🛠️ 관리자 전용 즉시 레벨 워프 함수
  const adminWarpToLevel = (targetLvl) => {
    const config = LEVEL_CONFIG[targetLvl];
    setLvl(targetLvl);
    setDigitLength(config.digits);
    setAnswer(generateRandomNumbers(config.digits));
    setInput('');
    setLogs([]);
    setXp(0);
    setImgFailed(false);
    setMonsterEffect('monster-appear');
    setTimeLeft(config.timeLimit);
    setPitchCount(getInitialPitchCount(targetLvl));
    setIsGameOver(false);
    setDefeatReason(null);
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
    setTimeLeft(currentConfig.timeLimit);
    setPitchCount(getInitialPitchCount(lvl));
    setIsGameOver(false);
    setDefeatReason(null);
  };

  const restartFromScratch = () => {
    setLvl(1);
    setDigitLength(LEVEL_CONFIG[1].digits);
    setAnswer(generateRandomNumbers(LEVEL_CONFIG[1].digits));
    setInput('');
    setLogs([]);
    setXp(0);
    setIsGameOver(false);
    setDefeatReason(null);
    setImgFailed(false);
    setMonsterEffect('monster-appear');
    setTimeLeft(LEVEL_CONFIG[1].timeLimit);
    setPitchCount(getInitialPitchCount(1));
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
          if (lvl < 10) { 
            const nextConfig = LEVEL_CONFIG[nextLvl];
            
            setLvl(nextLvl);
            setDigitLength(nextConfig.digits);
            setAnswer(generateRandomNumbers(nextConfig.digits));
            setInput('');
            setLogs([]);
            setXp(0);
            setImgFailed(false);
            setMonsterEffect('monster-appear');
            setTimeLeft(nextConfig.timeLimit);
            setPitchCount(getInitialPitchCount(nextLvl));
            setIsGameOver(false);
            setDefeatReason(null);

            if (isLoggedIn) {
              setRankingList(prev => prev.map(u => u.nickname === nickname ? { ...u, maxLvl: nextLvl } : u).sort((a, b) => b.maxLvl - a.maxLvl));
            }

            alert(`🎉 정답!! 홈런!! [${currentConfig.name}]을(를) 격파하고 레벨업합니다!`);
          } else {
            alert(`🏆 신화 등극!! 최종 10단계 보스 [종말의 다크 메테오]까지 완벽하게 격파하고 우주의 지배자가 되셨습니다!`);
            restartFromScratch();
          }
        }, 800);
      } else {
        setMonsterEffect(strikes > 0 ? 'hit-shake' : 'miss-dodge');
        setLogs([{ input, strikes, balls }, ...logs]);
        setXp(prev => Math.min(prev + 5, maxXp));
        setInput('');

        // 🚨 보스전 투구 횟수 차감 로직
        if (lvl === 5 || lvl === 10) {
          const newCount = pitchCount - 1;
          setPitchCount(newCount);
          if (newCount <= 0) {
            setIsGameOver(true);
            setDefeatReason('count');
            setMonsterEffect('monster-lose-giant');
          }
        }
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
        <span style={{ fontWeight: 'bold' }}>⚾ 스타디움 숫자야구 3D {isAdmin && "(Admin)"}</span>
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

              {/* 🚨 보스 경고 애니메이션 (5, 10단계 전용) */}
              {(lvl === 5 || lvl === 10) && !isGameOver && (
                <div style={styles.bossWarningTitle}>🔥 BOSS 🔥</div>
              )}

              <div style={{
                ...styles.timerBanner,
                backgroundColor: timeLeft !== null && timeLeft <= 60 ? '#d32f2f' : '#333333',
                animation: timeLeft !== null && timeLeft <= 60 ? 'pulseGlow 1s infinite' : 'none'
              }}>
                {renderTimerText()}
              </div>

              {/* 🚨 투구 횟수 뱃지 (5, 10단계 전용) */}
              {(lvl === 5 || lvl === 10) && (
                <div style={{
                  ...styles.pitchCountBanner,
                  backgroundColor: pitchCount <= 5 ? '#d32f2f' : '#e65100',
                  animation: pitchCount <= 3 ? 'pulseGlow 0.5s infinite' : 'none'
                }}>
                  ⚾ 남은 투구: {pitchCount}회
                </div>
              )}

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
                  {isGameOver ? "⚠️ 크오오오!! 내 승리다! 경기장은 내 차지다!! 💥" : (isTouched ? touchLine : currentConfig.baseLine)}
                  <div style={{ ...styles.bubbleArrow, borderRightColor: isGameOver ? '#d32f2f' : (isTouched ? '#ff9800' : '#1e4620') }}></div>
                </div>
              </div>

              {isGameOver && (
                <div style={styles.defeatOverlay}>
                  <div style={styles.defeatTitle}>패배 💀</div>
                  <div style={styles.defeatSub}>
                    {defeatReason === 'count' 
                      ? "투구 기회를 모두 소진했습니다! 몬스터가 공을 튕겨냅니다!" 
                      : "시간 내에 공략하지 못해 몬스터가 무지막지하게 거대해졌습니다!"}
                  </div>
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
                {/* 👑 [관리자 전용 특전] 실시간 정답 치트창 및 레벨 스킵 패널 */}
                {isAdmin && (
                  <div style={styles.adminPanel}>
                    <div style={{fontWeight: 'bold', color: '#d84315', marginBottom: '6px', fontSize: '12px'}}>
                      ⚙️ 개발자 치트 모드 상시 가동 중
                    </div>
                    <div style={{fontSize: '13px', marginBottom: '8px', color: '#333'}}>
                      🔮 현재 정답 실시간 스파이: <strong style={{color: '#d32f2f', letterSpacing: '2px'}}>{answer.join('')}</strong>
                    </div>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px'}}>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <button key={n} onClick={() => adminWarpToLevel(n)} style={{
                          ...styles.adminWarpBtn,
                          backgroundColor: lvl === n ? '#d84315' : '#555'
                        }}>
                          {n}강
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleGuess} style={styles.formRow}>
                  <div style={styles.inputWrapper}>
                    <input
                      type="text"
                      maxLength={digitLength}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={isGameOver ? "패배 종료" : `${digitLength}자리 정답 투구`}
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

            {/* 🛠️ [히든 관리자 로그인 폼] */}
            {!isAdmin && (
              <div style={{...styles.card, background: '#f5f5f5', border: '1px dashed #ccc'}}>
                <h3 style={{fontSize: '13px', margin: '0 0 6px 0', color: '#666'}}>🔒 개발자 전용 게이트</h3>
                <form onSubmit={handleVerifyAdmin} style={{display: 'flex', gap: '8px'}}>
                  <input 
                    type="password" 
                    placeholder="패스코드 입력" 
                    value={secretCode} 
                    onChange={(e) => setSecretCode(e.target.value)} 
                    style={{...styles.nickInput, padding: '6px 12px', fontSize: '13px', flex: 1}} 
                  />
                  <button type="submit" style={{...styles.subPageButton, width: 'auto', padding: '6px 14px', fontSize: '12px', background: '#555'}}>인증</button>
                </form>
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

// 🎨 스타일 옵션 및 CSS 애니메이션 스트링 복구 세팅
const animations = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pulseGlow { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
  @keyframes ballThrow {
    0% { transform: scale(1) translate(0, 0); opacity: 1; }
    30% { transform: scale(1.6) translate(60px, -120px); opacity: 1; }
    100% { transform: scale(0.2) translate(150px, -320px); opacity: 0; }
  }
  .monster-breathing { animation: breath 3s ease-in-out infinite; }
  @keyframes breath { 0% { transform: scale(1); } 50% { transform: scale(1.04); } 100% { transform: scale(1); } }
  .monster-appear { animation: popEntry 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
  @keyframes popEntry { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .monster-poke { animation: jitter 0.2s linear infinite; }
  @keyframes jitter { 0% { transform: translate(2px, 1px) rotate(0deg); } 20% { transform: translate(-1px, -2px) rotate(-1deg); } 40% { transform: translate(-3px, 0px) rotate(1deg); } 60% { transform: translate(0px, 2px) rotate(0deg); } 80% { transform: translate(1px, -1px) rotate(1deg); } 100% { transform: translate(-1px, 2px) rotate(-1deg); } }
  .hit-shake { animation: hitShakeEffect 0.4s ease-in-out; }
  @keyframes hitShakeEffect { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-10px); filter: brightness(1.3); } 40%, 80% { transform: translateX(10px); filter: brightness(1.3); } }
  .miss-dodge { animation: dodgeEffect 0.5s ease-in-out; }
  @keyframes dodgeEffect { 0%, 100% { transform: translateY(0); } 30% { transform: translateX(50px) rotate(15deg); opacity: 0.8; } 70% { transform: translateX(-10px); } }
  .hit-success { animation: spinSuccess 0.8s ease-in-out forwards; }
  @keyframes spinSuccess { 0% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.3) rotate(180deg); filter: hue-rotate(90deg); } 100% { transform: scale(0) rotate(360deg); opacity: 0; } }
  .monster-lose-giant { animation: growGiant 1.5s ease-out forwards; }
  @keyframes growGiant { from { transform: scale(1); filter: grayscale(0.5); } to { transform: scale(2.8); filter: grayscale(1) sepia(1) saturate(5) hue-rotate(-50deg); opacity: 0.9; } }
  .log-fade-in { animation: logSlide 0.3s ease-out forwards; }
  @keyframes logSlide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  
  /* 🚨 보스 전용 애니메이션 추가 */
  @keyframes bossWarnPulse {
    0% { transform: scale(1) rotate(-3deg); text-shadow: 0 0 10px #ff0000; }
    50% { transform: scale(1.15) rotate(3deg); text-shadow: 0 0 25px #ff4500, 0 0 40px #ff0000; color: #fff; }
    100% { transform: scale(1) rotate(-3deg); text-shadow: 0 0 10px #ff0000; }
  }
`;

const styles = {
  phoneScreen: { width: '100%', maxWidth: '480px', height: '100vh', margin: '0 auto', background: '#eef2eb', display: 'flex', flexDirection: 'column', position: 'relative', boxSizing: 'border-box', fontFamily: '"Malgun Gothic", sans-serif', overflow: 'hidden', boxShadow: '0 0 20px rgba(0,0,0,0.3)' },
  statusBar: { display: 'flex', justifyContent: 'space-between', padding: '12px 20px 6px 20px', color: '#fff', fontSize: '13px', background: '#253f18', zIndex: 10 },
  contentBody: { flex: 1, overflowY: 'auto', paddingBottom: '110px', display: 'flex', flexDirection: 'column' },
  spectatorDecoration: { display: 'flex', height: '10px', background: '#1c3012', zIndex: 10 },
  decoBlock: { flex: 1, height: '100%', opacity: 0.8 },
  monsterGround: { background: '#457530', position: 'relative', padding: '15px 0 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', borderBottom: '5px dashed #fff' },
  timerBanner: { zIndex: 5, padding: '6px 16px', borderRadius: '12px', color: '#fff', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', minWidth: '160px', textAlign: 'center' },
  
  /* 🚨 보스 관련 스타일 추가 */
  bossWarningTitle: { color: '#ff1744', fontSize: '32px', fontWeight: '900', fontStyle: 'italic', textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000', animation: 'bossWarnPulse 0.8s infinite', marginBottom: '10px', zIndex: 15, letterSpacing: '2px' },
  pitchCountBanner: { zIndex: 5, padding: '4px 14px', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' },

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
  
  /* 🧩 잘렸던 나머지 스타일 복구 영역 */
  defeatSub: { fontSize: '15px', color: '#fff', marginBottom: '25px', lineHeight: '1.4' },
  restartButton: { padding: '12px 24px', background: '#ff9800', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' },
  baseballNode: { position: 'absolute', fontSize: '24px', zIndex: 20, animation: 'ballThrow 0.6s linear forwards' },
  xpContainer: { width: '80%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px', zIndex: 5 },
  xpTrack: { width: '100%', height: '8px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', overflow: 'hidden' },
  xpFill: { height: '100%', background: '#4caf50', transition: 'width 0.3s ease' },
  darkGreenField: { flex: 1, background: '#2e4d20', padding: '15px 20px', display: 'flex', flexDirection: 'column', zIndex: 5, boxShadow: '0 -4px 10px rgba(0,0,0,0.2)' },
  inputArea: { display: 'flex', flexDirection: 'column', gap: '10px' },
  adminPanel: { background: '#fff9c4', padding: '10px', borderRadius: '8px', border: '2px dashed #fbc02d', marginBottom: '10px' },
  adminWarpBtn: { color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' },
  formRow: { display: 'flex', gap: '8px', alignItems: 'flex-start' },
  inputWrapper: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  mainInput: { width: '100%', padding: '12px', fontSize: '18px', borderRadius: '8px', border: '2px solid #aed581', textAlign: 'center', fontWeight: 'bold', outline: 'none', boxSizing: 'border-box' },
  inputSubText: { fontSize: '11px', color: '#aed581', textAlign: 'center' },
  pitchButton: { background: '#ff5722', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', height: '51px', boxShadow: '0 4px 0 #d84315' },
  newGameButton: { background: '#558b2f', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', marginTop: '5px' },
  logLabel: { color: '#fff', fontSize: '14px', fontWeight: 'bold', marginTop: '15px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '5px' },
  logList: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', paddingRight: '5px' },
  logRow: { background: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  logInputNumber: { fontSize: '16px', fontWeight: 'bold', color: '#333', letterSpacing: '2px' },
  badgeGroup: { display: 'flex', gap: '5px' },
  strikeBadge: { background: '#f44336', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
  ballBadge: { background: '#2196f3', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
  emptyLog: { color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center', padding: '20px 0' },
  subPageContainer: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  pageTitle: { margin: '0 0 10px 0', fontSize: '18px', color: '#2e4d20' },
  pageDesc: { margin: '0 0 15px 0', fontSize: '13px', color: '#666', lineHeight: '1.5' },
  nickInput: { width: '100%', padding: '12px', fontSize: '15px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', outline: 'none' },
  subPageButton: { width: '100%', padding: '12px', background: '#2e4d20', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  userInfoBanner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '15px' },
  userBadge: { background: '#e8f5e9', color: '#2e4d20', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #c8e6c9' },
  rankList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  rankRow: { padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  rankNumber: { fontWeight: 'bold', fontSize: '16px' },
  rankName: { fontSize: '15px', fontWeight: 'bold', color: '#333' },
  rankLevelBadge: { fontSize: '12px', background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px', color: '#666' },
  bookContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
  bookRow: { background: '#fff', padding: '15px', borderRadius: '12px', display: 'flex', gap: '15px', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  bookLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', minWidth: '60px' },
  bookMonsterCircle: { width: '50px', height: '50px', borderRadius: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' },
  bookLevelLabel: { color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' },
  bookRight: { flex: 1 },
  bookMonsterName: { margin: '0 0 5px 0', fontSize: '15px', color: '#333' },
  bookMonsterDesc: { margin: 0, fontSize: '12px', color: '#666', lineHeight: '1.4' },
  navBarWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: '#fff', borderRadius: '24px 24px 0 0', boxShadow: '0 -4px 15px rgba(0,0,0,0.1)', zIndex: 100 },
  navBarContainer: { display: 'flex', height: '100%', padding: '0 10px' },
  navSlot: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '15px' },
  dynamicBtn: { border: 'none', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', width: '60px', height: '60px', justifyContent: 'center', borderRadius: '50%' },
  iconCircle: { width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  navIcon: { width: '100%', height: '100%' },
  navLabel: { fontSize: '10px', fontWeight: 'bold' }
};