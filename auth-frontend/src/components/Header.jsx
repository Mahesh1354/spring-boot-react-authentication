import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets";
import { AppContext } from "../context/AppContext";

const Header = () => {
  const { userData, isLoggedIn } = useContext(AppContext);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(isLoggedIn ? "/dashboard" : "/login");
  };

  return (
    <header className="bg-white text-dark text-center py-5">
      {/* Header Image */}
      <img
        src={assets.header}
        alt="Header"
        width={120}
        className="mb-4"
      />

      {/* Greeting */}
      <h5 className="fw-semibold mb-2">
        Hey{" "}
        <span className="text-primary">
          {userData?.name || userData?.email || "Developer"}
        </span>
        , welcome to Authify – your gateway to secure authentication
      </h5>

      {/* Main Heading */}
      <h1 className="fw-bold display-5 mb-3">
        Authentication Portal
      </h1>

      {/* Description */}
      <p className="fs-5 mb-4 mx-auto header-text">
        Secure your digital identity with our robust authentication system.
      </p>

      {/* CTA Button */}
      <button
        className="btn btn-outline-dark rounded-pill px-4 py-2"
        onClick={handleGetStarted}
      >
        {isLoggedIn ? "Go to Dashboard" : "Get Started"}
      </button>
    </header>
  );
};

export default Header;
