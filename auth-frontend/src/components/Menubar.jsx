import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import assets from "../assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Menubar = () => {
  const navigate = useNavigate();

  const { userData, isLoggedIn, logout, backendUrl } = useContext(AppContext);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* ---------------- CLOSE DROPDOWN ON OUTSIDE CLICK ---------------- */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = async () => {
    try {
      await axios.post(`${backendUrl}/logout`, {}, { withCredentials: true });
    } catch {
      // even if backend fails, clear frontend session
    } finally {
      logout();
      navigate("/login");
    }
  };

  /* ---------------- SEND EMAIL VERIFICATION OTP ---------------- */
  const sendVerificationOtp = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/send-otp`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast.success("Verification OTP sent to your email");
        navigate("/email-verify");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send verification OTP"
      );
    }
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      {/* LOGO */}
      <div
        className="d-flex align-items-center gap-2"
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        <img src={assets.logoHome} alt="Logo" width={32} />
        <span className="fw-bold fs-4 text-white">Authify</span>
      </div>

      {/* RIGHT SIDE */}
      {isLoggedIn && userData ? (
        <div className="position-relative" ref={dropdownRef}>
          {/* AVATAR */}
          <div
            className="bg-secondary text-white rounded-circle d-flex justify-content-center align-items-center"
            style={{
              width: "40px",
              height: "40px",
              cursor: "pointer",
              userSelect: "none",
            }}
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            {(userData.name || userData.email)?.charAt(0).toUpperCase()}
          </div>

          {/* DROPDOWN */}
          {dropdownOpen && (
            <div
              className="position-absolute bg-white text-dark rounded shadow mt-2"
              style={{ right: 0, minWidth: "200px", zIndex: 10 }}
            >
              {!userData.isAccountVerified && (
                <div
                  className="dropdown-item px-3 py-2 text-warning"
                  style={{ cursor: "pointer" }}
                  onClick={sendVerificationOtp}
                >
                  Verify Email
                </div>
              )}

              <div
                className="dropdown-item px-3 py-2 text-danger"
                style={{ cursor: "pointer" }}
                onClick={handleLogout}
              >
                Logout
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          className="btn btn-outline-light rounded-pill px-3"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      )}
    </nav>
  );
};

export default Menubar;
