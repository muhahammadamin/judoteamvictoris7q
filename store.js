// JSON-хранилище: один файл data/db.json, атомарная запись, без внешних зависимостей.
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_THEME } from "./theme.js";

export const DATA_DIR = process.env.DATA_DIR || path.resolve("data");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const DB_FILE = path.join(DATA_DIR, "db.json");

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

export const defaultTexts = () => ({
  heroEyebrow: "Клуб дзюдо",
  heroSubtitle: "Дисциплина. Сила. Уважение. Победа.",
  aboutTitle: "Путь мягкости,\nкоторый делает сильнее",
  aboutLead: "Дзюдо — это не только борьба. Это школа характера: умение держать себя в руках, уважать соперника и учителя, падать и подниматься снова.",
  aboutText: "В TEAM VICTORIS мы опираемся на эти принципы. Тренировки строятся так, чтобы ученик рос физически, становился увереннее и учился доводить начатое до конца — на татами и за его пределами.",
  values: [
    { title: "Дисциплина", text: "Регулярность и порядок — основа любого результата." },
    { title: "Уважение", text: "К тренеру, партнёру по залу и сопернику." },
    { title: "Самоконтроль", text: "Спокойствие и ясная голова в любой ситуации." },
    { title: "Физическая подготовка", text: "Сила, гибкость и выносливость всего тела." },
    { title: "Уверенность в себе", text: "Опыт преодоления формирует внутренний стержень." },
    { title: "Спортивный характер", text: "Умение принимать поражение и стремиться к победе." },
  ],
  benefitsTitle: "Чему мы учим",
  benefits: [
    { title: "Техника дзюдо", text: "Броски, удержания, страховка — изучаем базу последовательно и правильно." },
    { title: "Сила и выносливость", text: "Общая и специальная физическая подготовка для устойчивого роста." },
    { title: "Координация", text: "Баланс, ловкость и контроль над собственным телом." },
    { title: "Характер и дисциплина", text: "Воспитание целеустремлённости, ответственности и уважения." },
    { title: "Техника и тактика", text: "Учимся читать соперника и выбирать верное решение в схватке." },
    { title: "Подготовка к соревнованиям", text: "Для тех, кто готов выйти на татами и проверить себя." },
  ],
  scheduleTitle: "Когда мы тренируемся",
  scheduleNote: "Актуальное расписание уточняйте у тренера.",
  locationTitle: "Где проходят тренировки",
  signupTitle: "Сделайте первый шаг",
  signupLead: "Оставьте заявку — мы свяжемся с вами, ответим на вопросы и подберём подходящую группу.",
  faqTitle: "Вопросы и ответы",
});

const defaults = () => ({
  secret: "",
  admin: null, // { salt, hash }
  contentUpdatedAt: "",
  content: {
    trainer: { name: "George Yugay", role: "Главный тренер TEAM VICTORIS", bio: "", experience: "", achievements: [] },
    texts: defaultTexts(),
    faq: [],
    schedule: [
      { day: "День недели", time: "00:00 – 00:00", group: "Группа (укажите)" },
      { day: "День недели", time: "00:00 – 00:00", group: "Группа (укажите)" },
      { day: "День недели", time: "00:00 – 00:00", group: "Группа (укажите)" },
    ],
    location: { address: "" },
    contacts: { instagram: "https://www.instagram.com/", telegram: "", phone: "" },
    images: { hero: "", coach: "" },
    theme: { ...DEFAULT_THEME },
  },
  settings: {
    telegram: { enabled: true, token: "", chatIds: [], apiBase: "" },
    seo: {
      title: "", description: "", keywords: "", siteUrl: "", noindex: false,
      googleVerification: "", yandexVerification: "", gaId: "", ymId: "", city: "", country: "",
    },
  },
  applications: [],
});

// Глубокое слияние: объекты сливаются, массивы и примитивы из файла заменяют значения по умолчанию.
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
function merge(base, extra) {
  if (!isObj(base) || !isObj(extra)) return extra === undefined ? base : extra;
  const out = { ...base };
  for (const k of Object.keys(extra)) out[k] = k in base ? merge(base[k], extra[k]) : extra[k];
  return out;
}

let db;
try {
  db = merge(defaults(), JSON.parse(fs.readFileSync(DB_FILE, "utf8")));
} catch {
  db = defaults();
}

let writing = Promise.resolve();
export function save() {
  // Последовательная атомарная запись: tmp-файл + rename.
  writing = writing.then(async () => {
    const tmp = DB_FILE + ".tmp";
    await fs.promises.writeFile(tmp, JSON.stringify(db, null, 2));
    await fs.promises.rename(tmp, DB_FILE);
  }).catch((e) => console.error("DB write failed:", e));
  return writing;
}

export const getDb = () => db;
