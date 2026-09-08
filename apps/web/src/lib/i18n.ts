export type Lang = 'uz' | 'ru' | 'en';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'uz', label: "O‘zbek" },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
];

type Dict = {
  title: string;
  subtitle: string;
  modeAi: string;
  modeHotseat: string;
  playAs: string;
  white: string;
  black: string;
  level: string;
  levels: string[];
  newGame: string;
  undo: string;
  flip: string;
  hints: string;
  moves: string;
  whiteToMove: string;
  blackToMove: string;
  check: string;
  checkmate: string;
  winsWhite: string;
  winsBlack: string;
  stalemate: string;
  drawMaterial: string;
  drawFifty: string;
  drawRepetition: string;
  thinking: string;
  rules: string;
  promotion: string;
  rulesIntro: string;
  pieces: Record<string, string>;
  footer: string;
  themeDark: string;
  themeLight: string;
  learn: string;
  play: string;
  points: string;
  next: string;
  gotIt: string;
  correct: string;
  tryAgain: string;
  hint: string;
  retry: string;
  lessonsLabel: string;
  questsLabel: string;
  resetProgress: string;
  allDone: string;
  navQuests: string;
  navLeaderboard: string;
  navProfile: string;
  soon: string;
  finishLessons: string;
  toQuests: string;
  profileLocal: string;
  progressLabel: string;
  sound: string;
  close: string;
};

export const DICT: Record<Lang, Dict> = {
  uz: {
    title: 'TOJMOT',
    subtitle: 'Aql gimnastikasi o‘yini',
    modeAi: 'Kompyuterga qarshi',
    modeHotseat: 'Ikki o‘yinchi',
    playAs: 'Men o‘ynayman',
    white: 'Oq',
    black: 'Qora',
    level: 'Daraja',
    levels: ['Boshlang‘ich', 'O‘rta', 'Kuchli', 'Usta'],
    newGame: 'Yangi o‘yin',
    undo: 'Yurishni qaytarish',
    flip: 'Doskani aylantirish',
    hints: 'Yurishlarni ko‘rsatish',
    moves: 'Yurishlar',
    whiteToMove: 'Oq yuradi',
    blackToMove: 'Qora yuradi',
    check: 'Toj (kisht)!',
    checkmate: 'Mot!',
    winsWhite: 'Oq g‘alaba qozondi',
    winsBlack: 'Qora g‘alaba qozondi',
    stalemate: 'Pot — durang',
    drawMaterial: 'Durang — donalar yetarli emas',
    drawFifty: 'Durang — 50 yurish qoidasi',
    drawRepetition: 'Durang — holat uch marta takrorlandi',
    thinking: 'Kompyuter o‘ylamoqda…',
    rules: 'Qoidalar',
    promotion: 'X qaysi donaga aylansin?',
    rulesIntro:
      'Doska 89 katakdan iborat. Oq birinchi yuradi. Donalar o‘z yurish yo‘nalishidagi raqib donasini oladi. «1» donasi olinmaydi; «1» hududiga (sariq kataklar) hech qaysi dona kira olmaydi — raqibniki ham, o‘zingizniki ham. «1» ga toj berilib, chiqib ketish iloji bo‘lmasa — mot.',
    pieces: {
      '1': 'Toj — 8 tomonga 1 katak. Olinmaydi.',
      '7': 'Barcha 8 yo‘nalishda istalgan masofaga.',
      '8': '45° (katak tomoni orqali) istalgan masofaga.',
      '4': 'To‘g‘ri (katak burchagi orqali, o‘z rangida) istalgan masofaga.',
      '9': '8 tomonga 1 katak.',
      '2': 'To‘g‘ri (o‘z rangida) 1 katak.',
      '5': 'Sakraydi: 1 to‘g‘ri + 1 yonga («Г»).',
      '6': 'Sakraydi: 2 to‘g‘ri + 1 yonga.',
      '3': 'Sakraydi: 1 to‘g‘ri + 1 diagonal.',
      X: 'Oldinga diagonal 1 katak. Raqibning arab raqamlari qatorida 2–9 dan istalgan donaga aylanadi.',
      R: 'Rim raqamlari (II–IX): oldinga diagonal 1 katak. Raqibning arab raqamlari qatoriga yetganda o‘sha katakdagi raqamga aylanadi.',
    },
    footer: 'Tojmot — muallif Monolit Toshmatov (2012). Raqamli versiya: beta.',
    themeDark: 'Qorong‘i rejim',
    themeLight: 'Yorug‘ rejim',
    learn: 'O‘rganish',
    play: 'O‘yin',
    points: 'ball',
    next: 'Keyingisi',
    gotIt: 'Tushunarli',
    correct: 'To‘g‘ri!',
    tryAgain: 'Xato — yana urinib ko‘ring',
    hint: 'Maslahat (−5)',
    retry: 'Qaytadan',
    lessonsLabel: 'Dars',
    questsLabel: 'Kvest',
    resetProgress: 'Boshidan',
    allDone: 'Tabriklaymiz! Hammasi bajarildi',
    navQuests: 'Kvestlar',
    navLeaderboard: 'Reyting',
    navProfile: 'Profil',
    soon: 'Tez orada',
    finishLessons: 'Avval darslarni tugating',
    toQuests: 'Kvestlarga',
    profileLocal: 'Mahalliy profil (shu qurilmada)',
    progressLabel: 'Umumiy progress',
    sound: 'Ovoz',
    close: 'Yopish',
  },
  ru: {
    title: 'ТОЖМОТ',
    subtitle: 'Игра — гимнастика ума',
    modeAi: 'Против компьютера',
    modeHotseat: 'Два игрока',
    playAs: 'Я играю',
    white: 'Белые',
    black: 'Чёрные',
    level: 'Уровень',
    levels: ['Новичок', 'Средний', 'Сильный', 'Мастер'],
    newGame: 'Новая игра',
    undo: 'Отменить ход',
    flip: 'Перевернуть доску',
    hints: 'Показывать ходы',
    moves: 'Ходы',
    whiteToMove: 'Ход белых',
    blackToMove: 'Ход чёрных',
    check: 'Тож (шах)!',
    checkmate: 'Мат!',
    winsWhite: 'Победили белые',
    winsBlack: 'Победили чёрные',
    stalemate: 'Пат — ничья',
    drawMaterial: 'Ничья — недостаточно фигур',
    drawFifty: 'Ничья — правило 50 ходов',
    drawRepetition: 'Ничья — троекратное повторение',
    thinking: 'Компьютер думает…',
    rules: 'Правила',
    promotion: 'Во что превратить X?',
    rulesIntro:
      'Доска — 89 клеток. Белые ходят первыми. Фигура бьёт фигуру противника, стоящую на пути её хода. Фигура «1» не бьётся; в зону «1» (жёлтые клетки) не может войти ни одна фигура — ни чужая, ни своя. Если «1» под тожем (шахом) и ходов нет — мат.',
    pieces: {
      '1': 'Тож — 1 клетка в любую из 8 сторон. Не бьётся.',
      '7': 'На любое расстояние по всем 8 направлениям.',
      '8': 'На любое расстояние по диагонали (через сторону клетки).',
      '4': 'На любое расстояние по прямой (через угол клетки, свой цвет).',
      '9': '1 клетка в любую из 8 сторон.',
      '2': '1 клетка по прямой (свой цвет).',
      '5': 'Прыжок: 1 по прямой + 1 вбок («Г»).',
      '6': 'Прыжок: 2 по прямой + 1 вбок.',
      '3': 'Прыжок: 1 по прямой + 1 по диагонали.',
      X: '1 клетка по диагонали вперёд. На ряду арабских цифр противника превращается в любую фигуру 2–9.',
      R: 'Римские (II–IX): 1 клетка по диагонали вперёд. Дойдя до ряда арабских цифр противника, превращаются в цифру той клетки.',
    },
    footer: 'Тожмот — автор Манолит Тошматов (2012). Цифровая версия: бета.',
    themeDark: 'Тёмная тема',
    themeLight: 'Светлая тема',
    learn: 'Обучение',
    play: 'Игра',
    points: 'баллов',
    next: 'Дальше',
    gotIt: 'Понятно',
    correct: 'Верно!',
    tryAgain: 'Не то — попробуйте ещё',
    hint: 'Подсказка (−5)',
    retry: 'Заново',
    lessonsLabel: 'Урок',
    questsLabel: 'Квест',
    resetProgress: 'Сбросить',
    allDone: 'Поздравляем! Всё пройдено',
    navQuests: 'Квесты',
    navLeaderboard: 'Рейтинг',
    navProfile: 'Профиль',
    soon: 'Скоро',
    finishLessons: 'Сначала пройдите уроки',
    toQuests: 'К квестам',
    profileLocal: 'Локальный профиль (на этом устройстве)',
    progressLabel: 'Общий прогресс',
    sound: 'Звук',
    close: 'Закрыть',
  },
  en: {
    title: 'TOJMOT',
    subtitle: 'The mind-gymnastics game',
    modeAi: 'Play the computer',
    modeHotseat: 'Two players',
    playAs: 'I play',
    white: 'White',
    black: 'Black',
    level: 'Level',
    levels: ['Beginner', 'Casual', 'Strong', 'Master'],
    newGame: 'New game',
    undo: 'Undo move',
    flip: 'Flip board',
    hints: 'Show legal moves',
    moves: 'Moves',
    whiteToMove: 'White to move',
    blackToMove: 'Black to move',
    check: 'Toj (check)!',
    checkmate: 'Checkmate!',
    winsWhite: 'White wins',
    winsBlack: 'Black wins',
    stalemate: 'Stalemate — draw',
    drawMaterial: 'Draw — insufficient material',
    drawFifty: 'Draw — fifty-move rule',
    drawRepetition: 'Draw — threefold repetition',
    thinking: 'Computer is thinking…',
    rules: 'Rules',
    promotion: 'Promote X to…',
    rulesIntro:
      'The board has 89 cells. White moves first. A piece captures an enemy piece standing on its path. Piece 1 can never be captured; no piece may enter the zone of 1 (yellow cells) — neither the enemy\'s nor your own. If 1 is in toj (check) and has no move — checkmate.',
    pieces: {
      '1': 'Toj — one step in any of 8 directions. Cannot be captured.',
      '7': 'Any distance in all 8 directions.',
      '8': 'Any distance diagonally (through a cell side).',
      '4': 'Any distance straight (through a cell corner, own colour).',
      '9': 'One step in any of 8 directions.',
      '2': 'One straight step (own colour).',
      '5': 'Jump: 1 straight + 1 sideways (“Г”).',
      '6': 'Jump: 2 straight + 1 sideways.',
      '3': 'Jump: 1 straight + 1 diagonal.',
      X: 'One diagonal step forward. On the opponent\'s Arabic row it becomes any piece 2–9.',
      R: 'Romans (II–IX): one diagonal step forward. Reaching the opponent\'s Arabic row they become the numeral of that cell.',
    },
    footer: 'Tojmot — created by Monolit Toshmatov (2012). Digital version: beta.',
    themeDark: 'Dark mode',
    themeLight: 'Light mode',
    learn: 'Learn',
    play: 'Play',
    points: 'pts',
    next: 'Next',
    gotIt: 'Got it',
    correct: 'Correct!',
    tryAgain: 'Not quite — try again',
    hint: 'Hint (−5)',
    retry: 'Restart',
    lessonsLabel: 'Lesson',
    questsLabel: 'Quest',
    resetProgress: 'Reset',
    allDone: 'Congratulations! All complete',
    navQuests: 'Quests',
    navLeaderboard: 'Ranking',
    navProfile: 'Profile',
    soon: 'Soon',
    finishLessons: 'Finish the lessons first',
    toQuests: 'To the quests',
    profileLocal: 'Local profile (this device)',
    progressLabel: 'Overall progress',
    sound: 'Sound',
    close: 'Close',
  },
};

export function detectLang(): Lang {
  if (typeof window === 'undefined') return 'uz';
  try {
    const saved = window.localStorage.getItem('tojmot.lang') as Lang | null;
    if (saved && DICT[saved]) return saved;
  } catch {
    /* ignore */
  }
  const nav = (navigator.language || 'uz').slice(0, 2);
  return nav === 'ru' ? 'ru' : nav === 'en' ? 'en' : 'uz';
}

export function saveLang(lang: Lang): void {
  try {
    window.localStorage.setItem('tojmot.lang', lang);
  } catch {
    /* ignore */
  }
}
