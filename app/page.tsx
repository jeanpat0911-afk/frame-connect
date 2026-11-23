
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  name: string;
  role: string;
  city: string;
  bio: string;
  instagram?: string;
  tiktok?: string;
  website?: string;
  portfolio_url?: string;
  linkedin?: string;
  avatar_url?: string;
};

function cleanUrl(value: string) {
  if (!value.trim()) return "";
  const url = /^https?:\/\//i.test(value.trim())
    ? value.trim()
    : `https://${value.trim()}`;
  return url;
}

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [role, setRole] = useState("Tous");
  const [city, setCity] = useState("");
  const [user, setUser] = useState<any>(null);
  const [msg, setMsg] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [job, setJob] = useState("Mannequin");
  const [town, setTown] = useState("");
  const [bio, setBio] = useState("");

  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [website, setWebsite] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [avatar, setAvatar] = useState("");

  async function loadProfiles() {
    if (!supabase) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    setProfiles((data || []) as Profile[]);
  }

  async function loadMyProfile(userId: string) {
    if (!supabase) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!data) return;

    setName(data.name || "");
    setJob(data.role || "Mannequin");
    setTown(data.city || "");
    setBio(data.bio || "");
    setInstagram(data.instagram || "");
    setTiktok(data.tiktok || "");
    setWebsite(data.website || "");
    setPortfolio(data.portfolio_url || "");
    setLinkedin(data.linkedin || "");
    setAvatar(data.avatar_url || "");
  }

  useEffect(() => {
    loadProfiles();

    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) loadMyProfile(data.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser) {
          loadMyProfile(currentUser.id);
        } else {
          setName("");
          setTown("");
          setBio("");
          setInstagram("");
          setTiktok("");
          setWebsite("");
          setPortfolio("");
          setLinkedin("");
          setAvatar("");
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function auth() {
    if (!supabase) {
      setMsg("Configuration Supabase manquante.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMsg(error.message);
      return;
    }

    if (data.user) {
      setUser(data.user);
      setMsg("Compte créé. Vérifie ton email si nécessaire.");
    }
  }

  async function save() {
    if (!supabase || !user) {
      setMsg("Connecte-toi pour enregistrer ton profil.");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      name,
      role: job,
      city: town,
      bio,
      instagram,
      tiktok,
      website,
      portfolio_url: portfolio,
      linkedin,
      avatar_url: avatar,
    });

    if (error) {
      setMsg("Erreur : " + error.message);
      return;
    }

    setMsg("Ton profil FRAME a bien été enregistré !");
    loadProfiles();
  }

  async function request(id: string) {
    if (!supabase || !user) {
      setMsg("Connecte-toi pour contacter ce profil.");
      return;
    }

    if (id === user.id) {
      setMsg("C'est ton propre profil !");
      return;
    }

    const { error } = await supabase
      .from("shooting_requests")
      .insert({
        sender_id: user.id,
        receiver_id: id,
        message: "Bonjour, intéressé(e) par une collaboration !",
      });

    setMsg(error ? error.message : "Demande de shooting envoyée !");
  }

  const shown = profiles.filter(
    (p) =>
      (role === "Tous" || p.role === role) &&
      (p.city || "").toLowerCase().includes(city.toLowerCase())
  );

  return (
    <main>
      <nav>
        <b>FRAME<span>.</span></b>
        <small>THE CREATIVE NETWORK</small>
        <a href="#account">Mon profil</a>
        {user && <a href="/messages">Messages</a>}
      </nav>

      <section className="hero">
        <p>YOUR NEXT CREATIVE CONNECTION</p>
        <h1>Make something<br /><i>worth seeing.</i></h1>
        <p className="sub">
          La plateforme qui connecte mannequins, photographes et talents créatifs.
        </p>
        <a className="cta" href="#discover">Découvrir les profils ↘</a>
      </section>

      <section id="discover">
        <div className="heading">
          <div>
            <small>01 — DISCOVER</small>
            <h2>Les talents</h2>
          </div>
          <span>{shown.length} PROFILS</span>
        </div>

        <div className="filters">
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Tous</option>
            <option>Mannequin</option>
            <option>Photographe</option>
            <option>Styliste</option>
            <option>Make-up artist</option>
          </select>
          <input
            placeholder="Filtrer par ville"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <div className="cards">
          {shown.map((p) => (
            <article key={p.id}>
              {p.avatar_url ? (
                <img
                  src={cleanUrl(p.avatar_url)}
                  alt={`Photo de ${p.name}`}
                  className="avatar"
                  style={{
                    width: "100%",
                    height: 220,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              ) : (
                <div className="avatar">
                  {p.role === "Photographe" ? "◉" : p.role === "Mannequin" ? "✳" : "✦"}
                </div>
              )}

              <small>{(p.role || "Talent").toUpperCase()}</small>
              <h3>{p.name || "Talent FRAME"}</h3>
              <p>{p.city}</p>
              <p className="bio">{p.bio}</p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "12px 0" }}>
                {p.instagram && <a href={cleanUrl(p.instagram)} target="_blank" rel="noreferrer">Instagram ↗</a>}
                {p.tiktok && <a href={cleanUrl(p.tiktok)} target="_blank" rel="noreferrer">TikTok ↗</a>}
                {p.website && <a href={cleanUrl(p.website)} target="_blank" rel="noreferrer">Site web ↗</a>}
                {p.portfolio_url && <a href={cleanUrl(p.portfolio_url)} target="_blank" rel="noreferrer">Portfolio ↗</a>}
                {p.linkedin && <a href={cleanUrl(p.linkedin)} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
              </div>

              <button onClick={() => request(p.id)}>
                Proposer un shooting ↗
              </button>
            </article>
          ))}
        </div>

        {shown.length === 0 && (
          <p className="empty">Aucun profil pour le moment. Crée le premier !</p>
        )}
      </section>

      <section id="account">
        <div className="heading">
          <div>
            <small>02 — YOUR SPACE</small>
            <h2>Ton profil FRAME</h2>
          </div>
        </div>

        {!user ? (
          <div className="auth">
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              placeholder="Mot de passe (6 caractères min.)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={auth}>Créer mon compte</button>
          </div>
        ) : (
          <div className="profile">
            <p>Connecté : {user.email}</p>

            <h3>Informations personnelles</h3>
            <input
              placeholder="Nom affiché"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <select value={job} onChange={(e) => setJob(e.target.value)}>
              <option>Mannequin</option>
              <option>Photographe</option>
              <option>Styliste</option>
              <option>Make-up artist</option>
            </select>

            <input
              placeholder="Ville"
              value={town}
              onChange={(e) => setTown(e.target.value)}
            />

            <textarea
              placeholder="Présente-toi et décris ton univers"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <h3>Photo de profil</h3>
            <input
              placeholder="Lien URL de ta photo"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />

            <h3>Mes réseaux sociaux</h3>
            <input
              placeholder="Lien Instagram ou @identifiant"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
            <input
              placeholder="Lien TikTok ou @identifiant"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
            />
            <input
              placeholder="Lien LinkedIn"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />

            <h3>Mon univers professionnel</h3>
            <input
              placeholder="Site web personnel"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <input
              placeholder="Lien vers mon portfolio"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
            />

            <button onClick={save}>Enregistrer mon profil</button>

            <button
              className="secondary"
              onClick={() => supabase?.auth.signOut()}
            >
              Déconnexion
            </button>
          </div>
        )}

        {msg && <p className="notice">{msg}</p>}
      </section>

      <footer>FRAME © 2026 — CONNECT. CREATE. COLLABORATE.</footer>
    </main>
  );
}

