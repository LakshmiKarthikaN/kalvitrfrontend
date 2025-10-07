import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button, InputField } from "../../components/common";
import { AuthLayout } from "../../components/layout";
import Logo from "../../components/common/Logo";
import ForgotIllustration from "../../assets/forgot.jpeg";
import { useNavigate } from "react-router-dom";
import { forgotPasswordApi } from "../../api/authApi"; 

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); 

  const illustration = (
    <img
      src={ForgotIllustration}
      alt="Illustration"
      className="w-32 h-32 sm:w-40 sm:h-40 md:w-60 md:h-60 object-contain mt-5 mx-auto mix-blend-multiply"
    />
  );

  const handleForgotPassword = async (values, { setFieldError, resetForm }) => {
    setIsLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await forgotPasswordApi(values.email);

      if (response.data.success) {
        setMessage("Reset password link has been sent to your email.");
        setMessageType("success");
        resetForm();
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setMessage(response.data.message || "Something went wrong.");
        setMessageType("error");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setFieldError("email", "Email not found in records");
      } else if (error.response?.status === 403) {
        setMessage("Admin accounts cannot reset via this method.");
        setMessageType("error");
      } else {
        setMessage(error.response?.data?.message || "Network error. Try again.");
        setMessageType("error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout variant="forgot" showIllustration={true} illustration={illustration}>
      <div className="w-full max-w-sm">
        <h2 className="text-emerald-500 text-2xl text-center font-semibold mb-2">Forgot Password</h2>
        <p className="text-gray-600 text-sm mb-6">
          Enter your registered email address to receive reset link
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

        <Formik
          initialValues={{ email: "" }}
          validationSchema={validationSchema}
          onSubmit={handleForgotPassword}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <InputField name="email" type="email" placeholder="Enter your email" disabled={isLoading} />

              <div className="text-center">
                <Button type="submit" disabled={isLoading || isSubmitting}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600">
                <Button
                  variant="link"
                  onClick={() => navigate("/login")}
                  className="text-[#38B698] hover:underline"
                  disabled={isLoading}
                >
                  Back to Login
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
