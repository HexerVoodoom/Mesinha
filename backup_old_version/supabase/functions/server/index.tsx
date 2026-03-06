import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Senhas fixas
const PASSWORDS: Record<string, string> = {
  'Amanda': 'Mateus',
  'Mateus': 'Amanda'
};

// Enable CORS for all routes and methods (must be first)
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

// Enable logger
app.use('*', logger(console.log));

// Global error handler
app.onError((err, c) => {
  console.error("Global error handler:", err);
  return c.json({ 
    error: "Internal server error", 
    message: err.message 
  }, 500);
});

// Health check endpoint
app.get("/make-server-19717bce/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Login endpoint - simples validação de senha
app.post("/make-server-19717bce/login", async (c) => {
  try {
    const body = await c.req.json();
    const { profile, password } = body;

    console.log(`[POST /login] Login attempt for: ${profile}`);

    if (!profile || !password) {
      return c.json({ error: "Perfil e senha são obrigatórios" }, 400);
    }

    // Validar se é Amanda ou Mateus
    if (profile !== 'Amanda' && profile !== 'Mateus') {
      return c.json({ error: "Perfil inválido" }, 400);
    }

    // Verificar senha
    if (PASSWORDS[profile] !== password) {
      console.log(`[POST /login] Senha incorreta para ${profile}`);
      return c.json({ error: "Senha incorreta" }, 401);
    }

    console.log(`[POST /login] Login bem-sucedido para ${profile}`);
    
    return c.json({ 
      success: true,
      profile: profile
    });
  } catch (error) {
    console.error("[POST /login] Login error:", error);
    return c.json({ 
      error: "Erro ao fazer login", 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// Get all items for a couple (WITHOUT photos for performance)
app.get("/make-server-19717bce/items", async (c) => {
  try {
    console.log('[GET /items] Fetching all items...');
    const items = await kv.getByPrefix("item:");
    console.log("[GET /items] Items fetched:", items?.length || 0);
    
    // Return items with proper structure
    const validItems = (items || []).filter(item => item && item.id);
    
    // CRITICAL: Remove photos from response to reduce payload size
    // Photos will be loaded separately on-demand
    const itemsWithoutPhotos = validItems.map(item => ({
      ...item,
      photo: item.photo ? 'HAS_PHOTO' : null, // Flag indicates photo exists
    }));
    
    // Limit to 500 items to prevent large responses
    const limitedItems = itemsWithoutPhotos.slice(0, 500);
    
    if (validItems.length > 500) {
      console.warn(`Items truncated from ${validItems.length} to 500`);
    }
    
    // Calculate response size
    const jsonString = JSON.stringify({ items: limitedItems });
    const sizeInKB = jsonString.length / 1024;
    console.log(`Response size: ${sizeInKB.toFixed(2)}KB`);
    
    // Return with explicit headers
    return c.json({ 
      items: limitedItems,
      total: validItems.length,
      truncated: validItems.length > 500
    }, 200, {
      'Content-Type': 'application/json; charset=utf-8',
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return c.json({ 
      error: "Failed to fetch items", 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// Get photo for a specific item
app.get("/make-server-19717bce/items/:id/photo", async (c) => {
  try {
    const itemId = c.req.param("id");
    const item = await kv.get(`item:${itemId}`);
    
    if (!item) {
      return c.json({ error: "Item not found" }, 404);
    }
    
    return c.json({ photo: item.photo || null });
  } catch (error) {
    console.error("Error fetching photo:", error);
    return c.json({ 
      error: "Failed to fetch photo", 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// Create a new item
app.post("/make-server-19717bce/items", async (c) => {
  try {
    const body = await c.req.json();
    const { title, comment, category, eventDate, photo, reminderEnabled, reminderFrequency, repeatCount, tags, createdBy } = body;
    
    if (!title || !category) {
      return c.json({ error: "Title and category are required" }, 400);
    }

    // Validate photo size (max 2MB base64 to prevent connection issues)
    if (photo && photo.length > 3000000) {
      console.warn("Photo rejected: too large");
      return c.json({ error: "Photo too large. Maximum size is 2MB. Please compress the image." }, 400);
    }

    const itemId = crypto.randomUUID();
    const item = {
      id: itemId,
      title: String(title).substring(0, 500),
      comment: comment ? String(comment).substring(0, 2000) : "",
      category,
      eventDate: eventDate || null,
      photo: photo || null,
      reminderEnabled: reminderEnabled || false,
      reminderFrequency: reminderFrequency === null ? null : (reminderFrequency || undefined),
      repeatCount: repeatCount !== undefined ? Number(repeatCount) : undefined,
      createdBy: createdBy || "Unknown",
      createdAt: new Date().toISOString(),
      status: "pending",
      tags: Array.isArray(tags) ? tags.slice(0, 20) : [],
      // Campos específicos para lembretes (categoria alarm)
      reminderTime: body.reminderTime || undefined,
      reminderDays: Array.isArray(body.reminderDays) ? body.reminderDays : undefined,
      reminderForMateus: body.reminderForMateus !== undefined ? body.reminderForMateus : undefined,
      reminderForAmanda: body.reminderForAmanda !== undefined ? body.reminderForAmanda : undefined,
      reminderActive: body.reminderActive !== undefined ? body.reminderActive : true,
    };

    await kv.set(`item:${itemId}`, item);
    console.log("Item created successfully:", itemId);
    return c.json({ item });
  } catch (error) {
    console.error("Error creating item:", error);
    return c.json({ 
      error: "Failed to create item", 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// Update an item
app.put("/make-server-19717bce/items/:id", async (c) => {
  try {
    const itemId = c.req.param("id");
    const body = await c.req.json();
    
    const existingItem = await kv.get(`item:${itemId}`);
    if (!existingItem) {
      return c.json({ error: "Item not found" }, 404);
    }

    // Validate photo size if being updated (max 2MB base64 to prevent connection issues)
    if (body.photo && body.photo.length > 3000000) {
      console.warn("Photo rejected: too large");
      return c.json({ error: "Photo too large. Maximum size is 2MB. Please compress the image." }, 400);
    }

    const updatedItem = {
      ...existingItem,
      ...body,
      id: itemId, // Ensure ID doesn't change
      repeatCount: body.repeatCount !== undefined ? Number(body.repeatCount) : existingItem.repeatCount,
      reminderFrequency: body.reminderFrequency === null ? null : (body.reminderFrequency !== undefined ? body.reminderFrequency : existingItem.reminderFrequency),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`item:${itemId}`, updatedItem);
    console.log("Item updated successfully:", itemId);
    return c.json({ item: updatedItem });
  } catch (error) {
    console.error("Error updating item:", error);
    return c.json({ 
      error: "Failed to update item", 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// Delete an item
app.delete("/make-server-19717bce/items/:id", async (c) => {
  try {
    const itemId = c.req.param("id");
    await kv.del(`item:${itemId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting item:", error);
    return c.json({ error: "Failed to delete item", details: String(error) }, 500);
  }
});

// Get couple settings
app.get("/make-server-19717bce/settings", async (c) => {
  try {
    const settings = await kv.get("settings") || {
      coupleName: "You & Partner",
      themeColor: "#81D8D0",
      notificationsEnabled: true,
    };
    return c.json({ settings });
  } catch (error) {
    console.log("Error fetching settings:", error);
    return c.json({ error: "Failed to fetch settings", details: String(error) }, 500);
  }
});

// Update couple settings
app.put("/make-server-19717bce/settings", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set("settings", body);
    return c.json({ settings: body });
  } catch (error) {
    console.log("Error updating settings:", error);
    return c.json({ error: "Failed to update settings", details: String(error) }, 500);
  }
});

// Serve the application
Deno.serve(app.fetch);
