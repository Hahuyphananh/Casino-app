"use client";
import React from "react";

function MainComponent() {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
  
    const { signInWithCredentials } = useAuth();
  
    const onSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
  
      if (!email || !password) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }
  
      try {
        await signInWithCredentials({
          email,
          password,
          callbackUrl: "/",
          redirect: false,
        });
  
        try {
          const response = await fetch("/api/initialize-user-tokens", {
            method: "POST",
          });
          
          if (!response.ok) {
            throw new Error("Failed to initialize tokens");
          }
          
          window.location.href = "/";
        } catch (tokenError) {
          console.error("Error initializing tokens:", tokenError);
          window.location.href = "/";
        }
      } catch (err) {
        const errorMessages = {
          OAuthSignin:
            "Couldn't start sign-in. Please try again or use a different method.",
          OAuthCallback: "Sign-in failed after redirecting. Please try again.",
          OAuthCreateAccount:
            "Couldn't create an account with this sign-in method. Try another option.",
          EmailCreateAccount:
            "This email can't be used to create an account. It may already exist.",
          Callback: "Something went wrong during sign-in. Please try again.",
          OAuthAccountNotLinked:
            "This account is linked to a different sign-in method. Try using that instead.",
          CredentialsSignin:
            "Incorrect email or password. Try again or reset your password.",
          AccessDenied: "You don't have permission to sign in.",
          Configuration:
            "Sign-in isn't working right now. Please try again later.",
          Verification: "Your sign-in link has expired. Request a new one.",
        };
  
        setError(
          errorMessages[err.message] || "Something went wrong. Please try again."
        );
        setLoading(false);
      }
    };
  
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#003366] p-4">
        <form
          noValidate
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-2xl border border-[#FFD700] bg-[#003366] p-8 shadow-xl"
        >
          <h1 className="mb-8 text-center text-3xl font-bold text-[#FFD700]">
            Welcome Back
          </h1>
  
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#FFD700]">
                Email
              </label>
              <div className="overflow-hidden rounded-lg border border-[#FFD700] bg-[#003366] px-4 py-3 focus-within:ring-1 focus-within:ring-[#FFD700]">
                <input
                  required
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-transparent text-lg text-white outline-none placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#FFD700]">
                Password
              </label>
              <div className="overflow-hidden rounded-lg border border-[#FFD700] bg-[#003366] px-4 py-3 focus-within:ring-1 focus-within:ring-[#FFD700]">
                <input
                  required
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-transparent text-lg text-white outline-none placeholder:text-gray-400"
                  placeholder="Enter your password"
                />
              </div>
            </div>
  
            {error && (
              <div className="rounded-lg bg-red-900/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}
  
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#FFD700] px-4 py-3 text-base font-medium text-[#003366] transition-colors hover:bg-[#FFD700]/80 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Sign In"}
            </button>
            <p className="text-center text-sm text-white">
              Don't have an account?{" "}
              <a
                href="/account/signup"
                className="text-[#FFD700] hover:text-[#FFD700]/80"
              >
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>
    );
  }
  
  
  