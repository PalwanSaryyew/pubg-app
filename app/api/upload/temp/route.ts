// /app/api/upload/temp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, access, mkdir } from "fs/promises";
import { constants } from "fs";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files provided." }, { status: 400 });
        }

        const tempDir = path.join(process.cwd(), "temp");
        // Ensure temp directory exists
        try {
            await access(tempDir, constants.F_OK);
        } catch {
            await mkdir(tempDir, { recursive: true });
        }

        const uploadedFileNames: string[] = [];

        for (const file of files) {
            if (file.size === 0) continue;
            
            const buffer = Buffer.from(await file.arrayBuffer());
            // Create a unique filename
            const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
            const filepath = path.join(tempDir, filename);

            await writeFile(filepath, buffer);
            uploadedFileNames.push(filename);
        }

        return NextResponse.json({ uploadedFileNames });

    } catch (error) {
        console.error("Temp upload error:", error);
        return NextResponse.json({ error: "File upload failed." }, { status: 500 });
    }
}
