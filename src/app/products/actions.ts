"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  if (!title) {
    redirect("/products/new?error=" + encodeURIComponent("제목을 입력해주세요."));
  }
  if (!Number.isFinite(price) || price < 0) {
    redirect(
      "/products/new?error=" + encodeURIComponent("가격을 올바르게 입력해주세요.")
    );
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      seller_id: user.id,
      title,
      description,
      price,
    })
    .select("id")
    .single();

  if (error) {
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

  const { error } = await supabase
    .from("products")
    .update({
      title,
      description,
      price,
      status: status === "sold" ? "sold" : "selling",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) {
    redirect(`/products/${id}/edit?error=` + encodeURIComponent(error.message));
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

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) {
    redirect(`/products/${id}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/products");
  redirect("/products");
}
