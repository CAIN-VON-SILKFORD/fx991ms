/* fx-991MS advanced: CMPLX, MAT, VCT */
(()=>{
const f=v=>fmt(v),z0=x=>Math.abs(x)<1e-12?0:x,val=globalThis.fxTools.val,sum=a=>a.reduce((s,x)=>s+x,0);
const mode=()=>['DEG','RAD','GRA'][st.mode];
const deg=x=>st.mode===0?x*180/Math.PI:st.mode===1?x:x*200/Math.PI;
const cf=(re,im)=>{re=z0(re);im=z0(im);return im===0?f(re):f(re)+(im<0?' − ':' + ')+f(Math.abs(im))+'i'};
const OPC=['z1 + z2','z1 − z2','z1 × z2','z1 ÷ z2','z1 ^ n (n = Re z2)','√z1','conj z1','1 ÷ z1'];
function cplx(a,b,op){
  const[r1,i1]=a,[r2,i2]=b;let r,i;
  if(op===OPC[0]){r=r1+r2;i=i1+i2}
  else if(op===OPC[1]){r=r1-r2;i=i1-i2}
  else if(op===OPC[2]){r=r1*r2-i1*i2;i=r1*i2+i1*r2}
  else if(op===OPC[3]||op===OPC[7]){const[p,q,s,t]=op===OPC[3]?[r1,i1,r2,i2]:[1,0,r1,i1],d=s*s+t*t;if(!d)throw 0;r=(p*s+q*t)/d;i=(q*s-p*t)/d}
  else if(op===OPC[6]){r=r1;i=-i1}
  else{const n=op===OPC[5]?.5:r2,m=Math.hypot(r1,i1),t=Math.atan2(i1,r1);if(!m&&n<=0)throw 0;const q=m?Math.pow(m,n):0;r=q*Math.cos(n*t);i=q*Math.sin(n*t)}
  if(![r,i].every(isFinite))throw 0;
  return cf(r,i)+'\n|z| = '+f(Math.hypot(r,i))+'\narg = '+f(z0(deg(Math.atan2(i,r))))+' ('+mode()+')';
}
const pm=t=>{const M=t.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>l.split(/[\s,;]+/).map(val));if(!M.length||M.length>4||M[0].length>4||M.some(r=>r.length!==M[0].length))throw 0;return M};
const fm=M=>M.map(r=>r.map(x=>f(z0(x))).join('  ')).join('\n');
const det=M=>{const n=M.length;if(M.some(r=>r.length!==n))throw 0;const A=M.map(r=>r.slice());let d=1;
  for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;
    if(Math.abs(A[p][c])<1e-12)return 0;if(p!==c){[A[c],A[p]]=[A[p],A[c]];d=-d}d*=A[c][c];
    for(let r=c+1;r<n;r++){const k=A[r][c]/A[c][c];for(let j=c;j<n;j++)A[r][j]-=k*A[c][j]}}return d};
const inv=M=>{const n=M.length;if(M.some(r=>r.length!==n))throw 0;const A=M.map((r,i)=>[...r,...Array.from({length:n},(_,j)=>+(i===j))]);
  for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;
    if(Math.abs(A[p][c])<1e-12)throw 0;[A[c],A[p]]=[A[p],A[c]];const d=A[c][c];A[c]=A[c].map(x=>x/d);
    for(let r=0;r<n;r++)if(r!==c){const k=A[r][c];A[r]=A[r].map((x,j)=>x-k*A[c][j])}}return A.map(r=>r.slice(n))};
const OPM=['A + B','A − B','A × B','k × A','det A','A⁻¹','Aᵀ'];
function mat(ta,tb,op,k){
  const A=pm(ta);
  if(op===OPM[4])return'det A = '+f(z0(det(A)));
  if(op===OPM[5])return fm(inv(A));
  if(op===OPM[6])return fm(A[0].map((_,j)=>A.map(r=>r[j])));
  if(op===OPM[3]){const s=val(k);return fm(A.map(r=>r.map(x=>x*s)))}
  const B=pm(tb);
  if(op===OPM[2]){if(A[0].length!==B.length)throw 0;return fm(A.map(r=>B[0].map((_,j)=>sum(r.map((x,l)=>x*B[l][j])))))}
  if(A.length!==B.length||A[0].length!==B[0].length)throw 0;
  return fm(A.map((r,i)=>r.map((x,j)=>op===OPM[0]?x+B[i][j]:x-B[i][j])));
}
const pv=t=>{const v=t.split(/[\s,;]+/).filter(Boolean).map(val);if(v.length<2||v.length>3)throw 0;return v};
const fv=v=>'('+v.map(x=>f(z0(x))).join(', ')+')';
const OPV=['A + B','A − B','k × A','A · B','A × B','|A|','unit A','angle A,B'];
function vct(ta,tb,op,k){
  const A=pv(ta),mag=v=>Math.hypot(...v);
  if(op===OPV[5])return'|A| = '+f(mag(A));
  if(op===OPV[6]){const m=mag(A);if(!m)throw 0;return fv(A.map(x=>x/m))}
  if(op===OPV[2]){const s=val(k);return fv(A.map(x=>x*s))}
  const B=pv(tb);if(A.length!==B.length)throw 0;
  if(op===OPV[0])return fv(A.map((x,i)=>x+B[i]));
  if(op===OPV[1])return fv(A.map((x,i)=>x-B[i]));
  const d=sum(A.map((x,i)=>x*B[i]));
  if(op===OPV[3])return'A · B = '+f(z0(d));
  if(op===OPV[4]){if(A.length===2)return'A × B = '+f(z0(A[0]*B[1]-A[1]*B[0]));return fv([A[1]*B[2]-A[2]*B[1],A[2]*B[0]-A[0]*B[2],A[0]*B[1]-A[1]*B[0]])}
  const m=mag(A)*mag(B);if(!m)throw 0;
  const cr=A.length===2?[0,0,A[0]*B[1]-A[1]*B[0]]:[A[1]*B[2]-A[2]*B[1],A[2]*B[0]-A[0]*B[2],A[0]*B[1]-A[1]*B[0]];
  return'angle = '+f(z0(deg(Math.atan2(mag(cr),d))))+' ('+mode()+')';
}
globalThis.fxAdv={cplx,mat,vct,OPC,OPM,OPV};
/* ---- panel UI (reuses the styles from modes.js) ---- */
const dlg=document.createElement('dialog');dlg.className='fxd';document.body.append(dlg);
const $d=id=>dlg.querySelector('#'+id),fld=(id,l,v)=>'<div><label>'+l+'</label><input id="'+id+'" value="'+(v||'')+'" autocomplete="off"></div>';
const sel=(l,os)=>'<label>'+l+'</label><select id="p">'+os.map(o=>'<option>'+o+'</option>').join('')+'</select>';
const area=(id,l,v)=>'<label>'+l+'</label><textarea id="'+id+'" rows="3">'+v+'</textarea>';
function shell(title,body,fn){
  dlg.innerHTML='<h2>'+title+'</h2>'+body+'<button id="r">Calculate</button> <button class="x" id="c">Close</button><pre id="o" role="status"></pre>';
  $d('c').onclick=()=>dlg.close();
  $d('r').onclick=()=>{let t;try{t=fn()}catch(e){t='Math ERROR'}$d('o').textContent=t};
  if(!dlg.open)dlg.showModal();
}
const g=(...a)=>a.map(i=>val($d(i).value));
const tools=[
 ['CMPLX',()=>shell('CMPLX (z = a + bi)','<div class="g" style="grid-template-columns:1fr 1fr">'+fld('a','z1 real','0')+fld('b','z1 imaginary','0')+fld('c','z2 real','0')+fld('d','z2 imaginary','0')+'</div>'+sel('Operation',OPC),()=>{const[a,b,c,d]=g('a','b','c','d');return cplx([a,b],[c,d],$d('p').value)})],
 ['MAT',()=>shell('MAT (up to 4×4)',area('a','Matrix A (one row per line)','1 2\n3 4')+area('b','Matrix B','0 1\n1 0')+fld('k','k (for k × A)','2')+sel('Operation',OPM),()=>mat($d('a').value,$d('b').value,$d('p').value,$d('k').value))],
 ['VCT',()=>shell('VCT (2D or 3D)',fld('a','Vector A','1,2,3')+fld('b','Vector B','4,5,6')+fld('k','k (for k × A)','2')+sel('Operation',OPV),()=>vct($d('a').value,$d('b').value,$d('p').value,$d('k').value))]
];
const row=document.createElement('div');row.className='pad';row.style.cssText='grid-template-columns:repeat(3,1fr);gap:4px 7px';
tools.forEach(([l,fn])=>{const d=document.createElement('div');d.className='k';const b=document.createElement('button');b.type='button';b.textContent=l;b.onclick=()=>fn();d.append(b);row.append(d)});
host.insertBefore(row,host.children[7]);
const hint=document.querySelector('.hint');
if(hint)hint.append(' CMPLX, MAT and VCT open panels too.');
})();
