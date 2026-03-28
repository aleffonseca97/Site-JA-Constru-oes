import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import path from "path";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET_NAME;
const publicBase = process.env.R2_PUBLIC_URL ?? process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

function requireEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) throw new Error(`Variável de ambiente ausente: ${name}`);
  return value.trim().replace(/\/$/, "");
}

export function isR2Configured(): boolean {
  return Boolean(
    accountId?.trim() &&
      accessKeyId?.trim() &&
      secretAccessKey?.trim() &&
      bucket?.trim() &&
      publicBase?.trim()
  );
}

function getClient(): S3Client {
  const id = requireEnv("R2_ACCOUNT_ID", accountId);
  return new S3Client({
    region: "auto",
    endpoint: `https://${id}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID", accessKeyId),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY", secretAccessKey),
    },
  });
}

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

/**
 * Envia o arquivo ao bucket R2 e devolve a URL pública.
 */
export async function uploadProdutoImagem(file: File): Promise<{ url: string; key: string }> {
  if (!isR2Configured()) {
    throw new Error("R2 não configurado (R2_ACCOUNT_ID, chaves, bucket e R2_PUBLIC_URL).");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Arquivo muito grande (máx. 8 MB).");
  }
  const type = file.type || "application/octet-stream";
  if (!ALLOWED.has(type)) {
    throw new Error("Tipo de arquivo não permitido. Use JPEG, PNG, WebP, GIF ou AVIF.");
  }

  const ext = path.extname(file.name) || (type === "image/png" ? ".png" : ".jpg");
  const key = `produtos/${Date.now()}-${Math.random().toString(36).slice(2, 12)}${ext}`;
  const body = Buffer.from(await file.arrayBuffer());
  const client = getClient();

  await client.send(
    new PutObjectCommand({
      Bucket: requireEnv("R2_BUCKET_NAME", bucket),
      Key: key,
      Body: body,
      ContentType: type,
    })
  );

  const base = requireEnv("R2_PUBLIC_URL ou NEXT_PUBLIC_R2_PUBLIC_URL", publicBase);
  const url = `${base}/${key}`;
  return { url, key };
}

/**
 * Remove objetos do bucket a partir das URLs públicas (mesmo host do R2, prefixo produtos/).
 * Ignora URLs externas ou antigas (/uploads local). Falhas são logadas, não interrompem o fluxo.
 */
export async function deleteR2ObjectsForUrls(urls: string[]): Promise<void> {
  if (!isR2Configured() || urls.length === 0) return;
  let publicHost: string;
  try {
    publicHost = new URL(requireEnv("R2_PUBLIC_URL ou NEXT_PUBLIC_R2_PUBLIC_URL", publicBase)).hostname;
  } catch {
    return;
  }
  const bucketName = requireEnv("R2_BUCKET_NAME", bucket);
  const client = getClient();

  await Promise.allSettled(
    urls.map(async (url) => {
      try {
        const u = new URL(url);
        if (u.hostname !== publicHost) return;
        const key = u.pathname.replace(/^\//, "");
        if (!key.startsWith("produtos/")) return;
        await client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
          })
        );
      } catch (e) {
        console.warn("[R2] Falha ao excluir objeto:", url, e);
      }
    })
  );
}
