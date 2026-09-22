/* 조합 데이터 모듈 — 로스터 · 상대 위협 · 아이템 규칙.
   UI는 index.html이 담당하고, 이 파일은 데이터와 판정 함수만 제공한다. */
(()=>{
const DDI='https://ddragon.leagueoflegends.com/cdn/16.18.1/img/champion/';
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

const HEAL=['Soraka','Yuumi','Nami','DrMundo','Senna','Seraphine','Milio','Taric','Aatrox','Swain','Warwick','Sylas','Vladimir','Zac','Volibear','Fiddlesticks'];
const CC=['Leona','Nautilus','Alistar','Maokai','Galio','Thresh','Blitzcrank','Morgana','Lux','Zyra','Amumu','Malphite','Sejuani','Ornn','Rammus','Ahri','Pyke','Rakan','Janna','Seraphine','Orianna'];

/* 광역 이니시 궁 — 한 명만 있어도 한타에서 원딜을 통째로 묶는다 (에어본은 수은으로도 못 푼다) */
const AOEULT=['Malphite','Amumu','Ornn','Sejuani','Maokai','Galio','Orianna','Zac','MonkeyKing','Kennen','JarvanIV',
 'Gragas','Rakan','Diana','Seraphine','Lissandra','Leona','Nautilus','Rell','Alistar'];

/* 이동기가 없어 잡히면 끝나는 챔프 */
const IMMOBILE=['Garen','Nasus','Darius','Annie','Soraka','Veigar','DrMundo','Malphite','Ashe','Jinx','Zyra','Lux','Swain','Seraphine','Sion','Yuumi','Nami','Janna'];

/* 폴백용 한글명 (ddragon 실패 시) */
const KO={Malphite:'말파이트',Ornn:'오른',DrMundo:'문도 박사',Rammus:'람머스',Sejuani:'세주아니',Amumu:'아무무',
Zac:'자크',Shen:'쉔',Poppy:'뽀삐',Sion:'사이온',Zed:'제드',Katarina:'카타리나',Fizz:'피즈',Rengar:'렝가',
Khazix:'카직스',Evelynn:'이블린',Talon:'탈론',Akali:'아칼리',LeeSin:'리 신',Camille:'카밀',Samira:'사미라',
Yasuo:'야스오',Irelia:'이렐리아',Darius:'다리우스',Garen:'가렌',Nasus:'나서스',Renekton:'레넥톤',Olaf:'올라프',
Orianna:'오리아나',Veigar:'베이가',Ziggs:'직스',Taric:'타릭',Aatrox:'아트록스',Swain:'스웨인',Warwick:'워윅',
Sylas:'사일러스',Vladimir:'블라디미르',Volibear:'볼리베어',Fiddlesticks:'피들스틱',Annie:'애니',Yone:'요네'};

/* 슬롯에 들어온 챔프로 조합 특성을 자동 판정한다 */
function flags(en,al){
  const has=(a,t)=>a.filter(c=>c.tags.includes(t)).length;
  const tanks=has(en,'Tank'), ass=has(en,'Assassin');
  const ap=en.filter(c=>c.tags.includes('Mage')||(c.info.magic||0)>=7).length;
  const ad=en.filter(c=>(c.info.attack||0)>=7).length;
  const ccN=en.filter(c=>CC.includes(c.id)).length;
  const heal=en.filter(c=>HEAL.includes(c.id)).length;
  const immob=en.filter(c=>IMMOBILE.includes(c.id)).length;
  const aoe=en.filter(c=>AOEULT.includes(c.id)).map(c=>c.name);
  const alTank=has(al,'Tank'), alAss=has(al,'Assassin');
  const alHeal=al.filter(c=>HEAL.includes(c.id)).length;
  const alCC=al.filter(c=>CC.includes(c.id)).length;
  const alEng=al.filter(c=>CC.includes(c.id)&&c.tags.includes('Tank')).length;
  return {
    tr:{dive:ass>=2, tank:tanks>=2, cc:ccN>=3, immobile:immob>=2, aoeult:aoe.length>=1},
    our:{'우리팀에 이니시·탱커 있음':alEng>=1||alTank>=2,
         '우리팀에 CC가 거의 없음':al.length>=3&&alCC===0,
         '우리팀에 암살자·다이브 있음':alAss>=1},
    st:{tanks,ass,ap,ad,ccN,heal,alTank,alHeal,alEng,alCC,aoe}
  };
}

/* ── 라인별 판정 — 슬롯이 라인 순서(탑·정글·미드·원딜·서폿)로 고정돼 있다 ── */
const SUPC={
 hook:['Blitzcrank','Thresh','Nautilus','Pyke'],
 eng :['Leona','Alistar','Rakan','Rell','Galio','Maokai','Braum','Amumu','Sett','Nunu','Zac'],
 poke:['Lux','Zyra','Morgana','Brand','Xerath','Swain','Senna','Velkoz','Ziggs'],
 ench:['Soraka','Yuumi','Nami','Lulu','Milio','Janna','Sona','Taric','Ivern','Karma','Seraphine']};
const JGANK=['LeeSin','Elise','Khazix','Rengar','XinZhao','JarvanIV','Nunu','Warwick','Vi','Hecarim',
 'Kayn','Evelynn','Shaco','Diana','Olaf','Sejuani','Amumu','Graves','Nidalee','Zac','Lillia','Viego','Talon','Jax'];
const MROAM=['Ahri','TwistedFate','Galio','Pantheon','Zed','Talon','Katarina','Fizz','Akali','Diana',
 'AurelionSol','Lissandra','Nocturne','Yone','Yasuo','Ekko'];
const TDIVE=['Malphite','Ornn','Sion','Kennen','Gnar','Camille','Shen','JarvanIV','Renekton','Irelia','Riven','Jax','Darius','Fiora'];
const supCat=c=>{ if(!c) return null; for(const k in SUPC) if(SUPC[k].includes(c.id)) return k; return null; };

function laneCard(me){
  const U=window.WRUI; if(!U||!U.ENEMY) return '';
  const A=U.ALLY, E=U.ENEMY, D=window.WRDB, n=c=>c?c.name:'';
  const et=E[0], ej=E[1], em=E[2], ea=E[3], es=E[4], as=A[4];
  const li=[];
  if(ea||es) li.push(`<li><b>상대 바텀</b> ${[n(ea),n(es)].filter(Boolean).join(' + ')} <span style="color:var(--dim2)">vs</span> ${me?me.name:'나'}${as?' + '+n(as):''}</li>`);
  if(me&&ea&&D&&D.T[ea.name]) li.push(`<li class="g"><b>${n(ea)} 상대</b> ${D.T[ea.name][1]}</li>`);
  const ec=supCat(es);
  if(ec==='hook') li.push(`<li class="w"><b>${n(es)} 훅</b> — 미니언 뒤에 서고 부시 쪽에서 CS 먹지 마라. 훅 한 번 빠지면 그 몇 초가 우리 턴이다</li>`);
  if(ec==='eng')  li.push(`<li class="w"><b>${n(es)} 이니시</b> — 점멸 없을 땐 라인 반만 밀어라. 들어오는 순간 뒤로 빼면서 폿부터 잘라라</li>`);
  if(ec==='poke') li.push(`<li class="w"><b>${n(es)} 포킹</b> — 체력 60% 밑이면 이미 물릴 각이다. 물약 아끼지 말고 라인 당겨서 받아라</li>`);
  if(ec==='ench') li.push(`<li><b>${n(es)} 보호·회복</b> — 길어지면 진다. 2렙 선취해서 초반에 체력 깎고, 치유 감소는 최대한 빨리 올려라</li>`);
  const ac=supCat(as);
  if(ac==='ench') li.push(`<li class="g"><b>우리 ${n(as)}</b> — 받쳐주는 폿이다. 평소보다 반 발 앞에서 딜해도 되고 2:2도 받아도 된다</li>`);
  else if(ac==='hook'||ac==='eng') li.push(`<li class="g"><b>우리 ${n(as)}</b> — 이니시형. 폿이 들어가면 바로 따라 들어가라. 내가 먼저 앞서면 폿이 못 받쳐준다</li>`);
  else if(ac==='poke') li.push(`<li class="g"><b>우리 ${n(as)}</b> — 견제형. 체력 깎아놓고 들어가는 그림이다. 폿이 견제할 때 같이 평타 넣어라</li>`);
  else if(!as) li.push(`<li>우리 서폿 칸을 채우면 라인전 톤까지 잡아준다</li>`);
  if(ej) li.push(JGANK.includes(ej.id)
    ? `<li class="w"><b>상대 정글 ${n(ej)}</b> — 초반 바텀 갱이 센 챔프다. 3렙 전에 라인 밀지 말고 강 쪽 와드부터 박아라</li>`
    : `<li><b>상대 정글 ${n(ej)}</b> — 초반 갱보다 오브젝트 위주. 대신 드래곤 타이밍에 바텀으로 인원이 몰린다</li>`);
  if(em&&MROAM.includes(em.id)) li.push(`<li class="w"><b>상대 미드 ${n(em)}</b> — 로밍이 잦다. 미드가 시야에서 사라지면 바로 뒤로 빼라</li>`);
  if(et&&TDIVE.includes(et.id)) li.push(`<li><b>상대 탑 ${n(et)}</b> — 한타에서 나를 직접 노리고 들어온다. 점멸·생존기 아껴 둬라</li>`);
  return li.length?`<div class="adv"><h4>라인전 — 바텀 2:2 · 로밍 대비</h4><ul>${li.join('')}</ul></div>`:'';
}

/* 추천 원딜(me) 기준: 내 빌드 · 상대별 대응 · 스펠 — adv.js(WRDB)를 쓴다 */
const ord=['tank','heal','ap','ad','cc','shield','group','poke'];
const ORDL={tank:'상대 탱커 2명 이상',heal:'상대에 회복·흡혈',ap:'상대 AP 비중 높음',
 ad:'상대 AD 비중 높음',cc:'상대 하드 CC 다수',shield:'상대에 보호막 서폿',
 group:'뭉쳐서 한타 거는 조합',poke:'포킹 조합'};

function advice(en,al,me,f){
  const s=f.st, D=window.WRDB; let html='';
  const stat=`상대 탱커 ${s.tanks} · 암살자 ${s.ass} · AP ${s.ap} · AD ${s.ad} · CC ${s.ccN} · 회복 ${s.heal}`;
  const cond={tank:s.tanks>=2,heal:s.heal>=1,ap:s.ap>=3,ad:s.ad>=3,
    cc:s.ccN>=3,shield:false,group:s.tanks>=2||s.ccN>=3,poke:false};
  if(f.tr.dive) cond.ad=cond.ad||s.ass>=2;
  const SH=['Lulu','Janna','Karma','Taric','Seraphine','Milio','Orianna','Ivern','Nautilus'];
  cond.shield=en.filter(c=>SH.includes(c.id)).length>=1;

  /* 1) 내 빌드 */
  const bd=D&&me?D.B[me.id]:null;
  if(bd){
    const sw=ord.filter(k=>cond[k]&&bd.s[k]).map(k=>
      `<li class="g"><b>${ORDL[k]}</b> → ${bd.s[k]}</li>`).join('');
    html+=`<div class="adv"><h4>${me.name} 빌드 — 이 판 기준</h4><ul>
      <li><b>신발</b> ${bd.b}</li>
      <li><b>코어</b> ${bd.c.map((x,i)=>`${i+1}. ${x}`).join(' → ')}</li>
      <li><b>후반</b> ${bd.l.join(' · ')}</li>
      <li><b>룬</b> ${bd.r}</li>
      <li><b>스펠</b> ${bd.sp}</li>
      <li><b>스킬</b> ${bd.sk}</li></ul>
      <h4 style="margin-top:9px">상대 조합 반영 — 교체·추가</h4>
      <ul>${sw||'<li>특별히 맞춰야 할 요소가 없다. 코어 그대로 간다</li>'}</ul>
      <div class="sub">${stat}</div></div>`;
    html+=`<div class="adv"><h4>${me.name} 핵심</h4><ul>
      <li>${bd.ln}</li>
      <li class="w"><b>약점</b> ${me.weak}</li></ul></div>`;
  }

  /* 1.5) 라인별 — 바텀 2:2 와 로밍 */
  html+=laneCard(me);

  /* 2) 상대 5명 개별 대응 */
  if(D){
    const rows=en.map(c=>{const t=D.T[c.name]; if(!t) return '';
      return `<div class="en"><div class="enh"><img src="${DDI}${c.id}.png" alt="" loading="lazy" onerror="this.remove()"><b>${c.name}</b>${t[2]!=='없음'?`<i>${t[2]}</i>`:''}${t[3]!=='없음'?`<i class="sp">${t[3]}</i>`:''}</div>
        <ul><li class="w">${t[0]}</li><li class="g">${t[1]}</li></ul></div>`;}).join('');
    const miss=en.filter(c=>!D.T[c.name]).map(c=>c.name);
    if(rows) html+=`<div class="adv"><h4>상대 ${en.length}명 — 하나씩 대응법</h4>${rows}
      ${miss.length?`<div class="sub">DB 없음: ${miss.join(' · ')}</div>`:''}</div>`;

    /* 3) 아이템·스펠 집계 */
    const cnt={},spc={};
    en.forEach(c=>{const t=D.T[c.name]; if(!t) return;
      if(t[2]!=='없음') cnt[t[2]]=(cnt[t[2]]||0)+1;
      if(t[3]!=='없음') spc[t[3]]=(spc[t[3]]||0)+1;});
    const clean=x=>x.split(' —')[0].split(' 또는')[0].split(' +')[0].split(' 그대로')[0]
      .replace(/(으로 교체|로 교체|유지|추가|우선|필수|을 더 빨리|를 더 빨리).*$/,'').trim();
    ord.forEach(k=>{ if(cond[k]&&bd&&bd.s[k]){ const m=clean(bd.s[k]);
      if(/[가-힣]/.test(m)) cnt[m]=(cnt[m]||0)+1.5; } });
    const it=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const sp=Object.entries(spc).sort((a,b)=>b[1]-a[1])[0];
    if(it.length) html+=`<div class="adv"><h4>이 판에서 살 아이템 — 우선순위</h4>
      <ul>${it.map(([n,v],i)=>`<li class="${i===0?'g':''}"><b>${i+1}. ${n}</b> <span style="color:var(--dim2)">상대 ${Math.floor(v)}명이 이유</span></li>`).join('')}</ul>
      ${sp?`<div class="sub">스펠: <b>${sp[0]}</b> — 상대 ${sp[1]}명이 이걸 요구한다</div>`:''}</div>`;
  }

  /* 4) 한타 포지셔닝 */
  const p=[];
  if(f.tr.aoeult) p.push(`<li class="w"><b>${s.aoe.join('·')} 광역 궁</b> — 아군이랑 일렬로 붙지 마라. 궁 빠진 걸 확인하기 전엔 싸움 열지 마라. 에어본은 수은으로 못 푼다 → 수호 천사를 빨리</li>`);
  if(f.tr.dive) p.push(`<li class="w">암살자 ${s.ass}명 — 점멸·생존기가 살아 있을 때만 싸워라. 사이드 혼자 가지 마라</li>`);
  if(f.tr.tank) p.push(`<li>탱커 ${s.tanks}명 — 앞라인 억지로 녹이지 말고 넘어오는 딜러부터 잘라라</li>`);
  if(s.ccN>=3) p.push(`<li class="w">CC ${s.ccN}개 — 한 번 걸리면 연계로 끝난다. 아군보다 반 발 뒤에서 딜해라</li>`);
  if(s.heal>=1) p.push(`<li class="w">치유 감소 없이는 장기전에서 못 이긴다</li>`);
  if(al.length){
    if(!s.alTank) p.push(`<li class="w">우리 팀에 앞라인이 없다 — 먼저 싸움을 열지 마라</li>`);
    if(s.alHeal>=1) p.push(`<li class="g">아군 보호·회복이 있다 — 평소보다 한 발 앞에서 딜해도 된다</li>`);
    if(s.alEng>=1) p.push(`<li class="g">아군 이니시가 있다 — 진입 타이밍을 읽고 딜 각을 미리 잡아라</li>`);
  }
  if(p.length) html+=`<div class="adv"><h4>한타 포지셔닝</h4><ul>${p.join('')}</ul></div>`;
  return html;
}


/* 상대별 대응 카드 전용 스타일 (이 파일에서만 쓰는 클래스) */
(()=>{const st=document.createElement('style'); st.textContent=`
.adv .en{border-top:1px solid var(--line2);padding:8px 0 2px}
.adv .en:first-of-type{border-top:0;padding-top:2px}
.adv .enh{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px}
.adv .enh img{width:26px;height:26px;border-radius:50%;object-fit:cover;border:1.5px solid #3A3A3A}
.adv .enh b{font-size:12.5px;font-weight:800;color:#fff}
.adv .enh i{font-style:normal;font-size:9.5px;font-weight:700;background:#2E2320;border:1px solid #4A342D;
 color:#F0A28C;border-radius:6px;padding:2px 6px;line-height:1.3}
.adv .enh i.sp{background:#1B2830;border-color:#27414E;color:#9CC9DC}
.adv .en ul{margin:0}
.adv .en li{margin-bottom:3px}
/* 밴 진행 중 실시간 목록 */
#banmirror{margin:2px 0 4px}
#banmirror .bl span{color:var(--bad2);font-weight:800}
.bmlist{display:flex;flex-wrap:wrap;gap:5px}
.bmlist .bm{display:flex;align-items:center;gap:5px;padding:3px 8px 3px 3px;border-radius:18px;
 border:1px solid var(--bad);background:#1B2830;color:#9CC9DC;font-family:inherit;font-size:11.5px;font-weight:700}
.bmlist .bm img{width:22px;height:22px;border-radius:50%;object-fit:cover;
 filter:grayscale(1) brightness(.6);display:block}
.bmlist .bm span{text-decoration:line-through}
.bmlist .bm i{font-style:normal;font-size:13px;color:var(--dim2);line-height:1;margin-left:1px}
`; document.head.appendChild(st);})();

/* ── 밴 단계에서 지금까지 밴된 챔프를 실시간으로 보여준다 (탭하면 해제) ── */
(()=>{
  const cban=document.querySelector('#c-ban'), srch=document.querySelector('#bansrch');
  if(!cban) return;
  const wrap=document.createElement('div'); wrap.id='banmirror';
  wrap.innerHTML='<div class="bl">지금 밴됨 <span></span></div><div class="bmlist"></div>';
  cban.parentNode.insertBefore(wrap,cban);
  const lab=wrap.querySelector('span'), list=wrap.querySelector('.bmlist');
  const S=new Map();
  const esc=n=>(window.CSS&&CSS.escape)?CSS.escape(n):n.replace(/"/g,'\\"');
  function sync(){
    cban.querySelectorAll('.chip.bn').forEach(c=>{
      const n=c.dataset.ban, img=c.querySelector('img');
      if(c.classList.contains('on')) S.set(n,img?img.src:''); else S.delete(n);
    });
    const t=(document.querySelector('#bancnt')||{}).textContent||'';
    const m=t.match(/(\d+)/); if(m&&+m[1]===0) S.clear();
    wrap.style.display=S.size?'block':'none';
    lab.textContent=t.trim();
    list.innerHTML=[...S].map(([n,src])=>
      `<button class="bm" data-n="${n}">${src?`<img src="${src}" alt="">`:''}<span>${n}</span><i>×</i></button>`).join('');
  }
  list.addEventListener('pointerdown',e=>{
    const b=e.target.closest('.bm'); if(!b) return; e.preventDefault();
    const n=b.dataset.n, sel='.chip.bn[data-ban="'+esc(n)+'"]';
    const hit=cban.querySelector(sel);
    if(hit){ hit.click(); return; }
    /* 검색어에 가려져 있으면 잠깐 풀고 해제한다 */
    const keep=srch.value;
    srch.value=n; srch.dispatchEvent(new Event('input',{bubbles:true}));
    setTimeout(()=>{ const h2=cban.querySelector(sel); if(h2) h2.click();
      S.delete(n);
      srch.value=keep; srch.dispatchEvent(new Event('input',{bubbles:true}));
      sync(); },0);
  });
  new MutationObserver(()=>sync()).observe(cban,
    {childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('click',()=>setTimeout(sync,0));
  sync();
})();
window.WRC={HEAL,CC,IMMOBILE,AOEULT,flags,advice};

/* ── 조합 특성 추가: 광역 이니시 궁 (말파·아무무·오른 …) — 한 명만 있어도 걸린다 ── */
(()=>{ try{
  if(typeof TRAITS==='undefined'||TRAITS.some(t=>t.k==='aoeult')) return;
  TRAITS.push({ k:'aoeult', label:'광역 이니시 궁 있음', ex:'말파이트 아무무 오른 세주아니 갈리오',
    s:{xayah:3,ezreal:3,kaisa:2,smolder:1,twitch:-1,vayne:-3,lucian:-1,yunara:-3,jhin:-3,ashe:-3,jinx:-3},
    why:{xayah:'R 무적으로 궁을 그대로 흘린다',ezreal:'착지하자마자 E로 후속 연계를 피한다',
      kaisa:'착지 후 R·E로 빠질 수 있다',smolder:'착지 후 E 비행으로 지형 넘어 도망',
      yunara:'이동기가 초월 E뿐 — 궁 맞으면 연계에 그대로 죽는다',jhin:'이동기 없음 — 재장전 중에 궁 맞으면 끝',
      ashe:'대시가 없다',jinx:'이동기가 없다',vayne:'Q 구르기 하나로는 연계를 못 피한다',
      lucian:'사거리가 짧아 궁 범위 안에 같이 들어간다'} });
  const box=document.querySelector('#c-tr'), i=TRAITS.length-1, t=TRAITS[i];
  if(box) box.insertAdjacentHTML('beforeend',`<button class="chip" data-t="tr" data-i="${i}"><span>${t.label}</span><small class="ex">${t.ex}</small></button>`);
 }catch(e){ console.warn('aoeult',e); } })();

/* ── 카이사를 내 풀에 추가 (Wild Rift 7.2e — WildRiftFire·Wild Rift Core 근거) ──
   index.html의 전역 데이터(CHAMPS·SUPPORTS·E_ADC·E_SUP·TRAITS·OURS)에 런타임으로 합친다 */
const KAISA_B={b:'광전사의 군화',c:["자성 발사기","구인수의 격노검","종결자(Terminus)"],l:["루난의 허리케인","몰락한 왕의 검","크라켄 학살자"],
 r:'치명적 속도 / 잔혹 / 최후의 일격 / 전설: 핏줄 / 뼈 방패',sp:'점멸 + 유체화',
 sk:'Q(이케시아 폭우) → E(과충전) → W(공허추적자). 진화도 Q → E → W 순',
 ln:'1코어(4분 전후) 전까지는 파밍만. W로 플라즈마를 쌓고 평타로 5스택을 터뜨려라. 아군 CC가 걸린 적에게 R로 바로 붙는 게 카이사의 전부다.',
 s:{tank:'몰락한 왕의 검 + 종결자 — 공속·방관으로 녹인다',heal:'필멸자의 운명',ap:'맬모셔스의 아귀',
  ad:'수호 천사 — R 진입 후 받아칠 시간을 번다',cc:'수은의 검 — R로 들어가서 묶이면 끝이다',
  shield:'독사의 송곳니',group:'루난의 허리케인 — 한타 광역딜',poke:'라인 당겨 받고 1코어까지 참아라'}};
(()=>{ try{
  if(typeof CHAMPS==='undefined'||CHAMPS.some(c=>c.id==='kaisa')) return;
  CHAMPS.push({ id:'kaisa', name:'카이사', tier:'B', wr:'48.9%', pick:'12.0%', ban:'0.3%',
    tag:'진입형 · 후반 캐리 · 하이브리드',
    core:'패시브 플라즈마 5스택이 터지면 잃은 체력 비례 폭딜. 아이템을 올리면 Q·E·W가 진화한다.',
    strength:'2코어 + 진화 후 중반이 강하다. 아군 CC가 걸린 적에게 R로 바로 붙어 폭딜을 넣는다.',
    weak:'초반 사거리가 짧아 라인전이 약하다. 혼자 잡히면 빠질 수단이 R뿐이다.',
    spell:'점멸 + 유체화',
    build:'자성 발사기 → 구인수의 격노검 → 종결자 → 루난의 허리케인 / 몰락한 왕의 검',
    runes:'치명적 속도 / 잔혹 / 최후의 일격 / 전설: 핏줄 / 뼈 방패',
    combo:['W(공허추적자)로 플라즈마 2스택 → 평타로 5스택 폭발','아군 CC 뒤 R 진입 → Q 난사','E 과충전으로 공속·이속 올려 카이팅'],
    tip:'Q는 주변에 적이 하나뿐이면 전부 그 한 명에게 몰린다 — 고립된 적을 노려라. R은 진입기이자 탈출기다. 초반 강한 원딜(케이틀린·드레이븐) 상대로는 라인 당겨서 버텨라.',
    src:'통계(Wild Rift Core 7.2e) + WildRiftFire 7.2e 가이드' });
  if(typeof MYPOOL!=='undefined') MYPOOL.add('카이사');
  const put=(arr,map,why)=>arr.forEach(x=>{const k=x.k||x.label;
    if(map[k]!==undefined){ x.s.kaisa=map[k]; if(why&&why[k]){ x.why=x.why||{}; x.why.kaisa=why[k]; } } });
  put(SUPPORTS,{'룰루':2,'나미':1,'잔나':1,'카르마':1,'밀리오':1,'브라움':1,'쓰레쉬':1,'레오나':2,'노틸러스':2,'알리스타':2,
    '갈리오':2,'마오카이':2,'라칸':2,'블리츠크랭크':1,'파이크':1,'모르가나':1,'소라카':0,'유미':1,'세라핀':0,'럭스':1,
    '자이라':0,'스웨인':1,'자르반':1,'판테온':1,'세나':0},
   {'룰루':'공식 시너지 — 공속 버프·변이로 진입을 받쳐준다','노틸러스':'공식 시너지 — 확정 CC 뒤 R로 바로 붙는다',
    '알리스타':'공식 시너지 — 띄운 적에게 R 진입 폭딜','레오나':'CC가 걸리면 R로 따라 들어가 끝낸다',
    '갈리오':'도발 + 궁 합류가 카이사 R 진입과 겹친다','마오카이':'속박 걸린 적에게 R 진입 — 공식 추천 팀원'});
  put(E_ADC,{'애쉬':-1,'드레이븐':-2,'미스포츈':-1,'트리스타나':-1,'케이틀린':-2,'진':0,'이즈리얼':0,'카이사':0,
    '바루스':0,'사미라':0,'칼리스타':-2,'베인':0,'징크스':0,'루시안':-1,'유나라':0,'코르키':0,'트위치':1,'스몰더':0,'자야':0,'세나':0},
   {'케이틀린':'하드 카운터 — 사거리 차이로 라인전 내내 두들겨 맞는다','드레이븐':'초반 압박에 카이사가 1코어 전에 무너진다',
    '칼리스타':'하드 카운터 — 초반 딜교에서 진다','트위치':'짧은 사거리끼리면 카이사 폭딜이 먼저 들어간다'});
  put(E_SUP,{'브라움':-1,'야스오':-1,'블리츠크랭크':-1,'알리스타':-1,'레오나':-1,'쓰레쉬':-1,'노틸러스':-1,'파이크':0,
    '자이라':-1,'갈리오':-1,'마오카이':-1,'스웨인':-1,'럭스':-1,'아리':0,'모르가나':0,'나미':-1,'룰루':-1,'소라카':0,'세라핀':-1},
   {'룰루':'R로 들어가는 순간 변이에 끊긴다','브라움':'방어막이 Q 미사일을 다 먹는다'});
  put(TRAITS,{'dive':0,'tank':1,'poke':-1,'teamfight':0,'cc':-1,'immobile':2,'earlypress':-2,'scaling':0},
   {'immobile':'이동기 없는 적에게 R로 붙어 한 명씩 지운다','earlypress':'1코어 전 라인전이 약하다',
    'tank':'패시브·구인수 온힛으로 탱커를 녹인다','poke':'사거리가 짧아 포킹에 깎인다'});
  put(OURS,{'우리팀에 이니시·탱커 있음':2,'우리팀에 CC가 거의 없음':-2,'우리팀이 초반에 강함':0,'우리팀이 후반 조합':1,'우리팀에 암살자·다이브 있음':2},
   {'우리팀에 이니시·탱커 있음':'아군 CC가 카이사 R 진입의 전제 조건이다','우리팀에 CC가 거의 없음':'R로 들어갈 각이 안 나온다',
    '우리팀에 암살자·다이브 있음':'같이 뒷라인으로 파고든다'});

 }catch(e){ console.warn('kaisa',e); } })();

/* ── 스몰더를 내 풀에 추가 — KDU 와일드리프트 스몰더 가이드(2026-01) + Wild Rift Core 7.2e ── */
const SMOLDER_B={b:'탐욕의 군화',c:["정수 약탈자","자성 발사기","칠흑의 양날 도끼"],l:["피바라기","삼위일체","무한의 대검"],
 r:'정복자 (라인전 견제가 필요하면 신비로운 유성) / 보조는 버티기 위주',sp:'점멸 + 방어막',
 sk:'3렙까지 Q·W로 스택 쌓기에 집중 → Q 마스터 → W. 공격적인 라인 상대면 E를 2렙에 찍는다',
 ln:'Q로 미니언 막타를 쳐서 스택을 쌓아라(처치하면 마나도 돌려받는다). 20스택 Q 광역, 85스택 Q 폭발이 뒤로 튕김(벽 너머도 맞음), 150스택 Q 고정 피해 + 처형. W는 적 챔프끼리 붙어 있을 때 맞춰야 피해가 커진다.',
 s:{tank:'칠흑의 양날 도끼 — 150스택 전까지는 방관으로 버틴다',heal:'필멸자의 운명',ap:'맬모셔스의 아귀',
  ad:'수호 천사 — 다이브에 약하다',cc:'수은의 검 — E 비행 중 하드 CC 맞으면 바로 끊긴다',
  shield:'독사의 송곳니 — 브라움 방패엔 W를 아껴라',group:'W 폭발이 여러 명한테 튄다 — 뭉친 적에게 W부터',
  poke:'정수 약탈자 그대로. 포킹에 약하니 미니언 뒤에서 Q 막타만'}};
(()=>{ try{
  if(typeof CHAMPS==='undefined'||CHAMPS.some(c=>c.id==='smolder')) return;
  CHAMPS.push({ id:'smolder', name:'스몰더', tier:'A', wr:'52.9%', pick:'12.8%', ban:'15.4%',
    tag:'스택형 후반 캐리 · 스킬 딜러',
    core:'챔프에게 스킬을 맞히거나 Q로 막타를 치면 용 훈련 스택이 쌓인다. 스택이 곧 성장이다 — 20·85·150 구간마다 Q가 진화한다.',
    strength:'150스택 이후 Q가 최대 체력 비례 고정 피해 + 처형. 뭉친 한타에서 W 폭발이 서로 튀어 딜이 폭증한다. E 비행이 지형을 무시해 포지셔닝·도주가 쉽다.',
    weak:'스택이 쌓이기 전 라인전과 중반 전환이 약하다. 사거리가 짧아 포킹과 사거리 긴 원딜에 위축된다. 다이브에 약하다.',
    spell:'점멸 + 방어막',
    build:'정수 약탈자 → 자성 발사기(사거리 — 필수) → 칠흑의 양날 도끼 → 피바라기 / 삼위일체. 치명타 대신 쿨감·마나로 가는 빌드도 있다',
    runes:'정복자 / 신비로운 유성(견제) · 보조는 버티기',
    combo:['E로 접근 → Q-평 → W-평','W-평 → Q → R-평 → Q (둔화 후 궁)','W 쓰는 도중 점멸로 급습'],
    tip:'궁(엄마)은 날아오는 데 시간이 걸린다 — 교전 중엔 내 뒤쪽으로 써야 상대가 못 피한다. 궁 중앙에 맞추면 추가 피해 + 둔화, 궁 범위 안에 있으면 내가 회복한다. 다이브 당하면 E로 맵 바깥쪽으로 날아 1초 딜로스를 만들어라. 궁 직후엔 E·점멸이 잠깐 막힌다.',
    src:'유튜브 공략(KDU 와일드리프트 스몰더 가이드, 2026-01) + 통계(Wild Rift Core 7.2e)' });
  if(typeof MYPOOL!=='undefined') MYPOOL.add('스몰더');
  const put=(arr,map,why)=>arr.forEach(x=>{const k=x.k||x.label;
    if(map[k]!==undefined){ x.s.smolder=map[k]; if(why&&why[k]){ x.why=x.why||{}; x.why.smolder=why[k]; } } });
  put(SUPPORTS,{'룰루':2,'나미':2,'쓰레쉬':2,'브라움':2,'밀리오':2,'잔나':1,'소라카':1,'유미':1,'카르마':1,'세라핀':1,
    '레오나':0,'노틸러스':0,'알리스타':0,'갈리오':1,'마오카이':1,'라칸':0,'블리츠크랭크':0,'파이크':-1,'모르가나':1,'럭스':1,
    '자이라':1,'스웨인':1,'자르반':-1,'판테온':-1,'세나':0},
   {'룰루':'공식 시너지 — 스택 쌓는 동안 지켜준다','나미':'공식 시너지 — 회복·평타 강화로 라인을 버틴다',
    '쓰레쉬':'공식 시너지 — 랜턴으로 다이브를 빼준다','브라움':'공식 시너지 — 앞에서 막아주고 뒤에서 Q 스택',
    '밀리오':'사거리 증가 + 보호로 짧은 사거리를 메운다','파이크':'라인을 비우고 로밍 — 혼자 스택 쌓기 힘들다',
    '자르반':'딜 서폿이라 초반 약한 스몰더를 못 지켜준다','판테온':'같은 이유 — 보호가 없다'});
  put(E_ADC,{'드레이븐':-2,'바루스':-1,'케이틀린':-1,'애쉬':-1,'진':-1,'트리스타나':-1,'미스포츈':-1,'루시안':-1,'세나':-1,
    '이즈리얼':0,'징크스':0,'카이사':0,'사미라':0,'칼리스타':0,'유나라':0,'코르키':0,'자야':0,'스몰더':0,'베인':1,'트위치':1},
   {'드레이븐':'하드 카운터 — 스택 쌓기 전에 라인에서 터진다','바루스':'사거리 긴 견제에 스택을 못 쌓는다',
    '케이틀린':'사거리가 길어 막타 칠 때마다 맞는다','베인':'사거리 짧은 원딜 — 스몰더가 먼저 견제한다'});
  put(E_SUP,{'브라움':-2,'야스오':-1,'블리츠크랭크':-1,'알리스타':-1,'레오나':-1,'쓰레쉬':-1,'노틸러스':-1,'파이크':-1,
    '자이라':-1,'럭스':-1,'세라핀':-1,'스웨인':-1,'갈리오':-1,'마오카이':-1,'아리':-1,'모르가나':0,'나미':0,'룰루':0,'소라카':1},
   {'브라움':'방패가 Q·W를 다 막는다 — 방패 빠졌을 때만 W를 써라','소라카':'앞라인 없는 힐 서폿 — 라인이 편하다'});
  put(TRAITS,{'dive':-2,'tank':1,'poke':-1,'teamfight':2,'cc':-1,'immobile':1,'earlypress':-2,'scaling':2},
   {'dive':'진입에 약하다 — E로 맵 바깥쪽으로 빠져라','teamfight':'뭉친 적에게 W 폭발이 서로 튄다',
    'earlypress':'스택 쌓기 전에 터진다','scaling':'150스택 이후 후반 한타는 스몰더가 이긴다',
    'poke':'사거리가 짧아 포킹에 깎인다','tank':'150스택 Q가 최대 체력 비례 고정 피해'});
  put(OURS,{'우리팀에 이니시·탱커 있음':2,'우리팀에 CC가 거의 없음':0,'우리팀이 초반에 강함':-1,'우리팀이 후반 조합':2,'우리팀에 암살자·다이브 있음':0},
   {'우리팀에 이니시·탱커 있음':'앞에서 버텨줘야 뒤에서 스택을 굴린다','우리팀이 후반 조합':'같이 커서 후반에 끝낸다',
    '우리팀이 초반에 강함':'초반에 같이 싸워줄 힘이 없다'});
 }catch(e){ console.warn('smolder',e); } })();

/* 치트시트·챔프 상세는 index.html이 처음에 한 번만 그리므로 추가한 챔프를 넣어 다시 그린다 */
(()=>{ try{
  /* 치트시트·챔프 상세는 index.html이 처음에 한 번만 그리므로 다시 그린다 */
  const CATS=[[SUPPORTS,'폿'],[E_ADC,'적딜'],[E_SUP,'적폿'],[TRAITS,'조합'],[OURS,'아군']];
  const on={},off={}; CHAMPS.forEach(c=>{on[c.id]={};off[c.id]={};});
  CATS.forEach(([src,cat])=>src.forEach(x=>CHAMPS.forEach(c=>{
    const v=x.s?.[c.id]; if(v===undefined) return;
    const nm=(x.label||x.k).replace(' ⚠','');
    if(v>=2)(on[c.id][cat]=on[c.id][cat]||[]).push(nm);
    else if(v<=-2)(off[c.id][cat]=off[c.id][cat]||[]).push(nm);
  })));
  const fmt=o=>{const ks=CATS.map(x=>x[1]).filter(k=>o[k]);
    return ks.length?ks.map(k=>`<div class="cg"><i>${k}</i>${o[k].map(n=>`<em>${n}</em>`).join('')}</div>`).join(''):'—';};
  const sh=document.querySelector('#sheet');
  if(sh) sh.innerHTML=`<thead><tr><th>챔프</th><th class="g">◎ 이럴 때 고른다</th><th class="r">✕ 이럴 때 피한다</th></tr></thead><tbody>`
    + CHAMPS.map(c=>`<tr><td class="c">${ico(c.name)}${c.name}<br><span style="font-size:9px;color:var(--warn);font-weight:700">${c.tier}</span></td>
    <td class="g">${fmt(on[c.id])}</td><td class="r">${fmt(off[c.id])}</td></tr>`).join('')+'</tbody>';
  const cd=document.querySelector('#champs');
  if(cd) cd.innerHTML=CHAMPS.map(c=>`<div class="cd">
  <h4>${ico(c.name)}<span>${c.name}</span><span class="tier">${c.tier}</span></h4><div class="tag">${c.tag}</div>
  <dl><dt>핵심</dt><dd>${c.core}</dd><dt>강점</dt><dd>${c.strength}</dd><dt>약점</dt><dd>${c.weak}</dd>
  <dt>스펠</dt><dd>${c.spell}</dd><dt>빌드</dt><dd>${c.build}</dd><dt>룬</dt><dd>${c.runes}</dd>
  <dt>콤보</dt><dd><ul>${c.combo.map(x=>`<li>${x}</li>`).join('')}</ul></dd>
  ${c.tip?`<dt>팁</dt><dd>${c.tip}</dd>`:''}${c.warn?`<dt>주의</dt><dd class="wn">${c.warn}</dd>`:''}</dl>
  <div class="stat">${c.wr!=='—'?`승률 ${c.wr} · 픽률 ${c.pick} · 밴률 ${c.ban} · `:''}근거: ${c.src}</div>
</div>`).join('');
  if(typeof draw==='function') draw();
 }catch(e){ console.warn('redraw',e); } })();

/* 실전 DB(adv.js)를 동적으로 불러온다 — index.html은 손대지 않는다 */
(()=>{const s=document.createElement('script'); s.src='adv.js?v=1'; s.async=true;
  s.onload=()=>{ if(window.WRDB){ if(!WRDB.B.kaisa) WRDB.B.kaisa=KAISA_B; if(!WRDB.B.smolder) WRDB.B.smolder=SMOLDER_B; }
    if(window.render) try{window.render()}catch(_){} };
  document.head.appendChild(s);})();

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
