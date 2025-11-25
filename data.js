const cylinderSizes = [
    // 50mm plunger
    { d: 50, t: 0, cylinderDia: 82.5, wallThick: 4.00, G: 185, c1: 2.40, c2: 1.96, mcm: 7.80, mco: 5.30 },
    // 56mm plunger
    { d: 56, t: 0, cylinderDia: 95, wallThick: 4.50, G: 190, c1: 3.35, c2: 2.46, mcm: 8.40, mco: 7.80 },
    // 60mm plunger
    { d: 60, t: 0, cylinderDia: 95, wallThick: 4.50, G: 190, c1: 2.98, c2: 2.83, mcm: 8.10, mco: 7.80 },
    { d: 60, t: 5, cylinderDia: 95, wallThick: 4.50, G: 190, c1: 2.98, c2: 2.83, mcm: 8.10, mco: 7.80 },
    // 63mm plunger
    { d: 63, t: 0, cylinderDia: 101.6, wallThick: 4.50, G: 195, c1: 3.62, c2: 3.12, mcm: 9.20, mco: 8.90 },
    { d: 63, t: 6, cylinderDia: 101.6, wallThick: 4.50, G: 195, c1: 3.62, c2: 3.12, mcm: 9.20, mco: 8.90 },
    // 70mm plunger
    { d: 70, t: 0, cylinderDia: 108, wallThick: 4.50, G: 195, c1: 3.85, c2: 3.85, mcm: 9.70, mco: 8.80 },
    { d: 70, t: 5, cylinderDia: 108, wallThick: 4.50, G: 195, c1: 3.85, c2: 3.85, mcm: 9.70, mco: 8.80 },
    { d: 70, t: 7.5, cylinderDia: 108, wallThick: 4.50, G: 195, c1: 3.85, c2: 3.85, mcm: 9.70, mco: 8.80 },
    // 80mm plunger
    { d: 80, t: 0, cylinderDia: 114.3, wallThick: 4.50, G: 200, c1: 3.68, c2: 5.03, mcm: 11.70, mco: 9.30 },
    { d: 80, t: 5, cylinderDia: 114.3, wallThick: 4.50, G: 200, c1: 3.68, c2: 5.03, mcm: 11.70, mco: 9.30 },
    { d: 80, t: 7.5, cylinderDia: 114.3, wallThick: 4.50, G: 200, c1: 3.68, c2: 5.03, mcm: 11.70, mco: 9.30 },
    { d: 80, t: 10, cylinderDia: 114.3, wallThick: 4.50, G: 200, c1: 3.68, c2: 5.03, mcm: 11.70, mco: 9.30 },
    { d: 80, t: 12, cylinderDia: 114.3, wallThick: 4.50, G: 200, c1: 3.68, c2: 5.03, mcm: 11.70, mco: 9.30 },
    // 90mm plunger
    { d: 90, t: 0, cylinderDia: 127, wallThick: 5.00, G: 205, c1: 4.39, c2: 6.36, mcm: 14.00, mco: 10.50 },
    { d: 90, t: 5, cylinderDia: 127, wallThick: 5.00, G: 205, c1: 4.39, c2: 6.36, mcm: 14.00, mco: 10.50 },
    { d: 90, t: 7.5, cylinderDia: 127, wallThick: 5.00, G: 205, c1: 4.39, c2: 6.36, mcm: 14.00, mco: 10.50 },
    { d: 90, t: 10, cylinderDia: 127, wallThick: 5.00, G: 205, c1: 4.39, c2: 6.36, mcm: 14.00, mco: 10.50 },
    { d: 90, t: 12, cylinderDia: 127, wallThick: 5.00, G: 205, c1: 4.39, c2: 6.36, mcm: 14.00, mco: 10.50 },
    { d: 90, t: 13.5, cylinderDia: 127, wallThick: 5.00, G: 205, c1: 4.39, c2: 6.36, mcm: 14.00, mco: 10.50 },
    // 100mm plunger
    { d: 100, t: 5, cylinderDia: 139.7, wallThick: 5.60, G: 208, c1: 5.11, c2: 7.85, mcm: 15.10, mco: 11.40 },
    { d: 100, t: 7.5, cylinderDia: 139.7, wallThick: 5.60, G: 208, c1: 5.11, c2: 7.85, mcm: 15.10, mco: 11.40 },
    { d: 100, t: 10, cylinderDia: 139.7, wallThick: 5.60, G: 208, c1: 5.11, c2: 7.85, mcm: 15.10, mco: 11.40 },
    { d: 100, t: 12, cylinderDia: 139.7, wallThick: 5.60, G: 208, c1: 5.11, c2: 7.85, mcm: 15.10, mco: 11.40 },
    { d: 100, t: 14, cylinderDia: 139.7, wallThick: 5.60, G: 208, c1: 5.11, c2: 7.85, mcm: 15.10, mco: 11.40 },
    // 110mm plunger
    { d: 110, t: 5, cylinderDia: 152.4, wallThick: 6.30, G: 215, c1: 6.16, c2: 9.50, mcm: 19.70, mco: 12.90 },
    { d: 110, t: 7.5, cylinderDia: 152.4, wallThick: 6.30, G: 215, c1: 6.16, c2: 9.50, mcm: 19.70, mco: 12.90 },
    { d: 110, t: 10, cylinderDia: 152.4, wallThick: 6.30, G: 215, c1: 6.16, c2: 9.50, mcm: 19.70, mco: 12.90 },
    { d: 110, t: 12, cylinderDia: 152.4, wallThick: 6.30, G: 215, c1: 6.16, c2: 9.50, mcm: 19.70, mco: 12.90 },
    { d: 110, t: 14, cylinderDia: 152.4, wallThick: 6.30, G: 215, c1: 6.16, c2: 9.50, mcm: 19.70, mco: 12.90 },
    { d: 110, t: 20, cylinderDia: 152.4, wallThick: 6.30, G: 215, c1: 6.16, c2: 9.50, mcm: 19.70, mco: 12.90 },
    // 120mm plunger
    { d: 120, t: 5, cylinderDia: 168.3, wallThick: 6.30, G: 220, c1: 7.73, c2: 11.31, mcm: 24.40, mco: 14.10 },
    { d: 120, t: 7.5, cylinderDia: 168.3, wallThick: 6.30, G: 220, c1: 7.73, c2: 11.31, mcm: 24.40, mco: 14.10 },
    { d: 120, t: 10, cylinderDia: 168.3, wallThick: 6.30, G: 220, c1: 7.73, c2: 11.31, mcm: 24.40, mco: 14.10 },
    { d: 120, t: 12, cylinderDia: 168.3, wallThick: 6.30, G: 220, c1: 7.73, c2: 11.31, mcm: 24.40, mco: 14.10 },
    { d: 120, t: 14, cylinderDia: 168.3, wallThick: 6.30, G: 220, c1: 7.73, c2: 11.31, mcm: 24.40, mco: 14.10 },
    { d: 120, t: 16.5, cylinderDia: 168.3, wallThick: 6.30, G: 220, c1: 7.73, c2: 11.31, mcm: 24.40, mco: 14.10 },
    // 125mm plunger
    { d: 125, t: 7.5, cylinderDia: 168.3, wallThick: 6.30, G: 220, c1: 6.77, c2: 12.27, mcm: 24.40, mco: 14.10 },
    { d: 125, t: 10, cylinderDia: 168.3, wallThick: 6.30, G: 220, c1: 6.77, c2: 12.27, mcm: 24.40, mco: 14.10 },
    { d: 125, t: 15, cylinderDia: 168.3, wallThick: 6.30, G: 220, c1: 6.77, c2: 12.27, mcm: 24.40, mco: 14.10 },
    // 130mm plunger
    { d: 130, t: 5, cylinderDia: 168.3, wallThick: 6.30, G: 220, c1: 5.77, c2: 13.27, mcm: 21.60, mco: 14.10 },
    { d: 130, t: 7.5, cylinderDia: 168.3, wallThick: 6.30, G: 220, c1: 5.77, c2: 13.27, mcm: 21.60, mco: 14.10 },
    { d: 130, t: 12, cylinderDia: 168.3, wallThick: 6.30, G: 220, c1: 5.77, c2: 13.27, mcm: 21.60, mco: 14.10 },
    // 140mm plunger
    { d: 140, t: 7.5, cylinderDia: 193.7, wallThick: 6.30, G: 225, c1: 10.37, c2: 15.39, mcm: 30.40, mco: 17.10 },
    { d: 140, t: 10, cylinderDia: 193.7, wallThick: 6.30, G: 225, c1: 10.37, c2: 15.39, mcm: 30.40, mco: 17.10 },
    { d: 140, t: 14, cylinderDia: 193.7, wallThick: 6.30, G: 225, c1: 10.37, c2: 15.39, mcm: 30.40, mco: 17.10 },
    { d: 140, t: 22, cylinderDia: 193.7, wallThick: 6.30, G: 225, c1: 10.37, c2: 15.39, mcm: 30.40, mco: 17.10 },
    // 150mm plunger
    { d: 150, t: 6, cylinderDia: 193.7, wallThick: 6.30, G: 225, c1: 8.09, c2: 17.67, mcm: 27.80, mco: 17.10 },
    { d: 150, t: 7.5, cylinderDia: 193.7, wallThick: 6.30, G: 225, c1: 8.09, c2: 17.67, mcm: 27.80, mco: 17.10 },
    { d: 150, t: 10, cylinderDia: 193.7, wallThick: 6.30, G: 225, c1: 8.09, c2: 17.67, mcm: 27.80, mco: 17.10 },
    { d: 150, t: 15.5, cylinderDia: 193.7, wallThick: 6.30, G: 225, c1: 8.09, c2: 17.67, mcm: 27.80, mco: 17.10 },
    // 160mm plunger
    { d: 160, t: 7.5, cylinderDia: 219.1, wallThick: 7.10, G: 232, c1: 12.87, c2: 20.11, mcm: 38.90, mco: 19.90 },
    { d: 160, t: 10, cylinderDia: 219.1, wallThick: 7.10, G: 232, c1: 12.87, c2: 20.11, mcm: 38.90, mco: 19.90 },
    { d: 160, t: 14, cylinderDia: 219.1, wallThick: 7.10, G: 232, c1: 12.87, c2: 20.11, mcm: 38.90, mco: 19.90 },
    // 170mm plunger
    { d: 170, t: 8.6, cylinderDia: 244.5, wallThick: 8.00, G: 242, c1: 18.31, c2: 22.70, mcm: 55.50, mco: 24.50 },
    { d: 170, t: 10.3, cylinderDia: 244.5, wallThick: 8.00, G: 242, c1: 18.31, c2: 22.70, mcm: 55.50, mco: 24.50 },
    { d: 170, t: 13.6, cylinderDia: 244.5, wallThick: 8.00, G: 242, c1: 18.31, c2: 22.70, mcm: 55.50, mco: 24.50 },
    // 180mm plunger
    { d: 180, t: 7.5, cylinderDia: 244.5, wallThick: 8.00, G: 242, c1: 15.56, c2: 25.45, mcm: 52.50, mco: 24.50 },
    { d: 180, t: 10, cylinderDia: 244.5, wallThick: 8.00, G: 242, c1: 15.56, c2: 25.45, mcm: 52.50, mco: 24.50 },
    { d: 180, t: 14, cylinderDia: 244.5, wallThick: 8.00, G: 242, c1: 15.56, c2: 25.45, mcm: 52.50, mco: 24.50 },
    // 185mm plunger (using 180mm data as approximation)
    { d: 185, t: 8.15, cylinderDia: 244.5, wallThick: 8.00, G: 242, c1: 15.56, c2: 25.45, mcm: 52.50, mco: 24.50 },
    { d: 185, t: 13.15, cylinderDia: 244.5, wallThick: 8.00, G: 242, c1: 15.56, c2: 25.45, mcm: 52.50, mco: 24.50 },
    // 200mm plunger
    { d: 200, t: 12, cylinderDia: 273, wallThick: 10.00, G: 242, c1: 18.86, c2: 31.42, mcm: 50.50, mco: 24.50 },
    // 210mm plunger
    { d: 210, t: 13.15, cylinderDia: 273, wallThick: 10.00, G: 342, c1: 15.64, c2: 34.64, mcm: 96.30, mco: 44.50 },
    // 220mm plunger
    { d: 220, t: 12, cylinderDia: 298.5, wallThick: 10.00, G: 342, c1: 22.90, c2: 38.01, mcm: 94.50, mco: 44.50 },
    // 230mm plunger
    { d: 230, t: 13, cylinderDia: 298.5, wallThick: 10.00, G: 352, c1: 19.37, c2: 41.55, mcm: 122.50, mco: 40.90 },
    // 240mm plunger
    { d: 240, t: 12, cylinderDia: 323.9, wallThick: 12.50, G: 352, c1: 24.93, c2: 45.24, mcm: 138.70, mco: 68.40 },
    // 260mm plunger
    { d: 260, t: 13.6, cylinderDia: 355.6, wallThick: 12.50, G: 355, c1: 32.75, c2: 53.09, mcm: 212.40, mco: 63.10 },
    // 280mm plunger
    { d: 280, t: 13.15, cylinderDia: 355.6, wallThick: 12.50, G: 358, c1: 24.27, c2: 61.58, mcm: 225.70, mco: 63.10 },
    // 290mm plunger
    { d: 290, t: 13.15, cylinderDia: 355.6, wallThick: 12.50, G: 399, c1: 19.79, c2: 66.05, mcm: 223.40, mco: 63.10 }
];

// Available rod wall thicknesses
const availableRodThicknesses = [0, 5, 6, 7.5, 8, 8.6, 10, 12, 12.75, 13.5, 14, 15.75, 16.5, 22];

const pumps = [
    { flow: 7.80, name: "PAVE020#4J", price: 163.45 },
    { flow: 11.90, name: "PAVE020#4B", price: 163.45 },
    { flow: 15.70, name: "PAVE025#4K", price: 163.45 },
    { flow: 18.10, name: "PAVE025#4J", price: 163.60 },
    { flow: 21.70, name: "PAVE025#4A", price: 163.45 },
    { flow: 26.00, name: "PAVE025#4B", price: 163.60 },
    { flow: 33.40, name: "PA025#6C", price: 163.60 },
    { flow: 38.00, name: "PA025#6A", price: 163.60 },
    { flow: 45.60, name: "PA029#6B", price: 163.60 },
    { flow: 53.70, name: "PA032#4A", price: 163.54 },
    { flow: 71.60, name: "PA032#4B", price: 163.54 },
    { flow: 98.90, name: "PAP040#4A", price: 163.48 },
    { flow: 121.00, name: "PAP040#4B", price: 163.48 },
    { flow: 145.30, name: "PAP040#4C", price: 163.48 },
    { flow: 177.90, name: "PAP045#4A", price: 225.58 },
    { flow: 210.50, name: "PAP045#4B", price: 225.58 },
    { flow: 247.40, name: "PAP045#4C", price: 225.58 },
    { flow: 252.60, name: "PAP055#4A", price: 225.58 },
    { flow: 302.10, name: "PAP055#4B", price: 305.89 },
    { flow: 358.90, name: "PAP055#4C", price: 305.89 },
    { flow: 376.80, name: "PAP055#4D", price: 305.89 },
    { flow: 429.50, name: "PAP060#4A", price: 417.07 },
    { flow: 525.30, name: "PAP060#4B", price: 417.07 },
    { flow: 615.80, name: "PAP072#4A", price: 655.33 },
    { flow: 727.40, name: "PAP072#4B", price: 655.33 },
    { flow: 872.60, name: "PAP072#4C", price: 655.33 },
    { flow: 1150.60, name: "PAP060#4B", price: 655.33 }
];

const motors = [
    { kw: 2.2, name: "SBBL64", current380: { delta: 13.2, star: 7.6 }, current220: { delta: 23, star: 23 }, price: 236.93 },
    { kw: 2.9, name: "SBBL100", current380: { delta: 16.5, star: 9.5 }, current220: { delta: 29.5, star: 29.5 }, price: 236.29 },
    { kw: 4.7, name: "SBBL153", current380: { delta: 13, star: 7.3 }, price: 240.41 },
    { kw: 5.8, name: "SBBL163", current380: { delta: 15, star: 8.8 }, price: 255.97 },
    { kw: 7.7, name: "SBBL173", current380: { delta: 19, star: 11 }, price: 275.95 },
    { kw: 9.5, name: "SBBL183", current380: { delta: 25, star: 14 }, price: 312.50 },
    { kw: 11.0, name: "SBBL193", current380: { delta: 27, star: 16 }, price: 316.73 },
    { kw: 12.5, name: "SBBL203", current380: { delta: 28, star: 16 }, price: 349.25 },
    { kw: 14.7, name: "SBBL253", current380: { delta: 32, star: 19 }, price: 362.52 },
    { kw: 18.4, name: "SBBL263", current380: { delta: 47, star: 27 }, price: 423.18 },
    { kw: 22.0, name: "SBBL275", current380: { delta: 51, star: 30 }, price: 468.17 },
    { kw: 24.0, name: "SBBL212", current380: { delta: 55, star: 32 }, price: 525.60 },
    { kw: 29.4, name: "SBBL413", current380: { delta: 64, star: 37 }, price: 617.09 },
    { kw: 36.8, name: "SBBL423", current380: { delta: 82, star: 47 }, price: 817.17 },
    { kw: 44.1, name: "SBBL433", current380: { delta: 93, star: 54 }, price: 867.55 },
    { kw: 51.5, name: "SBBL313", current380: { delta: 128, star: 74 }, price: 980.53 },
    { kw: 58.8, name: "SBBL323", current380: { delta: 129, star: 74 }, price: 1140.26 },
    { kw: 73.5, name: "SBBL333", current380: { delta: 134, star: 78 }, price: 1380.89 }
];

const powerUnits = [
    {
        model: "BTD-55", pumpMin: 8, pumpMax: 25, motorMin: 2.2, motorMax: 2.9,
        deadZone: 12, totalOil: 56.97, tankCapacity: 55, height: 978, length: 255, width: 270,
        price: 400
    },
    {
        model: "BTS-75", pumpMin: 25, pumpMax: 75, motorMin: 4.7, motorMax: 7.7,
        deadZone: 34, totalOil: 89.62, tankCapacity: 75, height: 886, length: 595, width: 344.8,
        price: 400
    },
    {
        model: "BTS-150", pumpMin: 75, pumpMax: 150, motorMin: 7.7, motorMax: 14.7,
        deadZone: 62, totalOil: 189.73, tankCapacity: 150, height: 1118, length: 750, width: 400,
        price: 600
    },
    {
        model: "BTS-250", pumpMin: 150, pumpMax: 250, motorMin: 14.7, motorMax: 29.4,
        deadZone: 78, totalOil: 299.43, tankCapacity: 250, height: 1251, length: 880, width: 450,
        price: 700
    },
    {
        model: "BTS-400", pumpMin: 240, pumpMax: 380, motorMin: 29.7, motorMax: 44.1,
        deadZone: 126, totalOil: 420.36, tankCapacity: 400, height: 1251, length: 1000, width: 550,
        price: 950
    },
    {
        model: "BTS-600", pumpMin: 380, pumpMax: 500, motorMin: 44.1, motorMax: 58.8,
        deadZone: 185, totalOil: 639.53, tankCapacity: 600, height: 1388, length: 1100, width: 650,
        price: 1150
    },
    {
        model: "BTS-1000", pumpMin: 500, pumpMax: 1000, motorMin: 58.8, motorMax: 73.5,
        deadZone: 342, totalOil: 1216.24, tankCapacity: 1000, height: 1509, length: 1500, width: 800,
        price: 1350
    },
    {
        model: "BTS-1800", pumpMin: 500, pumpMax: 1200, motorMin: 58.8, motorMax: 73.5,
        deadZone: 483, totalOil: 1869.49, tankCapacity: 1800, height: 1656, length: 1800, width: 900,
        price: 2250
    }
];

const accessories = [
    { name: "Kompanse Klavuzu CX", included: false, category: "Kontrol", price: 89 },
    { name: "El Pompası", included: false, category: "Güvenlik", price: 105 },
    { name: "Küresel Vana BG", included: false, category: "Vana", price: 0 }, // Price calculated dynamically
    { name: "Tank Isıtıcı 25°C", included: false, category: "Isıtma", price: 197 },
    { name: "Y.Basınç Şalteri 10-100 Bar", included: false, category: "Güvenlik", price: 32 },
    { name: "A.Basınç Şalteri 1-10 Bar", included: false, category: "Güvenlik", price: 32 },
    { name: "Aşırı Yük", included: false, category: "Güvenlik", price: 32 },
    { name: "Mikro Seviyeleme", included: false, category: "Kontrol", price: 1150 },
    { name: "Güç Ünitesi Hortumları", included: false, category: "Bağlantı", price: 420 }
];

// Cylinder pricing (real data)
// Formula: Total = Fixed + (PerMeter × Stroke) + Additional
const cylinderPricing = {
    "50x0": { fixed: 348.60, perMeter: 62.77, additional: 402.88 },
    "56x0": { fixed: 363.09, perMeter: 74.36, additional: 407.62 },
    "60x0": { fixed: 370.44, perMeter: 87.09, additional: 410.87 },
    "60x5": { fixed: 319.26, perMeter: 39.05, additional: 381.19 },
    "63x0": { fixed: 384.93, perMeter: 91.62, additional: 411.01 },
    "63x6": { fixed: 351.25, perMeter: 51.01, additional: 381.30 },
    "70x0": { fixed: 387.85, perMeter: 101.47, additional: 436.31 },
    "70x5": { fixed: 316.66, perMeter: 47.90, additional: 407.29 },
    "70x7.5": { fixed: 324.10, perMeter: 59.88, additional: 407.29 },
    "80x0": { fixed: 462.35, perMeter: 117.96, additional: 449.04 },
    "80x5": { fixed: 354.65, perMeter: 52.36, additional: 419.23 },
    "80x7.5": { fixed: 353.85, perMeter: 64.52, additional: 419.23 },
    "80x10": { fixed: 381.34, perMeter: 85.10, additional: 419.24 },
    "80x12": { fixed: 402.14, perMeter: 77.70, additional: 419.24 },
    "90x0": { fixed: 480.74, perMeter: 118.79, additional: 474.69 },
    "90x5": { fixed: 367.77, perMeter: 62.26, additional: 444.94 },
    "90x7.5": { fixed: 386.22, perMeter: 73.40, additional: 444.95 },
    "90x10": { fixed: 419.08, perMeter: 95.64, additional: 444.95 },
    "90x12": { fixed: 417.48, perMeter: 93.50, additional: 444.95 },
    "90x13.5": { fixed: 433.74, perMeter: 110.93, additional: 439.79 },
    "100x5": { fixed: 385.66, perMeter: 67.95, additional: 473.50 },
    "100x7.5": { fixed: 385.65, perMeter: 81.51, additional: 473.50 },
    "100x10": { fixed: 385.65, perMeter: 93.66, additional: 473.50 },
    "100x12": { fixed: 413.62, perMeter: 102.14, additional: 473.50 },
    "100x14": { fixed: 439.75, perMeter: 124.68, additional: 473.51 },
    "110x5": { fixed: 463.92, perMeter: 77.24, additional: 559.99 },
    "110x7.5": { fixed: 462.49, perMeter: 95.44, additional: 559.99 },
    "110x10": { fixed: 509.55, perMeter: 122.51, additional: 560.00 },
    "110x12": { fixed: 503.91, perMeter: 119.90, additional: 560.01 },
    "110x14": { fixed: 527.92, perMeter: 149.53, additional: 560.01 },
    "110x20": { fixed: 535.15, perMeter: 184.02, additional: 553.62 },
    "120x5": { fixed: 460.55, perMeter: 91.76, additional: 662.56 },
    "120x7.5": { fixed: 463.48, perMeter: 109.52, additional: 662.56 },
    "120x10": { fixed: 516.36, perMeter: 142.54, additional: 662.58 },
    "120x12": { fixed: 484.87, perMeter: 139.55, additional: 662.58 },
    "120x14": { fixed: 516.38, perMeter: 165.99, additional: 662.58 },
    "120x16.5": { fixed: 536.44, perMeter: 176.91, additional: 649.27 },
    "125x7.5": { fixed: 526.31, perMeter: 129.73, additional: 663.90 },
    "125x10": { fixed: 526.31, perMeter: 159.36, additional: 663.91 },
    "125x15": { fixed: 559.39, perMeter: 176.14, additional: 663.93 },
    "130x5": { fixed: 490.48, perMeter: 97.67, additional: 664.56 },
    "130x7.5": { fixed: 498.95, perMeter: 121.19, additional: 664.26 },
    "130x12": { fixed: 498.73, perMeter: 157.12, additional: 664.59 },
    "140x7.5": { fixed: 570.77, perMeter: 168.84, additional: 764.13 },
    "140x10": { fixed: 570.79, perMeter: 183.32, additional: 764.13 },
    "140x14": { fixed: 603.82, perMeter: 217.23, additional: 764.15 },
    "140x22": { fixed: 621.84, perMeter: 266.31, additional: 812.94 },
    "150x6": { fixed: 546.15, perMeter: 156.32, additional: 786.59 },
    "150x7.5": { fixed: 579.78, perMeter: 174.79, additional: 786.59 },
    "150x10": { fixed: 546.07, perMeter: 181.55, additional: 786.60 },
    "150x15.5": { fixed: 617.33, perMeter: 244.16, additional: 786.61 },
    "160x7.5": { fixed: 890.75, perMeter: 193.21, additional: 914.88 },
    "160x10": { fixed: 890.75, perMeter: 217.38, additional: 914.89 },
    "160x14": { fixed: 922.31, perMeter: 252.99, additional: 914.90 },
    "170x8.6": { fixed: 930.08, perMeter: 223.23, additional: 944.95 },
    "170x10.3": { fixed: 930.09, perMeter: 245.52, additional: 944.96 },
    "170x13.6": { fixed: 964.57, perMeter: 277.65, additional: 948.99 },
    "180x7.5": { fixed: 978.47, perMeter: 231.77, additional: 1010.72 },
    "180x10": { fixed: 978.47, perMeter: 262.91, additional: 1010.72 },
    "180x14": { fixed: 980.00, perMeter: 296.62, additional: 971.48 },
    "185x8.15": { fixed: 979.28, perMeter: 259.19, additional: 1001.41 },
    "185x13.15": { fixed: 1028.85, perMeter: 310.54, additional: 1001.13 },
    "200x12": { fixed: 1493.28, perMeter: 344.19, additional: 1358.39 },
    "210x13.15": { fixed: 1634.91, perMeter: 406.61, additional: 1357.07 },
    "220x12": { fixed: 1948.70, perMeter: 411.95, additional: 1600.59 },
    "230x13": { fixed: 2010.89, perMeter: 536.74, additional: 1608.81 },
    "240x12": { fixed: 2095.14, perMeter: 548.69, additional: 2012.38 },
    "260x13.6": { fixed: 3954.01, perMeter: 790.91, additional: 2741.21 },
    "280x13.15": { fixed: 4352.09, perMeter: 1146.61, additional: 3285.59 },
    "290x13.15": { fixed: 4449.76, perMeter: 1030.93, additional: 3283.48 }
};

// Burst hose valve pricing (Patlak Hortum Valfi)
const burstHoseValves = [
    { size: "0.5\"", name: "0,5'' R10L A-0,5'' G / T A-0,5'' G", hasDK: false, price: 116.52 },
    { size: "0.75\"", name: "0,75'' R10L A-0,75'' G / T A-0,75'' G", hasDK: false, price: 129.99 },
    { size: "0.75\"", name: "0,75'' R10L A-0,75'' G / T A-0,75'' G + DK", hasDK: true, price: 129.99 },
    { size: "1.0\"", name: "1,0'' R10L A-1,0'' G / T A-1,0'' G", hasDK: false, price: 129.99 },
    { size: "1.0\"", name: "1,0'' R10L A-1,0'' G / T A-1,0'' G + DK", hasDK: true, price: 143.98 },
    { size: "1.5\"", name: "1,5'' R10L A-1,5'' G / T A-1,5'' G", hasDK: false, price: 158.02 },
    { size: "1.5\"", name: "1,5'' R10L A-1,5'' G / T A-1,5'' G + DK", hasDK: true, price: 172.00 },
    { size: "2.0\"", name: "2,0'' R10L A-2,0'' G / T A-2,0'' G", hasDK: false, price: 212.86 },
    { size: "2.0\"", name: "2,0'' R10L A-2,0'' G / T A-2,0'' G + DK", hasDK: true, price: 226.86 }
];

// Main valve pricing (Ana Kontrol Valfi)
const mainValves = [
    { name: "0,5'' GV", price: 112.035 },
    { name: "0,5'' KV1P", price: 254.6470039 },
    { name: "0,5'' KV1S", price: 288.8039308 },
    { name: "0,5'' KV2P", price: 297.4960324 },
    { name: "0,5'' KV2S", price: 328.4606607 },
    { name: "0,75'' EVD", price: 434.6599896 },
    { name: "0,75'' EV100", price: 397.8475006 },
    { name: "1,5'' EV100", price: 507.9848806 }
];

// Hose pricing data
const hosePricing = {
    "1/2": { perMeter: 5.289473684, fixed: 2.689473684, type: "R2" },
    "3/4": { perMeter: 7, fixed: 8.473684211, type: "R2" },
    "1": { perMeter: 10.13157895, fixed: 14.36842105, type: "R2" },
    "1 1/4": { perMeter: 14.78947368, fixed: 17.68421053, type: "R2" },
    "1.5": { perMeter: 19.21052632, fixed: 30.94736842, type: "R2" },
    "2": { perMeter: 57.89473684, fixed: 47.15789474, type: "R9" },
    "2.5": { perMeter: 0, fixed: 100, type: "R9" },
    "3": { perMeter: 0, fixed: 150, type: "R9" } // Added for > 63
};

// Function to recommend hose diameter based on pump flow
function recommendHoseDiameter(pumpFlow) {
    // O53 = √(21 × Flow / 4)
    const o53 = Math.sqrt(21 * pumpFlow / 4);

    if (o53 <= 13) return "1/2";
    if (o53 <= 20) return "3/4";
    if (o53 <= 26) return "1";
    if (o53 <= 32.5) return "1 1/4";
    if (o53 <= 39) return "1.5";
    if (o53 <= 52) return "2";
    if (o53 <= 63) return "2.5";
    return "3";
}

// Function to calculate hose cost
function calculateHoseCost(mainDiameter, mainLength, cylinderDiameter, cylinderLength, cylinderCount) {
    console.log('Hose calc:', { mainDiameter, mainLength, cylinderDiameter, cylinderLength, cylinderCount });

    const mainHose = hosePricing[mainDiameter];
    const cylHose = hosePricing[cylinderDiameter];

    console.log('Hose pricing:', { mainHose, cylHose });

    if (!mainHose || !cylHose) {
        console.warn('Hose pricing not found', mainDiameter, cylinderDiameter);
        return 0;
    }

    let baseCost = 0;

    // Single cylinder
    if (cylinderCount === 1) {
        baseCost = (mainHose.perMeter * mainLength) + mainHose.fixed;
        console.log('Single cylinder base cost:', baseCost);
    } else {
        // Multiple cylinders
        const mainCost = (mainHose.perMeter * mainLength) + mainHose.fixed;
        const cylinderCost = cylinderCount * ((cylHose.perMeter * cylinderLength) + cylHose.fixed);
        baseCost = mainCost + cylinderCost;
        console.log('Multi cylinder:', { mainCost, cylinderCost, baseCost });
    }

    // Apply 30% profit margin
    const costWithMargin = baseCost * 1.3;

    // Round up to nearest 50
    const finalCost = Math.ceil(costWithMargin / 50) * 50;

    console.log('Hose cost calculation:', { baseCost, costWithMargin, finalCost });
    return finalCost;
}
