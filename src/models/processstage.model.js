import BaseModel from "./base.model";
import CompanyRoleModel from "./companyrole.model";
import CompanyModel from "./company.model";
import ProcessModel from "./process.model";
import ProcessOperationModel from "./processoperation.model";

export default class ProcessStageModel extends BaseModel {
    tite = null;
    dOrder = 1;
    id = null;
    companyRoles = [];
    processId = null;
    ideas = [];
    operations = [];


    get operationsStats() {
        return this.stats && this.stats.operations ? this.stats.operations : {};
    }

    get operationsCount() {
        return this.operationsStats.total || 0;
    }

    get phasesStats() {
        return this.stats && this.stats.phases ? this.stats.phases : {};
    }

    get phasesCount() {
        return this.phasesStats.total || 0;
    }


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
        if (input.process) {
            input.process = new ProcessModel().deserialize(input.process);
        }

        if (input.operations) {
            input.operations = input.operations.map(o => {
                o.ideas = input.ideas ? input.ideas.filter(i => i.operationId === o.id) : [];
                return new ProcessOperationModel().deserialize(o)
            });
        }
        Object.assign(this, input);
        return this;
    }
}