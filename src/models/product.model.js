import BaseModel from "./base.model";
import ProductCategoryModel from "./productcategory.model";
import PriceModelModel from "./pricemodel.model";

export default class ProductModel extends BaseModel {
    _showDetails = false;

    deserialize(input) {
        if (input.category) {
            input.category = new ProductCategoryModel().deserialize(input.category);
        }
        if (input.priceModel) {
            input.priceModel = new PriceModelModel().deserialize(input.priceModel);
        }

        return super.deserialize(input);
    }
}