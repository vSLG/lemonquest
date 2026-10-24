// CORS de produção por lista de origens (LEMONQUEST_CORS_ORIGINS). Vazia = nenhum cabeçalho, como sempre foi: cliente e
// API na mesma origem. A lista serve para clientes servidos de outra origem (app empacotado, VITE_SERVER_URL) — só
// origens exatas, nunca "*": a API tem login e o matchmaking aceita qualquer origem que receber Allow-Origin.

/** "https://a.lan, http://localhost" -> Set de origens normalizadas. Entrada inválida derruba a inicialização. */
export function parseCorsOrigins(raw: string | undefined): Set<string> {
  const out = new Set<string>();
  for (const part of (raw ?? "").split(",")) {
    const s = part.trim();
    if (!s) continue;
    if (s === "*" || s === "null") throw new Error(`LEMONQUEST_CORS_ORIGINS não aceita "${s}": liste as origens exatas`);
    let u: URL;
    try { u = new URL(s); } catch { throw new Error(`LEMONQUEST_CORS_ORIGINS: origem inválida "${s}"`); }
    // URL.origin de esquemas sem origem (ex.: capacitor://localhost) é "null": aí a origem é esquema + host.
    const origin = u.origin !== "null" ? u.origin : `${u.protocol}//${u.host}`;
    if (u.pathname.replace(/\/$/, "") || u.search || u.hash) throw new Error(`LEMONQUEST_CORS_ORIGINS: só a origem, sem caminho: "${s}"`);
    out.add(origin);
  }
  return out;
}

/** Cabeçalhos CORS para o pedido vindo de `origin` (o Colyseus os aplica a toda resposta HTTP e a todo OPTIONS). */
export function corsHeadersFor(origin: string | null | undefined, allowed: ReadonlySet<string>): Record<string, string> {
  if (!allowed.size) return {};
  // A resposta depende da origem (com ou sem Allow-Origin): cache compartilhado não pode servir a de uma para outra.
  if (!origin || !allowed.has(origin)) return { Vary: "Origin" };
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    // O SDK do Colyseus chama /matchmake com credentials: "include"; sem isto o navegador barra o join. Seguro porque só
    // origens exatas da lista recebem (a sessão do jogo vai no corpo, não em cookie).
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}
