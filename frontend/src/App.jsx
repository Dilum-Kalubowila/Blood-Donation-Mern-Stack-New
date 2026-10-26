import { useEffect, useState } from "react";
import { Activity, HeartPulse, Droplet, Users, Search, LogOut, ShieldCheck, Clock3, HeartHandshake, Plus, RefreshCw, Trash2, Menu, X, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const GROUPS = ["O-","O+","A-","A+","B-","B+","AB-","AB+"];
const emptyForm = { name:"", age:"", city:"", bloodGroup:"O+" };
function App() {
  const [token,setToken] = useState(localStorage.getItem("lifeflow_token") || "");
  const [user,setUser] = useState(JSON.parse(localStorage.getItem("lifeflow_user") || "null"));
  const [authMode,setAuthMode] = useState("login");
  const [authForm,setAuthForm] = useState({name:"",email:"",password:""});
  const [data,setData] = useState({donors:[],receivers:[],totalMatches:0,recentMatches:[]});
  const [matches,setMatches] = useState([]);
  const [formType,setFormType] = useState("receiver");
  const [record,setRecord] = useState(emptyForm);
  const [notice,setNotice] = useState(null);
  const [busy,setBusy] = useState(false);
  const [tab,setTab] = useState("overview");
  const [adminData,setAdminData] = useState({users:[],donors:[],receivers:[],matches:[]});
  const [mobileMenu,setMobileMenu] = useState(false);

  async function api(path, options={}) {
    const res = await fetch(`${API}${path}`, { ...options, headers:{ "Content-Type":"application/json", ...(token ? {Authorization:`Bearer ${token}`} : {}), ...(options.headers||{}) }});
    const body = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(body.message || "Something went wrong");
    return body;
  }
  function flash(message,type="success") { setNotice({message,type}); window.setTimeout(()=>setNotice(null),4500); }
  async function loadData() {
    if (!token) return;
    try {
      const summary = await api("/records/summary");
      setData(summary);
      setMatches(summary.recentMatches || []);
      if (user?.role==="admin") {
        const [users,records] = await Promise.all([api("/admin/users"),api("/admin/records")]);
        setAdminData({users,...records});
      }
    } catch(e) { flash(e.message,"error"); }
  }
  useEffect(()=>{ if(token) loadData(); },[token]);
  async function submitAuth(e) {
    e.preventDefault(); setBusy(true);
    try {
      const result = await api(`/auth/${authMode==="login"?"login":"register"}`,{method:"POST",body:JSON.stringify(authForm)});
      localStorage.setItem("lifeflow_token",result.token); localStorage.setItem("lifeflow_user",JSON.stringify(result.user));
      setToken(result.token); setUser(result.user); flash(`Welcome${result.user.name ? ", "+result.user.name.split(" ")[0] : ""}!`);
    } catch(e) { flash(e.message,"error"); } finally { setBusy(false); }
  }
  function logout() { localStorage.removeItem("lifeflow_token"); localStorage.removeItem("lifeflow_user"); setToken(""); setUser(null); setData({donors:[],receivers:[],totalMatches:0,recentMatches:[]}); }
  async function submitRecord(e) {
    e.preventDefault(); setBusy(true);
    try {
      const result = await api(`/records/${formType==="donor"?"donors":"receivers"}`,{method:"POST",body:JSON.stringify(record)});
      setRecord(emptyForm); await loadData();
      flash(result.matches?.length ? `${result.message} ${result.matches.length} match${result.matches.length>1?"es":""} created.` : result.message);
      setTab("overview");
    } catch(e) { flash(e.message,"error"); } finally { setBusy(false); }
  }
  async function deleteRecord(type,id) {
    if (!confirm("Delete this record? This action cannot be undone.")) return;
    try { await api(`/admin/records/${type}/${id}`,{method:"DELETE"}); await loadData(); flash("Record deleted."); }
    catch(e) { flash(e.message,"error"); }
  }
  async function deleteUser(id) {
    if (!confirm("Delete this user account?")) return;
    try { await api(`/admin/users/${id}`,{method:"DELETE"}); await loadData(); flash("User deleted."); }
    catch(e) { flash(e.message,"error"); }
  }
  const fmt = d => new Date(d).toLocaleString(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
  if (!token || !user) return <AuthScreen mode={authMode} setMode={setAuthMode} form={authForm} setForm={setAuthForm} submit={submitAuth} busy={busy} notice={notice}/>;
  const nav = [{id:"overview",label:"Overview",icon:Activity},{id:"add",label:"Add a record",icon:Plus},{id:"matches",label:"Match history",icon:HeartHandshake},...(user.role==="admin"?[{id:"manage",label:"Admin control",icon:ShieldCheck}]:[])];
  return <div className="app-shell">
    <div className="ambient"><span/><span/><span/><div className="cell cell-a">✚</div><div className="cell cell-b">✚</div><div className="cell cell-c">✚</div></div>
    <aside className={`sidebar ${mobileMenu?"open":""}`}>
      <div className="brand"><div className="brand-mark"><Droplet size={23} fill="currentColor"/></div><div><strong>LifeFlow</strong><small>DONATION NETWORK</small></div><button className="icon-btn mobile-close" onClick={()=>setMobileMenu(false)}><X/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(n=><button key={n.id} className={`nav-item ${tab===n.id?"active":""}`} onClick={()=>{setTab(n.id);setMobileMenu(false)}}><n.icon size={18}/><span>{n.label}</span>{n.id==="matches"&&<span className="nav-count">{data.totalMatches}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><HeartPulse size={19}/></div><strong>Every drop counts.</strong><p>Your small act can give someone another tomorrow.</p><div className="pulse-line"><i/></div></div><div className="profile-row"><div className="avatar">{user.name?.slice(0,1).toUpperCase()}</div><div className="profile-meta"><strong>{user.name}</strong><small>{user.role==="admin"?"Administrator":"Community member"}</small></div><button title="Log out" className="icon-btn" onClick={logout}><LogOut size={17}/></button></div></div>
    </aside>
    {mobileMenu&&<div className="scrim" onClick={()=>setMobileMenu(false)}/>}
    <main className="main-area">
      <header className="topbar"><button className="icon-btn menu-toggle" onClick={()=>setMobileMenu(true)}><Menu/></button><div className="breadcrumb">LifeFlow <span>/</span> <b>{nav.find(n=>n.id===tab)?.label||"Overview"}</b></div><div className="top-actions"><span className="live-dot"/> <span className="live-label">Network live</span><div className="top-avatar">{user.name?.slice(0,1).toUpperCase()}</div></div></header>
      <div className="page-content">
        {tab==="overview"&&<><section className="welcome-row"><div><div className="eyebrow"><Sparkles size={14}/> COMMUNITY IMPACT</div><h1>Good things flow <em>from you.</em></h1><p className="subhead">One community. One shared purpose. A chance to save lives.</p></div><button className="primary-btn" onClick={()=>setTab("add")}><Plus size={17}/> Add donor / receiver <ArrowRight size={16}/></button></section>
          <section className="hero-banner"><div className="hero-copy"><div className="hero-tag"><span className="hero-pulse"/> LIVE MATCHING NETWORK</div><h2>Be someone's<br/><em>reason to hope.</em></h2><p>Every registered donor brings us closer to a life-changing match. Add a record and let the network do the checking.</p><button className="hero-btn" onClick={()=>setTab("add")}>Make a difference <ArrowRight size={16}/></button></div><div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="heart-core"><HeartPulse size={76} strokeWidth={1.35}/></div><div className="float-chip chip-one"><Droplet size={17} fill="currentColor"/> O− <small>Universal donor</small></div><div className="float-chip chip-two"><HeartPulse size={17}/> A+ <small>Matched with care</small></div><div className="art-caption">A little kindness goes a long way.</div></div></section>
          <section className="stats-grid"><Stat icon={Users} label="Waiting donors" value={data.donors.length} hint="Ready to help" tone="red"/><Stat icon={Clock3} label="Waiting receivers" value={data.receivers.length} hint="FIFO priority queue" tone="amber"/><Stat icon={HeartHandshake} label="Successful matches" value={data.totalMatches} hint="Connections made" tone="green"/><Stat icon={Activity} label="Matching status" value="Active" hint="Auto-check enabled" tone="blue" live/></section>
          <section className="content-grid"><div className="panel queue-panel"><div className="panel-heading"><div><h3>Receiver priority queue</h3><p>Oldest request gets checked first</p></div><span className="soft-pill"><span className="tiny-dot"/> FIFO ACTIVE</span></div>{data.receivers.length? <div className="queue-list">{data.receivers.slice(0,5).map((r,i)=><div className="queue-item" key={r._id}><div className="queue-number">{String(i+1).padStart(2,"0")}</div><div className="blood-badge">{r.bloodGroup}</div><div className="queue-person"><strong>{r.name}</strong><small>{r.city} · Age {r.age}</small></div><span className="waiting-pill">Waiting</span></div>)}</div>:<Empty icon={Clock3} title="No one waiting right now" text="When a receiver is added, they'll appear here in queue order."/>}<button className="text-btn" onClick={()=>setTab("add")}>Add a receiver <ArrowRight size={15}/></button></div>
          <div className="panel activity-panel"><div className="panel-heading"><div><h3>Recent matches</h3><p>Real connections, lasting impact</p></div><button className="icon-btn" title="Refresh" onClick={loadData}><RefreshCw size={16}/></button></div>{matches.length? <div className="match-list">{matches.slice(0,4).map(m=><MatchRow key={m._id} match={m} fmt={fmt}/>)}</div>:<Empty icon={HeartHandshake} title="Your first match starts here" text="Add donor and receiver records to begin matching."/>}<button className="text-btn" onClick={()=>setTab("matches")}>View all matches <ArrowRight size={15}/></button></div></section>
        </>}
        {tab==="add"&&<><section className="welcome-row"><div><div className="eyebrow"><HeartPulse size={14}/> GROW THE NETWORK</div><h1>Every record can <em>change a life.</em></h1><p className="subhead">Add a donor or receiver. Matching starts automatically.</p></div></section><div className="form-layout"><div className="panel form-panel"><div className="segmented"><button className={formType==="receiver"?"selected":""} onClick={()=>setFormType("receiver")}><HeartPulse size={16}/> Receiver request</button><button className={formType==="donor"?"selected":""} onClick={()=>setFormType("donor")}><Droplet size={16}/> Donor registration</button></div><div className="form-intro"><div className={`form-icon ${formType}`}>{formType==="receiver" ? <HeartPulse size={23}/> : <Droplet size={23}/>}</div><div><h2>{formType==="receiver"?"Register a receiver":"Register a donor"}</h2><p>{formType==="receiver"?"Receiver requests are processed in the order they arrive.":"Your details help find compatible receivers in the queue."}</p></div></div><form onSubmit={submitRecord} className="record-form"><label>Full name<input required maxLength="80" value={record.name} onChange={e=>setRecord({...record,name:e.target.value})} placeholder="Enter full name"/></label><div className="form-row"><label>Age<input required type="number" min={formType==="donor"?18:0} max="120" value={record.age} onChange={e=>setRecord({...record,age:e.target.value})} placeholder={formType==="donor"?"18 or above":"Age in years"}/></label><label>City<input required value={record.city} onChange={e=>setRecord({...record,city:e.target.value})} placeholder="e.g. Galle"/></label></div><label>Blood group<select value={record.bloodGroup} onChange={e=>setRecord({...record,bloodGroup:e.target.value})}>{GROUPS.map(g=><option key={g}>{g}</option>)}</select></label><div className="info-note"><AlertCircle size={17}/><span>{formType==="receiver"?"This request enters the FIFO queue. Compatible donors are checked in order, and the first available match is recorded.":"When you submit, the system checks waiting receivers from the beginning of the queue."}</span></div><button className="primary-btn submit-btn" disabled={busy}>{busy?"Saving…":formType==="receiver"?"Add to receiver queue":"Register as donor"} <ArrowRight size={17}/></button></form></div><div className="side-info"><div className="panel compatibility-card"><div className="round-icon"><Activity/></div><h3>Smart compatibility</h3><p>We check ABO and Rh blood group compatibility before recording a match.</p><div className="compat-example"><span className="blood-badge">O−</span><ArrowRight size={17}/><span className="blood-badge">A+</span><span className="compatible-label">Compatible</span></div><div className="compat-example"><span className="blood-badge">A+</span><ArrowRight size={17}/><span className="blood-badge">O−</span><span className="not-compatible-label">Not compatible</span></div></div><div className="safety-note"><ShieldCheck size={20}/><div><strong>Care comes first</strong><p>This tool is for project demonstration only. Clinical blood matching must always be confirmed by qualified medical professionals.</p></div></div></div></div></>}
        {tab==="matches"&&<><section className="welcome-row"><div><div className="eyebrow"><HeartHandshake size={14}/> IMPACT HISTORY</div><h1>Every match tells <em>a story.</em></h1><p className="subhead">A record of donor and receiver connections made by the network.</p></div><button className="secondary-btn" onClick={loadData}><RefreshCw size={16}/> Refresh</button></section><div className="panel full-panel"><div className="panel-heading"><div><h3>Match history</h3><p>{data.totalMatches} recorded connection{data.totalMatches!==1?"s":""}</p></div><span className="success-pill"><CheckCircle2 size={14}/> MATCHED</span></div>{matches.length?<div className="history-list">{matches.map(m=><MatchRow key={m._id} match={m} fmt={fmt} large/>)}</div>:<Empty icon={HeartHandshake} title="No matches yet" text="Matches will appear here when compatible records are available."/>}</div></>}
        {tab==="manage"&&user.role==="admin"&&<><section className="welcome-row"><div><div className="eyebrow"><ShieldCheck size={14}/> ADMINISTRATION</div><h1>Keep the network <em>in good hands.</em></h1><p className="subhead">Review records and manage the community from one place.</p></div><button className="secondary-btn" onClick={loadData}><RefreshCw size={16}/> Refresh data</button></section><div className="admin-tabs"><span><Users size={16}/> {adminData.users.length} users</span><span><Droplet size={16}/> {adminData.donors.length} donors</span><span><HeartPulse size={16}/> {adminData.receivers.length} receivers</span></div><div className="panel full-panel"><div className="panel-heading"><div><h3>Community accounts</h3><p>Admin accounts are protected from deletion here.</p></div></div><div className="table-wrap"><table><thead><tr><th>Member</th><th>Email</th><th>Role</th><th>Joined</th><th/></tr></thead><tbody>{adminData.users.map(u=><tr key={u._id}><td><strong>{u.name}</strong></td><td>{u.email}</td><td><span className="role-pill">{u.role}</span></td><td>{fmt(u.createdAt)}</td><td>{u.role!=="admin"&&<button className="danger-icon" onClick={()=>deleteUser(u._id)} title="Delete user"><Trash2 size={15}/></button>}</td></tr>)}</tbody></table></div></div><div className="panel full-panel admin-records"><div className="panel-heading"><div><h3>Active and matched records</h3><p>Delete active records when required.</p></div></div><div className="table-wrap"><table><thead><tr><th>Type</th><th>Name</th><th>Blood group</th><th>City</th><th>Status</th><th/></tr></thead><tbody>{[...adminData.donors.map(r=>({...r,_type:"donors"})),...adminData.receivers.map(r=>({...r,_type:"receivers"}))].map(r=><tr key={r._id}><td>{r._type==="donors"?"Donor":"Receiver"}</td><td><strong>{r.name}</strong></td><td><span className="blood-badge">{r.bloodGroup}</span></td><td>{r.city}</td><td><span className={r.status==="matched"?"success-pill":"waiting-pill"}>{r.status}</span></td><td><button className="danger-icon" onClick={()=>deleteRecord(r._type,r._id)} title="Delete record"><Trash2 size={15}/></button></td></tr>)}</tbody></table></div></div></>}
        <footer className="footer"><span>© 2026 LifeFlow Network</span><span><span className="live-dot"/> Made for a more caring world</span></footer>
      </div>
    </main>
    {notice&&<div className={`toast ${notice.type}`}><span>{notice.type==="error"?<AlertCircle size={19}/>:<CheckCircle2 size={19}/>}</span>{notice.message}<button onClick={()=>setNotice(null)}><X size={15}/></button></div>}
  </div>;
}
function Stat({icon:Icon,label,value,hint,tone,live}) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={20}/></div><div className="stat-main"><span>{label}</span><strong>{value}</strong><small>{live&&<i className="tiny-dot"/>}{hint}</small></div><div className={`stat-decoration ${tone}`}/></div>; }
function MatchRow({match:m,fmt,large}) { return <div className={`match-row ${large?"large":""}`}><div className="match-symbol"><HeartHandshake size={19}/></div><div className="match-details"><strong>{m.receiverName} <span>received from</span> {m.donorName}</strong><small>{m.receiverCity} · {fmt(m.matchedAt)}</small>{large&&<div className="match-groups"><span className="blood-badge">{m.receiverBloodGroup}</span><ArrowRight size={14}/><span className="blood-badge">{m.donorBloodGroup}</span><span className="match-city">Donor city: {m.donorCity}</span></div>}</div><span className="success-pill"><CheckCircle2 size={13}/> Matched</span></div>; }
function Empty({icon:Icon,title,text}) { return <div className="empty-state"><div><Icon size={24}/></div><strong>{title}</strong><p>{text}</p></div>; }
function AuthScreen({mode,setMode,form,setForm,submit,busy,notice}) { return <div className="auth-screen"><div className="ambient"><span/><span/><span/><div className="cell cell-a">✚</div><div className="cell cell-b">✚</div><div className="cell cell-c">✚</div></div><div className="auth-left"><div className="brand auth-brand"><div className="brand-mark"><Droplet size={23} fill="currentColor"/></div><div><strong>LifeFlow</strong><small>DONATION NETWORK</small></div></div><div className="auth-message"><div className="eyebrow"><Sparkles size={14}/> SMALL ACT. BIG IMPACT.</div><h1>Give blood.<br/>Give <em>hope.</em></h1><p>A thoughtful connection can change someone's whole world. Join a community where every drop matters.</p><div className="auth-stat-row"><div><strong>8</strong><span>Blood groups</span></div><i/><div><strong>1</strong><span>Shared mission</span></div><i/><div><strong>∞</strong><span>Hope to give</span></div></div></div><div className="auth-bottom">A community powered by compassion <HeartPulse size={15}/></div></div><div className="auth-right"><div className="auth-card"><div className="auth-mobile-logo"><div className="brand-mark"><Droplet size={22} fill="currentColor"/></div><strong>LifeFlow</strong></div><div className="auth-card-top"><div className="auth-mini-icon"><HeartPulse size={22}/></div><span>WELCOME TO LIFEFLOW</span></div><h2>{mode==="login"?"Welcome back":"Join the network"}</h2><p className="auth-sub">{mode==="login"?"Sign in to continue making a difference.":"Create your account and help connect lives."}</p><form onSubmit={submit} className="auth-form">{mode==="register"&&<label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label>}<label>Email address<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label><label>Password<input required minLength={mode==="register"?8:1} type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder={mode==="register"?"At least 8 characters":"Enter your password"}/></label><button className="primary-btn auth-submit" disabled={busy}>{busy?"Please wait…":mode==="login"?"Sign in":"Create account"} <ArrowRight size={17}/></button></form><div className="auth-switch">{mode==="login"?"New to LifeFlow?":"Already part of LifeFlow?"} <button onClick={()=>setMode(mode==="login"?"register":"login")}>{mode==="login"?"Create an account":"Sign in"}</button></div><div className="auth-security"><ShieldCheck size={15}/> Your information is handled securely.</div></div><div className="auth-right-foot">LIFEFLOW · EVERY DROP MATTERS</div></div>{notice&&<div className={`toast ${notice.type}`}><span>{notice.type==="error"?<AlertCircle size={19}/>:<CheckCircle2 size={19}/>}</span>{notice.message}<button onClick={()=>{}}><X size={15}/></button></div>}</div>; }
export default App;
