export interface MojangProfile {
  id: string; // UUID without hyphens
  name: string; // Current username
}

/**
 * Resolves a Minecraft Java username to its authentic Mojang UUID
 */
export async function lookupMojangProfile(username: string): Promise<MojangProfile | null> {
  const cleanUsername = username.trim();
  if (!cleanUsername || cleanUsername.length > 16 || !/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
    return null;
  }

  try {
    const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(cleanUsername)}`, {
      next: { revalidate: 300 }, // cache 5 min
    });

    if (res.status === 200) {
      const data = await res.json();
      return {
        id: data.id,
        name: data.name,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Returns the 3D isometric or 2D avatar render URL for a Minecraft UUID or username
 */
export function getMinecraftAvatarUrl(identifier: string, size = 64): string {
  const clean = identifier.trim() || "MHF_Steve";
  return `https://mc-heads.net/avatar/${encodeURIComponent(clean)}/${size}`;
}
