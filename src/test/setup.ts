import "@testing-library/jest-dom";

// Node recente expõe um localStorage global sem métodos que sobrepõe o do jsdom.
// Garante um Storage em memória para os stores persistidos (zustand/persist).
if (typeof globalThis.localStorage?.setItem !== "function") {
  const dados = new Map<string, string>();
  const memoria: Storage = {
    get length() { return dados.size; },
    clear: () => dados.clear(),
    getItem: (k) => dados.get(k) ?? null,
    key: (i) => Array.from(dados.keys())[i] ?? null,
    removeItem: (k) => { dados.delete(k); },
    setItem: (k, v) => { dados.set(k, String(v)); },
  };
  Object.defineProperty(globalThis, "localStorage", { value: memoria, configurable: true });
}
