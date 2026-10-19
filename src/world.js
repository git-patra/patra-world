import { project, unproject, tileKey, isPlayable, findPath, routeToStation } from './world-math.js';

const TREE_TILES = [[2, 2], [5, 1], [8, 1], [12, 1], [15, 3], [15, 8], [15, 14], [11, 15], [6, 15], [2, 14], [1, 11], [1, 4], [4, 14], [6, 12], [11, 8], [7, 5]];
const LANTERNS = [[6, 6], [8, 4], [12, 8], [7, 11], [11, 13], [3, 9], [3, 5]];
const PUMPKINS = [[5, 4], [3, 10], [14, 11], [9, 11], [2, 8], [10, 4], [7, 8], [13, 5], [8, 14]];
const BORDER = [[2, 0], [14, 0], [16, 2], [16, 14], [14, 16], [2, 16], [0, 14], [0, 2]];
const START = { x: 8, y: 8 };
const noise = (x, y, salt = 0) => { const n = Math.sin(x * 127.1 + y * 311.7 + salt * 74.7) * 43758.5453; return n - Math.floor(n); };

export function createWorld(canvas, { stations, onNear = () => {}, onSelect = () => {}, onMove = () => {} }) {
  const ctx = canvas.getContext('2d');
  const occupied = new Set([...stations.map(s => tileKey(s.x, s.y)), ...TREE_TILES.map(([x, y]) => tileKey(x, y))]);
  const roadTiles = new Set();
  const stationHits = new Map();
  for (const station of stations) {
    const route = routeToStation(START, station, occupied);
    route?.path.forEach(({ x, y }) => roadTiles.add(tileKey(x, y)));
  }
  for (let x = 6; x <= 10; x++) for (let y = 6; y <= 10; y++) if (!occupied.has(tileKey(x, y))) roadTiles.add(tileKey(x, y));
  let player = { ...START };
  let route = [];
  let destination = null;
  let paused = false;
  let motion = true;
  let near = null;
  let hovered = null;
  let hoverTile = null;
  let facing = 1;
  let lastTime = 0;
  let elapsed = 0;
  let raf;
  let dead = false;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let camera = { x: 0, y: 0, scale: 1 };
  let lastMove = '';
  let pointerStart = null;
  let targetPulse = null;
  let dirty = true;

  function polygon(points, fill, stroke, lineWidth = 1) {
    ctx.beginPath();
    points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
  }

  function ellipse(x, y, rx, ry, fill) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
  }

  function line(points, color, weight = 1) {
    ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.strokeStyle = color; ctx.lineWidth = weight; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  }

  function rounded(x, y, w, h, radius, fill, stroke) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  }

  function glow(x, y, radius, rgb = '255,161,62', intensity = .18) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${rgb},${intensity})`); gradient.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = gradient; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  function at(x, y, draw) {
    const p = project(x, y); ctx.save(); ctx.translate(p.x, p.y); draw(); ctx.restore();
  }

  function ground() {
    const outline = BORDER.map(([x, y]) => { const p = project(x, y); return [p.x, p.y]; });
    ellipse(0, 304, 373, 104, '#04081370');
    glow(0, 350, 310, '119,70,144', .13);
    for (let i = 2; i <= 5; i++) {
      const a = outline[i]; const b = outline[(i + 1) % outline.length];
      polygon([a, b, [b[0], b[1] + 29], [a[0], a[1] + 29]], i <= 3 ? '#292233' : '#342735', '#463345');
      line([[a[0], a[1] + 8], [b[0], b[1] + 8]], '#55404b', 3);
      line([[a[0], a[1] + 25], [b[0], b[1] + 25]], '#211e2a', 3);
    }
    polygon(outline, '#5d4e52', '#a3765b', 3);
    ctx.save(); ctx.beginPath(); outline.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.clip();
    for (let x = 0; x <= 16; x++) for (let y = 0; y <= 16; y++) {
      const p = project(x, y);
      const road = roadTiles.has(tileKey(x, y));
      const n = noise(x, y);
      const color = road ? ['#8e7766', '#9c8370', '#967e6b'][Math.floor(n * 3)] : ['#51454b', '#56484c', '#5c4a4b', '#614b49'][Math.floor(n * 4)];
      polygon([[p.x, p.y - 15], [p.x + 30, p.y], [p.x, p.y + 15], [p.x - 30, p.y]], color, road ? '#615157' : '#5a494c', .65);
      if (road) {
        line([[p.x - 14, p.y - 7], [p.x + 14, p.y + 7]], '#b29a8055', 1);
        line([[p.x - 1, p.y - 12], [p.x - 1, p.y - 1]], '#66525377', .7);
        line([[p.x + 13, p.y + 1], [p.x + 13, p.y + 9]], '#66525377', .7);
      } else if (n > .6) {
        ellipse(p.x + 8 * n, p.y + n * 4, 3, 1.5, '#b1785250');
        line([[p.x - 9, p.y + 4], [p.x - 10, p.y - 1]], '#9a6d4c80');
        line([[p.x - 9, p.y + 4], [p.x - 5, p.y + 1]], '#a7775180');
      }
    }
    ctx.restore();
    // The plaza compass quietly anchors the starting point.
    at(8, 8, () => {
      ellipse(0, 0, 52, 25, '#68595a55');
      ctx.save(); ctx.scale(1, .5); ctx.beginPath(); ctx.arc(0, 0, 45, 0, Math.PI * 2); ctx.strokeStyle = '#c19b7260'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      polygon([[0, -19], [7, -3], [33, 0], [7, 4], [0, 19], [-7, 4], [-33, 0], [-7, -3]], '#c5a07c70');
    });
    // A low fence and warm bulbs frame the back of the miniature.
    for (let t = 3; t <= 13; t++) at(t, .3, () => {
      line([[0, 0], [0, -14]], '#97705d', 2.5);
      line([[0, -10], [30, 5]], '#987159', 1.5);
      if (t % 2) { glow(0, -15, 13); ellipse(0, -15, 2, 2, '#ffd69c'); }
    });
    for (let t = 3; t <= 12; t++) at(.3, t, () => {
      line([[0, 0], [0, -14]], '#97705d', 2.5);
      line([[0, -10], [-30, 5]], '#987159', 1.5);
    });
  }

  function tree(index) {
    const [x, y] = TREE_TILES[index];
    at(x, y, () => {
      const sway = motion ? Math.sin(elapsed * .7 + index) * 1.2 : 0;
      const tones = index % 4 === 0 ? ['#ae724b', '#dd9d59', '#c98a51'] : index % 3 === 0 ? ['#6f4d72', '#986486', '#815679'] : ['#b05e42', '#dd8650', '#c66a42'];
      ellipse(5, 2, 20, 8, '#201b2d50');
      line([[0, 0], [-1, -30], [sway - 7, -43]], '#634137', 6);
      line([[0, -19], [sway + 12, -35]], '#78503c', 3);
      ellipse(sway, -43, 23, 20, tones[0]);
      ellipse(sway - 12, -44, 15, 16, tones[1]);
      ellipse(sway + 10, -48, 16, 19, tones[2]);
      ellipse(sway - 1, -57, 16, 15, tones[1]);
      ellipse(sway + 9, -38, 13, 12, tones[0]);
      for (let k = 0; k < 5; k++) ellipse(sway - 15 + noise(k, index) * 30, -55 + noise(index, k) * 23, 2.2, 1.4, '#f6bd6a44');
      ellipse(-9, 4, 3, 1.2, '#d88d4e'); ellipse(10, 3, 2.5, 1, '#c36a44');
    });
  }

  function pumpkin(x, y, scale = 1, lit = true) {
    at(x, y, () => {
      ctx.scale(scale, scale); ellipse(2, 3, 8, 3, '#28203150');
      if (lit) glow(0, -3, 14, '255,149,50', .18);
      ellipse(0, -3, 8, 7, '#c7662e'); ellipse(-3, -3, 4, 6, '#e8903b'); ellipse(2, -3, 4, 6, '#ef9b42');
      line([[0, -9], [1, -13], [4, -14]], '#aa8a59', 2);
      if (lit) {
        polygon([[-5, -4], [-2, -5], [-3, -2]], '#ffe7a1'); polygon([[2, -5], [5, -4], [3, -2]], '#ffe7a1');
        line([[-3, 0], [0, 2], [3, 0]], '#ffe7a1', 1.2);
      }
    });
  }

  function lantern(x, y) {
    at(x, y, () => {
      ellipse(0, 2, 5, 2, '#231e2c60'); line([[0, 0], [0, -32]], '#3e333d', 3);
      line([[-5, -32], [5, -32]], '#c0986a', 1.5); glow(0, -38, 25, '255,173,69', .3);
      rounded(-4, -43, 8, 11, 1, '#ffce7e', '#b7834e');
      line([[0, -42], [0, -33]], '#b7834e'); polygon([[-7, -44], [0, -49], [7, -44]], '#4b3943');
    });
  }

  function cube(w, h, left, right, top) {
    polygon([[-w, 0], [0, w * .5], [0, w * .5 - h], [-w, -h]], left, '#30253380');
    polygon([[0, w * .5], [w, 0], [w, -h], [0, w * .5 - h]], right, '#30253380');
    polygon([[-w, -h], [0, -h - w * .5], [w, -h], [0, -h + w * .5]], top, '#c4a08a35');
  }

  function facade(w, h, side, draw) {
    ctx.save();
    if (side === 'left') ctx.transform(1, .5, 0, 1, -w, -h);
    else ctx.transform(1, -.5, 0, 1, 0, -h + w * .5);
    draw(); ctx.restore();
  }

  function windowPane(x, y, w, h, color = '#ffcb7d') {
    rounded(x - 1, y - 1, w + 2, h + 2, 1, '#46303b');
    rounded(x, y, w, h, 1, color);
    line([[x + w * .5, y], [x + w * .5, y + h]], '#a06d53', 1);
    line([[x, y + h * .48], [x + w, y + h * .48]], '#a06d53', 1);
    line([[x - 2, y + h + 2], [x + w + 2, y + h + 2]], '#d7a172', 2);
  }

  function roof(w, h, tint = '#6b4b78') {
    const peak = [0, -h - 30];
    polygon([[-w - 5, -h], [0, -h + w * .5 + 4], peak], tint, '#aa7c8c', .8);
    polygon([[0, -h + w * .5 + 4], [w + 5, -h], peak], '#4c385f', '#8d657c', .8);
    for (let k = 1; k <= 4; k++) {
      const t = k / 5;
      line([[-(w + 4) * t, -h - 30 * (1 - t)], [0, -h - 30 + (30 + w * .5 + 4) * t], [(w + 4) * t, -h - 30 * (1 - t)]], '#c08c9d35', .7);
    }
    line([[-w - 5, -h], [0, -h + w * .5 + 4], [w + 5, -h]], '#c58f78', 2);
  }

  function plaque(x, y, w, text, color = '#ffd194') {
    rounded(x, y, w, 11, 2, '#312739', '#a57869');
    ctx.font = 'bold 6px "Arial", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = color; ctx.fillText(text, x + w / 2, y + 7.7);
  }

  function building(station) {
    at(station.x, station.y, () => {
      const active = station.id === near || station.id === hovered || station.id === destination;
      const w = station.id === 'jajaneun' ? 28 : station.id === 'fintech' ? 37 : 34;
      const h = station.id === 'arcade' ? 58 : station.id === 'erp' ? 49 : station.id === 'jajaneun' ? 27 : 44;
      ellipse(10, 7, w + 14, 16, '#15132155');
      if (active) {
        glow(0, 2, 65, '255,171,76', .23);
        polygon([[0, -25], [49, 0], [0, 25], [-49, 0]], '#d7914a14', '#ffc778', 1.4);
      }
      ctx.save(); ctx.translate(0, 3); cube(w + 4, 7, '#6f5654', '#503d49', '#96715e'); ctx.restore();
      const palettes = {
        arcade: ['#8e638b', '#604468', '#bd8c9b'], chat: ['#c19a88', '#8b707c', '#d1a791'],
        fintech: ['#b09b85', '#7a7183', '#bca98e'], coffee: ['#c17c51', '#8a5445', '#daa16a'],
        erp: ['#998b9a', '#645c79', '#b1a0a6'], pos: ['#a06e78', '#714859', '#c79591'],
        jajaneun: ['#c06c43', '#87412e', '#e89857'],
      };
      const colors = palettes[station.id] || palettes.arcade;
      cube(w, h, ...colors);
      // Every facade is drawn in its own perspective plane.
      facade(w, h, 'left', () => {
        if (station.id === 'jajaneun') {
          rounded(3, 6, w - 6, 15, 1, '#542d31');
          for (let j = 0; j < 3; j++) {
            rounded(6 + j * 7, 12, 5, 8, 1, '#d3582c'); rounded(6 + j * 7, 10, 5, 3, 1, '#d8ac74');
            rounded(7 + j * 7, 15, 3, 3, .5, '#f0c98d');
          }
          line([[1, 23], [w - 1, 23]], '#e4a668', 3);
        } else if (station.id === 'fintech') {
          for (const x of [5, 16, 28]) { rounded(x, 11, 5, 29, 1, '#e4cda6'); rounded(x - 1, 9, 7, 3, .5, '#e0bc8c'); }
          plaque(4, 0, w - 8, 'CONNECT');
        } else if (station.id === 'arcade') {
          plaque(3, 5, w - 6, 'PLAY', '#ffbc68');
          windowPane(5, 23, 9, 16, '#e8c0ec'); windowPane(20, 23, 9, 16, '#ffd17b');
          rounded(13, 44, 10, 14, 1, '#342f49'); rounded(15, 46, 6, 6, .5, '#f0a751');
        } else {
          plaque(3, 4, w - 6, station.id === 'coffee' ? 'BREW & BUILD' : station.id === 'chat' ? 'HELLO!' : station.id === 'erp' ? 'OPERATIONS' : 'OPEN');
          windowPane(5, 20, 11, 17, station.id === 'chat' ? '#eac4f1' : '#ffd58b');
          rounded(22, 20, 9, h - 20, 1, '#47333f'); rounded(24, 22, 5, 10, 1, '#e8ad70'); ellipse(29, 35, .9, .9, '#ffdc9d');
        }
      });
      facade(w, h, 'right', () => {
        if (station.id === 'fintech') {
          for (const x of [7, 21]) windowPane(x, 16, 9, 20, '#f4cf87');
        } else if (station.id === 'jajaneun') {
          plaque(3, 9, w - 6, 'CHILI OIL', '#ffc478');
        } else {
          windowPane(7, h > 50 ? 9 : 19, 12, 15, station.id === 'pos' ? '#c9cdf3' : '#ffce80');
          if (h > 50) windowPane(7, 32, 12, 14, '#eeb8df');
          else line([[0, h - 4], [w, h - 4]], '#c5a18155', 2);
        }
      });

      if (station.id === 'jajaneun') {
        // Striped market canopy and a tiny, proud chili on top.
        const top = -h - 18;
        for (let i = 0; i < 6; i++) {
          const l = -w - 6 + i * ((w * 2 + 12) / 6);
          polygon([[l, -h + 1], [l + 11.4, -h + 1], [l * .55 + 6, top], [l * .55, top]], i % 2 ? '#f8d4a1' : '#bc5339');
          rounded(l, -h + 1, 11.5, 5, [0, 0, 4, 4], i % 2 ? '#e4bd8a' : '#a94433');
        }
        line([[0, top], [0, top - 15]], '#e0b77b', 2);
        ctx.save(); ctx.translate(0, top - 17); ctx.rotate(-.45); ellipse(0, 0, 5, 9, '#ef7345'); line([[0, -8], [3, -12]], '#e7b478', 2); ctx.restore();
      } else if (station.id === 'arcade') {
        ctx.save(); ctx.translate(0, -h); cube(w + 4, 5, '#bd7b89', '#814968', '#64456e'); ctx.restore();
        rounded(-16, -h - 26, 32, 19, 5, '#efb778', '#493244');
        line([[-9, -h - 17], [-1, -h - 17]], '#513c59', 2.6); line([[-5, -h - 21], [-5, -h - 13]], '#513c59', 2.6);
        ellipse(8, -h - 19, 2, 2, '#965174'); ellipse(12, -h - 14, 2, 2, '#965174');
        line([[0, -h - 27], [0, -h - 37]], '#bb8f88', 1.5); ellipse(0, -h - 39, 3, 3, '#ffc47d');
      } else if (station.id === 'erp') {
        ctx.save(); ctx.translate(0, -h); cube(w + 3, 5, '#8d7a91', '#5e4f70', '#ae94a7'); ctx.restore();
        ctx.save(); ctx.translate(-3, -h - 9); cube(12, 12, '#8b8196', '#696279', '#c2a9b5'); ctx.restore();
        for (let i = 0; i < 3; i++) line([[-11 + i * 6, -h - 23], [-11 + i * 6, -h - 36 - i * 4]], '#e7bc82', 4);
        for (let i = 0; i < 2; i++) { ctx.save(); ctx.translate(w + 4 + i * 11, 5 - i * 4); cube(8, 12, '#b78458', '#826046', '#d0a16e'); line([[-6, -11], [0, -8], [6, -11]], '#e4bd86'); ctx.restore(); }
      } else {
        roof(w, h, station.id === 'coffee' ? '#936054' : station.id === 'fintech' ? '#71617c' : '#866482');
        if (station.id === 'coffee') {
          ctx.save(); ctx.translate(16, -h - 11); cube(6, 20, '#9e6b59', '#704b48', '#c79774'); ctx.restore();
          if (motion) for (let k = 0; k < 3; k++) {
            const progress = (elapsed * .3 + k / 3) % 1;
            ellipse(16 + Math.sin(progress * 5) * 5, -h - 34 - progress * 27, 3 + progress * 5, 2 + progress * 3, `rgba(214,183,166,${(1 - progress) * .28})`);
          }
          facade(w, h, 'left', () => {
            for (let k = 0; k < 5; k++) polygon([[k * w / 5, 17], [(k + 1) * w / 5, 17], [(k + 1) * w / 5, 21], [k * w / 5, 21]], k % 2 ? '#f0cda3' : '#bd5d3d');
          });
        }
        if (station.id === 'chat') {
          rounded(-12, -h - 46, 25, 17, 6, '#ead4e2', '#715071'); polygon([[-6, -h - 30], [-8, -h - 23], [2, -h - 30]], '#ead4e2');
          for (let k = 0; k < 3; k++) ellipse(-6 + k * 6, -h - 38, 1.5, 1.5, '#7f5879');
        }
        if (station.id === 'fintech') {
          ellipse(0, -h - 39, 9, 12, '#e8b866'); ellipse(0, -h - 39, 6.5, 9, '#b9884e');
          ctx.fillStyle = '#ffe1a2'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'; ctx.fillText('P', 0, -h - 35);
        }
        if (station.id === 'pos') {
          rounded(-10, -h - 46, 20, 17, 3, '#dbc8bd', '#6c4e68'); rounded(-7, -h - 43, 14, 9, 1, '#5e4c73');
          line([[-3, -h - 29], [3, -h - 29]], '#efc394', 2); line([[0, -h - 33], [0, -h - 29]], '#efc394', 2);
          line([[-4, -h - 38], [-1, -h - 35], [5, -h - 41]], '#e6b576', 1.5);
        }
      }
      glow(-11, -12, 34, '255,183,91', .11);
      // The entrance lights sit low, illuminating the path ahead.
      ellipse(-9, h > 50 ? 12 : 10, 13, 4, '#ffca7928');
    });
  }

  function littleGhost() {
    at(player.x, player.y, () => {
      ctx.scale(1.2, 1.2);
      const walking = route.length > 0;
      const bounce = motion ? Math.sin(elapsed * (walking ? 17 : 2.5)) * (walking ? 1.6 : .8) : 0;
      ellipse(0, 1, 10, 4, '#211a2d80'); glow(0, -11, 23, '255,214,147', .13);
      // Small boots and a swinging satchel make the direction of travel readable.
      const step = motion && walking ? Math.sin(elapsed * 17) * 3 : 0;
      rounded(-7, -3 + step * .3, 5, 4, 2, '#805047'); rounded(2, -3 - step * .3, 5, 4, 2, '#805047');
      ctx.save(); ctx.translate(0, -3 + bounce);
      ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-10, -11); ctx.bezierCurveTo(-10, -27, 10, -27, 10, -11); ctx.lineTo(10, 0); ctx.lineTo(5, -3); ctx.lineTo(0, 1); ctx.lineTo(-5, -3); ctx.closePath();
      ctx.fillStyle = '#f9e7ce'; ctx.fill(); ctx.strokeStyle = '#be9d87'; ctx.lineWidth = .9; ctx.stroke();
      ellipse(-3 + facing * 1.5, -13, 1.5, 2, '#4b354a'); ellipse(3 + facing * 1.5, -13, 1.5, 2, '#4b354a');
      ellipse(facing * 1.5, -8, 1.2, .8, '#c9927e');
      line([[-8, -21], [8, -21]], '#da7a42', 3); ellipse(0, -23, 7, 3, '#e79955');
      line([[0, -25], [1, -28]], '#b89461', 2);
      line([[-7, -16], [9, -4]], '#c48a62', 1.5); rounded(5, -7, 7, 7, 2, '#e59952', '#ad6b42');
      ctx.restore();
      // A small arrow makes the player easy to find among the buildings.
      const arrowY = -39 + (motion ? Math.sin(elapsed * 2) * 2 : 0);
      polygon([[-4, arrowY], [4, arrowY], [0, arrowY + 5]], '#ffce8b');
    });
  }

  function labels() {
    // Labels render in screen pixels for legibility on phones.
    const compact = width < 550;
    ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const station of stations) {
      const p = project(station.x, station.y);
      const active = station.id === hovered || station.id === near || station.id === destination;
      const heights = { arcade: 112, chat: 110, fintech: 110, coffee: 95, erp: 105, pos: 110, jajaneun: 78 };
      const x = camera.x + p.x * camera.scale;
      const y = camera.y + (p.y - heights[station.id]) * camera.scale;
      const shortNames = { arcade: 'Arcade', chat: 'Chat lab', fintech: 'Fintech', coffee: 'Coffee', erp: 'ERP', pos: 'POS', jajaneun: 'Jajaneun' };
      const text = shortNames[station.id] || station.name;
      ctx.font = `${active ? '600' : '500'} ${compact ? 9 : 10}px "DM Sans", system-ui, sans-serif`;
      const labelWidth = ctx.measureText(text).width + 20;
      rounded(x - labelWidth / 2, y - 10, labelWidth, 20, 7, active ? '#edac63' : '#211f2ce8', active ? '#ffdc9d' : '#b58a7055');
      ctx.textAlign = 'center'; ctx.fillStyle = active ? '#342332' : '#e9d4bc'; ctx.fillText(text, x, y + 3.5);
      if (active) polygon([[x - 3, y + 11], [x + 3, y + 11], [x, y + 14]], '#edac63');
      stationHits.set(station.id, { x, y, w: Math.max(labelWidth + 12, 72 * camera.scale), bottom: camera.y + (p.y + 16) * camera.scale });
    }
    if (!route.length) {
      const position = project(player.x, player.y);
      const x = camera.x + position.x * camera.scale;
      const y = camera.y + (position.y - 59) * camera.scale;
      const overlapsLabel = [...stationHits.values()].some(hit => Math.abs(hit.x - x) < hit.w / 2 + 17 && Math.abs(hit.y - y) < 20);
      if (!overlapsLabel) {
        rounded(x - 15, y - 7, 30, 14, 5, '#ffe1a8', '#b18561');
        ctx.font = 'bold 8px "DM Sans", system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#4a3343'; ctx.fillText('YOU', x, y + 3);
      }
    }
    ctx.restore();
  }

  function ambient() {
    if (!motion) return;
    for (let i = 0; i < 9; i++) {
      const x = Math.sin(elapsed * .11 + i * 2.1) * (210 + i * 12);
      const y = 110 + noise(i, 5) * 230 + Math.sin(elapsed * .25 + i) * 13;
      const alpha = .35 + Math.sin(elapsed * 1.7 + i) * .25;
      glow(x, y, 9, '255,198,118', alpha * .2); ellipse(x, y, 1, 1, `rgba(255,216,146,${alpha})`);
    }
    for (let i = 0; i < 5; i++) {
      const progress = (elapsed * .035 + i * .2) % 1;
      ctx.save(); ctx.translate(-250 + noise(i, 2) * 500 + Math.sin(progress * 9) * 20, 80 + progress * 310); ctx.rotate(progress * 7);
      ellipse(0, 0, 3.5, 1.5, '#d49b6e70'); ctx.restore();
    }
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
    ctx.save(); ctx.translate(camera.x, camera.y); ctx.scale(camera.scale, camera.scale);
    ground();
    if (hoverTile && !paused && !hovered && isPlayable(hoverTile.x, hoverTile.y) && !occupied.has(tileKey(hoverTile.x, hoverTile.y))) {
      at(hoverTile.x, hoverTile.y, () => polygon([[0, -13], [26, 0], [0, 13], [-26, 0]], '#e8ba7522', '#d9b17b77'));
    }
    route.forEach((tile, index) => {
      if (index % 2 === 0) at(tile.x, tile.y, () => ellipse(0, 0, 2.5, 1.2, '#f4c68b88'));
    });
    if (targetPulse) at(targetPulse.x, targetPulse.y, () => {
      const size = 8 + (motion ? Math.sin(elapsed * 4) * 2 : 0);
      ctx.save(); ctx.scale(1, .5); ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2); ctx.strokeStyle = '#ffcc8c'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    });
    const objects = [
      ...TREE_TILES.map(([x, y], index) => ({ depth: x + y, draw: () => tree(index) })),
      ...stations.map(station => ({ depth: station.x + station.y, draw: () => building(station) })),
      ...LANTERNS.map(([x, y]) => ({ depth: x + y + .1, draw: () => lantern(x, y) })),
      ...PUMPKINS.map(([x, y], i) => ({ depth: x + y + .2, draw: () => pumpkin(x + .25, y + .2, i % 2 ? .8 : 1) })),
      { depth: player.x + player.y + .3, draw: littleGhost },
    ];
    objects.sort((a, b) => a.depth - b.depth); objects.forEach(o => o.draw());
    ambient(); ctx.restore(); labels(); dirty = false;
  }

  function notifyPosition() {
    const signature = `${Math.round(player.x)},${Math.round(player.y)},${route.length > 0}`;
    if (signature !== lastMove) { dirty = true; lastMove = signature; onMove({ x: Math.round(player.x), y: Math.round(player.y), walking: route.length > 0 }); }
    const closest = stations.map(s => ({ station: s, distance: Math.hypot(player.x - s.x, player.y - s.y) })).filter(s => s.distance < 1.65).sort((a, b) => a.distance - b.distance)[0]?.station.id || null;
    if (closest !== near) { dirty = true; near = closest; onNear(near); }
  }

  function arrive() {
    targetPulse = null; notifyPosition();
    if (destination) { const id = destination; destination = null; onSelect(id); }
  }

  function startRoute(path, id = null) {
    dirty = true; route = path; destination = id;
    targetPulse = route.length ? route[route.length - 1] : null;
    if (!motion && route.length) { player = { ...route[route.length - 1] }; route = []; }
    notifyPosition(); if (!route.length) arrive();
  }

  function travelTo(id) {
    if (paused) return;
    const station = stations.find(s => s.id === id);
    if (!station) return;
    player = { x: Math.round(player.x), y: Math.round(player.y) };
    const next = routeToStation(player, station, occupied);
    if (next) startRoute(next.path, id);
  }

  function move(dx, dy) {
    if (paused || !dx && !dy) return;
    const origin = { x: Math.round(player.x), y: Math.round(player.y) };
    // Inverse isometric directions keep arrow keys aligned to the screen.
    const nx = Math.sign(dx + dy); const ny = Math.sign(dy - dx);
    const target = { x: origin.x + nx, y: origin.y + ny };
    if (!isPlayable(target.x, target.y) || occupied.has(tileKey(target.x, target.y))) return;
    if (nx && ny && (occupied.has(tileKey(origin.x + nx, origin.y)) || occupied.has(tileKey(origin.x, origin.y + ny)))) return;
    if (route.length && !destination) return;
    player = origin; startRoute([target]);
  }

  function interact() { if (!paused && near) { dirty = true; route = []; destination = null; targetPulse = null; notifyPosition(); onSelect(near); } }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = Math.max(bounds.width, 1); height = Math.max(bounds.height, 1); dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    const padding = width < 550 ? 18 : 24;
    camera.scale = Math.max(.01, Math.min((width - padding) / 900, (height - 36) / 580));
    camera.x = width / 2; camera.y = height / 2 - 205 * camera.scale;
    draw();
  }

  function pointerPosition(event) {
    const bounds = canvas.getBoundingClientRect(); return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  function hitStation(p) {
    return [...stations].sort((a, b) => b.x + b.y - a.x - a.y).find(s => {
      const hit = stationHits.get(s.id);
      return hit && p.x >= hit.x - hit.w / 2 && p.x <= hit.x + hit.w / 2 && p.y >= hit.y - 12 && p.y <= hit.bottom;
    });
  }

  function pointerMove(event) {
    if (paused || event.pointerType === 'touch') return;
    const p = pointerPosition(event); hovered = hitStation(p)?.id || null;
    const tile = unproject((p.x - camera.x) / camera.scale, (p.y - camera.y) / camera.scale);
    hoverTile = { x: Math.round(tile.x), y: Math.round(tile.y) };
    dirty = true;
    canvas.style.cursor = hovered ? 'pointer' : isPlayable(hoverTile.x, hoverTile.y) && !occupied.has(tileKey(hoverTile.x, hoverTile.y)) ? 'crosshair' : 'default';
  }

  function pointerDown(event) { pointerStart = { ...pointerPosition(event), id: event.pointerId }; }
  function pointerUp(event) {
    const p = pointerPosition(event);
    const start = pointerStart; pointerStart = null;
    if (paused || !start || start.id !== event.pointerId || Math.hypot(p.x - start.x, p.y - start.y) > 10) return;
    const station = hitStation(p);
    if (station) { travelTo(station.id); return; }
    const groundPoint = unproject((p.x - camera.x) / camera.scale, (p.y - camera.y) / camera.scale);
    const target = { x: Math.round(groundPoint.x), y: Math.round(groundPoint.y) };
    if (!isPlayable(target.x, target.y) || occupied.has(tileKey(target.x, target.y))) return;
    player = { x: Math.round(player.x), y: Math.round(player.y) };
    const path = findPath(player, target, occupied);
    if (path.length) startRoute(path);
  }
  function pointerLeave() { dirty = true; hovered = null; hoverTile = null; pointerStart = null; canvas.style.cursor = 'default'; }

  function frame(timestamp) {
    if (dead) return;
    const dt = Math.min((timestamp - (lastTime || timestamp)) / 1000, .05); lastTime = timestamp;
    if (motion && !paused) elapsed += dt;
    if (!paused && route.length) {
      const target = route[0]; const dx = target.x - player.x; const dy = target.y - player.y;
      const distance = Math.hypot(dx, dy); const speed = dt * 4.5;
      if (dx - dy) facing = Math.sign(dx - dy);
      if (distance <= speed) {
        player = { ...target }; route.shift(); if (!route.length) arrive();
      } else { player.x += dx / distance * speed; player.y += dy / distance * speed; }
      notifyPosition();
    }
    if (dirty || motion && !paused) draw();
    raf = requestAnimationFrame(frame);
  }

  const observer = new ResizeObserver(resize); observer.observe(canvas);
  canvas.addEventListener('pointermove', pointerMove); canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointerup', pointerUp); canvas.addEventListener('pointerleave', pointerLeave);
  canvas.addEventListener('pointercancel', pointerLeave);
  resize(); notifyPosition(); raf = requestAnimationFrame(frame);

  return {
    travelTo, move, interact,
    setPaused(value) {
      dirty = true;
      paused = Boolean(value);
      if (paused) { hovered = null; hoverTile = null; canvas.style.cursor = 'default'; }
      else if (!motion && route.length) { player = { ...route[route.length - 1] }; route = []; arrive(); }
    },
    setMotion(value) {
      dirty = true;
      motion = Boolean(value);
      if (!motion && route.length && !paused) { player = { ...route[route.length - 1] }; route = []; arrive(); }
    },
    reset() { dirty = true; player = { ...START }; route = []; destination = null; targetPulse = null; facing = 1; notifyPosition(); },
    destroy() {
      dead = true; cancelAnimationFrame(raf); observer.disconnect();
      canvas.removeEventListener('pointermove', pointerMove); canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointerup', pointerUp); canvas.removeEventListener('pointerleave', pointerLeave);
      canvas.removeEventListener('pointercancel', pointerLeave);
    },
  };
}
