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
      className="px-8 py-2 bg-lavender-400 hover:bg-lavender-500 text-purple-900 text-lg font-bold rounded-full shadow-lg transition hover:scale-105"
      style= {{ backgroundColor: "#540CCC", color: "#FFFF4F" }}
    >
      Join the waitlist
    </button>
  );
};

export default JoinTheWaitingListButton;
