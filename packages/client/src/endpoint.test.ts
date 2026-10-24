import { describe, expect, it } from "vitest";
import { resolveEndpoint } from "./endpoint.ts";

const location = { protocol: "http:", hostname: "10.0.0.5", origin: "http://10.0.0.5:2567" };

describe("resolveEndpoint", () => {
  it("produção sem VITE_SERVER_URL usa a mesma origem", () => {
    expect(resolveEndpoint({ dev: false, location })).toBe("http://10.0.0.5:2567");
  });

  it("dev usa o mesmo host na porta do servidor (2567 ou VITE_SERVER_PORT)", () => {
    expect(resolveEndpoint({ dev: true, location })).toBe("http://10.0.0.5:2567");
    expect(resolveEndpoint({ dev: true, location, serverPort: "2568" })).toBe("http://10.0.0.5:2568");
  });

  it("VITE_SERVER_URL vence dev e produção, sem barra no fim", () => {
    for (const dev of [true, false]) {
      expect(resolveEndpoint({ dev, location, serverUrl: "https://jogo.lan:8443/" })).toBe("https://jogo.lan:8443");
    }
    expect(resolveEndpoint({ dev: false, location, serverUrl: "  http://192.168.0.10:2567  " })).toBe("http://192.168.0.10:2567");
  });

  it("VITE_SERVER_URL vazia é ignorada", () => {
    expect(resolveEndpoint({ dev: false, location, serverUrl: "  " })).toBe("http://10.0.0.5:2567");
  });

  it("VITE_SERVER_URL inválida ou fora de http(s) falha alto", () => {
    expect(() => resolveEndpoint({ dev: false, location, serverUrl: "jogo.lan:2567" })).toThrow(/inválida|http/);
    expect(() => resolveEndpoint({ dev: false, location, serverUrl: "ws://jogo.lan:2567" })).toThrow(/http\(s\)/);
  });
});
