import BaseModel from "./base.model";

export default class MilestoneModel extends BaseModel {

  _clickedIndex = null;

  get _previousRequiredScore() {
    console.log(this)
  }


  deserialize(input) {
    console.log(input);
    Object.assign(this, input);

    return this;
  }
}
