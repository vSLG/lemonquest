import { Client } from "@colyseus/sdk";
import { resolveEndpoint } from "./endpoint.ts";

// Em dev o servidor roda na 2567 (VITE_SERVER_PORT troca: o Docker de dev usa 2568); em produção ele serve o
// cliente na mesma origem. VITE_SERVER_URL (build) fixa outro servidor: ver endpoint.ts.
export const endpoint = resolveEndpoint({
  dev: import.meta.env.DEV,
  location,
  serverUrl: import.meta.env.VITE_SERVER_URL,
  serverPort: import.meta.env.VITE_SERVER_PORT,
});

export const client = new Client(endpoint);
