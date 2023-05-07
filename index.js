const express = require("express");
const { connectToDb, db } = require("./db");

const app = express();

app.listen(3000, () => {
  console.log("App is running at 3000");
  connectToDb();
});
app.get("/api/inventory", async (req, res) => {
  try {
    const products = await db.inventories.find().toArray();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/api/inventory/low", async (req, res) => {
  try {
    const products = await db.inventories.find({ instock: { $lt: 100 } }).toArray();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});