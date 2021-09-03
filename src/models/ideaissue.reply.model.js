import BaseModel from "./base.model";

export default class IdeaIssueReplyModel extends BaseModel {

  deserialize(input) {

    Object.assign(this, input);
    return this;
  }
}
