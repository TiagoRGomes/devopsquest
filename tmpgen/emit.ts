for (const l of ["es", "en"] as const) {
  const d = await Bun.file(`tmpgen/${l}.json`).json();
  const body = `// Arquivo gerado automaticamente: traduções (${l.toUpperCase()}) de todo o conteúdo do curso.
// Chaves: \`\${id}.\${campo}\`. Listas usam " | " como separador.
export const CONTENT_GEN_${l.toUpperCase()}: Record<string, string> = ${JSON.stringify(d, null, 1)};
`;
  await Bun.write(`src/lib/content-i18n/gen-${l}.ts`, body);
}
console.log("ok");
