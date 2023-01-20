import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { Query } from "@sinequa/core/app-utils";
import { isExprFilter } from "@sinequa/core/web-services";

@Component({
  selector: 'sq-filters-view',
  templateUrl: './filters-view.component.html',
  styles: [`
  .sq-filter-action {
    opacity: 0.5;
  }
  .sq-filter-action:hover {
    opacity: 1;
  }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiltersViewComponent implements OnChanges {
  @Input() query: Query;
  @Input() showField = false;
  @Input() allowRemove = true;
  @Input() closeOnClickOutside = false;
  @Input() simpleModeClass = "";
  @Input() advancedModeClass = "";

  @Output() filterEdit = new EventEmitter<Query>();

  advancedMode = false;
  isSimpleFilter = true;

  ngOnChanges() {
    this.updateView();
  }

  updateView() {
    this.isSimpleFilter = !isExprFilter(this.query.filters) || !!this.query.filters?.display;
    if(!this.query.filters) {
      this.advancedMode = false;
    }
  }

  toggleEdit() {
    this.advancedMode = !this.advancedMode;
  }

  onClickOutside() {
    if(this.closeOnClickOutside) {
      this.advancedMode = false;
    }
  }

  onFiltersChange() {
    this.updateView();
    this.filterEdit.emit(this.query);
  }

  clearFilters() {
    delete this.query.filters;
    this.updateView();
    this.filterEdit.emit(this.query);
  }
}
