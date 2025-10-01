import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null); // { type: "success"|"error", message: "" }

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required("Full Name is required"),
    phone: Yup.string()
      .matches(/^[0-9]{10,15}$/, "Phone number must be 10–15 digits")
      .required("Phone is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    isAdmin: Yup.boolean(),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const res = await fetch("https://beauty-parlor-app-5.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          password: values.password,
          is_admin: values.isAdmin,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setAlert({ type: "error", message: result.error || "Registration failed" });
        return;
      }

      if (result.customer) {
        setAlert({ type: "success", message: "✅ Registration successful! Redirecting to login..." });
        resetForm();

        // Redirect after showing the message
        setTimeout(() => navigate("/login"), 2500);
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: "error", message: "An error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      {alert && (
        <div className={`alert ${alert.type === "error" ? "alert-error" : "alert-success"}`}>
          {alert.message}
        </div>
      )}

      <Formik
        initialValues={{ name: "", phone: "", password: "", isAdmin: false }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="register-form">
            <h2>Create an Account</h2>

            <Field type="text" name="name" placeholder="Full Name" />
            <ErrorMessage name="name" component="div" className="error" />

            <Field type="text" name="phone" placeholder="Phone" />
            <ErrorMessage name="phone" component="div" className="error" />

            <Field type="password" name="password" placeholder="Password" />
            <ErrorMessage name="password" component="div" className="error" />

            <div className="checkbox-group">
              <label>
                <Field type="checkbox" name="isAdmin" />
                Register as Admin
              </label>
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register"}
            </button>

            <p className="register-message">
              Already have an account?
              <Link to="/login"> Login here</Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
}
