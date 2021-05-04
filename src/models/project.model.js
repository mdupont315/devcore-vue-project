import BaseModel from "./base.model";

export default class ProjectModel extends BaseModel {
  ideas = [];

  userIdeas = [];

  issues = [];

  users = [];

  tools = [];

  stages = [];

  stats = {};

  getStage(stageId) {
    return this.stages.find(o => o.processStageId === stageId);
  }

  get currentStage() {
    return this.stages.reduce(function(prev, current) {
      return prev.dOrder > current.dOrder ? prev : current;
    });
  }

  get hasReviews() {
    console.log(this.stats)
    return this.stats.totalEvaluations > 0;
  }

  get consolidatedPercent() {
    console.log(this.budget);
    return (this.stats.consolidatedValue * 100) / this.budget;
  }

  getStageStats(stageId) {
    return this.stats && this.stats.stages
      ? this.stats.stages.find(o => o.id === stageId)
      : null;
  }

  getStageConsolidatedPercent(stageId) {
    let value = 0;
    const stageStats = this.getStageStats(stageId);
    if (stageStats) {
      console.log(typeof this.budget)
      console.log((stageStats.consolidatedValue * 100) / this.budget);
      value = (stageStats.consolidatedValue * 100) / this.budget;
    }
    return value;
  }

  getIdeasByStage(stageId) {

    return this.ideas.filter(o => o.stageId == stageId);
  }

  getIssuesByStage(stageId) {
    return this.issues.filter(o => o.projectStageId == stageId);
  }

  getIdeasImpactByStage(stageId) {
    let total = 0;
    this.getIdeasByStage(stageId).map(i => {
      total += Number(i.consolidatedValue);
    });
    return (total * 100) / Number(this.budget);
  }

  getIssuesImpactByStage(stageId) {
    let total = 0;
    this.getIssuesByStage(stageId).map(i => {
      total += Number(i.totalValue);
    });
    return (total * 100) / Number(this.budget);
  }

}
