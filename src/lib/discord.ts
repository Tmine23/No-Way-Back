const DISCORD_API = "https://discord.com/api/v10";

export async function sendDiscordDM(discordId: string, content: string): Promise<void> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("DISCORD_BOT_TOKEN no está configurado");

  const channelRes = await fetch(`${DISCORD_API}/users/@me/channels`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient_id: discordId }),
  });

  if (!channelRes.ok) {
    throw new Error(`No se pudo abrir el DM (${channelRes.status})`);
  }

  const channel = await channelRes.json();

  const messageRes = await fetch(`${DISCORD_API}/channels/${channel.id}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (!messageRes.ok) {
    throw new Error(`No se pudo enviar el mensaje (${messageRes.status})`);
  }
}
