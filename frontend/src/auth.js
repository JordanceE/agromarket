export function normalizeAuthUser(payload) {
  if (!payload || typeof payload !== 'object') return null;

  const candidate = payload.user ?? payload.data?.user ?? payload.data ?? payload;
  return candidate && typeof candidate === 'object' ? candidate : null;
}
