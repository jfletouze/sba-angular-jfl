import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BsFacetModule, FacetConfig, FacetListParams, FacetState, FacetTreeParams } from "@sinequa/components/facet";
import { IntlModule, Locale, LocaleData, LocalesConfig } from "@sinequa/core/intl";
import { WebServicesModule, StartConfig, StartConfigWebService } from "@sinequa/core/web-services";
import { LoginInterceptor } from "@sinequa/core/login";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ResultModule } from "@sinequa/components/result";
import { BsSelectionModule } from "@sinequa/components/selection";
import { BsLabelsModule } from "@sinequa/components/labels";
import { ResultsComponent } from './results/results.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { BsActionModule } from "@sinequa/components/action";
import { FormsModule } from "@angular/forms";
import { InputsComponent } from './inputs/inputs.component';
import { SearchComponent } from './search/search.component';
import { BsSearchModule, SearchOptions } from "@sinequa/components/search";
import { MenuComponent } from './menu/menu.component';
import { NavbarComponent } from './navbar/navbar.component';
import { UtilsModule } from "@sinequa/components/utils";
import { BsAutocompleteModule } from "@sinequa/components/autocomplete";
import { MetadataModule } from "@sinequa/components/metadata";
import { CollapseModule } from "@sinequa/components/collapse";
import { BsPreviewModule } from "@sinequa/components/preview";
import { FacetComponent } from './modules/facet/facet/facet.component';
import { AlertsComponent } from './alerts/alerts.component';
import { BsNotificationModule } from "@sinequa/components/notification";
import { PreviewComponent } from './preview/preview.component';
import { SqPreviewComponent } from './preview/sq-preview/sq-preview.component';
import { CodeComponent } from './code/code.component';
import { FacetModuleComponent } from './modules/facet/facet-module.component';
import { FacetTreeComponent } from './modules/facet/facet-tree/facet-tree.component';
import { FacetListComponent } from './modules/facet/facet-list/facet-list.component';
import { FacetFiltersComponent } from './modules/facet/facet-filters/facet-filters.component';
import { FacetRangeComponent } from './modules/facet/facet-range/facet-range.component';
import { FacetBarComponent } from './modules/facet/facet-bar/facet-bar.component';
import { FacetMultiComponent } from './modules/facet/facet-multi/facet-multi.component';
import { MySearchComponent } from './modules/facet/my-search/my-search.component';
import { FacetTagCloudComponent } from './modules/facet/facet-tag-cloud/facet-tag-cloud.component';
import { RefineComponent } from './modules/facet/refine/refine.component';
import { PreviewModuleComponent } from './modules/preview/preview-module.component';
import { PreviewHighlightsComponent } from './modules/preview/preview-highlights/preview-highlights.component';
import { PreviewLinksComponent } from './modules/preview/preview-links/preview-links.component';
import { PreviewPopupComponent } from './modules/preview/preview-popup/preview-popup.component';
import { PreviewPanelComponent } from './modules/preview/preview-panel/preview-panel.component';
import { ResultLinkPreviewComponent } from './modules/preview/result-link-preview/result-link-preview.component';
import { FacetPreviewComponent } from './modules/preview/facet-preview/facet-preview.component';
import { SimilarDocumentsComponent } from './modules/preview/similar-documents/similar-documents.component';
import { PreviewEntityFacetComponent } from './modules/preview/preview-entity-facet/preview-entity-facet.component';
import { PreviewEntityPanelComponent } from './modules/preview/preview-entity-panel/preview-entity-panel.component';
import { PreviewExtractsPanelComponent } from './modules/preview/preview-extracts-panel/preview-extracts-panel.component';
import { PreviewSearchFormComponent } from './modules/preview/preview-search-form/preview-search-form.component';
import { PreviewPagesPanelComponent } from './modules/preview/preview-pages-panel/preview-pages-panel.component';
import { PreviewPageFormComponent } from './modules/preview/preview-page-form/preview-page-form.component';
import { PreviewMinimapComponent } from './modules/preview/preview-minimap/preview-minimap.component';
import { FacetPreviewComponentComponent } from './modules/preview/facet-preview-component/facet-preview-component.component';
import { ResultModuleComponent } from './modules/result/result-module.component';

// Environment
import { environment } from "../environments/environment";
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { GlobalService } from './global.service';
import { BsModalModule } from '@sinequa/components/modal';
import { MODAL_MODEL } from '@sinequa/core/modal';
import { ResultTitleComponent } from './modules/result/result-title/result-title.component';
import { ResultExtractsComponent } from './modules/result/result-extracts/result-extracts.component';
import { ResultMissingTermsComponent } from './modules/result/result-missing-terms/result-missing-terms.component';
import { ResultThumbnailComponent } from './modules/result/result-thumbnail/result-thumbnail.component';
import { UserRatingComponent } from './modules/result/user-rating/user-rating.component';
import { SponsoredResultsComponent } from './modules/result/sponsored-results/sponsored-results.component';
import { ResultsCounterComponent } from './modules/result/results-counter/results-counter.component';
import { ResultIconComponent } from './modules/result/result-icon/result-icon.component';
import { ResultSourceComponent } from './modules/result/result-source/result-source.component';
import { BsTimelineModule } from '@sinequa/analytics/timeline';
import { FacetTestingComponent } from './modules/facet/facet-testing/facet-testing.component';
import { BasketsModuleComponent } from './modules/baskets-module/baskets-module.component';
import { EditBasketComponent } from './modules/baskets-module/edit-basket/edit-basket.component';
import { ManageBasketsComponent } from './modules/baskets-module/manage-baskets/manage-baskets.component';
import { SelectBasketsComponent } from './modules/baskets-module/select-baskets/select-baskets.component';
import { ResultBasketsComponent } from './modules/baskets-module/result-baskets/result-baskets.component';
import { BasketsMenuComponent } from './modules/baskets-module/baskets-menu/baskets-menu.component';
import { FacetBasketsComponent } from './modules/baskets-module/facet-baskets/facet-baskets.component';
import { BsBasketsModule } from '@sinequa/components/baskets';

// Initialization of @sinequa/core
export const startConfig: StartConfig = {
    app: "app",
    production: environment.production,
    autoSAMLProvider: environment.autoSAMLProvider,
    auditEnabled: true
};

// @sinequa/core config initializer
export function StartConfigInitializer(startConfigWebService: StartConfigWebService) {
    return () => startConfigWebService.fetchPreLoginAppConfig();
}

// Search options (search service)
export const searchOptions: SearchOptions = {
    routes: ["facet"]
};

// List of facet configurations (of type list and tree)
export const allFacets: FacetConfig<FacetListParams | FacetTreeParams>[] = [
    {
        name: "facet1",
        title: "Modified",
        type: "list",
        icon: "fas fa-calendar-day",
        parameters: {
            aggregation: "Modified"
        }
    },
    {
        name: "facet2",
        title: "Tree path",
        type: "tree",
        icon: "fas fa-sitemap",
        parameters: {
            aggregation: "Treepath"
        }
    },
    {
        name: "facet3",
        title: "Person",
        type: "list",
        icon: "fas fa-user",
        parameters: {
            aggregation: "Person"
        }
    }
];

// List of default facets displayed (only facet2 is displayed here)
export const defaultFacets: FacetState[] = [
    { name: "facet1", position: 0 },
    { name: "facet2", position: 1 },
    { name: "facet3", position: 2 }
];

const data: LocaleData = {
    intl: {
        locale: "en-US"
    },
    messages: {}
};

export class AppLocalesConfig implements LocalesConfig {
    defaultLocale: Locale;
    locales?: Locale[];

    constructor() {
        this.locales = [
            { name: "en", display: "msg#locale.en", data },
            { name: "fr", display: "msg#locale.fr", data },
            { name: "de", display: "msg#locale.de", data },
        ];
        this.defaultLocale = this.locales[0];
    }
}

@NgModule({
    declarations: [
        AppComponent,
        ResultsComponent,
        ButtonsComponent,
        InputsComponent,
        SearchComponent,
        MenuComponent,
        NavbarComponent,
        FacetComponent,
        AlertsComponent,
        PreviewComponent,
        SqPreviewComponent,
        CodeComponent,
        FacetModuleComponent,
        FacetTreeComponent,
        FacetListComponent,
        FacetFiltersComponent,
        FacetRangeComponent,
        FacetBarComponent,
        FacetMultiComponent,
        MySearchComponent,
        FacetTagCloudComponent,
        RefineComponent,
        PreviewModuleComponent,
        PreviewHighlightsComponent,
        PreviewLinksComponent,
        PreviewPopupComponent,
        PreviewPanelComponent,
        ResultLinkPreviewComponent,
        FacetPreviewComponent,
        SimilarDocumentsComponent,
        PreviewEntityFacetComponent,
        PreviewEntityPanelComponent,
        PreviewExtractsPanelComponent,
        PreviewSearchFormComponent,
        PreviewPagesPanelComponent,
        PreviewPageFormComponent,
        PreviewMinimapComponent,
        FacetPreviewComponentComponent,
        SearchBarComponent,
        ResultModuleComponent,
        ResultTitleComponent,
        ResultExtractsComponent,
        ResultMissingTermsComponent,
        ResultThumbnailComponent,
        UserRatingComponent,
        SponsoredResultsComponent,
        ResultsCounterComponent,
        ResultIconComponent,
        ResultSourceComponent,
        FacetTestingComponent,
        BasketsModuleComponent,
        EditBasketComponent,
        ManageBasketsComponent,
        SelectBasketsComponent,
        ResultBasketsComponent,
        BasketsMenuComponent,
        FacetBasketsComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        WebServicesModule.forRoot(startConfig),
        BsFacetModule.forRoot(allFacets, defaultFacets),
        IntlModule.forRoot(AppLocalesConfig),
        BsSearchModule.forRoot(searchOptions),
        BsTimelineModule,
        ResultModule,
        BsSelectionModule,
        BsLabelsModule,
        BsActionModule,
        FormsModule,
        BsSearchModule,
        // HighlightModule,
        BsPreviewModule,
        BsModalModule,
        MetadataModule,
        CollapseModule,
        UtilsModule,
        BsAutocompleteModule,
        BsNotificationModule,
        BsBasketsModule
    ],
    providers: [
        { provide: APP_INITIALIZER, useFactory: StartConfigInitializer, deps: [StartConfigWebService], multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: LoginInterceptor, multi: true },
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: MODAL_MODEL, useValue: {} },
        GlobalService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
