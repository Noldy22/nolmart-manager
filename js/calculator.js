// js/calculator.js - NolMart Standard Operating Procedure (SOP) & Recipe Lab
// Real-time On-Demand Compounding Guide (Made-to-Order)

export const RECIPES_CATALOG = [
  {
    id: 'cp_v28',
    name: 'Coconut Passion + Vanilla 28',
    category: 'Gourmand Sweet (Bestseller)',
    type: 'layered',
    oilA: { key: 'coconut_passion', name: 'Coconut Passion Oil', ratio: 0.5 },
    oilB: { key: 'vanilla_28', name: 'Vanilla 28 Oil', ratio: 0.5 },
    description: 'Sensual warm vanilla, toasted coconut, and brown sugar caramel.'
  },
  {
    id: 'pc_cp',
    name: 'Pink Chiffon + Coconut Passion',
    category: 'Feminine Sweet Floral',
    type: 'layered',
    oilA: { key: 'pink_chiffon', name: 'Pink Chiffon Oil', ratio: 0.5 },
    oilB: { key: 'coconut_passion', name: 'Coconut Passion Oil', ratio: 0.5 },
    description: 'Soft floral petals, sparkling berries, and sweet coconut milk.'
  },
  {
    id: 'pc_v28',
    name: 'Pink Chiffon + Vanilla 28',
    category: 'Feminine Sweet Floral',
    type: 'layered',
    oilA: { key: 'pink_chiffon', name: 'Pink Chiffon Oil', ratio: 0.5 },
    oilB: { key: 'vanilla_28', name: 'Vanilla 28 Oil', ratio: 0.5 },
    description: 'Chiffon musk layered with deep gourmand vanilla.'
  },
  {
    id: 'cp_berries',
    name: 'Coconut Passion + Berries Weekend',
    category: 'Fruity Gourmand',
    type: 'layered',
    oilA: { key: 'coconut_passion', name: 'Coconut Passion Oil', ratio: 0.5 },
    oilB: { key: 'berries_weekend', name: 'Berries Weekend Oil', ratio: 0.5 },
    description: 'Juicy wild berries with a creamy coconut undertone.'
  },
  {
    id: 'coconut_passion',
    name: 'Coconut Passion (Single)',
    category: 'Gourmand Sweet',
    type: 'single',
    oilA: { key: 'coconut_passion', name: 'Coconut Passion Oil', ratio: 1.0 },
    description: 'Warm coconut and comforting vanilla.'
  },
  {
    id: 'vanilla_28',
    name: 'Vanilla 28 (Single)',
    category: 'Rich Vanilla',
    type: 'single',
    oilA: { key: 'vanilla_28', name: 'Vanilla 28 Oil', ratio: 1.0 },
    description: 'Rich, boozy brown sugar Madagascar vanilla.'
  },
  {
    id: 'now_rave',
    name: 'Now Rave (Single)',
    category: 'Fruity Energetic (Men/Unisex)',
    type: 'single',
    oilA: { key: 'now_rave', name: 'Now Rave Oil', ratio: 1.0 },
    description: 'Ultra juicy pineapple, blackcurrant, and fresh woods.'
  },
  {
    id: 'noir_extreme',
    name: 'Tom Ford Noir Extreme (Single)',
    category: 'Warm Spicy Amber (Executive)',
    type: 'single',
    oilA: { key: 'noir_extreme', name: 'Noir Extreme Oil', ratio: 1.0 },
    description: 'Cardamom, Indian kulfi dessert, rich amber and sandalwood.'
  },
  {
    id: '212_vip',
    name: '212 VIP (Single)',
    category: 'Seductive Nightlife',
    type: 'single',
    oilA: { key: '212_vip', name: '212 VIP Oil', ratio: 1.0 },
    description: 'Fresh spicy passion fruit, gin, ginger, and tonka bean.'
  },
  {
    id: 'reef_33',
    name: 'Reef 33 / Obsidian (Single)',
    category: 'Arabian Luxury Niche',
    type: 'single',
    oilA: { key: 'reef_33', name: 'Reef 33 Oil', ratio: 1.0 },
    description: 'Clean Arabian amber, saffron, and subtle fresh oud.'
  },
  {
    id: 'coastal_dream',
    name: 'Coastal Dream (Single)',
    category: 'Fresh Aquatic',
    type: 'single',
    oilA: { key: 'coastal_dream', name: 'Coastal Dream Oil', ratio: 1.0 },
    description: 'Clean sea breeze, ocean minerals, and crisp morning air.'
  },
  {
    id: 'pink_chiffon',
    name: 'Pink Chiffon (Single)',
    category: 'Soft Floral Berry',
    type: 'single',
    oilA: { key: 'pink_chiffon', name: 'Pink Chiffon Oil', ratio: 1.0 },
    description: 'Soft floral, sweet berries, and airy spun sugar.'
  }
];

// Returns exact measurements and SOP steps based on the bottle size
export function getSOPMeasurements(recipeId, bottleSize = 30) {
  const recipe = RECIPES_CATALOG.find(r => r.id === recipeId) || RECIPES_CATALOG[0];
  const size = parseInt(bottleSize, 10);

  let measurements = {};
  let sellingPrice = 35000;
  let packagingName = '30ml Glass Spray Bottle';

  if (size === 6) {
    // 6ml Pocket Roller Formulation (High oil concentration for smooth roller glide)
    sellingPrice = 7000;
    packagingName = '6ml Roller Bottle with Metal Ball';

    const totalOilMl = 5.4;
    const fixativeMl = 0.6;
    const ethanolMl = 0.0; // Rollers preserve thick oil viscosity

    if (recipe.type === 'layered') {
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
    sellingPrice = 15000;
    packagingName = '10ml Spray Atomizer Bottle';

    const totalOilMl = 2.8; // 28% concentration
    const fixativeMl = 0.5; // 5%
    const ethanolMl = 6.7;  // 67%

    if (recipe.type === 'layered') {
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
    sellingPrice = 35000;
    packagingName = '30ml Glass Spray Bottle with Gold/Black Atomizer';

    const totalOilMl = 8.5; // ~28.3% concentration
    const fixativeMl = 1.5; // 5%
    const ethanolMl = 20.0; // Fill to bottle shoulder

    if (recipe.type === 'layered') {
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
