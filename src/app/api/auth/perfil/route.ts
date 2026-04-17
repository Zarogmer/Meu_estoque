import { requireAuth } from '@/lib/auth';
import { db, usuarios } from '@/lib/db';
import { NextResponse } from 'next/server';
import { eq, and, ne } from 'drizzle-orm';
import { isDemoMode } from '@/lib/demo-data';

function sanitize(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

// Keeps only digits, so "(11) 91234-5678" is stored as "11912345678"
function digitsOnly(value: unknown): string | null {
  const sanitized = sanitize(value);
  if (!sanitized) return null;
  const digits = sanitized.replace(/\D/g, '');
  return digits.length === 0 ? null : digits;
}

// Accepts "@fulano" or "fulano"; stores without the "@"
function normalizeInstagram(value: unknown): string | null {
  const sanitized = sanitize(value);
  if (!sanitized) return null;
  return sanitized.replace(/^@+/, '');
}

export async function PATCH(request: Request) {
  if (isDemoMode) {
    return NextResponse.json(
      { error: 'Edição de perfil indisponível no modo demo' },
      { status: 400 }
    );
  }

  try {
    const auth = await requireAuth();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 });
    }

    const data = body as Record<string, unknown>;

    const nome = sanitize(data.nome);
    if (!nome) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const emailRaw = sanitize(data.email);
    if (!emailRaw) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }
    const email = emailRaw.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    // Make sure email is not used by someone else
    const [emailOwner] = await db
      .select({ id: usuarios.id })
      .from(usuarios)
      .where(and(eq(usuarios.email, email), ne(usuarios.id, auth.userId)))
      .limit(1);

    if (emailOwner) {
      return NextResponse.json(
        { error: 'Este email já está em uso por outra conta' },
        { status: 409 }
      );
    }

    const telefone = digitsOnly(data.telefone);
    const whatsapp = digitsOnly(data.whatsapp);
    const instagram = normalizeInstagram(data.instagram);

    const [updated] = await db
      .update(usuarios)
      .set({ nome, email, telefone, whatsapp, instagram })
      .where(eq(usuarios.id, auth.userId))
      .returning({
        id: usuarios.id,
        nome: usuarios.nome,
        email: usuarios.email,
        telefone: usuarios.telefone,
        whatsapp: usuarios.whatsapp,
        instagram: usuarios.instagram,
      });

    if (!updated) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: updated.id,
        nome: updated.nome,
        email: updated.email,
        telefone: updated.telefone ?? '',
        whatsapp: updated.whatsapp ?? '',
        instagram: updated.instagram ?? '',
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Não autorizado') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
