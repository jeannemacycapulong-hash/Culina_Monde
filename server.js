require("dotenv").config();

const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

const MONGO_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";const DB_NAME = "dbRestaurants";
const COLLECTION_NAME = "restaurants";

const client = new MongoClient(MONGO_URI);

let restaurants;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});

app.get("/api/restaurants", async (req, res) => {
    try {
        const data = await restaurants
            .find({})
            .sort({ restaurant_id: 1 })
            .toArray();

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to load restaurants"
        });
    }
});

app.get("/api/restaurants/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const restaurant = await restaurants.findOne({
            restaurant_id: id
        });

        if (!restaurant) {
            return res.status(404).json({
                message: "Restaurant not found"
            });
        }

        res.json(restaurant);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to find restaurant"
        });
    }
});

app.post("/api/restaurants", async (req, res) => {
    try {
        const {
            name,
            cuisine,
            address,
            rating,
            contact
        } = req.body;

        if (!name || !cuisine || !address || !contact) {
            return res.status(400).json({
                message: "Please complete all required fields"
            });
        }

        const numericRating = Number(rating);

        if (
            Number.isNaN(numericRating) ||
            numericRating < 0 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                message: "Rating must be between 0 and 5"
            });
        }

        const lastRestaurant = await restaurants
            .find({})
            .sort({ restaurant_id: -1 })
            .limit(1)
            .toArray();

        const nextId =
            lastRestaurant.length > 0
                ? lastRestaurant[0].restaurant_id + 1
                : 1;

        const newRestaurant = {
            restaurant_id: nextId,
            name: name.trim(),
            cuisine: cuisine.trim(),
            address: address.trim(),
            rating: numericRating,
            contact: contact.trim()
        };

        await restaurants.insertOne(newRestaurant);

        res.status(201).json(newRestaurant);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to add restaurant"
        });
    }
});

app.put("/api/restaurants/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const {
            name,
            cuisine,
            address,
            rating,
            contact
        } = req.body;

        if (!name || !cuisine || !address || !contact) {
            return res.status(400).json({
                message: "Please complete all required fields"
            });
        }

        const numericRating = Number(rating);

        if (
            Number.isNaN(numericRating) ||
            numericRating < 0 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                message: "Rating must be between 0 and 5"
            });
        }

        const result = await restaurants.updateOne(
            { restaurant_id: id },
            {
                $set: {
                    name: name.trim(),
                    cuisine: cuisine.trim(),
                    address: address.trim(),
                    rating: numericRating,
                    contact: contact.trim()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Restaurant not found"
            });
        }

        const updatedRestaurant =
            await restaurants.findOne({
                restaurant_id: id
            });

        res.json(updatedRestaurant);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to update restaurant"
        });
    }
});

app.delete("/api/restaurants/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const result = await restaurants.deleteOne({
            restaurant_id: id
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Restaurant not found"
            });
        }

        res.json({
            message: "Restaurant deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to delete restaurant"
        });
    }
});

async function startServer() {
    try {
        await client.connect();

        const db = client.db(DB_NAME);
        restaurants = db.collection(COLLECTION_NAME);

        console.log("--------------------------------");
        console.log("Connected to MongoDB");
        console.log(`Database: ${DB_NAME}`);
        console.log(`Collection: ${COLLECTION_NAME}`);

        app.listen(PORT, () => {
            console.log("CULINA MONDE");
            console.log("Website is running!");
            console.log(`http://localhost:${PORT}`);
            console.log("--------------------------------");
        });
    } catch (error) {
        console.error("MongoDB connection failed:");
        console.error(error);
    }
}

startServer();