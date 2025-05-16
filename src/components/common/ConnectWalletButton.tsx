import React from "react";

interface ConnectWalletButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  onClick,
  label = "CONNECT WALLET",
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-10 py-1 text-lg font-bold font-monument rounded-full shadow-lg transform transition hover:scale-105 
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      style={{ backgroundColor: "#540CCC", color: "#FFFF4F" }}
    >
      {label}
    </button>
  );
};

export default ConnectWalletButton;
