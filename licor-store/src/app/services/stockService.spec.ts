import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StockService } from './stockService';
import { Product } from '../interface/product';

describe('StockService', () => {
  let service: StockService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/productos';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StockService]
    });
    service = TestBed.inject(StockService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all products', () => {
    const mockProducts: Product[] = [
      {
        id: 1,
        nombre: 'Test',
        marca: 'Test',
        categoria: 'Test',
        presentacion: 'Test',
        descripcion: 'Test',
        precio: 10,
        descuento: 0,
        stock: 100,
        stockMinimo: 20,
        imagen: ''
      }
    ];

    service.getProducts().subscribe(products => {
      expect(products.length).toBe(1);
      expect(products).toEqual(mockProducts);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });

  it('should get product by id', () => {
    const mockProduct: Product = {
      id: 1,
      nombre: 'Test',
      marca: 'Test',
      categoria: 'Test',
      presentacion: 'Test',
      descripcion: 'Test',
      precio: 10,
      descuento: 0,
      stock: 100,
      stockMinimo: 20,
      imagen: ''
    };

    service.getProduct(1).subscribe(product => {
      expect(product).toEqual(mockProduct);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct);
  });

  it('should create a product', () => {
    const newProduct: Product = {
      nombre: 'New Product',
      marca: 'Brand',
      categoria: 'Category',
      presentacion: 'Presentation',
      descripcion: 'Description',
      precio: 100,
      descuento: 10,
      stock: 50,
      stockMinimo: 10,
      imagen: 'https://test.com/img.jpg'
    };

    service.createProduct(newProduct).subscribe(product => {
      expect(product.id).toBe(1);
      expect(product.nombre).toBe('New Product');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newProduct);
    req.flush({ ...newProduct, id: 1 });
  });

  it('should update a product', () => {
    const updatedProduct: Product = {
      id: 1,
      nombre: 'Updated',
      marca: 'Brand',
      categoria: 'Category',
      presentacion: 'Presentation',
      descripcion: 'Description',
      precio: 100,
      descuento: 10,
      stock: 50,
      stockMinimo: 10,
      imagen: 'https://test.com/img.jpg'
    };

    service.updateProduct(1, updatedProduct).subscribe(product => {
      expect(product.nombre).toBe('Updated');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(updatedProduct);
  });

  it('should delete a product', () => {
    service.deleteProduct(1).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});