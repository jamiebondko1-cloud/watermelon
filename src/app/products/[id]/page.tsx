import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteProduct } from "@/app/products/actions";
import {
  toggleLike,
  addComment,
  deleteComment,
} from "@/app/products/interactions";

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
    .select("id, seller_id, title, description, price, status, created_at, image_path")
    .eq("id", id)
    .single();

  if (!product) {
    notFound();
  }

  const isOwner = user?.id === product.seller_id;

  const imageUrl = product.image_path
    ? supabase.storage.from("product-images").getPublicUrl(product.image_path)
        .data.publicUrl
    : null;

  // 좋아요 개수
  const { count: likeCount } = await supabase
    .from("product_likes")
    .select("*", { count: "exact", head: true })
    .eq("product_id", id);

  // 현재 로그인한 사용자가 이 글에 좋아요를 눌렀는지
  let likedByMe = false;
  if (user) {
    const { data: myLike } = await supabase
      .from("product_likes")
      .select("product_id")
      .eq("product_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    likedByMe = !!myLike;
  }

  // 댓글 목록 (오래된 순)
  const { data: comments } = await supabase
    .from("product_comments")
    .select("id, user_id, author_nickname, content, created_at")
    .eq("product_id", id)
    .order("created_at", { ascending: true });

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

        {imageUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={product.title}
              className="mt-4 max-h-96 w-full rounded-xl border border-rind/15 object-contain"
            />
          </>
        )}

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

      {/* 좋아요 버튼 */}
      <div className="mt-5 flex items-center gap-3">
        <form action={toggleLike}>
          <input type="hidden" name="product_id" value={product.id} />
          <button
            type="submit"
            className={`flex items-center gap-2 rounded-full border px-5 py-2 font-medium transition ${
              likedByMe
                ? "border-flesh bg-flesh/10 text-flesh-dark"
                : "border-rind-dark/20 text-rind-dark hover:bg-rind-dark/10"
            }`}
          >
            <span>{likedByMe ? "❤️" : "🤍"}</span>
            좋아요 {likeCount ?? 0}
          </button>
        </form>

        {isOwner && (
          <>
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
          </>
        )}
      </div>

      {/* 댓글 영역 */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-rind-dark">
          댓글 {comments?.length ?? 0}
        </h2>

        {user ? (
          <form action={addComment} className="mt-3 flex flex-col gap-2">
            <input type="hidden" name="product_id" value={product.id} />
            <textarea
              name="content"
              required
              rows={3}
              placeholder="댓글을 남겨보세요."
              className="resize-none rounded-lg border border-rind/30 px-3 py-2 text-foreground outline-none focus:border-rind"
            />
            <button
              type="submit"
              className="self-end rounded-full bg-flesh px-5 py-2 font-semibold text-white transition hover:bg-flesh-dark"
            >
              댓글 등록
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-foreground/60">
            댓글을 쓰려면{" "}
            <Link href="/login" className="font-semibold text-rind-dark">
              로그인
            </Link>
            이 필요해요.
          </p>
        )}

        <ul className="mt-5 flex flex-col gap-4">
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <li
                key={comment.id}
                className="rounded-xl border border-rind/15 bg-white px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-rind-dark">
                    {comment.author_nickname}
                  </span>
                  <span className="text-xs text-foreground/40">
                    {new Date(comment.created_at).toLocaleString("ko-KR")}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-foreground/90">
                  {comment.content}
                </p>
                {user?.id === comment.user_id && (
                  <form action={deleteComment} className="mt-2">
                    <input type="hidden" name="comment_id" value={comment.id} />
                    <input type="hidden" name="product_id" value={product.id} />
                    <button
                      type="submit"
                      className="text-xs text-foreground/50 transition hover:text-flesh-dark"
                    >
                      삭제
                    </button>
                  </form>
                )}
              </li>
            ))
          ) : (
            <li className="text-sm text-foreground/50">
              아직 댓글이 없어요. 첫 댓글을 남겨보세요!
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
