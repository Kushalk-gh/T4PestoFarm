// Detailed product data for all products
import { Truck, Check } from 'lucide-react';

export interface ProductDetail {
  id: number;
  name: string;
  brand: string;
  currentPrice: number;
  originalPrice: number;
  sizes: { label: string; price: number; discount: number }[];
  reviews: number;
  reviewCount: number;
  images: string[];
  shippingInfo: { icon: any; text: string }[];
  description: string;
  specifications: { key: string; value: string }[];
  customerReviews: {
    id: number;
    author: string;
    rating: number;
    date: string;
    comment: string;
    verifiedPurchase: boolean;
  }[];
}

export const productDetails: ProductDetail[] = [
  // Flower Seeds
  {
    id: 1,
    name: "Marigold Seed Packet - Orange Burst",
    brand: "Pesto Seeds",
    currentPrice: 120,
    originalPrice: 185,
    sizes: [
      { label: '10g (Trial Pack)', price: 120, discount: 65 },
      { label: '25g (Standard)', price: 250, discount: 50 },
      { label: '50g (Bulk)', price: 450, discount: 100 },
    ],
    reviews: 4.2,
    reviewCount: 87,
    images: [
            "/images/Marigold Seed Packet - Orange Burst.png",          ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Marigold Orange Burst is a vibrant, easy-to-grow variety known for its bright orange flowers and pest-repelling properties. Perfect for gardens, borders, and containers. These seeds produce compact plants with abundant blooms throughout the season.",
    specifications: [
      { key: 'Maturity', value: '50-60 days from sowing' },
      { key: 'Flower Color', value: 'Bright Orange' },
      { key: 'Plant Height', value: '30-45 cm' },
      { key: 'Tolerance', value: 'Drought and pests' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Ravi Kumar',
        rating: 5,
        date: '2023-11-15',
        comment: 'Great germination rate and beautiful flowers. Highly recommend!',
        verifiedPurchase: true
      },
      {
        id: 2,
        author: 'Priya Singh',
        rating: 4,
        date: '2023-11-10',
        comment: 'Good quality seeds. Plants grew well but needed more water.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 2,
    name: "Lotus Seed Mix - Water Monarch",
    brand: "Bloom Farm",
    currentPrice: 95,
    originalPrice: 130,
    sizes: [
      { label: '10g (Trial Pack)', price: 95, discount: 35 },
      { label: '20g (Standard)', price: 180, discount: 40 },
    ],
    reviews: 4.0,
    reviewCount: 62,
    images: [
      "/images/Lotus Seed Mix - Water Monarch.png",           ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Lotus Water Monarch is a beautiful aquatic plant mix that produces stunning pink and white flowers. Ideal for ponds, water gardens, and containers. These seeds are easy to germinate and provide a serene, natural beauty to any water feature.",
    specifications: [
      { key: 'Maturity', value: '60-90 days from sowing' },
      { key: 'Flower Color', value: 'Pink and White' },
      { key: 'Water Depth', value: '15-30 cm' },
      { key: 'Tolerance', value: 'Full sun and water' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Anita Sharma',
        rating: 4,
        date: '2023-10-20',
        comment: 'Beautiful flowers, but germination took time.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 3,
    name: "Rose Kit - Miniature Sunshine",
    brand: "Garden Joy",
    currentPrice: 450,
    originalPrice: 600,
    sizes: [
      { label: 'Small Kit', price: 450, discount: 150 },
      { label: 'Medium Kit', price: 750, discount: 200 },
      { label: 'Large Kit', price: 1200, discount: 300 },
    ],
    reviews: 4.5,
    reviewCount: 134,
    images: [
"/images/Rose Kit - Miniature Sunshine.png",       
    ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Rose Miniature Sunshine is a complete kit for growing beautiful yellow roses. Includes seeds, soil, and instructions for beginners. These compact roses are perfect for balconies, windowsills, and small gardens.",
    specifications: [
      { key: 'Maturity', value: '90-120 days from sowing' },
      { key: 'Flower Color', value: 'Bright Yellow' },
      { key: 'Plant Height', value: '20-30 cm' },
      { key: 'Kit Includes', value: 'Seeds, soil, pots' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Vikram Patel',
        rating: 5,
        date: '2023-09-25',
        comment: 'Amazing kit! Easy to use and beautiful results.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 4,
    name: "Hibiscus moscheutos Seeds - Pink",
    brand: "Pesto Seeds",
    currentPrice: 140,
    originalPrice: 200,
    sizes: [
      { label: '10g (Trial Pack)', price: 140, discount: 60 },
      { label: '25g (Standard)', price: 280, discount: 80 },
    ],
    reviews: 4.3,
    reviewCount: 95,
    images: [
"/images/Hibiscus moscheutos Seeds - Pink.png",       ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Hibiscus Pink is a tropical beauty with large, vibrant pink flowers. Hardy and easy to grow, perfect for gardens and landscapes. These seeds produce bushy plants that bloom profusely in warm climates.",
    specifications: [
      { key: 'Maturity', value: '70-90 days from sowing' },
      { key: 'Flower Color', value: 'Pink' },
      { key: 'Plant Height', value: '1-2 meters' },
      { key: 'Tolerance', value: 'Heat and humidity' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Sneha Gupta',
        rating: 4,
        date: '2023-08-30',
        comment: 'Lovely flowers, but plants need support.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 5,
    name: "Jasmine Seed Mix - Starlight Perfume",
    brand: "Sun Growers",
    currentPrice: 180,
    originalPrice: 250,
    sizes: [
      { label: '15g (Trial Pack)', price: 180, discount: 70 },
      { label: '40g (Standard)', price: 380, discount: 100 },
    ],
    reviews: 4.4,
    reviewCount: 108,
    images: [
"/images/Jasmine Seed Mix - Starlight Perfume.png",       
    ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Jasmine Starlight Perfume is a fragrant mix of jasmine varieties that fill the air with sweet scent. Perfect for trellises, fences, and containers. These seeds produce climbing vines with delicate white flowers.",
    specifications: [
      { key: 'Maturity', value: '80-100 days from sowing' },
      { key: 'Flower Color', value: 'White' },
      { key: 'Plant Type', value: 'Climbing Vine' },
      { key: 'Fragrance', value: 'Strong, sweet' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Rajesh Kumar',
        rating: 5,
        date: '2023-07-15',
        comment: 'Incredible fragrance! Plants are thriving.',
        verifiedPurchase: true
      },
    ]
  },
  // Vegetable Seeds
  {
    id: 6,
    name: "Tomato Seeds - Hybrid F1",
    brand: "VeggieCorp",
    currentPrice: 158,
    originalPrice: 225,
    sizes: [
      { label: '10g (Trial Pack)', price: 158, discount: 67 },
      { label: '25g (Standard)', price: 320, discount: 80 },
      { label: '50g (Bulk)', price: 600, discount: 150 },
    ],
    reviews: 4.5,
    reviewCount: 154,
    images: [
"/images/Tomato Seeds - Hybrid F1.png",      
    ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Tomato Hybrid F1 is a high-yielding variety with firm, red fruits. Resistant to common diseases, perfect for fresh eating and cooking. These seeds produce determinate plants that are easy to manage.",
    specifications: [
      { key: 'Maturity', value: '60-70 days from transplant' },
      { key: 'Fruit Weight', value: '80-100 grams' },
      { key: 'Tolerance', value: 'Fusarium Wilt' },
      { key: 'Plant Type', value: 'Determinate' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Anil Kumar',
        rating: 5,
        date: '2023-10-26',
        comment: 'Excellent germination and yield.',
        verifiedPurchase: true
      },
      {
        id: 2,
        author: 'Priya Sharma',
        rating: 4,
        date: '2023-10-20',
        comment: 'Good quality, minor issues.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 7,
    name: "Drumstick Seeds - Abundant Harvest",
    brand: "Pesto Seeds",
    currentPrice: 89,
    originalPrice: 111,
    sizes: [
      { label: '100g (Trial Pack)', price: 89, discount: 22 },
      { label: '250g (Standard)', price: 180, discount: 40 },
    ],
    reviews: 4.1,
    reviewCount: 76,
    images: [
"/images/Drumstick Seeds - Abundant Harvest.png",        
    ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Drumstick Abundant Harvest produces nutritious pods rich in vitamins. Fast-growing tree, ideal for home gardens. These seeds yield a bountiful harvest of tender, edible pods.",
    specifications: [
      { key: 'Maturity', value: '6-8 months from sowing' },
      { key: 'Pod Length', value: '30-45 cm' },
      { key: 'Nutritional Value', value: 'High in Vitamin C' },
      { key: 'Plant Type', value: 'Tree' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Meera Joshi',
        rating: 4,
        date: '2023-09-10',
        comment: 'Healthy plants, good yield.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 8,
    name: "Carrot Seeds - Orange King",
    brand: "Root & Co",
    currentPrice: 281,
    originalPrice: 429,
    sizes: [
      { label: '20g (Trial Pack)', price: 281, discount: 148 },
      { label: '50g (Standard)', price: 550, discount: 200 },
      { label: '100g (Bulk)', price: 1000, discount: 300 },
    ],
    reviews: 4.6,
    reviewCount: 112,
    images: [
"/images/Carrot Seeds - Orange King.png",      ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Carrot Orange King produces sweet, crunchy carrots. Easy to grow in containers or gardens. These seeds yield uniform, bright orange roots that are perfect for fresh eating.",
    specifications: [
      { key: 'Maturity', value: '70-80 days from sowing' },
      { key: 'Root Length', value: '15-20 cm' },
      { key: 'Color', value: 'Bright Orange' },
      { key: 'Tolerance', value: 'Loose soil' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Suresh Reddy',
        rating: 5,
        date: '2023-08-20',
        comment: 'Sweet and crunchy carrots!',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 9,
    name: "Capsicum Seeds - Green Bell",
    brand: "Seed Masters",
    currentPrice: 199,
    originalPrice: 280,
    sizes: [
      { label: '5g (Trial Pack)', price: 199, discount: 81 },
      { label: '15g (Standard)', price: 450, discount: 120 },
    ],
    reviews: 4.2,
    reviewCount: 89,
    images: [
"/images/Capsicum Seeds - Green Bell.png",      ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Capsicum Green Bell produces sweet, crunchy peppers. Versatile for cooking and salads. These seeds yield blocky, green fruits that are easy to grow.",
    specifications: [
      { key: 'Maturity', value: '65-75 days from transplant' },
      { key: 'Fruit Size', value: '10-12 cm' },
      { key: 'Color', value: 'Green' },
      { key: 'Tolerance', value: 'Heat' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Kavita Singh',
        rating: 4,
        date: '2023-07-25',
        comment: 'Good flavor, productive plants.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 10,
    name: "Mushroom Spawn - Shiitake Dark Cap",
    brand: "Pesto Seeds",
    currentPrice: 110,
    originalPrice: 160,
    sizes: [
      { label: '10g (Trial Pack)', price: 110, discount: 50 },
      { label: '25g (Standard)', price: 220, discount: 80 },
    ],
    reviews: 4.0,
    reviewCount: 67,
    images: [
"/images/Mushroom Spawn - Shiitake Dark Cap.png",      ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Shiitake Dark Cap spawn for growing nutritious mushrooms. Easy to cultivate at home. These spawns produce flavorful, medicinal mushrooms on logs or substrates.",
    specifications: [
      { key: 'Maturity', value: '6-12 months from inoculation' },
      { key: 'Flavor', value: 'Rich, savory' },
      { key: 'Medicinal Properties', value: 'Immune boosting' },
      { key: 'Growing Medium', value: 'Logs or sawdust' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Arun Kumar',
        rating: 4,
        date: '2023-06-15',
        comment: 'Good spawn, successful grow.',
        verifiedPurchase: true
      },
    ]
  },
  // Fruit Seeds
  {
    id: 11,
    name: "Strawberry Sapling - Sweetheart",
    brand: "Berry Good",
    currentPrice: 350,
    originalPrice: 480,
    sizes: [
      { label: 'Single Plant', price: 350, discount: 130 },
      { label: 'Pack of 3', price: 900, discount: 300 },
    ],
    reviews: 4.4,
    reviewCount: 98,
    images: [
"/images/Strawberry Sapling - Sweetheart.png",      ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Strawberry Sweetheart produces sweet, juicy berries. Perfect for containers and gardens. These saplings yield abundant fruit with excellent flavor.",
    specifications: [
      { key: 'Maturity', value: '60-70 days from planting' },
      { key: 'Fruit Size', value: 'Medium' },
      { key: 'Flavor', value: 'Sweet and juicy' },
      { key: 'Plant Type', value: 'Perennial' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Neha Patel',
        rating: 5,
        date: '2023-11-05',
        comment: 'Delicious berries, easy to grow.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 12,
    name: "Watermelon Seeds - Sugar Baby",
    brand: "Field Fresh",
    currentPrice: 220,
    originalPrice: 300,
    sizes: [
      { label: '10g (Trial Pack)', price: 220, discount: 80 },
      { label: '25g (Standard)', price: 450, discount: 150 },
    ],
    reviews: 4.3,
    reviewCount: 85,
    images: [
"/images/Watermelon Seeds - Sugar Baby.png",      ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Watermelon Sugar Baby produces sweet, seedless melons. Compact vines ideal for small spaces. These seeds yield juicy, red-fleshed fruits perfect for summer.",
    specifications: [
      { key: 'Maturity', value: '75-85 days from sowing' },
      { key: 'Fruit Weight', value: '4-6 kg' },
      { key: 'Flesh Color', value: 'Red' },
      { key: 'Seeds', value: 'Few or seedless' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Rohan Sharma',
        rating: 4,
        date: '2023-10-10',
        comment: 'Sweet melons, good size.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 13,
    name: "Pineapple Slips - Gold Medal",
    brand: "Field Fresh",
    currentPrice: 550,
    originalPrice: 750,
    sizes: [
      { label: 'Small Slip', price: 550, discount: 200 },
      { label: 'Large Slip', price: 850, discount: 300 },
    ],
    reviews: 4.5,
    reviewCount: 76,
    images: [
"/images/Pineapple Slips - Gold Medal.png",      ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Pineapple Gold Medal produces sweet, golden fruits. Easy to grow in warm climates. These slips yield juicy pineapples with excellent flavor.",
    specifications: [
      { key: 'Maturity', value: '18-24 months from planting' },
      { key: 'Fruit Weight', value: '1-2 kg' },
      { key: 'Flavor', value: 'Sweet and tangy' },
      { key: 'Plant Type', value: 'Perennial' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Pooja Singh',
        rating: 5,
        date: '2023-09-20',
        comment: 'Amazing flavor, worth the wait.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 14,
    name: "Blueberry Cuttings - Blue Velvet",
    brand: "Pesto Seeds",
    currentPrice: 175,
    originalPrice: 250,
    sizes: [
      { label: '10g (Trial Pack)', price: 175, discount: 75 },
      { label: '20g (Standard)', price: 320, discount: 100 },
    ],
    reviews: 4.2,
    reviewCount: 64,
    images: [
"/images/Blueberry Cuttings - Blue Velvet.png",      ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Blueberry Blue Velvet produces antioxidant-rich berries. Bushy plants for gardens. These cuttings yield sweet, blue fruits packed with nutrients.",
    specifications: [
      { key: 'Maturity', value: '2-3 years from planting' },
      { key: 'Berry Size', value: 'Medium' },
      { key: 'Flavor', value: 'Sweet and tart' },
      { key: 'Plant Type', value: 'Shrub' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Amit Kumar',
        rating: 4,
        date: '2023-08-15',
        comment: 'Healthy plants, tasty berries.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 15,
    name: "Pomegranate Cuttings - Ruby Red Heirloom",
    brand: "Exotic Fruit Co",
    currentPrice: 300,
    originalPrice: 400,
    sizes: [
      { label: '5g (Trial Pack)', price: 300, discount: 100 },
      { label: '10g (Standard)', price: 550, discount: 150 },
    ],
    reviews: 4.6,
    reviewCount: 91,
    images: [
"/images/Pomegranate Cuttings - Ruby Red Heirloom.png",      ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Pomegranate Ruby Red produces juicy, ruby-red fruits. Ancient heirloom variety. These cuttings yield antioxidant-rich pomegranates with sweet-tart flavor.",
    specifications: [
      { key: 'Maturity', value: '5-7 months from flowering' },
      { key: 'Fruit Size', value: 'Medium to large' },
      { key: 'Seeds', value: 'Edible, juicy' },
      { key: 'Plant Type', value: 'Shrub/tree' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Sunita Rao',
        rating: 5,
        date: '2023-07-10',
        comment: 'Juicy and flavorful, excellent quality.',
        verifiedPurchase: true
      },
    ]
  },
  // Field Crops
  {
    id: 16,
    name: "WHEAT",
    brand: "Pesto Seeds",
    currentPrice: 250,
    originalPrice: 350,
    sizes: [
      { label: '5kg (Trial Pack)', price: 250, discount: 100 },
      { label: '10kg (Standard)', price: 450, discount: 150 },
      { label: '25kg (Bulk)', price: 1000, discount: 300 },
    ],
    reviews: 4.3,
    reviewCount: 120,
    images: [
"/images/WHEAT.png",      ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "High-yielding wheat seeds suitable for various climates. Resistant to common diseases and pests. Ideal for commercial farming and home gardens.",
    specifications: [
      { key: 'Maturity', value: '90-120 days from sowing' },
      { key: 'Yield', value: '40-50 quintals per hectare' },
      { key: 'Tolerance', value: 'Drought and rust' },
      { key: 'Plant Height', value: '80-100 cm' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Rajesh Kumar',
        rating: 5,
        date: '2023-10-15',
        comment: 'Excellent yield and quality. Highly recommended.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 17,
    name: "RICE",
    brand: "Pesto Seeds",
    currentPrice: 300,
    originalPrice: 420,
    sizes: [
      { label: '5kg (Trial Pack)', price: 300, discount: 120 },
      { label: '10kg (Standard)', price: 550, discount: 170 },
      { label: '25kg (Bulk)', price: 1200, discount: 400 },
    ],
    reviews: 4.4,
    reviewCount: 150,
    images: [
"/images/RICE.png",      ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Premium rice seeds for high productivity. Aromatic and long-grain varieties. Suitable for irrigated and rain-fed conditions.",
    specifications: [
      { key: 'Maturity', value: '120-150 days from sowing' },
      { key: 'Yield', value: '50-60 quintals per hectare' },
      { key: 'Grain Type', value: 'Long grain, aromatic' },
      { key: 'Tolerance', value: 'Flooding and pests' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Anita Sharma',
        rating: 4,
        date: '2023-09-20',
        comment: 'Good quality seeds, high yield.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 18,
    name: "MAIZE",
    brand: "Pesto Seeds",
    currentPrice: 280,
    originalPrice: 380,
    sizes: [
      { label: '5kg (Trial Pack)', price: 280, discount: 100 },
      { label: '10kg (Standard)', price: 500, discount: 150 },
      { label: '25kg (Bulk)', price: 1100, discount: 350 },
    ],
    reviews: 4.2,
    reviewCount: 110,
    images: [
"/images/MAIZE.png",      ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Sweet corn maize seeds for fresh consumption and fodder. High-sugar content and disease-resistant varieties.",
    specifications: [
      { key: 'Maturity', value: '70-90 days from sowing' },
      { key: 'Yield', value: '30-40 quintals per hectare' },
      { key: 'Cob Length', value: '15-20 cm' },
      { key: 'Tolerance', value: 'Heat and drought' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Vikram Patel',
        rating: 4,
        date: '2023-08-25',
        comment: 'Sweet and productive. Good for home use.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 19,
    name: "COTTON",
    brand: "Pesto Seeds",
    currentPrice: 350,
    originalPrice: 500,
    sizes: [
      { label: '5kg (Trial Pack)', price: 350, discount: 150 },
      { label: '10kg (Standard)', price: 650, discount: 200 },
      { label: '25kg (Bulk)', price: 1400, discount: 500 },
    ],
    reviews: 4.5,
    reviewCount: 95,
    images: [
"/images/COTTON.png",      ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "High-quality cotton seeds for fiber production. Bollworm-resistant and suitable for various soil types.",
    specifications: [
      { key: 'Maturity', value: '150-180 days from sowing' },
      { key: 'Fiber Length', value: '25-30 mm' },
      { key: 'Yield', value: '15-20 quintals per hectare' },
      { key: 'Tolerance', value: 'Bollworm and drought' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Sneha Gupta',
        rating: 5,
        date: '2023-07-30',
        comment: 'Excellent fiber quality and resistance.',
        verifiedPurchase: true
      },
    ]
  },
  // Crop Protection
  {
    id: 20,
    name: "Insecticides",
    brand: "Pesto Protect",
    currentPrice: 450,
    originalPrice: 600,
    sizes: [
      { label: '100ml (Trial)', price: 450, discount: 150 },
      { label: '250ml (Standard)', price: 800, discount: 250 },
      { label: '500ml (Bulk)', price: 1400, discount: 400 },
    ],
    reviews: 4.3,
    reviewCount: 200,
    images: [
      "/images/Insecticides.png",
    ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Effective insecticides for controlling pests in crops. Broad-spectrum action against aphids, caterpillars, and other insects.",
    specifications: [
      { key: 'Active Ingredient', value: 'Imidacloprid 17.8% SL' },
      { key: 'Application', value: 'Foliar spray' },
      { key: 'Dosage', value: '0.5-1 ml per liter' },
      { key: 'Safety', value: 'Low toxicity to beneficial insects' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Ravi Kumar',
        rating: 4,
        date: '2023-11-10',
        comment: 'Effective against pests, easy to use.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 21,
    name: "Fungicides",
    brand: "Pesto Protect",
    currentPrice: 500,
    originalPrice: 700,
    sizes: [
      { label: '100g (Trial)', price: 500, discount: 200 },
      { label: '250g (Standard)', price: 900, discount: 300 },
      { label: '500g (Bulk)', price: 1600, discount: 500 },
    ],
    reviews: 4.4,
    reviewCount: 180,
    images: [
      "/images/Fungicides.png",
    ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Powerful fungicides to prevent and treat fungal diseases in plants. Effective against powdery mildew, rust, and blight.",
    specifications: [
      { key: 'Active Ingredient', value: 'Azoxystrobin 23% SC' },
      { key: 'Application', value: 'Foliar spray' },
      { key: 'Dosage', value: '1-2 ml per liter' },
      { key: 'Duration', value: '14-21 days protection' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Priya Singh',
        rating: 5,
        date: '2023-10-25',
        comment: 'Cleared fungal issues quickly.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 22,
    name: "Herbicides",
    brand: "Pesto Protect",
    currentPrice: 400,
    originalPrice: 550,
    sizes: [
      { label: '100ml (Trial)', price: 400, discount: 150 },
      { label: '250ml (Standard)', price: 700, discount: 200 },
      { label: '500ml (Bulk)', price: 1200, discount: 350 },
    ],
    reviews: 4.2,
    reviewCount: 160,
    images: [
      "/images/Herbicides.png",
    ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Effective herbicides for weed control in crops. Selective action to protect crops while eliminating unwanted plants.",
    specifications: [
      { key: 'Active Ingredient', value: 'Glyphosate 41% SL' },
      { key: 'Application', value: 'Post-emergence' },
      { key: 'Dosage', value: '1-2 ml per liter' },
      { key: 'Target', value: 'Broadleaf weeds' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Anil Kumar',
        rating: 4,
        date: '2023-09-15',
        comment: 'Effective weed control.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 23,
    name: "Plant Growth Regulators",
    brand: "Pesto Protect",
    currentPrice: 600,
    originalPrice: 800,
    sizes: [
      { label: '100ml (Trial)', price: 600, discount: 200 },
      { label: '250ml (Standard)', price: 1100, discount: 300 },
      { label: '500ml (Bulk)', price: 1900, discount: 500 },
    ],
    reviews: 4.5,
    reviewCount: 140,
    images: [
      "/images/Growth Promoters.png"
    ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Plant growth regulators to enhance crop yield and quality. Promotes flowering, fruiting, and stress tolerance.",
    specifications: [
      { key: 'Active Ingredient', value: 'Gibberellic Acid 0.001%' },
      { key: 'Application', value: 'Foliar spray' },
      { key: 'Dosage', value: '0.5-1 ml per liter' },
      { key: 'Benefits', value: 'Increased yield and quality' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Meera Joshi',
        rating: 5,
        date: '2023-08-20',
        comment: 'Improved fruit size and yield.',
        verifiedPurchase: true
      },
    ]
  },
  // Crop Nutrition
  {
    id: 24,
    name: "Fertilizers",
    brand: "Pesto Nutrition",
    currentPrice: 350,
    originalPrice: 500,
    sizes: [
      { label: '1kg (Trial)', price: 350, discount: 150 },
      { label: '5kg (Standard)', price: 1500, discount: 500 },
      { label: '10kg (Bulk)', price: 2800, discount: 1000 },
    ],
    reviews: 4.3,
    reviewCount: 220,
    images: [
      "/images/FERTILIZERS.png",
      ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Balanced NPK fertilizers for optimal plant nutrition. Promotes healthy growth, flowering, and fruiting.",
    specifications: [
      { key: 'Composition', value: 'NPK 20:20:20' },
      { key: 'Application', value: 'Soil application' },
      { key: 'Dosage', value: '50-100g per plant' },
      { key: 'Release', value: 'Slow release' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Suresh Reddy',
        rating: 4,
        date: '2023-11-05',
        comment: 'Balanced nutrition for plants.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 25,
    name: "Micronutrients",
    brand: "Pesto Nutrition",
    currentPrice: 250,
    originalPrice: 350,
    sizes: [
      { label: '100g (Trial)', price: 250, discount: 100 },
      { label: '500g (Standard)', price: 1000, discount: 300 },
      { label: '1kg (Bulk)', price: 1800, discount: 500 },
    ],
    reviews: 4.4,
    reviewCount: 190,
    images: [
"/images/Micronutrients.png",      ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Essential micronutrients mix for correcting deficiencies. Includes zinc, iron, manganese, and boron.",
    specifications: [
      { key: 'Composition', value: 'Zn, Fe, Mn, B' },
      { key: 'Application', value: 'Foliar spray' },
      { key: 'Dosage', value: '1-2g per liter' },
      { key: 'Benefits', value: 'Prevents deficiencies' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Kavita Singh',
        rating: 5,
        date: '2023-10-10',
        comment: 'Fixed yellowing leaves quickly.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 26,
    name: "Bio-stimulants",
    brand: "Pesto Nutrition",
    currentPrice: 450,
    originalPrice: 600,
    sizes: [
      { label: '100ml (Trial)', price: 450, discount: 150 },
      { label: '250ml (Standard)', price: 900, discount: 250 },
      { label: '500ml (Bulk)', price: 1600, discount: 400 },
    ],
    reviews: 4.5,
    reviewCount: 170,
    images: [
"/images/Bio-stimulants.png",      ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Natural bio-stimulants to enhance plant growth and stress resistance. Derived from seaweed and humic acids.",
    specifications: [
      { key: 'Composition', value: 'Seaweed extract, humic acid' },
      { key: 'Application', value: 'Foliar spray' },
      { key: 'Dosage', value: '2-5 ml per liter' },
      { key: 'Benefits', value: 'Improved root development' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Arun Kumar',
        rating: 5,
        date: '2023-09-25',
        comment: 'Plants look healthier and stronger.',
        verifiedPurchase: true
      },
    ]
  },
  // Organic
  {
    id: 27,
    name: "BIO INSECTICIDES",
    brand: "Pesto Organic",
    currentPrice: 550,
    originalPrice: 750,
    sizes: [
      { label: '100ml (Trial)', price: 550, discount: 200 },
      { label: '250ml (Standard)', price: 1000, discount: 300 },
      { label: '500ml (Bulk)', price: 1800, discount: 500 },
    ],
    reviews: 4.4,
    reviewCount: 130,
    images: [
      "/images/BIO INSECTICIDES.png",
    ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Organic bio-insecticides derived from neem and other natural sources. Safe for beneficial insects and environment.",
    specifications: [
      { key: 'Active Ingredient', value: 'Azadirachtin 0.03%' },
      { key: 'Application', value: 'Foliar spray' },
      { key: 'Dosage', value: '2-5 ml per liter' },
      { key: 'Certification', value: 'Organic approved' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Neha Patel',
        rating: 4,
        date: '2023-11-01',
        comment: 'Effective and eco-friendly.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 28,
    name: "BIO FUNGICIDES",
    brand: "Pesto Organic",
    currentPrice: 600,
    originalPrice: 800,
    sizes: [
      { label: '100g (Trial)', price: 600, discount: 200 },
      { label: '250g (Standard)', price: 1100, discount: 300 },
      { label: '500g (Bulk)', price: 2000, discount: 500 },
    ],
    reviews: 4.3,
    reviewCount: 115,
    images: [
"/images/BIO FUNGICIDES.png",      ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Organic bio-fungicides using beneficial microbes. Controls fungal diseases naturally without chemicals.",
    specifications: [
      { key: 'Active Ingredient', value: 'Trichoderma spp.' },
      { key: 'Application', value: 'Soil drench' },
      { key: 'Dosage', value: '5-10g per plant' },
      { key: 'Benefits', value: 'Disease suppression' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Rohan Sharma',
        rating: 5,
        date: '2023-10-15',
        comment: 'Great for organic farming.',
        verifiedPurchase: true
      },
    ]
  },
  {
    id: 29,
    name: "BIO/ORGANIC FERTILIZERS",
    brand: "Pesto Organic",
    currentPrice: 400,
    originalPrice: 550,
    sizes: [
      { label: '1kg (Trial)', price: 400, discount: 150 },
      { label: '5kg (Standard)', price: 1700, discount: 500 },
      { label: '10kg (Bulk)', price: 3200, discount: 1000 },
    ],
    reviews: 4.5,
    reviewCount: 200,
    images: [
"/images/BIO FERTILIZERS.png",      ],
    shippingInfo: [
      { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
      { icon: Check, text: 'Expected delivery in 4-7 days' },
    ],
    description: "Organic fertilizers made from compost, vermicompost, and bio-manures. Provides slow-release nutrition for sustainable farming.",
    specifications: [
      { key: 'Composition', value: 'Organic matter 80%' },
      { key: 'Application', value: 'Soil incorporation' },
      { key: 'Dosage', value: '2-5kg per plant' },
      { key: 'Benefits', value: 'Improves soil health' },
    ],
    customerReviews: [
      {
        id: 1,
        author: 'Pooja Singh',
        rating: 5,
        date: '2023-09-30',
        comment: 'Excellent for organic gardens.',
        verifiedPurchase: true
      },
    ]
  },
];
