import BaseModel from "./base.model";

export default class IssueReplyModel extends BaseModel {

  deserialize(input) {

    Object.assign(this, input);
    return this;
  }
}
