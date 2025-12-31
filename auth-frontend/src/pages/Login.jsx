import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import axios from "axios";
import assets from "../assets";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const Login = () => {
  const [isCreateAccount, setIsCreateAccount] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { backendUrl, getUserData } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isCreateAccount) {
        // REGISTER
        const res = await axios.post(
          `${backendUrl}/register`,
          {
            name,
            email,
            password,
          },
          { withCredentials: true }
        );

        if (res.status === 201) {
          toast.success("Account created successfully. Please login.");
          setIsCreateAccount(false);
          setPassword("");
        }
      } else {
        // LOGIN
        const res = await axios.post(
          `${backendUrl}/login`,
          { email, password },
          { withCredentials: true }
        );

        if (res.status === 200) {
          await getUserData(); // fetch logged-in user
          navigate("/");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative"
      style={{ background: "linear-gradient(to right, #2563eb, #38bdf8)" }}
    >
      {/* Logo */}
      <Link
        to="/"
        className="position-absolute top-0 start-0 m-4 d-flex align-items-center gap-2 text-decoration-none"
      >
        <img src={assets.logoHome} alt="Logo" width={32} height={32} />
        <span className="text-white fw-bold fs-4">Authify</span>
      </Link>

      {/* Card */}
      <div className="bg-white rounded shadow p-4" style={{ width: "360px" }}>
        <h3 className="text-center mb-2">
          {isCreateAccount ? "Create Account" : "Login"}
        </h3>

        <p className="text-center text-muted mb-3">
          {isCreateAccount
            ? "Create your new account"
            : "Welcome back! Please login"}
        </p>

        <form onSubmit={handleSubmit}>
          {isCreateAccount && (
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isCreateAccount
              ? "Create Account"
              : "Login"}
          </button>
        </form>

        {!isCreateAccount && (
          <div className="text-center mt-3">
            <Link to="/reset-password">Forgot Password?</Link>
          </div>
        )}

        <div className="text-center mt-3">
          <button
            className="btn btn-link text-decoration-none"
            onClick={() => setIsCreateAccount(!isCreateAccount)}
          >
            {isCreateAccount
              ? "Already have an account? Login"
              : "Create new account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
