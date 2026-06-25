import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // 서버로 보낼 수 있는 데이터 크기 한도 (사진 업로드를 위해 기본 1MB → 10MB로 늘림)
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
