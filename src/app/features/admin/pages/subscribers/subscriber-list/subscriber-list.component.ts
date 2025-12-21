import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../../core/services/supabase.service';
import { DbSubscriber } from '../../../../../core/models/product.model';

@Component({
    selector: 'app-subscriber-list',
    imports: [FormsModule],
    template: `
        <div class="subscriber-list-page">
            <div class="page-header">
                <div class="header-left">
                    <h1>Suscriptores</h1>
                    <span class="count">{{ subscribers().length }} suscriptores</span>
                </div>
                <button class="btn-export" (click)="exportCsv()">
                    <span>📥</span> Exportar CSV
                </button>
            </div>

            <div class="search-bar">
                <span class="search-icon">🔍</span>
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o email..." 
                    [(ngModel)]="searchTerm"
                    (input)="filterSubscribers()"
                >
            </div>

            @if (loading()) {
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Cargando suscriptores...</p>
                </div>
            } @else if (filteredSubscribers().length === 0) {
                <div class="empty-state">
                    <span class="empty-icon">📧</span>
                    <h3>No hay suscriptores</h3>
                    <p>Los suscriptores aparecerán aquí cuando se registren</p>
                </div>
            } @else {
                <div class="subscribers-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                <th>País</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for (sub of filteredSubscribers(); track sub.id) {
                                <tr>
                                    <td class="name-cell">
                                        <span class="avatar">{{ getInitials(sub.first_name, sub.last_name) }}</span>
                                        <span>{{ sub.first_name }} {{ sub.last_name }}</span>
                                    </td>
                                    <td class="email-cell">{{ sub.email }}</td>
                                    <td>{{ sub.phone || '-' }}</td>
                                    <td>{{ sub.country || '-' }}</td>
                                    <td class="date-cell">{{ formatDate(sub.created_at) }}</td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
            }
        </div>
    `,
    styles: [`
        .subscriber-list-page {
            max-width: 1400px;
            margin: 0 auto;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }

        .header-left h1 {
            font-size: 28px;
            font-weight: 700;
            color: #fff;
            margin: 0;
        }

        .count {
            color: rgba(255, 255, 255, 0.5);
            font-size: 14px;
        }

        .btn-export {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            color: #fff;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-export:hover {
            background: rgba(255, 255, 255, 0.15);
        }

        .search-bar {
            position: relative;
            margin-bottom: 24px;
        }

        .search-icon {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
        }

        .search-bar input {
            width: 100%;
            padding: 14px 14px 14px 48px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #fff;
            font-size: 14px;
        }

        .search-bar input::placeholder {
            color: rgba(255, 255, 255, 0.4);
        }

        .search-bar input:focus {
            outline: none;
            border-color: #feca57;
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
            margin: 0;
        }

        .subscribers-table {
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

        tr:hover td {
            background: rgba(255, 255, 255, 0.02);
        }

        .name-cell {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .avatar {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #ff6b6b, #feca57);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            color: #000;
        }

        .email-cell {
            color: #feca57;
        }

        .date-cell {
            color: rgba(255, 255, 255, 0.5);
            font-size: 13px;
        }

        @media (max-width: 768px) {
            .subscribers-table {
                overflow-x: auto;
            }

            table {
                min-width: 600px;
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriberListComponent implements OnInit {
    private readonly supabase = inject(SupabaseService);

    readonly loading = signal(true);
    readonly subscribers = signal<DbSubscriber[]>([]);
    readonly filteredSubscribers = signal<DbSubscriber[]>([]);

    searchTerm = '';

    async ngOnInit(): Promise<void> {
        await this.loadSubscribers();
    }

    private async loadSubscribers(): Promise<void> {
        this.loading.set(true);
        try {
            const subscribers = await this.supabase.getAll<DbSubscriber>('subscribers', {
                orderBy: { column: 'created_at', ascending: false }
            });
            this.subscribers.set(subscribers);
            this.filteredSubscribers.set(subscribers);
        } catch (error) {
            console.error('Error loading subscribers:', error);
        } finally {
            this.loading.set(false);
        }
    }

    filterSubscribers(): void {
        if (!this.searchTerm.trim()) {
            this.filteredSubscribers.set(this.subscribers());
            return;
        }

        const term = this.searchTerm.toLowerCase();
        this.filteredSubscribers.set(
            this.subscribers().filter(s =>
                s.first_name.toLowerCase().includes(term) ||
                s.last_name.toLowerCase().includes(term) ||
                s.email.toLowerCase().includes(term)
            )
        );
    }

    getInitials(firstName: string, lastName: string): string {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    exportCsv(): void {
        const headers = ['Nombre', 'Apellido', 'Email', 'Teléfono', 'País', 'Distrito', 'Fecha'];
        const rows = this.subscribers().map(s => [
            s.first_name,
            s.last_name,
            s.email,
            s.phone || '',
            s.country || '',
            s.district || '',
            new Date(s.created_at).toLocaleDateString()
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `suscriptores-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}
