import BaseModel from "./base.model";
import CompanyRoleModel from "./companyrole.model";
import CompanyModel from "./company.model";
import ProcessStageModel from "./processstage.model";
import IdeaModel from "./idea.model";
import UserModel from "./user.model";

export default class ProcessModel extends BaseModel {
  title = null;

  company = null;

  stages = [];

  ideas = [];

  projects = [];

  companyRoles = [];

  // loaded = {
  //     stages: false,
  //     stagesFull: false,
  //     ideas: false,
  //     projects: false,
  //     roles: false,
  //     company: false,
  // };

  loaded = false;

  // table details reactive property
  _showDetails = false;


  get stageStats() {
    return this.stats && this.stats.stages ? this.stats.stages : {};
  }

  get stagesCount() {
    return this.stageStats.total || 0;
  }

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
    if (input.roles) {
      input.roles = input.roles.map(u => {
        if (!(u instanceof CompanyRoleModel)) {
          return new CompanyRoleModel().deserialize(u);
        }
        return u;
      });
    }

    if (input.company) {
      input.company = !(input.company instanceof CompanyModel)
        ? new CompanyModel().deserialize(input.company)
        : input.company;
    }

    if (input.stages) {
      input.stages = input.stages.map(u => {
        if (!(u instanceof ProcessStageModel)) {
          return new ProcessStageModel().deserialize(u);
        }

        return u;
      });
    }

    if (input.ideas) {
      input.ideas = input.ideas.map(u => {
        if (!(u instanceof IdeaModel)) {
          return new IdeaModel().deserialize(u);
        }
        return u;
      });
    }

    if (input.users) {
      input.users = input.users.map(u => {
        if (!(u instanceof UserModel)) {
          return new UserModel().deserialize(u);
        }

        return u;
      });
    }

    Object.assign(this, input);
    return this;
  }
}
