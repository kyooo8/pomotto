import { Hono } from "hono";
import { Layout } from "../../components/Layout.tsx";

const seat = new Hono();

seat.get("/:id", (c) => {
  const seatId = c.req.param("id");
  return c.html(
    <Layout title={`seat:${seatId}`}>
      <div id="timer" data-seat-id={seatId}></div>
      <script type="module" src="/static/js/timer.js"></script>
    </Layout>
  );
});

export default seat;
