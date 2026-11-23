
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

export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!supabase || !id) {
        setError("Connexion indisponible.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        setError("Profil introuvable ou inaccessible.");
      } else {
        setProfile(data as Profile);
      }

      setLoading(false);
    }

    load();
  }, [id]);

  const links = [
    { label: "Instagram", url: profile?.instagram },
    { label: "TikTok", url: profile?.tiktok },
    { label: "LinkedIn", url: profile?.linkedin_url },
    { label: "Site web", url: profile?.website_url },
    { label: "Portfolio", url: profile?.portfolio_url },
    { label: "Behance", url: profile?.behance },
    { label: "YouTube", url: profile?.youtube },
  ].filter((item) => item.url);

  const linkUrl = (url?: string) => {
    if (!url) return "#";
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  const styles: Record<string, React.CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: "#080808",
      color: "#fff",
      fontFamily: "Arial, sans-serif",
      padding: "0 7%",
    },
    nav: {
      height: 80,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid #292929",
    },
    logo: {
      color: "#fff",
      textDecoration: "none",
      fontSize: 28,
      fontWeight: 900,
      letterSpacing: -2,
    },
    container: {
      maxWidth: 850,
      margin: "65px auto",
    },
    hero: {
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 30,
    },
    photo: {
      width: 190,
      height: 230,
      objectFit: "cover",
      borderRadius: 6,
      background: "#222",
    },
    placeholder: {
      width: 190,
      height: 230,
      background: "#222",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 60,
      borderRadius: 6,
    },
    section: {
      marginTop: 55,
      paddingTop: 25,
      borderTop: "1px solid #292929",
    },
    muted: {
      color: "#aaa",
      lineHeight: 1.8,
      whiteSpace: "pre-wrap",
    },
    link: {
      display: "inline-block",
      color: "#fff",
      textDecoration: "none",
      border: "1px solid #444",
      padding: "12px 17px",
      borderRadius: 4,
      margin: "6px",
      fontSize: 13,
    },
    button: {
      display: "inline-block",
      background: "#fff",
      color: "#000",
      padding: "15px 22px",
      borderRadius: 4,
      textDecoration: "none",
      fontWeight: 700,
      marginTop: 30,
    },
  };

  if (loading || error || !profile) {
    return (
      <main style={{ ...styles.page, paddingTop: 100 }}>
        <p>{loading ? "Chargement du profil..." : error}</p>
        <Link href="/" style={{ color: "#fff" }}>
          Retour à FRAME
        </Link>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <nav style={styles.nav}>
        <Link href="/" style={styles.logo}>FRAME.</Link>
        <Link href="/" style={{ color: "#aaa", textDecoration: "none" }}>
          ← Découvrir
        </Link>
      </nav>

      <div style={styles.container}>
        <section style={styles.hero}>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name || "Photo de profil"}
              style={styles.photo}
            />
          ) : (
            <div style={styles.placeholder}>
              {(profile.name || "F").charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <p style={{ color: "#999", letterSpacing: 4, fontSize: 11 }}>
              FRAME TALENT
            </p>
            <h1 style={{ fontSize: 42, margin: "10px 0" }}>
              {profile.name || "Talent FRAME"}
            </h1>
            <p style={{ color: "#ccc" }}>{profile.role}</p>
            <p style={{ color: "#999" }}>
              {profile.city ? `📍 ${profile.city}` : ""}
            </p>
          </div>
        </section>

        <section style={styles.section}>
          <h2>À propos</h2>
          <p style={styles.muted}>
            {profile.bio || "Aucune présentation pour le moment."}
          </p>
        </section>

        {profile.specialties && (
          <section style={styles.section}>
            <h2>Spécialités</h2>
            <p style={styles.muted}>{profile.specialties}</p>
          </section>
        )}

        {profile.experience && (
          <section style={styles.section}>
            <h2>Expérience & projets</h2>
            <p style={styles.muted}>{profile.experience}</p>
          </section>
        )}

        <section style={styles.section}>
          <h2>Réseaux & portfolio</h2>
          {links.length > 0 ? (
            <div style={{ marginTop: 20 }}>
              {links.map((item) => (
                <a
                  key={item.label}
                  href={linkUrl(item.url)}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.link}
                >
                  {item.label} ↗
                </a>
              ))}
            </div>
          ) : (
            <p style={styles.muted}>Aucun lien ajouté pour le moment.</p>
          )}
        </section>

        <Link
          href={`/messages?to=${profile.id}`}
          style={styles.button}
        >
          Contacter ce talent ↗
        </Link>
      </div>

      <footer style={{ textAlign: "center", color: "#666", padding: 30 }}>
        FRAME © 2026 — CONNECT. CREATE. COLLABORATE.
      </footer>
    </main>
  );
}
