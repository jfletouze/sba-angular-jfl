import { Component } from '@angular/core';
import { BaseComponent } from 'src/app/shared/base.component';

@Component({
  selector: 'doc-facet-tag-cloud',
  templateUrl: './facet-tag-cloud.component.html',
  styles: [`::ng-deep sq-facet-tag-cloud li:before {
    content: none !important;
  }`]
})
export class DocFacetTagCloudComponent extends BaseComponent {

  code = `<sq-facet-tag-cloud
    [results]="results"
    [aggregations]="['Company','Person']"></sq-facet-tag-cloud>`;

}
