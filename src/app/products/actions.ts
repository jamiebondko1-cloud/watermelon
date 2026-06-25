"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "product-images";

// 업로드된 이미지를 보관함에 저장하고, 저장된 위치(경로)를 돌려줌
async function uploadImage(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    throw new Error("사진 업로드에 실패했어요: " + error.message);
  }

  return path;
}

// 보관함에서 이미지 삭제 (실패해도 전체 동작은 막지 않음)
async function removeImage(supabase: SupabaseClient, path: string | null) {
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

// 판매글 등록 (Create)
export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() ?? "";
  const price = Number(formData.get("price"));
  const image = formData.get("image") as File | null;

  if (!title) {
    redirect("/products/new?error=" + encodeURIComponent("제목을 입력해주세요."));
  }
  if (!Number.isFinite(price) || price < 0) {
    redirect(
      "/products/new?error=" + encodeURIComponent("가격을 올바르게 입력해주세요.")
    );
  }

  // 사진이 선택된 경우에만 업로드
  let imagePath: string | null = null;
  if (image && image.size > 0) {
    try {
      imagePath = await uploadImage(supabase, user.id, image);
    } catch (e) {
      redirect(
        "/products/new?error=" +
          encodeURIComponent(e instanceof Error ? e.message : "사진 업로드 실패")
      );
    }
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      seller_id: user.id,
      title,
      description,
      price,
      image_path: imagePath,
    })
    .select("id")
    .single();

  if (error) {
    // 글 저장에 실패하면 방금 올린 사진도 정리
    await removeImage(supabase, imagePath);
    redirect("/products/new?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/products");
  redirect(`/products/${data.id}`);
}

// 판매글 수정 (Update)
export async function updateProduct(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() ?? "";
  const price = Number(formData.get("price"));
  const status = (formData.get("status") as string) ?? "selling";
  const image = formData.get("image") as File | null;
  const removeCurrent = formData.get("remove_image") === "on";

  if (!title) {
    redirect(
      `/products/${id}/edit?error=` + encodeURIComponent("제목을 입력해주세요.")
    );
  }
  if (!Number.isFinite(price) || price < 0) {
    redirect(
      `/products/${id}/edit?error=` +
        encodeURIComponent("가격을 올바르게 입력해주세요.")
    );
  }

  // 현재 글의 사진 위치 확인 (본인 글만)
  const { data: current } = await supabase
    .from("products")
    .select("image_path")
    .eq("id", id)
    .eq("seller_id", user.id)
    .single();

  let imagePath: string | null = current?.image_path ?? null;
  const oldPath = current?.image_path ?? null;

  if (image && image.size > 0) {
    // 새 사진 업로드 → 새 경로로 교체
    try {
      imagePath = await uploadImage(supabase, user.id, image);
    } catch (e) {
      redirect(
        `/products/${id}/edit?error=` +
          encodeURIComponent(e instanceof Error ? e.message : "사진 업로드 실패")
      );
    }
  } else if (removeCurrent) {
    // 사진 삭제 선택
    imagePath = null;
  }

  const { error } = await supabase
    .from("products")
    .update({
      title,
      description,
      price,
      status: status === "sold" ? "sold" : "selling",
      image_path: imagePath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) {
    redirect(`/products/${id}/edit?error=` + encodeURIComponent(error.message));
  }

  // 사진이 바뀌었으면 이전 사진은 보관함에서 정리
  if (oldPath && oldPath !== imagePath) {
    await removeImage(supabase, oldPath);
  }

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  redirect(`/products/${id}`);
}

// 판매글 삭제 (Delete)
export async function deleteProduct(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const id = formData.get("id") as string;

  // 글에 달린 사진 위치를 먼저 확인 (본인 글만)
  const { data: current } = await supabase
    .from("products")
    .select("image_path")
    .eq("id", id)
    .eq("seller_id", user.id)
    .single();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) {
    redirect(`/products/${id}?error=` + encodeURIComponent(error.message));
  }

  // 글이 지워졌으면 사진도 보관함에서 정리
  await removeImage(supabase, current?.image_path ?? null);

  revalidatePath("/products");
  redirect("/products");
}
