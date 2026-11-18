// Оформление сайта: акцентный цвет и тон фона → CSS-переменные.
// ВАЖНО: файл идентичен backend/theme.js (сервер вставляет тему в страницу без «мигания», браузер — для предпросмотра).

export const ACCENT_PRESETS = [
  { id: "red", name: "Красный", accent: "#d6001c", light: "#ff2a44" },
  { id: "gold", name: "Золотой", accent: "#d4af37", light: "#f0cd5a" },
  { id: "amber", name: "Янтарный", accent: "#f59e0b", light: "#fbbf24" },
  { id: "blue", name: "Синий", accent: "#2f6bff", light: "#6b94ff" },
  { id: "green", name: "Зелёный", accent: "#16a34a", light: "#4ade80" },
  { id: "violet", name: "Фиолетовый", accent: "#8b5cf6", light: "#a78bfa" },
  { id: "silver", name: "Серебро", accent: "#c0c0c0", light: "#e5e5e5" },
];

export const BACKGROUNDS = {
  black: { name: "Чёрный", bg: "#0a0a0a", bg2: "#111111", bg3: "#181818", line: "#2a2a2a" },
  graphite: { name: "Графит", bg: "#0f1012", bg2: "#16181b", bg3: "#1d2024", line: "#2d3138" },
  navy: { name: "Тёмно-синий", bg: "#070b14", bg2: "#0d121f", bg3: "#141a2a", line: "#242c40" },
  wine: { name: "Бордовый", bg: "#12080a", bg2: "#1a0e10", bg3: "#221417", line: "#38252a" },
  forest: { name: "Тёмно-зелёный", bg: "#07100b", bg2: "#0d1913", bg3: "#13221a", line: "#223a2d" },
};

export const DEFAULT_THEME = { accent: "#d6001c", accentLight: "#ff2a44", background: "black" };

export const isHex = (v) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);
const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb) => "#" + rgb.map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, "0")).join("");
const mix = (hex, target, amount) => toHex(toRgb(hex).map((c, i) => c * (1 - amount) + target[i] * amount));

// Относительная яркость и контраст по WCAG
const lum = (hex) => {
  const [r, g, b] = toRgb(hex).map((c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

export const lighten = (hex) => mix(hex, [255, 255, 255], 0.28);
export const onAccent = (hex) => (contrast(hex, "#ffffff") >= contrast(hex, "#0a0a0a") ? "#ffffff" : "#0a0a0a");

// Текст об ошибке, если цвет плохо читается на выбранном фоне (иначе null).
export function themeProblem(theme) {
  const bg = (BACKGROUNDS[theme.background] || BACKGROUNDS.black).bg;
  if (contrast(theme.accent, bg) < 3) return "Цвет слишком тёмный для этого фона: линии и надписи будут плохо видны. Выберите посветлее.";
  const light = theme.accentLight || lighten(theme.accent);
  if (contrast(light, bg) < 4.5) return "Светлый оттенок слишком тёмный: акцентные надписи будут плохо читаться. Выберите посветлее.";
  return null;
}

export function themeVars(theme) {
  const t = { ...DEFAULT_THEME, ...theme };
  const accent = isHex(t.accent) ? t.accent.toLowerCase() : DEFAULT_THEME.accent;
  const light = isHex(t.accentLight) ? t.accentLight.toLowerCase() : lighten(accent);
  const bg = BACKGROUNDS[t.background] || BACKGROUNDS.black;
  return {
    "--red": accent,
    "--red-2": light,
    "--accent-rgb": toRgb(accent).join(","),
    "--accent-deep": mix(accent, [0, 0, 0], 0.72),
    "--on-accent": onAccent(accent),
    "--black": bg.bg,
    "--black-2": bg.bg2,
    "--black-3": bg.bg3,
    "--grey-2": bg.line,
    "--bg-rgb": toRgb(bg.bg).join(","),
  };
}

// `html:root` весомее обычного `:root` из файла стилей, поэтому тема побеждает независимо от порядка подключения.
export const themeCss = (theme) =>
  "html:root{" + Object.entries(themeVars(theme)).map(([k, v]) => `${k}:${v}`).join(";") + "}";

export function applyTheme(theme, el = document.documentElement) {
  for (const [k, v] of Object.entries(themeVars(theme))) el.style.setProperty(k, v);
}
