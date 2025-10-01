"use client";

import Image from "next/image";

const ResetPasswordLoading = () => (
  <div className="bg-slate-50 min-h-dvh flex items-center justify-center relative">
    {/* Desktop Design */}
    <div className="hidden md:block bg-white relative rounded-[24px] w-[607px] max-w-full mx-4">
      <div className="flex flex-col items-center justify-end overflow-clip relative">
        <div className="box-border flex gap-2.5 items-center justify-center p-[45px] relative w-full">
          <div className="basis-0 flex flex-col gap-10 grow items-center justify-start min-h-px min-w-px relative w-full">
            {/* Logo */}
            <div className="bg-center bg-contain bg-no-repeat h-[45px] w-[223px]">
              <Image
                src="/guestpost-link.webp"
                alt="PR Report Logo"
                width={223}
                height={45}
                priority={true}
                className="object-contain"
              />
            </div>

            {/* Loading State */}
            <div className="flex flex-col gap-6 items-center justify-center relative w-full">
              <div className="reset-password-spinner" />
              <div className="flex flex-col gap-2.5 items-center justify-start leading-[0] not-italic relative text-center w-full">
                <div className="font-['Inter',_sans-serif] font-semibold relative text-[24px] text-slate-800 w-full">
                  <p className="leading-[24.2px]">Verifying Reset Link</p>
                </div>
                <div className="font-['Inter',_sans-serif] font-medium relative text-[16px] text-slate-600 w-full">
                  <p className="leading-[normal]">Please wait while we verify your reset link...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-slate-200 border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_0px_0px_8px_rgba(255,255,255,0.25),0px_990px_277px_0px_rgba(0,0,0,0),0px_634px_253px_0px_rgba(0,0,0,0.01),0px_356px_214px_0px_rgba(0,0,0,0.05),0px_158px_158px_0px_rgba(0,0,0,0.09),0px_40px_87px_0px_rgba(0,0,0,0.1)]"
      />
    </div>

    {/* Mobile Design */}
    <div className="md:hidden basis-0 bg-[rgba(255,255,255,0.99)] grow h-[777px] min-h-px min-w-px relative shrink-0">
      <div className="flex flex-col h-[777px] items-center justify-center overflow-clip relative w-full">
        <div className="box-border flex gap-2.5 items-center justify-center px-5 py-[45px] relative w-full">
          <div className="basis-0 flex flex-col gap-10 grow items-center justify-start min-h-px min-w-px relative w-full">
            {/* Logo */}
            <div className="bg-center bg-contain bg-no-repeat h-[45px] w-[223px]">
              <Image
                src="/guestpost-link.webp"
                alt="PR Report Logo"
                width={223}
                height={45}
                priority={true}
                className="object-contain"
              />
            </div>

            {/* Loading State */}
            <div className="flex flex-col gap-6 items-center justify-center relative w-full">
              <div className="reset-password-spinner" />
              <div className="flex flex-col gap-2.5 items-center justify-start leading-[0] not-italic relative text-center w-full">
                <div className="font-['Inter',_sans-serif] font-semibold relative text-[24px] text-slate-800 w-full">
                  <p className="leading-[24.2px]">Verifying Reset Link</p>
                </div>
                <div className="font-['Inter',_sans-serif] font-medium relative text-[16px] text-slate-600 w-full">
                  <p className="leading-[normal]">Please wait while we verify your reset link...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-slate-200 border-solid inset-0 pointer-events-none" />
    </div>
  </div>
);

export default ResetPasswordLoading;
