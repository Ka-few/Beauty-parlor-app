import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL || 'https://beauty-parlor-app-5.onrender.com';

export default function Login({ setCustomer, setToken }) {
  const navigate = useNavigate();

  // Validation schema
  const validationSchema = Yup.object({
    phone: Yup.string()
      .matches(/^[0-9]{10,15}$/, "Phone number must be 10–15 digits")
      .required("Phone is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors, resetForm }) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: values.phone,
          password: values.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setErrors({ api: result.error || "Login failed" });
        return;
      }

      if (result.access_token && result.customer) {
        // Store token for later requests
        localStorage.setItem("access_token", result.access_token);
        setToken(result.access_token);

        // Ensure we include is_admin from backend
        setCustomer({
          ...result.customer,
          is_admin: result.customer.is_admin ?? false,
        });

        resetForm();
        navigate("/services"); // redirect to services after login
      }
    } catch (err) {
      console.error(err);
      setErrors({ api: "An error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <Formik
        initialValues={{ phone: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors }) => (
          <Form className="login-form">
            <h2>Login</h2>

            {/* API error message */}
            {errors.api && <div className="alert-error">⚠️ {errors.api}</div>}

            <Field type="text" name="phone" placeholder="Phone" />
            <ErrorMessage name="phone" component="div" className="error" />

            <Field type="password" name="password" placeholder="Password" />
            <ErrorMessage name="password" component="div" className="error" />

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            {/* Friendly register/login message */}
            <p className="login-message">
              Don’t have an account?
              <Link to="/register"> Register here</Link>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
}
