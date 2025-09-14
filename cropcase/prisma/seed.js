// // prisma/seed.js
// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

// async function main() {
//     const crops = [
//         // Cereals
//         { name: "Wheat", season: "Winter", description: "Staple cereal crop of India", duration: 120 },
//         { name: "Rice", season: "Summer", description: "Main kharif cereal crop", duration: 150 },
//         { name: "Maize", season: "Summer", description: "Cereal crop used for food and fodder", duration: 110 },
//         { name: "Barley", season: "Winter", description: "Cereal crop for malt and food", duration: 90 },
//         { name: "Jowar (Sorghum)", season: "Summer", description: "Millet crop grown in dry areas", duration: 120 },
//         { name: "Bajra (Pearl Millet)", season: "Summer", description: "Millet crop drought-resistant", duration: 100 },
//         { name: "Ragi (Finger Millet)", season: "Summer", description: "Millet crop rich in calcium", duration: 110 },

//         // Pulses
//         { name: "Chickpea (Chana)", season: "Winter", description: "Important pulse crop", duration: 120 },
//         { name: "Pigeon Pea (Arhar/Tur)", season: "Summer", description: "Pulse crop used in dal", duration: 150 },
//         { name: "Green Gram (Moong)", season: "Summer", description: "Short-duration pulse crop", duration: 70 },
//         { name: "Black Gram (Urad)", season: "Summer", description: "Pulse crop used in dals/idli", duration: 90 },
//         { name: "Lentil (Masoor)", season: "Winter", description: "Winter pulse crop", duration: 100 },
//         { name: "Rajma (Kidney Beans)", season: "Summer", description: "Pulse crop popular in north India", duration: 120 },

//         // Oilseeds
//         { name: "Groundnut", season: "Summer", description: "Major oilseed crop", duration: 110 },
//         { name: "Mustard", season: "Winter", description: "Winter oilseed crop", duration: 130 },
//         { name: "Soybean", season: "Summer", description: "Kharif oilseed crop", duration: 120 },
//         { name: "Sunflower", season: "Summer", description: "Oilseed crop grown widely", duration: 100 },
//         { name: "Sesame (Til)", season: "Summer", description: "Oilseed crop for edible oil", duration: 90 },
//         { name: "Castor Seed", season: "Summer", description: "Industrial oil crop", duration: 150 },

//         // Commercial crops
//         { name: "Sugarcane", season: "Summer", description: "Main cash crop for sugar", duration: 365 },
//         { name: "Cotton", season: "Summer", description: "Cash crop for textile", duration: 180 },
//         { name: "Jute", season: "Summer", description: "Fibre crop for gunny bags", duration: 150 },
//         { name: "Tobacco", season: "Winter", description: "Commercial crop in Andhra & Gujarat", duration: 150 },
//         { name: "Tea", season: "Summer", description: "Perennial plantation crop", duration: 365 },
//         { name: "Coffee", season: "Summer", description: "Plantation crop grown in Karnataka", duration: 365 },
//         { name: "Rubber", season: "Summer", description: "Plantation crop in Kerala", duration: 365 },

//         // Vegetables
//         { name: "Potato", season: "Winter", description: "Root vegetable widely consumed", duration: 90 },
//         { name: "Onion", season: "Winter", description: "Major vegetable crop", duration: 120 },
//         { name: "Tomato", season: "Summer", description: "Vegetable crop grown year-round", duration: 90 },
//         { name: "Brinjal (Eggplant)", season: "Summer", description: "Vegetable crop grown across India", duration: 100 },
//         { name: "Okra (Ladyfinger)", season: "Summer", description: "Popular vegetable crop", duration: 60 },
//         { name: "Cabbage", season: "Winter", description: "Leafy vegetable crop", duration: 90 },
//         { name: "Cauliflower", season: "Winter", description: "Leafy vegetable crop", duration: 100 },
//         { name: "Carrot", season: "Winter", description: "Root vegetable", duration: 80 },
//         { name: "Radish", season: "Winter", description: "Root vegetable crop", duration: 50 },
//         { name: "Cucumber", season: "Summer", description: "Vine vegetable crop", duration: 70 },
//         { name: "Pumpkin", season: "Summer", description: "Vine vegetable crop", duration: 120 },
//         { name: "Bitter Gourd (Karela)", season: "Summer", description: "Vegetable crop", duration: 70 },
//         { name: "Bottle Gourd (Lauki)", season: "Summer", description: "Vegetable crop", duration: 90 },
//         { name: "Spinach", season: "Winter", description: "Leafy green vegetable", duration: 45 },
//         { name: "Fenugreek (Methi)", season: "Winter", description: "Leafy green vegetable", duration: 60 },
//         { name: "Coriander", season: "Winter", description: "Leafy herb crop", duration: 40 },

//         // Fruits
//         { name: "Mango", season: "Summer", description: "National fruit of India", duration: 365 },
//         { name: "Banana", season: "Summer", description: "Year-round fruit crop", duration: 365 },
//         { name: "Guava", season: "Winter", description: "Fruit crop rich in Vitamin C", duration: 365 },
//         { name: "Papaya", season: "Summer", description: "Fruit crop grown year-round", duration: 365 },
//         { name: "Pomegranate", season: "Summer", description: "Fruit crop rich in antioxidants", duration: 365 },
//         { name: "Apple", season: "Winter", description: "Temperate fruit crop grown in Kashmir/Himachal", duration: 365 },
//         { name: "Grapes", season: "Summer", description: "Fruit crop grown in Maharashtra", duration: 365 },
//         { name: "Orange", season: "Winter", description: "Citrus fruit crop", duration: 365 },
//         { name: "Litchi", season: "Summer", description: "Fruit crop grown in Bihar", duration: 365 },
//         { name: "Pineapple", season: "Summer", description: "Tropical fruit crop", duration: 365 },
//     ];

//     for (const crop of crops) {
//         await prisma.crop.upsert({
//             where: { name: crop.name },
//             update: {},
//             create: crop,
//         });
//     }
// }

// main()
//     .then(async () => {
//         console.log("✅ Crops inserted successfully");
//         await prisma.$disconnect();
//     })
//     .catch(async (e) => {
//         console.error(e);
//         await prisma.$disconnect();
//         process.exit(1);
//     });
