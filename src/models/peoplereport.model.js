import BaseModel from "./base.model";
import UserModel from "./user.model";


export class PeopleReportItemModel extends BaseModel {
    get activeProject() {
        return this.projects[0];
    }

    get percentage() {
        return (
            ((this.userAverage - this.otherAverage) / Math.abs(this.otherAverage)) *
            100
        );
    }

    // get value() {
    //     //return Math.abs(this.userValue * (100 / this.totalValue));
    //     //return ((this.userValue - (this.totalValue)) / Math.abs((this.totalValue))) * 100;
    //     //return (this.userValue/this.userTotalEvaluations);
    //     return this.userAverage / (100 / this.totalAverage);
    // }

    // get totalAverage() {
    //     return this.totalValue / this.totalEvaluations;
    // }

    // get userAverage() {
    //     return this.userValue / this.userTotalEvaluations;
    // }

    deserialize(input) {
        input.user = new UserModel().deserialize(input.user);
        return super.deserialize(input);
    }
}

export default class PeopleReportModel extends BaseModel {
    avatar = null;

    avatarUrl = null;

    value = 0;

    projects = [];

    get activeProject() {
        return this.projects[0];
    }

    deserialize(input) {
        input.data = input.data.map(i => {
            return new PeopleReportItemModel().deserialize(i);
        })
        return super.deserialize(input);
    }
}