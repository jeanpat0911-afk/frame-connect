
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
};

export default function MessagesPage() {
  const client = supabase;

  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      if (!client) return;

      const { data, error } = await client.auth.getUser();

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        setUserId(data.user.id);
      }
    }

    init();
  }, []);

  async function loadMessages(id: string, other: string) {
    if (!client) return;

    const { data, error } = await client
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${id},receiver_id.eq.${other}),and(sender_id.eq.${other},receiver_id.eq.${id})`
      )
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
      return;
    }

    setMessages(data || []);
  }

  useEffect(() => {
    if (!client || !userId || !receiverId) return;

    loadMessages(userId, receiverId);

    const channel = client
      .channel("frame-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          loadMessages(userId, receiverId);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [userId, receiverId]);

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!client || !content.trim() || !userId || !receiverId) {
      setError("Connecte-toi et renseigne l'identifiant du destinataire.");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await client.from("messages").insert({
      sender_id: userId,
      receiver_id: receiverId.trim(),
      content: content.trim(),
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setContent("");
    await loadMessages(userId, receiverId);
  }

  if (!client) {
    return (
      <main style={{ padding: 40, color: "white" }}>
        <h1>FRAME Messages</h1>
        <p>Configuration Supabase manquante.</p>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: 850,
        margin: "50px auto",
        padding: 20,
        color: "white",
        minHeight: "80vh",
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>
        FRAME Messages
      </h1>

      <p style={{ color: "#999", marginBottom: 25 }}>
        Connecte-toi avec les talents de la communauté.
      </p>

      {!userId && (
        <p style={{ color: "#ffb86b" }}>
          Connecte-toi pour utiliser la messagerie.
        </p>
      )}

      <label htmlFor="receiver">
        Identifiant du destinataire
      </label>

      <input
        id="receiver"
        value={receiverId}
        onChange={(e) => setReceiverId(e.target.value)}
        placeholder="Colle l'identifiant UUID du destinataire"
        style={{
          width: "100%",
          padding: 14,
          margin: "10px 0 20px",
          borderRadius: 8,
          color: "#111",
        }}
      />

      <section
        style={{
          background: "#171717",
          padding: 20,
          minHeight: 300,
          maxHeight: 500,
          overflowY: "auto",
          borderRadius: 12,
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              textAlign:
                message.sender_id === userId ? "right" : "left",
              margin: "12px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                background:
                  message.sender_id === userId ? "#7546ff" : "#333",
                padding: "12px 16px",
                borderRadius: 14,
                maxWidth: "80%",
                overflowWrap: "anywhere",
              }}
            >
              {message.content}
            </span>
          </div>
        ))}

        {!messages.length && (
          <p style={{ color: "#999" }}>
            Aucun message pour le moment.
          </p>
        )}
      </section>

      <form
        onSubmit={sendMessage}
        style={{
          display: "flex",
          gap: 10,
          marginTop: 15,
        }}
      >
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écris ton message..."
          style={{
            flex: 1,
            minWidth: 0,
            padding: 14,
            borderRadius: 8,
            color: "#111",
          }}
        />

        <button
          type="submit"
          disabled={loading || !userId || !receiverId.trim()}
          style={{
            padding: "12px 20px",
            borderRadius: 8,
            background: "#7546ff",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Envoi..." : "Envoyer"}
        </button>
      </form>

      {error && (
        <p style={{ color: "#ff7777", marginTop: 15 }}>
          {error}
        </p>
      )}
    </main>
  );
}
