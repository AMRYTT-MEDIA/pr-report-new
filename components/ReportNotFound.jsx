import React from "react";

function ReportNotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
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
                {/* 404 Error Label */}
                <div className="font-bold text-2xl text-indigo-500 tracking-[-0.288px] w-full">
                  <p className="leading-8">Report Not Found</p>
                </div>

                {/* Main Heading - Responsive text sizes */}
                <div className="font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-slate-800 tracking-[-0.72px] md:tracking-[-1.44px] w-full">
                  <p className="leading-normal md:leading-[80px]">
                    Oops! We Can't Find That Report.
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="font-medium text-lg sm:text-xl text-slate-600 w-full">
                <p className="leading-normal">
                  Unfortunately, the report you're looking for is gone or has
                  been moved :(.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportNotFound;
