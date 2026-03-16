import { NextRequest, NextResponse } from "next/server";

// Supported video patterns
const VIDEO_PATTERNS = [
  { type: "youtube", regex: /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/ },
  { type: "vimeo", regex: /vimeo\.com\/(\d+)/ },
  { type: "twitch", regex: /twitch\.tv\// },
  { type: "dailymotion", regex: /dailymotion\.com\/video\// },
  { type: "soundcloud", regex: /soundcloud\.com\// },
  { type: "facebook", regex: /facebook\.com\/.*\/videos\// },
  { type: "streamable", regex: /streamable\.com\// },
  { type: "direct", regex: /\.(mp4|webm|ogg|m3u8)(\?.*)?$/i },
];

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function resolveVideoType(url: string): { type: string; id?: string } | null {
  for (const pattern of VIDEO_PATTERNS) {
    const match = url.match(pattern.regex);
    if (match) {
      return { type: pattern.type, id: match[1] || undefined };
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { valid: false, error: "URL é obrigatória" },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { valid: false, error: "URL inválida" },
        { status: 400 }
      );
    }

    const resolved = resolveVideoType(url);

    if (!resolved) {
      // Attempt as direct URL anyway — react-player might handle it
      return NextResponse.json({
        valid: true,
        type: "unknown",
        url,
        message: "URL não reconhecida, tentando reproduzir diretamente",
      });
    }

    return NextResponse.json({
      valid: true,
      type: resolved.type,
      id: resolved.id,
      url,
    });
  } catch {
    return NextResponse.json(
      { valid: false, error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}
