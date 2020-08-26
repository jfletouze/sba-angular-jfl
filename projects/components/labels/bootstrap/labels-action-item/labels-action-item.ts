import {Component, ElementRef} from "@angular/core";
import {Keys} from "@sinequa/core/base";
import { LabelsService } from '../../labels.service';


/**
 * Component containing a form and autocomplete to search
 * through the list of labels and select one to filter the
 * search results.
 *
 * The component can be used a custom component in the Action
 * menus.
 */

@Component({
    selector: "sq-labels-action-item",
    templateUrl: "./labels-action-item.html",
    styles: [`
.sq-dropdown-form {
    min-width: 13rem;
}

.input-autocomplete{
    display: flex;
    flex-direction: column;
}
    `]
})
export class BsLabelsActionItem {
    radioButtons: any[] = [];
    public: boolean;
    autocompleteInputValue: string;

    constructor(private elementRef: ElementRef, public labelsService: LabelsService) {

        if (!!this.labelsService.publicLabelsField && !!this.labelsService.privateLabelsField) {
            this.radioButtons = [
                {
                    id: "publicLabel",
                    name: "msg#labels.public",
                    value: true,
                    disabled: false,
                    checked: true
                },
                {
                    id: "privateLabel",
                    name: "msg#labels.private",
                    value: false,
                    disabled: false,
                    checked: false
                }
            ];
        } else if (!!this.labelsService.publicLabelsField) {
            this.radioButtons = [
                {
                    id: "publicLabel",
                    name: "msg#labels.public",
                    value: true,
                    disabled: true,
                    checked: true
                }
            ];
        } else {
            this.radioButtons = [
                {
                    id: "privateLabel",
                    name: "msg#labels.private",
                    value: false,
                    disabled: true,
                    checked: true
                }
            ];
        }
    }

    private getDropdownItem(): HTMLElement | null {
        if (this.elementRef) {
            let current: HTMLElement | null = this.elementRef.nativeElement as HTMLElement;
            while (current && !current.classList.contains("dropdown-item")) {
                current = current.parentElement;
            }
            return current;
        }
        return null;
    }

    keydown(event: KeyboardEvent) {
        // Intercept tab and set focus to surrounding dropdown-item
        if (event.keyCode === Keys.tab) {
            const dropdownItem = this.getDropdownItem();
            if (dropdownItem) {
                dropdownItem.focus();
                event.preventDefault();
                return false;
            }
        }
        return undefined;
    }

    keypress(event: KeyboardEvent) {
        if (event.keyCode === Keys.enter) {
            // Stop click event firing on surrounding anchor (Firefox)
            event.preventDefault();
            return false;
        }
        return undefined;
    }

    updateLabelsNature(nature: boolean) {
        this.public = nature;
    }
}
