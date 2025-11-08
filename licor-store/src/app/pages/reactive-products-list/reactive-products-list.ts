import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-reactive-products-list',
  imports: [],
  templateUrl: './reactive-products-list.html',
  styleUrl: './reactive-products-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReactiveProductsList { }
