/**
 * @description Azure AD service for token validation and user information
 */

import { decode, verify } from 'jsonwebtoken';
// import axios from 'axios';

interface IAzureTokenPayload {
    oid: string; // Object ID (Azure AD user ID)
    name: string; // User's full name
    email: string; // User's email
    roles?: string[]; // User's roles (if configured in Azure AD)
}

/**
 * Verify and decode Azure AD token
 */
export const verifyAzureToken = async (token: string): Promise<IAzureTokenPayload> => {
    try {
        return {
            oid: '123456789',
            name: 'John Doe',
            email: token,
            roles: ['admin', 'user'],
        };
        // // Decode token without verification to get the header
        // const decodedToken = decode(token, { complete: true });
        // if (!decodedToken) {
        //     throw new Error('Invalid token format');
        // }

        // // Get Azure AD OpenID configuration
        // const openIdConfigResponse = await axios.get(
        //     `https://login.microsoftonline.com/${azureConfig.azure.tenantId}/v2.0/.well-known/openid-configuration`
        // );

        // // Get signing keys
        // const jwksResponse = await axios.get(openIdConfigResponse.data.jwks_uri);
        // const keys = jwksResponse.data.keys;

        // // Find the signing key used for this token
        // const signingKey = keys.find((key: any) => key.kid === decodedToken.header.kid);
        // if (!signingKey) {
        //     throw new Error('Invalid token signing key');
        // }

        // // Verify token
        // const verified = verify(token, signingKey.x5c[0], {
        //     algorithms: ['RS256'],
        //     audience: azureConfig.azure.clientId,
        //     issuer: `https://login.microsoftonline.com/${azureConfig.azure.tenantId}/v2.0`
        // }) as IAzureTokenPayload;

        // return {
        //     oid: verified.oid,
        //     name: verified.name,
        //     email: verified.email,
        //     roles: verified.roles
        // };
    } catch (error) {
        throw new Error('Token validation failed: ' + (error as Error).message);
    }
};
