// Génère les bannières du blog et de /experience, d'après deux planches données par Kylian : une
// carte par techno, le logo en relief et le nom en gros gras à côté, sur un fond balayé de
// rubans, la capture du projet derrière. L'image reste nette : le site la redessine à travers son
// calque pixel (UiPixelImage), dont la forme et la couleur des trous changent avec le chargement
// et le mode. L'OG d'un article reçoit ce calque figé (satori ne fait pas tourner de canvas),
// comme scripts/og-dither.ts fige le champ dither. Couleurs du sol, des rubans et du nom : les
// tokens de app/assets/css/theme.css.
//
// Par bannière, dans public/images/<clé>/ : cover.jpg (clair : le `bannerImage` d'un article,
// l'`image` d'une entrée de app/utils/career.ts), cover-dark.jpg (sombre) et, pour le blog,
// cover-og.png (le calque figé, l'OG est sombre). JPEG via ImageMagick (comme og-dither.ts) : en
// PNG, la capture du fond pèse 2 Mo par bannière. Une nouvelle : une entrée dans BANNERS, son
// logo dans LOGOS (ou scripts/banners/) s'il en faut un nouveau.
//
// usage: bun scripts/banners.ts [clé…]   (toutes sans argument ; puis `bun run build` et
// scripts/og-smoke.sh --update si la bannière de /blog/gwm a changé)
import { Resvg, type RenderedImage } from '@resvg/resvg-js'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { SHAPE_CELL_PX } from '../app/utils/dither'

// Dessinée sur 1600 × 900, écrite en 2400 × 1350 : l'en-tête d'article (~1170 px de large) net
// en densité 2
const W = 1600
const H = 900
const OUT_W = 2400
const FONT = 'scripts/banners/Inter-ExtraBold.ttf' // Inter 28pt ExtraBold, OFL
const FAMILY = 'Inter 28pt'
// Le sous-titre des logos Jewely : l’Inter régulier des OG (famille « Inter » pour resvg)
const SUBTITLE_FONT = 'public/fonts/inter/InterOG-400.ttf'
// Le sujet (logo + nom) tient dans la zone que gardent tous les recadrages en `cover`, du 16:11
// du notch au ~4:1 de l'en-tête d'article : ~70 % de la largeur, ~40 % de la hauteur. Aussi
// grand que ça : au repos, à travers le calque, une carte n'a qu'une vingtaine de cellules de haut.
const SAFE_W = 1120
const LOGO_H = 360
// Le calque de l'OG : la boîte de la bannière dans OgImage/Blog.satori.vue, ses trous à son fond,
// en cercles (la forme d'une page se tire au hasard au chargement, l'OG en fige une)
const OG_BOX = { w: 290, h: 168, gap: '#0f0f12' }
const OG_CELL = SHAPE_CELL_PX.circle

type Mode = 'light' | 'dark'
type Rgb = [number, number, number]

// --- Tokens ---------------------------------------------------------------------------------

const css = readFileSync('app/assets/css/theme.css', 'utf8')
const token = (name: string): string => {
  const hex = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1]
  if (!hex) throw new Error(`token --color-${name} introuvable dans theme.css`)
  return hex
}
const rgb = (hex: string): Rgb => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb
const hex = (c: Rgb) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
/** `a` vers `b` de `t` (color-mix in srgb) */
const mix = (a: string, b: string, t: number) => {
  const [x, y] = [rgb(a), rgb(b)]
  return hex(x.map((v, i) => v + (y[i]! - v) * t) as Rgb)
}

/** Une teinte du site en cinq tons, de l'ombre du ruban à son reflet */
function ramp(name: string, mode: Mode) {
  const [c500, c600] = [token(`${name}-500`), token(`${name}-600`)]
  const ground = mode === 'light' ? '#ffffff' : token('neutral-950')
  return {
    deep: mix(c600, '#000000', mode === 'light' ? 0.32 : 0.5),
    base: mode === 'light' ? c600 : mix(c600, '#000000', 0.18),
    mid: c500,
    soft: mix(c500, ground, 0.45),
    shine: mix(c500, '#ffffff', mode === 'light' ? 0.75 : 0.55),
  }
}

function palette(mode: Mode) {
  return mode === 'light'
    ? {
        center: '#ffffff',
        edge: mix(token('neutral-50'), token('neutral-100'), 0.6),
        text: token('neutral-950'),
        metal: [token('neutral-300'), '#ffffff', token('neutral-400')],
        shadow: 0.22,
        veil: [0.82, 0.55, 0.2],
        tone: [0.75, 0.25],
        halo: 0.7,
      }
    : {
        center: token('neutral-900'),
        edge: '#0f0f0f', // --panel-bg en sombre
        text: token('neutral-50'),
        metal: [token('neutral-600'), token('neutral-300'), token('neutral-700')],
        shadow: 0.55,
        veil: [0.8, 0.45, 0.12],
        tone: [0.5, 0],
        halo: 0.7,
      }
}

// --- Logos ----------------------------------------------------------------------------------

const icons = JSON.parse(
  readFileSync('node_modules/@iconify-json/simple-icons/icons.json', 'utf8'),
) as { icons: Record<string, { body: string }> }
const simpleIcon = (name: string, color: string) => ({
  box: '0 0 24 24',
  body: () => icons.icons[name]!.body.replace('currentColor', color),
})

/** Une image en PNG (ImageMagick convertit le reste), et sa taille */
function png(file: string) {
  let data = readFileSync(file)
  if (data.readUInt32BE(0) !== 0x89504e47) data = execFileSync('magick', [file, 'png:-'])
  return { data, w: data.readUInt32BE(16), h: data.readUInt32BE(20) }
}

/** Un logo SVG de scripts/banners/, ses couleurs remplacées en sombre (`dark` : [de, vers]) */
function svgFile(name: string, dark: [string, string][] = []) {
  const svg = readFileSync(`scripts/banners/${name}.svg`, 'utf8')
  const inner = svg.slice(svg.indexOf('>', svg.indexOf('<svg')) + 1, svg.lastIndexOf('</svg>'))
  return {
    box: svg.match(/viewBox="([^"]+)"/)![1]!,
    body: (mode: Mode) =>
      mode === 'light' ? inner : dark.reduce((s, [from, to]) => s.replaceAll(from, to), inner),
  }
}

/**
 * Le logo d'un produit Jewely, sur le modèle de celui du configurateur : JEWELY, et le nom du
 * produit dessous en capitales espacées. Le sous-titre d'origine (CONFIGURATOR, dessiné) donne
 * la mesure : hauteur de capitale 35,9, centré, de même chasse.
 */
function jewelyLogo(product: string) {
  const svg = readFileSync('scripts/banners/jewely-configurator.svg', 'utf8')
  const style = svg.slice(svg.indexOf('<defs>'), svg.indexOf('</defs>') + 7)
  const jewely = svg.match(/<g>[\s\S]*?<\/g>/)![0]
  return {
    box: '0 0 709 168.8',
    body: (mode: Mode) => {
      const ink = mode === 'light' ? '#000' : '#fff'
      return `${style.replace('fill: #000', `fill: ${ink}`)}${jewely}
        <text x="354.5" y="166.2" text-anchor="middle" font-family="Inter" font-weight="400" font-size="47.9" letter-spacing="4.8" fill="${ink}">${product}</text>`
    },
  }
}

/** Un logo raster carré et opaque (public/images/logos) : une tuile aux coins arrondis */
function tile(file: string) {
  const { data, w, h } = png(file)
  const id = `tile-${file.replace(/\W/g, '')}`
  return {
    box: `0 0 ${w} ${h}`,
    body: () => `<clipPath id="${id}"><rect width="${w}" height="${h}" rx="${w * 0.2}"/></clipPath>
      <image width="${w}" height="${h}" clip-path="url(#${id})" href="data:image/png;base64,${data.toString('base64')}"/>`,
  }
}

/** Un logo : son SVG intérieur dans `box`, selon le mode quand ses couleurs en dépendent */
const LOGOS: Record<string, { box: string; body: (mode: Mode) => string }> = {
  // docs/_assets/logo{,-light}.svg de gwm-cli : le tronc, ses branches, trois worktrees
  gwm: {
    box: '0 0 24 24',
    body: (mode) => {
      const [trunk, ring, nodes] =
        mode === 'light'
          ? ['#1a1a1a', '#f5f5f5', ['#2563eb', '#16a34a', '#c15f3c']]
          : ['#e0e0e0', '#1a1a1a', ['#7ab8ff', '#86e89a', '#d4825d']]
      return `<path d="M4.5 4.75 H7 V9.75 H15 V12.25 H7 V17.25 H15 V19.75 H4.5 Z" fill="${trunk}"/>
        <rect x="3" y="2" width="5.5" height="5.5" fill="${nodes[0]}" stroke="${ring}"/>
        <rect x="14.5" y="8.25" width="5.5" height="5.5" fill="${nodes[1]}" stroke="${ring}"/>
        <rect x="14.5" y="15.75" width="5.5" height="5.5" fill="${nodes[2]}" stroke="${ring}"/>`
    },
  },
  // L'étoile de Starlight (withastro/starlight, docs/public/favicon.svg, MIT)
  starlight: {
    box: '0 0 25 26',
    body: () => `<defs><linearGradient id="star" x1="2.5" x2="21.61" y1="2.65" y2="25.4" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FCDF9C"/><stop offset="1" stop-color="#DA990B"/></linearGradient></defs>
      <g fill="url(#star)">
        <path fill-rule="evenodd" d="M15.22 7.77 12.06.94 8.91 7.77l-.15.29L7 6.3a1.18 1.18 0 1 0-1.68 1.68l1.75 1.74-.2.1-.04.02L0 13l6.83 3.16.24.11-1.75 1.76A1.18 1.18 0 1 0 7 19.7l1.76-1.76.15.3 3.15 6.82 3.16-6.83.12-.24 1.71 1.71a1.18 1.18 0 1 0 1.68-1.67L17 16.3l.29-.15L24.13 13 17.3 9.84 17 9.7l1.73-1.73a1.18 1.18 0 1 0-1.68-1.67L15.35 8a4.15 4.15 0 0 1-.12-.21l-.01-.03Zm-3.17.36-.42.9a7.27 7.27 0 0 1-3.55 3.55l-.9.42.9.42a7.27 7.27 0 0 1 3.55 3.55l.42.9.42-.9a7.27 7.27 0 0 1 3.55-3.55l.9-.42-.9-.42a7.27 7.27 0 0 1-3.55-3.55l-.42-.9Z"/>
        <path d="M22.27 4.43a1.18 1.18 0 1 0-1.67-1.68l-.57.57a1.18 1.18 0 0 0 1.68 1.67l.56-.56Z"/>
        <path d="M4.2 5.18c-.46.46-1.2.46-1.67 0l-.56-.56a1.18 1.18 0 0 1 1.67-1.68l.57.57c.46.46.46 1.2 0 1.67Z"/>
        <path d="M4.2 20.82a1.18 1.18 0 0 0-1.67 0l-.56.56a1.18 1.18 0 0 0 1.67 1.68l.57-.57c.46-.46.46-1.2 0-1.67Z"/>
        <path d="M22.27 21.57a1.18 1.18 0 0 1-1.67 1.68l-.57-.57a1.19 1.19 0 0 1 1.68-1.67l.56.56Z"/>
      </g>`,
  },
  go: simpleIcon('go', '#00ADD8'),
  // Le logo complet de Fiches Pédagogiques (le nom est dedans) : son bleu passe au blanc en
  // sombre, comme sa variante `white`
  'fiches-pedagogiques': svgFile('fiches-pedagogiques', [['#0265b2', '#ffffff']]),
  // Jewely : le diamant, et le nom de chaque produit (celui du configurateur est d'origine) ;
  // noirs, blancs en sombre
  jewely: svgFile('jewely', [['fill: #000', 'fill: #fff']]),
  'jewely-configurator': svgFile('jewely-configurator', [['fill: #000', 'fill: #fff']]),
  'jewely-ecommerce': jewelyLogo('E-COMMERCE'),
  'jewely-erp': jewelyLogo('ERP'),
  'jewely-x-flippad': tile('public/images/logos/jewely-x-flippad.png'),
  'assmat-facile': svgFile('assmat-facile'),
  mns: svgFile('mns'),
  'virtual-immersion': tile('public/images/logos/virtual-immersion.png'),
  cci: tile('public/images/logos/cci.jpg'),
  // Une fenêtre de terminal : ses trois feux, l'invite
  terminal: {
    box: '0 0 24 24',
    body: (
      mode,
    ) => `<rect x="1" y="3" width="22" height="18" rx="3.5" fill="${mode === 'light' ? '#1a1a1a' : '#2a2a2a'}"/>
      <circle cx="4.6" cy="6.4" r="1" fill="${token('red-500')}"/>
      <circle cx="7.6" cy="6.4" r="1" fill="${token('yellow-500')}"/>
      <circle cx="10.6" cy="6.4" r="1" fill="${token('green-500')}"/>
      <path d="M5.5 10.5 9.5 13.5 5.5 16.5" fill="none" stroke="${token('green-500')}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="11.5" y="15.4" width="7" height="2.1" rx="1" fill="${token('primary-400')}"/>`,
  },
}

// --- Bannières -------------------------------------------------------------------------------

/**
 * Une bannière, par son dossier sous public/images : le logo (ou deux), le nom (vide quand le logo
 * le porte), la teinte des rubans (en haut à gauche, en bas à droite), et la capture du projet au
 * fond, recadrée à `crop` [x, y, w, h] s'il le faut ; sans capture, le sol seul
 */
type Banner = {
  logos: string[]
  name: string
  tints: [string, string]
  shot?: string
  crop?: [number, number, number, number]
}
const BANNERS: Record<string, Banner> = {
  'blog/gwm': {
    logos: ['gwm'],
    name: 'gwm',
    tints: ['primary', 'primary'],
    shot: 'public/images/blog/gwm/hero.png',
  },
  'blog/gwm-docs': {
    logos: ['starlight'],
    name: 'Starlight',
    tints: ['purple', 'purple'],
    shot: 'public/images/blog/gwm-docs/en/landing.png',
  },
  'blog/lazycurl': {
    logos: ['go'],
    name: 'LazyCurl',
    tints: ['blue', 'blue'],
    shot: 'public/images/blog/lazycurl/banner.png',
    crop: [148, 228, 1912, 1192], // la fenêtre, sans le fond d'écran autour
  },
  'blog/fiches-pedagogiques': {
    logos: ['fiches-pedagogiques'],
    name: '',
    tints: ['blue', 'primary'],
    shot: 'public/images/blog/fiches-pedagogiques/fp-new.png',
  },
  'blog/dotfiles': {
    logos: ['terminal'],
    name: 'dotfiles',
    tints: ['cyan', 'cyan'],
    shot: 'public/images/blog/dotfiles/banner.png',
  },
  // /experience : les postes, les projets, les études (app/utils/career.ts), en lignes de métro
  'parcours/flippad': {
    logos: ['jewely-x-flippad'],
    name: 'Jewely × Flippad',
    tints: ['primary', 'primary'],
    shot: 'public/images/projects/jewely-x-flippad.webp',
  },
  'parcours/virtual-immersion': {
    logos: ['virtual-immersion'],
    name: 'Virtual Immersion',
    tints: ['green', 'green'],
  },
  'parcours/jewely-ecommerce': {
    logos: ['jewely', 'jewely-ecommerce'],
    name: '',
    tints: ['yellow', 'yellow'],
    shot: 'public/images/projects/jewely-ecommerce.webp',
  },
  'parcours/fiches-pedagogiques': {
    logos: ['fiches-pedagogiques'],
    name: '',
    tints: ['blue', 'primary'],
    shot: 'public/images/projects/fiches-pedagogiques.webp',
  },
  'parcours/jewely-configurator': {
    logos: ['jewely', 'jewely-configurator'],
    name: '',
    tints: ['cyan', 'cyan'],
    shot: 'public/images/projects/jewely-configurator.webp',
  },
  'parcours/assmat-facile': {
    logos: ['assmat-facile'],
    name: 'Assmat Facile',
    tints: ['purple', 'red'],
    shot: 'public/images/projects/assmat-facile.webp',
  },
  'parcours/jewely-erp': {
    logos: ['jewely', 'jewely-erp'],
    name: '',
    tints: ['blue', 'blue'],
    shot: 'public/images/projects/jewely-erp.webp',
  },
  'parcours/mns-master': { logos: ['mns'], name: 'Master', tints: ['primary', 'primary'] },
  'parcours/mns-licence': { logos: ['mns'], name: 'Licence', tints: ['primary', 'primary'] },
  'parcours/cci-bac2': { logos: ['cci'], name: 'BAC+2', tints: ['blue', 'red'] },
}

// --- Dessin ---------------------------------------------------------------------------------

const resvgOptions = {
  font: { fontFiles: [FONT, SUBTITLE_FONT], loadSystemFonts: false, defaultFontFamily: FAMILY },
}

/**
 * Le cadre de l'encre d'un SVG (resvg). `innerBBox` rend `undefined` sur certains contenus (un
 * texte « ERP », le logo de MNS) : le cadre géométrique, `getBBox`, prend le relais.
 */
function inkBox(svg: string) {
  const resvg = new Resvg(svg, resvgOptions)
  const box = resvg.innerBBox() ?? resvg.getBBox()
  if (!box) throw new Error('rien à mesurer')
  return box
}

type Point = [number, number]
const bezier = (p: Point[], t: number): Point => {
  const u = 1 - t
  const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t]
  return [0, 1].map((i) => k.reduce((s, w, j) => s + w * p[j]![i]!, 0)) as Point
}

/**
 * Un ruban le long de la courbe `p` (Bézier cubique), large de `width` au milieu et effilé aux
 * bouts : son contour, et ses deux bords (`side` -1 / 1) pour le dégradé et les filets.
 */
function ribbon(p: Point[], width: number, taper = 0.55) {
  const N = 64
  const left: Point[] = []
  const right: Point[] = []
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const [a, b] = [bezier(p, Math.max(0, t - 0.01)), bezier(p, Math.min(1, t + 0.01))]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
    const n: Point = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len]
    const half = (width / 2) * Math.sin(Math.PI * t) ** taper
    const c = bezier(p, t)
    left.push([c[0] + n[0] * half, c[1] + n[1] * half])
    right.push([c[0] - n[0] * half, c[1] - n[1] * half])
  }
  const d = (pts: Point[]) => pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')
  return {
    outline: `M${d(left)} L${d(right.toReversed())} Z`,
    edge: (side: -1 | 1) => `M${d(side === 1 ? left : right)}`,
    across: [left[N / 2]!, right[N / 2]!] as [Point, Point],
  }
}

let gradients = 0
/** Un dégradé linéaire de `from` à `to`, ses arrêts répartis */
function gradient(defs: string[], from: Point, to: Point, stops: string[]) {
  const id = `g${gradients++}`
  defs.push(
    `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${from[0]}" y1="${from[1]}" x2="${to[0]}" y2="${to[1]}">${stops
      .map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`)
      .join('')}</linearGradient>`,
  )
  return `url(#${id})`
}

/**
 * Les rubans d'un coin, dessinés pour le haut gauche (le bas droit en est la rotation) : un large
 * ruban satiné, un plus fin et plus clair derrière lui, un filet de métal qui longe le premier.
 */
function corner(defs: string[], tint: string, mode: Mode) {
  const r = ramp(tint, mode)
  const pal = palette(mode)
  const back = ribbon(
    [
      [-160, 470],
      [140, 300],
      [260, 40],
      [660, -120],
    ],
    120,
  )
  const main = ribbon(
    [
      [-140, 640],
      [260, 380],
      [330, 120],
      [900, -110],
    ],
    190,
    0.7,
  )
  const filet = ribbon(
    [
      [-120, 760],
      [330, 470],
      [430, 170],
      [1020, -90],
    ],
    7,
    0.9,
  )
  const [a, b] = main.across
  return `
    <path d="${back.outline}" fill="${gradient(defs, ...back.across, [r.soft, r.shine, r.mid])}"/>
    <path d="${main.outline}" fill="#000" opacity="${pal.shadow}" filter="url(#soft)" transform="translate(12 22)"/>
    <path d="${main.outline}" fill="${gradient(defs, a, b, [r.shine, r.mid, r.base, r.deep, r.base])}"/>
    <path d="${main.edge(1)}" fill="none" stroke="${r.shine}" stroke-width="5" opacity=".9" filter="url(#glow)"/>
    <path d="${filet.outline}" fill="${gradient(defs, [0, 700], [900, 0], [pal.metal[0]!, pal.metal[1]!, pal.metal[2]!, pal.metal[1]!])}"/>`
}

/** Un tirage pseudo-aléatoire (xorshift32) semé par `text` : le même à chaque génération */
function seeded(text: string) {
  let state =
    [...text].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0 || 1
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return (state >>> 0) / 0x100000000
  }
}
type Random = () => number

/**
 * Les lignes de métro d'un coin, le motif de /experience (le blog a ses rubans), après la carte
 * de son héros : dessinées pour le haut droit, le bas gauche en est la rotation. Un faisceau de
 * 2 à 4 lignes parallèles, tiré au sort par bannière (`rand`, semé par sa clé : le même en clair
 * et en sombre) : elles entrent par le bord droit, tournent à 45°, puis sortent par le haut ou
 * filent à plat vers un terminus. L'écart reste constant dans les coudes (décalage parallèle),
 * et tout reste au-dessus du sujet (y < 250). Chaque ligne est un tube : son ombre, son flanc
 * sombre, sa face, un reflet en haut à gauche ; des stations à ses coudes et à son terminus.
 */
function metro(defs: string[], tint: string, mode: Mode, rand: Random) {
  const r = ramp(tint, mode)
  const pal = palette(mode)
  const between = (a: number, b: number) => a + rand() * (b - a)
  const pick = <T>(items: T[]) => items[Math.floor(rand() * items.length)]!
  const n = pick([2, 3, 3, 4])
  const gap = between(50, 64)
  const step = gap * Math.SQRT2 // l'écart des diagonales, en x - y
  // Le premier coude reste dans le recadrage 16:10 de /experience (x < 1520), aucun hors champ
  const y0 = between(60, Math.max(61, 250 - (n - 1) * gap))
  const d0 = between(1360, 1500) - y0
  const flat = rand() < 0.5 // vers un terminus, sinon par le haut
  const top0 = flat ? between(Math.max(20, y0 - 160), y0 - 60) : between(-20, y0 - 50)
  const run = between(160, 320)
  const tones: [string, string, string][] = [
    [r.base, r.deep, r.shine],
    [mix(r.mid, pal.center, 0.3), r.base, mix(r.shine, '#ffffff', 0.3)],
    [pal.metal[2]!, pal.metal[0]!, pal.metal[1]!],
  ]
  const tubes: string[] = []
  const stations: Point[] = []
  for (let i = 0; i < n; i++) {
    const [y, d] = [y0 + i * gap, d0 - i * step]
    // Le second coude : à plat, décalé de l'écart ; vers le haut, sur la verticale décalée
    const top = flat ? top0 + i * gap : top0 + i * (step - gap)
    const bends: Point[] = [
      [d + y, y],
      [d + top, top],
    ]
    const end = flat ? `H${d + top - run}` : 'V-60'
    const path = `M${W + 120} ${y} L${bends.map(([x, by]) => `${x} ${by}`).join(' L')} ${end}`
    const w = i === 0 ? 40 : pick([20, 26, 32])
    const [face, flank, light] = i === 0 ? tones[0]! : pick(tones)
    const stroke = (color: string, width: number, extra = '') =>
      `<path d="${path}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`
    tubes.push(
      stroke('#000', w, `opacity="${pal.shadow}" filter="url(#soft)" transform="translate(12 22)"`),
      stroke(flank, w),
      stroke(face, w * 0.7, 'transform="translate(-2 -3)"'),
      stroke(
        light,
        w * 0.22,
        `opacity=".9" filter="url(#glow)" transform="translate(${-w * 0.18} ${-w * 0.22})"`,
      ),
    )
    for (const bend of bends) if (rand() < 0.7) stations.push(bend)
    if (flat) stations.push([d + top - run, top])
  }
  return `${tubes.join('')}
    ${stations.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="22" fill="${pal.center}" stroke="${pal.text}" stroke-width="9"/>`).join('')}`
}

/** Le sujet : le(s) logo(s) et le nom, centrés, à l'échelle qui tient dans SAFE_W */
function subject(banner: Banner, mode: Mode) {
  const pal = palette(mode)
  const fontSize = LOGO_H * 0.72
  const gap = LOGO_H * 0.2
  const logos = banner.logos.map((name) => {
    const logo = LOGOS[name]!
    const [, , bw, bh] = logo.box.split(' ').map(Number)
    const inner = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${logo.box}" width="${bw}" height="${bh}">${logo.body(mode)}</svg>`
    const ink = inkBox(inner)
    return { inner: logo.body(mode), ink, width: (ink.width / ink.height) * LOGO_H }
  })
  const text = `<text font-family="${FAMILY}" font-weight="800" font-size="${fontSize}" letter-spacing="${-0.03 * fontSize}" fill="${pal.text}">${banner.name}</text>`
  const ink = banner.name
    ? inkBox(
        `<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="1000"><g transform="translate(100 600)">${text}</g></svg>`,
      )
    : { x: 100, width: 0 }
  const textWidth = ink.width
  const total =
    logos.reduce((s, l) => s + l.width, 0) +
    gap * (logos.length - 1) +
    (banner.name ? gap + textWidth : 0)
  const scale = Math.min(1, SAFE_W / total)

  let x = -total / 2
  const parts = logos.map((l) => {
    const k = LOGO_H / l.ink.height
    const part = `<g transform="translate(${x} ${-LOGO_H / 2}) scale(${k}) translate(${-l.ink.x} ${-l.ink.y})">${l.inner}</g>`
    x += l.width + gap
    return part
  })
  // Le nom : son encre calée à gauche sur x, sa hauteur de capitale centrée sur le logo
  const capHeight = 0.727 * fontSize
  if (banner.name)
    parts.push(`<g transform="translate(${x - (ink.x - 100)} ${capHeight / 2})">${text}</g>`)
  return { body: parts.join(''), scale, width: total * scale }
}

/**
 * La capture du projet, à fond perdu (en `cover`), ramenée vers le mode (éclaircie en clair,
 * assombrie en sombre) puis voilée de la couleur du sol : fort au centre, où se tient le sujet,
 * à peine sur les bords. Sans capture, le sol seul, du centre vers les bords.
 */
function screen(banner: Banner, mode: Mode) {
  const pal = palette(mode)
  if (!banner.shot)
    return `<radialGradient id="ground" cx="50%" cy="48%" r="75%"><stop offset="0" stop-color="${pal.center}"/><stop offset="1" stop-color="${pal.edge}"/></radialGradient>
      <rect width="${W}" height="${H}" fill="url(#ground)"/>`
  const { data, w: iw, h: ih } = png(banner.shot)
  const [cx, cy, cw, ch] = banner.crop ?? [0, 0, iw, ih]
  return `<radialGradient id="veil" cx="50%" cy="50%" r="62%">
      <stop offset="0" stop-color="${pal.center}" stop-opacity="${pal.veil[0]}"/>
      <stop offset=".55" stop-color="${pal.center}" stop-opacity="${pal.veil[1]}"/>
      <stop offset="1" stop-color="${pal.center}" stop-opacity="${pal.veil[2]}"/>
    </radialGradient>
    <filter id="tone"><feComponentTransfer>${['R', 'G', 'B'].map((c) => `<feFunc${c} type="linear" slope="${pal.tone[0]}" intercept="${pal.tone[1]}"/>`).join('')}</feComponentTransfer></filter>
    <svg width="${W}" height="${H}" viewBox="${cx} ${cy} ${cw} ${ch}" preserveAspectRatio="xMidYMid slice" filter="url(#tone)">
      <image width="${iw}" height="${ih}" href="data:image/png;base64,${data.toString('base64')}"/>
    </svg>
    <rect width="${W}" height="${H}" fill="url(#veil)"/>`
}

/** Une bannière : la capture (ou le sol), le motif aux deux coins, le sujet en relief */
function compose(banner: Banner, mode: Mode, motif: typeof metro, rand: Random) {
  const pal = palette(mode)
  const defs: string[] = []
  const { body, scale, width } = subject(banner, mode)
  // Le relief : l'épaisseur (des copies assombries, décalées vers le bas à droite), une ombre
  // portée floue, et la face éclairée du haut à gauche
  const depth = Array.from({ length: 9 }, (_, i) => 9 - i)
    .map(
      (k) =>
        `<use href="#subject" filter="url(#darken)" transform="translate(${k * 0.9} ${k * 1.3})"/>`,
    )
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="22"/></filter>
    <filter id="glow" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.5"/></filter>
    <filter id="halo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="36"/></filter>
    <filter id="darken"><feComponentTransfer><feFuncR type="linear" slope=".45"/><feFuncG type="linear" slope=".45"/><feFuncB type="linear" slope=".45"/></feComponentTransfer></filter>
    <filter id="shadow" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="18"/><feComponentTransfer><feFuncA type="linear" slope="${pal.shadow}"/></feComponentTransfer></filter>
    <filter id="bevel" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
      <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1" specularExponent="30" lighting-color="#ffffff" result="spec"><feDistantLight azimuth="225" elevation="30"/></feSpecularLighting>
      <feComposite in="spec" in2="SourceAlpha" operator="in" result="lit"/>
      <feComposite in="SourceGraphic" in2="lit" operator="arithmetic" k2="1" k3=".7"/>
    </filter>
    <g id="subject">${body}</g>
    __DEFS__
  </defs>
  ${screen(banner, mode)}
  ${motif(defs, banner.tints[0], mode, rand)}
  <g transform="rotate(180 ${W / 2} ${H / 2})">${motif(defs, banner.tints[1], mode, rand)}</g>
  <ellipse cx="${W / 2}" cy="${H / 2}" rx="${width * 0.56}" ry="${LOGO_H * scale * 0.72}" fill="${pal.center}" opacity="${pal.halo}" filter="url(#halo)"/>
  <g transform="translate(${W / 2 - 8} ${H / 2 - 10}) scale(${scale})">
    <use href="#subject" filter="url(#shadow)" transform="translate(18 30)"/>
    ${depth}
    <use href="#subject" filter="url(#bevel)"/>
  </g>
</svg>`.replace('__DEFS__', defs.join(''))
}

// --- Le calque pixel figé, pour l'OG -------------------------------------------------------------

/**
 * UiPixelImage à la taille de la boîte de l'OG : l'image réduite à un texel par cellule (en
 * `cover`), chaque cellule dessinée en cercle, les trous à la couleur du fond.
 */
function frozenLayer({ pixels, width, height }: RenderedImage) {
  const cell = OG_CELL
  const cols = Math.ceil(OG_BOX.w / cell)
  const rows = Math.ceil(OG_BOX.h / cell)
  const scale = Math.max(cols / width, rows / height)
  const [sw, sh] = [cols / scale, rows / scale]
  const [ox, oy] = [(width - sw) / 2, (height - sh) / 2]
  const shapes: string[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const [x0, x1] = [ox + (col * sw) / cols, ox + ((col + 1) * sw) / cols].map(Math.round)
      const [y0, y1] = [oy + (row * sh) / rows, oy + ((row + 1) * sh) / rows].map(Math.round)
      const sum = [0, 0, 0]
      for (let y = y0!; y < y1!; y++) {
        for (let x = x0!; x < x1!; x++)
          for (let c = 0; c < 3; c++) sum[c]! += pixels[(y * width + x) * 4 + c]!
      }
      const n = (x1! - x0!) * (y1! - y0!)
      const fill = hex(sum.map((v) => v / n) as Rgb)
      const [x, y] = [col * cell, row * cell]
      shapes.push(
        `<circle cx="${x + cell / 2}" cy="${y + cell / 2}" r="${cell * 0.4}" fill="${fill}"/>`,
      )
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * cell}" height="${rows * cell}"><rect width="100%" height="100%" fill="${OG_BOX.gap}"/>${shapes.join('')}</svg>`
  return new Resvg(svg).render().asPng()
}

// --- Main -------------------------------------------------------------------------------------

const keys = process.argv.slice(2)
for (const key of keys.length ? keys : Object.keys(BANNERS)) {
  const banner = BANNERS[key]
  if (!banner) throw new Error(`pas de bannière « ${key} » (${Object.keys(BANNERS).join(', ')})`)
  const out = `public/images/${key}`
  mkdirSync(out, { recursive: true })
  for (const mode of ['light', 'dark'] as const) {
    const motif = key.startsWith('blog/') ? corner : metro
    const rendered = new Resvg(compose(banner, mode, motif, seeded(key)), {
      ...resvgOptions,
      fitTo: { mode: 'width', value: OUT_W },
    }).render()
    execFileSync(
      'magick',
      [
        'png:-',
        '-quality',
        '88',
        '-sampling-factor',
        '4:4:4',
        '-strip',
        `${out}/cover${mode === 'dark' ? '-dark' : ''}.jpg`,
      ],
      { input: rendered.asPng() },
    )
    if (mode === 'dark' && key.startsWith('blog/'))
      writeFileSync(`${out}/cover-og.png`, frozenLayer(rendered))
  }
  console.log(out)
}
