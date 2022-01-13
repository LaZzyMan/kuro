export const classes = [
  {
    name: "商业与服务业用地",
    code: "C",
    color: "#ef476f",
  },
  {
    name: "绿地与广场用地",
    code: "G",
    color: "#06d6a0",
  },
  {
    name: "工业用地",
    code: "M",
    color: "#073b4c",
  },
  {
    name: "公共管理与服务用地",
    code: "P",
    color: "#ffd166",
  },
  {
    name: "居住用地",
    code: "R",
    color: "#118ab2",
  },
  {
    name: "市政公用设施用地",
    code: "U",
    color: "#8338ec",
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
