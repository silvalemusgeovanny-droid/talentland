const counterKeys = {
  repairs: "repairNumber",
  sales: "saleNumber",
  products: "productNumber",
} as const;

type CounterKey = keyof typeof counterKeys;

async function getCounter(ctx: any, key: CounterKey) {
  return await ctx.db
    .query("consecutivos")
    .withIndex("by_key", (q: any) => q.eq("key", counterKeys[key]))
    .unique();
}

async function getMaximumNumber(ctx: any, table: string, field: string) {
  const rows = await ctx.db.query(table).collect();
  return rows.reduce((max: number, row: any) => Math.max(max, Number(row[field]) || 0), 0);
}

export async function nextNumber(ctx: any, key: CounterKey, table: string, field: string) {
  const counter = await getCounter(ctx, key);
  const current = Math.max(
    Number(counter?.value) || 0,
    await getMaximumNumber(ctx, table, field),
  );
  const next = current + 1;

  if (counter) {
    await ctx.db.patch(counter._id, { value: next, updatedAt: new Date().toISOString() });
  } else {
    await ctx.db.insert("consecutivos", {
      key: counterKeys[key],
      value: next,
      updatedAt: new Date().toISOString(),
    });
  }
  return next;
}

export async function syncNumber(ctx: any, key: CounterKey, value: number) {
  const normalized = Math.max(0, Math.trunc(Number(value) || 0));
  const counter = await getCounter(ctx, key);
  if (counter && Number(counter.value) >= normalized) return;

  if (counter) {
    await ctx.db.patch(counter._id, { value: normalized, updatedAt: new Date().toISOString() });
  } else {
    await ctx.db.insert("consecutivos", {
      key: counterKeys[key],
      value: normalized,
      updatedAt: new Date().toISOString(),
    });
  }
}
