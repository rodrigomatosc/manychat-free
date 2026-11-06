// Webhook do Instagram: comentou a palavra-chave -> recebe DM.
// Roda como função serverless na Vercel. Não precisa de dependências.

const GRAPH = `https://graph.instagram.com/${process.env.GRAPH_VERSION || "v23.0"}`;
const TOKEN = process.env.IG_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const KEYWORDS = (process.env.KEYWORD || "QUERO")
  .split(",")
  .map((k) => k.trim().toLowerCase())
  .filter(Boolean);
const DM_MESSAGE = process.env.DM_MESSAGE || "Oi! Aqui está o link: https://exemplo.com";
const PUBLIC_REPLY = process.env.PUBLIC_REPLY || ""; // vazio = não responde em público

export default async function handler(req, res) {
  // 1) Verificação do webhook (a Meta chama com GET uma vez, ao configurar)
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Token de verificação inválido");
  }

  // 2) Eventos (a Meta chama com POST a cada comentário ou DM)
  if (req.method === "POST") {
    try {
      const body = req.body || {};
      if (body.object !== "instagram") return res.status(200).send("ignorado");

      for (const entry of body.entry || []) {
        const myId = entry.id; // id da sua conta

        // Comentários em posts e reels
        for (const change of entry.changes || []) {
          if (change.field !== "comments") continue;
          const c = change.value || {};
          if (!c.id || c.from?.id === myId) continue; // ignora seus próprios comentários
          if (!hasKeyword(c.text)) continue;

          await sendPrivateReply(c.id, DM_MESSAGE);
          if (PUBLIC_REPLY) await replyToComment(c.id, PUBLIC_REPLY);
          console.log(`DM enviada para @${c.from?.username} (comentário ${c.id})`);
        }

        // DMs recebidas com a palavra-chave
        for (const msg of entry.messaging || []) {
          const senderId = msg.sender?.id;
          const text = msg.message?.text;
          if (!senderId || senderId === myId || msg.message?.is_echo) continue;
          if (!hasKeyword(text)) continue;

          await sendDirectMessage(senderId, DM_MESSAGE);
          console.log(`DM respondida para ${senderId}`);
        }
      }
    } catch (err) {
      console.error("Erro ao processar evento:", err);
    }
    // Sempre responde 200 para a Meta não ficar reenviando
    return res.status(200).send("ok");
  }

  return res.status(405).send("Método não permitido");
}

function hasKeyword(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  return KEYWORDS.some((k) => t.includes(k));
}

// Resposta privada: DM para quem comentou
async function sendPrivateReply(commentId, text) {
  return callGraph("/me/messages", {
    recipient: { comment_id: commentId },
    message: { text },
  });
}

// DM normal (dentro da janela de 24h)
async function sendDirectMessage(userId, text) {
  return callGraph("/me/messages", {
    recipient: { id: userId },
    message: { text },
  });
}

// Resposta pública no comentário
async function replyToComment(commentId, text) {
  return callGraph(`/${commentId}/replies`, { message: text });
}

async function callGraph(path, payload) {
  const r = await fetch(`${GRAPH}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error(`Erro da API (${path}):`, JSON.stringify(data));
    throw new Error(data?.error?.message || `HTTP ${r.status}`);
  }
  return data;
}
