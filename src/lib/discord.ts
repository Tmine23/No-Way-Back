const DISCORD_API = "https://discord.com/api/v10";

function botHeaders() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("DISCORD_BOT_TOKEN no está configurado");
  return {
    Authorization: `Bot ${token}`,
    "Content-Type": "application/json",
  };
}

export async function sendDiscordDM(discordId: string, content: string): Promise<void> {
  const channelRes = await fetch(`${DISCORD_API}/users/@me/channels`, {
    method: "POST",
    headers: botHeaders(),
    body: JSON.stringify({ recipient_id: discordId }),
  });

  if (!channelRes.ok) {
    throw new Error(`No se pudo abrir el DM (${channelRes.status})`);
  }

  const channel = await channelRes.json();

  const messageRes = await fetch(`${DISCORD_API}/channels/${channel.id}/messages`, {
    method: "POST",
    headers: botHeaders(),
    body: JSON.stringify({ content }),
  });

  if (!messageRes.ok) {
    throw new Error(`No se pudo enviar el mensaje (${messageRes.status})`);
  }
}

export async function setGuildMemberRole(
  guildId: string,
  discordId: string,
  roleId: string,
  present: boolean,
): Promise<void> {
  const res = await fetch(
    `${DISCORD_API}/guilds/${guildId}/members/${discordId}/roles/${roleId}`,
    { method: present ? "PUT" : "DELETE", headers: botHeaders() },
  );

  if (!res.ok && res.status !== 404) {
    throw new Error(`No se pudo actualizar el rol en Discord (${res.status})`);
  }
}
