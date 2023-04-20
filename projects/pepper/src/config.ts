import { FacetDateParams } from '@sinequa/analytics/timeline';
import { FacetConfig, FacetListParams, FacetRangeParams, FacetRefineParams, FacetTagCloudParams } from '@sinequa/components/facet';
import { METADATA_HIGHLIGHTS } from '@sinequa/components/metadata';
import { PreviewHighlightColors } from '@sinequa/components/preview';

/**
 * This list is used by Vanilla Search to activate key features in the UI.
 * The order below determines the order of menus, buttons, facets, etc.
 */
export const FEATURES: string[] = [
    //"recent-documents",             // Keep track of recently opened documents and suggest them in the autocomplete
    "recent-queries",               // Keep track of recent queries and suggest them in the autocomplete
    "saved-queries",                // Allow users to save queries to easily replay them ang suggest them in the autocomplete
    "baskets",                      // Allow users to bookmark documents in "baskets" (aka "collections") and suggest them in the autocomplete
    "labels",                       // Allow users to tag documents with labels
    "alerts",                       // Allow users to subscribe to a regular alert for a particular query
    "suggests",                     // Display general text suggestions in the autocomplete
    //"advanced-form",                // Display an advanced search form
    //"keep-advanced-form-filters",   // When the user makes a new search query, do not reset the content of the autocomplete form
    "keep-tab",                     // When the user makes a new search query, stay on the same tab
    //"keep-filters",                 // When the user makes a new search query, do not reset the filters that are active (eg. from facets)
    "toggle-keep-filters",          // Display a button to toggle the "keep-filter" option
    //"voice-recognition",            // Display a button to trigger voice recognition (supported only on Chrome-based browsers and uses Google servers for processing)
];

export type FacetParams = FacetListParams | FacetRangeParams | FacetRefineParams | FacetTagCloudParams | FacetDateParams;
export const FACETS: FacetConfig<FacetParams>[] = [{
        aggregation: "Treepath",
        name: "treepath",
        title: "msg#facet.treepath.title",
        type: "list",
        icon: "fas fa-sitemap",
        parameters: {
            showCount: true,
            searchable: true,
            focusSearch: true,
            allowExclude: true,
            allowOr: true
        }
    },
    {
        aggregation: "Geo",
        name: "geo",
        title: "msg#facet.geo.title",
        type: "list",
        icon: "fas fa-globe-americas",
        parameters: {
            showCount: true,
            searchable: true,
            focusSearch: true,
            allowExclude: true,
            allowOr: true,
            allowAnd: false,
            displayEmptyDistributionIntervals: false
        }
    },
    {
        aggregation: "Company",
        name: "company",
        title: "msg#facet.company.title",
        type: "list",
        icon: "fas fa-building",
        parameters: {
            showCount: true,
            searchable: true,
            focusSearch: true,
            allowExclude: true,
            allowOr: true,
            allowAnd: false,
            displayEmptyDistributionIntervals: false
        }
    },
    {
        aggregation: "Person",
        name: "person",
        title: "msg#facet.person.title",
        type: "list",
        icon: "fas fa-user",
        parameters: {
            showCount: true,
            searchable: true,
            focusSearch: true,
            allowExclude: true,
            allowOr: true,
            allowAnd: false,
            displayEmptyDistributionIntervals: false
        }
    },
    {
        aggregation: "DocFormat",
        name: "docformat",
        title: "msg#facet.docformat.title",
        type: "list",
        icon: "far fa-file-word",
        parameters: {
            showCount: true,
            searchable: true,
            focusSearch: true,
            allowExclude: true,
            allowOr: true,
            allowAnd: false,
            displayEmptyDistributionIntervals: false
        }
    },
    {
        aggregation: "Modified",
        name: "modified",
        title: "msg#facet.modified.title",
        type: "date",
        icon: "fas fa-calendar-day",
        parameters: {
            timelineAggregation: "Timeline",
            showCount: true,
            allowPredefinedRange: true,
            allowCustomRange: true,
            showCustomRange: true,
            replaceCurrent: true,
            displayEmptyDistributionIntervals: true,
            timelineHeight: 100,
            timelineWidth: 500
        }
    },
    {
        aggregation: "Size",
        name: "size",
        title: "msg#facet.size.title",
        type: "list",
        icon: "fas fa-sort-amount-up-alt",
        parameters: {
            showCount: true,
            searchable: false,
            allowExclude: true,
            allowOr: true,
            allowAnd: false,
            displayEmptyDistributionIntervals: false
        }
    },
    {
        aggregation: "DocumentLanguages",
        name: "documentlanguages",
        title: "msg#facet.documentlanguages.title",
        type: "list",
        icon: "far fa-comment",
        parameters: {
            showCount: true,
            searchable: false,
            allowExclude: true,
            allowOr: true,
            allowAnd: false,
            displayEmptyDistributionIntervals: false
        }
    },
    {
        aggregation: "Concepts",
        name: "concepts",
        title: "msg#facet.concepts.title",
        type: "list",
        icon: "fas fa-comment-dots",
        parameters: {
            showCount: true,
            searchable: false,
            allowExclude: true,
            allowOr: true,
            allowAnd: false,
            displayEmptyDistributionIntervals: false
        }
    }
];

export const SELECTORS_HIGHLIGHTS: {selectors: string[], highlights: PreviewHighlightColors[]}[] = [
    {
        selectors: ['sq-facet-tag-cloud a'],
        highlights: METADATA_HIGHLIGHTS
    }
];