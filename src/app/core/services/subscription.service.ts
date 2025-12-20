import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Subscriber } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SubscriptionService {
    private readonly supabase = inject(SupabaseService);

    private readonly _loading = signal(false);
    private readonly _error = signal<string | null>(null);

    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    /**
     * Subscribe a new user and send to WhatsApp
     */
    async subscribe(subscriber: Omit<Subscriber, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> {
        this._loading.set(true);
        this._error.set(null);

        try {
            // Try to save to Supabase
            await this.supabase.insert<Subscriber>('subscribers', subscriber);
        } catch (err) {
            // Continue even if Supabase fails - we'll still send to WhatsApp
            console.warn('Could not save subscriber to database:', err);
        }

        // Generate WhatsApp message
        const message = this.generateWhatsAppMessage(subscriber);
        const whatsappUrl = this.generateWhatsAppUrl(message);

        this._loading.set(false);

        // Open WhatsApp
        if (typeof window !== 'undefined') {
            window.open(whatsappUrl, '_blank');
        }

        return {
            success: true,
            message: '¡Suscripción completada!'
        };
    }

    private generateWhatsAppMessage(subscriber: Omit<Subscriber, 'id' | 'createdAt'>): string {
        let message = '🎉 *NUEVA SUSCRIPCIÓN - SABOTAGE CREW* 🎉\n\n';
        message += '*DATOS DEL SUSCRIPTOR:*\n';
        message += `📧 Email: ${subscriber.email}\n`;
        message += `👤 Nombre: ${subscriber.firstName} ${subscriber.lastName}\n`;
        message += `🎂 Edad: ${subscriber.age} años\n`;
        message += `📱 Teléfono: ${subscriber.phone}\n`;
        message += `🌎 País: ${subscriber.country}\n`;
        message += `📍 Distrito/Ciudad: ${subscriber.district}\n`;
        message += `🏴 Nacionalidad: ${subscriber.nationality}\n`;

        if (subscriber.comments && subscriber.comments !== 'Sin comentarios') {
            message += `\n💬 *COMENTARIOS:*\n${subscriber.comments}\n`;
        }

        message += '\n✨ ¡Bienvenido al CREW de SABOTAGE! ✨';

        return message;
    }

    private generateWhatsAppUrl(message: string): string {
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${environment.whatsapp.phoneNumber}?text=${encodedMessage}`;
    }
}
