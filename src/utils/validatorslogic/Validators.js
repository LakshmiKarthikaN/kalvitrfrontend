import * as Yup from "yup";

export const loginSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

export const registrationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(8, "At least 8 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number")
    .required("Mobile number is required"),
  college: Yup.string().required("College name is required"),
  graduationYear: Yup.number()
    .min(2000, "Enter a valid year")
    .max(2100, "Enter a valid year")
    .required("Graduation year is required"),
  resume: Yup.mixed().required("Resume is required"),
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