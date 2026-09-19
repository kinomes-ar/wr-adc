/* 조합 데이터 모듈 — 로스터 · 상대 위협 · 아이템 규칙.
   UI는 index.html이 담당하고, 이 파일은 데이터와 판정 함수만 제공한다. */
(()=>{
const DDJSON='https://ddragon.leagueoflegends.com/cdn/16.18.1/data/ko_KR/champion.json';

/* 내장 폴백 태그 (ddragon 실패 시) */
const FB={Malphite:'Tank',Ornn:'Tank',DrMundo:'Tank',Rammus:'Tank',Sejuani:'Tank',Amumu:'Tank',Leona:'Tank',Braum:'Tank',
Nautilus:'Tank',Alistar:'Tank',Maokai:'Tank',Galio:'Tank',Thresh:'Tank',Zac:'Tank',Shen:'Tank',Poppy:'Tank',Sion:'Tank',
Zed:'Assassin',Katarina:'Assassin',Fizz:'Assassin',Rengar:'Assassin',Khazix:'Assassin',Evelynn:'Assassin',Talon:'Assassin',
Akali:'Assassin',Pyke:'Assassin',LeeSin:'Assassin',Camille:'Assassin',Samira:'Assassin',Yasuo:'Fighter',Irelia:'Fighter',
Darius:'Fighter',Garen:'Fighter',Nasus:'Fighter',Pantheon:'Fighter',JarvanIV:'Tank',Renekton:'Fighter',Olaf:'Fighter',
Lux:'Mage',Ahri:'Mage',Morgana:'Mage',Zyra:'Mage',Seraphine:'Mage',Karma:'Mage',Orianna:'Mage',Veigar:'Mage',Ziggs:'Mage',
Soraka:'Support',Yuumi:'Support',Nami:'Support',Lulu:'Support',Janna:'Support',Milio:'Support',Senna:'Support',Rakan:'Support',
Blitzcrank:'Tank',Ashe:'Marksman',Jinx:'Marksman',Ezreal:'Marksman',Vayne:'Marksman',Jhin:'Marksman',Caitlyn:'Marksman',
Draven:'Marksman',MissFortune:'Marksman',Tristana:'Marksman',Kaisa:'Marksman',Varus:'Marksman',Xayah:'Marksman',
Lucian:'Marksman',Twitch:'Marksman',Yunara:'Marksman',Kalista:'Marksman',Corki:'Marksman',Smolder:'Marksman'};

/* 원딜 입장에서 실제로 조심해야 하는 것만 */
const THREAT={
Blitzcrank:'그랩 각을 주지 마라 — 미니언 뒤에 서고, 그랩이 빠진 뒤에 전진',
Thresh:'갈고리 + 궁 감옥. 시야 없는 수풀 쪽 각을 비워두지 마라',
Leona:'E로 붙는 순간 확정 CC 연계. 2렙·6렙 타이밍 주의',
Nautilus:'타겟팅 궁은 회피 불가 — 궁이 있으면 앞라인 뒤에 서라',
Alistar:'W-Q 연계 에어본. 라인 전진 자제',
Maokai:'속박 + 궁 광역. 좁은 길목에서 싸우지 마라',
Galio:'도발 + 글로벌 궁 — 아군 진입 타이밍에 같이 떨어진다',
Zyra:'미리 깔린 씨앗을 밟지 마라. 속박 맞으면 식물 딜이 전부 들어온다',
Morgana:'속박이 길다. 밟으면 그대로 끝이라고 보면 된다',
Lux:'속박 맞으면 풀콤보. 스킬샷 각을 계속 틀어라',
Ahri:'매혹 한 번에 연계 사망. 논타겟 회피기를 아껴라',
Pyke:'처형 궁 — 체력이 낮으면 거리와 무관하게 즉사 각',
Yasuo:'바람장막이 투사체를 전부 막는다. 각도를 바꾸거나 장막이 꺼질 때까지 기다려라',
Braum:'방어막 정면으로 쏘면 막힌다. 측면이나 뒤에서 각을 잡아라',
Malphite:'궁 광역 에어본 — 뭉쳐 있지 마라',
Amumu:'궁 광역 속박 — 뭉쳐 있지 마라',
Zed:'궁 대상이 되면 즉시 점멸·생존기. 6렙부터 시야 확보',
Katarina:'점멸 연계로 순식간에 들어온다. 탈진·방어막 준비',
Fizz:'상어 궁은 논타겟 — 맞으면 이동 불가',
LeeSin:'Q 맞으면 진입이 확정된다. Q 각만 피하면 된다',
Camille:'궁으로 1대1 가둔다. 아군과 거리를 벌리지 마라',
Rengar:'수풀 급습 — 수풀 와드가 곧 생존',
Evelynn:'6렙부터 은신. 시야 없는 곳으로 가지 마라',
Khazix:'고립된 대상에게 추가 피해. 혼자 다니지 마라',
Rammus:'도발 + 가시 반사. 평타를 계속 넣으면 자해한다',
DrMundo:'지속 회복이 강하다. 치유 감소 없으면 못 녹인다',
Draven:'라인전 최강급. 2렙 타이밍 조심하고 도끼 받는 자리를 노려라',
MissFortune:'궁은 채널링 — 옆으로 빠지면 대부분 흘릴 수 있다',
Caitlyn:'수풀 입구 덫 조심. 사거리 싸움은 애초에 지고 들어간다',
Tristana:'점프로 붙고 궁으로 밀어낸다. 포탑 근처 다이브 주의',
Jhin:'4번째 탄이 항상 치명타. 재장전 타이밍에 들어가라',
Samira:'붙으면 광역 궁. 애초에 거리를 주지 마라',
Kaisa:'궁으로 순간 진입. 표식이 쌓이면 빠져라',
Vayne:'궁 은신 + 벽 스턴. 벽 근처에서 싸우지 마라',
Irelia:'스택 쌓이면 연속 돌진. 미니언 정리 상태를 보고 서라',
Darius:'궁 처형 — 체력 관리 실패하면 한 번에 간다',
Garen:'이동기 없는 대신 붙으면 강하다. 거리만 유지하면 이긴다',
Nasus:'후반 Q 스택. 길어지면 못 버티니 빨리 끝내라'};

const HEAL=['Soraka','Yuumi','Nami','DrMundo','Senna','Seraphine','Milio','Taric','Aatrox','Swain','Warwick','Sylas','Vladimir','Zac','Volibear','Fiddlesticks'];
const CC=['Leona','Nautilus','Alistar','Maokai','Galio','Thresh','Blitzcrank','Morgana','Lux','Zyra','Amumu','Malphite','Sejuani','Ornn','Rammus','Ahri','Pyke','Rakan','Janna','Seraphine','Orianna'];

/* 이동기가 없어 잡히면 끝나는 챔프 */
const IMMOBILE=['Garen','Nasus','Darius','Annie','Soraka','Veigar','DrMundo','Malphite','Ashe','Jinx','Zyra','Lux','Swain','Seraphine','Sion','Yuumi','Nami','Janna'];

/* 폴백용 한글명 (ddragon 실패 시) */
const KO={Malphite:'말파이트',Ornn:'오른',DrMundo:'문도 박사',Rammus:'람머스',Sejuani:'세주아니',Amumu:'아무무',
Zac:'자크',Shen:'쉔',Poppy:'뽀삐',Sion:'사이온',Zed:'제드',Katarina:'카타리나',Fizz:'피즈',Rengar:'렝가',
Khazix:'카직스',Evelynn:'이블린',Talon:'탈론',Akali:'아칼리',LeeSin:'리 신',Camille:'카밀',Samira:'사미라',
Yasuo:'야스오',Irelia:'이렐리아',Darius:'다리우스',Garen:'가렌',Nasus:'나서스',Renekton:'레넥톤',Olaf:'올라프',
Orianna:'오리아나',Veigar:'베이가',Ziggs:'직스',Taric:'타릭',Aatrox:'아트록스',Swain:'스웨인',Warwick:'워윅',
Sylas:'사일러스',Vladimir:'블라디미르',Volibear:'볼리베어',Fiddlesticks:'피들스틱',Annie:'애니',Yone:'요네'};

/* 챔프별 아이템 보정 — 일반 규칙을 챔프 특성으로 덮어쓴다 */
const GEN={
 tank:'<b>도미닉의 인사</b> — 방어구 관통',
 heal:'<b>필멸자의 인사</b> — 치유 감소. 없으면 못 녹인다',
 ap:'<b>멜모셔스의 아귀</b> — 마법 피해 방어막',
 ad:'<b>죽음의 무도</b> — 피해를 시간으로 분산',
 dive:'<b>수호천사</b> — 한타에서 한 번 더 살아난다',
 cc:'<b>헤르메스의 발걸음</b> — 강인함으로 묶이는 시간을 줄인다',
 group:'<b>룬안의 허리케인</b> — 뭉치는 조합에 광역 딜'};
const OVR={
 yunara:{tank:'<b>공속템 우선</b> — 패시브가 치명타를 마법 피해로 바꿔 방어구를 이미 우회한다. 방관은 낭비',
        dive:'<b>수호천사</b> 또는 탈진 — 초월 쿨 사이가 가장 취약하다'},
 ezreal:{tank:'<b>도미닉의 인사</b> — 단 Q는 치명타가 안 터진다. 치명타템은 절대 금지',
        ap:'<b>멜모셔스의 아귀</b> — 이즈리얼 AP 대응 1순위',
        dive:'<b>얼어붙은 건틀릿</b> — 붙는 챔프를 묶어 E로 빠질 시간을 번다'},
 vayne:{tank:'<b>공속템(위츠엔드·유령무희)</b> — W 은화살이 이미 최대 체력 비례 고정 피해다. 방관 필요 없음',
        dive:'<b>수호천사</b> — Q는 도주기가 아니라 회피기다. 물리면 못 뺀다'},
 twitch:{tank:'<b>룬안의 허리케인</b> — 맹독이 고정 피해라 탱커엔 이미 강하다. 스택 속도를 올려라',
        group:'<b>룬안의 허리케인</b> — 궁 관통과 겹쳐 한타 광역이 폭발한다'},
 jinx:{group:'<b>룬안의 허리케인</b> — 로켓런처 광역과 겹친다. 사실상 전용템',
       dive:'<b>수호천사</b> — 이동기가 전혀 없다. 한 번 물리면 끝'},
 lucian:{heal:'<b>필멸자의 인사</b> — 패시브가 평타를 2번 때려 적중 시 효과가 2배로 들어간다',
        tank:'<b>몰왕검 → 도미닉</b> — 초반에 굴려야 하는 챔프다. 후반 템으로 도망가지 마라'},
 ashe:{cc:'<b>치명타 확률</b> — W가 챔피언에게 확정 치명타라 치명타템이 곧 둔화 2배다',
       dive:'<b>헤르메스 + 수호천사</b> — 대시가 아예 없다. 물리면 그대로 죽는다'},
 xayah:{dive:'<b>속사포</b> — R 무적이 이미 진입 대응이다. 깃털 회전을 올리는 게 더 낫다',
        group:'<b>치명타템</b> — 깃털 3개 속박이 광역으로 터진다'},
 jhin:{cc:'<b>유령무희·질풍검</b> — 진은 이속이 곧 공격력이다. 헤르메스보다 이속템',
       tank:'<b>도미닉의 인사</b> — 4번째 탄 확정 치명타에 방관을 얹는다'}};

/* 슬롯에 들어온 챔프로 조합 특성을 자동 판정한다 */
function flags(en,al){
  const has=(a,t)=>a.filter(c=>c.tags.includes(t)).length;
  const tanks=has(en,'Tank'), ass=has(en,'Assassin');
  const ap=en.filter(c=>c.tags.includes('Mage')||(c.info.magic||0)>=7).length;
  const ad=en.filter(c=>(c.info.attack||0)>=7).length;
  const ccN=en.filter(c=>CC.includes(c.id)).length;
  const heal=en.filter(c=>HEAL.includes(c.id)).length;
  const immob=en.filter(c=>IMMOBILE.includes(c.id)).length;
  const alTank=has(al,'Tank'), alAss=has(al,'Assassin');
  const alHeal=al.filter(c=>HEAL.includes(c.id)).length;
  const alCC=al.filter(c=>CC.includes(c.id)).length;
  const alEng=al.filter(c=>CC.includes(c.id)&&c.tags.includes('Tank')).length;
  return {
    tr:{dive:ass>=2, tank:tanks>=2, cc:ccN>=3, immobile:immob>=2},
    our:{'우리팀에 이니시·탱커 있음':alEng>=1||alTank>=2,
         '우리팀에 CC가 거의 없음':al.length>=3&&alCC===0,
         '우리팀에 암살자·다이브 있음':alAss>=1},
    st:{tanks,ass,ap,ad,ccN,heal,alTank,alHeal,alEng,alCC}
  };
}

/* 추천 원딜(me) 기준 운영 방법 · 유의사항 · 아이템 카드 HTML */
function advice(en,al,me,f){
  const s=f.st; let html='';
  const stat=`상대 탱커 ${s.tanks} · 암살자 ${s.ass} · AP ${s.ap} · AD ${s.ad} · CC ${s.ccN}`;
  if(me){
    const p=[];
    p.push(`<li><b>핵심</b> ${me.core}</li>`);
    p.push(`<li class="w"><b>약점</b> ${me.weak}</li>`);
    if(f.tr.dive) p.push(`<li class="w">상대 암살자 ${s.ass}명 — 한타 전에 점멸·생존기가 살아 있어야 한다. 사이드 혼자 가지 마라</li>`);
    if(f.tr.tank) p.push(`<li>상대 탱커 ${s.tanks}명 — 앞라인을 억지로 녹이지 말고 넘어오는 딜러부터 잘라라</li>`);
    if(s.ccN>=3) p.push(`<li class="w">CC ${s.ccN}개 — 한 번 걸리면 연계로 끝난다. 아군보다 반 발 뒤에서 딜하라</li>`);
    if(s.heal>=1) p.push(`<li class="w">상대에 회복 챔프 — 치유 감소 없이는 장기전에서 못 이긴다</li>`);
    if(al.length){
      if(!s.alTank) p.push(`<li class="w">우리 팀에 앞라인이 없다 — 라인전부터 안전 우선. 먼저 싸움을 열지 마라</li>`);
      if(s.alHeal>=1) p.push(`<li class="g">아군에 보호·회복 챔프가 있다 — 평소보다 한 발 앞에서 딜해도 된다</li>`);
      if(s.alEng>=1) p.push(`<li class="g">아군 이니시가 있다 — 진입 타이밍을 미리 읽고 딜 각을 잡아둬라</li>`);
    }
    if(me.tip) p.push(`<li><b>팁</b> ${me.tip}</li>`);
    html+=`<div class="adv"><h4>${me.name} 운영 방법</h4><ul>${p.join('')}</ul><div class="sub">${stat}</div></div>`;
  }
  const warn=en.filter(c=>THREAT[c.id]).map(c=>`<li class="w"><b>${c.name}</b> ${THREAT[c.id]}</li>`).join('');
  if(warn) html+=`<div class="adv"><h4>플레이 유의사항</h4><ul>${warn}</ul></div>`;
  const sit=[], pick=k=>(me&&OVR[me.id]&&OVR[me.id][k])||GEN[k];
  if(s.tanks>=2) sit.push(pick('tank'));
  if(s.heal>=1) sit.push(pick('heal'));
  if(s.ap>=3) sit.push(pick('ap'));
  if(s.ad>=3) sit.push(pick('ad'));
  if(s.ass>=1) sit.push(pick('dive'));
  if(s.ccN>=3) sit.push(pick('cc'));
  if(s.tanks>=2||s.ccN>=3) sit.push(pick('group'));
  const u=[...new Set(sit)];
  html+=`<div class="adv"><h4>아이템${me?` — ${me.name}`:''}</h4>
    ${me?`<ul><li class="g"><b>코어</b> ${me.build}</li><li><b>룬</b> ${me.runes}</li></ul>
      <div class="sub">상대 조합에 맞춘 추가·교체</div>`:''}
    <ul${me?' style="margin-top:5px"':''}>${u.length?u.map(x=>`<li class="g">${x}</li>`).join(''):'<li><b>이오니아 장화</b> — 뚜렷한 카운터 요소가 없다. 공격적으로 가도 된다</li>'}</ul></div>`;
  return html;
}

window.WRC={THREAT,HEAL,CC,IMMOBILE,flags,advice};

/* 전 챔피언 로스터 — 밴 목록과 팀 슬롯이 이걸 쓴다 */
(async()=>{
  let R;
  try{
    const j=await fetch(DDJSON).then(r=>r.json());
    R=Object.values(j.data).map(c=>({id:c.id,name:c.name,tags:c.tags||[],info:c.info||{}}));
  }catch(e){
    const seen={}; Object.entries(ICON).forEach(([k,id])=>seen[id]=k);
    Object.keys(KO).forEach(id=>{ if(!seen[id]) seen[id]=KO[id]; });
    Object.keys(FB).forEach(id=>{ if(!seen[id]) seen[id]=KO[id]||id; });
    R=Object.entries(seen).map(([id,nm])=>({id,name:nm,tags:[FB[id]||'Fighter'],info:{}}));
  }
  R.sort((a,b)=>a.name.localeCompare(b.name,'ko'));
  if(window.onRoster) window.onRoster(R);
})();
})();
