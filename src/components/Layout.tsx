import { FC } from "hono/jsx";

type LayoutProps = {
  title: string;
  children: any;
};

export const Layout: FC<LayoutProps> = (props) => {
  return (
    <html>
      <head>
        <title>{props.title}</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="/static/style.css" rel="stylesheet"></link>
      </head>
      <body class="bg-amber-50 text-gray-900 font-sans p-8">
        {props.children}
      </body>
    </html>
  );
};
