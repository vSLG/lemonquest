// Endereço do servidor do jogo. Separado de net.ts (que já cria o Client do Colyseus) para dar para testar.
//
// Ordem: VITE_SERVER_URL (build) > dev (mesmo host, porta VITE_SERVER_PORT ou 2567) > mesma origem (produção).
// VITE_SERVER_URL existe para clientes servidos fora do servidor do jogo (app empacotado, outro host estático). Só vale
// em build, de propósito: um ?server= na URL deixaria um link malicioso apontar o cliente para outro servidor e colher
// senhas.

export interface EndpointEnv {
  dev: boolean;
  /** location.protocol, location.hostname e location.origin da página. */
  location: { protocol: string; hostname: string; origin: string };
  serverUrl?: string;
  serverPort?: string;
}

export function resolveEndpoint(env: EndpointEnv): string {
  const url = env.serverUrl?.trim();
  if (url) {
    let u: URL;
    try { u = new URL(url); } catch { throw new Error(`VITE_SERVER_URL inválida: "${url}"`); }
    if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error(`VITE_SERVER_URL precisa ser http(s): "${url}"`);
    // Sem barra no fim: o resto do cliente monta `${endpoint}/health`, `${endpoint}/api/...`.
    return u.href.replace(/\/+$/, "");
  }
  if (env.dev) return `${env.location.protocol}//${env.location.hostname}:${env.serverPort || 2567}`;
  return env.location.origin;
}
