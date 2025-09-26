"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getDefaultLandingPage } from "@/lib/rbac";
import { LeftArrow, HomeIcon } from "./icon";

const ForbiddenContent = () => {
  const router = useRouter();
  const { user } = useAuth();

  const handleGoBack = () => {
    router.back();
  };

  const handleTakeMeHome = () => {
    const landingPage = getDefaultLandingPage(user);
    router.push(landingPage);
  };

  return (
    <div
      className="min-h-dvh flex items-center justify-center relative"
      style={{
        background:
          "radial-gradient(40.82% 42.04% at 78.69% 74.73%, #EBECFF 0%, #F8FAFC 100%)",
      }}
    >
      {/* Main Content Container */}
      <div className="w-full max-w-4xl px-5 py-24 md:px-20 lg:px-20">
        <div className="flex flex-col gap-16 items-center justify-center">
          <div className="flex flex-col gap-12 items-center justify-start max-w-[720px] w-full">
            {/* Error Content */}
            <div className="flex flex-col gap-8 items-start justify-start text-center w-full">
              <div className="flex flex-col gap-6 items-start justify-start w-full">
                {/* 403 Error Label */}
                <div className="font-bold text-2xl text-indigo-500 tracking-[-0.288px] w-full">
                  <p className="leading-8">403 Forbidden</p>
                </div>

                {/* Main Heading - Responsive text sizes */}
                <div className="font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-slate-800 tracking-[-0.72px] md:tracking-[-1.44px] w-full">
                  <p className="leading-normal md:leading-[80px]">
                    Access Denied!
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="font-medium text-lg sm:text-xl text-slate-600 w-full">
                <p className="leading-normal">
                  You don't have permission to access this resource. This area
                  is restricted to administrators only.
                </p>
              </div>
            </div>

            {/* Action Buttons - Responsive layout */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-start justify-start w-full md:w-auto">
              {/* Go Back Button */}
              <button
                onClick={handleGoBack}
                className="flex gap-3 items-center justify-center px-6 py-4 rounded-full border border-slate-200 hover:border-slate-500 transition-colors duration-200 group w-full md:w-auto"
              >
                <LeftArrow
                  width={24}
                  height={24}
                  fill="currentColor"
                  className="text-slate-600 group-hover:text-slate-800"
                />
                <span className="font-semibold text-lg text-slate-600 group-hover:text-slate-800 whitespace-nowrap">
                  Go Back
                </span>
              </button>

              {/* Take Me Home Button */}
              <button
                onClick={handleTakeMeHome}
                className="flex gap-3 items-center justify-center px-6 py-4 rounded-full bg-indigo-500 hover:bg-indigo-500-60 transition-colors duration-200 group w-full md:w-auto"
              >
                <span className="font-semibold text-lg text-white whitespace-nowrap">
                  Take Me Home
                </span>
                <HomeIcon
                  width={24}
                  height={24}
                  fill="currentColor"
                  className="text-white"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenContent;
