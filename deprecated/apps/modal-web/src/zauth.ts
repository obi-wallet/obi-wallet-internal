export async function fetchUserId(accessToken: string): Promise<string | null> {
  const response = await fetch("https://zerg.zepeto.io/zepeto/characters", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (response.status !== 200) return null;

  const user = (await response.json()) as {
    hashCode: string;
    zepetoId?: string;
  };

  if (user.zepetoId) {
    return `${user.hashCode}-${user.zepetoId}`;
  }

  return user.hashCode;
}
