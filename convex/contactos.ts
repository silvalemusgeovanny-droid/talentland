import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const contactArgs = {
  sourceId: v.optional(v.string()),
  googleResourceName: v.optional(v.string()),
  name: v.string(),
  phone: v.string(),
  email: v.string(),
  notes: v.string(),
  createdAt: v.string(),
  updatedAt: v.string(),
};

function normalizeContact(contact: any) {
  const now = new Date().toISOString();
  return {
    sourceId: contact.sourceId || undefined,
    googleResourceName: contact.googleResourceName || undefined,
    name: String(contact.name || "").trim(),
    phone: String(contact.phone || "").trim(),
    email: String(contact.email || "").trim(),
    notes: String(contact.notes || "").trim(),
    createdAt: contact.createdAt || now,
    updatedAt: contact.updatedAt || now,
  };
}

function normalizePhone(value: string) {
  return String(value || "").replace(/\D/g, "");
}

async function findExistingContact(ctx: any, contact: ReturnType<typeof normalizeContact>) {
  if (contact.googleResourceName) {
    const existingGoogle = await ctx.db
      .query("contactos")
      .withIndex("by_google_resource_name", (q: any) => q.eq("googleResourceName", contact.googleResourceName))
      .unique();
    if (existingGoogle) return existingGoogle;
  }

  if (contact.sourceId) {
    const existingSource = await ctx.db
      .query("contactos")
      .withIndex("by_source_id", (q: any) => q.eq("sourceId", contact.sourceId))
      .unique();
    if (existingSource) return existingSource;
  }

  const phone = normalizePhone(contact.phone);
  if (!phone) return null;

  const contacts = await ctx.db.query("contactos").take(1000);
  return contacts.find((item: any) => normalizePhone(item.phone) === phone) || null;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const contacts = await ctx.db.query("contactos").take(1000);
    return contacts.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const create = mutation({
  args: contactArgs,
  handler: async (ctx, args) => {
    const contact = normalizeContact(args);
    if (!contact.name || !contact.phone) throw new Error("Nombre y telefono son obligatorios.");

    const existing = await findExistingContact(ctx, contact);
    if (existing) {
      await ctx.db.patch(existing._id, { ...contact, updatedAt: new Date().toISOString() });
      return existing._id;
    }

    return await ctx.db.insert("contactos", contact);
  },
});

export const update = mutation({
  args: {
    id: v.id("contactos"),
    patch: v.object({
      googleResourceName: v.optional(v.string()),
      name: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      notes: v.optional(v.string()),
      updatedAt: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Contacto no encontrado.");
    await ctx.db.patch(args.id, {
      ...args.patch,
      updatedAt: args.patch.updatedAt || new Date().toISOString(),
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("contactos"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const importBatch = mutation({
  args: {
    contacts: v.array(v.object(contactArgs)),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of args.contacts) {
      const contact = normalizeContact(item);
      if (!contact.name || !contact.phone) {
        skipped += 1;
        continue;
      }

      const existing = await findExistingContact(ctx, contact);

      if (existing) {
        await ctx.db.patch(existing._id, { ...contact, updatedAt: new Date().toISOString() });
        updated += 1;
      } else {
        await ctx.db.insert("contactos", contact);
        inserted += 1;
      }
    }

    return { inserted, updated, skipped };
  },
});
