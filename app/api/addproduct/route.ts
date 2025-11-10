import { validateTelegramInitData } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

function validateStringField(value: unknown, name: string, min = 1, max = 1000) {
  if (typeof value !== "string") {
    return `${name} must be a string`;
  }
  if (value.trim().length < min) {
    return `${name} must be at least ${min} characters`;
  }
  if (value.trim().length > max) {
    return `${name} must be at most ${max} characters`;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Helper to validate initData using your function
    const checkInitData = async (maybeInitData: unknown) => {
      if (!maybeInitData) return { ok: false, message: "initData is required" };
      try {
        // Eğer initData JSON string ise parse et
        const init = typeof maybeInitData === "string" ? JSON.parse(maybeInitData) : maybeInitData;
        const valid = await validateTelegramInitData(init);
        if (!valid) return { ok: false, message: "initData validation failed" };
        return { ok: true, value: init };
      } catch (e) {
        return { ok: false, message: "initData is invalid JSON or validation threw" };
      }
    };

    // CASE 1: JSON payload (application/json)
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { initData, title, description } = body ?? {};

      const initCheck = await checkInitData(initData);
      if (!initCheck.ok) {
        return NextResponse.json({ error: initCheck.message }, { status: 401 });
      }

      const titleErr = validateStringField(title, "title", 3, 100);
      if (titleErr) return NextResponse.json({ error: titleErr }, { status: 400 });

      if (description !== undefined && description !== null) {
        const descErr = validateStringField(description, "description", 10, 5000);
        if (descErr) return NextResponse.json({ error: descErr }, { status: 400 });
      }

      console.log("Received JSON product submission:", {
        initData: initCheck.value,
        title: (title as string).trim(),
        description: typeof description === "string" ? description.trim() : null,
      });

      return NextResponse.json({ ok: true, message: "JSON payload validated" }, { status: 200 });
    }

    // CASE 2: multipart/form-data (FormData with files)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const initDataRaw = formData.get("initData");
      const titleRaw = formData.get("title");
      const descriptionRaw = formData.get("description");

      const initCheck = await checkInitData(initDataRaw);
      if (!initCheck.ok) return NextResponse.json({ error: initCheck.message }, { status: 401 });

      const title = typeof titleRaw === "string" ? titleRaw : titleRaw ? String(titleRaw) : null;
      const titleErr = validateStringField(title, "title", 3, 100);
      if (titleErr) return NextResponse.json({ error: titleErr }, { status: 400 });

      const description =
        typeof descriptionRaw === "string" ? descriptionRaw : descriptionRaw ? String(descriptionRaw) : undefined;
      if (description) {
        const descErr = validateStringField(description, "description", 10, 5000);
        if (descErr) return NextResponse.json({ error: descErr }, { status: 400 });
      }

      // images alanını kontrol et (input name="images" olarak gönderildiğini varsayıyoruz)
      const images = formData.getAll("images");
      if (!images || images.length === 0) {
        return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
      }

      // Konsola yazdırma: file meta bilgileri dahil
      const imageSummaries = images.map((file, i) => {
        if (file instanceof Blob) {
          return { index: i, type: file.type, size: file.size };
        }
        return { index: i, type: typeof file, value: String(file).slice(0, 100) };
      });

      console.log("Received multipart product submission:", {
        initData: initCheck.value,
        title: title!.trim(),
        description: description ? description.trim() : null,
        images: imageSummaries,
      });

      return NextResponse.json({ ok: true, message: "FormData validated" }, { status: 200 });
    }

    // Desteklenmeyen Content-Type
    return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
  } catch (err) {
    console.error("Error in /api/addProduct route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}