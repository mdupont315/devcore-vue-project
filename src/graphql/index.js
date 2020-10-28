import gql from 'graphql-tag'



export const TEST_QUERY = gql `
    query serverTime{
        serverTime
    }
`;

export * from './auth';
export * from './currency';
export * from './company';
export * from './company_role';
export * from './user';
export * from './role';
export * from './toolarea';
export * from './tool';
export * from './pricemodel';
export * from './productcategory';
export * from './product';
export * from './process';
export * from './process_stage';
export * from './process_operation';
export * from './process_phase';
export * from './idea';
export * from './issue';
export * from './project';
export * from './companytool';
export * from './toolcategory';
export * from './toolmodule';
export * from './companytoolmodule';
export * from './companytoolprice';
export * from './reports';