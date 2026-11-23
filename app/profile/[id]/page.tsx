
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

type Photo = {
  id: string;
  user_id: string;
  image_url: string;
  storage_path: string;
};

export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadPhotos() {
    if (!supabase) return;

    const { data, error } = await supabase
      .from("profile_photos")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      setError("Impossible de charger le portfolio : " + error.message);
      return;
    }

    setPhotos((data || []) as Photo[]);
  }

  useEffect(() => {
    async function load() {
      if (!supabase || !id) {
        setError("Connexion indisponible.");
        setLoading(false);
        return;
      }

      const [{ data: profileData, error: profileError }, { data: authData }] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
          supabase.auth.getUser(),
        ]);

      if (profileError || !profileData) {
        setError("Profil introuvable ou inaccessible.");
        setLoading(false);
        return;
      }

      setProfile(profileData as Profile);
      setCurrentUser(authData.user);

      const { data: photoData, error: photoError } = await supabase
        .from("profile_photos")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      if (photoError) {
        setError("Erreur portfolio : " + photoError.message);
      } else {
        setPhotos((photoData || []) as Photo[]);
      }

      setLoading(false);
    }

    load();
  }, [id]);

  async function uploadPhotos(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);

    if (!supabase || !currentUser || currentUser.id !== id) {
      setNotice("Connecte-toi avec le compte propriétaire du profil.");
      return;
    }

    if (files.length === 0) return;

    if (files.length + photos.length > 30) {
      setNotice("Maximum 30 photos dans ton portfolio.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setNotice("");

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setNotice("Seules les images sont acceptées.");
        continue;
      }

      if (file.size > 8 * 1024 * 1024) {
        setNotice(`${file.name} dépasse la limite de 8 Mo.`);
        continue;
      }

      const extension = file.name.split(".").pop() || "jpg";
      const path = `${currentUser.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        setNotice("Erreur d'envoi : " + uploadError.message);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("portfolio")
        .getPublicUrl(path);

      const { error: insertError } = await supabase
        .from("profile_photos")
        .insert({
          user_id: currentUser.id,
          image_url: urlData.publicUrl,
          storage_path: path,
        });

      if (insertError) {
        await supabase.storage.from("portfolio").remove([path]);
        setNotice("Erreur d'enregistrement : " + insertError.message);
      }
    }

    await loadPhotos();
    setUploading(false);
    event.target.value = "";
    setNotice("Importation terminée.");
  }

  async function deletePhoto(photo: Photo) {
    if (!supabase || !currentUser || currentUser.id !== id) return;

    const confirmed = window.confirm("Supprimer définitivement cette photo ?");
    if (!confirmed) return;

    const { error: storageError } = await supabase.storage
      .from("portfolio")
      .remove([photo.storage_path]);

    if (storageError) {
      setNotice("Erreur de suppression : " + storageError.message);
      return;
    }

    const { error: dbError } = await supabase
      .from("profile_photos")
      .delete()
      .eq("id", photo.id)
      .eq("user_id", currentUser.id);

    if (dbError) {
      setNotice("Erreur : " + dbError.message);
      return;
    }

    setPhotos((previous) => previous.filter((item) => item.id !== photo.id));
    setNotice("Photo supprimée.");
  }

  const links = [
    { label: "Instagram", url: profile?.instagram },
    { label: "TikTok", url: profile?.tiktok },
    { label: "LinkedIn", url: profile?.linkedin_url },
    { label: "Site web", url: profile?.website_url },
    { label: "Portfolio externe", url: profile?.portfolio_url },
    { label: "Behance", url: profile?.behance },
    { label: "YouTube", url: profile?.youtube },
  ].filter((item) => item.url);

  const linkUrl = (url?: string) => {
    if (!url) return "#";
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  if (loading) {
    return <main className="page">Chargement du profil...</main>;
  }

  if (error && !profile) {
    return (
      <main className="page">
        <h2>{error}</h2>
        <Link href="/">Retour à FRAME</Link>
      </main>
    );
  }

  if (!profile) return null;

  const isOwner = currentUser?.id === profile.id;

  return (
    <main className="page">
      <nav className="nav">
        <Link href="/" className="logo">FRAME.</Link>
        <Link href="/">← Découvrir</Link>
      </nav>

      <div className="container">
        <section className="hero">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name || "Photo de profil"}
              className="avatar"
            />
          ) : (
            <div className="placeholder">
              {(profile.name || "F").charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <p className="eyebrow">FRAME TALENT</p>
            <h1>{profile.name || "Talent FRAME"}</h1>
            <p>{profile.role}</p>
            <p className="muted">{profile.city && `📍 ${profile.city}`}</p>
          </div>
        </section>

        <section className="section">
          <h2>À propos</h2>
          <p className="muted">{profile.bio || "Aucune présentation."}</p>
        </section>

        {profile.specialties && (
          <section className="section">
            <h2>Spécialités</h2>
            <p className="muted">{profile.specialties}</p>
          </section>
        )}

        {profile.experience && (
          <section className="section">
            <h2>Expérience & projets</h2>
            <p className="muted">{profile.experience}</p>
          </section>
        )}

        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">PORTFOLIO</p>
              <h2>Galerie photo</h2>
            </div>
            <span>{photos.length} / 30</span>
          </div>

          {isOwner && (
            <label className="upload">
              {uploading ? "Importation en cours..." : "+ Ajouter des photos"}
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={uploadPhotos}
                hidden
              />
            </label>
          )}

          {notice && <p className="notice">{notice}</p>}

          <div className="gallery">
            {photos.map((photo) => (
              <div className="photo-card" key={photo.id}>
                <img src={photo.image_url} alt="Photo du portfolio" />
                {isOwner && (
                  <button
                    className="delete"
                    onClick={() => deletePhoto(photo)}
                    aria-label="Supprimer cette photo"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {photos.length === 0 && (
            <p className="muted">
              {isOwner
                ? "Ajoute tes premières photos pour construire ton portfolio."
                : "Ce talent n'a pas encore ajouté de photos."}
            </p>
          )}
        </section>

        <section className="section">
          <h2>Réseaux & liens</h2>
          <div className="links">
            {links.map((item) => (
              <a
                key={item.label}
                href={linkUrl(item.url)}
                target="_blank"
                rel="noreferrer"
              >
                {item.label} ↗
              </a>
            ))}
          </div>
        </section>

        <Link className="contact" href={`/messages?to=${profile.id}`}>
          Contacter ce talent ↗
        </Link>
      </div>

      <footer>FRAME © 2026 — CONNECT. CREATE. COLLABORATE.</footer>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #080808;
          color: white;
          padding: 0 7%;
          font-family: Arial, sans-serif;
        }
        .nav {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #292929;
        }
        .nav a { color: #aaa; text-decoration: none; }
        .nav .logo {
          color: white;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -2px;
        }
        .container { max-width: 900px; margin: 65px auto; }
        .hero { display: flex; align-items: center; gap: 30px; flex-wrap: wrap; }
        .avatar, .placeholder {
          width: 190px;
          height: 230px;
          object-fit: cover;
          border-radius: 5px;
          background: #222;
        }
        .placeholder {
          display: grid;
          place-items: center;
          font-size: 60px;
        }
        h1 { font-size: clamp(32px, 6vw, 48px); margin: 10px 0; }
        h2 { font-size: 24px; }
        .eyebrow { color: #999; font-size: 11px; letter-spacing: 3px; }
        .muted { color: #aaa; line-height: 1.8; white-space: pre-wrap; }
        .section { margin-top: 55px; padding-top: 25px; border-top: 1px solid #292929; }
        .section-heading { display: flex; justify-content: space-between; align-items: center; }
        .section-heading span { color: #999; font-size: 13px; }
        .upload {
          display: inline-block;
          margin: 18px 0;
          background: white;
          color: black;
          padding: 14px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          font-size: 13px;
        }
        .gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 14px;
          margin-top: 20px;
        }
        .photo-card { position: relative; aspect-ratio: 3 / 4; background: #1c1c1c; overflow: hidden; }
        .photo-card img { width: 100%; height: 100%; object-fit: cover; }
        .delete {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          border: 0;
          border-radius: 50%;
          background: white;
          color: black;
          font-size: 22px;
          cursor: pointer;
        }
        .links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
        .links a {
          border: 1px solid #444;
          padding: 12px 16px;
          color: white;
          text-decoration: none;
          font-size: 13px;
        }
        .contact {
          display: inline-block;
          margin-top: 35px;
          padding: 15px 22px;
          background: white;
          color: black;
          text-decoration: none;
          font-weight: bold;
        }
        .notice { color: #ddd; font-size: 13px; }
        footer { text-align: center; color: #666; padding: 30px 0; font-size: 12px; }
        @media (max-width: 600px) {
          .page { padding: 0 5%; }
          .avatar, .placeholder { width: 130px; height: 160px; }
          .gallery { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
      `}</style>
    </main>
  );
}
