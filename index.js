import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// --- MENU DEMO ---
const MENU = [
  { id: "m1", name: "Margherita", price: 8.5, category: "Pizzas" },
  { id: "m2", name: "Regina",     price: 10.0, category: "Pizzas" },
  { id: "m3", name: "Cheeseburger", price: 12.0, category: "Burgers" },
  { id: "m4", name: "Frites",     price: 3.5, category: "Sides" },
  { id: "m5", name: "Tiramisu",   price: 5.0, category: "Desserts" },
  { id: "m6", name: "Coca 33cl",  price: 2.8, category: "Boissons" }
];

const TABLES = ["T1","T2","T3","T4","T5"];

// --- ÉTAT EN MÉMOIRE ---
let ORDERS = []; // { id, table, location, items[{id,name,price,qty}], total, status, ts }

// --- HEALTH ---
app.get("/health", (req,res) => res.json({ ok: true }));

// --- PUBLIC ---
app.get("/MENU", (req,res) => res.json({ ok: true, data: MENU }));

app.get("/tables", (req,res) => {
  const data = TABLES.map(t => {
    const pendingCount = ORDERS.filter(o => o.table === t && o.status === "pending").length;
    const last = ORDERS.filter(o => o.table === t).slice(-1)[0] || null;
    return { id: t, pending: pendingCount, lastTicket: last };
  });
  res.json({ ok: true, data });
});

// --- COMMANDES ---
app.get("/orders", (req,res) => res.json({ ok: true, data: ORDERS }));

app.post("/orders", (req,res) => {
  const { table, location, items } = req.body || {};
  if (!table || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ ok: false, error: "bad payload" });
  }
  const total = items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0), 0);
  const order = {
    id: "o" + (ORDERS.length + 1),
    table,
    location: location || null,
    items,
    total,
    status: "pending",
    ts: Date.now()
  };
  ORDERS.push(order);
  res.json({ ok: true, order });
});

app.patch("/orders/:id/pay", (req,res) => {
  const o = ORDERS.find(x => x.id === req.params.id);
  if (!o) return res.status(404).json({ ok: false, error: "not found" });
  o.status = "paid";
  res.json({ ok: true });
});

// --- STAFF SUMMARY ---
app.get("/staff/summary", (req,res) => {
  try {
    const tickets = ORDERS.map(o => ({
      table: o.table,
      items: o.items,
      total: o.total,
      status: o.status,
      ts: o.ts
    }));
    res.json({ ok: true, tickets });
  } catch (e) {
    console.error("summary error", e);
    res.status(500).json({ ok: false, error: "server error" });
  }
});

// --- SERVER ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));
