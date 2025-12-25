import { NextResponse } from "next/server";
import { getCurriculum } from "@/lib/curriculum";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const jenjang = searchParams.get("jenjang");
    const kelas = searchParams.get("kelas");

    if (!jenjang || !kelas) {
        return NextResponse.json(
            { error: "INVALID_INPUT" },
            { status: 400 }
        );
    }

    const data = getCurriculum(jenjang, kelas);

    return NextResponse.json(data);
}
