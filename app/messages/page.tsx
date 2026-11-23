
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  async function loadMessages(id: string, other: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${id},receiver_id.eq.${other}),and(sender_id.eq.${other},receiver_id.eq.${id})`)
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
      return;
    }
    setMessages(data || []);
  }

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (data.user) setUserId(data.user.id);
    }
    init();
  }, []);

  useEffect(() => {
    if (!userId || !receiverId) return;
    loadMessages(userId, receiverId);

    const channel = supabase
      .channel("frame-messages")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages"
      }, () => loadMessages(userId, receiverId))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, receiverId]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !userId || !receiverId) return;

    const { error } = await supabase.from("messages").insert({
      sender_id: userId,
      receiver_id: receiverId,
      content: content.trim()
    });

    if (error) {
      setError(error.message);
      return;
    }

    setContent("");
    loadMessages(userId, receiverId);
  }

  return (
    <main style={{ maxWidth: 850, margin: "50px auto", padding: 20, color: "white" }}>
      <h1>FRAME Messages</h1>
      <p>Connecte-toi avec les talents de la communauté.</p>

      <label>ID du destinataire</label>
      <input
        value={receiverId}
        onChange={(e) => setReceiverId(e.target.value)}
        placeholder="Colle l'identifiant utilisateur UUID"
        style={{ width: "100%", padding: 12, margin: "10px 0 20px" }}
      />

      <section style={{ background: "#171717", padding: 20, minHeight: 300, borderRadius: 12 }}>
        {messages.map((m) => (
          <div key={m.id} style={{
            textAlign: m.sender_id === userId ? "right" : "left",
            margin: "12px 0"
          }}>
            <span style={{
              display: "inline-block",
              background: m.sender_id === userId ? "#7546ff" : "#333",
              padding: "12px 16px",
              borderRadius: 14,
              maxWidth: "80%"
            }}>
              {m.content}
            </span>
          </div>
        ))}
        {!messages.length && <p>Aucun message pour le moment.</p>}
      </section>

      <form onSubmit={sendMessage} style={{ display: "flex", gap: 10, marginTop: 15 }}>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écris ton message..."
          style={{ flex: 1, padding: 14, borderRadius: 8 }}
        />
        <button type="submit">Envoyer</button>
      </form>

      {error && <p style={{ color: "salmon" }}>{error}</p>}
    </main>
  );
}
