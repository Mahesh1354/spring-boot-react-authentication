import { Link, useNavigate } from "react-router-dom";
import { useContext, useRef, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import assets from "../assets";
import { AppContext } from "../context/AppContext";

const EmailVerify = () => {
  const inputRef = useRef([]);
  const [loading, setLoading] = useState(false);

  const { backendUrl, getUserData, isLoggedIn, userData } =
    useContext(AppContext);

  const navigate = useNavigate();

  // IMPORTANT: send cookies
  axios.defaults.withCredentials = true;

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    e.target.value = value;

    if (value && index < 5) {
      inputRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");

    pasteData.forEach((value, index) => {
      if (inputRef.current[index]) {
        inputRef.current[index].value = value;
      }
    });

    inputRef.current[Math.min(pasteData.length, 5)].focus();
  };

  const handleVerify = async () => {
    const otp = inputRef.current.map((el) => el.value).join("");

    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${backendUrl}/verify-email`,
        { otp },
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success("Email verified successfully!");
        await getUserData();
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already verified
  useEffect(() => {
    if (isLoggedIn && userData?.isAccountVerified) {
      navigate("/");
    }
  }, [isLoggedIn, userData, navigate]);

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100 position-relative"
      style={{
        background: "linear-gradient(90deg, #007bff, #00c6ff)",
      }}
    >
      <Link
        to="/"
        className="position-absolute top-0 start-0 p-4 d-flex align-items-center gap-2 text-decoration-none"
      >
        <img src={assets.logo} alt="Logo" height={32} />
        <span className="fs-4 fw-bold text-white">Authify</span>
      </Link>

      <div className="p-5 rounded-4 shadow bg-white" style={{ width: "400px" }}>
        <h4 className="text-center fw-bold mb-2">Email Verification</h4>
        <p className="text-center text-muted mb-4">
          Enter the 6-digit code sent to your email
        </p>

        <div className="d-flex justify-content-between gap-2 mb-4">
          {[...Array(6)].map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              className="form-control text-center fs-5"
              ref={(el) => (inputRef.current[index] = el)}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
            />
          ))}
        </div>

        <button
          className="btn btn-primary w-100 fw-semibold"
          disabled={loading}
          onClick={handleVerify}
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>
      </div>
    </div>
  );
};

export default EmailVerify;
