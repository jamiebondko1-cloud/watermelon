import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "@/app/products/actions";

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: product } = await supabase
    .from("products")
    .select("id, seller_id, title, description, price, status, created_at")
    .eq("id", id)
    .single();

  if (!product) {
    notFound();
  }

  const isOwner = user?.id === product.seller_id;

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
      <Link
        href="/products"
        className="text-sm text-foreground/60 transition hover:text-rind-dark"
      >
        ← 목록으로
      </Link>

      {error && (
        <p className="mt-4 rounded-lg bg-flesh/10 px-3 py-2 text-sm text-flesh-dark">
          {error}
        </p>
      )}

      <article className="mt-4 rounded-2xl border border-rind/20 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-rind-dark">{product.title}</h1>
          {product.status === "sold" && (
            <span className="shrink-0 rounded-full bg-rind-dark/10 px-3 py-1 text-sm font-medium text-rind-dark">
              판매완료
            </span>
          )}
        </div>

        <p className="mt-2 text-2xl font-extrabold text-flesh-dark">
          {product.price.toLocaleString("ko-KR")}원
        </p>

        <p className="mt-1 text-sm text-foreground/50">
          {new Date(product.created_at).toLocaleString("ko-KR")}
        </p>

        <hr className="my-5 border-rind/15" />

        <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
          {product.description || "작성된 설명이 없습니다."}
        </p>
      </article>

      {isOwner && (
        <div className="mt-5 flex items-center gap-3">
          <Link
            href={`/products/${product.id}/edit`}
            className="rounded-full border border-rind-dark/20 px-5 py-2 font-medium text-rind-dark transition hover:bg-rind-dark/10"
          >
            수정
          </Link>
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={product.id} />
            <button
              type="submit"
              className="rounded-full border border-flesh/40 px-5 py-2 font-medium text-flesh-dark transition hover:bg-flesh/10"
            >
              삭제
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
