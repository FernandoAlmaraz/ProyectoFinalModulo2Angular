import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { StockService } from '../../services/stockService';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../interface/product';

@Component({
  selector: 'app-reactive-edit-products',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reactive-edit-products.html',
  styleUrl: './reactive-edit-products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ReactiveEditProducts {

  private fb = inject(FormBuilder);
  private stockService = inject(StockService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  submitted = signal<boolean>(false);
  imagePreview = signal<string>('https://via.placeholder.com/300x300?text=Sin+Imagen');
  isLoading = signal<boolean>(false);
  productId = signal<number | null>(null);

  public stockForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/.*\S.*/)]],
    marca: ['', [Validators.required, Validators.pattern(/.*\S.*/)]],
    categoria: ['', [Validators.required]],
    presentacion: ['', [Validators.required, Validators.pattern(/.*\S.*/)]],
    descripcion: [''],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    descuento: [0, [Validators.min(0), Validators.max(100)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    stockMinimo: [0, [Validators.required, Validators.min(0)]],
    imagen: ['', [Validators.pattern(/^https?:\/\/.+/)]]
  });

  constructor() {
    effect(() => {
      const imagenUrl = this.stockForm.get('imagen')?.value;
      if (imagenUrl && this.isValidUrl(imagenUrl)) {
        this.imagePreview.set(imagenUrl);
      } else if (!imagenUrl) {
        this.imagePreview.set('https://via.placeholder.com/300x300?text=Sin+Imagen');
      }
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.productId.set(+id);
      this.loadProduct(+id);
    } else {
      alert('❌ No se encontró el ID del producto');
      this.router.navigate(['/stock']);
    }
  }

  loadProduct(id: number) {
    this.isLoading.set(true);
    
    this.stockService.getProduct(id).subscribe({
      next: (producto) => {
        console.log('✅ Producto cargado:', producto);
        this.stockForm.patchValue({
          nombre: producto.nombre,
          marca: producto.marca,
          categoria: producto.categoria,
          presentacion: producto.presentacion,
          descripcion: producto.descripcion,
          precio: producto.precio,
          descuento: producto.descuento,
          stock: producto.stock,
          stockMinimo: producto.stockMinimo,
          imagen: producto.imagen
        });
        if (producto.imagen) {
          this.imagePreview.set(producto.imagen);
        }

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar producto:', error);
        alert('❌ Error al cargar el producto. Verifica que exista.');
        this.isLoading.set(false);
        this.router.navigate(['/stock']);
      }
    });
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  onSubmit() {
    this.submitted.set(true);

    if (this.stockForm.valid && this.productId()) {
      this.isLoading.set(true);

      const cleanNombre = (this.stockForm.value.nombre ?? '').trim();
      const cleanMarca = (this.stockForm.value.marca ?? '').trim();
      const cleanPresentacion = (this.stockForm.value.presentacion ?? '').trim();

      const productoActualizado: Product = {
        id: this.productId()!,
        nombre: cleanNombre,
        marca: cleanMarca,
        categoria: this.stockForm.value.categoria!,
        presentacion: cleanPresentacion,
        descripcion: this.stockForm.value.descripcion || '',
        precio: this.stockForm.value.precio!,
        descuento: this.stockForm.value.descuento || 0,
        stock: this.stockForm.value.stock!,
        stockMinimo: this.stockForm.value.stockMinimo!,
        imagen: this.stockForm.value.imagen || ''
      };
      this.stockService.updateProduct(this.productId()!, productoActualizado).subscribe({
        next: (response) => {
          console.log('✅ Producto actualizado exitosamente:', response);
          alert('✅ Producto actualizado correctamente');
          
          this.submitted.set(false);
          this.isLoading.set(false);
          this.router.navigate(['/stock']);
        },
        error: (error) => {
          console.error('❌ Error al actualizar producto:', error);
          alert('❌ Error al actualizar el producto. Verifica que JSON Server esté corriendo.');
          this.isLoading.set(false);
        }
      });
    } else {
      alert('⚠️ Por favor completa todos los campos requeridos correctamente');
    }
  }

  onCancel() {
    if (confirm('¿Estás seguro de cancelar? Se perderán los cambios no guardados.')) {
      this.router.navigate(['/stock']);
    }
  }

  onPreview() {
    console.log('Vista previa del formulario:', this.stockForm.value);
    console.log('Válido:', this.stockForm.valid);
    console.log('ID del producto:', this.productId());
    alert('Vista previa - Revisa la consola');
  }

  hasError(fieldName: string): boolean {
    const field = this.stockForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || this.submitted()));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.stockForm.get(fieldName);
    
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return this.getRequiredMessage(fieldName);
    }

    if (field.errors['pattern']) {
      if (fieldName === 'imagen') {
        return 'La URL debe comenzar con http:// o https://';
      }
      return 'No puede contener solo espacios en blanco';
    }

    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    if (field.errors['min']) {
      const minValue = field.errors['min'].min;
      return `El valor mínimo es ${minValue}`;
    }

    if (field.errors['max']) {
      const maxValue = field.errors['max'].max;
      return `El valor máximo es ${maxValue}`;
    }

    return '';
  }

  private getRequiredMessage(fieldName: string): string {
    const messages: { [key: string]: string } = {
      'nombre': 'El nombre es requerido',
      'marca': 'La marca es requerida',
      'categoria': 'La categoría es requerida',
      'presentacion': 'La presentación es requerida',
      'precio': 'El precio es requerido',
      'stock': 'El stock es requerido',
      'stockMinimo': 'El stock mínimo es requerido'
    };
    return messages[fieldName] || 'Este campo es requerido';
  }


 }
