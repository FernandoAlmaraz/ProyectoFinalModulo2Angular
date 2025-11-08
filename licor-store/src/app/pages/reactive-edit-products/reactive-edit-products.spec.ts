import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import ReactiveEditProducts from './reactive-edit-products';
import { StockService } from '../../services/stockService';
import { Product } from '../../interface/product';

describe('ReactiveEditProducts', () => {
  let component: ReactiveEditProducts;
  let fixture: ComponentFixture<ReactiveEditProducts>;
  let stockService: jasmine.SpyObj<StockService>;
  let router: jasmine.SpyObj<Router>;

  const mockProduct: Product = {
    id: 1,
    nombre: 'Test Product',
    marca: 'Test Brand',
    categoria: 'Cervezas',
    presentacion: 'Botella 355ml',
    descripcion: 'Test Description',
    precio: 10,
    descuento: 5,
    stock: 100,
    stockMinimo: 20,
    imagen: 'https://test.com/image.jpg'
  };

  beforeEach(async () => {
    const stockServiceSpy = jasmine.createSpyObj('StockService', ['getProduct', 'updateProduct']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    const activatedRouteStub = {
      snapshot: {
        paramMap: {
          get: (key: string) => '1'
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveEditProducts, ReactiveFormsModule],
      providers: ([
        { provide: StockService, useValue: stockServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        provideHttpClient(),
        provideHttpClientTesting()
      ])
    }).compileComponents();

    stockService = TestBed.inject(StockService) as jasmine.SpyObj<StockService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    stockService.getProduct.and.returnValue(of(mockProduct));
    
    fixture = TestBed.createComponent(ReactiveEditProducts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load product on init', () => {
    expect(stockService.getProduct).toHaveBeenCalledWith(1);
    expect(component.productId()).toBe(1);
  });

  it('should populate form with product data', () => {
    expect(component.stockForm.get('nombre')?.value).toBe('Test Product');
    expect(component.stockForm.get('precio')?.value).toBe(10);
    expect(component.stockForm.get('stock')?.value).toBe(100);
  });

  it('should update product successfully', (done) => {
    stockService.updateProduct.and.returnValue(of(mockProduct));

    component.stockForm.patchValue({
      nombre: 'Updated Product'
    });

    component.onSubmit();

    fixture.whenStable().then(() => {
      expect(stockService.updateProduct).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/stock']);
      done();
    });
  });

  it('should handle update error', () => {
    spyOn(window, 'alert');
    stockService.updateProduct.and.returnValue(throwError(() => new Error('Error')));

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('Error'));
  });
});