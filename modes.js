/* fx-991MS modes: EQN, STAT/REG, BASE-N (each opens a panel) */
(()=>{
const f=v=>fmt(v),sum=a=>a.reduce((s,x)=>s+x,0);
const num=s=>{s=String(s).trim();if(!s)throw 0;if(/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s))return parseFloat(s);return calc(s.replace(/\*/g,'×').replace(/\//g,'÷').replace(/-/g,'−'))};
const cx=(re,im)=>Math.abs(im)<1e-9*Math.max(1,Math.abs(re))?f(re):f(re)+(im<0?' − ':' + ')+f(Math.abs(im))+'i';
const EQ=[['ax²+bx+c=0','abc'],['ax³+bx²+cx+d=0','abcd'],['2 unknowns','a1 b1 c1 a2 b2 c2'],['3 unknowns','a1 b1 c1 d1 a2 b2 c2 d2 a3 b3 c3 d3']];
const names=i=>EQ[i][1].includes(' ')?EQ[i][1].split(' '):EQ[i][1].split('');
function solve(i,v){
  if(i===0){const[a,b,c]=v;if(!a)throw 0;const D=b*b-4*a*c;
    if(D>=0){const s=Math.sqrt(D);return'x1 = '+f((-b+s)/(2*a))+'\nx2 = '+f((-b-s)/(2*a))}
    const s=Math.sqrt(-D)/(2*a);return'x1 = '+cx(-b/(2*a),s)+'\nx2 = '+cx(-b/(2*a),-s)}
  if(i===1){const[a,b,c,d]=v;if(!a)throw 0;const p=[b/a,c/a,d/a],R=1+Math.max(...p.map(Math.abs));
    const M=(x,y)=>[x[0]*y[0]-x[1]*y[1],x[0]*y[1]+x[1]*y[0]],S=(x,y)=>[x[0]-y[0],x[1]-y[1]],Q=(x,y)=>{const q=y[0]*y[0]+y[1]*y[1];return[(x[0]*y[0]+x[1]*y[1])/q,(x[1]*y[0]-x[0]*y[1])/q]};
    const P=x=>{const x2=M(x,x),x3=M(x2,x);return[x3[0]+p[0]*x2[0]+p[1]*x[0]+p[2],x3[1]+p[0]*x2[1]+p[1]*x[1]]};
    let r=[0.4,2.5,4.6].map(t=>[R*Math.cos(t),R*Math.sin(t)]);
    for(let k=0;k<400;k++)r=r.map((x,j)=>{let den=[1,0];r.forEach((y,l)=>{if(l!==j)den=M(den,S(x,y))});return S(x,Q(P(x),den))});
    return r.map((x,k)=>'x'+(k+1)+' = '+cx(x[0],x[1])).join('\n')}
  const n=i===2?2:3,A=[];for(let r=0;r<n;r++)A.push(v.slice(r*(n+1),(r+1)*(n+1)));
  for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;
    if(Math.abs(A[p][c])<1e-12)throw 0;[A[c],A[p]]=[A[p],A[c]];
    for(let r=0;r<n;r++)if(r!==c){const k=A[r][c]/A[c][c];for(let j=c;j<=n;j++)A[r][j]-=k*A[c][j]}}
  return A.map((r,k)=>'xyz'[k]+' = '+f(r[n]/r[k])).join('\n');
}
function statText(text,ty,ex,ey){
  const rows=text.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>l.split(/[\s,;]+/).map(num)),n=rows.length;
  if(!n)throw 0;
  const one=(a,k)=>{const m=sum(a)/a.length,q=sum(a.map(x=>(x-m)**2));return'Σ'+k+' = '+f(sum(a))+'\nΣ'+k+'² = '+f(sum(a.map(x=>x*x)))+'\nmean '+k+' = '+f(m)+'\nσ'+k+' = '+f(Math.sqrt(q/a.length))+'\ns'+k+' = '+(a.length>1?f(Math.sqrt(q/(a.length-1))):'n/a')};
  if(rows.every(r=>r.length===1))return'n = '+n+'\n'+one(rows.map(r=>r[0]),'x');
  if(!rows.every(r=>r.length===2))throw 0;
  const xs=rows.map(r=>r[0]),ys=rows.map(r=>r[1]);
  const X=xs.map(x=>ty==='Log'||ty==='Pwr'?Math.log(x):ty==='Inv'?1/x:x),Y=ys.map(y=>ty==='Exp'||ty==='Pwr'?Math.log(y):y);
  const mx=sum(X)/n,my=sum(Y)/n,sxx=sum(X.map(x=>(x-mx)**2)),syy=sum(Y.map(y=>(y-my)**2)),sxy=sum(X.map((x,i)=>(x-mx)*(Y[i]-my)));
  const B=sxy/sxx,a0=my-B*mx,r=sxy/Math.sqrt(sxx*syy),A=ty==='Exp'||ty==='Pwr'?Math.exp(a0):a0;
  if(![A,B,r].every(isFinite))throw 0;
  const yh={Lin:x=>A+B*x,Log:x=>A+B*Math.log(x),Exp:x=>A*Math.exp(B*x),Pwr:x=>A*Math.pow(x,B),Inv:x=>A+B/x}[ty];
  const xh={Lin:y=>(y-A)/B,Log:y=>Math.exp((y-A)/B),Exp:y=>Math.log(y/A)/B,Pwr:y=>Math.pow(y/A,1/B),Inv:y=>B/(y-A)}[ty];
  let o='n = '+n+'\n'+one(xs,'x')+'\n'+one(ys,'y')+'\nΣxy = '+f(sum(xs.map((x,i)=>x*ys[i])))+'\n'+ty+': A = '+f(A)+'\nB = '+f(B)+'\nr = '+f(r);
  if(String(ex).trim()){const v=yh(num(ex));if(!isFinite(v))throw 0;o+='\nŷ = '+f(v)}
  if(String(ey).trim()){const v=xh(num(ey));if(!isFinite(v))throw 0;o+='\nx̂ = '+f(v)}
  return o;
}
const DG={10:/^-?\d+$/,16:/^[0-9A-F]+$/i,2:/^[01]+$/,8:/^[0-7]+$/},OPS=['(none)','a AND b','a OR b','a XOR b','a XNOR b','NOT a','NEG a','a + b','a − b','a × b','a ÷ b'];
function baseText(as,b,p,cs){
  const pr=(s,bb)=>{s=String(s).trim();if(!DG[bb].test(s))throw 0;const v=parseInt(s,bb);if(bb===10?(v>2147483647||v<-2147483648):v>4294967295)throw 0;return v|0};
  const a=pr(as,b);let r=a;
  if(p!=='(none)'){const c=/^(NOT|NEG)/.test(p)?0:pr(cs,b);
    if(p==='a ÷ b'&&!c)throw 0;
    r={'a AND b':a&c,'a OR b':a|c,'a XOR b':a^c,'a XNOR b':~(a^c),'NOT a':~a,'NEG a':-a|0,'a + b':a+c|0,'a − b':a-c|0,'a × b':Math.imul(a,c),'a ÷ b':c?(a/c)|0:0}[p]}
  const u=r>>>0;return'DEC '+r+'\nHEX '+u.toString(16).toUpperCase()+'\nBIN '+u.toString(2)+'\nOCT '+u.toString(8);
}
globalThis.fxModes={solve,statText,baseText};
/* ---- panel UI ---- */
const css=document.createElement('style');
css.textContent='dialog.fxd{border:0;border-radius:14px;padding:14px;width:min(94vw,380px);background:#2f3238;color:#eef0f2;font:14px system-ui,sans-serif;box-shadow:0 20px 50px rgba(0,0,0,.5)}dialog.fxd::backdrop{background:rgba(0,0,0,.55)}.fxd h2{margin:0 0 6px;font-size:16px}.fxd label{display:block;font-size:12px;margin:6px 0 2px;opacity:.8}.fxd input,.fxd select,.fxd textarea{width:100%;padding:7px;border-radius:7px;border:1px solid #555;background:#1d1f23;color:#fff;font:14px ui-monospace,Consolas,monospace}.fxd .g{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.fxd button{padding:9px 14px;border:0;border-radius:8px;background:#e8b930;color:#222;font-weight:700;margin-top:10px;cursor:pointer}.fxd button.x{background:#5a5f68;color:#fff}.fxd pre{background:#c5cfb2;color:#1c2418;padding:8px;border-radius:7px;white-space:pre-wrap;margin:10px 0 0;min-height:2em;font:15px ui-monospace,Consolas,monospace}.pad.g3{grid-template-columns:repeat(3,1fr);gap:4px 7px}';
document.head.append(css);
const dlg=document.createElement('dialog');dlg.className='fxd';document.body.append(dlg);
const $d=id=>dlg.querySelector('#'+id),inp=(id,l)=>'<label>'+l+'</label><input id="'+id+'" inputmode="decimal" autocomplete="off">';
function shell(title,body,fn,mount){
  dlg.innerHTML='<h2>'+title+'</h2>'+body+'<button id="r">Calculate</button> <button class="x" id="c">Close</button><pre id="o" role="status"></pre>';
  $d('c').onclick=()=>dlg.close();
  $d('r').onclick=()=>{let t;try{t=fn()}catch(e){t='Math ERROR'}$d('o').textContent=t};
  if(mount)mount();
  if(!dlg.open)dlg.showModal();
}
function eqn(i=0){
  const nm=names(i);
  shell('EQN','<label>Type</label><select id="t">'+EQ.map((e,k)=>'<option value="'+k+'"'+(k===i?' selected':'')+'>'+e[0]+'</option>').join('')+'</select><div class="g">'+nm.map(n=>inp('v'+n,n)).join('')+'</div>',
    ()=>solve(i,nm.map(n=>num($d('v'+n).value))),()=>{$d('t').onchange=e=>eqn(+e.target.value)});
}
function stat(){
  shell('STAT / REG','<label>Data: one value x, or a pair x,y on each line</label><textarea id="d" rows="5" placeholder="1,2&#10;2,4.1&#10;3,5.9"></textarea><label>Regression type (pairs only)</label><select id="t">'+['Lin','Log','Exp','Pwr','Inv'].map(t=>'<option>'+t+'</option>').join('')+'</select>'+inp('ex','Estimate ŷ at x (optional)')+inp('ey','Estimate x̂ at y (optional)'),
    ()=>statText($d('d').value,$d('t').value,$d('ex').value,$d('ey').value));
}
function base(){
  shell('BASE-N (32-bit)','<label>Number a</label><input id="a" autocomplete="off"><label>Base of input</label><select id="b"><option value="10">DEC</option><option value="16">HEX</option><option value="2">BIN</option><option value="8">OCT</option></select><label>Operation</label><select id="p">'+OPS.map(o=>'<option>'+o+'</option>').join('')+'</select><label>Number b (same base)</label><input id="e" autocomplete="off">',
    ()=>baseText($d('a').value,+$d('b').value,$d('p').value,$d('e').value));
}
const row=document.createElement('div');row.className='pad g3';
[['EQN',eqn],['STAT / REG',stat],['BASE-N',base]].forEach(([l,fn])=>{
  const d=document.createElement('div');d.className='k';
  const b=document.createElement('button');b.type='button';b.textContent=l;b.onclick=()=>fn();
  d.append(b);row.append(d);
});
host.insertBefore(row,host.children[5]);
const hint=document.querySelector('.hint');
if(hint)hint.append(' EQN, STAT / REG and BASE-N open their own panels.');
})();
