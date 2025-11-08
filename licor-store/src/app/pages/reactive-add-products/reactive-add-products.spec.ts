import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import ReactiveAddProducts from './reactive-add-products';
import { StockService } from '../../services/stockService';
import { Product } from '../../interface/product';

describe('ReactiveAddProducts', () => {
  let component: ReactiveAddProducts;
  let fixture: ComponentFixture<ReactiveAddProducts>;
  let stockService: jasmine.SpyObj<StockService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const stockServiceSpy = jasmine.createSpyObj('StockService', ['createProduct']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveAddProducts, ReactiveFormsModule],
      providers: ([
        { provide: StockService, useValue: stockServiceSpy },
        { provide: Router, useValue: routerSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ])
    }).compileComponents();

    fixture = TestBed.createComponent(ReactiveAddProducts);
    component = fixture.componentInstance;
    stockService = TestBed.inject(StockService) as jasmine.SpyObj<StockService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.stockForm.get('nombre')?.value).toBe('');
    expect(component.stockForm.get('precio')?.value).toBe(0);
    expect(component.stockForm.get('stock')?.value).toBe(0);
  });

  it('should mark form as invalid when empty', () => {
    expect(component.stockForm.valid).toBeFalse();
  });

  it('should validate required nombre field', () => {
    const nombreControl = component.stockForm.get('nombre');
    
    nombreControl?.setValue('');
    expect(nombreControl?.hasError('required')).toBeTrue();
    
    nombreControl?.setValue('Te');
    expect(nombreControl?.hasError('minlength')).toBeTrue();
    
    nombreControl?.setValue('Test Product');
    expect(nombreControl?.valid).toBeTrue();
  });

  it('should validate precio minimum value', () => {
    const precioControl = component.stockForm.get('precio');
    
    precioControl?.setValue(0);
    expect(precioControl?.hasError('min')).toBeTrue();
    
    precioControl?.setValue(10);
    expect(precioControl?.valid).toBeTrue();
  });

  it('should validate descuento range', () => {
    const descuentoControl = component.stockForm.get('descuento');
    
    descuentoControl?.setValue(-1);
    expect(descuentoControl?.hasError('min')).toBeTrue();
    
    descuentoControl?.setValue(101);
    expect(descuentoControl?.hasError('max')).toBeTrue();
    
    descuentoControl?.setValue(50);
    expect(descuentoControl?.valid).toBeTrue();
  });

  it('should create product successfully', (done) => {
    const mockProduct: Product = {
      id: 1,
      nombre: 'Test Product',
      marca: 'Test Brand',
      categoria: 'Cervezas',
      presentacion: 'Botella 355ml',
      descripcion: 'Test',
      precio: 10,
      descuento: 0,
      stock: 100,
      stockMinimo: 20,
      imagen: 'https://test.com/image.jpg'
    };

    stockService.createProduct.and.returnValue(of(mockProduct));

    component.stockForm.patchValue({
      nombre: 'Test Product',
      marca: 'Test Brand',
      categoria: 'Cervezas',
      presentacion: 'Botella 355ml',
      precio: 10,
      stock: 100,
      stockMinimo: 20
    });

    component.onSubmit();

    fixture.whenStable().then(() => {
      expect(stockService.createProduct).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/stock']);
      done();
    });
  });

  it('should handle create product error', () => {
    spyOn(window, 'alert');
    stockService.createProduct.and.returnValue(throwError(() => new Error('Error')));

    component.stockForm.patchValue({
      nombre: 'Test Product',
      marca: 'Test Brand',
      categoria: 'Cervezas',
      presentacion: 'Botella 355ml',
      precio: 10,
      stock: 100,
      stockMinimo: 20
    });

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith(jasmine.stringContaining('Error'));
  });

  it('should not submit if form is invalid', () => {
    spyOn(window, 'alert');
    
    component.onSubmit();
    
    expect(stockService.createProduct).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  xit('should update imagePreview when valid URL is entered', (done) => {
    const testUrl = 'https://example.com/image.jpg';
    
    component.stockForm.get('imagen')?.setValue(testUrl);
  
    fixture.detectChanges();
    
    setTimeout(() => {
      expect(component.imagePreview()).toBe(testUrl);
      done();
    }, 100);
  });

  it('should validate URL pattern for imagen field', () => {
    const imagenControl = component.stockForm.get('imagen');
    
    imagenControl?.setValue('invalid-url');
    expect(imagenControl?.hasError('pattern')).toBeTrue();
    
    imagenControl?.setValue('https://example.com/image.jpg');
    expect(imagenControl?.valid).toBeTrue();
  });
});