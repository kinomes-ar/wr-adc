/* 조합 분석 모듈 — 완성된 팀 조합 입력 → 추천 원딜 / 유의사항 / 아이템
   챔프 태그는 Data Dragon에서 실시간으로 받고, 실패하면 내장 표로 대체한다. */
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

/* 폴백용 한글명 (ddragon 실패 시) */
const KO={Malphite:'말파이트',Ornn:'오른',DrMundo:'문도 박사',Rammus:'람머스',Sejuani:'세주아니',Amumu:'아무무',
Zac:'자크',Shen:'쉔',Poppy:'뽀삐',Sion:'사이온',Zed:'제드',Katarina:'카타리나',Fizz:'피즈',Rengar:'렝가',
Khazix:'카직스',Evelynn:'이블린',Talon:'탈론',Akali:'아칼리',LeeSin:'리 신',Camille:'카밀',Samira:'사미라',
Yasuo:'야스오',Irelia:'이렐리아',Darius:'다리우스',Garen:'가렌',Nasus:'나서스',Renekton:'레넥톤',Olaf:'올라프',
Orianna:'오리아나',Veigar:'베이가',Ziggs:'직스',Taric:'타릭',Aatrox:'아트록스',Swain:'스웨인',Warwick:'워윅',
Sylas:'사일러스',Vladimir:'블라디미르',Volibear:'볼리베어',Fiddlesticks:'피들스틱',Annie:'애니',Yone:'요네'};

let ROSTER=null, LOADING=false;
const ES=new Array(5).fill(null), AS=new Array(5).fill(null);
let target=null, MYC=null;

const el=(h)=>{const d=document.createElement('div'); d.innerHTML=h.trim(); return d.firstChild;};
const $$=s=>document.querySelector(s);

/* 스타일 */
document.head.appendChild(el(`<style>
.cmp h3{font-size:11px;font-weight:800;color:var(--dim2);letter-spacing:.06em;margin:14px 0 7px}
.slots{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.slot{aspect-ratio:1;border:1px dashed var(--line);border-radius:14px;background:var(--card);
 display:grid;place-items:center;font-size:19px;color:#4A4A4A;position:relative;overflow:hidden;padding:0}
.slot.on{border-style:solid;border-color:var(--good)}
.slot img{width:100%;height:100%;object-fit:cover}
.slot b{position:absolute;bottom:0;left:0;right:0;background:rgba(15,15,15,.84);font-size:8.5px;
 font-weight:700;padding:2px 1px;color:var(--tx2);line-height:1.1}
.slot.sel{border-color:var(--good2);border-style:solid}
.pick{margin-top:9px;border:1px solid var(--line);border-radius:14px;background:var(--card);padding:10px}
.pick input{width:100%;padding:9px 11px;border-radius:9px;border:1px solid var(--line);
 background:#171717;color:var(--tx);font-size:13px;font-family:inherit;margin-bottom:8px}
.pick .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(56px,1fr));gap:6px;max-height:210px;overflow:auto}
.pick button{border:none;background:none;padding:0;cursor:pointer}
.pick button img{width:100%;aspect-ratio:1;border-radius:9px;object-fit:cover;display:block}
.pick button span{display:block;font-size:8.5px;color:var(--dim);margin-top:2px;line-height:1.1}
.adv{border:1px solid var(--line);border-radius:14px;background:var(--card);padding:12px 13px;margin-top:8px}
.adv h4{font-size:12px;font-weight:800;margin-bottom:7px;color:#fff}
.adv li{font-size:11.5px;line-height:1.55;color:var(--tx2);margin-bottom:5px;list-style:none;
 padding-left:11px;position:relative}
.adv li:before{content:'';position:absolute;left:0;top:7px;width:4px;height:4px;border-radius:50%;background:#4A4A4A}
.adv li b{color:var(--good2);font-weight:700}
.adv li.w:before{background:var(--bad)}.adv li.g:before{background:var(--good)}
.cmp .note{font-size:10.5px;color:var(--dim2);line-height:1.55;margin-top:9px}
#mych{display:grid;grid-template-columns:repeat(auto-fill,minmax(54px,1fr));gap:6px}
#mych button{border:none;background:none;padding:0;cursor:pointer;font-family:inherit}
#mych img{width:100%;aspect-ratio:1;border-radius:50%;object-fit:cover;display:block;
 border:2px solid #2A2A2A;filter:saturate(.45) brightness(.72)}
#mych button.on img{border-color:var(--good2);filter:none}
#mych span{display:block;font-size:9px;color:var(--dim);margin-top:3px;line-height:1.1;font-weight:600}
#mych button.on span{color:var(--tx)}
.adv .nm.top{font-size:16px;margin-bottom:2px}
.slot.me{border-color:var(--good2);border-style:solid}
.slot.me:after{content:'나';position:absolute;top:2px;left:3px;font-size:8px;font-weight:800;
 color:#fff;background:var(--good);border-radius:4px;padding:0 3px;line-height:1.4}
.adv h4 .me{font-size:10px;font-weight:700;color:var(--dim2);margin-left:6px}
.adv .sub{font-size:10.5px;color:var(--dim2);margin-top:7px;line-height:1.5}
</style>`));

/* 탭 + 패널 */
const nav=document.querySelector('nav');
const btn=el('<button data-p="cmp">조합 분석</button>'); nav.appendChild(btn);
const panel=el('<section class="panel cmp" id="p-cmp"></section>');
document.querySelector('#p-champ').after(panel);
panel.innerHTML=`<h3>우리 팀 5명 (나 포함)</h3><div class="slots ally" id="as"></div>
<h3>내 챔프 — 고르면 우리 팀 1번 칸에 들어간다</h3><div id="mych"></div>
<h3>상대 팀 5명</h3><div class="slots" id="es"></div>
<div id="picker"></div><div id="cout"></div>
<div class="note">챔프 분류는 Riot Data Dragon에서 실시간으로 받아온다. 추천 원딜은 픽 찾기 탭과 같은 점수 엔진을 쓰되, 조합 특성을 자동으로 판정한다.</div>`;
nav.querySelectorAll('button').forEach(b=>b.onclick=()=>{
  nav.querySelectorAll('button').forEach(x=>x.classList.remove('on'));
  document.querySelectorAll('.panel').forEach(x=>x.classList.remove('on'));
  b.classList.add('on'); $$('#p-'+b.dataset.p).classList.add('on'); scrollTo(0,0);
  if(b.dataset.p==='cmp') load();
});

async function load(){
  if(ROSTER||LOADING) return; LOADING=true;
  try{
    const j=await fetch(DDJSON).then(r=>r.json());
    ROSTER=Object.values(j.data).map(c=>({id:c.id,name:c.name,tags:c.tags||[],info:c.info||{}}));
  }catch(e){
    const seen={}; Object.entries(ICON).forEach(([k,id])=>seen[id]=k);
    Object.keys(KO).forEach(id=>{ if(!seen[id]) seen[id]=KO[id]; });
    Object.keys(FB).forEach(id=>{ if(!seen[id]) seen[id]=KO[id]||id; });
    ROSTER=Object.entries(seen).map(([id,nm])=>({id,name:nm,tags:[FB[id]||'Fighter'],info:{}}));
  }
  ROSTER.sort((a,b)=>a.name.localeCompare(b.name,'ko'));
  LOADING=false; draw();
}

/* 내 챔프 = 우리 팀 1번 칸 */
function setMy(id){
  const off = MYC===id;
  MYC = off ? null : id;
  if(AS[0] && !AS[0].me){ const free=AS.findIndex((x,i)=>i>0&&!x); if(free>0) AS[free]=AS[0]; AS[0]=null; }
  if(MYC){
    const c=CHAMPS.find(x=>x.id===MYC), dd=ICON[c.name]||c.id;
    const r=(ROSTER&&ROSTER.find(x=>x.id===dd))||{id:dd,name:c.name,tags:['Marksman'],info:{}};
    AS[0]={...r, me:true};
  } else if(AS[0]&&AS[0].me) AS[0]=null;
  target=null; draw(); analyze();
  if(!off) setTimeout(()=>{const o=$$('#cout'); if(o&&o.firstChild) o.scrollIntoView({behavior:'smooth',block:'nearest'});},80);
}

function draw(){
  const mk=(arr,kind)=>arr.map((c,i)=>`<button class="slot${target&&target.kind===kind&&target.i===i?' sel':''}${c?' on':''}${c&&c.me?' me':''}" data-kind="${kind}" data-i="${i}">${c?`<img src="${DD}${c.id}.png" alt=""><b>${c.name}</b>`:'+'}</button>`).join('');
  $$('#es').innerHTML=mk(ES,'e'); $$('#as').innerHTML=mk(AS,'a');
  panel.querySelectorAll('.slot').forEach(b=>b.onclick=()=>{
    const kind=b.dataset.kind, i=+b.dataset.i, arr=kind==='e'?ES:AS;
    if(kind==='a'&&i===0&&AS[0]&&AS[0].me){ setMy(MYC); return; }
    if(arr[i]){arr[i]=null; target=null;} else target={kind,i};
    draw(); analyze();
  });
  $$('#mych').innerHTML=CHAMPS.map(c=>`<button data-c="${c.id}" class="${MYC===c.id?'on':''}">${ico(c.name)}<span>${c.name}</span></button>`).join('');
  $$('#mych').querySelectorAll('button').forEach(b=>b.onclick=()=>setMy(b.dataset.c));
  drawPicker();
}
function drawPicker(q){
  const box=$$('#picker');
  if(!target||!ROSTER){box.innerHTML=''; return;}
  const used=new Set([...ES,...AS].filter(Boolean).map(c=>c.id));
  const list=ROSTER.filter(c=>!used.has(c.id)&&(!q||c.name.includes(q)||c.id.toLowerCase().includes(q.toLowerCase()))).slice(0,300);
  box.innerHTML=`<div class="pick"><input placeholder="챔프 이름 검색" value="${q||''}">
    <div class="grid">${list.map(c=>`<button data-id="${c.id}"><img src="${DD}${c.id}.png" alt="" loading="lazy"><span>${c.name}</span></button>`).join('')}</div></div>`;
  const inp=box.querySelector('input');
  inp.oninput=()=>{const v=inp.value; drawPicker(v); const n=$$('#picker input'); if(n){n.focus(); n.setSelectionRange(v.length,v.length);} };
  box.querySelectorAll('.grid button').forEach(b=>b.onclick=()=>{
    const c=ROSTER.find(x=>x.id===b.dataset.id);
    (target.kind==='e'?ES:AS)[target.i]=c; target=null; draw(); analyze();
  });
}

/* 챔프별 아이템·운영 보정 — 일반 규칙을 챔프 특성으로 덮어쓴다 */
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

function analyze(){
  const out=$$('#cout'); const en=ES.filter(Boolean), al=AS.filter(Boolean);
  if(en.length<2){out.innerHTML=''; return;}
  const has=t=>en.filter(c=>c.tags.includes(t)).length;
  const tanks=has('Tank'), assassins=has('Assassin');
  const ap=en.filter(c=>c.tags.includes('Mage')||(c.info.magic||0)>=7).length;
  const ad=en.filter(c=>(c.info.attack||0)>=7).length;
  const ccN=en.filter(c=>CC.includes(c.id)).length;
  const heEn=en.filter(c=>HEAL.includes(c.id)).length;
  const alTank=al.filter(c=>c.tags.includes('Tank')).length;
  const alHeal=al.filter(c=>HEAL.includes(c.id)).length;
  const alEng=al.filter(c=>CC.includes(c.id)&&c.tags.includes('Tank')).length;

  const flags={dive:assassins>=2, tank:tanks>=2, cc:ccN>=3, immobile:en.filter(c=>['Garen','Nasus','Darius','Annie','Soraka','Veigar','DrMundo','Malphite'].includes(c.id)).length>=2};
  const scores=CHAMPS.map(c=>{
    let sc=0, rs=[];
    Object.keys(flags).forEach(f=>{ if(!flags[f]) return; const t=TRAITS.find(x=>x.k===f); if(!t) return;
      const v=t.s?.[c.id]; if(v===undefined) return; sc+=v; if(v!==0) rs.push({v,t:t.label+(t.why?.[c.id]?' — '+t.why[c.id]:'')}); });
    return {c,sc,rs};
  }).sort((a,b)=>b.sc-a.sc||CHAMPS.indexOf(a.c)-CHAMPS.indexOf(b.c));

  const top=scores[0];
  const me=MYC?CHAMPS.find(c=>c.id===MYC):null;
  const stat=`상대 탱커 ${tanks} · 암살자 ${assassins} · AP ${ap} · AD ${ad} · CC ${ccN}`;

  /* ── 추천 카드 ── */
  let html=`<div class="adv"><h4>이 조합에 추천</h4>
    <div class="nm top">${ico(top.c.name)}${top.c.name}<span class="tier">${top.c.tier}</span></div>
    ${top.rs.length?`<ul style="margin-top:7px">${top.rs.map(r=>`<li class="${r.v>0?'g':'w'}">${r.t}</li>`).join('')}</ul>`:''}
    <ul style="margin-top:6px">${scores.slice(1,4).map(x=>`<li>${x.c.name} ${x.sc>0?'+':''}${x.sc}</li>`).join('')}</ul>
    <div class="sub">${stat}</div>
    ${me?'':'<div class="sub">위에서 <b>내 챔프</b>를 고르면 운영 방법과 아이템이 나온다.</div>'}</div>`;

  /* ── 운영 방법 (내 챔프 기준) ── */
  if(me){
    const play=[];
    play.push(`<li><b>핵심</b> ${me.core}</li>`);
    play.push(`<li class="w"><b>약점</b> ${me.weak}</li>`);
    if(flags.dive) play.push(`<li class="w">상대 암살자 ${assassins}명 — 한타 시작 전에 점멸·생존기가 살아 있어야 한다. 사이드 혼자 가지 마라</li>`);
    if(flags.tank) play.push(`<li>상대 탱커 ${tanks}명 — 앞라인을 억지로 녹이려 하지 말고 뒤로 넘어오는 딜러부터 잘라라</li>`);
    if(ccN>=3) play.push(`<li class="w">CC ${ccN}개 — 한 번 걸리면 연계로 끝난다. 아군보다 반 발 뒤에서 딜하라</li>`);
    if(heEn>=1) play.push(`<li class="w">상대에 회복 챔프 — 치유 감소 없이는 장기전에서 못 이긴다</li>`);
    if(al.length){
      if(alTank===0) play.push(`<li class="w">우리 팀에 앞라인이 없다 — 라인전부터 안전 우선. 먼저 싸움을 열지 마라</li>`);
      if(alHeal>=1) play.push(`<li class="g">아군에 보호·회복 챔프가 있다 — 평소보다 한 발 앞에서 딜해도 된다</li>`);
      if(alEng>=1) play.push(`<li class="g">아군 이니시가 있다 — 진입 타이밍을 미리 읽고 딜 각을 잡아둬라</li>`);
    }
    if(me.tip) play.push(`<li><b>팁</b> ${me.tip}</li>`);
    html+=`<div class="adv"><h4>${me.name} 운영 방법<span class="me">내 챔프</span></h4><ul>${play.join('')}</ul></div>`;
  }

  /* ── 상대 위협 ── */
  const warn=en.filter(c=>THREAT[c.id]).map(c=>`<li class="w"><b>${c.name}</b> ${THREAT[c.id]}</li>`).join('');
  if(warn) html+=`<div class="adv"><h4>플레이 유의사항</h4><ul>${warn}</ul></div>`;

  /* ── 아이템 ── */
  const sit=[];
  const pick=k=>(me&&OVR[me.id]&&OVR[me.id][k])||GEN[k];
  if(tanks>=2) sit.push(pick('tank'));
  if(heEn>=1) sit.push(pick('heal'));
  if(ap>=3) sit.push(pick('ap'));
  if(ad>=3) sit.push(pick('ad'));
  if(assassins>=1) sit.push(pick('dive'));
  if(ccN>=3) sit.push(pick('cc'));
  if(tanks>=2||ccN>=3) sit.push(pick('group'));
  const uniq=[...new Set(sit)];
  html+=`<div class="adv"><h4>아이템${me?` — ${me.name}`:''}</h4>
    ${me?`<ul><li class="g"><b>코어</b> ${me.build}</li><li><b>룬</b> ${me.runes}</li></ul>
      <div class="sub">상대 조합에 맞춘 추가·교체</div>`:''}
    <ul${me?' style="margin-top:5px"':''}>${uniq.length?uniq.map(x=>`<li class="g">${x}</li>`).join(''):'<li><b>이오니아 장화</b> — 뚜렷한 카운터 요소가 없다. 공격적으로 가도 된다</li>'}</ul>
    ${me?'':'<div class="sub">내 챔프를 고르면 그 챔프 기준으로 다시 계산한다.</div>'}</div>`;

  out.innerHTML=html;
}
})();
