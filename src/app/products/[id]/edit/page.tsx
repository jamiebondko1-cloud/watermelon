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
    .select("id, seller_id, title, description, price, status, image_path")
    .eq("id", id)
    .single();

  if (!product) {
    notFound();
  }

  // 작성자 본인이 아니면 상세 페이지로 돌려보냄
  if (product.seller_id !== user.id) {
    redirect(`/products/${id}`);
  }

  const imageUrl = product.image_path
    ? supabase.storage.from("product-images").getPublicUrl(product.image_path)
        .data.publicUrl
    : null;

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

        <div className="flex flex-col gap-2 text-sm font-medium text-rind-dark">
          사진
          {imageUrl && (
            <div className="flex flex-col gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={product.title}
                className="max-h-48 w-full rounded-lg border border-rind/20 object-contain"
              />
              <label className="flex items-center gap-2 font-normal text-foreground/70">
                <input type="checkbox" name="remove_image" />
                현재 사진 삭제
              </label>
            </div>
          )}
          <input
            type="file"
            name="image"
            accept="image/*"
            className="rounded-lg border border-rind/30 px-3 py-2 text-sm font-normal text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-flesh/10 file:px-3 file:py-1 file:text-flesh-dark outline-none focus:border-rind"
          />
          <span className="font-normal text-xs text-foreground/50">
            새 사진을 선택하면 기존 사진이 교체돼요.
          </span>
        </div>

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
