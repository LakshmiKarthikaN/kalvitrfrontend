import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button, InputField } from "../../components/common";
import { AuthLayout } from "../../components/layout";
import ResetIllustration from "../../assets/reset.jpg";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPasswordApi, validateResetTokenApi } from "../../api/authApi";

const validationSchema = Yup.object({
  newPassword: Yup.string()
    .min(8, "At least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/, "Must include upper, lower, number, special char")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [tokenValid, setTokenValid] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [isInvitation, setIsInvitation] = useState(false);
  const token = searchParams.get("token");
  const inviteParam = searchParams.get("invite"); // Check if this is an invitation flow
  console.log("ResetPassword token:", token);

  useEffect(() => {
    console.log("ResetPassword component mounted");
    console.log("Current URL:", window.location.href);
    console.log("Token from URL:", token);
    console.log("Invite param:", inviteParam);

 
  if (!token) {
    setMessage("Invalid reset link. Please check your email or request a new link.");
    setMessageType("error");
    setTokenValid(false);
  } else {
    validateToken(token);
    // Check if this is an invitation flow
    setIsInvitation(inviteParam === "true" || window.location.href.includes("invitation"));
  }
}, [token, inviteParam]);

const validateToken = async (resetToken) => {
  try {
    setIsLoading(true);
    const response = await validateResetTokenApi(resetToken);
    
    if (response.data.valid) {
      setUserEmail(response.data.email || "");
      setTokenValid(true);
      setMessage("");
    } else {
      setMessage(response.data.message || "This reset link has expired or is invalid.");
      setMessageType("error");
      setTokenValid(false);
    }
  } catch (error) {
    console.error("Token validation error:", error);
    setMessage("Unable to validate reset link. Please request a new one.");
    setMessageType("error");
    setTokenValid(false);
  } finally {
    setIsLoading(false);
  }
};

  const handleResetPassword = async (values, { resetForm }) => {
    if (!tokenValid || !token) return;

    setIsLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await resetPasswordApi(token, values.newPassword);
      
      if (response.data.success) {
        const successMessage = isInvitation 
          ? "Welcome! Your password has been set successfully. Redirecting to login..."
          : "Password reset successful! Redirecting to login...";
        
        setMessage(successMessage);
        setMessageType("success");
        resetForm();
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate("/login", { 
            state: { 
              message: isInvitation 
                ? "Account setup complete! Please login with your new password." 
                : "Password reset complete! Please login with your new password.",
              type: "success"
            }
          });
        }, 3000);
      } else {
        setMessage(response.data.message || "Reset failed. Please try again.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      let errorMessage = "Network error. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid request. Please check your password requirements.";
      } else if (error.response?.status === 404) {
        errorMessage = "Reset link is invalid or has expired.";
      }
      
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const getPageTitle = () => {
    if (isInvitation) {
      return "Set Your Password";
    }
    return "Reset Password";
  };

  const getPageDescription = () => {
    if (isInvitation) {
      return `Welcome${userEmail ? ` ${userEmail}` : ""}! Please set your new password to complete your account setup.`;
    }
    return "Enter your new password below";
  };

  if (isLoading && !message) {
    return (
      <AuthLayout variant="reset" showIllustration={true} illustration={<img src={ResetIllustration} alt="Reset" />}>
        <div className="w-full max-w-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Validating reset link...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="reset" showIllustration={true} illustration={<img src={ResetIllustration} alt="Reset" />}>
      <div className="w-full max-w-sm">
        <h2 className="text-emerald-500 text-2xl text-center font-semibold mb-2">
          {getPageTitle()}
        </h2>
        <p className="text-gray-600 text-sm mb-6 text-center">
          {getPageDescription()}
        </p>

        {message && (
          <div
            className={`p-3 mb-4 text-sm rounded-md ${
              messageType === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message}
          </div>
        )}

        {tokenValid && (
          <Formik
            initialValues={{ newPassword: "", confirmPassword: "" }}
            validationSchema={validationSchema}
            onSubmit={handleResetPassword}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <InputField 
                  name="newPassword" 
                  type="password" 
                  size="medium"
                  placeholder="New Password" 
                  disabled={isLoading} 
                />
                <InputField 
                  name="confirmPassword" 
                  type="password" 
                  placeholder="Confirm Password" 
                  size="medium"
                  disabled={isLoading} 
                />

                <div className="text-xs text-gray-500 ml-16 mb-4">
                  Password must contain:
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>At least 8 characters</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                    <li>One special character</li>
                  </ul>
                </div>
                <Button className="flex justify-center  mt-4"  type="submit" disabled={isLoading || isSubmitting}>
  {isLoading
    ? "Setting Password..."
    : isInvitation
    ? "Set Password"
    : "Reset Password"}
</Button>

<div className="flex justify-center ">
  <Button
    variant="link"
    onClick={() => navigate("/login")}
    className="text-emerald-500 hover:underline text-sm"
    disabled={isLoading}
  >
    Back to Login
  </Button>
                </div>
              </Form>
            )}
          </Formik>
        )}

        {!tokenValid && (
          <div className="text-center space-y-4">
            <Button 
              onClick={() => navigate("/forgot-password")} 
              className="w-full"
            >
              Request New Reset Link
            </Button>
            <Button 
              variant="link" 
              onClick={() => navigate("/login")} 
              className="text-emerald-500 hover:underline text-sm"
            >
              Back to Login
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
