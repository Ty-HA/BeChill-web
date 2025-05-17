import React from "react";

const JoinTheWaitingListButton: React.FC = () => {
  const handleClick = () => {
    const formSection = document.getElementById("ContactForm");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="cursor-pointer font-Monument font-semibold px-4 py-1 text-xs md:text-sm rounded-full shadow-xs hover:scale-105 uppercase"
      style={{ backgroundColor: "#540CCC", color: "#FFFF4F" }}
      
    >
      Join the waitlist
    </button>
  );
};

export default JoinTheWaitingListButton;
