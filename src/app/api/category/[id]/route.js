import db from "../../../lib/db/connection.js";

export const runtime = "nodejs";

// GET ONE
export async function GET(request, { params }) {
  const record = db
    .prepare("SELECT * FROM category WHERE id = ?")
    .get(params.id);

  if (!record) {
    return Response.json({ message: "Not found" }, { status: 404 });
  }

  return Response.json({ data: record });
}

// UPDATE
export async function PUT(request, { params }) {
  const body = await request.json();
  const { name, description, mp3, image, active } = body;

  db.prepare(`
    UPDATE category
    SET name = ?, description = ?, mp3 = ?, image = ?, active = ?
    WHERE id = ?
  `).run(name, description, mp3, image, active, params.id);

  const updated = db
    .prepare("SELECT * FROM category WHERE id = ?")
    .get(params.id);

  return Response.json({ data: updated });
}

// DELETE
export async function DELETE(request, { params }) {
  db.prepare("DELETE FROM category WHERE id = ?")
    .run(params.id);

  return Response.json({ data: { id: Number(params.id) } });
}
