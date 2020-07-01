import BaseModel from "./base.model";

export default class CompanyToolModuleModel extends BaseModel {
    _showDetails = false;

    deserialize(input) {
        return super.deserialize(input);
    }
}