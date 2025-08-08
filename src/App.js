import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import contractABI from "./abi/BetGame.json";

// ------------------- Stil ve yardımcı komponentler -------------------
const BridgeButton = styled.button`
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1.5px solid rgba(255, 255, 255, 0.27);
  color: #fff;
  /* Floating glassmorphism + neumorphism shadow */
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.14),
    0 8px 40px 4px rgba(140, 120, 255, 0.13),
    0 1.5px 12px 0 rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  font-size: 20px;
  font-weight: 700;

  font-family: "Bungee", "Impact", "Titillium Web", Arial, sans-serif;

  position: absolute;
  top: 20px;
  right: 40px;
  width: 180px;
  height: 56px;
  cursor: pointer;
  z-index: 999;
  transition: background 0.2s, color 0.2s;
  @media (max-width: 900px) {
    right: 20px;
    top: 10px;
    width: 100px;
    font-size: 16px;
    min-width: 120px;
  }
`;

const DisconnectButton = styled.button`
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1.5px solid rgba(255, 255, 255, 0.27);
  color: #fff;
  /* Floating glassmorphism + neumorphism shadow */
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.14),
    0 8px 40px 4px rgba(140, 120, 255, 0.13),
    0 1.5px 12px 0 rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  font-size: 18px;
  font-weight: 700;
  font-family: "Bungee", "Impact", "Titillium Web", Arial, sans-serif;
  position: absolute;
  top: 20px;
  right: 240px;
  width: 220px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  @media (max-width: 900px) {
    right: 20px;
    top: 80px;
    width: 100px;
    font-size: 12px;
    min-width: 120px;
  }
`;

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: "Bungee", "Impact", "Titillium Web", Arial, sans-serif;
    background: linear-gradient(239.23deg, #5C2526 -21.09%, #370064 36.02%, #4E54C2 94.82%);
    color: white;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
  }
      .logo-img {
    position: absolute;
    left: 40px;
    top: 20px;
    width: 250px;
    height: auto;
    z-index: 100;
  }

  @media (max-width: 900px) {
    .logo-img {
      width: 150px;
      left: 20px;
      top: 15px;
    }
  }
`;

const AppContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  position: relative;
`;

const GameContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 50px;
  position: relative;
  width: 100%;

  @media (max-width: 900px) {
    flex-direction: column;
    gap: 30px;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
`;

const spinAnimation = keyframes`
  from { transform: rotate(0deg);}
  to { transform: rotate(360deg);}
`;

const WheelWrapper = styled.div`
  position: relative;
  width: 600px;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
  .wheel {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    position: relative;
    overflow: hidden;
    transition: transform 5s cubic-bezier(0.25, 1, 0.5, 1);
    &.spinning {
      animation: ${spinAnimation} 1s linear infinite;
    }
  }
  @media (max-width: 900px) {
    margin-top: 400px;
    width: 350px;
    height: 350px;
  }
`;

const PointerContainer = styled.div`
  position: absolute;
  top: -60px;
  z-index: 10;
  width: 120px;
  height: 117px;
`;

const SpinButton = styled.button`
  position: absolute;
  width: 172px;
  height: 172px;
  border-radius: 50%;
  margin-top: 30px;
  background: rgba(249, 71, 130);
  border: 6px solid #f94782;
  color: #fff;
  font-family: "Bungee", "Impact", "Titillium Web", Arial, sans-serif;
  font-weight: 700;
  font-size: 36.5px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
  border: 2px solid #fff;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.2),
    0 0 10px rgba(255, 255, 255, 0.2), 0 0 20px rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 5px rgba(249, 71, 130, 0.5), 0 0 20px rgba(249, 71, 130, 0.5),
    0 0 50px rgba(249, 71, 130, 0.5), 0 0 100px rgba(249, 71, 130, 0.5);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 0 5px rgba(249, 71, 130, 1), 0 0 20px rgba(249, 71, 130, 1),
      0 0 50px rgba(249, 71, 130, 1), 0 0 100px rgba(249, 71, 130, 1);
  }
  @media (max-width: 900px) {
    margin-top: 200px;
    width: 100px;
    height: 100px;
  }
`;

const ConnectButton = styled.button`
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1.5px solid rgba(255, 255, 255, 0.27);
  color: #fff;
  font-family: "Bungee", "Impact", "Titillium Web", Arial, sans-serif;
  font-size: 18px;
  font-weight: 700;
  border-radius: 28px;
  position: absolute;
  top: 20px;
  right: 240px;
  width: 220px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  @media (max-width: 900px) {
    right: 20px;
    top: 80px;
    width: 100px;
    font-size: 16px;
    min-width: 120px;
  }
`;

const BetInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const BetInput = styled.input`
  padding: 10px;
  font-size: 20px;
  border-radius: 10px;
  border: 1px solid #fff;
  width: 150px;
  outline: none;
  background: transparent;
  color: #fff;
  /* Hide default number input arrows */
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
    font-size: 16px;
  }
`;

const PlaceBetButton = styled.button`
  padding: 9px 18px; /* slightly smaller default */
  text-transform: uppercase;
  border-radius: 8px;
  font-size: 17px;
  font-weight: 500;
  color: #ffffff;
  background: #f94782;
  cursor: pointer;
  border: 1px solid #f94782;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5),
    0 0 10px rgba(255, 255, 255, 0.4), 0 0 20px rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 5px rgba(249, 71, 130, 0.5), 0 0 20px rgba(249, 71, 130, 0.5),
    0 0 50px rgba(249, 71, 130, 0.5), 0 0 100px rgba(249, 71, 130, 0.5);
  transition: all 0.3s ease;
  user-select: none;

  &:hover {
    // padding: 10px 20px; /* full size on hover */
    text-shadow: 0 0 5px #ffffff, 0 0 10px #ffffff, 0 0 20px #ffffff;
    box-shadow: 0 0 5px rgba(249, 71, 130, 1), 0 0 20px rgba(249, 71, 130, 1),
      0 0 50px rgba(249, 71, 130, 1), 0 0 100px rgba(249, 71, 130, 1);
  }

  &:disabled {
    opacity: 1;
    cursor: not-allowed;
  }
`;

const InfoPanelContainer = styled.div`
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1.5px solid rgba(255, 255, 255, 0.27);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.14),
    0 8px 40px 4px rgba(140, 120, 255, 0.13),
    0 1.5px 12px 0 rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px 20px;
  width: 400px;
  margin-top: 12px;
  @media (max-width: 900px) {
    width: 70%;

    display: flex;
    flex-direction: column;
    // align-items: center;
  }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const InfoLabel = styled.span`
  font-family: "Bungee", "Impact", "Titillium Web", Arial, sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 33.09px;
  line-height: 37px;
  color: #ffffff;
  text-transform: uppercase;
`;

const InfoValue = styled.span`
  font-family: "Bungee", "Impact", "Titillium Web", Arial, sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 33.09px;
  line-height: 38px;
  color: #f94782;
  &.anime {
    color: #ffffff;
  }
`;

const StatusMessage = styled.div`
  margin-top: 20px;
  font-size: 20px;
  color: #f94782;
  text-align: center;
  height: 30px;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  // width: 400px;
  min-width: 320px;
  margin-top: 0;
  position: relative;
  left: 130px;
  @media (max-width: 900px) {
    left: 0;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
`;

const PrevBetsContainer = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  // border: 1px solid #fff;
  box-shadow: 0 4px 28px 0 rgba(40, 10, 100, 0.18);
  width: 100%;
  max-height: 144px;
  overflow-y: auto;
  padding: 10px 0px 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-top: 10px;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.4);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

const PrevBetsTitleRow = styled.div`
  font-family: "Bungee", "Impact", "Titillium Web", Arial, sans-serif;
  font-size: 19px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #f94782;
  // -webkit-text-stroke: 1px #fff;
  margin-bottom: 9px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-transform: uppercase;
`;

const PrevBetItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  padding: 7px 6px 7px 8px;
  font-family: "Bungee", "Impact", "Titillium Web", Arial, sans-serif;
  font-size: 16px;
  color: #fff;
`;

const CollapseButton = styled.button`
  background: transparent;
  border: none;
  color: #f94782;
  font-size: 21px;
  cursor: pointer;
  margin-left: 5px;
  &:hover {
    color: #fff;
  }
`;

function shortenAddr(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 8)}...${addr.slice(-4)}`;
}

const Pointer = () => (
  <PointerContainer>
    <svg
      width="120"
      height="117"
      viewBox="0 0 240 234"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_di_2_36)">
        <path
          d="M106.033 121C112.192 131.667 127.588 131.667 133.746 121L168.486 60.8296C173.705 51.7892 168.99 40.3314 158.782 38.1489C146.862 35.6003 131.785 33 119.89 33C107.995 33 92.9179 35.6003 80.9975 38.1489C70.7893 40.3314 66.0745 51.7892 71.2939 60.8296L106.033 121Z"
          fill="url(#paint0_linear_2_36)"
        />
        <path
          d="M102.136 123.25C110.026 136.917 129.753 136.917 137.644 123.25L172.383 63.0791C179.034 51.5591 173.103 36.6088 159.723 33.748C147.752 31.1886 132.286 28.5 119.89 28.5C107.493 28.5 92.0275 31.1886 80.0566 33.748C66.6762 36.6088 60.7454 51.56 67.3965 63.0801L102.136 123.25Z"
          stroke="white"
          strokeWidth="9"
        />
      </g>
      <defs>
        <filter
          id="filter0_di_2_36"
          x="0.164215"
          y="0"
          width="239.451"
          height="234"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="36" />
          <feGaussianBlur stdDeviation="30" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_2_36"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_2_36"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="20" />
          <feGaussianBlur stdDeviation="10" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.708308 0 0 0 0 0.093511 0 0 0 0 0.093511 0 0 0 0.19 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect2_innerShadow_2_36"
          />
        </filter>
        <linearGradient
          id="paint0_linear_2_36"
          x1="119.89"
          y1="33"
          x2="119.89"
          y2="145"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#f94782" />
          <stop offset="1" stopColor="#b8325c" />
        </linearGradient>
      </defs>
    </svg>
  </PointerContainer>
);

const Wheel = ({ playersData, isSpinning, finalAngle }) => {
  const totalBet = playersData.reduce((sum, p) => sum + p.bet, 0);
  let cumulativePercent = 0;
  const sliceColors = [
    "linear-gradient(180deg, #A100FF 0%, #FF59F1 100%)",
    "linear-gradient(180deg, #FF0DEB 0%, #FD99FF 100%)",
    "linear-gradient(180deg, #DCA5FF 0%, #FF0000 100%)",
    "linear-gradient(180deg, #FFFFFF 0%, #001AFF 100%)",
  ];
  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };
  const uniqueSliceColors = playersData.map((player, index) => {
    const color = sliceColors[index % sliceColors.length];
    const id = `gradient-${index}`;
    const [startColor, endColor] = color.match(
      /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g
    ) || ["#fff", "#000"];
    return {
      id,
      gradient: (
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: startColor, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: endColor, stopOpacity: 1 }} />
        </linearGradient>
      ),
    };
  });
  const slices = playersData.map((player, index) => {
    const percent = totalBet > 0 ? player.bet / totalBet : 1 / playersData.length;
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    const midPercent = cumulativePercent + percent / 2;
    const [labelX, labelY] = getCoordinatesForPercent(midPercent);
    cumulativePercent += percent;

    const endX = Math.cos(2 * Math.PI * cumulativePercent);
    const endY = Math.sin(2 * Math.PI * cumulativePercent);
    const largeArcFlag = percent > 0.5 ? 1 : 0;

    const pathData = [
      `M ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `L 0 0`,
    ].join(" ");

    const label = shortenAddr(player.address);

    // Rotate text outward (angle in degrees)
    const angleDeg = midPercent * 360;

    return (
      <g key={player.address}>
        <path d={pathData} fill={`url(#${uniqueSliceColors[index].id})`} />
        <text
          x={labelX * 0.6}
          y={labelY * 0.6}
          transform={`rotate(${angleDeg}, ${labelX * 0.6}, ${labelY * 0.6})`}
          fill="#fff"
          fontSize="0.08"
          fontFamily="'Bungee', 'Titillium Web', sans-serif"
          dominantBaseline="middle"
          textAnchor="middle"
        >
          {label}
        </text>
      </g>
    );
  });
  return (
    <WheelWrapper>
      <Pointer />
      <div
        className={isSpinning ? "wheel spinning" : "wheel"}
        style={{ transform: `rotate(${finalAngle}deg)` }}
      >
        {playersData.length > 0 ? (
          <svg viewBox="-1 -1 2 2" style={{ transform: "rotate(-90deg)" }}>
            <defs>{uniqueSliceColors.map((c) => c.gradient)}</defs>
            {slices}
          </svg>
        ) : (
          <svg viewBox="-1 -1 2 2" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="0" cy="0" r="1" fill="rgba(0,0,0,0.3)" />
          </svg>
        )}
      </div>
    </WheelWrapper>
  );
};

// ------------------- Ana App Component -------------------

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signerContract, setSignerContract] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const [betState, setBetState] = useState({
    betId: null,
    totalPool: "0",
    betEndTime: 0,
    playersData: [],
    winnerDeclared: false,
    winner: null,
    isNativeTokenBet: false,
  });

  const [timeLeft, setTimeLeft] = useState("0:00");
  const [isSpinning, setIsSpinning] = useState(false);
  const [finalAngle, setFinalAngle] = useState(0);
  const [statusMessage, setStatusMessage] = useState(
    "Connect your wallet to begin."
  );
  const [betAmount, setBetAmount] = useState("");
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  // Previous bets state
  const [prevBets, setPrevBets] = useState([]);
  const [showPrevBets, setShowPrevBets] = useState(true);

  const CONTRACT_ADDRESS = "0x6c635e5E7C143B74be5BA506bbf2Fccc35Fda226";
  const READ_RPC_URL = "https://rpc-animechain-39xf6m45e3.t.conduit.xyz/";
  const readProvider = new ethers.JsonRpcProvider(READ_RPC_URL);
  const readContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractABI,
    readProvider
  );
  const ANIME_CHAIN_PARAMS = {
  chainId: "0x10D88", // 69000 in hex
  chainName: "AnimeChain",
  nativeCurrency: {
    name: "ANIME",
    symbol: "ANIME",
    decimals: 18,
  },
  rpcUrls: ["https://rpc-animechain-39xf6m45e3.t.conduit.xyz/"],
  blockExplorerUrls: ["https://explorer.animechain.xyz/"], // Varsa
};

  const switchOrAddNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ANIME_CHAIN_PARAMS.chainId }],
      });
    } catch (switchError) {
      // Eğer zincir ekli değilse
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [ANIME_CHAIN_PARAMS],
          });
        } catch (addError) {
          throw new Error("AnimeChain could not be added.");
        }
      } else {
        throw new Error("Could not switch to AnimeChain.");
      }
    }
  };

  // Polling: always active
  useEffect(() => {
    let poller;
    const pollState = async () => {
      try {
        const currentId = await readContract.currentBetId();
        const betDetails = await readContract.bets(currentId);
        const playersList = await readContract.getPlayers(currentId);
        const isNativeTokenBet = await readContract.isNativeTokenBet();
        const playersWithBets = await Promise.all(
          playersList.map(async (playerAddress) => {
            const betAmount = await readContract.getPlayerBet(
              currentId,
              playerAddress
            );
            return {
              address: playerAddress,
              bet: parseFloat(ethers.formatEther(betAmount)),
            };
          })
        );
        setBetState({
          betId: Number(currentId),
          totalPool: ethers.formatEther(betDetails.totalPool),
          betEndTime: Number(betDetails.betEndTime),
          playersData: playersWithBets,
          winnerDeclared: betDetails.winnerDeclared,
          winner: betDetails.winner,
          isNativeTokenBet,
        });
        // Status logic
        if (betDetails.winnerDeclared && playersWithBets.length > 0) {
          setStatusMessage(`Winner is ${formatAddress(betDetails.winner)}!`);
          const angle = calculateWinnerAngle(
            betDetails.winner,
            playersWithBets
          );
          setFinalAngle(angle);
          setIsSpinning(false);
          setTimeout(
            () => setStatusMessage("New round started! Place your bets."),
            6000
          );
        } else if (playersWithBets.length === 0) {
          setStatusMessage("Waiting for players to place bets...");
          setIsSpinning(false);
        } else {
          setStatusMessage("");
          if (!betDetails.winnerDeclared && isSpinning) {
            setIsSpinning(false);
          }
        }
      } catch (e) {
        setStatusMessage("Error fetching game data.");
      }
    };

    poller = setInterval(pollState, 3000);
    pollState();
    return () => clearInterval(poller);
  }, []);

  // Poll previous bets
  useEffect(() => {
    let poller;
    async function pollPrevBets() {
      try {
        const currentId = await readContract.currentBetId();
        if (Number.isNaN(Number(currentId)) || Number(currentId) < 1) {
          setPrevBets([]);
          return;
        }
        let results = [];
        for (let i = Number(currentId) - 1; i >= 0; i--) {
          try {
            const bet = await readContract.bets(i);
            if (!bet.winnerDeclared || !bet.winner || bet.totalPool === 0)
              continue;
            results.push({
              id: i,
              winner: bet.winner,
              totalPool: ethers.formatEther(bet.totalPool),
            });
            if (results.length >= 20) break; // hard limit for performance
          } catch {}
        }
        setPrevBets(results);
      } catch (e) {
        setPrevBets([]);
      }
    }
    poller = setInterval(pollPrevBets, 3000);
    pollPrevBets();
    return () => clearInterval(poller);
  }, []);

  // Timer (kalan süre için)
  useEffect(() => {
    if (!betState.betEndTime) return;
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const secondsLeft = betState.betEndTime - now;
      setTimeLeft(formatTime(secondsLeft));
      if (secondsLeft < 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [betState.betEndTime]);

  // Auto-spin trigger: visual only
  useEffect(() => {
    const secondsLeft = parseSeconds(timeLeft);
    const shouldSpin = !betState.winnerDeclared && secondsLeft === 0;

    if (shouldSpin !== isSpinning) {
      setIsSpinning(shouldSpin);
    }

    if (shouldSpin) {
      setStatusMessage("Time's up! Waiting for a player to end the bet by clicking Spin.");
    }
  }, [timeLeft, betState.winnerDeclared]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setStatusMessage("Please install MetaMask!");
      return;
    }

    try {
      // Switch or add AnimeChain
      await switchOrAddNetwork();

      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await newProvider.send("eth_requestAccounts", []);
      const signer = await newProvider.getSigner();
      const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

      setProvider(newProvider);
      setSignerContract(contractWithSigner);
      setAccount(accounts[0]);
      setIsWalletConnected(true);
      setStatusMessage("Wallet connected.");
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to connect wallet.");
    }
  }, []);

  // Disconnect
  const handleDisconnect = () => {
    setAccount(null);
    setProvider(null);
    setSignerContract(null);
    setIsWalletConnected(false);
    setStatusMessage("Wallet disconnected.");
  };

  const handlePlaceBet = async () => {
    if (!signerContract) {
      setStatusMessage("Connecting wallet...");
      await connectWallet();
      if (!signerContract) {
        setStatusMessage("Wallet not connected.");
        return;
      }
    }
    let amount;
    try {
      amount = ethers.parseEther(betAmount);
    } catch {
      setStatusMessage("Enter a valid amount.");
      return;
    }
    if (Number(amount) <= 0) {
      setStatusMessage("Amount must be greater than zero.");
      return;
    }
    setIsPlacingBet(true);
    setStatusMessage("Placing your bet...");
    try {
      let tx;
      if (betState.isNativeTokenBet) {
        tx = await signerContract.placeBet(amount, { value: amount });
      } else {
        tx = await signerContract.placeBet(amount);
      }
      setStatusMessage("Transaction sent. Waiting for confirmation...");
      await tx.wait();
      setStatusMessage("Bet placed!");
      setBetAmount("");
    } catch (err) {
      setStatusMessage(
        "Bet failed: " + (err.reason || err.message || "Unknown error")
      );
    }
    setIsPlacingBet(false);
  };

  const handleSpinClick = async () => {
    if (!signerContract) {
      setStatusMessage("Please connect your wallet to spin.");
      return;
    }
    if (betState.playersData.length === 0) {
      setStatusMessage("No players to spin.");
      return;
    }
    if (betState.winnerDeclared) {
      setStatusMessage("This round already ended. Wait for new round.");
      return;
    }
    setIsSpinning(true);
    setStatusMessage("Ending bet... Please confirm transaction.");
    try {
      const tx = await signerContract.endBetAndPickWinner();
      setStatusMessage("Spinning the wheel... waiting for confirmation.");
      await tx.wait();
    } catch (error) {
      const errorMessage = error.reason || "Transaction failed.";
      setStatusMessage(`Error: ${errorMessage}`);
      setIsSpinning(false);
    }
  };

  function formatAddress(addr) {
    return addr
      ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
      : "";
  }
  function formatTime(seconds) {
    if (seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }
  function parseSeconds(str) {
    if (!str) return 0;
    const parts = str.split(":");
    if (parts.length !== 2) return 0;
    return Number(parts[0]) * 60 + Number(parts[1]);
  }
  function calculateWinnerAngle(winnerAddress, playersArr) {
    let cumulativePercent = 0;
    const totalBet = playersArr.reduce((sum, p) => sum + p.bet, 0);
    for (const player of playersArr) {
      const percent =
        totalBet > 0 ? player.bet / totalBet : 1 / playersArr.length;
      const startAngle = cumulativePercent * 360;
      const endAngle = (cumulativePercent + percent) * 360;
      if (player.address.toLowerCase() === winnerAddress.toLowerCase()) {
        const middleAngle = startAngle + (endAngle - startAngle) / 2;
        const fullSpins = 5 * 360;
        const finalRotation = fullSpins - middleAngle + 90;
        return finalRotation;
      }
      cumulativePercent += percent;
    }
    return 0;
  }

  const handleBridgeClick = () => {
    window.open(
      "https://www.relay.link/bridge/animechain?includeChainIds=6167f9a0-84dc-4296-8a26-2bb3cc56dc2c&fromChainId=42161",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <img
          src="/assets/logo.png"
          alt="Anime Bets Logo"
          className="logo-img"
          // style={{
          //   position: "absolute",
          //   left: "40px",
          //   top: "20px",
          //   width: "250px",
          //   height: "auto",
          //   zIndex: "100",
          // }}
        />
        {isWalletConnected ? (
          <DisconnectButton onClick={handleDisconnect}>
            {shortenAddr(account)} &nbsp; Disconnect
          </DisconnectButton>
        ) : (
          <ConnectButton onClick={connectWallet}>Connect Wallet</ConnectButton>
        )}
        <BridgeButton onClick={handleBridgeClick}>Bridge</BridgeButton>

        <GameContainer>
          <div style={{ position: "relative" }}>
            <Wheel
              playersData={betState.playersData}
              isSpinning={isSpinning}
              finalAngle={finalAngle}
            />
            <SpinButton
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                opacity: isSpinning ? 0.6 : 1,
              }}
              onClick={handleSpinClick}
              disabled={!isWalletConnected}
            >
              SPIN
            </SpinButton>
          </div>
          <RightColumn>
            <InfoPanelContainer>
              <BetInputContainer>
                <BetInput
                  type="number"
                  min="0"
                  step="any"
                  placeholder={`Bet Amount (ANIME)`}
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  disabled={isPlacingBet || betState.winnerDeclared}
                />
                <PlaceBetButton
                  style={{
                    fontFamily:
                      '"Bungee", "Impact", "Titillium Web", Arial, sans-serif',
                    color: "#fff",
                    // fontSize: "16px",
                    fontWeight: 600,
                    letterSpacing: "1px",
                  }}
                  onClick={handlePlaceBet}
                  disabled={
                    isPlacingBet ||
                    !betAmount ||
                    isNaN(betAmount) ||
                    Number(betAmount) <= 0 ||
                    betState.winnerDeclared
                  }
                >
                  {isPlacingBet ? "Placing..." : "Place A Bet"}
                </PlaceBetButton>
              </BetInputContainer>
              <InfoRow>
                <InfoLabel>TOTAL POOL:</InfoLabel>
                <InfoValue className="anime">
                  {betState.totalPool} ANIME
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>PLAYERS:</InfoLabel>
                <InfoValue>{betState.playersData.length}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>TIME LEFT:</InfoLabel>
                <InfoValue>{timeLeft}</InfoValue>
              </InfoRow>
              <StatusMessage>{statusMessage}</StatusMessage>
              {showPrevBets && prevBets.length > 0 && (
                <PrevBetsContainer>
                  <PrevBetsTitleRow>
                    Previous Bets
                    <CollapseButton
                      title="Hide"
                      onClick={() => setShowPrevBets(false)}
                    >
                      ×
                    </CollapseButton>
                  </PrevBetsTitleRow>
                  {prevBets.slice(0, 20).map((bet, idx) => (
                    <PrevBetItem key={bet.id}>
                      <span>{shortenAddr(bet.winner)}</span>
                      <span>{bet.totalPool} ANIME</span>
                    </PrevBetItem>
                  ))}
                </PrevBetsContainer>
              )}
              {!showPrevBets && (
                <PrevBetsContainer
                  style={{
                    background: "rgba(249, 71, 130, 0.75)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    fontFamily:
                      '"Bungee", "Impact", "Titillium Web", Arial, sans-serif"',
                    color: "#fff",
                    boxShadow:
                      "0 8px 32px 0 rgba(31, 38, 135, 0.14), 0 8px 40px 4px rgba(140, 120, 255, 0.13), 0 1.5px 12px 0 rgba(255, 255, 255, 0.1)",

                    width: "100%",
                    height: 40,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 0,
                    boxShadow: "0 4px 28px 0 rgba(40, 10, 100, 0)",
                    color: "#fff",
                  }}
                >
                  <CollapseButton
                    style={{
                      fontFamily:
                        '"Bungee", "Impact", "Titillium Web", Arial, sans-serif',
                      color: "#fff",
                      fontSize: "16px",
                      fontWeight: 600,
                      letterSpacing: "1px",
                    }}
                    title="Show"
                    onClick={() => setShowPrevBets(true)}
                  >
                    PREVIOUS BETS ▼
                  </CollapseButton>
                </PrevBetsContainer>
              )}
            </InfoPanelContainer>
          </RightColumn>
        </GameContainer>
      </AppContainer>
    </>
  );
}

export default App;
