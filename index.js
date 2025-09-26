import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// --- Démo publique (menu/tables) ---
const MENU = [
  { id: "m1", name: "Margherita", price: 8.5, category: "Pizzas" },
  { id: "m2", name: "Regina",      price: 10.0, category: "Pizzas" },
  { id: "m3", name: "Cheeseburger",price: 12.0, category: "Burgers" },
  { id: "m4", name: "Frites",      price: 3.5,  category: "Sides" },
  { id: "m5", name: "Tiramisu",    price: 5.0,  category: "Desserts" },
  { id: "m6", name: "Coca 33cl",   price: 2.8,  category: "Boissons" }
];
const TABLES = ["T1","T2","T3","T4","T5"];

// --- État en mémoire (ok démo) ---
let ORDERS = []; // {id, table, location, items:[{id,name,price,qty}], total, status, ts}

// --- Health + data publique ---
app.get("/health", (req,res)=> res.json({ ok:true }));
app.get("/menu",   (req,res)=> res.json({ ok:true, data: MENU }));
app.get("/tables", (req,res)=> {
  const data = TABLES.map(t => ({ id: t, pending: 0, lastTicket: null }));
  res.json({ ok:true, data });
});

// --- Commandes ---
app.get("/orders", (req,res)=>{
  const data = ORDERS.filter(o => o.status === "pending").sort((a,b)=> a.ts - b.ts);
  res.json({ ok:true, data });
});

app.post("/orders", (req,res)=>{
  const { table, location, items, total } = req.body || {};
  if (!table || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ ok:false, error:"Bad payload" });
  }
  const id = "o_" + Date.now() + "_" + Math.random().toString(36).slice(2,7);
  ORDERS.push({
    id, table, location: location || null, items,
    total: Number(total) || 0, status: "pending", ts: Date.now()
  });
  res.json({ ok:true, id });
});

app.patch("/orders/:id/pay", (req,res)=>{
  const o = ORDERS.find(x => x.id === req.params.id);
  if (!o) return res.status(404).json({ ok:false, error:"Not found" });
  o.status = "paid";
  res.json({ ok:true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log("Orders API running on :"+PORT));
