import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required("Full Name is required"),
    phone: Yup.string()
      .matches(/^[0-9]{10,15}$/, "Phone number must be 10–15 digits")
      .required("Phone is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    isAdmin: Yup.boolean(),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors, resetForm }) => {
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
        setErrors({ api: result.error || "Registration failed" });
        return;
      }

      if (result.customer) {
        alert("Registration successful! Please login.");
        resetForm();
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      setErrors({ api: "An error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <Formik
        initialValues={{ name: "", phone: "", password: "", isAdmin: false }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors }) => (
          <Form className="register-form">
            <h2>Create an Account</h2>

            {errors.api && <p className="error">{errors.api}</p>}

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
          </Form>
        )}
      </Formik>
    </div>
  );
}
