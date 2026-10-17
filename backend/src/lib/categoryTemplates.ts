export type TemplateFieldType = "select" | "multiselect" | "text" | "number";

export interface CategoryTemplateField {
  id: string; // e.g. "type", "gender", "colour", "material", "sizes"
  name: string; // key used in product attributes JSON
  label: string; // display label
  type: TemplateFieldType;
  required?: boolean;
  options?: string[]; // choices for dropdowns (select / multiselect)
  placeholder?: string;
  helperText?: string;
}

export const CATEGORY_PRESETS: Record<string, { label: string; fields: CategoryTemplateField[] }> = {
  footwear: {
    label: "Footwear (Shoes, Sandals, Sneakers)",
    fields: [
      {
        id: "type",
        name: "type",
        label: "Footwear Type",
        type: "select",
        required: true,
        options: [
          "Sneakers",
          "Sandals",
          "Heels",
          "Boots",
          "Loafers",
          "Flats",
          "Formal Shoes",
          "Slippers & Flip Flops",
          "Ethnic / Mojari",
          "Sports Shoes",
        ],
      },
      {
        id: "gender",
        name: "gender",
        label: "Gender / Target",
        type: "select",
        required: true,
        options: ["Men", "Women", "Unisex", "Boys", "Girls"],
      },
      {
        id: "colour",
        name: "colour",
        label: "Colour",
        type: "select",
        required: true,
        options: [
          "Black",
          "White",
          "Brown",
          "Tan",
          "Navy Blue",
          "Grey",
          "Red",
          "Beige",
          "Olive Green",
          "Burgundy",
          "Multi",
        ],
      },
      {
        id: "material",
        name: "material",
        label: "Material",
        type: "select",
        options: [
          "Genuine Leather",
          "Synthetic / PU Leather",
          "Canvas",
          "Suede",
          "Breathable Mesh",
          "Rubber",
          "Fabric / Textile",
        ],
      },
      {
        id: "sizes",
        name: "sizes",
        label: "Sizes Available",
        type: "multiselect",
        required: true,
        options: [
          "UK 3",
          "UK 4",
          "UK 5",
          "UK 6",
          "UK 7",
          "UK 8",
          "UK 9",
          "UK 10",
          "UK 11",
          "UK 12",
        ],
        helperText: "Select all sizes in stock",
      },
    ],
  },

  bags: {
    label: "Bags & Luggage",
    fields: [
      {
        id: "type",
        name: "type",
        label: "Bag Type",
        type: "select",
        required: true,
        options: [
          "Tote Bag",
          "Sling Bag",
          "Backpack",
          "Handbag",
          "Shoulder Bag",
          "Duffel Bag",
          "Clutch",
          "Wallet",
          "Laptop Bag",
          "Messenger Bag",
          "Travel Bag",
        ],
      },
      {
        id: "colour",
        name: "colour",
        label: "Colour",
        type: "select",
        required: true,
        options: [
          "Black",
          "Brown",
          "Tan",
          "Beige",
          "Navy Blue",
          "Red",
          "Maroon",
          "Green",
          "White",
          "Grey",
          "Pink",
          "Multi",
        ],
      },
      {
        id: "material",
        name: "material",
        label: "Material",
        type: "select",
        options: [
          "Genuine Leather",
          "PU / Faux Leather",
          "Canvas",
          "Nylon",
          "Polyester",
          "Jute",
          "Denim",
          "Cotton",
        ],
      },
      {
        id: "size",
        name: "size",
        label: "Size",
        type: "select",
        options: ["Small", "Medium", "Large", "Extra Large", "Compact / Mini"],
      },
    ],
  },

  clothing: {
    label: "Clothing & Apparel",
    fields: [
      {
        id: "type",
        name: "type",
        label: "Clothing Type",
        type: "select",
        required: true,
        options: [
          "Kurta & Kurti",
          "Dress",
          "Shirt",
          "T-Shirt",
          "Jeans",
          "Trousers & Chinos",
          "Saree",
          "Suit & Blazer",
          "Jacket & Coat",
          "Hoodie & Sweatshirt",
          "Top & Tunics",
          "Skirt",
          "Lehenga",
          "Ethnic Set",
        ],
      },
      {
        id: "gender",
        name: "gender",
        label: "Gender / Target",
        type: "select",
        required: true,
        options: ["Men", "Women", "Unisex", "Boys", "Girls"],
      },
      {
        id: "colour",
        name: "colour",
        label: "Colour",
        type: "select",
        required: true,
        options: [
          "Black",
          "White",
          "Navy Blue",
          "Red",
          "Maroon",
          "Green",
          "Yellow",
          "Pink",
          "Grey",
          "Beige",
          "Peach",
          "Lavender",
          "Multi",
        ],
      },
      {
        id: "fabric",
        name: "fabric",
        label: "Fabric / Material",
        type: "select",
        options: [
          "100% Pure Cotton",
          "Silk",
          "Linen",
          "Denim",
          "Rayon / Viscose",
          "Georgette",
          "Chiffon",
          "Wool",
          "Polyester Blend",
          "Khadi",
          "Satin",
        ],
      },
      {
        id: "sizes",
        name: "sizes",
        label: "Sizes Available",
        type: "multiselect",
        required: true,
        options: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "Free Size"],
        helperText: "Select all sizes available for purchase",
      },
    ],
  },

  electronics: {
    label: "Electronics & Gadgets",
    fields: [
      {
        id: "type",
        name: "type",
        label: "Device Type",
        type: "select",
        required: true,
        options: [
          "Smartphone",
          "Feature Phone",
          "Laptop",
          "Tablet",
          "Smartwatch",
          "Headphones / Earbuds",
          "Bluetooth Speaker",
          "Power Bank",
          "Charger & Cable",
          "Mobile Case / Cover",
          "Audio & Video",
        ],
      },
      {
        id: "colour",
        name: "colour",
        label: "Colour",
        type: "select",
        options: ["Black", "White", "Silver", "Space Grey", "Blue", "Gold", "Rose Gold", "Red", "Green"],
      },
      {
        id: "warranty",
        name: "warranty",
        label: "Warranty",
        type: "select",
        options: [
          "1 Year Brand Warranty",
          "6 Months Brand Warranty",
          "2 Years Brand Warranty",
          "Seller Warranty (3 Months)",
          "No Warranty / Testing Warranty",
        ],
      },
      {
        id: "condition",
        name: "condition",
        label: "Item Condition",
        type: "select",
        options: ["Brand New (Sealed)", "Open Box / Like New", "Refurbished Certified"],
      },
    ],
  },

  jewellery: {
    label: "Jewellery & Ornaments",
    fields: [
      {
        id: "type",
        name: "type",
        label: "Jewellery Type",
        type: "select",
        required: true,
        options: [
          "Necklace / Choker",
          "Earrings & Jhumkas",
          "Ring",
          "Bracelet & Kadas",
          "Bangles Set",
          "Anklet / Payal",
          "Complete Jewellery Set",
          "Pendant & Chain",
          "Nose Pin / Ring",
          "Mangalsutra",
        ],
      },
      {
        id: "material",
        name: "material",
        label: "Base Metal / Material",
        type: "select",
        options: [
          "Gold Plated",
          "Silver / 925 Sterling Silver",
          "Brass",
          "Alloy",
          "Stainless Steel",
          "Kundan & Polki",
          "Oxidised Silver",
          "Beads & Pearls",
        ],
      },
      {
        id: "gender",
        name: "gender",
        label: "Gender / Target",
        type: "select",
        options: ["Women", "Men", "Unisex", "Girls"],
      },
      {
        id: "colour",
        name: "colour",
        label: "Plating / Colour",
        type: "select",
        options: ["Yellow Gold", "Silver", "Rose Gold", "Antique Bronze", "Multi-Stone"],
      },
    ],
  },

  "beauty-personal-care": {
    label: "Beauty & Personal Care",
    fields: [
      {
        id: "type",
        name: "type",
        label: "Product Type",
        type: "select",
        required: true,
        options: [
          "Skincare (Cream, Serum, Face Wash)",
          "Haircare (Shampoo, Oil, Conditioner)",
          "Makeup & Cosmetics",
          "Fragrance & Deodorant",
          "Bath & Body Care",
          "Men's Grooming (Beard, Shaving)",
          "Lip Care & Lipstick",
        ],
      },
      {
        id: "skinType",
        name: "skinType",
        label: "Skin / Hair Type",
        type: "select",
        options: ["All Skin / Hair Types", "Oily", "Dry", "Combination", "Sensitive", "Normal"],
      },
    ],
  },
};

/**
 * Returns default template fields based on category name or slug.
 */
export function getDefaultFieldsForCategory(categoryNameOrSlug: string): CategoryTemplateField[] {
  const normalized = categoryNameOrSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  if (normalized.includes("footwear") || normalized.includes("shoe")) {
    return CATEGORY_PRESETS.footwear.fields;
  }
  if (normalized.includes("bag")) {
    return CATEGORY_PRESETS.bags.fields;
  }
  if (normalized.includes("cloth") || normalized.includes("apparel") || normalized.includes("fashion")) {
    return CATEGORY_PRESETS.clothing.fields;
  }
  if (normalized.includes("electr") || normalized.includes("gadget") || normalized.includes("mobile")) {
    return CATEGORY_PRESETS.electronics.fields;
  }
  if (normalized.includes("jewel")) {
    return CATEGORY_PRESETS.jewellery.fields;
  }
  if (normalized.includes("beauty") || normalized.includes("care") || normalized.includes("cosmetic")) {
    return CATEGORY_PRESETS["beauty-personal-care"].fields;
  }

  // Generic fallback fields
  return [
    {
      id: "type",
      name: "type",
      label: "Product Type",
      type: "text",
      placeholder: "e.g. Standard, Premium",
    },
    {
      id: "colour",
      name: "colour",
      label: "Colour",
      type: "text",
      placeholder: "e.g. Black, Blue",
    },
  ];
}
