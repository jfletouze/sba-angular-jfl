import {Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy} from "@angular/core";
import {Results, Aggregation, AggregationItem, Suggestion, CCColumn} from "@sinequa/core/web-services";
import {Utils, Keys, FieldValue} from "@sinequa/core/base";
import {FacetService} from "../../facet.service";
import {Action} from "@sinequa/components/action";
import {AbstractFacet} from "../../abstract-facet";

@Component({
    selector: "sq-facet-list",
    templateUrl: "./facet-list.html",
    styleUrls: ["./facet-list.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BsFacetList extends AbstractFacet implements OnChanges {
    @Input() name: string; // If ommited, the aggregation name is used
    @Input() results: Results;
    @Input() aggregation: string;
    @Input() showCount: boolean = true; // Show the number of occurrences
    @Input() searchable: boolean = true; // Allow to search for items in the facet
    @Input() allowExclude: boolean = true; // Allow to exclude selected items
    @Input() allowOr: boolean = true; // Allow to search various items in OR mode
    @Input() allowAnd: boolean = true; // Allow to search various items in AND mode
    @Input() displayEmptyDistributionIntervals: boolean = false; // If the aggregration is a distribution, then this property controls whether empty distribution intervals will be displayed

    // Aggregation from the Results object
    data: Aggregation | undefined;

    // Search
    searchQuery = ""; // ngModel for textarea
    searchBar = false; // Collapsed by default
    suggestDelay = 200;
    private readonly debounceSuggest: () => void;
    suggestions: Suggestion[] = [];

    // Loading more data
    skip = 0;
    count = 0;
    loadingMore = false;

    // Sets to keep track of selected/excluded/filtered items
    filtered: {value: FieldValue, display: string | undefined, count?: number, $column?: CCColumn}[] = []
    // TODO keep track of excluded terms and display them with specific color private

    // Actions (displayed in facet menu)
    // All actions are built in the constructor
    private readonly filterItemsOr: Action;
    private readonly filterItemsAnd: Action;
    private readonly excludeItems: Action;
    private readonly clearFilters: Action;
    private readonly searchItems: Action;


    constructor(
        private facetService: FacetService,
        private changeDetectorRef: ChangeDetectorRef){
        super();

        // Keep documents with ANY of the selected items
        this.filterItemsOr = new Action({
            icon: "fas fa-filter",
            title: "msg#facet.filterItems",
            action: () => {
                if (this.data) {
                    this.facetService.addFilterSearch(this.getName(), this.data, this.getSelectedItems());
                }
            }
        });

        // Keep documents with ALL the selected items
        this.filterItemsAnd = new Action({
            icon: "fas fa-bullseye",
            title: "msg#facet.filterItemsAnd",
            action: () => {
                if (this.data) {
                    this.facetService.addFilterSearch(this.getName(), this.data, this.getSelectedItems(), {and: true});
                }
            }
        });

        // Exclude document with selected items
        this.excludeItems = new Action({
            icon: "fas fa-times",
            title: "msg#facet.excludeItems",
            action: () => {
                if (this.data) {
                    this.facetService.addFilterSearch(this.getName(), this.data, this.getSelectedItems(), {not: true});
                }
            }
        });

        // Clear the current filters
        this.clearFilters = new Action({
            icon: "far fa-minus-square",
            title: "msg#facet.clearSelects",
            action: () => {
                this.facetService.clearFiltersSearch(this.getName(), true);
            }
        });

        // Search for a value in this list
        this.searchItems = new Action({
            icon: "fas fa-search",
            title: "msg#facet.searchItems",
            action: () => {
                this.searchBar = !this.searchBar;
                if(!this.searchBar){
                    this.suggestions.splice(0);
                    this.searchQuery = ""; // Remove suggestions if some remain
                }
                this.changeDetectorRef.markForCheck();
            }
        });

        // The suggest (autocomplete) query is debounded to avoid flooding the server
        this.debounceSuggest = Utils.debounce(() => {
            this._suggest();
        }, this.suggestDelay);
    }

    /**
     * Name of the facet, used to create and retrieve selections
     * through the facet service.
     */
    getName() : string {
        return this.name || this.aggregation;
    }

    /**
     * OnChanges listener awaits new results from the search service
     * This completely resets the display
     * @param changes
     */
    ngOnChanges(changes: SimpleChanges) {
        if (!!changes["results"]) {     // New data from the search service
            if(!this.count){
                this.count = this.facetService.getAggregationCount(this.aggregation);
            }
            this.filtered.length = 0;
            this.data = this.facetService.getAggregation(this.aggregation, this.results);
            this.skip = 0;
            this.searchBar = false;
            this.searchQuery = "";
            this.suggestions.splice(0);
            this.refreshFiltered();
        }
    }

    /**
     * Returns all the actions that are relevant in the current context
     */
    get actions(): Action[] {

        const actions: Action[] = [];

        const selected = this.getSelectedItems();

        if(!this.hasSuggestions() && selected.length > 0) {
            if(this.allowOr){
                actions.push(this.filterItemsOr);
            }
            if(this.allowAnd && selected.length > 1){
                actions.push(this.filterItemsAnd);
            }
            if(this.allowExclude){
                actions.push(this.excludeItems);
            }
        }

        if(!this.hasSuggestions() && this.hasFiltered()) {
            actions.push(this.clearFilters);
        }

        if(this.searchable){
            actions.push(this.searchItems);
        }

        return actions;
    }


    // Filtered items

    /**
     * Actualize the state of filtered items (note that excluded terms are not in the distribution, so the equivalent cannot be done)
     */
    refreshFiltered(){
        if (this.data && this.data.items) {
            this.data.items.forEach(item => {
                if (this.data && this.facetService.itemFiltered(this.getName(), this.data, item)) {
                    if (!this.isFiltered(item)) {
                    this.filtered.push({value: item.value, display: item.display || (item.value as string), count: item.count, $column: item.$column});
                    }
                }
            });
        }

        // refresh filters from breadcrumbs
        const items = this.facetService.getAggregationItemsFiltered(this.getName(), this.data?.valuesAreExpressions);
        items.forEach(item => {
            const value = {value: item.value, display: item.display || (item.value as string), $column: item.$column};
            if (!this.isFiltered(item)) {
                this.filtered.push(value);
            }
        });
    }

    /**
     * Returns true if the given AggregationItem is filtered
     * @param item
     */
    isFiltered(item: AggregationItem | Suggestion): boolean {
        const display = (this.isAggregationItem(item)) ? item.display || (item.value as string) : item.display
        return this.filtered.some(it => it.display === display);
    }

    /**
     * Returns true if there is an active selection (or exclusion) from this facet
     */
    hasFiltered(): boolean {
        return this.facetService.hasFiltered(this.getName());
    }

    /**
     * Called when clicking on a facet item text
     * @param item
     * @param event
     */
    filterItem(item: AggregationItem, event) : boolean {
        if (this.data) {
            if (!this.isFiltered(item)) {
                this.facetService.addFilterSearch(this.getName(), this.data, item);
            }
            else {
                this.facetService.removeFilterSearch(this.getName(), this.data, item);
            }
        }
        event.preventDefault();
        event.stopPropagation();
        return false;   // Stop the propagation of the event (link inside link)
    }


    // Selected items

    /**
     * Returns true if the given AggregationItem is selected
     * @param item
     */
    isSelected(item: AggregationItem) : boolean {
        return !!item.$selected;
    }

    /**
     * Returns all the selected items
     */
    getSelectedItems(): AggregationItem[] {
        if(!this.data || !this.data.items)
            return [];
        return this.data.items.filter(i => this.isSelected(i));
    }

    /**
     * Called when selecting/unselecting an item in the facet
     * @param item
     */
    selectItem(item: AggregationItem) : boolean {
        if(!this.isFiltered(item)){
            item.$selected = !item.$selected;
        }
        return false;
    }


    // Loading more items

    /**
     * Returns true if this facet can get more data from the server
     * (The only way to guess is to check if the facet is "full", it capacity being the (skip+)count)
     */
    get hasMore(): boolean {
        return !!this.data && this.data.items && this.data.items.length >= this.skip + this.count;
    }

    /**
     * Called on loadMore button click
     */
    loadMore(){
        if (this.data) {
            this.skip += this.data.items.length;
            this.loadingMore = true;
            Utils.subscribe(this.facetService.loadData(this.aggregation, this.skip, this.count),
                agg => {
                    this.loadingMore = false;
                    if (agg && agg.items) {
                        if (this.data) {
                            this.data.items = this.data.items.concat(agg.items);
                        }
                        this.refreshFiltered();
                        this.changeDetectorRef.markForCheck();
                    }
                },
                err => {
                    this.loadingMore = false;
                });
        }
        return false; // Avoids following href
    }


    // Suggest / Search

    /**
     * Returns true if the search mode is active (ie. there are suggestions to display in place of the aggregation)
     */
    hasSuggestions(): boolean {
        return this.suggestions.length > 0;
    }

    /**
     * Called when clicking on a facet suggest text
     * @param suggest autocomplete suggestion returned by the suggestfield API
     * @param event
     */
    filterSuggest(suggest: Suggestion, event) : boolean {
        const item: AggregationItem = {
            value: suggest.normalized || suggest.display,
            display: suggest.display,
            count: 0
        };
        return this.filterItem(item, event);
    }

    /**
     * Called on keyup event on search input
     * @param event
     */
    search(event: KeyboardEvent){
        if(this.searchQuery.trim() === "")
            return;

        if(event.keyCode === Keys.enter){
            // Get new distribution with prefix
            // this.skip = 0;

            // TODO: when API allows for prefixes

            // empty the form
            this.searchQuery = "";
        }

    }

    /**
     * Called on NgModel change (searchQuery)
     * Uses the suggestfield API to retrieve suggestions from the server
     * The suggestions "override" the data from the distribution (until search results are cleared)
     */
    suggest(){

        // If nothing to suggest, switch to normal distribution
        if(this.searchQuery.trim() === ""){
            this.suggestions.splice(0);
        }
        // Use fielded autocomplete to populate facet
        // Debounce is used to avoid flooding the the server
        else {
            this.debounceSuggest();
        }

    }

    private _suggest() {
        // Use autocomplete to refresh list
        if (!this.data) {
            return;
        }
        Utils.subscribe(this.facetService.suggest(this.searchQuery, this.data.column),
            (items) => {
                this.suggestions = [...items.slice(0, this.count)];
                const hasSuggestions = (this.suggestions.length > 0);
                if (!hasSuggestions && this.searchQuery.trim() !== "") {
                    this.suggestions = [{ // Display "no results"
                        display: "",
                        category: ""
                    }];
                }
            },
            (err) => {
                console.log(err);
                this.suggestions.splice(0);
            },
            () => {
                if(this.searchQuery.trim() === ""){
                    this.suggestions.splice(0); // Might happen if these results are late
                }
                this.changeDetectorRef.markForCheck();
            });
    }

    /* AbstractFacet abstract methods */
    isHidden(): boolean {
        return !this.data;
    }

    /**
     * The items in the aggregation.
     *
     * @readonly
     * @type {AggregationItem[]}
     * @memberof BsFacetList
     */
    public get items(): AggregationItem[] {
        if (!this.data) {
            return [];
        }
        if (!this.data.isDistribution || this.displayEmptyDistributionIntervals) {
            return this.data.items;
        }
        return this.data.items.filter(item => item.count > 0);
    }

    private isAggregationItem(item: AggregationItem | Suggestion): item is AggregationItem {
        return (item as AggregationItem).value !== undefined;
    }
}