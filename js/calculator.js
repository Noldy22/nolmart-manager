// js/calculator.js - NolMart Standard Operating Procedure (SOP) & Recipe Lab
// Authoritative Formulation Engine based on NolMart SOP v3.1 (July 2026)
// Base Formula: 60% Essential Oil : 40% Cosmetic Ethanol + 3 drops Fixative per bottle
// (6ml Pocket Rollers use 83:17 ratio -> 5ml oil : 1ml ethanol + 2 drops fixative)

export const RECIPES_CATALOG = [
  // ====================================================
  // 🏆 FLAGSHIP SIGNATURE SCENTS (Proprietary House Blends)
  // Exclusive formulas — Market as house flagships
  // ====================================================
  {
    id: 'crown_noir',
    name: 'Crown Noir 🏆',
    category: "Flagship Men's Bold Signature",
    group: 'Flagship Scents',
    status: 'Active Flagship',
    restTime: '15 minutes minimum',
    description: 'Crisp sparkling fruity-aromatic opening giving way to deep smoky oud-oriental power.',
    oils: [
      { key: '212_vip_men', name: '212 VIP Men Essential Oil', ratio: 0.55 },
      { key: 'noir_extreme', name: 'Tom Ford Noir Extreme Essential Oil', ratio: 0.45 }
    ],
    prices: { 6: 8000, 10: 18000, 30: 55000 }
  },
  {
    id: 'cashmere_bloom',
    name: 'Cashmere Bloom 🏆',
    category: "Flagship Women's Elegant Signature",
    group: 'Flagship Scents',
    status: 'Active Flagship',
    restTime: '15 minutes minimum',
    description: 'Soft sugary-sweet comfort wrapped in powdery mature floral elegance.',
    oils: [
      { key: 'marshmallow', name: 'Marshmallow Essential Oil', ratio: 0.55 },
      { key: 'burberry_weekend', name: 'Burberry Weekend Essential Oil', ratio: 0.45 }
    ],
    prices: { 6: 8000, 10: 18000, 30: 55000 }
  },
  {
    id: 'azure_vip',
    name: 'Azure VIP 🏆',
    category: "Flagship Men's Calm Signature",
    group: 'Flagship Scents',
    status: 'Launch-Ready',
    restTime: '15 minutes',
    description: 'Fresh bright citrus-aromatic opening settling into smooth warm Madagascar vanilla.',
    oils: [
      { key: '212_vip_men', name: '212 VIP Men Essential Oil', ratio: 0.35 },
      { key: 'vanilla_28', name: 'Vanilla 28 Essential Oil', ratio: 0.65 }
    ],
    prices: { 6: 8000, 10: 18000, 30: 50000 }
  },
  {
    id: 'onyx_bloom',
    name: 'Onyx Bloom 🏆',
    category: "Flagship Women's Strong Signature",
    group: 'Flagship Scents',
    status: 'Pending TF Restock',
    restTime: '15 minutes',
    description: 'Bold dark oud-oriental power softened by a romantic floral heart of Pink Chiffon.',
    oils: [
      { key: 'noir_extreme', name: 'Tom Ford Noir Extreme Essential Oil', ratio: 0.55 },
      { key: 'pink_chiffon', name: 'Pink Chiffon Essential Oil', ratio: 0.45 }
    ],
    prices: { 6: 8000, 10: 18000, 30: 55000 }
  },

  // ====================================================
  // 🌟 FINALIZED SIGNATURE BLENDS (SOP Sections 4 & 5)
  // ====================================================
  {
    id: 'obsidian_reef',
    name: 'Obsidian Reef',
    category: 'Dark Aquatic Luxury Niche',
    group: 'Signature Blends',
    status: 'Finalized',
    restTime: '10–12 minutes',
    description: 'Dark oud depth lifted and cut through by a clean oceanic aquatic breeze.',
    oils: [
      { key: 'noir_extreme', name: 'Tom Ford Noir Extreme Essential Oil', ratio: 0.75 },
      { key: 'reef', name: 'Reef Essential Oil', ratio: 0.25 }
    ],
    prices: { 6: 8000, 10: 14000, 30: 40000 }
  },
  {
    id: 'coastal_dream',
    name: 'Coastal Dream',
    category: 'Sweet Tropical Gourmand (Bestseller)',
    group: 'Signature Blends',
    status: 'Finalized',
    restTime: '10 minutes',
    description: 'Warm toasted coconut wrapped in deep creamy Madagascar vanilla.',
    oils: [
      { key: 'coconut_passion', name: 'Coconut Passion Essential Oil', ratio: 0.60 },
      { key: 'vanilla_28', name: 'Vanilla 28 Essential Oil', ratio: 0.40 }
    ],
    prices: { 6: 7000, 10: 12000, 30: 35000 }
  },
  {
    id: 'electric_rush',
    name: 'Electric Rush',
    category: 'Fresh Energetic Tropical',
    group: 'Signature Blends',
    status: 'Finalized',
    restTime: '10 minutes',
    description: 'Sparkling fresh pineapple woods with a smooth coconut undertone.',
    oils: [
      { key: 'now_rave', name: 'Now Rave Essential Oil', ratio: 0.70 },
      { key: 'coconut_passion', name: 'Coconut Passion Essential Oil', ratio: 0.30 }
    ],
    prices: { 6: 7000, 10: 12000, 30: 35000 }
  },
  {
    id: 'velvet_noir',
    name: 'Velvet Noir',
    category: 'Rich Smooth Gourmand',
    group: 'Signature Blends',
    status: 'Finalized',
    restTime: '10 minutes',
    description: 'Vibrant woods balanced with comforting creamy Madagascar vanilla.',
    oils: [
      { key: 'now_rave', name: 'Now Rave Essential Oil', ratio: 0.50 },
      { key: 'vanilla_28', name: 'Vanilla 28 Essential Oil', ratio: 0.50 }
    ],
    prices: { 6: 7000, 10: 12000, 30: 38000 }
  },
  {
    id: 'paradise_mist',
    name: 'Paradise Mist (3-Note)',
    category: 'Multi-Layered Exotic Tropical',
    group: 'Signature Blends',
    status: 'Finalized',
    restTime: '15 minutes',
    description: 'Lush coconut, creamy brown sugar vanilla, and energetic pineapple woods.',
    oils: [
      { key: 'coconut_passion', name: 'Coconut Passion Essential Oil', ratio: 0.40 },
      { key: 'vanilla_28', name: 'Vanilla 28 Essential Oil', ratio: 0.35 },
      { key: 'now_rave', name: 'Now Rave Essential Oil', ratio: 0.25 }
    ],
    prices: { 6: 8000, 10: 15000, 30: 45000 }
  },
  {
    id: 'tropical_bloom',
    name: 'Tropical Bloom',
    category: 'Sweet Floral Exotic',
    group: 'Signature Blends',
    status: 'Finalized',
    restTime: '10 minutes',
    description: 'Soft floral petals and sparkling berries over sweet coconut milk.',
    oils: [
      { key: 'pink_chiffon', name: 'Pink Chiffon Essential Oil', ratio: 0.55 },
      { key: 'coconut_passion', name: 'Coconut Passion Essential Oil', ratio: 0.45 }
    ],
    prices: { 6: 7000, 10: 12000, 30: 35000 }
  },
  {
    id: 'ocean_breeze',
    name: 'Ocean Breeze',
    category: 'Crisp Aquatic Fresh',
    group: 'Signature Blends',
    status: 'Finalized',
    restTime: '10 minutes',
    description: 'Refreshing ocean minerals combined with juicy pineapple woods.',
    oils: [
      { key: 'reef', name: 'Reef Essential Oil', ratio: 0.60 },
      { key: 'now_rave', name: 'Now Rave Essential Oil', ratio: 0.40 }
    ],
    prices: { 6: 7000, 10: 12000, 30: 35000 }
  },
  {
    id: 'midnight_velvet',
    name: 'Midnight Velvet',
    category: 'Sensual Dark Gourmand',
    group: 'Signature Blends',
    status: 'Finalized',
    restTime: '12 minutes',
    description: 'Smoky cardamom oriental amber infused with creamy rich vanilla.',
    oils: [
      { key: 'noir_extreme', name: 'Tom Ford Noir Extreme Essential Oil', ratio: 0.60 },
      { key: 'vanilla_28', name: 'Vanilla 28 Essential Oil', ratio: 0.40 }
    ],
    prices: { 6: 8000, 10: 15000, 30: 45000 }
  },
  {
    id: 'rose_cream',
    name: 'Rose Cream',
    category: 'Soft Romantic Floral',
    group: 'Signature Blends',
    status: 'Finalized',
    restTime: '10 minutes',
    description: 'Airy floral musk swirled with warm comforting vanilla.',
    oils: [
      { key: 'pink_chiffon', name: 'Pink Chiffon Essential Oil', ratio: 0.50 },
      { key: 'vanilla_28', name: 'Vanilla 28 Essential Oil', ratio: 0.50 }
    ],
    prices: { 6: 7000, 10: 12000, 30: 35000 }
  },
  {
    id: 'lagoon',
    name: 'Lagoon',
    category: 'Clean Tropical Aquatic',
    group: 'Signature Blends',
    status: 'Finalized',
    restTime: '10 minutes',
    description: 'Clean ocean breeze with a delicate creamy coconut finish.',
    oils: [
      { key: 'reef', name: 'Reef Essential Oil', ratio: 0.55 },
      { key: 'coconut_passion', name: 'Coconut Passion Essential Oil', ratio: 0.45 }
    ],
    prices: { 6: 7000, 10: 12000, 30: 35000 }
  },

  // ====================================================
  // 💎 PURE SCENTS (The 9 Core Scents from SOP Sections 1 & 3)
  // ====================================================
  {
    id: 'now_rave',
    name: 'Now Rave (Pure)',
    category: 'Fresh, Energetic, Unisex',
    group: 'Pure Scents',
    status: 'In Stock',
    restTime: '5 minutes',
    description: 'Ultra juicy pineapple, blackcurrant, and fresh vibrant woods.',
    oils: [
      { key: 'now_rave', name: 'Now Rave Essential Oil', ratio: 1.0 }
    ],
    prices: { 6: 7000, 10: 10000, 30: 30000 }
  },
  {
    id: 'coconut_passion',
    name: 'Coconut Passion (Pure)',
    category: 'Sweet Tropical, Warm',
    group: 'Pure Scents',
    status: 'In Stock',
    restTime: '5 minutes',
    description: 'Sweet comforting toasted coconut and comforting island vanilla.',
    oils: [
      { key: 'coconut_passion', name: 'Coconut Passion Essential Oil', ratio: 1.0 }
    ],
    prices: { 6: 7000, 10: 10000, 30: 30000 }
  },
  {
    id: 'vanilla_28',
    name: 'Vanilla 28 (Pure)',
    category: 'Warm, Creamy, Sweet',
    group: 'Pure Scents',
    status: 'In Stock',
    restTime: '5 minutes',
    description: 'Rich, boozy brown sugar Madagascar vanilla with amber facets.',
    oils: [
      { key: 'vanilla_28', name: 'Vanilla 28 Essential Oil', ratio: 1.0 }
    ],
    prices: { 6: 7000, 10: 10000, 30: 30000 }
  },
  {
    id: 'pink_chiffon',
    name: 'Pink Chiffon (Pure)',
    category: 'Light Floral, Romantic',
    group: 'Pure Scents',
    status: 'In Stock',
    restTime: '5 minutes',
    description: 'Soft floral petals, sweet wild berries, and airy spun sugar.',
    oils: [
      { key: 'pink_chiffon', name: 'Pink Chiffon Essential Oil', ratio: 1.0 }
    ],
    prices: { 6: 7000, 10: 10000, 30: 30000 }
  },
  {
    id: 'noir_extreme',
    name: 'Tom Ford Noir Extreme (Pure)',
    category: 'Dark, Oriental, Bold',
    group: 'Pure Scents',
    status: 'Low Stock',
    restTime: '5 minutes',
    description: 'Cardamom spice, Indian kulfi dessert, rich amber and sandalwood.',
    oils: [
      { key: 'noir_extreme', name: 'Tom Ford Noir Extreme Essential Oil', ratio: 1.0 }
    ],
    prices: { 6: 8000, 10: 14000, 30: 40000 }
  },
  {
    id: 'reef',
    name: 'Reef (Pure)',
    category: 'Fresh, Aquatic, Clean',
    group: 'Pure Scents',
    status: 'In Stock',
    restTime: '5 minutes',
    description: 'Clean Arabian amber, saffron, and crisp ocean minerals.',
    oils: [
      { key: 'reef', name: 'Reef Essential Oil', ratio: 1.0 }
    ],
    prices: { 6: 7000, 10: 10000, 30: 30000 }
  },
  {
    id: 'burberry_weekend',
    name: 'Burberry Weekend (Pure)',
    category: 'Soft Powdery Floral with Citrus Lift',
    group: 'Pure Scents',
    status: 'New Core Scent',
    restTime: '5–8 minutes',
    description: 'Mandarin and sage top notes settling into hyacinth, iris, and cedar musk.',
    oils: [
      { key: 'burberry_weekend', name: 'Burberry Weekend Essential Oil', ratio: 1.0 }
    ],
    prices: { 6: 7000, 10: 10000, 30: 30000 }
  },
  {
    id: 'marshmallow',
    name: 'Marshmallow (Pure)',
    category: 'Sweet, Soft, Gourmand Confectionery',
    group: 'Pure Scents',
    status: 'New Core Scent',
    restTime: '5 minutes',
    description: 'Comforting sweet confectionery scent with warm sugary-vanilla facets.',
    oils: [
      { key: 'marshmallow', name: 'Marshmallow Essential Oil', ratio: 1.0 }
    ],
    prices: { 6: 7000, 10: 10000, 30: 30000 }
  },
  {
    id: '212_vip_men',
    name: '212 VIP Men (Pure)',
    category: 'Fresh Fruity-Aromatic Nightlife',
    group: 'Pure Scents',
    status: 'New Core Scent',
    restTime: '5 minutes',
    description: 'Crisp sparkling citrus and mint over a confident, smooth aromatic wood base.',
    oils: [
      { key: '212_vip_men', name: '212 VIP Men Essential Oil', ratio: 1.0 }
    ],
    prices: { 6: 7000, 10: 11000, 30: 32000 }
  },

  // ====================================================
  // 🧪 CUSTOM BLEND (Bespoke Made-to-Order)
  // ====================================================
  {
    id: 'custom_blend',
    name: 'Custom Blend (Client Recipe)',
    category: 'Personalized Bespoke Formulation',
    group: 'Custom Blends',
    status: 'Bespoke',
    restTime: '10–12 minutes',
    description: 'Personalized client blend mixed on-demand to the 60:40 standard ratio.',
    oils: [
      { key: 'custom_oil_1', name: 'Primary Essential Oil (50%)', ratio: 0.50 },
      { key: 'custom_oil_2', name: 'Secondary Essential Oil (50%)', ratio: 0.50 }
    ],
    prices: { 6: 8000, 10: 15000, 30: 40000 }
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
// Enforces the 60:40 formula (or 83:17 for 6ml rollers) and 3 drops fixative
export function getSOPMeasurements(recipeId, bottleSize = 30) {
  const recipe = RECIPES_CATALOG.find(r => r.id === recipeId) || RECIPES_CATALOG[0];
  const size = parseInt(bottleSize, 10);

  let totalOilMl = 18.0;
  let ethanolMl = 12.0;
  let fixativeDrops = 3;
  let packagingName = '30ml Spray Glass Bottle';
  let syringeSpec = 'Use a 10ml/20ml syringe for oil (18ml) and a separate clean syringe for ethanol (12ml)';
  let productionCost = 11727; // From SOP Section 6.1 (Raw materials: 5,969 + Packaging: 3,370 + Overhead: 2,388)

  if (size === 6) {
    // 6ml Pocket Roller (83:17 formula per SOP Section 1.0)
    totalOilMl = 5.0;
    ethanolMl = 1.0;
    fixativeDrops = 2;
    packagingName = '6ml Glass Roller Bottle with Metal Ball';
    syringeSpec = 'Use a 5ml Syringe for oil (5ml) and 1ml syringe/dropper for ethanol (1ml)';
    productionCost = 2800;
  } else if (size === 10) {
    // 10ml Spray Bottle (60:40 formula per SOP Section 1.2 & 1.3)
    totalOilMl = 6.0;
    ethanolMl = 4.0;
    fixativeDrops = 3;
    packagingName = '10ml Spray Glass Atomizer Bottle';
    syringeSpec = 'Use a calibrated syringe for oil (6ml) and a separate clean syringe for ethanol (4ml)';
    productionCost = 4461; // From SOP Section 6.1 (Raw materials: 1,910 + Packaging: 1,787 + Overhead: 764)
  } else {
    // 30ml Spray Bottle (60:40 formula per SOP Section 1.2 & 1.3)
    totalOilMl = 18.0;
    ethanolMl = 12.0;
    fixativeDrops = 3;
    packagingName = '30ml Spray Glass Bottle with Atomizer';
    syringeSpec = 'Use a 10ml/20ml syringe for oil (18ml) and a separate clean syringe for ethanol (12ml)';
    productionCost = 11727;
  }

  // Calculate exact milliliters per oil in the blend
  const ingredients = recipe.oils.map(o => {
    const ml = +(totalOilMl * o.ratio).toFixed(2);
    return {
      key: o.key,
      name: o.name,
      ratio: o.ratio,
      percentage: Math.round(o.ratio * 100),
      ml
    };
  });

  const sellingPrice = recipe.prices[size] || (size === 6 ? 7000 : (size === 10 ? 10000 : 35000));
  const netProfit = sellingPrice - productionCost;
  const marginPercent = Math.round((netProfit / sellingPrice) * 100);

  return {
    recipe,
    size,
    totalVolumeMl: size,
    totalOilMl,
    ethanolMl,
    fixativeDrops,
    packagingName,
    syringeSpec,
    ingredients,
    sellingPrice,
    productionCost,
    netProfit,
    marginPercent,
    restTime: recipe.restTime || '10 minutes'
  };
}
