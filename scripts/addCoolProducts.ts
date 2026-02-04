import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

interface ProductData {
    title: string;
    slug: string;
    description: string;
    price_min: number;
    price_max: number;
    moq: number;
    unit: string;
    images: string[];
    verified: boolean;
    published: boolean;
}

const coolProducts: ProductData[] = [
    // Consumer Electronics
    {
        title: 'Wireless Earbuds Pro with ANC - Premium Sound Quality',
        slug: 'wireless-earbuds-pro-anc',
        description: 'High-quality wireless earbuds with active noise cancellation, 30-hour battery life, and premium sound. Perfect for music lovers and professionals.',
        price_min: 15.99,
        price_max: 45.99,
        moq: 50,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    {
        title: 'Smart Watch Fitness Tracker - Heart Rate & Sleep Monitor',
        slug: 'smart-watch-fitness-tracker',
        description: 'Advanced smartwatch with heart rate monitoring, sleep tracking, 50+ sport modes, and 7-day battery life. Water-resistant IP68.',
        price_min: 25.00,
        price_max: 89.99,
        moq: 100,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    {
        title: '4K Drone with HD Camera - Professional Aerial Photography',
        slug: '4k-drone-hd-camera',
        description: 'Professional quadcopter drone with 4K camera, GPS positioning, 30-minute flight time, and intelligent flight modes. Perfect for photography and videography.',
        price_min: 89.00,
        price_max: 299.99,
        moq: 10,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1508614999368-9260051292e5?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    {
        title: 'Portable Bluetooth Speaker - Waterproof 360° Sound',
        slug: 'portable-bluetooth-speaker-waterproof',
        description: 'Powerful portable speaker with 360-degree sound, IPX7 waterproof rating, 20-hour battery, and deep bass. Perfect for outdoor adventures.',
        price_min: 12.50,
        price_max: 55.00,
        moq: 50,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    {
        title: 'RGB Gaming Keyboard Mechanical - Backlit 104 Keys',
        slug: 'rgb-gaming-keyboard-mechanical',
        description: 'Professional mechanical gaming keyboard with customizable RGB backlighting, anti-ghosting, and durable switches. Perfect for gamers and typists.',
        price_min: 18.00,
        price_max: 75.00,
        moq: 20,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    // Home & Living
    {
        title: 'LED Strip Lights RGB - Smart WiFi Control 16 Million Colors',
        slug: 'led-strip-lights-rgb-smart',
        description: 'Smart LED strip lights with WiFi control, 16 million colors, music sync, and voice control compatible. Perfect for home decoration.',
        price_min: 8.99,
        price_max: 35.00,
        moq: 100,
        unit: 'set',
        images: [
            'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    {
        title: 'Air Purifier HEPA Filter - Smart Air Quality Monitor',
        slug: 'air-purifier-hepa-smart',
        description: 'Advanced air purifier with true HEPA filter, removes 99.97% of particles, smart air quality monitoring, and quiet operation. Covers 500 sq ft.',
        price_min: 45.00,
        price_max: 159.99,
        moq: 20,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    {
        title: 'Robot Vacuum Cleaner - Self-Charging Smart Navigation',
        slug: 'robot-vacuum-cleaner-smart',
        description: 'Intelligent robot vacuum with smart navigation, auto-charging, app control, and powerful suction. Works on all floor types.',
        price_min: 89.00,
        price_max: 299.00,
        moq: 10,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    // Fashion & Accessories
    {
        title: 'Polarized Sunglasses UV400 - Designer Style Unisex',
        slug: 'polarized-sunglasses-uv400',
        description: 'Premium polarized sunglasses with UV400 protection, lightweight frame, and stylish design. Perfect for driving and outdoor activities.',
        price_min: 3.50,
        price_max: 25.00,
        moq: 100,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    {
        title: 'Leather Crossbody Bag - Vintage Style Messenger',
        slug: 'leather-crossbody-bag-vintage',
        description: 'Genuine leather crossbody bag with vintage design, multiple compartments, and adjustable strap. Perfect for daily use and travel.',
        price_min: 15.00,
        price_max: 65.00,
        moq: 50,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    // Sports & Outdoor
    {
        title: 'Yoga Mat Non-Slip - Extra Thick Exercise Mat',
        slug: 'yoga-mat-non-slip-thick',
        description: 'Premium yoga mat with non-slip surface, extra cushioning, eco-friendly material, and carrying strap. Perfect for yoga, pilates, and fitness.',
        price_min: 8.00,
        price_max: 35.00,
        moq: 50,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    {
        title: 'Resistance Bands Set - 5 Levels Workout Fitness',
        slug: 'resistance-bands-set-workout',
        description: 'Complete resistance bands set with 5 different resistance levels, door anchor, handles, and carrying bag. Perfect for home workouts.',
        price_min: 6.99,
        price_max: 29.99,
        moq: 100,
        unit: 'set',
        images: [
            'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    {
        title: 'Camping Tent 4 Person - Waterproof Easy Setup',
        slug: 'camping-tent-4-person-waterproof',
        description: 'Spacious 4-person camping tent with waterproof design, easy setup, ventilation windows, and carrying bag. Perfect for family camping trips.',
        price_min: 35.00,
        price_max: 129.99,
        moq: 20,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    // Kitchen & Dining
    {
        title: 'Stainless Steel Water Bottle - Insulated 24 Hours Cold',
        slug: 'stainless-steel-water-bottle-insulated',
        description: 'Double-wall insulated water bottle keeps drinks cold for 24 hours, hot for 12 hours. BPA-free, leak-proof, and eco-friendly.',
        price_min: 5.50,
        price_max: 25.00,
        moq: 100,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    {
        title: 'Electric Coffee Grinder - Burr Mill Professional',
        slug: 'electric-coffee-grinder-burr',
        description: 'Professional burr coffee grinder with 18 grind settings, large capacity, and consistent grinding. Perfect for coffee enthusiasts.',
        price_min: 25.00,
        price_max: 89.99,
        moq: 30,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    // Beauty & Personal Care
    {
        title: 'Facial Cleansing Brush - Sonic Vibration Waterproof',
        slug: 'facial-cleansing-brush-sonic',
        description: 'Electric facial cleansing brush with sonic vibration technology, 3 speed modes, waterproof design, and soft silicone bristles.',
        price_min: 12.00,
        price_max: 45.00,
        moq: 50,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    {
        title: 'Hair Straightener Brush - Ceramic Fast Heating',
        slug: 'hair-straightener-brush-ceramic',
        description: 'Ceramic hair straightener brush with fast heating, anti-scald design, and ionic technology for smooth, frizz-free hair.',
        price_min: 10.00,
        price_max: 39.99,
        moq: 50,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    // Pet Supplies
    {
        title: 'Automatic Pet Feeder - Smart Programmable Timer',
        slug: 'automatic-pet-feeder-smart',
        description: 'Smart automatic pet feeder with programmable timer, portion control, voice recording, and large capacity. Perfect for cats and dogs.',
        price_min: 28.00,
        price_max: 89.99,
        moq: 30,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    {
        title: 'Pet Grooming Kit - Professional Clippers & Tools',
        slug: 'pet-grooming-kit-professional',
        description: 'Complete pet grooming kit with professional clippers, scissors, comb, and nail trimmer. Low noise design for stress-free grooming.',
        price_min: 18.00,
        price_max: 65.00,
        moq: 40,
        unit: 'set',
        images: [
            'https://images.unsplash.com/photo-1581888227599-779811939961?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    // Office & School
    {
        title: 'Ergonomic Office Chair - Lumbar Support Adjustable',
        slug: 'ergonomic-office-chair-lumbar',
        description: 'Ergonomic office chair with lumbar support, adjustable height and armrests, breathable mesh back, and 360-degree swivel.',
        price_min: 65.00,
        price_max: 199.99,
        moq: 10,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    {
        title: 'Standing Desk Converter - Height Adjustable Workstation',
        slug: 'standing-desk-converter-adjustable',
        description: 'Adjustable standing desk converter with dual monitor support, keyboard tray, and smooth height adjustment. Promotes healthy posture.',
        price_min: 45.00,
        price_max: 149.99,
        moq: 20,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    // Automotive
    {
        title: 'Car Phone Holder - Magnetic Dashboard Mount',
        slug: 'car-phone-holder-magnetic',
        description: 'Strong magnetic car phone holder with 360-degree rotation, dashboard and windshield mount, compatible with all smartphones.',
        price_min: 4.99,
        price_max: 19.99,
        moq: 200,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    {
        title: 'Dash Cam 4K - Front and Rear Camera Night Vision',
        slug: 'dash-cam-4k-dual-camera',
        description: '4K dash cam with front and rear cameras, night vision, G-sensor, loop recording, and parking mode. Essential for vehicle safety.',
        price_min: 35.00,
        price_max: 129.99,
        moq: 30,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    // Baby & Kids
    {
        title: 'Baby Monitor Camera - WiFi Video Audio Night Vision',
        slug: 'baby-monitor-camera-wifi',
        description: 'Smart baby monitor with WiFi connectivity, HD video, two-way audio, night vision, and temperature monitoring. Peace of mind for parents.',
        price_min: 28.00,
        price_max: 99.99,
        moq: 30,
        unit: 'piece',
        images: [
            'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    },
    {
        title: 'Educational Building Blocks - STEM Learning Toy Set',
        slug: 'educational-building-blocks-stem',
        description: 'Creative building blocks set with 500+ pieces, promotes STEM learning, creativity, and problem-solving skills. Safe for ages 3+.',
        price_min: 12.00,
        price_max: 45.00,
        moq: 50,
        unit: 'set',
        images: [
            'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&h=600&fit=crop'
        ],
        verified: true,
        published: true
    }
];

async function addCoolProducts() {
    try {
        console.log('🚀 Starting to add cool products...\n');

        // Get first supplier (you can modify this to use a specific seller)
        const { data: suppliers } = await supabase
            .from('suppliers')
            .select('user_id')
            .limit(1);

        if (!suppliers || suppliers.length === 0) {
            console.error('❌ No suppliers found. Please create a supplier first.');
            return;
        }

        const sellerId = suppliers[0].user_id;
        console.log(`✅ Using seller ID: ${sellerId}\n`);

        // Get categories
        const { data: categories } = await supabase
            .from('categories')
            .select('id, name')
            .is('parent_id', null);

        if (!categories || categories.length === 0) {
            console.error('❌ No categories found. Please create categories first.');
            return;
        }

        console.log(`✅ Found ${categories.length} categories\n`);

        // Add products
        let successCount = 0;
        let errorCount = 0;

        for (const product of coolProducts) {
            // Assign a random category
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];

            const { error } = await supabase
                .from('products')
                .insert({
                    ...product,
                    seller_id: sellerId,
                    category_id: randomCategory.id
                });

            if (error) {
                console.error(`❌ Error adding "${product.title}":`, error.message);
                errorCount++;
            } else {
                console.log(`✅ Added: ${product.title}`);
                successCount++;
            }
        }

        console.log(`\n🎉 Finished!`);
        console.log(`✅ Successfully added: ${successCount} products`);
        if (errorCount > 0) {
            console.log(`❌ Failed: ${errorCount} products`);
        }

    } catch (error) {
        console.error('❌ Fatal error:', error);
    }
}

// Run the script
addCoolProducts();
