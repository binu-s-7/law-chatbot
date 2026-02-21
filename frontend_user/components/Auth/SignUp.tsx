'use client';

import {useState} from 'react';
import {createClientComponentClient} from '@supabase/auth-helpers-nextjs';
import cn from 'classnames';
import {Field, Form, Formik} from 'formik';
import Link from 'next/link';
import * as Yup from 'yup';

const SignUpSchema = Yup.object().shape({
    username: Yup.string().required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().required('Required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Required'),
});

const SignUp = () => {
    const supabase = createClientComponentClient();
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    async function signUp(formData) {
        const {error} = await supabase.auth.signUp({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            // redirectTo: `${window.location.origin}/auth/callback`,
        });

        if (error) {
            setErrorMsg(error.message);
        } else {
            setSuccessMsg('Success! Please check your email for further instructions.');
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md bg-gray-800 shadow-lg rounded-lg p-6">
                <h2 className="text-center text-gray-300 text-3xl font-semibold">Create Account</h2>
                <Formik
                    initialValues={{
                        username: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                    }}
                    validationSchema={SignUpSchema}
                    onSubmit={signUp}
                >
                    {({errors, touched}) => (
                        <Form className="flex flex-col gap-4 mt-6">
                            <div>
                                <label htmlFor="username" className="text-gray-400 text-lg">Username</label>
                                <Field
                                    className={cn('mt-1 block w-full rounded-md bg-gray-700 text-lg h-10 px-3', {'border-red-500': errors.username && touched.username})}
                                    id="username"
                                    name="username"
                                    placeholder="jane_doe"
                                    type="text"
                                />
                                {errors.username && touched.username ? (
                                    <div className="text-red-400 text-lg">{errors.username}</div>
                                ) : null}
                            </div>

                            <div>
                                <label htmlFor="email" className="text-gray-400 text-lg">Email</label>
                                <Field
                                    className={cn('mt-1 block w-full rounded-md bg-gray-700 text-lg h-10 px-3', {'border-red-500': errors.email && touched.email})}
                                    id="email"
                                    name="email"
                                    placeholder="jane@acme.com"
                                    type="email"
                                />
                                {errors.email && touched.email ? (
                                    <div className="text-red-400 text-lg">{errors.email}</div>
                                ) : null}
                            </div>

                            <div>
                                <label htmlFor="password" className="text-gray-400 text-lg">Password</label>
                                <Field
                                    className={cn('mt-1 block w-full rounded-md bg-gray-700 text-lg h-10 px-3', {'border-red-500': errors.password && touched.password})}
                                    id="password"
                                    name="password"
                                    type="password"
                                />
                                {errors.password && touched.password ? (
                                    <div className="text-red-400 text-lg">{errors.password}</div>
                                ) : null}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="text-gray-400 text-lg">Confirm Password</label>
                                <Field
                                    className={cn('mt-1 block w-full rounded-md bg-gray-700 text-lg h-10 px-3', {'border-red-500': errors.confirmPassword && touched.confirmPassword})}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                />
                                {errors.confirmPassword && touched.confirmPassword ? (
                                    <div className="text-red-400 text-lg">{errors.confirmPassword}</div>
                                ) : null}
                            </div>

                            <button
                                className="mt-4 py-2 px-4 bg-green-400 text-gray-800 text-lg rounded hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                type="submit">
                                Submit
                            </button>
                        </Form>
                    )}
                </Formik>
                {errorMsg && <div className="text-red-400 mt-2">{errorMsg}</div>}
                {successMsg && <div className="text-green-400 mt-2">{successMsg}</div>}
                <Link href="/sign-in" className="text-sm text-green-400 hover:underline text-center block mt-4">Already
                    have an
                    account? Sign In.
                </Link>
            </div>
        </div>
    );
};

export default SignUp;
