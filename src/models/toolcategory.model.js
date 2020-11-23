import BaseModel from "./base.model";
import CompanyModel from "./company.model";
import CompanyToolModel from "./companytool.model";

export default class ToolCategoryModel extends BaseModel {
    tools = [];

    _showDetails = false;

    deserialize(input) {
        if (input.company) {
            input.company = new CompanyModel().deserialize(input.company);
        }

        if (input.tools) {
            input.tools = input.tools.map(p => {
                return new CompanyToolModel().deserialize(p);
            })
        }

        return super.deserialize(input);
    }
}