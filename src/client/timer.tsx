import { render } from "hono/jsx/dom";
import { useEffect, useState } from "hono/jsx";
import { Status } from "../types/SeatStatus.ts";

const Timer = ({ seatId }: { seatId: string }) => {
  const focusTime = 3 * 60;
  const breakTime = 1 * 60;

  const [time, setTime] = useState(focusTime); // 残り時間
  const [duration, setDuration] = useState(focusTime); // セッション全体の長さ
  const [running, setRunning] = useState(false);
  const [startAt, setStartAt] = useState<Date | null>(null);
  const [status, setStatus] = useState<Status>("IDLE");

  useEffect(() => {
    const fetchInitialStatus = async () => {
      const res = await fetch(`/api/status/${seatId}`);
      if (!res.ok) return;

      const data = await res.json();

      setStatus(data.status);
      setDuration(data.duration);
      setStartAt(data.startAt ? new Date(data.startAt) : null);

      if (data.status === "FOCUS" || data.status === "BREAK") {
        const elapsed = Math.floor(
          (Date.now() - new Date(data.startAt).getTime()) / 1000
        );
        const remaining = Math.max(data.duration - elapsed, 0);
        setTime(remaining);
        if (remaining > 0) {
          setRunning(true);
        }
      } else {
        setTime(focusTime);
      }
    };

    fetchInitialStatus();
  }, []);

  useEffect(() => {
    if (!running || !startAt) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startAt.getTime()) / 1000);
      const remaining = Math.max(duration - elapsed, 0);
      setTime(remaining);

      if (remaining === 0) {
        setRunning(false);

        if (status === "FOCUS") {
          // 自動でBREAKに切り替え
          const now = new Date();
          setStatus("BREAK");
          setStartAt(now);
          setDuration(breakTime);
          setRunning(true);
          fetch(`/api/status/${seatId}`, {
            method: "POST",
            body: JSON.stringify({
              status: "BREAK",
              startAt: now.toISOString(),
              duration: breakTime,
            }),
          });
        } else if (status === "BREAK") {
          // 自動でFOCUSに戻る
          const now = new Date();
          setStatus("FOCUS");
          setStartAt(now);
          setDuration(focusTime);
          setRunning(true);
          fetch(`/api/status/${seatId}`, {
            method: "POST",
            body: JSON.stringify({
              status: "FOCUS",
              startAt: now.toISOString(),
              duration: focusTime,
            }),
          });
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [running, startAt, status, duration]);

  const toggle = async () => {
    if (running) {
      await fetch(`/api/status/${seatId}`, {
        method: "POST",
        body: JSON.stringify({
          status: "STOP",
          duration: time,
        }),
      });
      setRunning(false);
    } else {
      const now = new Date();
      await fetch(`/api/status/${seatId}`, {
        method: "POST",
        body: JSON.stringify({
          status: "FOCUS",
          duration: time,
          startAt: now.toISOString(),
        }),
      });
      setRunning(true);
      setStartAt(now);
      setStatus("FOCUS");
      setDuration(time); // 開始時点の残り時間を duration として固定
    }
  };

  const reset = async () => {
    await fetch(`/api/status/${seatId}`, {
      method: "POST",
      body: JSON.stringify({ status: "IDLE" }),
    });
    setRunning(false);
    setStartAt(null);
    setStatus("IDLE");
    setTime(focusTime);
    setDuration(focusTime);
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div class="max-w-md mx-auto mt-12 p-6 bg-white shadow-md rounded text-center space-y-6">
      <h2 class="text-2xl font-bold text-gray-800">
        {seatId} - {status}
      </h2>

      <p class="text-5xl font-mono text-gray-900 tracking-wide">{fmt(time)}</p>

      <div class="flex justify-center gap-4">
        <button
          type="button"
          onClick={toggle}
          class={`px-4 py-2 rounded text-white font-semibold ${
            running
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {running ? "停止" : "開始"}
        </button>

        <button
          type="button"
          onClick={reset}
          class="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white font-semibold"
        >
          終了（リセット）
        </button>
      </div>
    </div>
  );
};

const el = document.getElementById("timer")!;
const seatId = el?.dataset?.seatId || "Unknown";
render(<Timer seatId={seatId} />, el);
