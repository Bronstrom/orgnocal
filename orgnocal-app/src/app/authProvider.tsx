import React from "react";
import { Authenticator, View } from "@aws-amplify/ui-react"
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css"
import Image from "next/image";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID || "",
    }
  }
})

const components = {
  Header() {
    return (
      <View textAlign="center"  padding="15px">
        <Image
          alt="Orgnocal Logo"
          src="/orgnocal_logo_light.png"
          width={400}
          height={400}
        />
      </View>
    );
  },
};

const formFields = {
  signUp: {
    username: {
      label: 'Username:',
      placeholder: 'Pick a username',
      order: 1,
    },
    email: {
      label: 'Email',
      placeholder: 'Enter your email address',
      inputProps: { type: "email", required: true},
      order: 2,
    },
    password: {
      label: 'Password',
      placeholder: 'Enter a password',
      inputProps: { type: "password", required: true},
      order: 3,
    },
    confirm_password: {
      label: 'Confirm Password',
      placeholder: 'Confirm your password',
      inputProps: { type: "password", required: true},
      order: 4,
    },
  },
  forgotPassword: {
    email: {
      label: 'Email',
      placeholder: 'Enter your email',
      inputProps: { type: "email", required: true},
    },
  },
}

// TODO: Change any type
const AuthProvider = ({children}: any) => {
  return (
    <div>
      <Authenticator formFields={formFields} components={components}>{({ user }) => 
        user ? (
          <div>{children}</div>
        ) : (
          <div>Please sign in</div>
        )}</Authenticator>
    </div>
  );
};
export default AuthProvider;
