export default function CheckEmailPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-rind/20 bg-white p-8 text-center shadow-sm">
        <p className="text-4xl">📬</p>
        <h1 className="mt-3 text-xl font-bold text-rind-dark">
          이메일을 확인해주세요
        </h1>
        <p className="mt-2 text-sm text-foreground/60">
          가입하신 이메일로 인증 링크를 보냈어요. 링크를 클릭하면 로그인할 수
          있어요.
        </p>
      </div>
    </div>
  );
}
