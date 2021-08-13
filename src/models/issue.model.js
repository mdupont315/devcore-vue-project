import BaseModel from "./base.model";
import UserModel from "./user.model";
import ResourceModel from "./resource.model";
import IssueEffect from "./issueeffect.model";
import store from "../store";

export default class IssueModel extends BaseModel {
  files = [];

  effect = {};

  projectedTemplates = [];

  timeValue = 0;

  get effect() {
    console.log("ACTIVE TEMPLATES");
    console.log(this.effect);
    return this.effect;
  }

  set effect(value) {
    console.log("ACTIVE TEMPLATES");
    console.log(this.effect);
    if (value) {
      this.effect = value;
    } else {
      this.effect = {};
    }
  }

  set activeTemplates(value) {
    if (value) {
      this.activeTemplates = value;
    } else {
      this.projectedTemplates = [];
    }
  }

  set projectedTemplates(value) {
    if (value) {
      this.projectedTemplates = value;
    } else {
      this.projectedTemplates = [];
    }
  }

  get projectedTemplates() {
    return this.projectedTemplates;
  }

  get issueActiveEffect() {
    return this.effect;
  }

  get hasFile() {
    return this.files && this.files.length > 0;
  }

  get file() {
    return this.files[0];
  }

  set file(value) {
    if (value) {
      this.files[0] = value;
    } else {
      delete this.files[0];
    }
  }

  get timeTotalValue() {
    let total = 0;
    if (this.timeValue !== 0) {
      total -= Math.round(this.author.formattedHourlyCosts * this.timeValue);
    }
    return total;
  }

  get moneyTotalValue() {
    let total = 0;

    if (this.moneyValue !== 0) {
      total -= this.moneyValue;
    }
    return total;
  }

  get getHourlyCostsByRole() {
    let roleHourlyCosts = [];
    let rolesAverage = [];
    const roles = store.getters["companyRole/all"];
    rolesAverage = roles.map(role =>
      role.users.map(user => {
        return {
          companyRoleId: role.id,
          hourlyAverage: user.formattedHourlyCosts
        };
      })
    );

    rolesAverage.map(roleUsers => {
      let roleId = roleUsers[0].companyRoleId;
      let hourlyAverage = roleUsers[0].hourlyAverage;

      if (roleUsers.length > 1) {
        hourlyAverage =
          roleUsers.reduce((total, user) => total + user.hourlyAverage, 0) /
          roleUsers.length;
      }
      roleHourlyCosts.push({ roleId, hourlyAverage });
    });
    return roleHourlyCosts;
  }

  get effectedMoneyTotalValue() {
    let total = 0;
    total -= this.moneyTotalValue + this.timeTotalValue;
    const active = this.effect;
    if (active) {
      total -= active.effectValue;
      if (active.templates && active.templates.length > 0) {
        active.templates.forEach(template => {
          const { roleId } = template;
          const { effectTime } = template;

          //money value
          total -= template.effectValue;

          //time value
          total -=
            this.getHourlyCostsByRole.find(r => r.companyRoleId == roleId)
              .hourlyAverage * effectTime;
        });
      }
    }
    return total;
  }

  get stageId() {
    return this.parentStructure.stageId;
  }

  set stageId(value) {
    this.parentStructure.stageId = value;
  }

  get operationId() {
    return this.parentStructure.operationId;
  }

  set operationId(value) {
    this.parentStructure.operationId = value;
  }

  get phaseId() {
    return this.parentStructure.phaseId;
  }

  set phaseId(value) {
    this.parentStructure.phaseId = value;
  }

  get parentStructure() {
    if (!this._parentStructure) {
      this._parentStructure = {};
      this._parentStructure.processId = this.processId;
      if (this.parent) {
        if (this.parent.__typename === "ProcessPhase") {
          this._parentStructure.stageId = this.parent.operation.stageId;
          this._parentStructure.operationId = this.parent.operation.id;
          this._parentStructure.phaseId = this.parent.id;
        } else if (this.parent.__typename === "ProcessOperation") {
          this._parentStructure.stageId = this.parent.stageId;
          this._parentStructure.operationId = this.parent.id;
        } else {
          this._parentStructure.stageId = this.parent.id;
        }
      }
    }
    return this._parentStructure;
  }

  deserialize(input) {
    if (input.author) {
      input.author = new UserModel().deserialize(input.author);
    }

    if (input.files) {
      input.files = input.files.map(f => {
        return new ResourceModel().deserialize(f);
      });
    }

    if (input.effect) {
      input.effect = new IssueEffect().deserialize(input.effect);
    }

    Object.assign(this, input);
    return this;
  }
}
