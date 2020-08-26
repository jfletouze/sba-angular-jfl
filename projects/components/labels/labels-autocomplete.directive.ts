import {Directive, ElementRef, Input, EventEmitter, SimpleChanges} from "@angular/core";
import {Autocomplete, SuggestService, AutocompleteState, AutocompleteItem} from '@sinequa/components/autocomplete';
import {AppService} from '@sinequa/core/app-utils';
import {UIService} from '@sinequa/components/utils';
import {LabelsWebService, Labels} from '@sinequa/core/web-services';
import { Subscription } from 'rxjs';
import { Keys } from '@sinequa/core/base';

/**
 * Interface required to be implement by the component displaying
 * the labels items (basically the content of labelsItems)
 */
export interface LabelsItemsContainer {

    /** Update the list of items displayed by the container */
    update(items: AutocompleteItem[]): void;

    /** Event triggered when the user removes an item from the container */
    itemRemoved: EventEmitter<AutocompleteItem>;
}

@Directive({
    selector: "[sqAutocompleteLabels]"
})
export class LabelsAutocomplete extends Autocomplete {

    /** Container displaying the labelsItems */
    @Input() labelsItemsContainer?: LabelsItemsContainer;

    @Input() public: boolean; // Whether the labels are public or not

    /** Stores the selected labels items selected via Tab */
    public readonly labelsItems: AutocompleteItem[] = [];

    constructor(
        elementRef: ElementRef,
        suggestService: SuggestService,
        appService: AppService,
        uiService: UIService,
        private labelsWebService: LabelsWebService){

        super(elementRef, suggestService, appService, uiService);
    }

    /**
     * If the off input changes state, react accordingly
     * @param changes
     */
    ngOnChanges(changes: SimpleChanges){
        super.ngOnChanges(changes);

        // Subscribe to the labels items's container
        if(changes["labelsItemsContainer"] && this.labelsItemsContainer) {
            if(this._labelsSubscription){
                this._labelsSubscription.unsubscribe();
            }
            this._labelsSubscription = this.labelsItemsContainer.itemRemoved.subscribe(item => {
                this.labelsItems.splice(this.labelsItems.indexOf(item), 1);
                this.updatePlaceholder();
                this.submit.next();
            });
        }

        // If labels category changes, we must remove the labels items
        if(changes["public"] && this.labelsItems.length > 0) {
            this.labelsItems.splice(0);
            this.setInputValue("");
        }

        this.updatePlaceholder();
        this.labelsItemsContainer?.update(this.labelsItems);
    }

    private _labelsSubscription: Subscription;
    /**
     * Unsubscribe when destroying the component
     */
    ngOnDestroy(){
        super.ngOnDestroy();
        if(this._labelsSubscription){
            this._labelsSubscription.unsubscribe();
        }
    }

    /**
     * The getSuggests() method from the original directive is overriden to
     * use the labelsService rather than suggest service.
     */
    protected getSuggests(){

        const value = this.getInputValue();

        if(value) { // If there is text

            // parse
            const labels = value.split(";");

            // find label at caret location
            const position = this.getInputPosition();
            let length = 0;
            let val: { value: string, start : number, length: number } | undefined;
            for (const label of labels) {
                if (position >= length && position <= length + label.length) {
                    val = {
                        value: label,
                        start: length,
                        length: label.length
                    };
                    break;
                }
                length += label.length + 1;
            }

            // Get suggestions from web service
            if(val) {
                this.labelsWebService.list(val.value, this.public).subscribe(

                    (labels: Labels) => {
                        if(this.getState() === AutocompleteState.ACTIVE || this.getState() === AutocompleteState.OPENED){
                            this.dropdown.update(true, labels.labels.map(label => {
                                return {
                                    display: label,
                                    category: ""
                                };
                            }));
                        }
                    },
                    err => {
                        this.dropdown.update(false);
                    },
                    () => {
                        if(this.dropdown.hasItems && this.getState() === AutocompleteState.ACTIVE){
                            this.open();    // Switch from ACTIVE to OPENED (if not already)
                        }
                        else if(!this.dropdown.hasItems && this.getState() === AutocompleteState.OPENED){   // No data
                            this.active();  // Switch from OPENED to ACTIVE (if not already)
                        }
                    }
                );
            }

        }
        else {  // If empty input, restart autocomplete
            this.start();
        }
    }

    /**
     * The setAutocompleteItem() method from the original directive is overriden to
     * Sets the content of the <input> based on the given
     * Autocomplete Item.
     * @returns fqlse since lqbels items don't need to be searched
     */
    protected setAutocompleteItem(item: AutocompleteItem): boolean {
        if(item) {
            // Store the autocomplete item that will be used to create a selection
            this.setInputValue("");
            this.labelsItems.push(item);
            this.updatePlaceholder();
            this.labelsItemsContainer?.update(this.labelsItems);
        }
        return false;
    }

    /**
     * Listen to user's keyboard actions in the <input>, in order to navigate
     * and select the autocomplete suggestions.
     * Overrides the parent keydown method, adds the management of the backspace key
     * to remove labels items.
     * @param event the keyboard
     */
    keydown(event: KeyboardEvent) {

        const keydown = super.keydown(event);

        if(keydown === undefined) {
            //We can remove selections by typing <backspace> when the input is empty
            if(event.keyCode === Keys.backspace) {
                if( this.getInputValue() === '') {
                    this.labelsItems.pop();
                    this.updatePlaceholder();
                    this.labelsItemsContainer?.update(this.labelsItems);
                }
            }
        }
        return keydown;
    }

    /**
     * Updates the <input>'s placeholder to avoid displaying something
     * when there are labelsItems displayed to the left.
     */
    updatePlaceholder() {
        this._placeholder = this.labelsItems.length > 0 ? '' : this.placeholder;
    }

}
