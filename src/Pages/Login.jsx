import React, { useContext, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { userContext } from '../userContext';

function validateEmail(value) {
  let error;
  if (!value) {
    error = 'Required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
    error = 'Invalid email address';
  }
  return error;
}

function validatePassword(value) {
  let error;
  if (value.length < 6) {
    error = 'Invalid Password!';
  }
  return error;
}

export default function Login() {
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPassword, setFocusedPassword] = useState(false);
  const { setUser } = useContext(userContext);
  const navigation = useNavigate();

  async function handleLogin(values) {
    // Make a POST request to your server's authentication endpoint
    await axios.post('/user/authenticateAdmin', {
      email: values.email,
      password: values.password,
      pageRoll: 1
    }).then(res => {
      const { token, firstname, lastname, email } = res.data;
      setUser({ firstname: firstname, lastname: lastname, email: email });
      localStorage.setItem('token', token);
      navigation('/')
      return;
    }).catch(err => {
      console.log('Login failed ' + err)
    });
  };

  return (
    <Container className='text-center flex flex-col justify-center items-center pt-5 pb-20 h-screen'>
      <span className='text-5xl'>Login</span>
      <Formik
        initialValues={{
          password: '',
          email: '',
        }}
        onSubmit={values => {
          handleLogin(values)
          // same shape as initial values
        }}
      >
        {({ errors, touched, isValidating }) => (
          <Form className='flex flex-col mt-10 w-full lg:w-1/2 md:w-3/4 sm:w-full'>
            <div className="mb-4 relative">
              <label className={'absolute left-4 text-xs transition-all duration-150 ' + (!focusedEmail ? '-z-10 top-5' : 'top-1')}>
                Email
              </label>
              <Field
                className="border-2 border-black p-3 w-full"
                name="email"
                type="email"
                placeholder={!focusedEmail ? "Email" : ""}
                validate={validateEmail}
                onFocus={() => setFocusedEmail(true)}
                onBlur={(ev) => {
                  if (ev.target.value.length === 0)
                    setFocusedEmail(false)
                }}
              />
              {
                errors.email && touched.email &&
                <div className="text-red-500 absolute">
                  {errors.email}
                </div>
              }
            </div>

            <div className="mb-4 relative">
              <label className={'absolute left-4 text-xs transition-all duration-150 ' + (!focusedPassword ? '-z-10 top-5' : 'top-1')}>
                Password
              </label>
              <Field
                className="border-2 border-black p-3 w-full"
                name="password"
                type="password"
                placeholder={!focusedPassword ? "Password" : ""}
                validate={validatePassword}
                onFocus={() => setFocusedPassword(true)}
                onBlur={(ev) => {
                  if (ev.target.value.length === 0)
                    setFocusedPassword(false)
                }}
              />
              {
                errors.password && touched.password &&
                <div className="text-red-500 absolute">
                  {errors.password}
                </div>
              }
            </div>
            <div className="text-left mb-4">
              <Link to="/forgot-password" className='text-black'>Forgot Your Password?</Link>
            </div>
            <div>
              <button className="bg-gray-500 text-white px-2 py-2.5 w-28" type="submit">Sign In</button>
            </div>
          </Form>
        )}
      </Formik>

      {/* <div className="mt-4">
        <Link to="/Account/Signup" className="text-black">Create Account</Link>
      </div> */}
    </Container>
  )
}