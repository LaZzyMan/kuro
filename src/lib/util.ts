export const posColor = "#f64f59";
export const negColor = "#12c2e9";
export const inColor = "#2F3A8F";
export const outColor = "#FE7E6D";
export const classColor = [
  "#ef476f",
  "#06d6a0",
  "#073b4c",
  "#ffd166",
  "#118ab2",
  "#8338ec",
];
export const datasetColor = [
  "#81B214",
  "#BB8082",
  "#4B778D",
  "#F58634",
  "#FFCC29",
];
export const trainSetColor = ["#0080ff", "#ff0000"];
// export const selectedRegionColor = "#541212";
export const selectedRegionColor = "#000000";
export const buildingColor = "#aaa";
export const themeColor = "#333333";

export const classes = [
  {
    name: "Commerical and Business Facility",
    chName: "商业与服务业用地",
    code: "C",
    color: classColor[0],
    abbr: "商服用地",
  },
  {
    name: "Park and Square",
    cnName: "绿地与广场用地",
    code: "G",
    abbr: "绿化用地",
    color: classColor[1],
  },
  {
    name: "Industrial",
    cnName: "工业用地",
    code: "M",
    color: classColor[2],
    abbr: "工业用地",
  },
  {
    name: "Pubilic Management and Service",
    cnName: "公共管理与服务用地",
    code: "P",
    color: classColor[3],
    abbr: "公管用地",
  },
  {
    name: "Residential",
    cnName: "居住用地",
    code: "R",
    color: classColor[4],
    abbr: "居住用地",
  },
  {
    name: "Municipal Publicutilities",
    cnName: "市政公用设施用地",
    code: "U",
    color: classColor[5],
    abbr: "市政用地",
  },
];

export const datasets = [
  {
    index: 0,
    name: "Land Cover",
    code: "L",
    color: datasetColor[0],
    startAngle: -Math.PI / 4,
    endAngle: Math.PI / 4,
    padAngle: 0.05,
  },
  {
    index: 1,
    name: "Point of Interest",
    code: "P",
    color: datasetColor[1],
    startAngle: Math.PI / 4,
    endAngle: (Math.PI * 3) / 4,
    padAngle: 0.05,
  },
  {
    index: 2,
    name: "Building",
    code: "B",
    color: datasetColor[2],
    startAngle: (Math.PI * 3) / 4,
    endAngle: (Math.PI * 5) / 4,
    padAngle: 0.05,
  },
  {
    index: 3,
    name: "Taxi Trajectory",
    code: "T",
    color: datasetColor[3],
    startAngle: (Math.PI * 5) / 4,
    endAngle: (Math.PI * 7) / 4,
    padAngle: 0.05,
  },
];

export const featureSets = [
  {
    index: 0,
    name: "Land Cover",
    abbr: "LC",
    color: datasetColor[0],
    length: 19,
    chinese: "地表覆盖特征",
  },
  {
    index: 1,
    name: "Point of Interest",
    abbr: "POI",
    color: datasetColor[1],
    length: 17,
    chinese: "兴趣点特征",
  },
  {
    index: 2,
    name: "Building",
    abbr: "B",
    color: datasetColor[2],
    length: 4,
    chinese: "建筑特征",
  },
  {
    index: 3,
    name: "Mobility",
    abbr: "M",
    color: datasetColor[3],
    length: 1514,
    chinese: "轨迹流动性特征",
  },
  {
    index: 4,
    name: "Rhythm",
    abbr: "R",
    color: datasetColor[4],
    length: 48,
    chinese: "轨迹节律性特征",
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
  "Land Cover Mix Index",
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
  "POI Mix Index",
];

export const buildingTypes = ["PLAND", "BLSI", "Floor Mean", "Floor Std"];

export const mobilityTypes = Array.from(
  { length: 1514 },
  (_, i) => `Region_${i}`
);

export const rhythmTypes = Array.from({ length: 48 }, (_, i) => {
  if (i >= 24) {
    return `In_${i}H`;
  } else {
    return `Out_${i}H`;
  }
});

export const featureTypes = [
  lcTypes,
  poiTypes,
  buildingTypes,
  mobilityTypes,
  rhythmTypes,
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

export function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1;
  }

  var max = arr[0];

  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;

      max = arr[i];
    }
  }

  return maxIndex;
}
