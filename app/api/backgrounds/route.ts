import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase.storage
      .from("backgrounds")
      .list("", {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error("Supabase list error:", error);
      return NextResponse.json(
        { error: "Failed to list backgrounds" },
        { status: 500 }
      );
    }

    const backgrounds = (data ?? []).map((file) => ({
      name: file.name,
      url: supabase.storage.from("backgrounds").getPublicUrl(file.name).data.publicUrl,
      created_at: file.created_at,
      size: file.metadata?.size,
      type: file.metadata?.mimetype
    }));

    return NextResponse.json({ backgrounds });
  } catch (error) {
    console.error("List backgrounds error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
