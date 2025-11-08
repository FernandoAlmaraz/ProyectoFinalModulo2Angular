import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { StockService } from '../../services/stockService';
import { Product } from '../../interface/product';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reactive-products-list',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './reactive-products-list.html',
  styleUrl: './reactive-products-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReactiveProductsList { 

private productosService = inject(StockService);

  productos = signal<Product[]>([]);
  searchTerm = signal<string>('');
  filterCategoria = signal<string>('');
  filterStock = signal<string>('');
  isLoading = signal<boolean>(false);

  productosFiltrados = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const categoria = this.filterCategoria();
    const stock = this.filterStock();

    return this.productos().filter(producto => {
      const matchesSearch = producto.nombre.toLowerCase().includes(search) ||
                          producto.marca.toLowerCase().includes(search);
      
      const matchesCategoria = !categoria || producto.categoria === categoria;
      
      let matchesStock = true;
      if (stock === 'disponible') {
        matchesStock = producto.stock > producto.stockMinimo;
      } else if (stock === 'bajo') {
        matchesStock = producto.stock > 0 && producto.stock <= producto.stockMinimo;
      } else if (stock === 'agotado') {
        matchesStock = producto.stock === 0;
      }

      return matchesSearch && matchesCategoria && matchesStock;
    });
  });

  productosDisponibles = computed(() => 
    this.productos().filter(p => p.stock > p.stockMinimo).length
  );

  productosStockBajo = computed(() => 
    this.productos().filter(p => p.stock > 0 && p.stock <= p.stockMinimo).length
  );

  productosAgotados = computed(() => 
    this.productos().filter(p => p.stock === 0).length
  );

  totalProductos = computed(() => this.productos().length);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productosService.getProducts().subscribe({
      next: (data) => {
        console.log('Productos cargados:', data);
        this.productos.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        alert('Error al cargar productos. Verifica que JSON Server esté corriendo en el puerto 3000.');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  onCategoriaChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.filterCategoria.set(value);
  }

  onStockChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.filterStock.set(value);
  }

  getStockStatus(producto: Product): string {
    if (producto.stock === 0) return 'Agotado';
    if (producto.stock <= producto.stockMinimo) return 'Stock Bajo';
    return 'Disponible';
  }

  getStockBadgeClass(producto: Product): string {
    if (producto.stock === 0) return 'bg-danger';
    if (producto.stock <= producto.stockMinimo) return 'bg-warning text-dark';
    return 'bg-success';
  }

  deleteProduct(producto: Product) {
    if (confirm(`¿Estás seguro de eliminar ${producto.nombre}?`)) {
      this.isLoading.set(true);
      this.productosService.deleteProduct(producto.id!).subscribe({
        next: () => {
          console.log('Producto eliminado:', producto.id);
          alert('✅ Producto eliminado correctamente');
          this.loadProducts(); // Recargar lista
        },
        error: (error) => {
          console.error('Error al eliminar producto:', error);
          alert('❌ Error al eliminar el producto');
          this.isLoading.set(false);
        }
      });
    }
  }

  refreshList() {
    this.loadProducts();
  }

}
