"use client";
import React from "react";

function MainComponent() {
    const handleSignOut = async () => {
      await signOut({
        callbackUrl: "/",
        redirect: true,
      });
    };
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#003366] p-4">
        <div className="w-full max-w-md rounded-2xl border border-[#FFD700] bg-[#004080] p-8 shadow-xl">
          <h1 className="mb-8 text-center text-3xl font-bold text-[#FFD700]">
            Déconnexion
          </h1>
  
          <button
            onClick={handleSignOut}
            className="w-full rounded-lg bg-[#FFD700] px-4 py-3 text-base font-medium text-[#003366] transition-colors hover:bg-[#FFD700]/80 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-offset-2 disabled:opacity-50"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }
  
  
  