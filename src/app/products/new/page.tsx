import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createProduct } from "@/app/products/actions";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-5 py-8">
      <h1 className="text-2xl font-bold text-rind-dark">🍉 판매글 쓰기</h1>

      {error && (
        <p className="mt-4 rounded-lg bg-flesh/10 px-3 py-2 text-sm text-flesh-dark">
          {error}
        </p>
      )}

      <form action={createProduct} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-rind-dark">
          제목
          <input
            type="text"
            name="title"
            required
            placeholder="예) 거의 새것인 자전거 팝니다"
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
            placeholder="예) 50000"
            className="rounded-lg border border-rind/30 px-3 py-2 text-foreground outline-none focus:border-rind"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-rind-dark">
          사진 (선택)
          <input
            type="file"
            name="image"
            accept="image/*"
            className="rounded-lg border border-rind/30 px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-flesh/10 file:px-3 file:py-1 file:text-flesh-dark outline-none focus:border-rind"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-rind-dark">
          설명
          <textarea
            name="description"
            rows={6}
            placeholder="상품 상태, 거래 방법 등을 자유롭게 적어주세요."
            className="resize-none rounded-lg border border-rind/30 px-3 py-2 text-foreground outline-none focus:border-rind"
          />
        </label>

        <div className="mt-2 flex items-center gap-3">
          <button
            type="submit"
            className="flex-1 rounded-full bg-flesh px-4 py-2.5 font-semibold text-white transition hover:bg-flesh-dark"
          >
            등록하기
          </button>
          <Link
            href="/products"
            className="rounded-full border border-rind-dark/20 px-4 py-2.5 font-medium text-rind-dark transition hover:bg-rind-dark/10"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
