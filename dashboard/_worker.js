// Locks TRoyGO's command centre behind HTTP Basic Auth at the edge, before
// any static file is served — same pattern as TRoyAI's
// dashboard.troyaiagent.com. troytravelagency.com is a separate deployment
// and stays fully public; this only applies to this Pages project.
export default {
  async fetch(request, env) {
    const auth = request.headers.get("Authorization");

    if (auth) {
      const [scheme, encoded] = auth.split(" ");
      if (scheme === "Basic" && encoded) {
        let decoded = "";
        try {
          decoded = atob(encoded);
        } catch {
          // fall through to 401
        }
        const idx = decoded.indexOf(":");
        const user = idx === -1 ? decoded : decoded.slice(0, idx);
        const pass = idx === -1 ? "" : decoded.slice(idx + 1);
        if (user === env.DASHBOARD_USER && pass === env.DASHBOARD_PASS) {
          return env.ASSETS.fetch(request);
        }
      }
    }

    return new Response("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="TRoyGO Command Centre"' },
    });
  },
};
