import * as Yup from "yup";

export const loginSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

// ✅ FIXED: Field names now match the form
export const registrationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  
  fullName: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Full name is required"),
  
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
  
  mobileNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits")
    .required("Mobile number is required"),
  
  collegeName: Yup.string()
    .min(2, "College name must be at least 2 characters")
    .required("College name is required"),
  
  yearOfGraduation: Yup.number()
    .typeError("Year must be a number")
    .min(1990, "Graduation year must be between 1990 and 2030")
    .max(2030, "Graduation year must be between 1990 and 2030")
    .required("Graduation year is required"),
  
  resume: Yup.mixed()
    .nullable()
    .test("fileSize", "File size must be less than 5MB", (value) => {
      if (!value) return true; // Resume is optional
      return value.size <= 5 * 1024 * 1024;
    })
    .test("fileType", "Only PDF, DOC, DOCX files are allowed", (value) => {
      if (!value) return true; // Resume is optional
      return ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(value.type);
    })
});

export const AddUserSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  role: Yup.string()
    .oneOf(["HR", "FACULTY"], "Invalid role")
    .required("Role is required"),
});