import { Hono } from "hono";
import api from "./api/status.ts";
import seat from "./pages/seat/[id].tsx";
import { serveStatic } from "hono/deno";
import board from "./pages/board.tsx";
import { logger } from "hono/logger";

const app = new Hono();

app.use(
  "/static/*",
  serveStatic({
    root: "./src",
    rewriteRequestPath: (path) => path.replace(/^\/static/, "/static"),
  })
);
app.use("/api/*", logger());

app.route("/api", api);
app.route("/seat", seat);
app.route("/", board);

Deno.serve(app.fetch);
