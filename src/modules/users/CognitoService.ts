import { randomUUID } from "node:crypto";

import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminCreateUserCommand,
  UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";

type CognitoUser = {
  id: string;
  name: string;
  email: string;
}

export class CognitoService {
  constructor(private readonly cognitoClient: CognitoIdentityProviderClient) {}

  async createUser(name: string, email: string): Promise<CognitoUser> {
    const getUserCommand = new AdminGetUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: email,
    });

    try {
      const getUserResponse = await this.cognitoClient.send(getUserCommand);
      const userAttributes = getUserResponse.UserAttributes || [];
      return {
        id: getUserResponse.Username!,
        name: userAttributes!.find((attr) => attr.Name === "name")?.Value || "",
        email:
          userAttributes!.find((attr) => attr.Name === "email")?.Value || "",
      };
      
    } catch (error) {
      if (!(error instanceof UserNotFoundException)) {
        console.error(error);
        throw new Error('Error!');
      }
    }

    const command = new AdminCreateUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: email,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "email_verified", Value: "true" },
        { Name: "name", Value: name },
      ],
      TemporaryPassword: randomUUID(),
    });

    const createUserResponse = await this.cognitoClient.send(command);
    const userAttributes = createUserResponse.User?.Attributes || [];
    return {
      id: createUserResponse.User!.Username!,
      name: userAttributes!.find((attr) => attr.Name === "name")?.Value || "",
      email: userAttributes!.find((attr) => attr.Name === "email")?.Value || "",
    };
  }

  async getUserById(cognitoUserId: string): Promise<CognitoUser | undefined> {
    try {
      const getUserCommand = new AdminGetUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: cognitoUserId,
      });
      const getUserResponse = await this.cognitoClient.send(getUserCommand);
      
    const userAttributes = getUserResponse.UserAttributes || [];
    return {
      id: getUserResponse.Username!,
      name: userAttributes!.find((attr) => attr.Name === "name")?.Value || "",
      email: userAttributes!.find((attr) => attr.Name === "email")?.Value || "",
    };

    } catch (error) {
      if ((error instanceof UserNotFoundException)) {
        return undefined;
      }

      console.error(error);
      throw new Error('Error!');
    }
  }

  async getUserByEmail(email: string): Promise<CognitoUser | undefined> {
    try {
      const getUserCommand = new AdminGetUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: email,
      });
      const getUserResponse = await this.cognitoClient.send(getUserCommand);
      
    const userAttributes = getUserResponse.UserAttributes || [];
    return {
      id: getUserResponse.Username!,
      name: userAttributes!.find((attr) => attr.Name === "name")?.Value || "",
      email: userAttributes!.find((attr) => attr.Name === "email")?.Value || "",
    };

    } catch (error) {
      if ((error instanceof UserNotFoundException)) {
        return undefined;
      }

      console.error(error);
      throw new Error('Error!');
    }
  }
}
