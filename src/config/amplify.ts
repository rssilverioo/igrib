import { Amplify } from 'aws-amplify';

export const configureAmplify = () => {
  if (
    !process.env.NEXT_PUBLIC_AWS_REGION ||
    !process.env.NEXT_PUBLIC_AWS_USER_POOL_ID ||
    !process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID ||
    !process.env.NEXT_PUBLIC_REDIRECT_SIGN_IN ||
    !process.env.NEXT_PUBLIC_REDIRECT_SIGN_OUT
  ) {
    throw new Error('Required AWS Amplify configuration variables are missing');
  }

  // Extract the domain prefix from the user pool ID
  const userPoolIdParts = process.env.NEXT_PUBLIC_AWS_USER_POOL_ID.split('_');
  const domainPrefix = userPoolIdParts[1].toLowerCase();

  const config = {
    Auth: {
      Cognito: {
        region: process.env.NEXT_PUBLIC_AWS_REGION,
        userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID,
        userPoolClientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID,
        signUpVerificationMethod: 'code',
        loginWith: {
          email: true,
          phone: false,
          username: false
        },
        oauth: {
          domain: `${domainPrefix}.auth.${process.env.NEXT_PUBLIC_AWS_REGION}.amazoncognito.com`,
          scope: ['email', 'profile', 'openid'],
          responseType: 'code',
          redirectSignIn: [process.env.NEXT_PUBLIC_REDIRECT_SIGN_IN],
          redirectSignOut: [process.env.NEXT_PUBLIC_REDIRECT_SIGN_OUT]
        }
      }
    }
  };

  try {
    Amplify.configure(config);
    console.log('Amplify configuration successful');
  } catch (error) {
    console.error('Error configuring Amplify:', error);
    throw error;
  }
};