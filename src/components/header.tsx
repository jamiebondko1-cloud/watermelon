import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <header className="sticky top-0 z-10 border-b border-rind-dark/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-rind-dark">
          <span className="text-2xl">🍉</span>
          수박마켓
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="hidden text-foreground/70 sm:inline">
                {(user.user_metadata?.nickname as string) ?? user.email}님
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full border border-rind-dark/20 px-4 py-1.5 font-medium text-rind-dark transition hover:bg-rind-dark/10"
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-1.5 font-medium text-rind-dark transition hover:bg-rind-dark/10"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-flesh px-4 py-1.5 font-semibold text-white shadow-sm transition hover:bg-flesh-dark"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
