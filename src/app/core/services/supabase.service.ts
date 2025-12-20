import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private readonly supabase: SupabaseClient | null = null;
    private readonly isConfigured: boolean;

    constructor() {
        // Check if Supabase is properly configured
        const url = environment.supabase.url;
        const key = environment.supabase.anonKey;

        this.isConfigured = this.isValidUrl(url) && key !== 'YOUR_SUPABASE_ANON_KEY';

        if (this.isConfigured) {
            try {
                this.supabase = createClient(url, key);
            } catch (err) {
                console.warn('Failed to initialize Supabase client:', err);
                this.isConfigured = false;
            }
        } else {
            console.warn(
                'Supabase is not configured. The application will use mock data. ' +
                'To enable Supabase, set valid credentials in environment.ts'
            );
        }
    }

    private isValidUrl(url: string): boolean {
        if (!url || url === 'YOUR_SUPABASE_URL') {
            return false;
        }
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
            return false;
        }
    }

    get isEnabled(): boolean {
        return this.isConfigured && this.supabase !== null;
    }

    get client(): SupabaseClient | null {
        return this.supabase;
    }

    get storage() {
        return this.supabase?.storage ?? null;
    }

    get auth() {
        return this.supabase?.auth ?? null;
    }

    /**
     * Get data from a table with optional filters
     */
    async getAll<T>(table: string): Promise<T[]> {
        if (!this.supabase) {
            console.warn(`Supabase not configured. Cannot fetch ${table}.`);
            return [];
        }

        const { data, error } = await this.supabase
            .from(table)
            .select('*');

        if (error) {
            console.error(`Error fetching ${table}:`, error);
            throw error;
        }

        return data as T[];
    }

    /**
     * Get a single record by ID
     */
    async getById<T>(table: string, id: string): Promise<T | null> {
        if (!this.supabase) {
            console.warn(`Supabase not configured. Cannot fetch ${table} by id.`);
            return null;
        }

        const { data, error } = await this.supabase
            .from(table)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching ${table} by id:`, error);
            return null;
        }

        return data as T;
    }

    /**
     * Insert a new record
     */
    async insert<T>(table: string, record: Partial<T>): Promise<T | null> {
        if (!this.supabase) {
            console.warn(`Supabase not configured. Cannot insert into ${table}.`);
            return null;
        }

        const { data, error } = await this.supabase
            .from(table)
            .insert(record)
            .select()
            .single();

        if (error) {
            console.error(`Error inserting into ${table}:`, error);
            throw error;
        }

        return data as T;
    }

    /**
     * Update a record
     */
    async update<T>(table: string, id: string, updates: Partial<T>): Promise<T | null> {
        if (!this.supabase) {
            console.warn(`Supabase not configured. Cannot update ${table}.`);
            return null;
        }

        const { data, error } = await this.supabase
            .from(table)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error(`Error updating ${table}:`, error);
            throw error;
        }

        return data as T;
    }

    /**
     * Delete a record
     */
    async delete(table: string, id: string): Promise<boolean> {
        if (!this.supabase) {
            console.warn(`Supabase not configured. Cannot delete from ${table}.`);
            return false;
        }

        const { error } = await this.supabase
            .from(table)
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`Error deleting from ${table}:`, error);
            return false;
        }

        return true;
    }

    /**
     * Get public URL for a file in storage
     */
    getPublicUrl(bucket: string, path: string): string | null {
        if (!this.supabase) {
            return null;
        }

        const { data } = this.supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        return data.publicUrl;
    }
}
