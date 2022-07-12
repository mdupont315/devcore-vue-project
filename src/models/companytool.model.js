import BaseModel from "./base.model";
import CompanyModel from "./company.model";
import CompanyToolPrice from "./companytoolprice.model";
import CompanyToolModuleModel from "./companytoolmodule.model";
import {
  imageResolver
} from "../lib/utils";
export default class CompanyToolModel extends BaseModel {
    modules = [];

    _showDetails = false;

    getAvatarUrl(size = '0x0') {
      if (this.avatarUrl) {
          return imageResolver(this.avatarUrl, size);
      }
      return null;
  }

    deserialize(input) {
        if (input.company) {
            input.company = new CompanyModel().deserialize(input.company);
        }

        if (input.prices) {
            input.prices = input.prices.map(p => {
                return new CompanyToolPrice().deserialize(p);
            })
        }

        if (input.modules) {
            input.modules = input.modules.map(p => {
                return new CompanyToolModuleModel().deserialize(p);
            })
        }

        return super.deserialize(input);
    }
}
