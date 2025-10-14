import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import { Button, InputField } from "../../components/common";
import { AuthLayout } from "../../components/layout";
import * as Yup from "yup";
import { verifyEmailApi, completeRegistrationApi } from "../../api/authApi";
import { useNavigate } from "react-router-dom";
import { registrationSchema } from "../../utils/validatorslogic/Validators";


const RegisterPage = () => {
  const navigate = useNavigate();
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailVerificationStatus, setEmailVerificationStatus] = useState("");
  const [emailVerificationMessage, setEmailVerificationMessage] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [lastVerifiedEmail, setLastVerifiedEmail] = useState("")
  const handleEmailVerification = async (email) => {
    if (!email || !email.includes('@') || email === lastVerifiedEmail) {
      return;
    }

    setIsVerifyingEmail(true);
    setEmailVerificationStatus("");
    setEmailVerificationMessage("");

    try {
      console.log("Verifying email:", email);
      const res = await verifyEmailApi(email);
      console.log("Email verification response:", res.data);

      if (res.data.exists) {
        if (res.data.registrationComplete) {
          setEmailVerificationStatus("error");
          setEmailVerificationMessage("This email is already registered. Please login instead.");
          setIsEmailVerified(false);
        } else {
          setEmailVerificationStatus("success");
          setEmailVerificationMessage(`Email verified! Role: ${res.data.role}. You can complete the registration.`);
          setUserRole(res.data.role);
          setIsEmailVerified(true);
        }
      } else {
        setEmailVerificationStatus("error");
        setEmailVerificationMessage("Email not found in our system. Please contact admin to add your email first.");
        setIsEmailVerified(false);
      }
      setLastVerifiedEmail(email);
    } catch (err) {
      console.error("Email verification error:", err);
      setEmailVerificationStatus("error");
      if (err.response?.status === 404) {
        setEmailVerificationMessage("Email not found in our system. Please contact admin to add your email first.");
      } else {
        setEmailVerificationMessage(err.response?.data?.message || "Email verification failed");
      }
      setIsEmailVerified(false);
      setLastVerifiedEmail(email);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  return (
    <AuthLayout variant="register">
      <div className="w-full max-w-sm mx-auto">
        <h2 className="text-[#38B698] text-2xl text-center font-semibold mb-6">
          Student Registration
        </h2>
        <p className="text-gray-600 text-center mb-6 text-sm">
          Fill out the form below to register your account
        </p>

        <Formik
          initialValues={{
            email: "",
            fullName: "",
            password: "",
            confirmPassword: "",
            mobileNumber: "",
            collegeName: "",
            yearOfGraduation: "",
            resume: null,
          }}
          registrationSchema={registrationSchema}
          onSubmit={async (values, { setSubmitting, setErrors, setStatus, validateForm }) => {
            // Check if email is verified before allowing submission
            const errors = await validateForm();
            if(Object.keys(errors).length > 0){
              console.error("Validation errors :",errors);
              setErrors({submit: "Please fix all validation errors before submitting"});
              return;
            }
            if (!isEmailVerified) {
              setErrors({ submit: "Please verify your email before submitting the form." });
              return;
            }

            console.log("=== REGISTRATION FORM SUBMISSION ===");
            console.log("Form values:", values);
            ;
  console.log("=== REGISTRATION DATA ===");
  console.log("Email:", values.email);
  console.log("Full Name:", values.fullName);
  console.log("Password Length:", values.password?.length);
  console.log("Mobile:", values.mobileNumber, "Matches pattern:", /^[0-9]{10}$/.test(values.mobileNumber || ""));
  console.log("Graduation Year:", values.yearOfGraduation, "Valid:", values.yearOfGraduation >= 1990 && values.yearOfGraduation <= 2030);
  console.log("Resume:", values.resume?.name, values.resume?.type);
            setSubmitting(true);
            
            try {
              const formData = new FormData();
              formData.append("email", values.email);
              formData.append("fullName", values.fullName);
              formData.append("password", values.password);
              formData.append("mobileNumber", values.mobileNumber);
              formData.append("collegeName", values.collegeName);
              formData.append("yearOfGraduation", values.yearOfGraduation.toString());
              for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }
              if (values.resume) {
                formData.append("resume", values.resume);
                console.log("Resume attached:", values.resume.name);
              }

              console.log("Making API call to complete registration...");
              const res = await completeRegistrationApi(formData);

              if (res.status === 200 && res.data && res.data.success) {
                console.log("Registration completed successfully");
                setStatus({ success: true, message: res.data.message || "Registration successful!" });
                
              
                
              } else {
                const errorMessage = res.data?.message || "Registration failed";
  console.log("Registration failed with response:", res.data);
  setErrors({ submit: errorMessage });
  setStatus({ error: errorMessage });
              }
            } catch (err) {
              console.error("Registration error:", err);
            
              let errorMessage = "Registration failed. Please try again.";
            
              // Check if error has a response from server
              if (err.response) {
                const status = err.response.status;
                const data = err.response.data || {};
            
                if (status === 400) {
                  errorMessage = "Invalid data provided. Please check all fields.";
                } else if (status === 409) {
                  errorMessage = "Email already registered. Please login instead.";
                } else if (status === 500) {
                  errorMessage = "Server error. Please try again later.";
                } else {
                  // Fallback to server-provided message if available
                  errorMessage = data.message || data.error || `Server error (${status})`;
                }
            
              } else if (err.request) {
                // Request was made but no response received
                errorMessage = "Network error. Please check your connection.";
              } else if (err.message) {
                // Something else went wrong
                errorMessage = err.message;
              }
            
              setErrors({ submit: errorMessage });
              setStatus({ error: errorMessage });
            } finally {
              setSubmitting(false);
            }
            
          }}
        >
          {({ isSubmitting, setFieldValue, values, status, errors }) => (
            <Form className="space-y-4">
              {/* Email Field with Automatic Verification */}
              <div className="space-y-2">
                <InputField
                  name="email"
                  type="email"
                  size="medium"
                  placeholder="Enter your email"
                  autoFocus
                  onBlur={(e) => {
                    const email = e.target.value.trim();
                    if (email && email.includes('@')) {
                      handleEmailVerification(email);
                    }
                  }}
                />
                
                {/* Email Verification Status Messages */}
                {isVerifyingEmail && (
                  <div className="text-blue-600 text-sm flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Verifying email...
                  </div>
                )}
                
                {emailVerificationStatus === "success" && (
                  <div className="text-green-600 text-sm">
                    ✓ {emailVerificationMessage}
                  </div>
                )}
                
                {emailVerificationStatus === "error" && (
                  <div className="text-red-600 text-sm">
                    ✗ {emailVerificationMessage}
                  </div>
                )}
              </div>

              {/* All Other Fields - Always Visible */}
              <InputField
                name="fullName"
                type="text"
                size="medium"
                placeholder="Full Name"
                disabled={!isEmailVerified && emailVerificationStatus !== ""}
                onFocus={(e) => {
                  // Trigger email verification when user focuses on fullName
                  const emailValue = values.email.trim();
                  if (emailValue && emailValue.includes('@') && !isEmailVerified && !isVerifyingEmail) {
                    handleEmailVerification(emailValue);
                  }
                }}
              />

              <InputField
                name="password"
                type="password"
                size="medium"
                placeholder="Create password (min 6 characters)"
                disabled={!isEmailVerified && emailVerificationStatus !== ""}
              />
              
              <InputField
                name="confirmPassword"
                type="password"
                size="medium"
                placeholder="Confirm password"
                disabled={!isEmailVerified && emailVerificationStatus !== ""}
              />

              <InputField
                type="tel"
                name="mobileNumber"
                placeholder="Mobile Number (10 digits)"
                size="medium"
                disabled={!isEmailVerified && emailVerificationStatus !== ""}
              />

              <InputField
                type="text"
                name="collegeName"
                placeholder="College Name"
                size="medium"
                disabled={!isEmailVerified && emailVerificationStatus !== ""}
              />

              <InputField
                type="number"
                name="yearOfGraduation"
                placeholder="Year of Graduation (e.g., 2024)"
                size="medium"
                disabled={!isEmailVerified && emailVerificationStatus !== ""}
              />

              {/* Resume upload */}
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm ml-16 mb-2">
                  Upload your Resume (Optional)
                </label>

                <input
                  type="file"
                  id="resume-upload"
                  name="resume"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  disabled={!isEmailVerified && emailVerificationStatus !== ""}
                  onChange={(event) => {
                    const file = event.currentTarget.files[0];
                    console.log("File selected:", file?.name);
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        alert("File size must be less than 5MB");
                        return;
                      }
                      setFieldValue("resume", file);
                    }
                  }}
                />

<label
  htmlFor="resume-upload"
  className={`cursor-pointer 
    w-full 
    sm:w-3/4        /* 75% width on small screens and above */
    md:w-1/2        /* 50% width on medium screens and above */
    lg:w-1/3        /* 33% width on large screens and above */
    mx-auto
  /* Full width on mobile, auto width on larger screens */
    px-4 py-2 
    text-gray-700 
    border border-gray-300 
    rounded-md 
    text-center 
    hover:bg-gray-50 
    block 
    ${!isEmailVerified && emailVerificationStatus !== "" 
      ? "opacity-50 cursor-not-allowed" 
      : ""}`}
>
  <span className="text-gray-500 text-sm sm:text-base">
    Browse Files
  </span>
</label>


                <p className="text-xs text-gray-500 mt-2 ml-15">
                  {values.resume ? `Selected: ${values.resume.name}` : "Only PDF, DOC, DOCX allowed (Max 5MB)"}
                </p>
              </div>

              {/* Status messages */}
              {status?.success && (
                <div className="text-green-600 text-sm text-center font-semibold">
                  {status.message || "Registration successful! Please login to continue"}
                </div>
              )}
              
              {status?.error && (
                <div className="text-red-600 text-sm text-center">
                  {status.error}
                </div>
              )}

              {/* Form errors */}
              {errors.submit && (
                <div className="text-red-600 text-sm text-center">
                  {errors.submit}
                </div>
              )}

              <div className="text-center space-y-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !isEmailVerified}
                 
                >
                  {isSubmitting ? "Processing..." : "Complete Registration"}
                </Button>
                
                {!isEmailVerified && emailVerificationStatus === "error" && (
                  <p className="text-red-500 text-xs">
                    Please verify your email to enable registration
                  </p>
                )}
              </div>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => navigate("/login")}
                  className="!inline !p-0 !m-0 !w-auto align-baseline text-[#38B698] hover:underline"
                >
                  Login here
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;