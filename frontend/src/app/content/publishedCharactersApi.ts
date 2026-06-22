const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export type PublishedCharacter = {
  character_id: string;
  display_name: string;
  era?: string;
  short_bio?: string;
  role?: string;
  portrait_url?: string;
  status?: string;
};

type CharactersResponse = {
  characters?: PublishedCharacter[];
};

function normalizeCharacter(raw: PublishedCharacter): PublishedCharacter | null {
  const characterId = raw.character_id?.trim();
  const displayName = raw.display_name?.trim();

  if (!characterId || !displayName) {
    return null;
  }

  return {
    ...raw,
    character_id: characterId,
    display_name: displayName,
    era: raw.era?.trim() || undefined,
    short_bio: raw.short_bio?.trim() || undefined,
    role: raw.role?.trim() || undefined,
    portrait_url: raw.portrait_url?.trim() || undefined,
  };
}

export async function fetchPublishedCharacters(): Promise<PublishedCharacter[]> {
  const response = await fetch(`${API_BASE_URL}/characters`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Không thể tải danh sách nhân vật đã phát hành.");
  }

  const payload = (await response.json()) as CharactersResponse;
  return (payload.characters || [])
    .map(normalizeCharacter)
    .filter((character): character is PublishedCharacter => Boolean(character));
}
