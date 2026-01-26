## Finding and repairing products missing `seller_id`

If users hit "Missing seller for an item in your cart" it means one or more `products` rows have `seller_id` NULL/empty. Here are safe steps to find and optionally repair them.

1) List products missing `seller_id` (run in SQL editor / psql / Supabase SQL):

```sql
SELECT id, title, created_at
FROM products
WHERE seller_id IS NULL OR seller_id = '';
```

2) If those rows should be deleted or re-created by the seller, you can export the list and coordinate with the seller/admin.

3) If you want to set a placeholder seller (NOT recommended without verification), first identify a valid seller user id:

```sql
-- Pick a valid seller id from profiles
SELECT user_id, full_name, company_name
FROM profiles
LIMIT 10;
```

Then update products with a chosen seller id:

```sql
UPDATE products
SET seller_id = '<valid-seller-uuid>'
WHERE seller_id IS NULL OR seller_id = '';
```

4) Optional Node script using `@supabase/supabase-js` to list affected products (creates `scripts/find-missing-sellers.js`):

```js
// Usage: node scripts/find-missing-sellers.js
// Ensure SUPABASE_URL and SUPABASE_KEY are set in env

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

(async () => {
  const { data, error } = await supabase
    .from('products')
    .select('id, title, created_at')
    .is('seller_id', null);

  if (error) return console.error('Error fetching products', error);
  if (!data || data.length === 0) return console.log('No products with missing seller_id.');

  console.log('Products missing seller_id:');
  data.forEach(p => console.log(p.id, '-', p.title, '-', p.created_at));
})();
```

Notes
- Do not mass-assign a seller id unless you are sure about ownership.
- Better: coordinate with the marketplace admin or re-import valid product data.
- After fixing product rows, the checkout flow should work normally and users can re-add items.
