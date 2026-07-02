export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Headers untuk mengizinkan respons dalam bentuk JSON
    const jsonHeaders = { "Content-Type": "application/json" };

    // 1. CREATE: Tambah data (POST /api/user)
    if (method === 'POST' && path === '/api/user') {
      try {
        const { nama, sandi, status } = await request.json();
        if (!nama || !sandi || !status) {
          return new Response(JSON.stringify({ error: "Semua field wajib diisi" }), { status: 400, headers: jsonHeaders });
        }
        await env.DB.prepare("INSERT INTO id (nama, sandi, status) VALUES (?, ?, ?)")
          .bind(nama, sandi, status).run();
        return new Response(JSON.stringify({ message: "Data berhasil disimpan" }), { status: 201, headers: jsonHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: jsonHeaders });
      }
    }

    // 2. READ ALL: Ambil semua data (GET /api/user)
    if (method === 'GET' && path === '/api/user') {
      try {
        const { results } = await env.DB.prepare("SELECT * FROM id").all();
        return new Response(JSON.stringify(results), { status: 200, headers: jsonHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: jsonHeaders });
      }
    }

    // 3. READ ONE: Ambil satu data berdasarkan ID (GET /api/user/:id)
    if (method === 'GET' && path.startsWith('/api/user/')) {
      const id = path.split('/').pop();
      try {
        const result = await env.DB.prepare("SELECT * FROM id WHERE id = ?").bind(id).first();
        if (!result) return new Response(JSON.stringify({ error: "Data tidak ditemukan" }), { status: 404, headers: jsonHeaders });
        return new Response(JSON.stringify(result), { status: 200, headers: jsonHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: jsonHeaders });
      }
    }

    return new Response("Not Found", { status: 404 });
  }
};
