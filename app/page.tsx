 "use client";
import {useEffect,useState} from "react";
import {supabase} from "@/lib/supabase";
type Profile={id:string;name:string;role:string;city:string;bio:string;instagram?:string;};
export default function Home(){
 const [profiles,setProfiles]=useState<Profile[]>([]);
 const [role,setRole]=useState("Tous"); const [city,setCity]=useState("");
 const [user,setUser]=useState<any>(null); const [msg,setMsg]=useState("");
 const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
 const [name,setName]=useState(""); const [job,setJob]=useState("Mannequin"); const [town,setTown]=useState("");
 const [bio,setBio]=useState("");
 async function load(){if(!supabase)return; const {data}=await supabase.from("profiles").select("*").order("created_at",{ascending:false});setProfiles(data||[]);}
 useEffect(()=>{load();if(supabase){supabase.auth.getUser().then(({data})=>setUser(data.user));supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null));}},[]);
 async function auth(){if(!supabase){setMsg("Ajoute les clés Supabase dans .env.local.");return;}const {data,error}=await supabase.auth.signUp({email,password});if(error){setMsg(error.message);return;}if(data.user){setUser(data.user);setMsg("Compte créé. Vérifie ton email si la confirmation est activée.");}}
 async function save(){if(!supabase||!user)return;const {error}=await supabase.from("profiles").upsert({id:user.id,name,role:job,city:town,bio});setMsg(error?.message||"Profil enregistré.");load();}
 async function request(id:string){if(!supabase||!user){setMsg("Connecte-toi pour contacter ce profil.");return;}const {error}=await supabase.from("shooting_requests").insert({sender_id:user.id,receiver_id:id,message:"Bonjour, intéressé(e) par une collaboration !"});setMsg(error?.message||"Demande envoyée.");}
 const shown=profiles.filter(p=>(role==="Tous"||p.role===role)&&p.city.toLowerCase().includes(city.toLowerCase()));
 return <main><nav><b>FRAME<span>.</span></b><small>THE CREATIVE NETWORK</small><a href="#account">Connexion / profil</a></nav>
 <section className="hero"><p>YOUR NEXT CREATIVE CONNECTION</p><h1>Make something<br/><i>worth seeing.</i></h1><p className="sub">La plateforme qui connecte mannequins, photographes et talents créatifs.</p><a className="cta" href="#discover">Découvrir les profils ↘</a></section>
 <section id="discover"><div className="heading"><div><small>01 — DISCOVER</small><h2>Les talents</h2></div><span>{shown.length} PROFILS</span></div>
 <div className="filters"><select value={role} onChange={e=>setRole(e.target.value)}><option>Tous</option><option>Mannequin</option><option>Photographe</option><option>Styliste</option><option>Make-up artist</option></select><input placeholder="Filtrer par ville" value={city} onChange={e=>setCity(e.target.value)}/></div>
 <div className="cards">{shown.map(p=><article key={p.id}><div className="avatar">{p.role==="Photographe"?"◉":p.role==="Mannequin"?"✳":"✦"}</div><small>{p.role.toUpperCase()}</small><h3>{p.name}</h3><p>{p.city}</p><p className="bio">{p.bio}</p><button onClick={()=>request(p.id)}>Proposer un shooting ↗</button></article>)}</div>
 {shown.length===0&&<p className="empty">Aucun profil pour le moment. Crée le premier !</p>}</section>
 <section id="account"><div className="heading"><div><small>02 — JOIN FRAME</small><h2>Ton espace</h2></div></div>
 {!user?<div className="auth"><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder="Mot de passe (6 caractères min.)" type="password" value={password} onChange={e=>setPassword(e.target.value)}/><button onClick={auth}>Créer mon compte</button></div>:<div className="profile"><p>Connecté : {user.email}</p><input placeholder="Nom affiché" value={name} onChange={e=>setName(e.target.value)}/><select value={job} onChange={e=>setJob(e.target.value)}><option>Mannequin</option><option>Photographe</option><option>Styliste</option><option>Make-up artist</option></select><input placeholder="Ville" value={town} onChange={e=>setTown(e.target.value)}/><textarea placeholder="Présente-toi et décris ton univers" value={bio} onChange={e=>setBio(e.target.value)}/><button onClick={save}>Enregistrer mon profil</button><button className="secondary" onClick={()=>supabase?.auth.signOut()}>Déconnexion</button></div>}
 {msg&&<p className="notice">{msg}</p>}</section><footer>FRAME © 2026 — CONNECT. CREATE. COLLABORATE.</footer></main>
}
