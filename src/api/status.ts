import { Hono } from "hono";
import { SeatStatus, Status } from "../types/SeatStatus.ts";

const api = new Hono();

const seatMemory = new Map<string, SeatStatus>();

// seatMemoryの初期化
["A1", "A2", "A3"].forEach((id) => {
  seatMemory.set(id, {
    seatId: id,
    status: "IDLE",
    startAt: null,
    duration: 0,
    updatedAt: new Date().toISOString(),
  });
});

api.get("/status", (c) => {
  return c.json([...seatMemory.values()]);
});

api.get("/status/:seatId", (c) => {
  const seatId = c.req.param("seatId");
  const seat = seatMemory.get(seatId);
  if (!seat) return c.notFound();
  return c.json(seat);
});

api.post("/status/:seatId", async (c) => {
  const seatId = c.req.param("seatId");
  const body = await c.req.json();

  const status = body.status as Status;
  const duration = body.duration as number;

  if (!seatMemory.has(seatId)) return c.notFound();

  const updated: SeatStatus = {
    seatId: seatId,
    status,
    startAt:
      status === "IDLE" ? null : body.startAt ?? new Date().toISOString(),
    duration: status === "IDLE" ? 0 : duration,
    updatedAt: new Date().toISOString(),
  };

  seatMemory.set(seatId, updated);

  // TODO WebSocketでブロードキャスト

  return c.json(updated);
});

export default api;
