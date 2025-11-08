import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-reactive-add-products',
  imports: [],
  templateUrl: './reactive-add-products.html',
  styleUrl: './reactive-add-products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReactiveAddProducts { }
