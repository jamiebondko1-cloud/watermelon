"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// 좋아요 누르기 / 취소 (이미 눌렀으면 취소, 아니면 추가)
export async function toggleLike(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const productId = formData.get("product_id") as string;

  // 이미 좋아요를 눌렀는지 확인
  const { data: existing } = await supabase
    .from("product_likes")
    .select("product_id")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    // 이미 눌렀으면 취소
    await supabase
      .from("product_likes")
      .delete()
      .eq("product_id", productId)
      .eq("user_id", user.id);
  } else {
    // 안 눌렀으면 추가
    await supabase
      .from("product_likes")
      .insert({ product_id: productId, user_id: user.id });
  }

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
}

// 댓글 달기
export async function addComment(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const productId = formData.get("product_id") as string;
  const content = (formData.get("content") as string)?.trim();

  if (!content) {
    redirect(`/products/${productId}?error=` + encodeURIComponent("댓글 내용을 입력해주세요."));
  }

  const nickname =
    (user.user_metadata?.nickname as string) ?? user.email ?? "익명";

  const { error } = await supabase.from("product_comments").insert({
    product_id: productId,
    user_id: user.id,
    author_nickname: nickname,
    content,
  });

  if (error) {
    redirect(`/products/${productId}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  redirect(`/products/${productId}`);
}

// 댓글 삭제 (본인 댓글만)
export async function deleteComment(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const commentId = formData.get("comment_id") as string;
  const productId = formData.get("product_id") as string;

  await supabase
    .from("product_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  redirect(`/products/${productId}`);
}
