import mongoose from "mongoose";
import fs from "fs";
const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }], // Changed from single image to array of images
    category: { type: String, required: true }
});

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

export default foodModel;