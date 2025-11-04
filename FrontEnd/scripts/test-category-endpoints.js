const axios = require('axios');

function short(obj) {
  try { return JSON.stringify(obj, null, 2); } catch (e) { return String(obj); }
}

(async function run() {
  const base = process.env.BASE || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7000';
  console.log('Using base URL:', base);
  const client = axios.create({ baseURL: base, timeout: 10000, validateStatus: () => true });
  // If an API token is provided in the environment, attach it to all requests
  if (process.env.API_TOKEN) {
    client.defaults.headers.common['Authorization'] = `Bearer ${process.env.API_TOKEN}`;
    console.log('Using Authorization Bearer token from API_TOKEN env (hidden)');
  }
    // if API_TOKEN is provided, send it as Authorization Bearer
    if (process.env.API_TOKEN) {
      client.defaults.headers = client.defaults.headers || {};
      client.defaults.headers['Authorization'] = `Bearer ${process.env.API_TOKEN}`;
      console.log('Using Authorization Bearer token from API_TOKEN');
    }

  try {
    console.log('\n1) Fetching category list: GET /catalog/api/categories');
    const list = await client.get('/catalog/api/categories');
    console.log('-> status:', list.status);
    console.log('-> headers:', list.headers);
    console.log('-> body sample:', Array.isArray(list.data) ? list.data.slice(0,3) : list.data);

    if (!Array.isArray(list.data) || list.data.length === 0) {
      console.error('No categories returned, cannot continue tests.');
      process.exit(1);
    }

    const first = list.data[0];
    // pick id from common shapes
    const id = first.CategoryId ?? first.categoryId ?? first.Id ?? first.id;
    console.log('\nPicked id for tests:', id);
    if (typeof id === 'undefined') {
      console.error('Could not determine id/key shape from first item:', short(first));
      process.exit(1);
    }

    const variants = [
      `/catalog/api/categories(${id})`,
      `/catalog/api/categories(CategoryId=${id})`,
      `/catalog/api/categories('${id}')`,
      `/catalog/api/categories/${id}`,
      `/catalog/api/categories?CategoryId=${id}`,
      `/catalog/api/categories?id=${id}`,
      `/catalog/api/categories?key=${id}`,
      // admin variants (some services expose admin endpoints)
      `/catalog/api/categories/admin(${id})`,
      `/catalog/api/categories/admin/${id}`,
      `/catalog/api/categories/admin?CategoryId=${id}`,
      `/catalog/api/categories/admin?id=${id}`,
      `/catalog/api/categories/admin?key=${id}`,
    ];

    const methods = ['get', 'put', 'delete', 'options'];

    for (const method of methods) {
      console.log(`\n=== Trying method ${method.toUpperCase()} for variants ===`);
      for (const v of variants) {
        try {
          const opts = { method, url: v };
          if (method === 'put') {
            opts.data = { CategoryName: `test-updated-${Date.now()}`, Description: 'diag-test' };
            opts.headers = { 'Content-Type': 'application/json' };
          }

          const r = await client.request(opts);
          console.log(`\n[${method.toUpperCase()}] ${v}`);
          console.log('status:', r.status);
          console.log('allow header:', r.headers && (r.headers.allow || r.headers.Allow));
          console.log('headers snippet:', Object.fromEntries(Object.entries(r.headers).slice(0,8)));
          console.log('body:', typeof r.data === 'string' ? r.data : short(r.data));
        } catch (err) {
          console.error(`Error requesting ${method.toUpperCase()} ${v}:`, err.message);
        }
      }
    }

    console.log('\nDone.');
  } catch (err) {
    console.error('Fatal error:', err);
    process.exitCode = 2;
  }
})();
