// js/calculator.js - NolMart Standard Operating Procedure (SOP) & Recipe Lab
// Real-time On-Demand Compounding Guide (Made-to-Order)

export const RECIPES_CATALOG = [
  // ----------------------------------------------------
  // 🌟 SIGNATURE LAYERED BLENDS (From NolMart SOP & Sales)
  // ----------------------------------------------------
  {
    id: 'cp_v28',
    name: 'Coconut Passion + Vanilla 28',
    category: 'Signature Blend (Bestseller)',
    group: 'Signature Blends',
    type: 'layered',
    oilA: { key: 'coconut_passion', name: 'Coconut Passion Oil', ratio: 0.5 },
    oilB: { key: 'vanilla_28', name: 'Vanilla 28 Oil', ratio: 0.5 },
    description: 'Sensual warm vanilla, toasted coconut, and brown sugar caramel.'
  },
  {
    id: 'pc_cp',
    name: 'Pink Chiffon + Coconut Passion',
    category: 'Feminine Sweet Floral',
    group: 'Signature Blends',
    type: 'layered',
    oilA: { key: 'pink_chiffon', name: 'Pink Chiffon Oil', ratio: 0.5 },
    oilB: { key: 'coconut_passion', name: 'Coconut Passion Oil', ratio: 0.5 },
    description: 'Soft floral petals, sparkling berries, and sweet coconut milk.'
  },
  {
    id: 'pc_v28',
    name: 'Pink Chiffon + Vanilla 28',
    category: 'Soft Floral Gourmand',
    group: 'Signature Blends',
    type: 'layered',
    oilA: { key: 'pink_chiffon', name: 'Pink Chiffon Oil', ratio: 0.5 },
    oilB: { key: 'vanilla_28', name: 'Vanilla 28 Oil', ratio: 0.5 },
    description: 'Chiffon musk layered with rich Madagascar vanilla.'
  },
  {
    id: 'cp_berries',
    name: 'Coconut Passion + Berries Weekend',
    category: 'Fruity Gourmand',
    group: 'Signature Blends',
    type: 'layered',
    oilA: { key: 'coconut_passion', name: 'Coconut Passion Oil', ratio: 0.5 },
    oilB: { key: 'berries_weekend', name: 'Berries Weekend Oil', ratio: 0.5 },
    description: 'Juicy wild berries with a creamy coconut undertone.'
  },
  {
    id: 'pc_berries',
    name: 'Pink Chiffon + Berries Weekend',
    category: 'Floral Berry Sweet',
    group: 'Signature Blends',
    type: 'layered',
    oilA: { key: 'pink_chiffon', name: 'Pink Chiffon Oil', ratio: 0.5 },
    oilB: { key: 'berries_weekend', name: 'Berries Weekend Oil', ratio: 0.5 },
    description: 'Fresh berry burst with airy pink chiffon musk.'
  },
  {
    id: 'obsidian_reef',
    name: 'Obsidian Reef',
    category: 'Arabian Luxury Niche',
    group: 'Signature Blends',
    type: 'layered',
    oilA: { key: 'reef_33', name: 'Reef 33 Oil', ratio: 0.5 },
    oilB: { key: 'coastal_dream', name: 'Coastal Dream Oil', ratio: 0.5 },
    description: 'Clean Arabian amber, saffron, and oceanic aquatic breeze.'
  },
  {
    id: 'exec_men',
    name: 'Executive Men Blend',
    category: 'Warm Spicy Amber & Woods',
    group: 'Signature Blends',
    type: 'layered',
    oilA: { key: 'noir_extreme', name: 'Tom Ford Noir Extreme Oil', ratio: 0.5 },
    oilB: { key: 'now_rave', name: 'Now Rave Oil', ratio: 0.5 },
    description: 'Cardamom kulfi amber balanced with juicy energetic pineapple.'
  },
  {
    id: 'custom_blend',
    name: 'Custom Blend (Client Recipe)',
    category: 'Personalized Bespoke',
    group: 'Custom Blends',
    type: 'layered',
    oilA: { key: 'custom_oil_1', name: 'Primary Oil', ratio: 0.5 },
    oilB: { key: 'custom_oil_2', name: 'Secondary Oil', ratio: 0.5 },
    description: 'Client chosen multi-note blend formulated on-demand.'
  },

  // ----------------------------------------------------
  // 💎 SINGLE NOTE PURE SCENTS (From NolMart SOP)
  // ----------------------------------------------------
  {
    id: 'coconut_passion',
    name: 'Coconut Passion',
    category: 'Gourmand Sweet',
    group: 'Single Note Scents',
    type: 'single',
    oilA: { key: 'coconut_passion', name: 'Coconut Passion Oil', ratio: 1.0 },
    description: 'Comforting toasted coconut and warm sweet vanilla.'
  },
  {
    id: 'vanilla_28',
    name: 'Vanilla 28',
    category: 'Rich Madagascar Vanilla',
    group: 'Single Note Scents',
    type: 'single',
    oilA: { key: 'vanilla_28', name: 'Vanilla 28 Oil', ratio: 1.0 },
    description: 'Rich, boozy brown sugar Madagascar vanilla.'
  },
  {
    id: 'now_rave',
    name: 'Now Rave',
    category: 'Fruity Energetic (Men/Unisex)',
    group: 'Single Note Scents',
    type: 'single',
    oilA: { key: 'now_rave', name: 'Now Rave Oil', ratio: 1.0 },
    description: 'Ultra juicy pineapple, blackcurrant, and fresh woods.'
  },
  {
    id: 'pink_chiffon',
    name: 'Pink Chiffon',
    category: 'Soft Floral Berry',
    group: 'Single Note Scents',
    type: 'single',
    oilA: { key: 'pink_chiffon', name: 'Pink Chiffon Oil', ratio: 1.0 },
    description: 'Soft floral petals, sweet berries, and airy spun sugar.'
  },
  {
    id: 'coastal_dream',
    name: 'Coastal Dream',
    category: 'Fresh Oceanic Aquatic',
    group: 'Single Note Scents',
    type: 'single',
    oilA: { key: 'coastal_dream', name: 'Coastal Dream Oil', ratio: 1.0 },
    description: 'Clean sea breeze, ocean minerals, and crisp morning air.'
  },
  {
    id: 'reef_33',
    name: 'Reef 33 / Reef',
    category: 'Arabian Luxury Niche',
    group: 'Single Note Scents',
    type: 'single',
    oilA: { key: 'reef_33', name: 'Reef 33 Oil', ratio: 1.0 },
    description: 'Clean Arabian amber, saffron, and subtle warm musk.'
  },
  {
    id: 'noir_extreme',
    name: 'Tom Ford Noir Extreme',
    category: 'Warm Spicy Amber (Executive)',
    group: 'Single Note Scents',
    type: 'single',
    oilA: { key: 'noir_extreme', name: 'Tom Ford Noir Extreme Oil', ratio: 1.0 },
    description: 'Cardamom, Indian kulfi dessert, rich amber and sandalwood.'
  },
  {
    id: '212_vip',
    name: '212 VIP',
    category: 'Seductive Nightlife',
    group: 'Single Note Scents',
    type: 'single',
    oilA: { key: '212_vip', name: '212 VIP Oil', ratio: 1.0 },
    description: 'Fresh spicy passion fruit, gin, ginger, and tonka bean.'
  },
  {
    id: 'berries_weekend',
    name: 'Berries Weekend',
    category: 'Fruity Sweet Berry',
    group: 'Single Note Scents',
    type: 'single',
    oilA: { key: 'berries_weekend', name: 'Berries Weekend Oil', ratio: 1.0 },
    description: 'Fresh wild berries, candied sugar, and vibrant fruits.'
  }
];

// Conservative maximum transaction cost in TZS for non-cash expenses.
// Protects cash reserves by assuming top-tier tariffs (better to have excess cash than less).
export function calculateMaxTransactionCost(amount, paymentMethod) {
  const amt = Math.max(0, parseFloat(amount) || 0);
  const method = (paymentMethod || 'cash').toLowerCase();

  if (amt === 0 || method === 'cash') {
    return 0;
  }

  if (method === 'bank') {
    if (amt <= 500000) return 2500;
    if (amt <= 2000000) return 5000;
    return 10000;
  }

  // Mobile money channels (M-Pesa, Airtel Money, Tigo Pesa, Halopesa)
  // Uses maximum sending & cash-out tariff brackets in Tanzania
  if (amt <= 1000) return 150;
  if (amt <= 2500) return 400;
  if (amt <= 5000) return 700;
  if (amt <= 10000) return 1200;
  if (amt <= 20000) return 1800;
  if (amt <= 30000) return 2300;
  if (amt <= 40000) return 2700;
  if (amt <= 50000) return 3200;
  if (amt <= 100000) return 4500;
  if (amt <= 200000) return 6500;
  if (amt <= 300000) return 8000;
  if (amt <= 500000) return 9500;
  if (amt <= 1000000) return 12000;

  return Math.min(18000, Math.round(amt * 0.015));
}

// Returns exact measurements and SOP steps based on the bottle size
export function getSOPMeasurements(recipeId, bottleSize = 30) {
  const recipe = RECIPES_CATALOG.find(r => r.id === recipeId) || RECIPES_CATALOG[0];
  const size = parseInt(bottleSize, 10);

  let measurements = {};
  let sellingPrice = 35000;
  let packagingName = '30ml Glass Spray Bottle';

  const isLayeredOrCustom = recipe.type === 'layered' || recipe.type === 'custom';

  if (size === 6) {
    // 6ml Pocket Roller Formulation (High oil concentration for smooth roller glide)
    sellingPrice = isLayeredOrCustom ? 8000 : 7000;
    packagingName = '6ml Roller Bottle with Metal Ball';

    const totalOilMl = 5.4;
    const fixativeMl = 0.6;
    const ethanolMl = 0.0; // Rollers preserve thick oil viscosity

    if (isLayeredOrCustom) {
      measurements = {
        primaryOilName: recipe.oilA.name,
        primaryOilKey: recipe.oilA.key,
        primaryOilMl: 2.7,
        secondaryOilName: recipe.oilB.name,
        secondaryOilKey: recipe.oilB.key,
        secondaryOilMl: 2.7,
        fixativeMl,
        ethanolMl,
        totalVolumeMl: 6.0,
        syringeSpec: 'Use a 3ml or 5ml Syringe'
      };
    } else {
      measurements = {
        primaryOilName: recipe.oilA.name,
        primaryOilKey: recipe.oilA.key,
        primaryOilMl: totalOilMl,
        secondaryOilName: null,
        secondaryOilKey: null,
        secondaryOilMl: 0,
        fixativeMl,
        ethanolMl,
        totalVolumeMl: 6.0,
        syringeSpec: 'Use a 5ml Syringe'
      };
    }
  } else if (size === 10) {
    // 10ml Spray Atomizer Formulation (Extrait de Parfum / EDP spray)
    sellingPrice = isLayeredOrCustom ? 15000 : 10000;
    packagingName = '10ml Spray Atomizer Bottle';

    const totalOilMl = 2.8; // 28% concentration
    const fixativeMl = 0.5; // 5%
    const ethanolMl = 6.7;  // 67%

    if (isLayeredOrCustom) {
      measurements = {
        primaryOilName: recipe.oilA.name,
        primaryOilKey: recipe.oilA.key,
        primaryOilMl: 1.4,
        secondaryOilName: recipe.oilB.name,
        secondaryOilKey: recipe.oilB.key,
        secondaryOilMl: 1.4,
        fixativeMl,
        ethanolMl,
        totalVolumeMl: 10.0,
        syringeSpec: 'Use a 3ml Syringe for oils + 10ml Syringe for Ethanol'
      };
    } else {
      measurements = {
        primaryOilName: recipe.oilA.name,
        primaryOilKey: recipe.oilA.key,
        primaryOilMl: totalOilMl,
        secondaryOilName: null,
        secondaryOilKey: null,
        secondaryOilMl: 0,
        fixativeMl,
        ethanolMl,
        totalVolumeMl: 10.0,
        syringeSpec: 'Use a 3ml or 5ml Syringe for oils + 10ml for Ethanol'
      };
    }
  } else {
    // 30ml Flagship Spray Bottle (Flagship Extrait de Parfum)
    sellingPrice = isLayeredOrCustom ? 35000 : 30000;
    packagingName = '30ml Glass Spray Bottle with Gold/Black Atomizer';

    const totalOilMl = 8.5; // ~28.3% concentration
    const fixativeMl = 1.5; // 5%
    const ethanolMl = 20.0; // Fill to bottle shoulder

    if (isLayeredOrCustom) {
      measurements = {
        primaryOilName: recipe.oilA.name,
        primaryOilKey: recipe.oilA.key,
        primaryOilMl: 4.25,
        secondaryOilName: recipe.oilB.name,
        secondaryOilKey: recipe.oilB.key,
        secondaryOilMl: 4.25,
        fixativeMl,
        ethanolMl,
        totalVolumeMl: 30.0,
        syringeSpec: 'Use a 5ml Syringe for oils + 10ml/20ml Syringe for Ethanol'
      };
    } else {
      measurements = {
        primaryOilName: recipe.oilA.name,
        primaryOilKey: recipe.oilA.key,
        primaryOilMl: totalOilMl,
        secondaryOilName: null,
        secondaryOilKey: null,
        secondaryOilMl: 0,
        fixativeMl,
        ethanolMl,
        totalVolumeMl: 30.0,
        syringeSpec: 'Use a 10ml Syringe for oils + 20ml for Ethanol'
      };
    }
  }

  // Cost estimates based on ingredients
  const oilCost = ((measurements.primaryOilMl + measurements.secondaryOilMl) * 160);
  const fixativeCost = (measurements.fixativeMl * 180);
  const ethanolCost = (measurements.ethanolMl * 12);
  const bottleCost = size === 6 ? 800 : (size === 10 ? 1200 : 2000);
  const labelAndBag = 600;

  const totalCost = Math.round(oilCost + fixativeCost + ethanolCost + bottleCost + labelAndBag);
  const netProfit = sellingPrice - totalCost;
  const marginPercent = Math.round((netProfit / sellingPrice) * 100);

  return {
    recipe,
    size,
    packagingName,
    sellingPrice,
    totalCost,
    netProfit,
    marginPercent,
    ...measurements
  };
}
