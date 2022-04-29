import BaseModel from "./base.model";

export default class MilestoneModel extends BaseModel {

  _clickedIndex = null;
  isDefault = null;

  deserialize(input) {
    Object.assign(this, input);

    return this;
  }
}
