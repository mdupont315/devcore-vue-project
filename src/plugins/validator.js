import VeeValidate from 'vee-validate'
import Vue from 'vue'
import validationMessages from 'vee-validate/dist/locale/en';
import i18n from '../i18n';

export const maxArrayCountRule = {
    getMessage(field, maxCount, data) {
        return (data && data.message) || ((window.vm) ? window.vm.$t(`validation.messages.maxlength`, [field, maxCount[0]]) : `You can select ${maxCount[0]} ${field} or less`);
    },
    validate(tags, maxCount) {
        if (tags.length <= maxCount[0]) {
            return true;
        }
        return false;
    },
};

export const minArrayCountRule = {
    getMessage(field, minCount, data) {
        return (data && data.message) || ((window.vm) ? window.vm.$t(`validation.messages.minlength`, [field, minCount[0]]) : `You must select at least ${minCount[0]} ${field}`);
    },
    validate(tags, minCount) {
        if (tags.length >= minCount[0]) {
            return true;
        }
        return false;
    },
};



VeeValidate.Validator.extend('minlength', minArrayCountRule);
VeeValidate.Validator.extend('maxlength', maxArrayCountRule);

Vue.use(VeeValidate, {
    i18nRootKey: 'validation', // customize the root path for validation messages.
    i18n,
    errorBagName: 'vErrors',
    fieldsBagName: 'vFields',
    dictionary: {
        // en: validationMessages
    }
});


function getErrorMessage(vue, ref, form = null) {
    if (vue.vFields[ref]) {
        return (vue.vErrors.first(ref) ? vue.vErrors.first(ref) : (form && form.getError(ref) && (vue.vFields[ref] && !vue.vFields[ref].changed) ? form.getError(ref).message : null));
    }
    return form && form.getError(ref) ? form.getError(ref).message : null;
}

//function for check the field states
Vue.use({
    install(Vue) {

        Vue.prototype.$validateState = function(ref, form = null) {

            // if (this.vFields[ref]) {
            //     if (
            //         this.vFields[ref] &&
            //         (this.vFields[ref].dirty && this.vFields[ref].validated) || (form && form.hasErrors && (!this.vFields[ref].changed))
            //     ) {
            //         let result = !this.vErrors.has(ref);
            //         if (result && form && (!this.vFields[ref].changed)) {
            //             result = !form.getError(ref);
            //         }
            //         return result;
            //     }
            // } else {
            //     return form && (!form.getError(ref))
            // }
            // return null;
            const message = getErrorMessage(this, ref, form);
            const ret = message === null || message.message === null || message.message === "";
            return ret;
        }



        Vue.prototype.$displayError = function(ref, form = null) {
            return getErrorMessage(this, ref, form);
        }
    }
});