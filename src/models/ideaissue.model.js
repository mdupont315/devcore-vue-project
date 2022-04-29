import BaseModel from "./base.model";
import UserModel from "./user.model";

export default class IdeaIssueModel extends BaseModel {

    deserialize(input) {

        if (input.author) {
            input.author = new UserModel().deserialize(input.author);
        }

        Object.assign(this, input);
        return this;
    }
}