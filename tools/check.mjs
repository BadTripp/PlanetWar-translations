#!/usr/bin/env node
// Validates locales/<lang>/<namespace>.json against the source language (en).
// Standalone (no dependencies) so the same file runs in this repo and in the community translations repo.
//   node tools/i18n/check.mjs [--dir locales] [--strict]
// Errors (exit 1): invalid JSON, non-string values, placeholder mismatch, keys that do not exist in en, unknown language.
// Warnings: untranslated keys. With --strict missing keys are errors too (used for languages marked "complete").
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const dir = args.includes('--dir') ? args[args.indexOf('--dir') + 1] : 'locales';
const strict = args.includes('--strict');

export function placeholders(msg) {
  const names = new Set();
  const close = (s, o) => { for (let d = 0, i = o; i < s.length; i++) { if (s[i] === '{') d++; else if (s[i] === '}' && --d === 0) return i; } return -1; };
  const walk = s => {
    for (let i = 0; i < s.length; i++) {
      if (s[i] !== '{') continue;
      const end = close(s, i); if (end < 0) { names.add('<unbalanced>'); return; }
      const body = s.slice(i + 1, end), comma = body.indexOf(',');
      if (comma < 0) names.add(body.trim());
      else {
        names.add(body.slice(0, comma).trim());
        const rest = body.slice(comma + 1), c2 = rest.indexOf(',');
        if (c2 >= 0) { const b = rest.slice(c2 + 1); for (let j = 0; j < b.length;) { const o = b.indexOf('{', j); if (o < 0) break; const c = close(b, o); if (c < 0) break; walk(b.slice(o + 1, c)); j = c + 1; } }
      }
      i = end;
    }
  };
  walk(msg); return [...names].sort().join(',');
}

function loadLang(lang) {
  const out = {}, errors = [], base = join(dir, lang);
  for (const f of readdirSync(base).filter(f => f.endsWith('.json')).sort()) {
    let data;
    try { data = JSON.parse(readFileSync(join(base, f), 'utf8')); } catch (e) { errors.push(`${lang}/${f}: invalid JSON (${e.message})`); continue; }
    const ns = f.slice(0, -5);
    for (const [k, v] of Object.entries(data)) {
      if (typeof v !== 'string') { errors.push(`${lang}/${f}: "${k}" must be a string`); continue; }
      out[`${ns}.${k}`] = v;
    }
  }
  return { msgs: out, errors };
}

export function check() {
  const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
  const src = manifest.source, errors = [], warnings = [], stats = [];
  const source = loadLang(src); errors.push(...source.errors);
  const langs = readdirSync(dir).filter(d => statSync(join(dir, d)).isDirectory());
  for (const lang of langs) {
    if (!manifest.languages[lang]) errors.push(`${lang}/: language not listed in manifest.json`);
    if (lang === src) continue;
    const { msgs, errors: e } = loadLang(lang); errors.push(...e);
    let missing = 0;
    for (const [k, v] of Object.entries(msgs)) {
      if (!(k in source.msgs)) { errors.push(`${lang}: "${k}" does not exist in ${src} (renamed or removed?)`); continue; }
      if (!v.trim()) { errors.push(`${lang}: "${k}" is empty — delete the key to leave it untranslated`); continue; }
      if (placeholders(v) !== placeholders(source.msgs[k])) errors.push(`${lang}: "${k}" placeholders differ — source has {${placeholders(source.msgs[k])}}, translation has {${placeholders(v)}}`);
    }
    for (const k of Object.keys(source.msgs)) if (!(k in msgs)) missing++;
    const total = Object.keys(source.msgs).length, pct = total ? Math.round(((total - missing) / total) * 100) : 100;
    stats.push(`${lang}: ${total - missing}/${total} (${pct}%)`);
    if (missing) (strict ? errors : warnings).push(`${lang}: ${missing} untranslated key(s)`);
  }
  for (const lang of Object.keys(manifest.languages)) if (!existsSync(join(dir, lang))) errors.push(`${lang}: listed in manifest.json but ${join(dir, lang)} is missing`);
  return { errors, warnings, stats };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { errors, warnings, stats } = check();
  for (const w of warnings) console.warn(`warn  ${w}`);
  for (const e of errors) console.error(`error ${e}`);
  console.log(`coverage — ${stats.join(' · ') || 'source only'}`);
  if (errors.length) { console.error(`\n${errors.length} error(s)`); process.exit(1); }
}
