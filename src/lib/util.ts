export const classes = [
  {
    name: "商业与服务业用地",
    code: "C",
    color: "#ef476f",
    abbr: "商服用地",
  },
  {
    name: "绿地与广场用地",
    code: "G",
    abbr: "绿化用地",
    color: "#06d6a0",
  },
  {
    name: "工业用地",
    code: "M",
    color: "#073b4c",
    abbr: "工业用地",
  },
  {
    name: "公共管理与服务用地",
    code: "P",
    color: "#ffd166",
    abbr: "公管用地",
  },
  {
    name: "居住用地",
    code: "R",
    color: "#118ab2",
    abbr: "居住用地",
  },
  {
    name: "市政公用设施用地",
    code: "U",
    color: "#8338ec",
    abbr: "市政用地",
  },
];

export const datasets = [
  {
    index: 0,
    name: "Land Cover",
    code: "L",
    color: "#2E94B9",
    startAngle: -Math.PI / 4,
    endAngle: Math.PI / 4,
    padAngle: 0.05,
  },
  {
    index: 1,
    name: "Point of Interest",
    code: "P",
    color: "#F0B775",
    startAngle: Math.PI / 4,
    endAngle: (Math.PI * 3) / 4,
    padAngle: 0.05,
  },
  {
    index: 2,
    name: "Building",
    code: "B",
    color: "#D25565",
    startAngle: (Math.PI * 3) / 4,
    endAngle: (Math.PI * 5) / 4,
    padAngle: 0.05,
  },
  {
    index: 3,
    name: "Taxi Trajectory",
    code: "T",
    color: "#8bc24c",
    startAngle: (Math.PI * 5) / 4,
    endAngle: (Math.PI * 7) / 4,
    padAngle: 0.05,
  },
];

export const lcTypes = [
  "Rice paddy",
  "Other cropland",
  "Orchard",
  "Bare farmland",
  "Broadleaf leaf on",
  "Broadleaf leaf off",
  "Needleleaf leaf off",
  "Mixedleaf leaf off",
  "Natural grassland",
  "Grassland leaf off",
  "Shrubland leaf on",
  "Shrubland leaf off",
  "Marshland",
  "Mudlaf",
  "Water",
  "Herbaceons tundra",
  "Impervious surface",
  "Bareland",
];

export const poiTypes = [
  "Shopping service",
  "Catering service",
  "Domestic service",
  "Transportation facilities service",
  "Corporate",
  "Business residence",
  "Science and education service",
  "Access facilities",
  "Government agencies and social organizations",
  "Financial insurance service",
  "Accommodation service",
  "Healthcare service",
  "Vehicle service",
  "Sport and leisure service",
  "Public utilities",
  "Famous tourist sites",
];

export const uuid = () => {
  var s: any[] = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
};

const hslToRgb = (H, S, L) => {
  var R, G, B;
  if (+S === 0) {
    R = G = B = L; // 饱和度为0 为灰色
  } else {
    var hue2Rgb = function (p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    var Q = L < 0.5 ? L * (1 + S) : L + S - L * S;
    var P = 2 * L - Q;
    R = hue2Rgb(P, Q, H + 1 / 3);
    G = hue2Rgb(P, Q, H);
    B = hue2Rgb(P, Q, H - 1 / 3);
  }
  return [Math.round(R * 255), Math.round(G * 255), Math.round(B * 255)];
};

// 获取随机HSL
const randomHsl = () => {
  var H = Math.random();
  var S = Math.random();
  var L = Math.random();
  return [H, S, L];
};

// 获取HSL数组
export const getRgbArray = (hslLength) => {
  var HSL: number[][] = [];
  for (var i = 0; i < hslLength; i++) {
    var ret = randomHsl();

    // 颜色相邻颜色差异须大于 0.25
    if (i > 0 && Math.abs(ret[0] - HSL[i - 1][0]) < 0.25) {
      i--;
      continue; // 重新获取随机色
    }
    ret[1] = 0.7 + ret[1] * 0.2; // [0.7 - 0.9] 排除过灰颜色
    ret[2] = 0.4 + ret[2] * 0.4; // [0.4 - 0.8] 排除过亮过暗色

    // 数据转化到小数点后两位
    ret = ret.map(function (item) {
      return parseFloat(item.toFixed(2));
    });

    HSL.push(ret);
  }
  const RGB = HSL.map((v) => hslToRgb(v[0], v[1], v[2]));
  return RGB;
};
