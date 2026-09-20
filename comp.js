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
window.WRC={HEAL,CC,IMMOBILE,flags,advice};

/* 실전 DB(adv.js)를 동적으로 불러온다 — index.html은 손대지 않는다 */
(()=>{const s=document.createElement('script'); s.src='adv.js?v=1'; s.async=true;
  s.onload=()=>{ if(window.render) try{window.render()}catch(_){} };
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
