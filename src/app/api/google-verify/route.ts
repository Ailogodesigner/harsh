export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return new Response("Not Found", { status: 404 });
  }

  // Google Search Console expects the file content to be: google-site-verification: google<id>.html
  return new Response(`google-site-verification: google${id}.html`, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

