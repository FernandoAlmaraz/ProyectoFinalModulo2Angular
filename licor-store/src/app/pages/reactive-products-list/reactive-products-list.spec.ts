import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router'; // ⬅️ AGREGAR ESTE IMPORT
import { of } from 'rxjs';
import ReactiveProductsList from './reactive-products-list';
import { StockService } from '../../services/stockService';
import { Product } from '../../interface/product';

describe('ReactiveProductsList', () => {
  let component: ReactiveProductsList;
  let fixture: ComponentFixture<ReactiveProductsList>;
  let stockService: jasmine.SpyObj<StockService>;

  const mockProducts: Product[] = [
    {
      id: 1,
      nombre: 'Cerveza Paceña',
      marca: 'CBN',
      categoria: 'Cervezas',
      presentacion: 'Botella 620ml',
      descripcion: 'Test',
      precio: 8.5,
      descuento: 10,
      stock: 250,
      stockMinimo: 50,
      imagen: 'https://test.com/img.jpg'
    },
    {
      id: 2,
      nombre: 'Coca Cola',
      marca: 'Coca Cola',
      categoria: 'Bebidas',
      presentacion: 'Botella 2L',
      descripcion: 'Test',
      precio: 7,
      descuento: 0,
      stock: 10,
      stockMinimo: 50,
      imagen: 'https://test.com/img2.jpg'
    }
  ];

  beforeEach(async () => {
    const stockServiceSpy = jasmine.createSpyObj('StockService', [
      'getProducts',
      'deleteProduct'
    ]);

    await TestBed.configureTestingModule({
      imports: [ReactiveProductsList],
      providers: [ // ⬅️ QUITAR PARÉNTESIS EXTRA
        { provide: StockService, useValue: stockServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]) // ⬅️ AGREGAR ESTO
      ]
    }).compileComponents();

    stockService = TestBed.inject(StockService) as jasmine.SpyObj<StockService>;
    stockService.getProducts.and.returnValue(of(mockProducts));

    fixture = TestBed.createComponent(ReactiveProductsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    expect(stockService.getProducts).toHaveBeenCalled();
    expect(component.productos().length).toBe(2);
  });

  it('should calculate total products correctly', () => {
    expect(component.totalProductos()).toBe(2);
  });

  it('should calculate available products', () => {
    expect(component.productosDisponibles()).toBe(1);
  });

  it('should calculate low stock products', () => {
    expect(component.productosStockBajo()).toBe(1);
  });

  it('should filter products by search term', () => {
    component.searchTerm.set('Cerveza');
    expect(component.productosFiltrados().length).toBe(1);
    expect(component.productosFiltrados()[0].nombre).toBe('Cerveza Paceña');
  });

  it('should filter products by category', () => {
    component.filterCategoria.set('Cervezas');
    expect(component.productosFiltrados().length).toBe(1);
  });

  it('should delete product', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    stockService.deleteProduct.and.returnValue(of(void 0));
    stockService.getProducts.and.returnValue(of(mockProducts.slice(0, 1)));

    component.deleteProduct(mockProducts[0]); // ⬅️ Verifica que el método sea deleteProducto

    expect(stockService.deleteProduct).toHaveBeenCalledWith(1);
    expect(window.alert).toHaveBeenCalled();
  });
});