/* fx-991MS extras: integration, differentiation, Pol/Rec, degrees-minutes-seconds */
(()=>{
const calc0=calc,equals0=equals,press0=press,ex={polar:null};
const rad=x=>st.mode===0?x*Math.PI/180:st.mode===1?x:x*Math.PI/200;
const deg=x=>st.mode===0?x*180/Math.PI:st.mode===1?x:x*200/Math.PI;
const z=x=>Math.abs(x)<1e-12?0:x;
const lit=v=>{if(!isFinite(v))throw 0;return String(v).replace('e','ᴇ')};
const fAt=(f,x)=>{const o=st.mem.X;st.mem.X=x;try{return calc(f)}finally{st.mem.X=o}};
function run(n,a){
  if(n==='∫('){
    const lo=calc(a[1]),hi=calc(a[2]),F=x=>fAt(a[0],x);
    if(lo===hi)return 0;
    const sp=(l,r,u,v,w)=>(r-l)/6*(u+4*v+w);
    const go=(l,r,fa,fm,fb,S,e,dp)=>{
      const m=(l+r)/2,lm=(l+m)/2,rm=(m+r)/2,fl=F(lm),fr=F(rm),SL=sp(l,m,fa,fl,fm),SR=sp(m,r,fm,fr,fb),d=SL+SR-S;
      if(dp<=0||Math.abs(d)<=15*e)return SL+SR+d/15;
      return go(l,m,fa,fl,fm,SL,e/2,dp-1)+go(m,r,fm,fr,fb,SR,e/2,dp-1);
    };
    const fa=F(lo),fb=F(hi),fm=F((lo+hi)/2);
    return go(lo,hi,fa,fm,fb,sp(lo,hi,fa,fm,fb),1e-11,40);
  }
  if(n==='d/dx('){
    const x0=calc(a[1]),h=1e-3*Math.max(1,Math.abs(x0));
    const D=k=>(fAt(a[0],x0+k)-fAt(a[0],x0-k))/(2*k);
    return(4*D(h/2)-D(h))/3;
  }
  const p=calc(a[0]),q=calc(a[1]);
  if(n==='Pol('){const r=Math.hypot(p,q),t=z(deg(Math.atan2(q,p)));ex.polar=[r,t,'∠'];st.mem.X=r;st.mem.Y=t;return r}
  const x=z(p*Math.cos(rad(q))),y=z(p*Math.sin(rad(q)));ex.polar=[x,y,','];st.mem.X=x;st.mem.Y=y;return x;
}
const NM=['∫(','d/dx(','Pol(','Rec('];
function pre(s){
  s=s.replace(/(\d+\.?\d*)°(?:(\d+\.?\d*)′)?(?:(\d+\.?\d*)″)?/g,(m,d,mi,se)=>'('+lit(+d+(+mi||0)/60+(+se||0)/3600)+')');
  for(;;){
    let b=-1,n;
    for(const k of NM){const i=s.indexOf(k);if(i>=0&&(b<0||i<b)){b=i;n=k}}
    if(b<0)return s;
    let d=1,j=b+n.length,l=j;const a=[];
    for(;j<s.length;j++){const c=s[j];if(c==='(')d++;else if(c===')'){if(--d===0)break}else if(c===','&&d===1){a.push(s.slice(l,j));l=j+1}}
    a.push(s.slice(l,j));
    s=s.slice(0,b)+'('+lit(run(n,a))+')'+s.slice(Math.min(j+1,s.length));
  }
}
function toDMS(v){
  const neg=v<0,t=Math.round(Math.abs(v)*360000)/100,d=Math.floor(t/3600),m=Math.floor((t-d*3600)/60),s=Math.round((t-d*3600-m*60)*100)/100;
  return(neg?'−':'')+d+'°'+m+'′'+s+'″';
}
calc=s=>calc0(pre(s));
equals=()=>{
  ex.polar=null;equals0();
  if(ex.polar&&!st.err&&st.done){const[u,v,c]=ex.polar;st.res=fmt(u)+(c==='∠'?' ∠ ':' , ')+fmt(v)}
  ex.polar=null;
};
press=k=>{
  let a=k[1];if(st.sh&&k[3])a=k[3];else if(st.al&&k[5])a=k[5];
  if(a==='x:dms'){
    if(st.err){st.err=false;st.res=''}
    st.sh=st.al=false;
    if(st.lastv!==undefined&&st.done)st.res=toDMS(st.lastv);
    draw();return;
  }
  press0(k);
};
const row=document.createElement('div');row.className='pad g6';
[K('∫dx','i:∫(','°','i:°'),K('d/dx','i:d/dx(','′','i:′'),K('Pol(','i:Pol(','″','i:″'),K('Rec(','i:Rec('),K(',','i:,'),K('▶DMS','x:dms')].forEach(k=>{
  const d=document.createElement('div');d.className='k '+k[6];
  d.innerHTML=(k[2]?`<span class="s">${k[2]}</span>`:'')+(k[4]?`<span class="a">${k[4]}</span>`:'');
  const b=document.createElement('button');b.type='button';b.textContent=k[0];
  b.onclick=ev=>{press(k);if(ev.detail)b.blur()};
  d.append(b);row.append(d);ALL.push([k,b]);
});
host.insertBefore(row,host.children[4]);
const hint=document.querySelector('.hint');
if(hint)hint.append(' Calculus: type the expression in X (ALPHA then the ) key), for example ∫(X²,0,3) or d/dx(X³,2). SHIFT on ∫dx, d/dx and Pol( gives °, ′ and ″. ▶DMS converts the last result.');
})();
