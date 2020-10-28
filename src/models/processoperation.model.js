import BaseModel from "./base.model";
import CompanyRoleModel from "./companyrole.model";
import CompanyModel from "./company.model";
import ProcessStageModel from "./processstage.model";
import ProcessPhaseModel from "./processphase.model";

export default class ProcessOperationModel extends BaseModel {
    title = null;
    dOrder = 1;
    id = null;
    companyRoles = [];
    ideas = [];
    stageId = null;
    phases = [];


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
        if (input.stage) {
            input.stage = new ProcessStageModel().deserialize(input.stage);
        }
        if (input.phases) {
            input.phases = input.phases.map(o => {
                o.ideas = input.ideas ? input.ideas.filter(i => i.phaseId === o.id) : [];
                return new ProcessPhaseModel().deserialize(o)
            });
        } else {
            input.phases = [];
        }
        Object.assign(this, input);
        return this;
    }
}