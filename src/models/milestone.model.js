import BaseModel from "./base.model";

export default class MilestoneModel extends BaseModel {

  _clickedIndex = null;

  get _previousRequiredScore() {
  }


  deserialize(input) {
    Object.assign(this, input);

    return this;
  }
}
