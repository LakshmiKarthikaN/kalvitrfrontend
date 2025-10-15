import React from "react";
import { Formik, Form } from "formik";
import { Button, InputField } from "../../components/common";
import { AuthLayout } from "../../components/layout";
import { loginSchema } from "../../utils/validatorslogic/Validators";
import { loginApi } from "../../api/authApi.js";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout variant="login">
      <div className="w-full max-w-sm mx-auto">
        <h2 className="text-[#38B698] text-2xl text-center font-semibold mb-6">
          Login
        </h2>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            try {
              console.log("🔄 Attempting login with:", values.email);

              const res = await loginApi(values);
              console.log("✅ Login response:", res.data);

              const { success, mustResetPassword, role, userId, email, token } = res.data;

              if (success) {
                if (
                  mustResetPassword &&
                  ["HR", "FACULTY", "INTERVIEW_PANELIST"].includes(role)
                ) {
                  console.log("⚠️ Password reset required.");
                  setErrors({
                    email:
                      "Your account requires a password reset. Please check your email for the reset link.",
                  });
                  return;
                }

                // ✅ Save user data
                localStorage.setItem("token", token);
                localStorage.setItem("userRole", role);
                localStorage.setItem("userId", userId);
                localStorage.setItem("userEmail", email);

                const userRole = role.toUpperCase();
                console.log("Stored user data. Role:", userRole);

                // ✅ Role-based navigation
                switch (userRole) {
                  case "ADMIN":
                    navigate("/rolebasedpages/admin/admindashboard");
                    break;
                  case "HR":
                    navigate("/rolebasedpages/hr/hrdashboard");
                    break;
                  case "FACULTY":
                    navigate("/interviewpaenlist-portal");
                    break;
                  case "ZSGS":
                    navigate("/student-profile");
                    break;
                    case "INTERVIEW_PANELIST":
                      navigate("/interviewpaenlist-portal");
                      break;
                  default:
                    setErrors({
                      email: "Unknown role. Please contact admin.",
                    });
                }
              } else {
                setErrors({ email: res.data.message || "Login failed" });
              }
            } catch (err) {
              console.error("Login error:", err);
              if (err.response) {
                setErrors({
                  email: err.response.data?.message || "Invalid email or password",
                });
              } else if (err.request) {
                setErrors({
                  email: "Network error. Please check your connection.",
                });
              } else {
                setErrors({ email: "Something went wrong. Please try again." });
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <InputField
                name="email"
                type="email"
                size="medium"
                placeholder="Enter your email"
              />
              <InputField
                name="password"
                type="password"
                size="medium"
                placeholder="Enter password"
              />

              <div className="text-right mr-17">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-gray-600 text-sm hover:text-emerald-500"
                >
                  Forgot password?
                </button>
              </div>

              <div className="text-center">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => navigate("/register")}
                  className="!inline !p-0 !m-0 !w-auto align-baseline text-[#38B698] hover:underline"
                >
                  Register here
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
