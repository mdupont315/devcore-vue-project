import BaseModel from "./base.model";

export default class MilestoneModel extends BaseModel {

  deserialize(input) {
    console.log(input);
    Object.assign(this, input);

    return this;
  }
}
