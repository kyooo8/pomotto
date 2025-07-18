import { render } from "hono/jsx/dom";
import { useEffect, useState } from "hono/jsx/";
import { SeatStatus } from "../types/SeatStatus.ts";

const Board = () => {
  const [data, setData] = useState<SeatStatus[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const fetchApi = async () => {
      const res = await fetch("http://localhost:8000/api/status");
      const d = await res.json();
      console.log("取得");
      setData(d);
    };
    fetchApi();
    const intervalId = setInterval(fetchApi, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {data.map((d: SeatStatus) => {
        let remaining = 0;

        if (d.startAt && d.status !== "IDLE") {
          const elapsed = now - new Date(d.startAt).getTime();
          remaining = Math.max(0, d.duration - elapsed);
        }

        const statusColor =
          d.status === "FOCUS"
            ? "bg-red-100 text-red-800"
            : d.status === "BREAK"
            ? "bg-blue-100 text-blue-800"
            : "bg-green-100 text-green-800";

        return (
          <tr
            key={d.seatId}
            class={`border-b hover:bg-amber-100 transition ${statusColor}`}
            onClick={() => (globalThis.location.href = `/seat/${d.seatId}`)}
          >
            <td class="px-4 py-2 font-semibold">{d.seatId}</td>
            <td class="px-4 py-2">
              {d.status === "FOCUS"
                ? "🟥 作業中"
                : d.status === "BREAK"
                ? "🟦 休憩中"
                : "🟩 未使用"}
            </td>
            <td class="px-4 py-2 font-mono tabular-nums text-right">
              {Math.floor(remaining / 60)}:
              {String(remaining % 60).padStart(2, "0")}
            </td>
            <td class="px-4 py-2 text-sm text-gray-500">
              {new Date(d.updatedAt).toLocaleTimeString()}
            </td>
          </tr>
        );
      })}
    </>
  );
};

const el = document.getElementById("board")!;
render(<Board />, el);
