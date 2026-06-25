import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ProductsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("id, title, price, status, created_at, image_path")
    .order("created_at", { ascending: false });

  const imageUrlOf = (path: string | null) =>
    path
      ? supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl
      : null;

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-rind-dark">🍉 판매글</h1>
        {user && (
          <Link
            href="/products/new"
            className="rounded-full bg-flesh px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-flesh-dark"
          >
            글쓰기
          </Link>
        )}
      </div>

      {!products || products.length === 0 ? (
        <p className="mt-12 text-center text-foreground/60">
          아직 등록된 판매글이 없어요.
          {user ? " 첫 판매글을 올려보세요!" : " 로그인하고 판매글을 올려보세요!"}
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/products/${product.id}`}
                className="flex items-center gap-4 rounded-2xl border border-rind/20 bg-white px-5 py-4 shadow-sm transition hover:border-rind/50"
              >
                {imageUrlOf(product.image_path) ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={imageUrlOf(product.image_path)!}
                    alt={product.title}
                    className="h-16 w-16 shrink-0 rounded-lg border border-rind/15 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-rind/10 text-2xl">
                    🍉
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-1">
                  <span className="font-semibold text-rind-dark">
                    {product.title}
                  </span>
                  <span className="text-sm text-foreground/50">
                    {new Date(product.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-flesh-dark">
                    {product.price.toLocaleString("ko-KR")}원
                  </span>
                  {product.status === "sold" && (
                    <span className="rounded-full bg-rind-dark/10 px-2 py-0.5 text-xs font-medium text-rind-dark">
                      판매완료
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
