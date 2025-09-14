import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const crops = await prisma.crop.findMany({
            orderBy: { name: "asc" }, // optional: sort alphabetically
        });
        return NextResponse.json(crops);
    } catch (error) {
        console.error("Error fetching crops:", error);
        return NextResponse.json({ error: "Failed to fetch crops :" + error }, { status: 500 });
    }
}

