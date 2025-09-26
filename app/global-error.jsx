"use client";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export default function GlobalError({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-500">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Something went wrong!
        </h2>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
