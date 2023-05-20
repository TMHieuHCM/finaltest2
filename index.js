const express = require("express");
const { connectToDb, db } = require("./db.js");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

app.listen(3000, () => {
  console.log("App is running at 3000");
  connectToDb();
});

// câu 5
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Token is required" });
  }

  try {
    const decoded = jwt.verify(token, "secret");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// câu 2
app.get("/api/inventory", verifyToken, async (req, res) => {
  try {
    const products = await db.inventories.find().toArray();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// câu 3
app.get("/api/inventory/low", async (req, res) => {
  try {
    const products = await db.inventories
      .find({ instock: { $lt: 100 } })
      .toArray();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// câu 4
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.users.findOne({
      username: username,
      password: password,
    });
    if (user) {
      const token = jwt.sign({ username: username }, "secret", {
        expiresIn: "24h",
      });
      res.json({ token: token });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// câu 6
app.get("/api/orders", verifyToken, async (req, res) => {
  try {
    const orders = await db.orders.find().toArray();
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const products = await db.products
          .find({ _id: { $in: order.products } })
          .toArray();
        const orderWithProducts = {
          ...order,
          products: products,
        };
        return orderWithProducts;
      })
    );
    res.json(populatedOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
