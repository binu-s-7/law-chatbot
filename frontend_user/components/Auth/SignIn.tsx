'use client';

import {useState} from 'react';
import {createClientComponentClient} from '@supabase/auth-helpers-nextjs';
import cn from 'classnames';

import Link from 'next/link';
import * as Yup from 'yup';
import {Field, Form, Formik} from "formik"; // TS2307: Cannot find module 'formik' or its corresponding type declarations.

const SignInSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().required('Required'),
});

const SignIn = () => {
    const supabase = createClientComponentClient();
    const [errorMsg, setErrorMsg] = useState(null);

    async function signIn(formData: { email: string; password: string }) {
        console.log('formData', formData);
        const {error} = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
        });

        if (error) {
            setErrorMsg(error.message);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="card w-full max-w-md bg-gray-800 shadow-lg rounded-lg p-6">
                <h2 className="w-full text-center text-gray-300 text-3xl font-semibold">Sign In</h2>
                <Formik
                    initialValues={{
                        email: '',
                        password: '',
                    }}
                    validationSchema={SignInSchema}
                    onSubmit={signIn}
                >
                    {({errors, touched}) => (
                        <Form className="flex flex-col gap-4 mt-6">
                            <div>
                                <label htmlFor="email" className="text-gray-400 text-lg">Email</label>
                                <Field
                                    className={cn('input mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-gray-500 focus:bg-gray-600 focus:ring-0  text-lg h-8 px-3', errors.email && touched.email && 'border-red-500')}
                                    id="email"
                                    name="email"
                                    placeholder="jane@acme.com"
                                    type="email"
                                />
                                {errors.email && touched.email ? (
                                    <div className="text-red-400 text-lg">{errors.email}</div>
                                ) : null}
                            </div>

                            <div className="mt-1">
                                <label htmlFor="password" className="text-gray-400">Password</label>
                                <Field
                                    className={cn('input mt-1 block w-full rounded-md bg-gray-700 border-transparent focus:border-gray-500 focus:bg-gray-600 focus:ring-0 text-lg h-8 px-3', errors.password && touched.password && 'border-red-500')}
                                    id="password"
                                    name="password"
                                    type="password"
                                />
                                {errors.password && touched.password ? (
                                    <div className="text-red-400">{errors.password}</div>
                                ) : null}
                            </div>

                            {/*<Link href="/reset-password" className="text-sm text-green-400 hover:underline self-end">*/}
                            {/*    Forgot your password?*/}
                            {/*</Link>*/}

                            <button
                                className="mt-4 py-2 px-4 bg-green-400 text-gray-800 text-lg rounded hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                type="submit">
                                Submit
                            </button>
                        </Form>
                    )}
                </Formik>
                {errorMsg && <div className="text-red-600">{errorMsg}</div>}
                <Link href="/sign-up" className="text-sm text-green-400 hover:underline text-center block mt-4">
                    Don&apos;t have an account? Sign Up.
                </Link>
            </div>
        </div>
    );
};

export default SignIn;
