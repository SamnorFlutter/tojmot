import type { Color, PieceType } from '@tojmot/engine';
import type { Lang } from './i18n';

export type L10n = Record<Lang, string>;

export type Goal =
  | { type: 'read' }
  | { type: 'clickCell'; cell: string }
  | { type: 'reach'; from?: string; cells: string[] }
  | { type: 'capture'; target: string }
  | { type: 'check' }
  | { type: 'mateIn1' }
  | { type: 'promote' }
  | { type: 'safe'; piece: string }
  | { type: 'anyMove' };

export interface LessonDef {
  id: string;
  kind: 'lesson' | 'quest';
  points: number;
  title: L10n;
  text: L10n;
  setup: 'initial' | ReadonlyArray<readonly [string, PieceType, Color]>;
  turn: Color;
  goal: Goal;
  /** Cell highlighted by the hint button (usually the piece to move). */
  hintFrom?: string;
  /** Cells marked on the board from the start. */
  marks?: string[];
}

const K: ReadonlyArray<readonly [string, PieceType, Color]> = [
  ['G1', '1', 'w'],
  ['G17', '1', 'b'],
];

export const LESSONS: LessonDef[] = [
  {
    id: 'board',
    kind: 'lesson',
    points: 10,
    title: { uz: 'Doska', ru: 'Доска', en: 'The board' },
    text: {
      uz: 'Tojmot doskasi 89 katakdan iborat. Ustunlar A–N harflari, qatorlar 1–17 raqamlari bilan belgilanadi. Katak nomi — harf + raqam. G3 katagini toping va bosing!',
      ru: 'Доска Тожмот состоит из 89 клеток. Столбцы обозначены буквами A–N, ряды — числами 1–17. Имя клетки — буква + число. Найдите и нажмите клетку G3!',
      en: 'The Tojmot board has 89 cells. Columns are letters A–N, rows are numbers 1–17. A cell name is letter + number. Find and click cell G3!',
    },
    setup: [],
    turn: 'w',
    goal: { type: 'clickCell', cell: 'G3' },
    hintFrom: 'G3',
  },
  {
    id: 'toj',
    kind: 'lesson',
    points: 10,
    title: { uz: '«1» — Toj', ru: '«1» — Тож', en: '1 — the Toj' },
    text: {
      uz: '«1» — bosh dona (Toj). U 8 tomonga 1 katak yuradi va HECH QACHON olinmaydi. Toj bilan belgilangan kataklardan biriga yuring.',
      ru: '«1» — главная фигура (Тож). Ходит на одну клетку в любую из 8 сторон и НИКОГДА не бьётся. Сходите Тожом на одну из отмеченных клеток.',
      en: 'Piece 1 is the Toj — the main piece. It moves one cell in any of 8 directions and can NEVER be captured. Move your Toj to a marked cell.',
    },
    setup: K,
    turn: 'w',
    goal: { type: 'reach', from: 'G1', cells: ['F2', 'H2', 'G3'] },
    hintFrom: 'G1',
    marks: ['F2', 'H2', 'G3'],
  },
  {
    id: 'zone',
    kind: 'lesson',
    points: 10,
    title: { uz: 'Toj hududi', ru: 'Зона Тожа', en: 'The Toj zone' },
    text: {
      uz: 'Sariq kataklar — Toj hududi. Raqib donalari bu hududga KIRA OLMAYDI, lekin uzoqdan hujum qilishi mumkin. Toj hududdan chiqishi ham mumkin: G3 dan G5 ga yuring.',
      ru: 'Жёлтые клетки — зона Тожа. Фигуры противника НЕ МОГУТ входить в неё, но могут атаковать издалека. Тож может и выходить из зоны: сходите с G3 на G5.',
      en: 'The yellow cells are the Toj zone. Enemy pieces CANNOT enter it, but they can attack from afar. The Toj may also leave the zone: move from G3 to G5.',
    },
    setup: [['G3', '1', 'w'], ['G17', '1', 'b']],
    turn: 'w',
    goal: { type: 'reach', from: 'G3', cells: ['G5'] },
    hintFrom: 'G3',
    marks: ['G5'],
  },
  {
    id: 'p9',
    kind: 'lesson',
    points: 10,
    title: { uz: '«9»', ru: 'Фигура «9»', en: 'Piece 9' },
    text: {
      uz: '«9» xuddi Toj kabi 8 tomonga 1 katak yuradi, lekin uni olish mumkin. «9» bilan belgilangan kataklardan biriga yuring.',
      ru: '«9» ходит как Тож — на одну клетку в 8 сторон, но её можно бить. Сходите «9» на одну из отмеченных клеток.',
      en: 'Piece 9 moves like the Toj — one cell in 8 directions — but it can be captured. Move the 9 to a marked cell.',
    },
    setup: [...K, ['H4', '9', 'w']],
    turn: 'w',
    goal: { type: 'reach', from: 'H4', cells: ['G5', 'I5', 'H6'] },
    hintFrom: 'H4',
    marks: ['G5', 'I5', 'H6'],
  },
  {
    id: 'p2',
    kind: 'lesson',
    points: 10,
    title: { uz: '«2»', ru: 'Фигура «2»', en: 'Piece 2' },
    text: {
      uz: '«2» to‘g‘ri chiziq bo‘ylab (katak burchagi orqali) 1 qadam yuradi — doim o‘z rangidagi katakka. Belgilangan kataklardan biriga yuring.',
      ru: '«2» ходит на один шаг по прямой (через угол клетки) — всегда на клетку своего цвета. Сходите на одну из отмеченных клеток.',
      en: 'Piece 2 makes one straight step (through a cell corner) — always to a cell of its own colour. Move it to a marked cell.',
    },
    setup: [...K, ['F6', '2', 'w']],
    turn: 'w',
    goal: { type: 'reach', from: 'F6', cells: ['F8', 'F4', 'D6', 'H6'] },
    hintFrom: 'F6',
    marks: ['F8', 'F4', 'D6', 'H6'],
  },
  {
    id: 'p7',
    kind: 'lesson',
    points: 15,
    title: { uz: '«7» — eng kuchli', ru: '«7» — сильнейшая', en: '7 — the strongest' },
    text: {
      uz: '«7» — eng kuchli dona: 8 yo‘nalishda istalgan masofaga yuradi. Yo‘lida turgan raqib donasini oladi. Qora donani oling!',
      ru: '«7» — сильнейшая фигура: ходит на любое расстояние в 8 направлениях и бьёт фигуру на своём пути. Побейте чёрную фигуру!',
      en: 'Piece 7 is the strongest: any distance in 8 directions, capturing what stands in its path. Capture the black piece!',
    },
    setup: [...K, ['G5', '7', 'w'], ['G13', '8', 'b']],
    turn: 'w',
    goal: { type: 'capture', target: 'G13' },
    hintFrom: 'G5',
    marks: ['G13'],
  },
  {
    id: 'p8',
    kind: 'lesson',
    points: 15,
    title: { uz: '«8»', ru: 'Фигура «8»', en: 'Piece 8' },
    text: {
      uz: '«8» katak tomoni orqali (45°) istalgan masofaga yuradi. Qora «5» ni oling!',
      ru: '«8» ходит по диагонали (через сторону клетки) на любое расстояние. Побейте чёрную «5»!',
      en: 'Piece 8 slides diagonally (through a cell side) any distance. Capture the black 5!',
    },
    setup: [...K, ['F4', '8', 'w'], ['B8', '5', 'b']],
    turn: 'w',
    goal: { type: 'capture', target: 'B8' },
    hintFrom: 'F4',
    marks: ['B8'],
  },
  {
    id: 'p4',
    kind: 'lesson',
    points: 15,
    title: { uz: '«4»', ru: 'Фигура «4»', en: 'Piece 4' },
    text: {
      uz: '«4» to‘g‘ri chiziq bo‘ylab (o‘z rangida) istalgan masofaga yuradi. Qora «2» ni oling!',
      ru: '«4» ходит по прямой (свой цвет) на любое расстояние. Побейте чёрную «2»!',
      en: 'Piece 4 slides straight (own colour) any distance. Capture the black 2!',
    },
    setup: [...K, ['L4', '4', 'w'], ['L12', '2', 'b']],
    turn: 'w',
    goal: { type: 'capture', target: 'L12' },
    hintFrom: 'L4',
    marks: ['L12'],
  },
  {
    id: 'p3',
    kind: 'lesson',
    points: 15,
    title: { uz: '«3» — sakrovchi', ru: '«3» — прыгун', en: '3 — the jumper' },
    text: {
      uz: '«3» sakraydi: 1 to‘g‘ri + 1 diagonal, boshqa donalar USTIDAN. O‘z donalaringiz halaqit bermaydi — qora «9» ni oling!',
      ru: '«3» прыгает: 1 по прямой + 1 по диагонали, ПЕРЕПРЫГИВАЯ через фигуры. Свои фигуры не мешают — побейте чёрную «9»!',
      en: 'Piece 3 jumps: 1 straight + 1 diagonal, OVER other pieces. Your own pieces are no obstacle — capture the black 9!',
    },
    setup: [...K, ['N4', '3', 'w'], ['M5', 'III', 'w'], ['N6', '2', 'w'], ['M7', '9', 'b']],
    turn: 'w',
    goal: { type: 'capture', target: 'M7' },
    hintFrom: 'N4',
    marks: ['M7'],
  },
  {
    id: 'p5',
    kind: 'lesson',
    points: 15,
    title: { uz: '«5»', ru: 'Фигура «5»', en: 'Piece 5' },
    text: {
      uz: '«5» «Г» harfi shaklida sakraydi: 1 to‘g‘ri + 1 yonga. Qora donani oling!',
      ru: '«5» прыгает буквой «Г»: 1 по прямой + 1 вбок. Побейте чёрную фигуру!',
      en: 'Piece 5 jumps in an L: 1 straight + 1 sideways. Capture the black piece!',
    },
    setup: [...K, ['D4', '5', 'w'], ['F6', 'IV', 'b']],
    turn: 'w',
    goal: { type: 'capture', target: 'F6' },
    hintFrom: 'D4',
    marks: ['F6'],
  },
  {
    id: 'p6',
    kind: 'lesson',
    points: 15,
    title: { uz: '«6»', ru: 'Фигура «6»', en: 'Piece 6' },
    text: {
      uz: '«6» ham sakraydi, lekin uzunroq: 2 to‘g‘ri + 1 yonga. Qora donani oling!',
      ru: '«6» тоже прыгает, но дальше: 2 по прямой + 1 вбок. Побейте чёрную фигуру!',
      en: 'Piece 6 also jumps, but farther: 2 straight + 1 sideways. Capture the black piece!',
    },
    setup: [...K, ['J4', '6', 'w'], ['L8', 'V', 'b']],
    turn: 'w',
    goal: { type: 'capture', target: 'L8' },
    hintFrom: 'J4',
    marks: ['L8'],
  },
  {
    id: 'romans',
    kind: 'lesson',
    points: 15,
    title: { uz: 'Rim raqamlari', ru: 'Римские фигуры', en: 'The Romans' },
    text: {
      uz: 'Rim raqamlari (II–IX) — «piyodalar»: faqat OLDINGA, diagonal bo‘ylab 1 katak yuradi va shu yo‘nalishda oladi. IX bilan qora donani oling!',
      ru: 'Римские (II–IX) — «пешки»: ходят только ВПЕРЁД по диагонали на 1 клетку и так же бьют. Побейте чёрную фигуру фигурой IX!',
      en: 'Romans (II–IX) are the “pawns”: they move only FORWARD, one cell diagonally, and capture the same way. Capture the black piece with your IX!',
    },
    setup: [...K, ['G5', 'IX', 'w'], ['H6', 'II', 'b']],
    turn: 'w',
    goal: { type: 'capture', target: 'H6' },
    hintFrom: 'G5',
    marks: ['H6'],
  },
  {
    id: 'promo',
    kind: 'lesson',
    points: 20,
    title: { uz: 'Aylanish', ru: 'Превращение', en: 'Promotion' },
    text: {
      uz: 'Rim donasi raqibning X katagiga (E15 yoki I15) yetsa, o‘z raqamiga aylanadi: IX → 9. G15 ga kirib bo‘lmaydi — bu Toj hududi. IX ni E15 ga yurgizing!',
      ru: 'Римская фигура, дойдя до клетки чужого X (E15 или I15), превращается в свою цифру: IX → 9. На G15 нельзя — это зона Тожа. Сходите IX на E15!',
      en: 'A Roman reaching the enemy X cell (E15 or I15) becomes its number: IX → 9. G15 is off-limits — the Toj zone. Move your IX to E15!',
    },
    setup: [...K, ['F14', 'IX', 'w']],
    turn: 'w',
    goal: { type: 'promote' },
    hintFrom: 'F14',
    marks: ['E15'],
  },
  {
    id: 'xpiece',
    kind: 'lesson',
    points: 20,
    title: { uz: 'X donasi', ru: 'Фигура X', en: 'The X piece' },
    text: {
      uz: 'X ham rimliklar kabi yuradi, lekin raqibning X katagida 2–9 dan ISTALGAN donaga aylanadi. X ni I15 ga yurgizing va donani tanlang!',
      ru: 'X ходит как римские, но на клетке чужого X превращается в ЛЮБУЮ фигуру 2–9. Сходите X на I15 и выберите фигуру!',
      en: 'X moves like the Romans, but on the enemy X cell it becomes ANY piece 2–9. Move X to I15 and pick a piece!',
    },
    setup: [...K, ['J14', 'X', 'w']],
    turn: 'w',
    goal: { type: 'promote' },
    hintFrom: 'J14',
    marks: ['I15'],
  },
  {
    id: 'check',
    kind: 'lesson',
    points: 20,
    title: { uz: 'Toj (kisht)', ru: 'Тож (шах)', en: 'Toj (check)' },
    text: {
      uz: 'Toj donasiga hujum «toj» (kisht) deyiladi. Raqib darhol qutulishi shart. «7» bilan qora Tojga kisht bering!',
      ru: 'Атака на Тожа называется «тож» (шах). Противник обязан немедленно спасаться. Дайте шах чёрному Тожу фигурой «7»!',
      en: 'An attack on the Toj is called “toj” (check). The opponent must escape at once. Give check to the black Toj with your 7!',
    },
    setup: [...K, ['C9', '7', 'w']],
    turn: 'w',
    goal: { type: 'check' },
    hintFrom: 'C9',
  },
  {
    id: 'defend',
    kind: 'lesson',
    points: 20,
    title: { uz: 'Kishtdan himoya', ru: 'Защита от шаха', en: 'Escaping check' },
    text: {
      uz: 'Tojingiz kisht ostida! Qutulish yo‘llari: Toj bilan chetga yurish yoki dona bilan to‘sish (8 → G5). Istalgan qonuniy yurishni qiling.',
      ru: 'Ваш Тож под шахом! Пути спасения: уйти Тожом или закрыться фигурой (8 → G5). Сделайте любой законный ход.',
      en: 'Your Toj is in check! You can move the Toj away or block with a piece (8 → G5). Make any legal move.',
    },
    setup: [...K, ['F4', '8', 'w'], ['G9', '4', 'b']],
    turn: 'w',
    goal: { type: 'anyMove' },
    hintFrom: 'F4',
  },
  {
    id: 'mate',
    kind: 'lesson',
    points: 30,
    title: { uz: 'Mot', ru: 'Мат', en: 'Checkmate' },
    text: {
      uz: 'Kishtdan qutulishning iloji bo‘lmasa — MOT, o‘yin tugaydi. «7» bilan 1 yurishda mot qo‘ying! (9 allaqachon H16, G15 ni nazorat qiladi.)',
      ru: 'Если от шаха нет спасения — МАТ, партия окончена. Поставьте мат в один ход фигурой «7»! (Ваша 9 уже держит H16 и G15.)',
      en: 'When there is no escape from check — CHECKMATE, the game ends. Mate in one with your 7! (Your 9 already covers H16 and G15.)',
    },
    setup: [...K, ['E13', '7', 'w'], ['I15', '9', 'w']],
    turn: 'w',
    goal: { type: 'mateIn1' },
    hintFrom: 'E13',
  },
  {
    id: 'draws',
    kind: 'lesson',
    points: 10,
    title: { uz: 'Durang', ru: 'Ничья', en: 'Draws' },
    text: {
      uz: 'Durang bo‘ladi: pot (kisht yo‘q, yurish ham yo‘q), donalar yetarli emas (Toj Tojga qarshi), holat 3 marta takrorlansa yoki 50 yurish olishsiz o‘tsa. Endi kvestlarga o‘ting!',
      ru: 'Ничья бывает: пат (шаха нет, но и ходов нет), недостаточно фигур (Тож против Тожа), троекратное повторение позиции или 50 ходов без взятий. Теперь — к квестам!',
      en: 'Draws happen by: stalemate (no check, but no moves), bare Tojs, threefold repetition, or 50 moves without a capture. Now — on to the quests!',
    },
    setup: 'initial',
    turn: 'w',
    goal: { type: 'read' },
  },
  // ---------------- Quests ----------------
  {
    id: 'q-mate1',
    kind: 'quest',
    points: 30,
    title: { uz: 'Kvest: 1 yurishda mot', ru: 'Квест: мат в 1 ход', en: 'Quest: mate in one' },
    text: {
      uz: 'Oq yuradi va mot qo‘yadi. Yagona to‘g‘ri yo‘nalishni toping!',
      ru: 'Белые ходят и ставят мат. Найдите решающий ход!',
      en: 'White to move and mate. Find the winning move!',
    },
    setup: [...K, ['C13', '7', 'w'], ['I15', '9', 'w'], ['L10', '4', 'b']],
    turn: 'w',
    goal: { type: 'mateIn1' },
    hintFrom: 'C13',
  },
  {
    id: 'q-fork',
    kind: 'quest',
    points: 30,
    title: { uz: 'Kvest: vilka', ru: 'Квест: вилка', en: 'Quest: the fork' },
    text: {
      uz: '«3» ning shunday yurishini topingki, u bir vaqtda raqibning 7 va 8 donalariga hujum qilsin!',
      ru: 'Найдите ход фигурой «3», который нападёт СРАЗУ на «7» и «8» противника!',
      en: 'Find the move of your 3 that attacks BOTH the enemy 7 and 8 at once!',
    },
    setup: [...K, ['F6', '3', 'w'], ['H12', '7', 'b'], ['J10', '8', 'b']],
    turn: 'w',
    goal: { type: 'reach', from: 'F6', cells: ['G9'] },
    hintFrom: 'F6',
  },
  {
    id: 'q-counter',
    kind: 'quest',
    points: 30,
    title: { uz: 'Kvest: eng yaxshi himoya', ru: 'Квест: лучшая защита', en: 'Quest: best defence' },
    text: {
      uz: 'Sizning «7» donangiz hujum ostida! Eng yaxshi himoya — hujum: xuddi shu chiziq bo‘ylab qora «8» ni oling!',
      ru: 'Ваша «7» под боем! Лучшая защита — нападение: побейте чёрную «8» по той же линии!',
      en: 'Your 7 is attacked! The best defence is attack: capture the black 8 along the same line!',
    },
    setup: [...K, ['G5', '7', 'w'], ['C9', '8', 'b']],
    turn: 'w',
    goal: { type: 'capture', target: 'C9' },
    hintFrom: 'G5',
  },
  {
    id: 'q-promo7',
    kind: 'quest',
    points: 40,
    title: { uz: 'Kvest: yangi «7»', ru: 'Квест: новая «7»', en: 'Quest: a new 7' },
    text: {
      uz: 'X ni raqibning X katagiga olib boring va eng kuchli donani tanlang — «7»!',
      ru: 'Проведите X на клетку чужого X и выберите сильнейшую фигуру — «7»!',
      en: 'Take your X to the enemy X cell and choose the strongest piece — the 7!',
    },
    setup: [...K, ['H14', 'X', 'w']],
    turn: 'w',
    goal: { type: 'promote' },
    hintFrom: 'H14',
    marks: ['I15'],
  },
  {
    id: 'q-mate2',
    kind: 'quest',
    points: 40,
    title: { uz: 'Kvest: mot №2', ru: 'Квест: мат №2', en: 'Quest: mate #2' },
    text: {
      uz: 'Endi «8» bilan mot qo‘ying. Diagonal chiziqni toping!',
      ru: 'Теперь поставьте мат фигурой «8». Найдите диагональ!',
      en: 'Now mate with the 8. Find the diagonal!',
    },
    setup: [...K, ['C13', '8', 'w'], ['I15', '9', 'w']],
    turn: 'w',
    goal: { type: 'mateIn1' },
    hintFrom: 'C13',
  },
  {
    id: 'q-jump7',
    kind: 'quest',
    points: 50,
    title: { uz: 'Kvest: sakrab olish', ru: 'Квест: прыжок за «7»', en: 'Quest: jump the 7' },
    text: {
      uz: 'Raqibning «7» donasini bitta sakrash bilan oling! Qaysi dona buni uddalaydi?',
      ru: 'Побейте «7» противника одним прыжком! Какая фигура это умеет?',
      en: 'Capture the enemy 7 with a single jump! Which piece can do it?',
    },
    setup: [...K, ['H4', '6', 'w'], ['J8', '7', 'b']],
    turn: 'w',
    goal: { type: 'capture', target: 'J8' },
    hintFrom: 'H4',
    marks: [],
  },
];

export const TOTAL_POINTS = LESSONS.reduce((s, l) => s + l.points, 0);
