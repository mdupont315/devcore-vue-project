import gql from 'graphql-tag';
// eslint-disable-next-line
const COMPANY_FRAGMENT = gql `
    fragment companyFields on Company{
        id,
        name,
        logo,
        logoUrl,
        currencyCode,
        currency{
            code,
            name,
            symbol,
        }
    }
`;

// eslint-disable-next-line
const USER_FRAGMENT = gql `
    fragment currentUserFields on User{
        id,
        firstName,
        lastName,
        email,
        phone,
        createdAt,
        updatedAt,
        lang,
        status,
        companyId,
        avatar,
        avatarUrl,
        mustChangePassword,
        company {
            ...companyFields
        },
        companyRole{
            id,
            name,
            avatarUrl
        },
        roles {
            id,
            name
        },
        permissions{
            id,
            name,
            guard,
        }
    }
    ${COMPANY_FRAGMENT}
`;

// eslint-disable-next-line
const SESSION_FRAGMENT = gql `
    fragment sessionFields on Session{
        accessToken,
        expiresAt,
        user {
            ...currentUserFields
        }
    }
    ${USER_FRAGMENT}
`;



export const AUTH = {
    login: gql `
        mutation login($input:LoginCredentialsInput!){
            login(input:$input){
                ...sessionFields
            }
        }
        ${SESSION_FRAGMENT}
    `,
    sendVerificationEmail: gql `
        mutation sendVerificationEmail($username:String!){
            sendVerificationEmail(username:$username)
        }
    `,
    verifyAccount: gql `
        mutation verifyAccount($username:String!, $code:String!){
            verifyAccount(username:$username, code:$code){
                ...sessionFields
            }
        }
        ${SESSION_FRAGMENT}
    `,
    requestResetPassword: gql `
        mutation requestResetPassword($username:String!){
            requestResetPassword(username:$username)
        }
    `,
    resetPassword: gql `
        mutation resetPassword($username:String!, $code:String!){
            resetPassword(username:$username, code:$code){
                ...sessionFields
            }
        }
        ${SESSION_FRAGMENT}
    `,
    updateProfile: gql `
        mutation updateProfile($input:ProfileUpdateInput!){
            updateProfile(input:$input){
                ...currentUserFields
            }

        }
        ${USER_FRAGMENT}
    `,

    upateMyCompany: gql `
        mutation upateMyCompany($input:MyCompanyUpdateInput!){
            upateMyCompany(input:$input){
                ...companyFields
            }

        }
        ${COMPANY_FRAGMENT}
        `,


    logout: gql `
        mutation logout{
            logout
        }
    `,
    session: gql `
        query session{
            session {
                ...sessionFields
            }
        }
        ${SESSION_FRAGMENT}
    `
}


