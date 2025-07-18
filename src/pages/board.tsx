import { Hono } from "hono";
import { Layout } from "../components/Layout.tsx";

const board = new Hono();

board.get("/", (c) => {
  return c.html(
    <Layout title="board">
      <table class="w-full text-left border-collapse shadow-md rounded bg-white">
        <thead>
          <tr class="bg-gray-200 text-gray-800">
            <th class="px-4 py-2">シート</th>
            <th class="px-4 py-2">ステータス</th>
            <th class="px-4 py-2">残り時間</th>
            <th class="px-4 py-2">最終更新</th>
          </tr>
        </thead>
        <tbody id="board"></tbody>
      </table>
      <script type="module" src="/static/js/board.js"></script>
    </Layout>
  );
});

export default board;
