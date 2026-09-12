import { useState } from "react";
import {
  loginUser,
  registerUser,
  resetPassword
} from "./api";

function AuthPage({ onLogin }) {

  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // =========================
  // SHOW PASSWORD STATES
  // =========================

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);


  const clearMessages = () => {
    setError("");
    setMessage("");
  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    clearMessages();
    setLoading(true);

    try {

      // =========================
      // REGISTER
      // =========================

      if (mode === "register") {

        await registerUser(
          email,
          password,
          firstName,
          lastName
        );

        setMessage(
          "Your account has been created successfully. Please login to continue."
        );

        setMode("login");

        setPassword("");
        setFirstName("");
        setLastName("");

        return;
      }


      // =========================
      // LOGIN
      // =========================

      if (mode === "login") {

        const data = await loginUser(
          email,
          password
        );

        localStorage.setItem(
          "user",
          JSON.stringify(data)
        );

        onLogin(data);

        return;
      }


      // =========================
      // FORGOT PASSWORD
      // =========================

      if (mode === "forgot") {

        if (newPassword !== confirmPassword) {
          throw new Error(
            "Passwords do not match. Please enter the same password in both fields."
          );
        }

        if (newPassword.length < 6) {
          throw new Error(
            "Your password must be at least 6 characters long."
          );
        }

        await resetPassword(
          email,
          newPassword
        );

        setMessage(
          "Your password has been reset successfully. Please login with your new password."
        );

        setMode("login");

        setNewPassword("");
        setConfirmPassword("");

        return;
      }

    } catch (err) {

      setError(
        err.message ||
        "Something went wrong. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="auth-container">

      <div className="auth-card">

        {/* =========================
            LOGO / TITLE
        ========================= */}

        <div className="auth-brand">

          <div className="auth-brand-icon">
            ₹
          </div>

          <div>
            <h1>Expense Tracker</h1>

            <p>
              Manage your money smarter
            </p>
          </div>

        </div>


        {/* =========================
            TITLE
        ========================= */}

        <div className="auth-heading">

          <h2>
            {mode === "login" &&
              "Welcome back"}

            {mode === "register" &&
              "Create your account"}

            {mode === "forgot" &&
              "Reset your password"}
          </h2>

          <p>

            {mode === "login" &&
              "Login to continue to your dashboard"}

            {mode === "register" &&
              "Create an account to start tracking your expenses"}

            {mode === "forgot" &&
              "Enter your email and choose a new password"}

          </p>

        </div>


        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}


        {/* =========================
            SUCCESS
        ========================= */}

        {message && (
          <div className="auth-success">
            {message}
          </div>
        )}


        {/* =========================
            FORM
        ========================= */}

        <form onSubmit={handleSubmit}>


          {/* REGISTER FIELDS */}

          {mode === "register" && (

            <>

              <div className="auth-field">

                <label>
                  First Name
                </label>

                <input
                  type="text"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(e.target.value)
                  }
                  required
                />

              </div>


              <div className="auth-field">

                <label>
                  Last Name
                </label>

                <input
                  type="text"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) =>
                    setLastName(e.target.value)
                  }
                  required
                />

              </div>

            </>

          )}


          {/* EMAIL */}

          {(mode === "login" ||
            mode === "register" ||
            mode === "forgot") && (

            <div className="auth-field">

              <label>
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

          )}


          {/* LOGIN / REGISTER PASSWORD */}

          {(mode === "login" ||
            mode === "register") && (

            <div className="auth-field">

              <label>
                Password
              </label>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              <label className="show-password">

                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) =>
                    setShowPassword(e.target.checked)
                  }
                />

                <span>
                  Show password
                </span>

              </label>

            </div>

          )}


          {/* FORGOT PASSWORD */}

          {mode === "forgot" && (

            <>

              {/* NEW PASSWORD */}

              <div className="auth-field">

                <label>
                  New Password
                </label>

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  required
                />

                <label className="show-password">

                  <input
                    type="checkbox"
                    checked={showNewPassword}
                    onChange={(e) =>
                      setShowNewPassword(
                        e.target.checked
                      )
                    }
                  />

                  <span>
                    Show password
                  </span>

                </label>

              </div>


              {/* CONFIRM PASSWORD */}

              <div className="auth-field">

                <label>
                  Confirm Password
                </label>

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                />

                <label className="show-password">

                  <input
                    type="checkbox"
                    checked={showConfirmPassword}
                    onChange={(e) =>
                      setShowConfirmPassword(
                        e.target.checked
                      )
                    }
                  />

                  <span>
                    Show password
                  </span>

                </label>

              </div>

            </>

          )}


          {/* FORGOT LINK */}

          {mode === "login" && (

            <div className="forgot-password-row">

              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  clearMessages();
                }}
              >
                Forgot password?
              </button>

            </div>

          )}


          {/* SUBMIT */}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >

            {loading
              ? mode === "login"
                ? "Signing you in..."
                : mode === "register"
                  ? "Creating your account..."
                  : "Resetting your password..."
              : mode === "login"
                ? "Login"
                : mode === "register"
                  ? "Create Account"
                  : "Reset Password"}

          </button>

        </form>


        {/* =========================
            BOTTOM SWITCH
        ========================= */}

        <div className="auth-switch">

          {mode === "login" && (
            <>
              <span>
                Don't have an account?
              </span>

              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  clearMessages();
                }}
              >
                Register
              </button>
            </>
          )}


          {mode === "register" && (
            <>
              <span>
                Already have an account?
              </span>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  clearMessages();
                }}
              >
                Login
              </button>
            </>
          )}


          {mode === "forgot" && (
            <>
              <span>
                Remember your password?
              </span>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  clearMessages();
                }}
              >
                Back to Login
              </button>
            </>
          )}

        </div>

      </div>

    </div>

  );
}

export default AuthPage;