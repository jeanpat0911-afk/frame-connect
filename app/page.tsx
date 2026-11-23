
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  name: string;
  role: string;
  city: string;
  bio: string;
  avatar_url?: string;
  instagram?: string;
  tiktok?: string;
  linkedin_url?: string;
  website_url?: string;
  portfolio_url?: string;
  behance?: string;
  youtube?: string;
  specialties?: string;
  experience?: string;
};

const roles = ["Mannequin", "Photographe", "Styliste", "Make-up artist"];

function cleanUrl(value?: string) {
  if (!value?.trim()) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [role, setRole] = useState("Tous");
  const [city, setCity] = useState("");
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [job, setJob] = useState("Mannequin");
  const [town, setTown] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [behance, setBehance] = useState("");
  const [youtube, setYoutube] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [experience, setExperience] = useState("");

  async function loadProfiles() {
    if (!supabase) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Impossible de charger les profils : " + error.message);
      return;
    }

    setProfiles((data || []) as Profile[]);
  }

  async function loadMyProfile(userId: string) {
    if (!supabase) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      setMessage("Erreur de chargement du profil : " + error.message);
      return;
    }

    if (!data) return;

    setName(data.name || "");
    setJob(data.role || "Mannequin");
    setTown(data.city || "");
    setBio(data.bio || "");
    setAvatarUrl(data.avatar_url || "");
    setInstagram(data.instagram || "");
    setTiktok(data.tiktok || "");
    setLinkedin(data.linkedin_url || "");
    setWebsite(data.website_url || "");
    setPortfolio(data.portfolio_url || "");
    setBehance(data.behance || "");
    setYoutube(data.youtube || "");
    setSpecialties(data.specialties || "");
    setExperience(data.experience || "");
  }

  useEffect(() => {
    if (!supabase) {
      setMessage("La connexion Supabase n'est pas configurée.");
      return;
    }

    loadProfiles();

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
          setJob("Mannequin");
          setTown("");
          setBio("");
          setAvatarUrl("");
          setInstagram("");
          setTiktok("");
          setLinkedin("");
          setWebsite("");
          setPortfolio("");
          setBehance("");
          setYoutube("");
          setSpecialties("");
          setExperience("");
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleAuth() {
    if (!supabase) {
      setMessage("Supabase n'est pas configuré.");
      return;
    }

    if (!email.trim() || !password) {
      setMessage("Renseigne ton email et ton mot de passe.");
      return;
    }

    setLoading(true);
    setMessage("");

    const result =
      authMode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (result.data.user && !result.data.session && authMode === "signup") {
      setMessage("Compte créé. Vérifie tes emails pour confirmer ton inscription.");
    } else {
      setUser(result.data.user);
      setMessage("Connexion réussie !");
      if (result.data.user) loadMyProfile(result.data.user.id);
    }
  }

  async function saveProfile() {
    if (!supabase || !user) {
      setMessage("Connecte-toi pour enregistrer ton profil.");
      return;
    }

    if (!name.trim()) {
      setMessage("Ajoute au moins ton nom ou ton nom professionnel.");
      return;
    }

    setLoading(true);
    setMessage("");

    const profileData = {
      id: user.id,
      name: name.trim(),
      role: job,
      city: town.trim(),
      bio: bio.trim(),
      avatar_url: cleanUrl(avatarUrl),
      instagram: instagram.trim(),
      tiktok: tiktok.trim(),
      linkedin_url: cleanUrl(linkedin),
      website_url: cleanUrl(website),
      portfolio_url: cleanUrl(portfolio),
      behance: cleanUrl(behance),
      youtube: cleanUrl(youtube),
      specialties: specialties.trim(),
      experience: experience.trim(),
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(profileData, { onConflict: "id" });

    setLoading(false);

    if (error) {
      setMessage("Erreur : " + error.message);
      return;
    }

    setMessage("Ton profil FRAME a bien été enregistré !");
    await loadProfiles();
  }

  async function requestShooting(receiverId: string) {
    if (!supabase || !user) {
      setMessage("Connecte-toi pour proposer une collaboration.");
      return;
    }

    if (receiverId === user.id) {
      setMessage("Tu ne peux pas t'envoyer une demande à toi-même.");
      return;
    }

    const { error } = await supabase.from("shooting_requests").insert({
      sender_id: user.id,
      receiver_id: receiverId,
      message: "Bonjour, je souhaiterais te proposer une collaboration sur FRAME !",
    });

    setMessage(
      error ? "Erreur : " + error.message : "Demande de collaboration envoyée !"
    );
  }

  const shown = profiles.filter((profile) => {
    const roleMatch = role === "Tous" || profile.role === role;
    const cityMatch = (profile.city || "")
      .toLowerCase()
      .includes(city.toLowerCase());

    return roleMatch && cityMatch;
  });

  return (
    <main>
      <nav>
        <Link href="/" className="logo">
          FRAME<span>.</span>
        </Link>
        <small>THE CREATIVE NETWORK</small>
        <a href="#account">Mon espace ↗</a>
      </nav>

      <section className="hero">
        <p>YOUR NEXT CREATIVE CONNECTION</p>
        <h1>
          Make something
          <br />
          <i>worth seeing.</i>
        </h1>
        <p className="sub">
          La plateforme qui connecte mannequins, photographes et talents créatifs.
        </p>
        <a className="cta" href="#discover">
          Découvrir les profils ↘
        </a>
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
            <option value="Tous">Tous les talents</option>
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            placeholder="Rechercher une ville..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <div className="cards">
          {shown.map((profile) => (
            <article key={profile.id}>
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="talent-photo"
                />
              ) : (
                <div className="avatar">
                  {profile.role === "Photographe" ? "◉" : "✦"}
                </div>
              )}

              <small>{(profile.role || "Talent").toUpperCase()}</small>
              <h3>{profile.name || "Talent FRAME"}</h3>
              <p>{profile.city}</p>
              <p className="bio">{profile.bio}</p>

              <div className="talent-links">
                {profile.instagram && (
                  <a href={cleanUrl(profile.instagram)} target="_blank" rel="noreferrer">
                    Instagram ↗
                  </a>
                )}
                {profile.portfolio_url && (
                  <a href={cleanUrl(profile.portfolio_url)} target="_blank" rel="noreferrer">
                    Portfolio ↗
                  </a>
                )}
              </div>

              <Link className="profile-link" href={`/profile/${profile.id}`}>
                Voir le profil complet ↗
              </Link>

              <button onClick={() => requestShooting(profile.id)}>
                Proposer un shooting ↗
              </button>
            </article>
          ))}
        </div>

        {shown.length === 0 && (
          <p className="empty">
            Aucun profil pour le moment. Crée le premier !
          </p>
        )}
      </section>

      <section id="account">
        <div className="heading">
          <div>
            <small>02 — JOIN FRAME</small>
            <h2>Ton espace</h2>
          </div>
        </div>

        {!user ? (
          <div className="auth">
            <div className="auth-switch">
              <button
                type="button"
                className={authMode === "signup" ? "active" : "secondary"}
                onClick={() => setAuthMode("signup")}
              >
                Créer un compte
              </button>
              <button
                type="button"
                className={authMode === "login" ? "active" : "secondary"}
                onClick={() => setAuthMode("login")}
              >
                Se connecter
              </button>
            </div>

            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Mot de passe (6 caractères minimum)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleAuth} disabled={loading}>
              {loading
                ? "Chargement..."
                : authMode === "signup"
                ? "Créer mon compte"
                : "Se connecter"}
            </button>
          </div>
        ) : (
          <div className="profile">
            <p>Connecté : {user.email}</p>

            <h3>Informations principales</h3>

            <input
              placeholder="Nom ou nom professionnel *"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <select value={job} onChange={(e) => setJob(e.target.value)}>
              {roles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <input
              placeholder="Ville"
              value={town}
              onChange={(e) => setTown(e.target.value)}
            />

            <textarea
              placeholder="Présente-toi et décris ton univers..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <input
              placeholder="URL de ta photo de profil"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />

            <h3>Réseaux sociaux</h3>

            <input
              placeholder="Instagram (ex : instagram.com/toncompte)"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />

            <input
              placeholder="TikTok"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
            />

            <input
              placeholder="LinkedIn"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />

            <input
              placeholder="Behance"
              value={behance}
              onChange={(e) => setBehance(e.target.value)}
            />

            <input
              placeholder="YouTube"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
            />

            <h3>Site & portfolio</h3>

            <input
              placeholder="Site web"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />

            <input
              placeholder="Lien vers ton portfolio"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
            />

            <h3>Ton univers professionnel</h3>

            <input
              placeholder="Spécialités (ex : éditorial, défilé, studio...)"
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
            />

            <textarea
              placeholder="Expérience, références, projets..."
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />

            <button onClick={saveProfile} disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer mon profil"}
            </button>

            <button
              className="secondary"
              onClick={() => supabase?.auth.signOut()}
            >
              Déconnexion
            </button>

            <p className="profile-hint">
              Après enregistrement, ton profil pourra être consulté depuis la
              page Découvrir.
            </p>
          </div>
        )}

        {message && <p className="notice">{message}</p>}
      </section>

      <footer>FRAME © 2026 — CONNECT. CREATE. COLLABORATE.</footer>
    </main>
    const [introVisible, setIntroVisible] = useState(true);

useEffect(() => {
  const timer = window.setTimeout(() => {
    setIntroVisible(false);
  }, 1900);

  return () => window.clearTimeout(timer);
}, []);
  );
}
