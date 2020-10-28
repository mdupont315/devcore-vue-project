import BaseModel from "./base.model";
import CompanyRoleModel from "./companyrole.model";
import CompanyModel from "./company.model";
import ProcessOperationModel from "./processoperation.model";

export default class ProcessPhaseModel extends BaseModel {
    title = null;
    dOrder = 1;
    id = null;
    ideas = [];
    companyRoles = [];
    operationId = null;

    get ideaStats() {
        return this.stats && this.stats.ideas ? this.stats.ideas : {};
    }

    get ideasCount() {
        return this.ideaStats.total || 0;
    }

    get toolIdeaStats() {
        return this.stats && this.stats.toolIdeas ? this.stats.toolIdeas : {};
    }

    get toolIdeasCount() {
        return this.toolIdeaStats.total || 0;
    }

    get projectsStats() {
        return this.stats && this.stats.projects ? this.stats.projects : {};
    }

    get projectsCount() {
        return this.projectsStats.total || 0;
    }
    deserialize(input) {
        if (input.companyRoles) {
            input.companyRoles = input.companyRoles.map(u => {
                return new CompanyRoleModel().deserialize(u);
            });
        }
        if (input.company) {
            input.company = new CompanyModel().deserialize(input.company);
        }
        if (input.operation) {
            input.operation = new ProcessOperationModel().deserialize(input.operation);
        }
        Object.assign(this, input);
        return this;
    }
}