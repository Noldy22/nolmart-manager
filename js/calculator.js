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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
  },

  // ====================================================
  // 💎 PURE SCENTS (Core single-oil scents)
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
  },
  {
    id: 'club_de_nuit',
    name: 'Club de Nuit (Pure)',
    category: 'Smoky Birch, Citrus, Magnetic',
    group: 'Pure Scents',
    status: 'New Core Scent',
    restTime: '5 minutes',
    description: 'Lemon, blackcurrant and apple over smoky birch, ambergris and musk.',
    oils: [
      { key: 'club_de_nuit', name: 'Club de Nuit Essential Oil', ratio: 1.0 }
    ],
    prices: { 6: 7000, 10: 15000, 30: 35000 }
  },
  {
    id: 'sauvage_dior',
    name: 'Sauvage Dior (Pure)',
    category: 'Fresh Spicy, Ambroxan',
    group: 'Pure Scents',
    status: 'New Core Scent',
    restTime: '5 minutes',
    description: 'Calabrian bergamot and Sichuan pepper over warm ambroxan and cedar.',
    oils: [
      { key: 'sauvage_dior', name: 'Sauvage Dior Essential Oil', ratio: 1.0 }
    ],
    prices: { 6: 7000, 10: 15000, 30: 35000 }
  },
  {
    id: 'strawberry',
    name: 'Strawberry (Pure)',
    category: 'Fruity Sweet, Cheerful',
    group: 'Pure Scents',
    status: 'New Core Scent',
    restTime: '5 minutes',
    description: 'Juicy wild strawberries, spun sugar and soft vanilla. Also used in car fresheners.',
    oils: [
      { key: 'strawberry', name: 'Strawberry Essential Oil', ratio: 1.0 }
    ],
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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
    prices: { 6: 7000, 10: 15000, 30: 35000 }
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

// Calculate transfer / money movement fee between storage methods.
// Rule: Transfers originating from cash (e.g. Cash -> M-Pesa/Airtel/Selcom/Bank) have ZERO fees.
// Transfers originating from electronic accounts (M-Pesa, Airtel Money, Selcom, Bank) incur standard tariffs.
export function calculateTransferFee(amount, fromMethod, toMethod) {
  const amt = Math.max(0, parseFloat(amount) || 0);
  const from = (fromMethod || 'cash').toLowerCase();

  // Cash deposits / wakala cash-in has no fee to sender
  if (amt === 0 || from === 'cash') {
    return 0;
  }

  // Electronic channels (M-Pesa, Airtel, Selcom, Bank) incur tariffs
  return calculateMaxTransactionCost(amt, from);
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

  const sellingPrice = recipe.prices[size] || (size === 6 ? 7000 : (size === 10 ? 15000 : 35000));
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

// ====================================================
// 🚗 CAR AIR FRESHENER SOP v1.2 ENGINE (OCTOBER 2026)
// Standard Operating Procedures: Hanging Bottle & Gel Tin
// Neither product uses ethanol. High heat stability.
// ====================================================

export const CAR_AIR_FRESHENER_RECIPES = [
  {
    id: 'car_strawberry',
    name: 'Strawberry 🍓',
    category: 'Sweet Fruity Gourmand (Single Oil)',
    rating: 'BEST CHOICE / TESTED',
    status: 'Tested Formulation',
    scentKey: 'strawberry',
    oilName: 'Strawberry Essential Oil',
    description: 'Workshop-tested single-oil structure. Highly stable in vehicle heat (50–70°C) with zero scent drift. Appeals to daily drivers and ride-hailing operators.'
  },
  {
    id: 'car_vanilla_28',
    name: 'Vanilla 28 🍦',
    category: 'Warm Creamy Sweet Gourmand',
    rating: 'BEST CHOICE',
    status: 'Tested Formulation',
    scentKey: 'vanilla_28',
    oilName: 'Vanilla 28 Essential Oil',
    description: 'Heavy, slow-evaporating Madagascar vanilla base with very little top notes to lose. The most recognized and requested scent in car air fresheners.'
  },
  {
    id: 'car_marshmallow',
    name: 'Marshmallow 🍬',
    category: 'Soft Sugary Sweet Gourmand',
    rating: 'EXCELLENT',
    status: 'Approved',
    scentKey: 'marshmallow',
    oilName: 'Marshmallow Essential Oil',
    description: 'Soft sugary gourmand sweetness. Highly popular with younger drivers and daily commuters.'
  },
  {
    id: 'car_coconut_passion',
    name: 'Coconut Passion 🥥',
    category: 'Sweet Tropical Warm',
    rating: 'GOOD (Test First)',
    status: 'Trial Ready',
    scentKey: 'coconut_passion',
    oilName: 'Coconut Passion Essential Oil',
    description: 'Warm tropical coconut. Note: Fruity tropical notes soften over 4 weeks leaving a warm vanilla-like base.'
  },
  {
    id: 'car_club_de_nuit',
    name: 'Club de Nuit (Fresh Woody)',
    category: 'Smoky Citrus Birch / Luxury Masculine',
    rating: 'Allowed with Warning',
    status: 'Customer Request',
    scentKey: 'club_de_nuit',
    oilName: 'Club de Nuit Essential Oil',
    description: 'Smoky citrus-birch masculine profile. Fresh top notes will soften over weeks in vehicle heat.'
  },
  {
    id: 'car_sauvage_dior',
    name: 'Sauvage Dior (Fresh Spicy)',
    category: 'Crisp Bergamot & Ambroxan',
    rating: 'Allowed with Warning',
    status: 'Customer Request',
    scentKey: 'sauvage_dior',
    oilName: 'Sauvage Dior Essential Oil',
    description: 'Crisp bergamot & radiant ambroxan. Fresh top notes soften over time in hot parked cars.'
  }
];

export const CAR_AIR_FRESHENER_FORMATS = {
  hanging_bottle: {
    id: 'hanging_bottle',
    name: 'Hanging Mirror Bottle (8ml in 10ml Bottle)',
    status: 'Tested Formulation (Active)',
    carrier: 'Dipropylene Glycol (DPG) — No Ethanol, No Water, No Heating',
    container: '10ml glass bottle + leak plug + raw unvarnished wooden cap + hanging cord',
    oilMl: 2.5,
    oilPercent: '31.25%',
    dpgMl: 5.5,
    dpgPercent: '68.75%',
    fixativeDrops: 4,
    fixativeMl: 0.2,
    totalLiquidMl: 8.2,
    fillMl: 8.0,
    productionCost: 2700, // SOP Section 7.9 (Oil: 750 + DPG: 180 + Fixative: 30 + Bottle set: 1,000 + Label: 300 + Bag: 120 + Overhead: 200 + Wastage: 119)
    sellingPrice: 10000,
    wholesalePrice: 8000,
    premiumPrice: 12000,
    expectedLife: '3 to 6 weeks',
    restTime: '24–48 hours (Cool & Dark)',
    equipmentSpec: 'Calibrated syringe for DPG (5.5ml), separate clean syringe for Oil (2.5ml), 1ml syringe for Fixative (3–4 drops / 0.2ml)',
    steps: [
      'Prepare clean, dry 10ml glass bottles and inner leak plugs. Wipe raw unvarnished wooden caps (do NOT wet caps yet).',
      'Draw 5.5 ml Dipropylene Glycol (DPG) using a clean syringe and dispense into a clean dry glass mixing jar.',
      'Draw 2.5 ml Fragrance Oil using a separate clean syringe and add to the DPG.',
      'Add 3 to 4 drops (about 0.2 ml) of Long-Lasting Fixative using a 1ml syringe.',
      'Stir gently for 1 to 2 minutes until liquid is completely clear and homogeneous (cold mixing, no heat).',
      'Cover jar and rest for 24 to 48 hours in a cool, dark cupboard so the scent and carrier bond evenly.',
      'Fill each bottle with exactly 8.0 ml of the rested liquid using a clean syringe or small funnel, leaving headspace.',
      'Press the inner plastic leak plug firmly into the bottle neck, screw on the unvarnished wooden cap, and tie the cord.',
      'Test for leaks: stand upright on clean tissue for 24 hours, then tilt for 1 minute (only cap should dampen, no drips).',
      'Apply label with scent name, date and batch number. Place in Mifuko A6 bag with customer care card.'
    ]
  },
  gel_tin: {
    id: 'gel_tin',
    name: 'Gel Air Freshener Tin (120g Sealed Tin)',
    status: 'Trial Specification (Ikeda-Style)',
    carrier: 'Water-based agar gel with glycerin (No Ethanol)',
    container: '150ml aluminium tin with vented lid',
    waterGrams: 83.5,
    agarGrams: 2.4,
    glycerinGrams: 6.0,
    oilGrams: 12.0, // ~13.3ml
    polysorbateGrams: 15.0,
    fixativeGrams: 0.5,
    preservativeGrams: 0.6,
    totalWeightGrams: 120.0,
    productionCost: 7725, // SOP Section 6.1 (Materials: 5,270 + Packaging: 1,420 + Overhead: 700 + Wastage: 335)
    sellingPrice: 15000,
    wholesalePrice: 11000,
    premiumPrice: 18000,
    expectedLife: '6 to 8 weeks',
    restTime: '48 hours sealed',
    equipmentSpec: 'Digital scale (0.01g), thermometer (0–150°C), stainless steel pot with pouring lip, heat-proof spatula',
    steps: [
      'Place clean, dry 150ml aluminium tins on a level tray with lids off.',
      'Make Scent Mix: In a clean jug, weigh 12.0g Fragrance Oil, 15.0g Polysorbate 80, and 0.5g Fixative. Stir 1 min until clear.',
      'Make Agar Paste: In the pot, mix 2.4g Agar powder with 6.0g Glycerin into a smooth paste (prevents lumps), then add 83.5g Water.',
      'Boil Gel: Heat on medium, stirring constantly, bring to gentle boil for 1–2 minutes until completely clear with no grains.',
      'Top up lost steam water to starting weight, stir in 0.6g Preservative, remove from heat.',
      'Cool Gel: Monitor with thermometer and let cool to 60–65°C. (Do not add oil above 65°C to avoid burning top notes).',
      'Add Scent Mix: Pour scent mix in a thin stream while stirring gently for 60 seconds.',
      'Fill Tins: Pour immediately into tins on digital scale to exactly 120g each within 5 minutes while still liquid.',
      'Leave uncovered on a level surface for 1–2 hours until fully firm. Close lid, label, pack in Mifuko A6 bag, and rest 48 hours sealed.'
    ]
  }
};

export function getCarAirFreshenerMeasurements(recipeId, formatKey = 'hanging_bottle') {
  const recipe = CAR_AIR_FRESHENER_RECIPES.find(r => r.id === recipeId) || CAR_AIR_FRESHENER_RECIPES[0];
  const format = CAR_AIR_FRESHENER_FORMATS[formatKey] || CAR_AIR_FRESHENER_FORMATS.hanging_bottle;

  const isHanging = formatKey === 'hanging_bottle';
  const sellingPrice = format.sellingPrice;
  const productionCost = format.productionCost;
  const netProfit = sellingPrice - productionCost;
  const marginPercent = Math.round((netProfit / sellingPrice) * 100);

  let ingredients = [];
  if (isHanging) {
    ingredients = [
      { key: recipe.scentKey, name: recipe.oilName, amount: `${format.oilMl} ml`, percentage: format.oilPercent, role: 'Pure Fragrance Oil (Single Scent)' },
      { key: 'dpg', name: 'Dipropylene Glycol (DPG)', amount: `${format.dpgMl} ml`, percentage: format.dpgPercent, role: 'Slow-Evaporating Liquid Carrier' },
      { key: 'fixative', name: 'Long-Lasting Fixative', amount: `${format.fixativeDrops} drops (~${format.fixativeMl}ml)`, percentage: 'Top drops', role: 'Scent Anchor & Longevity Extender' }
    ];
  } else {
    ingredients = [
      { key: recipe.scentKey, name: recipe.oilName, amount: `${format.oilGrams} g (~13.3ml)`, percentage: '10.0%', role: 'Pure Fragrance Oil' },
      { key: 'water', name: 'Boiled / Bottled Water', amount: `${format.waterGrams} g`, percentage: '69.6%', role: 'Gel Base' },
      { key: 'polysorbate_80', name: 'Polysorbate 80 (Solubiliser)', amount: `${format.polysorbateGrams} g`, percentage: '12.5%', role: 'Oil-Water Solubiliser' },
      { key: 'glycerin', name: 'Cosmetic Glycerin', amount: `${format.glycerinGrams} g`, percentage: '5.0%', role: 'Anti-Drying & Moisture Retainer' },
      { key: 'agar_powder', name: 'Agar-Agar Powder', amount: `${format.agarGrams} g`, percentage: '2.0%', role: 'Heat-Resistant Gelling Agent' },
      { key: 'preservative', name: 'Broad-Spectrum Preservative', amount: `${format.preservativeGrams} g`, percentage: '0.5%', role: 'Anti-Mould & Anti-Bacteria' },
      { key: 'fixative', name: 'Long-Lasting Fixative', amount: `${format.fixativeGrams} g`, percentage: '0.4%', role: 'Scent Anchor' }
    ];
  }

  return {
    isCarFreshener: true,
    recipe,
    format,
    formatKey,
    title: `${recipe.name} — ${format.name}`,
    category: recipe.category,
    carrier: format.carrier,
    packagingName: format.container,
    syringeSpec: format.equipmentSpec,
    restTime: format.restTime,
    sellingPrice,
    productionCost,
    netProfit,
    marginPercent,
    ingredients,
    steps: format.steps
  };
}
