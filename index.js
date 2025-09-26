import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// --- Menu ---
const MENU = [
  { id: "m1", name: "Margherita", price: 8.5, category: "Pizzas" },
  { id: "m2", name: "Regina", price: 10.0, category: "Pizzas" },
  { id: "m3", name: "Cheeseburger", price: 12.0, category: "Burgers" },
  { id: "m4", name: "Frites", price: 3.5, category: "Sides" },
  { id: "m5", name: "Tiramisu", price: 5.0, category: "Desserts" },
  { id: "m6", name: "Coca 33cl", price: 2.8, category: "Boissons" }
];

const TABLES = ["T1", "T2", "T3", "T4", "T5"];

// --- État mémoire ---
let ORDERS = [];

// --- Endpoints ---
app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/MENU', (req, res) => res.json({ ok: true, data: MENU }));

app.get('/tables', (req, res) => {
  const data = TABLES.map(t => {
    const last = ORDERS.filter(o => o.table === t).slice(-1)[0] || null;
    return { id: t, pending: ORDERS.filter(o => o.table === t && o.status === "pending").length, lastTicket: last };
  });
  res.json({ ok: true, data });
});

// --- Commandes ---
app.get('/orders', (req, res) => res.json({ ok: true, data: ORDERS }));

app.post('/orders', (req, res) => {
  const { table, location, items } = req.body || {};
  if (!table || !items?.length) {
    return res.status(400).json({ ok: false, error: "Bad payload" });
  }
  const order = {
    id: "o" + (ORDERS.length + 1),
    table,
    location: location || null,
    items,
    total: items.reduce((s, it) => s + it.price * it.qty, 0),
    status: "pending",
    ts: Date.now()
  };
  ORDERS.push(order);
  res.json({ ok: true, order });
});

app.patch('/orders/:id/pay', (req, res) => {
  const o = ORDERS.find(x => x.id === req.params.id);
  if (!o) return res.status(404).json({ ok: false, error: "Not found" });
  o.status = "paid";
  res.json({ ok: true });
});

// --- Résumé staff ---
app.get('/staff/summary', (req, res) => {
  const summary = ORDERS.map(o => ({
    table: o.table,
    items: o.items,
    total: o.total,
    status: o.status,
    ts: o.ts
  }));
  res.json({ ok: true, tickets: summary });
});

// --- Serveur ---
app.listen(4000, () => console.log("API v1.1 listening on 4000"));
