
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  name?: string;
  role?: string;
  city?: string;
  bio?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  website?: string;
  portfolio?: string;
  avatar_url?: string;
};

export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!supabase || !id) {
        setError("Connexion indisponible.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("Profil introuvable ou inaccessible.");
      } else {
        setProfile(data);
      }

      setLoading(false);
    }

    loadProfile();
  }, [id]);

  const socialLink = (url?: string) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  if (loading) {
    return (
      <main style={styles.center}>
        Chargement du profil...
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main style={styles.center}>
        <h2>{error || "Profil introuvable"}</h2>
        <Link href="/" style={styles.back}>Retour à FRAME</Link>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <nav style={styles.nav}>
        <Link href="/" style={styles.logo}>FRAME<span>.</span></Link>
        <Link href="/" style={styles.back}>← Découvrir les talents</Link>
      </nav>

      <section style={styles.container}>
        <div style={styles.hero}>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name || "Photo de profil"}
              style={styles.avatar}
            />
          ) : (
            <div style={styles.placeholder}>
              {(profile.name || "F").charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <p style={styles.eyebrow}>FRAME TALENT</p>
            <h1 style={styles.name}>
              {profile.name || "Talent FRAME"}
            </h1>
            <p style={styles.role}>{profile.role || "Créatif"}</p>
            {profile.city && <p style={styles.city}>📍 {profile.city}</p>}
          </div>
        </div>

        <div style={styles.section}>
          <h2>À propos</h2>
          <p style={styles.bio}>
            {profile.bio || "Ce talent n'a pas encore ajouté de présentation."}
          </p>
        </div>

        <div style={styles.section}>
          <h2>Réseaux & portfolio</h2>
          <div style={styles.links}>
            {profile.instagram && (
              <a href={socialLink(profile.instagram)} target="_blank" rel="noreferrer" style={styles.social}>
                Instagram ↗
              </a>
            )}
            {profile.tiktok && (
              <a href={socialLink(profile.tiktok)} target="_blank" rel="noreferrer" style={styles.social}>
                TikTok ↗
              </a>
            )}
            {profile.linkedin && (
              <a href={socialLink(profile.linkedin)} target="_blank" rel="noreferrer" style={styles.social}>
                LinkedIn ↗
              </a>
            )}
            {profile.website && (
              <a href={socialLink(profile.website)} target="_blank" rel="noreferrer" style={styles.social}>
                Site web ↗
              </a>
            )}
            {profile.portfolio && (
              <a href={socialLink(profile.portfolio)} target="_blank" rel="noreferrer" style={styles.social}>
                Portfolio ↗
              </a>
            )}
            {!profile.instagram && !profile.tiktok && !profile.linkedin && !profile.website && !profile.portfolio && (
              <p>Aucun lien ajouté pour le moment.</p>
            )}
          </div>
        </div>

        <div style={styles.actions}>
          <Link href={`/messages?to=${profile.id}`} style={styles.contact}>
            Contacter ce talent ↗
          </Link>
          <Link href="/" style={styles.secondary}>
            Retour à la découverte
          </Link>
        </div>
      </section>

      <footer style={styles.footer}>FRAME © 2026 — Creative connections.</footer>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#080808",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
    padding: "0 7%",
  },
  nav: {
    height: 85,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #252525",
  },
  logo: {
    fontSize: 27,
    fontWeight: 900,
    letterSpacing: -2,
    color: "white",
    textDecoration: "none",
  },
  back: {
    color: "#aaa",
    textDecoration: "none",
    fontSize: 13,
  },
  container: {
    maxWidth: 850,
    margin: "75px auto",
  },
  hero: {
    display: "flex",
    alignItems: "center",
    gap: 35,
    flexWrap: "wrap",
  },
  avatar: {
    width: 190,
    height: 230,
    objectFit: "cover",
    borderRadius: 8,
    background: "#222",
  },
  placeholder: {
    width: 190,
    height: 230,
    borderRadius: 8,
    background: "#222",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 65,
    color: "#888",
  },
  eyebrow: {
    color: "#aaa",
    letterSpacing: 4,
    fontSize: 11,
  },
  name: {
    fontSize: 43,
    margin: "12px 0",
    letterSpacing: -2,
  },
  role: {
    color: "#ccc",
    fontSize: 17,
  },
  city: {
    color: "#999",
    fontSize: 14,
  },
  section: {
    marginTop: 65,
    borderTop: "1px solid #292929",
    paddingTop: 25,
  },
  bio: {
    color: "#bbb",
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
  },
  links: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 20,
  },
  social: {
    color: "white",
    border: "1px solid #444",
    padding: "13px 19px",
    borderRadius: 4,
    textDecoration: "none",
    fontSize: 13,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 15,
    marginTop: 55,
  },
  contact: {
    background: "white",
    color: "black",
    padding: "16px 24px",
    textDecoration: "none",
    fontWeight: 700,
    borderRadius: 4,
  },
  secondary: {
    color: "white",
    padding: "16px 20px",
    border: "1px solid #444",
    textDecoration: "none",
    borderRadius: 4,
  },
  footer: {
    borderTop: "1px solid #252525",
    padding: "30px 0",
    color: "#666",
    fontSize: 12,
    textAlign: "center",
  },
  center: {
    minHeight: "100vh",
    background: "#080808",
    color: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    fontFamily: "Arial, sans-serif",
  },
};
