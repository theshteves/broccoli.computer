const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers,
      });
    }

    try {
      const { email, website } = await request.json();

			if (website) {
				return new Response("ok");  // GOTCHA! Honey-pot for bots
			}

      if (!email || !email.includes("@")) {
        return new Response("Invalid email", {
          status: 400,
          headers,
        });
      }

      await env.DB
        .prepare(
          "INSERT OR IGNORE INTO subscribers (email) VALUES (?)"
        )
        .bind(email.trim().toLowerCase())
        .run();

      return Response.json(
        { ok: true },
        { headers }
      );
    } catch {
      return new Response("Bad request", {
        status: 400,
        headers,
      });
    }
  },
};
