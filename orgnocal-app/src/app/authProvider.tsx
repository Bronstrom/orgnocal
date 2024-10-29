import React from "react";
import {
  Authenticator,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  useAuthenticator,
  View,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
      userPoolClientId:
        process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID || "",
    },
  },
});

const components = {
  SignIn: {
    Header() {
      const { toSignUp } = useAuthenticator();
      return (
        <View textAlign="center">
          <Image
            alt="Orgnocal Logo"
            src="/orgnocal_logo_light.png"
            objectFit="initial"
            objectPosition="50% 50%"
            height="75%"
            width="75%"
          />
          <Heading paddingTop={10} level={3}>
            Welcome back
          </Heading>
          <Flex direction="row" alignItems="center" justifyContent="center">
            <Text>Don&apos;t have an Orgnocal account?</Text>
            <Button
              fontWeight="normal"
              onClick={toSignUp}
              size="small"
              variation="link"
            >
              Sign Up
            </Button>
          </Flex>
        </View>
      );
    },
    Footer() {
      const { toForgotPassword } = useAuthenticator();
      return (
        <View textAlign="center">
          <Button
            fontWeight="normal"
            onClick={toForgotPassword}
            size="small"
            variation="link"
          >
            Reset Password
          </Button>
        </View>
      );
    },
  },
  SignUp: {
    Header() {
      const { toSignIn } = useAuthenticator();
      return (
        <View textAlign="center">
          <Image
            alt="Orgnocal Logo"
            src="/orgnocal_logo_light.png"
            objectFit="initial"
            objectPosition="50% 50%"
            height="75%"
            width="75%"
          />
          <Heading paddingTop={20} level={3}>
            Create an Orgnocal Account
          </Heading>
          <Flex direction="row" alignItems="center" justifyContent="center">
            <Text>Already have an Orgnocal account?</Text>
            <Button
              fontWeight="normal"
              onClick={toSignIn}
              size="small"
              variation="link"
            >
              Sign In
            </Button>
          </Flex>
        </View>
      );
    },
  },
  ForgotPassword: {
    Header() {
      return (
        <View textAlign="center">
          <Image
            alt="Orgnocal Logo"
            src="/orgnocal_logo_light.png"
            objectFit="initial"
            objectPosition="50% 50%"
            height="75%"
            width="75%"
          />
          <Heading paddingTop={20} paddingBottom={5} level={3}>
            Forgot Password
          </Heading>
          <Flex direction="row" alignItems="center" justifyContent="center">
            <Text>Please enter the following information.</Text>
          </Flex>
        </View>
      );
    },
  },
};

// const components = {
//   Header() {
//     return (
//       <View textAlign="center" padding="15px">
//         <Image
//           alt="Orgnocal Logo"
//           src="/orgnocal_logo_light.png"
//           width={400}
//           height={400}
//         />
//       </View>
//     );
//   },
// };

const formFields = {
  signUp: {
    username: {
      label: "Username",
      placeholder: "Pick a username",
      order: 1,
    },
    email: {
      label: "Email",
      placeholder: "Enter your email address",
      inputProps: { type: "email", required: true },
      order: 2,
    },
    password: {
      label: "Password",
      placeholder: "Enter a password",
      inputProps: { type: "password", required: true },
      order: 3,
    },
    confirm_password: {
      label: "Confirm Password",
      placeholder: "Confirm your password",
      inputProps: { type: "password", required: true },
      order: 4,
    },
  },
  forgotPassword: {
    email: {
      label: "Email",
      placeholder: "Enter your email",
      inputProps: { type: "email", required: true },
    },
  },
};

// TODO: Change any type
const AuthProvider = ({ children }: any) => {
  return (
    <div>
      <Authenticator
        variation="modal"
        formFields={formFields}
        components={components}
      >
        {({ user }) =>
          user ? <div>{children}</div> : <div>Please sign in</div>
        }
      </Authenticator>
    </div>
  );
};
export default AuthProvider;
