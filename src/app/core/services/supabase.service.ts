import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export interface QueryOptions {
    select?: string;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
    filters?: Array<{ column: string; operator: string; value: unknown }>;
}

export interface PaginatedResult<T> {
    data: T[];
    count: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient | null = null;
    private configured = false;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        const url = environment.supabase.url;
        const key = environment.supabase.anonKey;

        this.configured = this.isValidUrl(url) && key !== 'YOUR_SUPABASE_ANON_KEY';

        if (this.configured) {
            try {
                this.supabase = createClient(url, key);
            } catch (err) {
                console.warn('Failed to initialize Supabase client:', err);
                this.configured = false;
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
        return this.configured && this.supabase !== null;
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

    // ============================================
    // Basic CRUD Operations
    // ============================================

    async getAll<T>(table: string, options?: QueryOptions): Promise<T[]> {
        if (!this.supabase) {
            console.warn(`Supabase not configured. Cannot fetch ${table}.`);
            return [];
        }

        let query = this.supabase
            .from(table)
            .select(options?.select || '*');

        // Apply filters
        if (options?.filters) {
            for (const filter of options.filters) {
                query = this.applyFilter(query, filter);
            }
        }

        // Apply ordering
        if (options?.orderBy) {
            query = query.order(options.orderBy.column, {
                ascending: options.orderBy.ascending ?? true
            });
        }

        // Apply pagination
        if (options?.limit) {
            query = query.limit(options.limit);
        }
        if (options?.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        const { data, error } = await query;

        if (error) {
            console.error(`Error fetching ${table}:`, error);
            throw error;
        }

        return data as T[];
    }

    async getPaginated<T>(
        table: string,
        page: number,
        pageSize: number,
        options?: Omit<QueryOptions, 'limit' | 'offset'>
    ): Promise<PaginatedResult<T>> {
        if (!this.supabase) {
            return { data: [], count: 0, page, pageSize, totalPages: 0 };
        }

        const offset = (page - 1) * pageSize;

        let countQuery = this.supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (options?.filters) {
            for (const filter of options.filters) {
                countQuery = this.applyFilter(countQuery, filter);
            }
        }

        const { count } = await countQuery;

        const data = await this.getAll<T>(table, {
            ...options,
            limit: pageSize,
            offset
        });

        const totalPages = Math.ceil((count || 0) / pageSize);

        return {
            data,
            count: count || 0,
            page,
            pageSize,
            totalPages
        };
    }

    async getById<T>(table: string, id: string, select?: string): Promise<T | null> {
        if (!this.supabase) {
            console.warn(`Supabase not configured. Cannot fetch ${table} by id.`);
            return null;
        }

        const { data, error } = await this.supabase
            .from(table)
            .select(select || '*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching ${table} by id:`, error);
            return null;
        }

        return data as T;
    }

    async getByColumn<T>(table: string, column: string, value: unknown, select?: string): Promise<T[]> {
        if (!this.supabase) {
            return [];
        }

        const { data, error } = await this.supabase
            .from(table)
            .select(select || '*')
            .eq(column, value);

        if (error) {
            console.error(`Error fetching ${table} by ${column}:`, error);
            return [];
        }

        return data as T[];
    }

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

    async insertMany<T>(table: string, records: Partial<T>[]): Promise<T[]> {
        if (!this.supabase) {
            return [];
        }

        const { data, error } = await this.supabase
            .from(table)
            .insert(records)
            .select();

        if (error) {
            console.error(`Error inserting into ${table}:`, error);
            throw error;
        }

        return data as T[];
    }

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

    // ============================================
    // Storage Operations
    // ============================================

    async uploadFile(bucket: string, path: string, file: File): Promise<string | null> {
        if (!this.supabase) {
            console.warn('Supabase not configured. Cannot upload file.');
            return null;
        }

        const { data, error } = await this.supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            console.error('Error uploading file:', error);
            throw error;
        }

        return data.path;
    }

    async deleteFile(bucket: string, path: string): Promise<boolean> {
        if (!this.supabase) {
            return false;
        }

        const { error } = await this.supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) {
            console.error('Error deleting file:', error);
            return false;
        }

        return true;
    }

    getPublicUrl(bucket: string, path: string): string | null {
        if (!this.supabase) {
            return null;
        }

        const { data } = this.supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        return data.publicUrl;
    }

    async listFiles(bucket: string, folder?: string): Promise<{ name: string; url: string }[]> {
        if (!this.supabase) {
            return [];
        }

        const { data, error } = await this.supabase.storage
            .from(bucket)
            .list(folder || '');

        if (error) {
            console.error('Error listing files:', error);
            return [];
        }

        return data
            .filter(item => item.name)
            .map(item => ({
                name: item.name,
                url: this.getPublicUrl(bucket, folder ? `${folder}/${item.name}` : item.name) || ''
            }));
    }

    // ============================================
    // Helper Methods
    // ============================================

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private applyFilter(query: any, filter: { column: string; operator: string; value: unknown }): any {
        const { column, operator, value } = filter;

        switch (operator) {
            case 'eq':
                return query.eq(column, value);
            case 'neq':
                return query.neq(column, value);
            case 'gt':
                return query.gt(column, value);
            case 'gte':
                return query.gte(column, value);
            case 'lt':
                return query.lt(column, value);
            case 'lte':
                return query.lte(column, value);
            case 'like':
                return query.like(column, value as string);
            case 'ilike':
                return query.ilike(column, value as string);
            case 'is':
                return query.is(column, value as boolean | null);
            case 'in':
                return query.in(column, value as unknown[]);
            case 'contains':
                return query.contains(column, value as unknown[]);
            default:
                return query;
        }
    }

    async search<T>(
        table: string,
        searchTerm: string,
        columns: string[],
        options?: QueryOptions
    ): Promise<T[]> {
        if (!this.supabase || !searchTerm.trim()) {
            return this.getAll<T>(table, options);
        }

        const orFilter = columns.map(col => `${col}.ilike.%${searchTerm}%`).join(',');

        let query = this.supabase
            .from(table)
            .select(options?.select || '*')
            .or(orFilter);

        if (options?.orderBy) {
            query = query.order(options.orderBy.column, {
                ascending: options.orderBy.ascending ?? true
            });
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) {
            console.error(`Error searching ${table}:`, error);
            return [];
        }

        return data as T[];
    }
}
