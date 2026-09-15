import { useState } from "react";
import {
  loginUser,
  registerUser,
  verifyRegistration,
  forgotPassword,
  resetPassword
} from "./api";

function AuthPage({ onLogin }) {

  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  // =========================
  // REGISTER / OTP / FORGOT
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    clearMessages();
    setLoading(true);

    try {

      // =========================
      // SEND REGISTRATION OTP
      // =========================

      if (mode === "register") {

        await registerUser(
          email,
          password,
          firstName,
          lastName
        );

        setMessage(
          "A 6-digit OTP has been sent to your email."
        );

        setOtp("");

        setMode("verify-register");

        return;
      }


      // =========================
      // VERIFY REGISTRATION OTP
      // =========================

      if (mode === "verify-register") {

        if (!/^\d{6}$/.test(otp)) {
          throw new Error(
            "Please enter the 6-digit OTP."
          );
        }

        await verifyRegistration(
          email,
          otp,
          password,
          firstName,
          lastName
        );

        setMessage(
          "Registration successful. Please login to continue."
        );

        setMode("login");

        setPassword("");
        setOtp("");
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
      // SEND FORGOT PASSWORD OTP
      // =========================

      if (mode === "forgot") {

        await forgotPassword(email);

        setMessage(
          "A 6-digit OTP has been sent to your email."
        );

        setOtp("");

        setMode("verify-forgot");

        return;
      }


      // =========================
      // VERIFY OTP + RESET PASSWORD
      // =========================

      if (mode === "verify-forgot") {

        if (!/^\d{6}$/.test(otp)) {
          throw new Error(
            "Please enter the 6-digit OTP."
          );
        }

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
          otp,
          newPassword
        );

        setMessage(
          "Your password has been reset successfully. Please login with your new password."
        );

        setMode("login");

        setOtp("");
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


  // =========================
  // RESEND OTP
  // =========================

  const handleResendOtp = async () => {

    clearMessages();
    setLoading(true);

    try {

      if (mode === "verify-register") {

        await registerUser(
          email,
          password,
          firstName,
          lastName
        );

      } else if (mode === "verify-forgot") {

        await forgotPassword(email);

      }

      setOtp("");

      setMessage(
        "A new OTP has been sent to your email."
      );

    } catch (err) {

      setError(
        err.message ||
        "Unable to resend OTP. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // EYE ICON
  // =========================

  const EyeIcon = ({ visible }) => (
    <span
      style={{
        fontSize: "20px",
        lineHeight: 1,
        userSelect: "none"
      }}
    >
      {visible ? "🙈" : "👁️"}
    </span>
  );


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
            HEADING
        ========================= */}

        <div className="auth-heading">

          <h2>

            {mode === "login" &&
              "Welcome back"}

            {mode === "register" &&
              "Create your account"}

            {mode === "verify-register" &&
              "Verify your email"}

            {mode === "forgot" &&
              "Reset your password"}

            {mode === "verify-forgot" &&
              "Verify OTP"}

          </h2>


          <p>

            {mode === "login" &&
              "Login to continue to your dashboard"}

            {mode === "register" &&
              "Create an account to start tracking your expenses"}

            {mode === "verify-register" &&
              `Enter the OTP sent to ${email}`}

            {mode === "forgot" &&
              "Enter your email to receive a password reset OTP"}

            {mode === "verify-forgot" &&
              `Enter the OTP sent to ${email}`}

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


          {/* =========================
              REGISTER FIELDS
          ========================= */}

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


          {/* =========================
              EMAIL
          ========================= */}

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


          {/* =========================
              LOGIN / REGISTER PASSWORD
          ========================= */}

          {(mode === "login" ||
            mode === "register") && (

            <div className="auth-field">

              <label>
                Password
              </label>

              <div
                style={{
                  position: "relative",
                  width: "100%"
                }}
              >

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  style={{
                    width: "100%",
                    paddingRight: "48px"
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: "5px"
                  }}
                >

                  <EyeIcon
                    visible={showPassword}
                  />

                </button>

              </div>

            </div>

          )}


          {/* =========================
              FORGOT PASSWORD
          ========================= */}

          {mode === "forgot" && (

            <div className="auth-field">

              <label>
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

          )}


          {/* =========================
              REGISTRATION OTP
          ========================= */}

          {mode === "verify-register" && (

            <div className="auth-field">

              <label>
                Verification OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength="6"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                required
                autoFocus
              />

              <small>
                OTP is valid for 5 minutes.
              </small>

            </div>

          )}


          {/* =========================
              FORGOT PASSWORD OTP + PASSWORD
          ========================= */}

          {mode === "verify-forgot" && (

            <>

              <div className="auth-field">

                <label>
                  Verification OTP
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  required
                  autoFocus
                />

                <small>
                  OTP is valid for 5 minutes.
                </small>

              </div>


              <div className="auth-field">

                <label>
                  New Password
                </label>

                <div
                  style={{
                    position: "relative",
                    width: "100%"
                  }}
                >

                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                    required
                    style={{
                      width: "100%",
                      paddingRight: "48px"
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                    aria-label={
                      showNewPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      padding: "5px"
                    }}
                  >

                    <EyeIcon
                      visible={showNewPassword}
                    />

                  </button>

                </div>

              </div>


              <div className="auth-field">

                <label>
                  Confirm Password
                </label>

                <div
                  style={{
                    position: "relative",
                    width: "100%"
                  }}
                >

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    required
                    style={{
                      width: "100%",
                      paddingRight: "48px"
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      padding: "5px"
                    }}
                  >

                    <EyeIcon
                      visible={showConfirmPassword}
                    />

                  </button>

                </div>

              </div>

            </>

          )}


          {/* =========================
              FORGOT LINK
          ========================= */}

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


          {/* =========================
              RESEND OTP
          ========================= */}

          {(mode === "verify-register" ||
            mode === "verify-forgot") && (

            <div
              style={{
                textAlign: "center",
                marginBottom: "15px"
              }}
            >

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  textDecoration: "underline"
                }}
              >
                {loading
                  ? "Sending..."
                  : "Resend OTP"}
              </button>

            </div>

          )}


          {/* =========================
              SUBMIT
          ========================= */}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >

            {loading

              ? mode === "login"
                ? "Signing you in..."

                : mode === "register"
                  ? "Sending OTP..."

                : mode === "verify-register"
                  ? "Verifying OTP..."

                : mode === "forgot"
                  ? "Sending OTP..."

                : "Resetting password..."

              : mode === "login"
                ? "Login"

                : mode === "register"
                  ? "Continue"

                : mode === "verify-register"
                  ? "Verify OTP"

                : mode === "forgot"
                  ? "Send OTP"

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


          {mode === "verify-register" && (
            <>

              <span>
                Already verified?
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


          {mode === "verify-forgot" && (
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