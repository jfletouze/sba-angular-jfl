import {Pipe} from "@angular/core";
import {AbstractIntlPipe} from "./abstract-intl.pipe";
import {Utils, MapOf} from "@sinequa/core/base";

/**
 * Describes the parameters that can be passed to the [sqMessage]{@link MessagePipe} pipe
 */
export interface MessageParams {
    /**
     * Values that can be referenced from ICU messages
     */
    values?: MapOf<any>;
}

/**
 * A pipe to display messages in the current locale. Inputs are processed by
 * [IntlService.formatMessage]{@link IntlService#formatMessage}
 */
@Pipe({name: "sqMessage", pure: false})
export class MessagePipe extends AbstractIntlPipe<any, Record<string, any>> {

    protected override updateValue(value: any, params: Record<string, any>): void {
        if (!Utils.isEmpty(value)) {
            // coerce to string (eg sys date strings get converted to dates so if this happens to a title we will break otherwise)
            value = value + "";
        }
        super.updateValue(value, params);
        if (!value) {
            this.value = value;
            return;
        }
        let values: MapOf<any> | undefined;
        if (params) {
            values = params.values ? params.values : params;
        }
        this.value = this.intlService.formatMessage(value, values);
    }
}
