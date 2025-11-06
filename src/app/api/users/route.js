import fs from "fs";
import path from "path";
import Fuse from "fuse.js";
import { LRUCache as LRU } from "lru-cache"; // ✅ Fixed import

// Cache dataset in memory
const cache = new LRU({ max: 1 });
let fuse; // Fuse.js index for search

// Load users from JSON and cache them
async function loadUsers() {
  if (cache.has("users")) return cache.get("users");

  const file = path.join(process.cwd(), "public", "users.json");
  const raw = fs.readFileSync(file, "utf8");
  const users = JSON.parse(raw);
  cache.set("users", users);
  return users;
}

// Next.js 16 API Route
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const city = (searchParams.get("city") || "").toLowerCase();
    const occupation = (searchParams.get("occupation") || "").toLowerCase();
    const email = (searchParams.get("email") || "").toLowerCase();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const perPage = 50;

    const users = await loadUsers();

    // Build Fuse index once and reuse
    if (!fuse) {
      fuse = new Fuse(users, {
        keys: ["name", "email", "city"],
        threshold: 0.3,
      });
    }

    // Search with Fuse
    let results = q ? fuse.search(q).map((r) => r.item) : users;

    // Filter by city, occupation, email
    if (city) results = results.filter((u) => u.city.toLowerCase() === city);
    if (occupation)
      results = results.filter((u) => u.occupation.toLowerCase() === occupation);
    if (email)
      results = results.filter((u) =>
        u.email.toLowerCase().includes(email)
      );

    const total = results.length;
    const start = (page - 1) * perPage;
    const paged = results.slice(start, start + perPage);

    return new Response(JSON.stringify({ total, page, items: paged }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
