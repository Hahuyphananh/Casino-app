"use client";
import React from "react";

function MainComponent() {
  const { data: user } = useUser();
  const [userTokens, setUserTokens] = useState(null);
  const [gameState, setGameState] = useState("betting");
  const [bet, setBet] = useState(10);
  const [dealerCards, setDealerCards] = useState([]);
  const [playerCards, setPlayerCards] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUserTokens = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/get-user-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setUserTokens(data.data.balance);
      } else {
        throw new Error(data.error || "Erreur inconnue");
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
      setError("Impossible de récupérer votre solde de tokens");
      setUserTokens(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserTokens();
    }
  }, [user]);

  const startGame = async () => {
    if (!user) {
      window.location.href = "/account/signin?callbackUrl=/casino/blackjack";
      return;
    }

    if (userTokens < bet) {
      setError("Solde insuffisant pour cette mise");
      return;
    }

    try {
      const betResponse = await fetch("/api/place-blackjack-bet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: bet,
        }),
      });

      if (!betResponse.ok) {
        throw new Error("Failed to place bet");
      }

      setDealerCards([getRandomCard(), getRandomCard()]);
      const initialPlayerCards = [getRandomCard(), getRandomCard()];
      setPlayerCards(initialPlayerCards);

      if (calculateHandValue(initialPlayerCards) === 21) {
        endGame("win");
      } else {
        setGameState("playing");
        setMessage("");
      }

      await fetchUserTokens();
    } catch (error) {
      console.error("Error starting game:", error);
      setError("Erreur lors du démarrage de la partie");
    }
  };

  const getRandomCard = () => {
    const suits = ["♠", "♥", "♦", "♣"];
    const values = [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
      "A",
    ];
    return {
      suit: suits[Math.floor(Math.random() * suits.length)],
      value: values[Math.floor(Math.random() * values.length)],
    };
  };

  const calculateHandValue = (cards) => {
    let value = 0;
    let aces = 0;

    cards.forEach((card) => {
      if (card.value === "A") {
        aces += 1;
        value += 11;
      } else if (["K", "Q", "J"].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    });

    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }

    return value;
  };

  const hit = () => {
    const newCard = getRandomCard();
    const newPlayerCards = [...playerCards, newCard];
    setPlayerCards(newPlayerCards);

    const newValue = calculateHandValue(newPlayerCards);
    if (newValue > 21) {
      endGame("bust");
    }
  };

  const stand = async () => {
    let currentDealerCards = [...dealerCards];
    while (calculateHandValue(currentDealerCards) < 17) {
      currentDealerCards = [...currentDealerCards, getRandomCard()];
    }
    setDealerCards(currentDealerCards);

    const playerValue = calculateHandValue(playerCards);
    const dealerValue = calculateHandValue(currentDealerCards);

    if (dealerValue > 21 || playerValue > dealerValue) {
      endGame("win");
    } else if (dealerValue > playerValue) {
      endGame("lose");
    } else {
      endGame("push");
    }
  };

  const endGame = async (result) => {
    let winAmount = 0;
    let message = "";
    let won = false;
    let blackjack = false;

    if (playerCards.length === 2 && calculateHandValue(playerCards) === 21) {
      blackjack = true;
    }

    switch (result) {
      case "win":
        if (blackjack) {
          winAmount = bet * 2.5;
          message = "Blackjack ! Vous avez gagné !";
        } else {
          winAmount = bet * 2;
          message = "Vous avez gagné !";
        }
        won = true;
        break;
      case "push":
        winAmount = bet;
        message = "Égalité !";
        break;
      case "bust":
        winAmount = 0;
        message = "Perdu ! Vous avez dépassé 21.";
        break;
      case "lose":
        winAmount = 0;
        message = "Perdu !";
        break;
    }

    try {
      const statsResponse = await fetch("/api/update-blackjack-stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          won,
          blackjack,
          amount: bet,
          winAmount: winAmount > 0 ? winAmount - bet : 0,
        }),
      });

      if (!statsResponse.ok) {
        throw new Error("Failed to update stats");
      }

      if (winAmount > 0) {
        const balanceResponse = await fetch("/api/tokens/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: winAmount,
          }),
        });

        if (!balanceResponse.ok) {
          throw new Error("Failed to update balance");
        }

        const balanceData = await balanceResponse.json();
        if (!balanceData.success) {
          throw new Error(balanceData.error || "Failed to update balance");
        }

        await fetchUserTokens();
      }
    } catch (error) {
      console.error("Error ending game:", error);
      setError("Une erreur est survenue lors de la fin de la partie");
    }

    setMessage(message);
    setGameState("betting");
  };

  return (
    <div className="min-h-screen bg-[#003366] pt-20">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/casino"
              className="flex items-center gap-2 rounded-lg bg-[#004080] px-4 py-2 text-[#FFD700] hover:bg-[#004080]/80"
            >
              <i className="fas fa-arrow-left"></i>
              Retour au Casino
            </a>
            <h1 className="text-4xl font-bold text-[#FFD700]">Blackjack</h1>
          </div>
          <div className="flex items-center space-x-2 rounded-lg bg-[#004080] p-3">
            <i className="fas fa-coins text-[#FFD700]"></i>
            <span className="text-[#FFD700]">
              {userTokens !== null ? userTokens : "..."}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-red-500">
            {error}
          </div>
        )}
        <div
          className="mb-8 relative rounded-[100px] bg-[#0e6b0e] p-8"
          style={{
            border: "20px solid #5c3b15",
            boxShadow: "inset 0 0 50px rgba(0,0,0,0.5)",
          }}
        >
          <div className="mb-8">
            <h2 className="mb-4 text-xl text-[#FFD700]">Dealer</h2>
            <div className="flex flex-col items-center">
              <div className="flex space-x-4 mb-2">
                {dealerCards.map((card, index) => (
                  <div
                    key={index}
                    className="flex h-32 w-24 items-center justify-center rounded-lg bg-white text-2xl shadow-lg"
                    style={{
                      color: ["♥", "♦"].includes(card.suit)
                        ? "#ff0000"
                        : "#000000",
                    }}
                  >
                    {gameState === "playing" && index === 0
                      ? "?"
                      : `${card.value}${card.suit}`}
                  </div>
                ))}
              </div>
              {gameState !== "playing" && (
                <div className="text-lg text-[#FFD700]">
                  Points: {calculateHandValue(dealerCards)}
                </div>
              )}
            </div>
          </div>
          <div className="mb-8">
            <h2 className="mb-4 text-xl text-[#FFD700]">Vos cartes</h2>
            <div className="flex flex-col items-center">
              <div className="flex space-x-4 mb-2">
                {playerCards.map((card, index) => (
                  <div
                    key={index}
                    className="flex h-32 w-24 items-center justify-center rounded-lg bg-white text-2xl shadow-lg"
                    style={{
                      color: ["♥", "♦"].includes(card.suit)
                        ? "#ff0000"
                        : "#000000",
                    }}
                  >
                    {`${card.value}${card.suit}`}
                  </div>
                ))}
              </div>
              <div className="text-lg text-[#FFD700]">
                Points: {calculateHandValue(playerCards)}
                {playerCards.length === 2 &&
                  calculateHandValue(playerCards) === 21 && (
                    <span className="ml-2 text-green-400">(Blackjack!)</span>
                  )}
              </div>
              {gameState === "playing" && (
                <div className="mt-2 text-sm text-gray-300">
                  {calculateHandValue(playerCards) < 17
                    ? "Conseil: Avec moins de 17 points, il est généralement conseillé de tirer une carte"
                    : "Conseil: Avec 17 points ou plus, il est généralement conseillé de rester"}
                </div>
              )}
            </div>
          </div>
          {message && (
            <div className="mb-4 text-center text-xl text-[#FFD700]">
              {message}
            </div>
          )}
          {gameState === "betting" ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setBet(Math.max(10, bet - 10))}
                  className="rounded-full bg-[#FFD700] p-2 text-[#003366] hover:bg-[#FFD700]/80"
                >
                  <i className="fas fa-minus"></i>
                </button>
                <span className="text-2xl text-[#FFD700]">{bet}</span>
                <button
                  onClick={() => setBet(bet + 10)}
                  className="rounded-full bg-[#FFD700] p-2 text-[#003366] hover:bg-[#FFD700]/80"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              <button
                onClick={startGame}
                className="rounded-lg bg-[#FFD700] px-8 py-3 text-lg font-medium text-[#003366] hover:bg-[#FFD700]/80"
              >
                Miser
              </button>
            </div>
          ) : (
            <div className="flex justify-center space-x-4">
              <button
                onClick={hit}
                className="rounded-lg bg-[#FFD700] px-8 py-3 text-lg font-medium text-[#003366] hover:bg-[#FFD700]/80"
              >
                Carte
              </button>
              <button
                onClick={stand}
                className="rounded-lg bg-[#FFD700] px-8 py-3 text-lg font-medium text-[#003366] hover:bg-[#FFD700]/80"
              >
                Rester
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes dealCard {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .flex > div {
          animation: dealCard 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default MainComponent;