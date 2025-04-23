"use client";
import React from "react";



export default function Index() {
  return (function MainComponent({ currentPath }) {
  const { data: user, loading } = useUser();
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/get-user-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setBalance(data.data.balance);
      } else if (data.error === "Tokens non initialisés") {
        await fetch("/api/tokens/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        fetchBalance();
      }
    } catch (error) {
      setError("Erreur de chargement");
    }
  };

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user]);

  const isCasinoPath = currentPath.startsWith("/casino");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#002347]">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold text-[#FFD700]">
              BetSim
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="/"
              className={`px-3 py-2 text-sm font-medium ${currentPath === "/" ? "text-[#FFD700]" : "text-white hover:text-[#FFD700]"}`}
            >
              Accueil
            </a>
            <a
              href="/sport"
              className={`px-3 py-2 text-sm font-medium ${currentPath === "/sport" ? "text-[#FFD700]" : "text-white hover:text-[#FFD700]"}`}
            >
              Sport
            </a>
            <a
              href="/casino"
              className={`px-3 py-2 text-sm font-medium ${isCasinoPath ? "text-[#FFD700]" : "text-white hover:text-[#FFD700]"}`}
            >
              Casino
            </a>
            <a
              href="/rankings"
              className={`px-3 py-2 text-sm font-medium ${currentPath === "/rankings" ? "text-[#FFD700]" : "text-white hover:text-[#FFD700]"}`}
            >
              Classement
            </a>
          </div>
          <div className="flex items-center space-x-4">
            {!loading && user ? (
              <>
                <span className="text-[#FFD700]">
                  {error
                    ? "Erreur de chargement"
                    : balance !== null
                      ? `${balance} tokens`
                      : "Chargement..."}
                </span>
                <a
                  href="/profil"
                  className={`px-3 py-2 text-sm font-medium ${currentPath === "/profil" ? "text-[#FFD700]" : "text-white hover:text-[#FFD700]"}`}
                >
                  Profil
                </a>
                <a
                  href="/account/logout"
                  className="text-white hover:text-[#FFD700]"
                >
                  Déconnexion
                </a>
              </>
            ) : (
              <a
                href="/account/signin"
                className="rounded-lg bg-[#FFD700] px-4 py-2 text-sm font-medium text-[#003366] hover:bg-[#FFD700]/80"
              >
                Connexion
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function StoryComponent() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-bold">Navigation (Non connecté)</h2>
        <MainComponent currentPath="/" />
      </div>

      <div className="mt-20">
        <h2 className="mb-4 text-lg font-bold">
          Navigation (Page Accueil active)
        </h2>
        <MainComponent currentPath="/" />
      </div>

      <div className="mt-20">
        <h2 className="mb-4 text-lg font-bold">
          Navigation (Page Sport active)
        </h2>
        <MainComponent currentPath="/sport" />
      </div>

      <div className="mt-20">
        <h2 className="mb-4 text-lg font-bold">
          Navigation (Page Casino active)
        </h2>
        <MainComponent currentPath="/casino" />
      </div>

      <div className="mt-20">
        <h2 className="mb-4 text-lg font-bold">
          Navigation (Page Rankings active)
        </h2>
        <MainComponent currentPath="/rankings" />
      </div>

      <div className="mt-20">
        <h2 className="mb-4 text-lg font-bold">
          Navigation (Page Profil active)
        </h2>
        <MainComponent currentPath="/profil" />
      </div>
    </div>
  );
});
}