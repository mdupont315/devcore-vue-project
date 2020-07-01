import gql from "graphql-tag";

export const REPORTS = {
    ideaReport: gql `
        query ideaReport($filter:IdeaReportInput!){
            ideaReport(filter:$filter){
                id
                currency{
                    code
                    name
                }
                from
                to
                interval
                idea{
                    id
                    title
                }
                data
            }
        }
    `,
    userProjectReport: gql `
        query userProjectReport($filter:UserProjectReportInput!){
            userProjectReport(filter:$filter){
                id
                projectId
                currency {
                    code
                    name
                }
                project{
                    id
                    name
                }
                from
                to
                interval
                user {
                    firstName
                    lastName
                    avatarUrl
                }
                data
            }
        }
    `,


    peopleReport: gql `
        query peopleReport($filter:PeopleReportInput){
            peopleReport(filter:$filter){
                companyRoleId
                from
                to
                processId
                data{
                    userId
                    user{
                        id
                        firstName
                        lastName
                        avatarUrl
                    }
                    companyRole{
                        id
                        name
                        avatarUrl
                    }
                    totalValue
                    totalEvaluations
                    userValue
                    userTotalEvaluations
                    userAverage
                    otherAverage
                    otherTotalEvaluations
                    otherTotalValue
                    totalUsers
                    totalAverage
                    projects{
                        projectId
                        project{
                            id
                            name
                            status
                        }
                        stages{
                            stageId
                            stage{
                                title
                                status
                            }
                            totalValue
                            totalIdeas
                            totalEvaluations
                            userValue
                            userTotalEvaluations
                            userAverage
                            totalUsers
                            totalAverage
                            otherAverage
                            otherTotalEvaluations
                            otherTotalValue
                        }
                    }
                
                }
            }
        }
    `
}