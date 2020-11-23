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
            return (prev.dOrder > current.dOrder) ? prev : current;
        });
    }

    get hasReviews() {
        return this.stats.totalEvaluations > 0;
    }

    get consolidatedPercent() {
        return (this.stats.consolidatedValue * 100) / this.budget;
    }

    getStageStats(stageId) {
        return this.stats && this.stats.stages ? this.stats.stages.find(o => o.id === stageId) : null;
    }

    getStageConsolidatedPercent(stageId) {
        let value = 0;
        const stageStats = this.getStageStats(stageId);
        if (stageStats) {
            value = (stageStats.consolidatedValue * 100) / this.budget;
        }
        // value=this.getIdeasImpactByStage(stageId) + this.getIssuesImpactByStage(stageId);
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
        })
        return (total * 100) / Number(this.budget);
    }

    getIssuesImpactByStage(stageId) {
        let total = 0;
        this.getIssuesByStage(stageId).map(i => {
            total += Number(i.totalValue);
        });
        return (total * 100) / Number(this.budget);
    }

    // get issuesImpact() {
    //     let total = 0;
    //     this.issues.map(i => {
    //         total += Number(i.totalValue);
    //     })
    //     return (total * 100) / Number(this.budget);
    // }

    // get ideasImpact() {
    //     let total = 0;
    //     this.ideas.map(i => {
    //         total += Number(i.consolidatedValue);
    //     })
    //     return (total * 100) / Number(this.budget);
    // }
}