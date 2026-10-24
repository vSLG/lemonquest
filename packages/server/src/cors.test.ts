import { describe, expect, it } from "vitest";
import { corsHeadersFor, parseCorsOrigins } from "./cors.ts";

describe("parseCorsOrigins", () => {
  it("vazio ou ausente = nenhuma origem (comportamento antigo)", () => {
    expect(parseCorsOrigins(undefined).size).toBe(0);
    expect(parseCorsOrigins(" , ").size).toBe(0);
  });

  it("normaliza as origens (porta padrão, barra final, maiúsculas)", () => {
    const s = parseCorsOrigins(" https://Jogo.LAN:443/ , http://localhost, capacitor://localhost ");
    expect([...s]).toEqual(["https://jogo.lan", "http://localhost", "capacitor://localhost"]);
  });

  it("recusa curinga, null, caminho e lixo", () => {
    expect(() => parseCorsOrigins("*")).toThrow(/exatas/);
    expect(() => parseCorsOrigins("null")).toThrow(/exatas/);
    expect(() => parseCorsOrigins("https://jogo.lan/app")).toThrow(/caminho/);
    expect(() => parseCorsOrigins("jogo.lan")).toThrow(/inválida/);
  });
});

describe("corsHeadersFor", () => {
  const allowed = parseCorsOrigins("http://localhost");

  it("origem da lista recebe Allow-Origin dela mesma e Vary", () => {
    const h = corsHeadersFor("http://localhost", allowed);
    expect(h["Access-Control-Allow-Origin"]).toBe("http://localhost");
    expect(h["Access-Control-Allow-Credentials"]).toBe("true"); // o SDK do Colyseus usa credentials: "include"
    expect(h.Vary).toBe("Origin");
  });

  it("origem fora da lista, ou sem origem, não recebe Allow-Origin (só Vary)", () => {
    expect(corsHeadersFor("http://evil.example", allowed)).toEqual({ Vary: "Origin" });
    expect(corsHeadersFor("http://localhost:8080", allowed)).toEqual({ Vary: "Origin" });
    expect(corsHeadersFor(undefined, allowed)).toEqual({ Vary: "Origin" });
  });

  it("lista vazia = nenhum cabeçalho (produção como sempre foi)", () => {
    expect(corsHeadersFor("http://localhost", new Set())).toEqual({});
  });
});
