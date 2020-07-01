import BaseModel from "./base.model";
import CompanyModel from "./company.model";
import CompanyRoleModel from "./companyrole.model";
import RoleModel from "./role.model";
import PermissionModel from "./permission.model";
import {
    imageResolver
} from "../lib/utils";

export default class UserModel extends BaseModel {
    avatar = null;
    avatarUrl = null;


    getAvatarUrl(size = '0x0') {
        if (this.avatarUrl) {
            return imageResolver(this.avatarUrl, size);
        }
        return null;
    }

    get fullName() {
        return this.firstName + ((this.lastName) ? ' ' + this.lastName : '');
    }

    get role() {
        return this.roles ? this.roles[0] : null;
    }

    get formattedYearlyCosts() {
        return this.yearlyCosts / 100;
    }

    set formattedYearlyCosts(value) {
        return this.yearlyCosts = value * 100;
    }

    can(permissions = null, entity = null) {
        if (!permissions) {
            return true;
        }

        if (entity && entity._metadata && entity._metadata.permissions) {
            return entity._metadata.permissions.find(p => p === permissions) !== null;
        }

        //return true;
        this.permissions = this.permissions || [];
        const permission = this.permissions.find(p => p.name === permissions);
        return undefined !== permission && null !== permission;
    }

    deserialize(input) {
        if (input.company) {
            input.company = new CompanyModel().deserialize(input.company);
        }
        if (input.companyRole) {
            input.companyRole = new CompanyRoleModel().deserialize(input.companyRole);
        }
        if (input.roles) {
            input.roles = input.roles.map(r => {
                return new RoleModel().deserialize(r);
            })
        }
        if (input.permissions) {
            input.permissions = input.permissions.map(p => {
                return new PermissionModel().deserialize(p);
            })
        }
        return super.deserialize(input);
    }
}