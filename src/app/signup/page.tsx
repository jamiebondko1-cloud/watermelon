import Link from "next/link";
import { signUp } from "@/app/auth/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-rind/20 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-rind-dark">
          🍉 회원가입
        </h1>
        <p className="mt-1 text-center text-sm text-foreground/60">
          몇 초 만에 가입하고 거래를 시작해요
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-flesh/10 px-3 py-2 text-center text-sm text-flesh-dark">
            {error}
          </p>
        )}

        <form action={signUp} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-rind-dark">
            닉네임
            <input
              type="text"
              name="nickname"
              required
              maxLength={20}
              placeholder="수박맛집사장님"
              className="rounded-lg border border-rind/30 px-3 py-2 text-foreground outline-none focus:border-rind"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-rind-dark">
            이메일
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="rounded-lg border border-rind/30 px-3 py-2 text-foreground outline-none focus:border-rind"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-rind-dark">
            비밀번호
            <input
              type="password"
              name="password"
              required
              minLength={6}
              placeholder="6자 이상 입력해주세요"
              className="rounded-lg border border-rind/30 px-3 py-2 text-foreground outline-none focus:border-rind"
            />
          </label>

          <button
            type="submit"
            className="mt-2 rounded-full bg-flesh px-4 py-2.5 font-semibold text-white transition hover:bg-flesh-dark"
          >
            가입하기
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/60">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-semibold text-rind-dark">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
