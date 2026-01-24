// Sample products data for initial catalog
export interface MockProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  price_min: number;
  price_max: number;
  moq: number;
  unit: string;
  images: string[];
  category_id: string;
  category_slug: string;
  tags: string[];
  verified: boolean;
  published: boolean;
  seller: {
    id: string;
    company_name: string;
    verified: boolean;
    response_rate: number;
    years: number;
    location: string;
  };
  specifications: Record<string, string>;
  orders: number;
  rating: number;
  reviews: number;
}

export const mockProducts: MockProduct[] = [
  // Electronics
  {
    id: 'e1',
    title: 'Wireless Bluetooth Earbuds TWS Pro with Active Noise Cancellation',
    slug: 'wireless-bluetooth-earbuds-tws-pro',
    description: 'High-quality wireless earbuds with noise cancellation, 40-hour battery life, and premium sound quality. IPX5 waterproof rating.',
    price_min: 8.50,
    price_max: 15.99,
    moq: 100,
    unit: 'pieces',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', 'https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=500'],
    category_id: '117b8cbc-1c5c-4849-bbc0-e650b46d26c9',
    category_slug: 'electronics',
    tags: ['wireless', 'bluetooth', 'earbuds', 'audio'],
    verified: true,
    published: true,
    seller: {
      id: 's1',
      company_name: 'TechWorld Electronics Co., Ltd.',
      verified: true,
      response_rate: 95,
      years: 16,
      location: 'Shenzhen, China'
    },
    specifications: { battery_life: '40 hours', connectivity: 'Bluetooth 5.3', waterproof: 'IPX5' },
    orders: 2847,
    rating: 4.8,
    reviews: 156
  },
  {
    id: 'e2',
    title: 'Smart Watch Fitness Tracker 2024 with Heart Rate Monitor GPS',
    slug: 'smart-watch-fitness-tracker-2024',
    description: 'Advanced smartwatch with heart rate monitoring, GPS tracking, and 100+ workout modes. 7-day battery life.',
    price_min: 12.00,
    price_max: 28.50,
    moq: 50,
    unit: 'pieces',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500'],
    category_id: '117b8cbc-1c5c-4849-bbc0-e650b46d26c9',
    category_slug: 'electronics',
    tags: ['smartwatch', 'fitness', 'health', 'wearable'],
    verified: true,
    published: true,
    seller: {
      id: 's1',
      company_name: 'TechWorld Electronics Co., Ltd.',
      verified: true,
      response_rate: 95,
      years: 16,
      location: 'Shenzhen, China'
    },
    specifications: { display: '1.4 inch AMOLED', battery: '7 days', sensors: 'Heart rate, SpO2, GPS' },
    orders: 1583,
    rating: 4.7,
    reviews: 89
  },
  {
    id: 'e3',
    title: 'Portable Power Bank 20000mAh 65W Fast Charging USB-C PD',
    slug: 'portable-power-bank-20000mah',
    description: 'High capacity power bank with 65W fast charging, USB-C PD, and multiple ports. Charges laptops and phones.',
    price_min: 15.00,
    price_max: 35.00,
    moq: 30,
    unit: 'pieces',
    images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500'],
    category_id: '117b8cbc-1c5c-4849-bbc0-e650b46d26c9',
    category_slug: 'electronics',
    tags: ['powerbank', 'charging', 'portable', 'electronics'],
    verified: true,
    published: true,
    seller: {
      id: 's1',
      company_name: 'TechWorld Electronics Co., Ltd.',
      verified: true,
      response_rate: 95,
      years: 16,
      location: 'Shenzhen, China'
    },
    specifications: { capacity: '20000mAh', output: '65W PD', ports: '2x USB-A, 1x USB-C' },
    orders: 956,
    rating: 4.6,
    reviews: 67
  },
  {
    id: 'e4',
    title: 'LED Ring Light 18 inch Professional Photography Studio Lighting',
    slug: 'led-ring-light-18-inch-professional',
    description: 'Professional LED ring light for photography and video. Dimmable with color temperature control and phone holder.',
    price_min: 18.00,
    price_max: 45.00,
    moq: 20,
    unit: 'pieces',
    images: ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500'],
    category_id: '117b8cbc-1c5c-4849-bbc0-e650b46d26c9',
    category_slug: 'electronics',
    tags: ['ring light', 'photography', 'video', 'lighting'],
    verified: false,
    published: true,
    seller: {
      id: 's6',
      company_name: 'Bright Star Lighting Ltd.',
      verified: false,
      response_rate: 82,
      years: 5,
      location: 'Dongguan, China'
    },
    specifications: { size: '18 inch', color_temp: '3200K-5600K', power: '55W' },
    orders: 423,
    rating: 4.4,
    reviews: 32
  },
  {
    id: 'e5',
    title: 'Wireless Gaming Mouse RGB 16000 DPI Programmable',
    slug: 'wireless-gaming-mouse-rgb',
    description: 'Professional gaming mouse with 16000 DPI sensor, RGB lighting, and programmable buttons. Ultra-low latency.',
    price_min: 6.00,
    price_max: 18.00,
    moq: 100,
    unit: 'pieces',
    images: ['https://images.unsplash.com/photo-1527814050087-3793815479db?w=500'],
    category_id: '117b8cbc-1c5c-4849-bbc0-e650b46d26c9',
    category_slug: 'electronics',
    tags: ['gaming', 'mouse', 'rgb', 'wireless'],
    verified: true,
    published: true,
    seller: {
      id: 's1',
      company_name: 'TechWorld Electronics Co., Ltd.',
      verified: true,
      response_rate: 95,
      years: 16,
      location: 'Shenzhen, China'
    },
    specifications: { dpi: '16000', buttons: '7 programmable', battery: '60 hours' },
    orders: 1247,
    rating: 4.5,
    reviews: 78
  },

  // Apparel
  {
    id: 'a1',
    title: 'Premium Cotton T-Shirt Bulk Order Custom Printing',
    slug: 'premium-cotton-tshirt-bulk',
    description: 'High-quality 100% cotton t-shirts available in various colors and sizes. Perfect for custom printing and branding.',
    price_min: 2.50,
    price_max: 5.99,
    moq: 500,
    unit: 'pieces',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500'],
    category_id: 'c0c387db-f16d-46b1-91fb-cf11aac90f99',
    category_slug: 'apparel',
    tags: ['tshirt', 'cotton', 'apparel', 'bulk'],
    verified: true,
    published: true,
    seller: {
      id: 's2',
      company_name: 'Golden Fashion Trading Ltd.',
      verified: true,
      response_rate: 92,
      years: 12,
      location: 'Guangzhou, China'
    },
    specifications: { material: '100% Cotton', weight: '180gsm', sizes: 'XS-3XL' },
    orders: 5632,
    rating: 4.9,
    reviews: 342
  },
  {
    id: 'a2',
    title: 'Winter Jacket Men Waterproof Parka Warm Fleece Lined',
    slug: 'winter-jacket-men-waterproof-parka',
    description: 'Warm winter parka with waterproof outer shell, fleece lining, and detachable hood. Multiple pockets.',
    price_min: 25.00,
    price_max: 55.00,
    moq: 50,
    unit: 'pieces',
    images: ['https://images.unsplash.com/photo-1544923246-77307dd628b4?w=500'],
    category_id: 'c0c387db-f16d-46b1-91fb-cf11aac90f99',
    category_slug: 'apparel',
    tags: ['jacket', 'winter', 'parka', 'waterproof'],
    verified: true,
    published: true,
    seller: {
      id: 's2',
      company_name: 'Golden Fashion Trading Ltd.',
      verified: true,
      response_rate: 92,
      years: 12,
      location: 'Guangzhou, China'
    },
    specifications: { material: 'Polyester shell, fleece lining', waterproof: 'Yes', sizes: 'S-3XL' },
    orders: 1847,
    rating: 4.6,
    reviews: 124
  },
  {
    id: 'a3',
    title: 'Women Yoga Pants High Waist Leggings Squat Proof',
    slug: 'women-yoga-pants-high-waist',
    description: 'Comfortable yoga leggings with high waist design, four-way stretch, and hidden pocket. Squat-proof material.',
    price_min: 4.50,
    price_max: 12.00,
    moq: 100,
    unit: 'pieces',
    images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500'],
    category_id: 'c0c387db-f16d-46b1-91fb-cf11aac90f99',
    category_slug: 'apparel',
    tags: ['yoga', 'leggings', 'activewear', 'women'],
    verified: true,
    published: true,
    seller: {
      id: 's2',
      company_name: 'Golden Fashion Trading Ltd.',
      verified: true,
      response_rate: 92,
      years: 12,
      location: 'Guangzhou, China'
    },
    specifications: { material: '87% Nylon, 13% Spandex', features: 'High waist, squat-proof', sizes: 'XS-XL' },
    orders: 3421,
    rating: 4.7,
    reviews: 215
  },
  {
    id: 'a4',
    title: 'Silk Scarf Women Luxury Designer Print 90x90cm',
    slug: 'silk-scarf-women-luxury-print',
    description: 'Elegant 100% silk scarf with designer prints. Perfect for fashion accessories and gifts.',
    price_min: 8.00,
    price_max: 25.00,
    moq: 30,
    unit: 'pieces',
    images: ['https://images.unsplash.com/photo-1601924638867-3a6de6b7a500?w=500'],
    category_id: 'c0c387db-f16d-46b1-91fb-cf11aac90f99',
    category_slug: 'apparel',
    tags: ['scarf', 'silk', 'luxury', 'accessory'],
    verified: false,
    published: true,
    seller: {
      id: 's7',
      company_name: 'Silk Road Textiles',
      verified: false,
      response_rate: 78,
      years: 8,
      location: 'Hangzhou, China'
    },
    specifications: { material: '100% Silk', size: '90x90cm', weight: '12 momme' },
    orders: 567,
    rating: 4.5,
    reviews: 45
  },

  // Automotive
  {
    id: 'au1',
    title: 'Car LED Headlight Bulbs H11 6000K Super Bright 12000LM',
    slug: 'car-led-headlight-h11-6000k',
    description: 'Super bright LED headlight bulbs with 6000K cool white light. Plug and play installation, 50000 hours lifespan.',
    price_min: 8.00,
    price_max: 22.00,
    moq: 50,
    unit: 'pairs',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'],
    category_id: '1496f2df-96d3-45b3-82d4-65b78992ab14',
    category_slug: 'automotive',
    tags: ['led', 'headlight', 'automotive', 'lighting'],
    verified: true,
    published: true,
    seller: {
      id: 's3',
      company_name: 'Supreme Auto Parts Factory',
      verified: true,
      response_rate: 88,
      years: 19,
      location: 'Shanghai, China'
    },
    specifications: { lumens: '12000LM', color: '6000K', lifespan: '50000 hours' },
    orders: 2156,
    rating: 4.6,
    reviews: 167
  },
  {
    id: 'au2',
    title: 'Car Dash Camera 4K WiFi GPS Night Vision Loop Recording',
    slug: 'car-dash-camera-4k-wifi-gps',
    description: 'High-resolution 4K dash cam with WiFi connectivity, GPS tracking, and night vision. Loop recording and G-sensor.',
    price_min: 25.00,
    price_max: 65.00,
    moq: 20,
    unit: 'pieces',
    images: ['https://images.unsplash.com/photo-1559674812-fb1b79a37b7f?w=500'],
    category_id: '1496f2df-96d3-45b3-82d4-65b78992ab14',
    category_slug: 'automotive',
    tags: ['dashcam', '4k', 'gps', 'automotive'],
    verified: true,
    published: true,
    seller: {
      id: 's3',
      company_name: 'Supreme Auto Parts Factory',
      verified: true,
      response_rate: 88,
      years: 19,
      location: 'Shanghai, China'
    },
    specifications: { resolution: '4K UHD', features: 'WiFi, GPS, Night Vision', storage: 'Up to 256GB' },
    orders: 1342,
    rating: 4.7,
    reviews: 98
  },
  {
    id: 'au3',
    title: 'Universal Car Phone Holder Mount 360° Rotation Suction Cup',
    slug: 'universal-car-phone-holder',
    description: 'Adjustable car phone mount with strong suction cup. Compatible with all smartphones 4.7-7 inches.',
    price_min: 1.50,
    price_max: 5.00,
    moq: 200,
    unit: 'pieces',
    images: ['https://images.unsplash.com/photo-1600420879568-8e6d24880f06?w=500'],
    category_id: '1496f2df-96d3-45b3-82d4-65b78992ab14',
    category_slug: 'automotive',
    tags: ['phone holder', 'car mount', 'accessories'],
    verified: false,
    published: true,
    seller: {
      id: 's8',
      company_name: 'AutoGear Accessories',
      verified: false,
      response_rate: 75,
      years: 4,
      location: 'Yiwu, China'
    },
    specifications: { compatibility: '4.7-7 inch phones', mount_type: 'Suction cup', rotation: '360 degrees' },
    orders: 4523,
    rating: 4.3,
    reviews: 287
  },

  // Home & Garden
  {
    id: 'h1',
    title: 'LED Desk Lamp Touch Control Dimmable USB Charging Port',
    slug: 'led-desk-lamp-touch-dimmable',
    description: 'Modern LED desk lamp with touch control, 5 brightness levels, and 3 color modes. USB charging port included.',
    price_min: 12.00,
    price_max: 28.00,
    moq: 30,
    unit: 'pieces',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500'],
    category_id: '61fbfd5f-407a-43d5-81dc-2481f85289d6',
    category_slug: 'home-garden',
    tags: ['desk lamp', 'led', 'home office', 'lighting'],
    verified: false,
    published: true,
    seller: {
      id: 's4',
      company_name: 'Comfort Living Home Supplies',
      verified: false,
      response_rate: 85,
      years: 9,
      location: 'Foshan, China'
    },
    specifications: { power: '12W', brightness_levels: '5', color_modes: '3' },
    orders: 876,
    rating: 4.5,
    reviews: 54
  },
  {
    id: 'h2',
    title: 'Memory Foam Mattress Topper Cooling Gel Queen Size',
    slug: 'memory-foam-mattress-topper-queen',
    description: 'Premium memory foam mattress topper with cooling gel technology. Pressure relief and motion isolation.',
    price_min: 35.00,
    price_max: 85.00,
    moq: 10,
    unit: 'pieces',
    images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500'],
    category_id: '61fbfd5f-407a-43d5-81dc-2481f85289d6',
    category_slug: 'home-garden',
    tags: ['mattress', 'memory foam', 'bedding', 'sleep'],
    verified: false,
    published: true,
    seller: {
      id: 's4',
      company_name: 'Comfort Living Home Supplies',
      verified: false,
      response_rate: 85,
      years: 9,
      location: 'Foshan, China'
    },
    specifications: { thickness: '3 inch', material: 'Gel memory foam', sizes: 'Twin to King' },
    orders: 432,
    rating: 4.6,
    reviews: 38
  },
  {
    id: 'h3',
    title: 'Stainless Steel Cookware Set 12 Piece Tri-Ply Induction',
    slug: 'stainless-steel-cookware-set-12pc',
    description: 'Professional stainless steel cookware set with tri-ply construction. Induction compatible, dishwasher safe.',
    price_min: 45.00,
    price_max: 120.00,
    moq: 20,
    unit: 'sets',
    images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500'],
    category_id: '61fbfd5f-407a-43d5-81dc-2481f85289d6',
    category_slug: 'home-garden',
    tags: ['cookware', 'kitchen', 'stainless steel', 'cooking'],
    verified: false,
    published: true,
    seller: {
      id: 's4',
      company_name: 'Comfort Living Home Supplies',
      verified: false,
      response_rate: 85,
      years: 9,
      location: 'Foshan, China'
    },
    specifications: { pieces: '12', material: 'Tri-ply stainless steel', compatible: 'All cooktops' },
    orders: 287,
    rating: 4.7,
    reviews: 23
  },

  // Sports & Outdoors
  {
    id: 'sp1',
    title: 'Yoga Mat Non-Slip Extra Thick 6mm TPE Eco-Friendly',
    slug: 'yoga-mat-non-slip-6mm',
    description: 'Eco-friendly TPE yoga mat with non-slip surface. Extra cushioning for joints, comes with carrying strap.',
    price_min: 5.00,
    price_max: 15.00,
    moq: 100,
    unit: 'pieces',
    images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'],
    category_id: 'fd216b40-05a1-4e32-aae9-920c4206e324',
    category_slug: 'sports-outdoors',
    tags: ['yoga', 'fitness', 'exercise', 'mat'],
    verified: true,
    published: true,
    seller: {
      id: 's5',
      company_name: 'Pro Sports Equipment Manufacturing',
      verified: true,
      response_rate: 90,
      years: 14,
      location: 'Ningbo, China'
    },
    specifications: { thickness: '6mm', material: 'TPE', size: '183x61cm' },
    orders: 2341,
    rating: 4.8,
    reviews: 178
  },
  {
    id: 'sp2',
    title: 'Resistance Bands Set 5 Levels Latex Exercise Bands',
    slug: 'resistance-bands-set-5-levels',
    description: 'Complete resistance bands set with 5 different strength levels. Perfect for home workouts and physical therapy.',
    price_min: 3.00,
    price_max: 12.00,
    moq: 100,
    unit: 'sets',
    images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500'],
    category_id: 'fd216b40-05a1-4e32-aae9-920c4206e324',
    category_slug: 'sports-outdoors',
    tags: ['resistance bands', 'fitness', 'workout', 'training'],
    verified: true,
    published: true,
    seller: {
      id: 's5',
      company_name: 'Pro Sports Equipment Manufacturing',
      verified: true,
      response_rate: 90,
      years: 14,
      location: 'Ningbo, China'
    },
    specifications: { levels: '5 (5-50 lbs)', material: 'Natural latex', includes: 'Door anchor, handles' },
    orders: 1876,
    rating: 4.7,
    reviews: 134
  },
  {
    id: 'sp3',
    title: 'Camping Tent 4 Person Waterproof Easy Setup Family',
    slug: 'camping-tent-4-person-waterproof',
    description: 'Family camping tent with easy setup, waterproof construction, and ventilation windows. Includes rainfly and carry bag.',
    price_min: 28.00,
    price_max: 75.00,
    moq: 20,
    unit: 'pieces',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500'],
    category_id: 'fd216b40-05a1-4e32-aae9-920c4206e324',
    category_slug: 'sports-outdoors',
    tags: ['tent', 'camping', 'outdoor', 'hiking'],
    verified: true,
    published: true,
    seller: {
      id: 's5',
      company_name: 'Pro Sports Equipment Manufacturing',
      verified: true,
      response_rate: 90,
      years: 14,
      location: 'Ningbo, China'
    },
    specifications: { capacity: '4 person', waterproof: '3000mm', setup: 'Quick setup poles' },
    orders: 654,
    rating: 4.6,
    reviews: 47
  },
  {
    id: 'sp4',
    title: 'Adjustable Dumbbell Set 25kg Quick Change Weight Training',
    slug: 'adjustable-dumbbell-set-25kg',
    description: 'Space-saving adjustable dumbbell with quick weight change mechanism. Replaces 15 pairs of dumbbells.',
    price_min: 55.00,
    price_max: 150.00,
    moq: 10,
    unit: 'sets',
    images: ['https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=500'],
    category_id: 'fd216b40-05a1-4e32-aae9-920c4206e324',
    category_slug: 'sports-outdoors',
    tags: ['dumbbell', 'weights', 'gym', 'fitness'],
    verified: true,
    published: true,
    seller: {
      id: 's5',
      company_name: 'Pro Sports Equipment Manufacturing',
      verified: true,
      response_rate: 90,
      years: 14,
      location: 'Ningbo, China'
    },
    specifications: { weight_range: '2.5-25kg', increments: '2.5kg', material: 'Steel with rubber coating' },
    orders: 342,
    rating: 4.8,
    reviews: 28
  },

  // Beauty
  {
    id: 'b1',
    title: 'Professional Makeup Brush Set 15pcs Synthetic Bristle',
    slug: 'professional-makeup-brush-set-15pcs',
    description: 'Complete makeup brush set with synthetic bristles. Includes foundation, powder, contour, and eye brushes with PU case.',
    price_min: 8.00,
    price_max: 25.00,
    moq: 50,
    unit: 'sets',
    images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500'],
    category_id: '4fbfab03-a163-47ae-95e7-6ec5e95f3772',
    category_slug: 'beauty',
    tags: ['makeup', 'brushes', 'beauty', 'cosmetics'],
    verified: true,
    published: true,
    seller: {
      id: 's2',
      company_name: 'Golden Fashion Trading Ltd.',
      verified: true,
      response_rate: 92,
      years: 12,
      location: 'Guangzhou, China'
    },
    specifications: { pieces: '15', bristle: 'Synthetic', includes: 'PU leather case' },
    orders: 1567,
    rating: 4.6,
    reviews: 112
  },
  {
    id: 'b2',
    title: 'Hair Straightener Ceramic Flat Iron Professional Styling',
    slug: 'hair-straightener-ceramic-flat-iron',
    description: 'Professional hair straightener with ceramic plates, adjustable temperature, and fast heating. Suitable for all hair types.',
    price_min: 10.00,
    price_max: 35.00,
    moq: 30,
    unit: 'pieces',
    images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500'],
    category_id: '4fbfab03-a163-47ae-95e7-6ec5e95f3772',
    category_slug: 'beauty',
    tags: ['hair straightener', 'styling', 'beauty', 'hair care'],
    verified: false,
    published: true,
    seller: {
      id: 's9',
      company_name: 'Beauty Tools Express',
      verified: false,
      response_rate: 80,
      years: 6,
      location: 'Shenzhen, China'
    },
    specifications: { plate: 'Ceramic tourmaline', temp_range: '80-230°C', heat_up: '30 seconds' },
    orders: 876,
    rating: 4.4,
    reviews: 67
  },

  // Machinery
  {
    id: 'm1',
    title: 'Electric Drill Cordless 21V Lithium Battery Power Tool',
    slug: 'electric-drill-cordless-21v',
    description: 'Powerful cordless drill with 21V lithium battery. 2-speed gearbox, LED light, and 25+1 torque settings.',
    price_min: 25.00,
    price_max: 65.00,
    moq: 20,
    unit: 'pieces',
    images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500'],
    category_id: 'a6884ae7-0ff8-448a-aeb2-deefa52275ac',
    category_slug: 'machinery',
    tags: ['drill', 'power tools', 'cordless', 'construction'],
    verified: true,
    published: true,
    seller: {
      id: 's3',
      company_name: 'Supreme Auto Parts Factory',
      verified: true,
      response_rate: 88,
      years: 19,
      location: 'Shanghai, China'
    },
    specifications: { voltage: '21V', speed: '0-400/1500 RPM', battery: '2.0Ah lithium' },
    orders: 1234,
    rating: 4.7,
    reviews: 89
  },
  {
    id: 'm2',
    title: 'Angle Grinder 125mm 1200W Heavy Duty Metal Cutting',
    slug: 'angle-grinder-125mm-1200w',
    description: 'Heavy-duty angle grinder with powerful 1200W motor. Anti-vibration handle and adjustable guard.',
    price_min: 18.00,
    price_max: 45.00,
    moq: 30,
    unit: 'pieces',
    images: ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500'],
    category_id: 'a6884ae7-0ff8-448a-aeb2-deefa52275ac',
    category_slug: 'machinery',
    tags: ['angle grinder', 'power tools', 'grinding', 'cutting'],
    verified: true,
    published: true,
    seller: {
      id: 's3',
      company_name: 'Supreme Auto Parts Factory',
      verified: true,
      response_rate: 88,
      years: 19,
      location: 'Shanghai, China'
    },
    specifications: { power: '1200W', disc_size: '125mm', speed: '11000 RPM' },
    orders: 567,
    rating: 4.5,
    reviews: 43
  },

  // Food & Beverages
  {
    id: 'f1',
    title: 'Organic Green Tea Premium Grade High Mountain',
    slug: 'organic-green-tea-premium-grade',
    description: 'Premium organic green tea from high mountain plantations. Rich in antioxidants with smooth, refreshing taste.',
    price_min: 5.00,
    price_max: 20.00,
    moq: 100,
    unit: 'kg',
    images: ['https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500'],
    category_id: '78ab97f8-080b-457d-bb3e-c2dc073bb139',
    category_slug: 'food-beverages',
    tags: ['tea', 'green tea', 'organic', 'beverage'],
    verified: true,
    published: true,
    seller: {
      id: 's4',
      company_name: 'Comfort Living Home Supplies',
      verified: false,
      response_rate: 85,
      years: 9,
      location: 'Foshan, China'
    },
    specifications: { origin: 'China', grade: 'Premium', certification: 'Organic' },
    orders: 987,
    rating: 4.8,
    reviews: 76
  },
  {
    id: 'f2',
    title: 'Instant Coffee Freeze Dried Premium Arabica Beans',
    slug: 'instant-coffee-freeze-dried-premium',
    description: 'Premium freeze-dried instant coffee made from 100% Arabica beans. Rich aroma and smooth taste.',
    price_min: 8.00,
    price_max: 25.00,
    moq: 50,
    unit: 'kg',
    images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500'],
    category_id: '78ab97f8-080b-457d-bb3e-c2dc073bb139',
    category_slug: 'food-beverages',
    tags: ['coffee', 'instant', 'arabica', 'beverage'],
    verified: false,
    published: true,
    seller: {
      id: 's10',
      company_name: 'Global Coffee Traders',
      verified: false,
      response_rate: 82,
      years: 7,
      location: 'Kunming, China'
    },
    specifications: { type: 'Freeze-dried', beans: '100% Arabica', origin: 'Colombia' },
    orders: 654,
    rating: 4.5,
    reviews: 48
  }
];

export const categories = [
  { id: '117b8cbc-1c5c-4849-bbc0-e650b46d26c9', name: 'Electronics', slug: 'electronics', icon: '📱', count: 5 },
  { id: 'c0c387db-f16d-46b1-91fb-cf11aac90f99', name: 'Apparel', slug: 'apparel', icon: '👕', count: 4 },
  { id: '1496f2df-96d3-45b3-82d4-65b78992ab14', name: 'Automotive', slug: 'automotive', icon: '🚗', count: 3 },
  { id: '61fbfd5f-407a-43d5-81dc-2481f85289d6', name: 'Home & Garden', slug: 'home-garden', icon: '🏠', count: 3 },
  { id: 'fd216b40-05a1-4e32-aae9-920c4206e324', name: 'Sports & Outdoors', slug: 'sports-outdoors', icon: '⚽', count: 4 },
  { id: '4fbfab03-a163-47ae-95e7-6ec5e95f3772', name: 'Beauty', slug: 'beauty', icon: '💄', count: 2 },
  { id: 'a6884ae7-0ff8-448a-aeb2-deefa52275ac', name: 'Machinery', slug: 'machinery', icon: '🔧', count: 2 },
  { id: '78ab97f8-080b-457d-bb3e-c2dc073bb139', name: 'Food & Beverages', slug: 'food-beverages', icon: '🍵', count: 2 }
];
