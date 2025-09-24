import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "./Login.css";

export default function Login({ setCustomer, setToken }) {
  const navigate = useNavigate();

  // ✅ Yup validation schema
  const validationSchema = Yup.object({
    phone: Yup.string()
      .required("Phone is required")
      .matches(/^\d{10}$/, "Phone must be 10 digits"),
    password: Yup.string()
      .required("Password is required")
      .min(4, "Password must be at least 4 characters"),
  });

  // ✅ Handle form submission
  const handleLogin = async (values, { setSubmitting, setStatus }) => {
    try {
      const res = await fetch("https://beauty-parlor-app-5.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        const data = await res.json();
        setCustomer(data.customer);
        setToken(data.access_token);
        localStorage.setItem("token", data.access_token);
        navigate("/services");
      } else {
        const err = await res.json();
        setStatus(err.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setStatus("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ phone: "", password: "" }}
      validationSchema={validationSchema}
      onSubmit={handleLogin}
    >
      {({ isSubmitting, status }) => (
        <Form className="login-form">
          <h2 className="login-title">Login</h2>

          {/* Phone */}
          <Field
            type="text"
            name="phone"
            placeholder="Phone"
            className="login-input"
          />
          <ErrorMessage name="phone" component="div" className="error" />

          {/* Password */}
          <Field
            type="password"
            name="password"
            placeholder="Password"
            className="login-input"
          />
          <ErrorMessage name="password" component="div" className="error" />

          {/* Submit button */}
          <button type="submit" disabled={isSubmitting} className="login-button">
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          {/* Server / network error */}
          {status && <p className="error">{status}</p>}
        </Form>
      )}
    </Formik>
  );
}
