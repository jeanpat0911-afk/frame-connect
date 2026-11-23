
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

function makeUrl(value?: string) {
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export default function PublicProfile() {
  const params = useParams();
  const id = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!supabase || !id) {
        setError("Impossible de charger le profil.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        setError("Ce profil n'existe pas ou n'est pas accessible.");
      } else {
        setProfile(data as Profile);
      }

      setLoading(false);
    }

    loadProfile();
  }, [id]);

  if (loading) {
    return <main style={styles.page}>Chargement du profil...</main>;
  }

  if (error || !profile) {
    return (
      <main style={styles.page}>
        <a href="/" style={styles.back}>← Retour à FRAME</a>
        <h1>Profil introuvable</h1>
        <p>{error}</p>
      </main>
    );
  }

  const socials = [
    { label: "INSTAGRAM", value: profile.instagram },
    { label: "TIKTOK", value: profile.tiktok },
    { label: "LINKEDIN", value: profile.linkedin },
    { label: "SITE WEB", value: profile.website },
    { label: "PORTFOLIO", value: profile.portfolio_url },
  ].filter((item) => item.value);

  return (
    <main style={styles.page}>
      <nav style={styles.nav}>
        <a href="/" style={styles.logo}>FRAME<span>.</span></a>
        <a href="/#discover" style={styles.back}>DÉCOUVRIR LES TALENTS ↗</a>
      </nav>

      <section style={styles.hero}>
        <div style={styles.photoContainer}>
          {profile.avatar_url ? (
            <img
              src={makeUrl(profile.avatar_url)}
              alt={profile.name}
              style={styles.photo}
            />
          ) : (
            <div style={styles.noPhoto}>FRAME</div>
          )}
        </div>

        <div style={styles.info}>
          <p style={styles.eyebrow}>FRAME MEMBER — {profile.role}</p>
          <h1 style={styles.name}>{profile.name || "Talent FRAME"}</h1>
          <p style={styles.city}>{profile.city || "Ville non renseignée"}</p>

          <div style={styles.line} />

          <h2 style={styles.sectionTitle}>À PROPOS</h2>
          <p style={styles.bio}>
            {profile.bio || "Ce talent n'a pas encore ajouté de présentation."}
          </p>

          <div style={styles.line} />

          <h2 style={styles.sectionTitle}>CONNECT</h2>
          {socials.length > 0 ? (
            <div style={styles.socials}>
              {socials.map((item) => (
                <a
                  key={item.label}
                  href={makeUrl(item.value)}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.socialLink}
                >
                  {item.label} ↗
                </a>
              ))}
            </div>
          ) : (
            <p style={styles.muted}>Aucun réseau ajouté pour le moment.</p>
          )}

          <a
            href={`/messages?to=${profile.id}`}
            style={styles.contact}
          >
            ENVOYER UN MESSAGE ↗
          </a>
        </div>
      </section>

      <footer style={styles.footer}>
        FRAME © 2026 — CONNECT. CREATE. COLLABORATE.
      </footer>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "#f5f4f0",
    color: "#171717",
    padding: "30px 7%",
    fontFamily: "Arial, sans-serif",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #ccc",
    paddingBottom: 22,
    marginBottom: 55,
  },
  logo: {
    fontSize: 28,
    fontWeight: 900,
    letterSpacing: "-2px",
    color: "#171717",
    textDecoration: "none",
  },
  back: {
    color: "#171717",
    fontSize: 11,
    letterSpacing: 1,
    textDecoration: "none",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    gap: 55,
    alignItems: "center",
    maxWidth: 1100,
    margin: "0 auto",
  },
  photoContainer: {
    width: "100%",
    minHeight: 480,
    background: "#dedbd4",
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: 560,
    objectFit: "cover",
    display: "block",
  },
  noPhoto: {
    minHeight: 480,
    display: "grid",
    placeItems: "center",
    fontSize: 50,
    fontWeight: 900,
    letterSpacing: 8,
    color: "#aaa69e",
  },
  info: {
    padding: "25px 0",
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    color: "#777",
  },
  name: {
    fontSize: "clamp(42px, 7vw, 76px)",
    lineHeight: 0.95,
    letterSpacing: "-4px",
    margin: "20px 0 12px",
    textTransform: "uppercase",
  },
  city: {
    fontSize: 14,
    color: "#777",
  },
  line: {
    height: 1,
    background: "#ccc",
    margin: "30px 0",
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 15,
  },
  bio: {
    fontSize: 16,
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
  },
  socials: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
  },
  socialLink: {
    border: "1px solid #aaa",
    padding: "12px 15px",
    color: "#171717",
    fontSize: 11,
    letterSpacing: 1,
    textDecoration: "none",
  },
  muted: {
    color: "#777",
    fontSize: 13,
  },
  contact: {
    display: "inline-block",
    marginTop: 35,
    padding: "18px 25px",
    background: "#171717",
    color: "#fff",
    textDecoration: "none",
    fontSize: 12,
    letterSpacing: 1,
  },
  footer: {
    borderTop: "1px solid #ccc",
    marginTop: 80,
    paddingTop: 25,
    fontSize: 10,
    letterSpacing: 2,
    color: "#777",
  },
};
