import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

async function migrateImages() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected");

        // Dùng native collection, bypass Mongoose schema
        const collection = mongoose.connection.collection("foods");

        const foods = await collection.find({}).toArray();
        console.log(`Found ${foods.length} food items`);

        let migratedCount = 0;

        for (const food of foods) {
            console.log(`Checking: ${food.name} | image: ${food.image} | images: ${JSON.stringify(food.images)}`);
            
            if (food.image && (!food.images || food.images.length === 0)) {
                await collection.updateOne(
                    { _id: food._id },
                    {
                        $set: { images: [food.image] },
                        $unset: { image: "" }
                    }
                );
                migratedCount++;
                console.log(`✓ Migrated: ${food.name}`);
            }
        }

        console.log(`\nMigrated: ${migratedCount}`);
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrateImages();