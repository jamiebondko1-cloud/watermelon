import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProduct } from "@/app/products/actions";

export default async function EditProductPage({
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

  if (!user) {
    redirect("/login");
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, seller_id, title, description, price, status")
    .eq("id", id)
    .single();

  if (!product) {
    notFound();
  }

  // 작성자 본인이 아니면 상세 페이지로 돌려보냄
  if (product.seller_id !== user.id) {
    redirect(`/products/${id}`);
  }

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-5 py-8">
      <h1 className="text-2xl font-bold text-rind-dark">🍉 판매글 수정</h1>

      {error && (
        <p className="mt-4 rounded-lg bg-flesh/10 px-3 py-2 text-sm text-flesh-dark">
          {error}
        </p>
      )}

      <form action={updateProduct} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="id" value={product.id} />

        <label className="flex flex-col gap-1 text-sm font-medium text-rind-dark">
          제목
          <input
            type="text"
            name="title"
            required
            defaultValue={product.title}
            className="rounded-lg border border-rind/30 px-3 py-2 text-foreground outline-none focus:border-rind"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-rind-dark">
          가격 (원)
          <input
            type="number"
            name="price"
            required
            min={0}
            step={100}
            defaultValue={product.price}
            className="rounded-lg border border-rind/30 px-3 py-2 text-foreground outline-none focus:border-rind"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-rind-dark">
          설명
          <textarea
            name="description"
            rows={6}
            defaultValue={product.description}
            className="resize-none rounded-lg border border-rind/30 px-3 py-2 text-foreground outline-none focus:border-rind"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-rind-dark">
          판매 상태
          <select
            name="status"
            defaultValue={product.status}
            className="rounded-lg border border-rind/30 px-3 py-2 text-foreground outline-none focus:border-rind"
          >
            <option value="selling">판매중</option>
            <option value="sold">판매완료</option>
          </select>
        </label>

        <div className="mt-2 flex items-center gap-3">
          <button
            type="submit"
            className="flex-1 rounded-full bg-flesh px-4 py-2.5 font-semibold text-white transition hover:bg-flesh-dark"
          >
            수정 완료
          </button>
          <Link
            href={`/products/${product.id}`}
            className="rounded-full border border-rind-dark/20 px-4 py-2.5 font-medium text-rind-dark transition hover:bg-rind-dark/10"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
