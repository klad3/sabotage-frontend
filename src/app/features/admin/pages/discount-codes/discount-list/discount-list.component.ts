import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../../core/services/supabase.service';
import { DbDiscountCode } from '../../../../../core/models/product.model';

@Component({
    selector: 'app-discount-list',
    imports: [FormsModule],
    template: `
        <div class="discount-list-page">
            <div class="page-header">
                <h1>Códigos de Descuento</h1>
                <button class="btn-primary" (click)="openModal()">
                    <span>➕</span> Nuevo Código
                </button>
            </div>

            @if (loading()) {
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Cargando códigos...</p>
                </div>
            } @else if (discountCodes().length === 0) {
                <div class="empty-state">
                    <span class="empty-icon">🏷️</span>
                    <h3>No hay códigos de descuento</h3>
                    <p>Crea códigos para ofrecer promociones a tus clientes</p>
                    <button class="btn-primary" (click)="openModal()">Crear Código</button>
                </div>
            } @else {
                <div class="codes-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Descuento</th>
                                <th>Uso</th>
                                <th>Expira</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for (code of discountCodes(); track code.id) {
                                <tr>
                                    <td class="code-cell">
                                        <span class="code-text">{{ code.code }}</span>
                                    </td>
                                    <td class="discount-cell">{{ code.percentage }}%</td>
                                    <td>
                                        @if (code.usage_limit) {
                                            {{ code.usage_count }}/{{ code.usage_limit }}
                                        } @else {
                                            {{ code.usage_count }} usos
                                        }
                                    </td>
                                    <td>
                                        @if (code.expires_at) {
                                            {{ formatDate(code.expires_at) }}
                                        } @else {
                                            Sin expiración
                                        }
                                    </td>
                                    <td>
                                        <span class="status-badge" [class.active]="code.is_active">
                                            {{ code.is_active ? 'Activo' : 'Inactivo' }}
                                        </span>
                                    </td>
                                    <td class="actions-cell">
                                        <button class="btn-icon" (click)="editCode(code)" title="Editar">✏️</button>
                                        <button class="btn-icon" (click)="toggleActive(code)" [title]="code.is_active ? 'Desactivar' : 'Activar'">
                                            {{ code.is_active ? '🔴' : '🟢' }}
                                        </button>
                                        <button class="btn-icon delete" (click)="confirmDelete(code)" title="Eliminar">🗑️</button>
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
            }

            @if (showModal()) {
                <div class="modal-overlay" (click)="closeModal()">
                    <div class="modal" (click)="$event.stopPropagation()">
                        <h3>{{ editingCode() ? 'Editar Código' : 'Nuevo Código de Descuento' }}</h3>
                        
                        <div class="form-group">
                            <label>Código *</label>
                            <input 
                                type="text" 
                                [(ngModel)]="formData.code" 
                                placeholder="Ej: VERANO2024"
                                [disabled]="!!editingCode()"
                            >
                            <span class="hint">Mayúsculas, sin espacios</span>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Descuento (%) *</label>
                                <input type="number" [(ngModel)]="formData.percentage" min="1" max="100" placeholder="10">
                            </div>

                            <div class="form-group">
                                <label>Límite de uso</label>
                                <input type="number" [(ngModel)]="formData.usage_limit" min="0" placeholder="Sin límite">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Fecha de expiración</label>
                            <input type="datetime-local" [(ngModel)]="formData.expires_at">
                        </div>

                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" [(ngModel)]="formData.is_active">
                                <span>Código Activo</span>
                            </label>
                        </div>

                        <div class="modal-actions">
                            <button class="btn-secondary" (click)="closeModal()">Cancelar</button>
                            <button class="btn-primary" (click)="saveCode()" [disabled]="saving()">
                                {{ saving() ? 'Guardando...' : 'Guardar' }}
                            </button>
                        </div>
                    </div>
                </div>
            }

            @if (showDeleteModal()) {
                <div class="modal-overlay" (click)="showDeleteModal.set(false)">
                    <div class="modal" (click)="$event.stopPropagation()">
                        <h3>¿Eliminar código?</h3>
                        <p>El código "{{ codeToDelete()?.code }}" será eliminado permanentemente.</p>
                        <div class="modal-actions">
                            <button class="btn-secondary" (click)="showDeleteModal.set(false)">Cancelar</button>
                            <button class="btn-danger" (click)="deleteCode()" [disabled]="deleting()">
                                {{ deleting() ? 'Eliminando...' : 'Eliminar' }}
                            </button>
                        </div>
                    </div>
                </div>
            }
        </div>
    `,
    styles: [`
        .discount-list-page {
            max-width: 1200px;
            margin: 0 auto;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }

        .page-header h1 {
            font-size: 28px;
            font-weight: 700;
            color: #fff;
            margin: 0;
        }

        .btn-primary {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: linear-gradient(135deg, #ff6b6b, #feca57);
            border: none;
            border-radius: 12px;
            color: #000;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }

        .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
        }

        .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .loading-state, .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 80px;
            background: rgba(26, 26, 26, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top-color: #feca57;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 16px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .empty-icon {
            font-size: 64px;
            margin-bottom: 16px;
        }

        .empty-state h3 {
            color: #fff;
            margin: 0 0 8px;
        }

        .empty-state p {
            color: rgba(255, 255, 255, 0.5);
            margin: 0 0 24px;
        }

        .codes-table {
            background: rgba(26, 26, 26, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            overflow: hidden;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            text-align: left;
            padding: 16px;
            background: rgba(255, 255, 255, 0.03);
            color: rgba(255, 255, 255, 0.6);
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }

        td {
            padding: 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            color: #fff;
        }

        .code-cell .code-text {
            font-family: monospace;
            background: rgba(254, 202, 87, 0.1);
            padding: 4px 12px;
            border-radius: 6px;
            color: #feca57;
            font-weight: 600;
        }

        .discount-cell {
            font-weight: 600;
            color: #10b981;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }

        .status-badge.active {
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
        }

        .status-badge:not(.active) {
            background: rgba(244, 63, 94, 0.2);
            color: #f43f5e;
        }

        .actions-cell {
            white-space: nowrap;
        }

        .actions-cell button {
            display: inline-flex;
            vertical-align: middle;
            margin-right: 8px;
        }

        .actions-cell button:last-child {
            margin-right: 0;
        }

        .btn-icon {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.05);
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-icon:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .btn-icon.delete:hover {
            background: rgba(244, 63, 94, 0.2);
        }

        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .modal {
            background: #1a1a1a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 32px;
            max-width: 480px;
            width: 90%;
        }

        .modal h3 {
            color: #fff;
            margin: 0 0 24px;
        }

        .modal p {
            color: rgba(255, 255, 255, 0.7);
            margin: 0 0 24px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 8px;
        }

        .form-group input {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #fff;
            font-size: 14px;
        }

        .form-group input:focus {
            outline: none;
            border-color: #feca57;
        }

        .form-group input:disabled {
            opacity: 0.5;
        }

        .hint {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.4);
            margin-top: 4px;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
        }

        .checkbox-label input {
            width: auto;
        }

        .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 24px;
        }

        .btn-secondary {
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 12px;
            color: #fff;
            font-weight: 500;
            cursor: pointer;
        }

        .btn-danger {
            padding: 12px 24px;
            background: #f43f5e;
            border: none;
            border-radius: 12px;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
        }

        .btn-danger:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        @media (max-width: 768px) {
            .page-header {
                flex-direction: column;
                gap: 16px;
                align-items: flex-start;
            }

            .page-header h1 {
                font-size: 24px;
            }

            .codes-table {
                overflow-x: auto;
            }

            table {
                min-width: 600px;
            }

            .form-row {
                grid-template-columns: 1fr;
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscountListComponent implements OnInit {
    private readonly supabase = inject(SupabaseService);

    readonly loading = signal(true);
    readonly saving = signal(false);
    readonly deleting = signal(false);
    readonly discountCodes = signal<DbDiscountCode[]>([]);
    readonly showModal = signal(false);
    readonly showDeleteModal = signal(false);
    readonly editingCode = signal<DbDiscountCode | null>(null);
    readonly codeToDelete = signal<DbDiscountCode | null>(null);

    formData = {
        code: '',
        percentage: 10,
        usage_limit: null as number | null,
        expires_at: '',
        is_active: true
    };

    async ngOnInit(): Promise<void> {
        await this.loadCodes();
    }

    private async loadCodes(): Promise<void> {
        this.loading.set(true);
        try {
            const codes = await this.supabase.getAll<DbDiscountCode>('discount_codes', {
                orderBy: { column: 'created_at', ascending: false }
            });
            this.discountCodes.set(codes);
        } catch (error) {
            console.error('Error loading discount codes:', error);
        } finally {
            this.loading.set(false);
        }
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    openModal(): void {
        this.editingCode.set(null);
        this.formData = { code: '', percentage: 10, usage_limit: null, expires_at: '', is_active: true };
        this.showModal.set(true);
    }

    editCode(code: DbDiscountCode): void {
        this.editingCode.set(code);
        this.formData = {
            code: code.code,
            percentage: code.percentage,
            usage_limit: code.usage_limit,
            expires_at: code.expires_at ? code.expires_at.slice(0, 16) : '',
            is_active: code.is_active
        };
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
        this.editingCode.set(null);
    }

    async saveCode(): Promise<void> {
        if (!this.formData.code.trim() || !this.formData.percentage) {
            alert('Código y porcentaje son requeridos');
            return;
        }

        this.saving.set(true);
        try {
            const data = {
                code: this.formData.code.toUpperCase().trim(),
                percentage: this.formData.percentage,
                usage_limit: this.formData.usage_limit || null,
                expires_at: this.formData.expires_at || null,
                is_active: this.formData.is_active
            };

            const editing = this.editingCode();
            if (editing) {
                await this.supabase.update<DbDiscountCode>('discount_codes', editing.id, data);
            } else {
                await this.supabase.insert<DbDiscountCode>('discount_codes', data);
            }
            await this.loadCodes();
            this.closeModal();
        } catch (error) {
            console.error('Error saving discount code:', error);
            alert('Error al guardar el código');
        } finally {
            this.saving.set(false);
        }
    }

    async toggleActive(code: DbDiscountCode): Promise<void> {
        try {
            await this.supabase.update<DbDiscountCode>('discount_codes', code.id, {
                is_active: !code.is_active
            });
            await this.loadCodes();
        } catch (error) {
            console.error('Error toggling discount code:', error);
        }
    }

    confirmDelete(code: DbDiscountCode): void {
        this.codeToDelete.set(code);
        this.showDeleteModal.set(true);
    }

    async deleteCode(): Promise<void> {
        const code = this.codeToDelete();
        if (!code) return;

        this.deleting.set(true);
        try {
            await this.supabase.delete('discount_codes', code.id);
            await this.loadCodes();
            this.showDeleteModal.set(false);
        } catch (error) {
            console.error('Error deleting discount code:', error);
        } finally {
            this.deleting.set(false);
        }
    }
}
