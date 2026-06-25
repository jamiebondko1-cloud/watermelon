import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <div className="flex flex-1 flex-col items-center">
      <section className="watermelon-stripes flex w-full flex-col items-center px-5 py-20 text-center text-white">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          🍉 수박마켓
        </h1>
        <p className="mt-4 max-w-md text-lg text-white/90">
          우리 동네 중고거래, 시원하게 한입에 베어 물듯
        </p>
      </section>

      <section className="flex w-full max-w-md flex-col items-center gap-3 px-5 py-10 text-center">
        {user ? (
          <>
            <span className="seed-dot" />
            <p className="text-lg font-semibold text-rind-dark">
              {(user.user_metadata?.nickname as string) ?? user.email}님,
              환영해요!
            </p>
            <p className="text-sm text-foreground/60">
              로그인이 정상적으로 완료되었습니다.
            </p>
          </>
        ) : (
          <>
            <p className="text-foreground/70">
              로그인하고 동네 거래를 시작해보세요.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
