import { Link, useNavigate } from "react-router-dom";
import { useContext, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import assets from "../assets";
import { AppContext } from "../context/AppContext";

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const otpRef = useRef([]);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [isOtpSent, setIsOtpSent] = useState(false);

  /* ---------------- STEP 1: SEND OTP ---------------- */
  const sendOtp = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter email");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${backendUrl}/send-reset-otp`,
        null,
        { params: { email } }
      );

      toast.success("OTP sent to your email");
      setIsOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- OTP INPUT ---------------- */
  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    e.target.value = value;

    if (value && index < 5) {
      otpRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      otpRef.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");

    data.forEach((val, i) => {
      otpRef.current[i].value = val;
    });

    otpRef.current[Math.min(data.length, 5)]?.focus();
  };

  /* ---------------- STEP 2: RESET PASSWORD ---------------- */
  const resetPassword = async () => {
    const otp = otpRef.current.map((i) => i.value).join("");

    if (otp.length !== 6) {
      toast.error("Enter valid 6-digit OTP");
      return;
    }

    if (!newPassword) {
      toast.error("Enter new password");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${backendUrl}/reset-password`, {
        email,
        otp,
        newPassword,
      });

      toast.success("Password reset successful");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100 position-relative"
      style={{ background: "linear-gradient(90deg, #6a5af9, #8268f9)" }}
    >
      {/* Logo */}
      <Link
        to="/"
        className="position-absolute top-0 start-0 p-4 d-flex align-items-center gap-2 text-decoration-none"
      >
        <img src={assets.logo} alt="Logo" height={32} />
        <span className="fs-4 fw-semibold text-light">Authify</span>
      </Link>

      {/* Card */}
      <div className="bg-white rounded-4 shadow p-5" style={{ width: "400px" }}>
        {!isOtpSent && (
          <>
            <h4 className="text-center mb-3">Reset Password</h4>
            <form onSubmit={sendOtp}>
              <input
                type="email"
                className="form-control mb-3"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="btn btn-primary w-100" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          </>
        )}

        {isOtpSent && (
          <>
            <h4 className="text-center mb-3">Verify OTP</h4>

            <div className="d-flex justify-content-between mb-3">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  maxLength="1"
                  className="form-control text-center"
                  ref={(el) => (otpRef.current[i] = el)}
                  onChange={(e) => handleOtpChange(e, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  onPaste={handleOtpPaste}
                />
              ))}
            </div>

            <input
              type="password"
              className="form-control mb-3"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button
              className="btn btn-success w-100"
              onClick={resetPassword}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
