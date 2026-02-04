-- Add Cool Trending Products to Database
-- This script adds a variety of interesting products across different categories

-- First, let's get some category IDs (you'll need to replace these with actual IDs from your database)
-- For now, I'll use placeholder UUIDs that you should replace

-- Consumer Electronics Products
INSERT INTO products (title, slug, description, price_min, price_max, moq, unit, images, verified, published, seller_id, category_id)
VALUES 
-- Smart Gadgets
('Wireless Earbuds Pro with ANC - Premium Sound Quality', 'wireless-earbuds-pro-anc', 'High-quality wireless earbuds with active noise cancellation, 30-hour battery life, and premium sound. Perfect for music lovers and professionals.', 15.99, 45.99, 50, 'piece', 
ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=600&h=600&fit=crop'], 
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%electronics%' LIMIT 1)),

('Smart Watch Fitness Tracker - Heart Rate & Sleep Monitor', 'smart-watch-fitness-tracker', 'Advanced smartwatch with heart rate monitoring, sleep tracking, 50+ sport modes, and 7-day battery life. Water-resistant IP68.', 25.00, 89.99, 100, 'piece',
ARRAY['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%electronics%' LIMIT 1)),

('4K Drone with HD Camera - Professional Aerial Photography', '4k-drone-hd-camera', 'Professional quadcopter drone with 4K camera, GPS positioning, 30-minute flight time, and intelligent flight modes. Perfect for photography and videography.', 89.00, 299.99, 10, 'piece',
ARRAY['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1508614999368-9260051292e5?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%electronics%' LIMIT 1)),

('Portable Bluetooth Speaker - Waterproof 360° Sound', 'portable-bluetooth-speaker-waterproof', 'Powerful portable speaker with 360-degree sound, IPX7 waterproof rating, 20-hour battery, and deep bass. Perfect for outdoor adventures.', 12.50, 55.00, 50, 'piece',
ARRAY['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%electronics%' LIMIT 1)),

('RGB Gaming Keyboard Mechanical - Backlit 104 Keys', 'rgb-gaming-keyboard-mechanical', 'Professional mechanical gaming keyboard with customizable RGB backlighting, anti-ghosting, and durable switches. Perfect for gamers and typists.', 18.00, 75.00, 20, 'piece',
ARRAY['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%electronics%' LIMIT 1)),

-- Home & Living Products
('LED Strip Lights RGB - Smart WiFi Control 16 Million Colors', 'led-strip-lights-rgb-smart', 'Smart LED strip lights with WiFi control, 16 million colors, music sync, and voice control compatible. Perfect for home decoration.', 8.99, 35.00, 100, 'set',
ARRAY['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%home%' OR name ILIKE '%garden%' LIMIT 1)),

('Air Purifier HEPA Filter - Smart Air Quality Monitor', 'air-purifier-hepa-smart', 'Advanced air purifier with true HEPA filter, removes 99.97% of particles, smart air quality monitoring, and quiet operation. Covers 500 sq ft.', 45.00, 159.99, 20, 'piece',
ARRAY['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%home%' LIMIT 1)),

('Robot Vacuum Cleaner - Self-Charging Smart Navigation', 'robot-vacuum-cleaner-smart', 'Intelligent robot vacuum with smart navigation, auto-charging, app control, and powerful suction. Works on all floor types.', 89.00, 299.00, 10, 'piece',
ARRAY['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%home%' LIMIT 1)),

-- Fashion & Accessories
('Polarized Sunglasses UV400 - Designer Style Unisex', 'polarized-sunglasses-uv400', 'Premium polarized sunglasses with UV400 protection, lightweight frame, and stylish design. Perfect for driving and outdoor activities.', 3.50, 25.00, 100, 'piece',
ARRAY['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%apparel%' OR name ILIKE '%accessories%' LIMIT 1)),

('Leather Crossbody Bag - Vintage Style Messenger', 'leather-crossbody-bag-vintage', 'Genuine leather crossbody bag with vintage design, multiple compartments, and adjustable strap. Perfect for daily use and travel.', 15.00, 65.00, 50, 'piece',
ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%apparel%' OR name ILIKE '%accessories%' LIMIT 1)),

-- Sports & Outdoor
('Yoga Mat Non-Slip - Extra Thick Exercise Mat', 'yoga-mat-non-slip-thick', 'Premium yoga mat with non-slip surface, extra cushioning, eco-friendly material, and carrying strap. Perfect for yoga, pilates, and fitness.', 8.00, 35.00, 50, 'piece',
ARRAY['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%sports%' LIMIT 1)),

('Resistance Bands Set - 5 Levels Workout Fitness', 'resistance-bands-set-workout', 'Complete resistance bands set with 5 different resistance levels, door anchor, handles, and carrying bag. Perfect for home workouts.', 6.99, 29.99, 100, 'set',
ARRAY['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%sports%' LIMIT 1)),

('Camping Tent 4 Person - Waterproof Easy Setup', 'camping-tent-4-person-waterproof', 'Spacious 4-person camping tent with waterproof design, easy setup, ventilation windows, and carrying bag. Perfect for family camping trips.', 35.00, 129.99, 20, 'piece',
ARRAY['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%sports%' OR name ILIKE '%outdoor%' LIMIT 1)),

-- Kitchen & Dining
('Stainless Steel Water Bottle - Insulated 24 Hours Cold', 'stainless-steel-water-bottle-insulated', 'Double-wall insulated water bottle keeps drinks cold for 24 hours, hot for 12 hours. BPA-free, leak-proof, and eco-friendly.', 5.50, 25.00, 100, 'piece',
ARRAY['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%home%' LIMIT 1)),

('Electric Coffee Grinder - Burr Mill Professional', 'electric-coffee-grinder-burr', 'Professional burr coffee grinder with 18 grind settings, large capacity, and consistent grinding. Perfect for coffee enthusiasts.', 25.00, 89.99, 30, 'piece',
ARRAY['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%home%' LIMIT 1)),

-- Beauty & Personal Care
('Facial Cleansing Brush - Sonic Vibration Waterproof', 'facial-cleansing-brush-sonic', 'Electric facial cleansing brush with sonic vibration technology, 3 speed modes, waterproof design, and soft silicone bristles.', 12.00, 45.00, 50, 'piece',
ARRAY['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%beauty%' LIMIT 1)),

('Hair Straightener Brush - Ceramic Fast Heating', 'hair-straightener-brush-ceramic', 'Ceramic hair straightener brush with fast heating, anti-scald design, and ionic technology for smooth, frizz-free hair.', 10.00, 39.99, 50, 'piece',
ARRAY['https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%beauty%' LIMIT 1)),

-- Pet Supplies
('Automatic Pet Feeder - Smart Programmable Timer', 'automatic-pet-feeder-smart', 'Smart automatic pet feeder with programmable timer, portion control, voice recording, and large capacity. Perfect for cats and dogs.', 28.00, 89.99, 30, 'piece',
ARRAY['https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%pet%' LIMIT 1)),

('Pet Grooming Kit - Professional Clippers & Tools', 'pet-grooming-kit-professional', 'Complete pet grooming kit with professional clippers, scissors, comb, and nail trimmer. Low noise design for stress-free grooming.', 18.00, 65.00, 40, 'set',
ARRAY['https://images.unsplash.com/photo-1581888227599-779811939961?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%pet%' LIMIT 1)),

-- Office & School
('Ergonomic Office Chair - Lumbar Support Adjustable', 'ergonomic-office-chair-lumbar', 'Ergonomic office chair with lumbar support, adjustable height and armrests, breathable mesh back, and 360-degree swivel.', 65.00, 199.99, 10, 'piece',
ARRAY['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%office%' OR name ILIKE '%furniture%' LIMIT 1)),

('Standing Desk Converter - Height Adjustable Workstation', 'standing-desk-converter-adjustable', 'Adjustable standing desk converter with dual monitor support, keyboard tray, and smooth height adjustment. Promotes healthy posture.', 45.00, 149.99, 20, 'piece',
ARRAY['https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%office%' OR name ILIKE '%furniture%' LIMIT 1)),

-- Automotive
('Car Phone Holder - Magnetic Dashboard Mount', 'car-phone-holder-magnetic', 'Strong magnetic car phone holder with 360-degree rotation, dashboard and windshield mount, compatible with all smartphones.', 4.99, 19.99, 200, 'piece',
ARRAY['https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%auto%' OR name ILIKE '%vehicle%' LIMIT 1)),

('Dash Cam 4K - Front and Rear Camera Night Vision', 'dash-cam-4k-dual-camera', '4K dash cam with front and rear cameras, night vision, G-sensor, loop recording, and parking mode. Essential for vehicle safety.', 35.00, 129.99, 30, 'piece',
ARRAY['https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%auto%' OR name ILIKE '%vehicle%' LIMIT 1)),

-- Baby & Kids
('Baby Monitor Camera - WiFi Video Audio Night Vision', 'baby-monitor-camera-wifi', 'Smart baby monitor with WiFi connectivity, HD video, two-way audio, night vision, and temperature monitoring. Peace of mind for parents.', 28.00, 99.99, 30, 'piece',
ARRAY['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%baby%' OR name ILIKE '%kids%' LIMIT 1)),

('Educational Building Blocks - STEM Learning Toy Set', 'educational-building-blocks-stem', 'Creative building blocks set with 500+ pieces, promotes STEM learning, creativity, and problem-solving skills. Safe for ages 3+.', 12.00, 45.00, 50, 'set',
ARRAY['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&h=600&fit=crop'],
true, true, (SELECT user_id FROM suppliers LIMIT 1), (SELECT id FROM categories WHERE name ILIKE '%baby%' OR name ILIKE '%kids%' OR name ILIKE '%toy%' LIMIT 1));

-- Note: You'll need to run this script and replace the category_id and seller_id subqueries
-- with actual IDs from your database for proper insertion.
