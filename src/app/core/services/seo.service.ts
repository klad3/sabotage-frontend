import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class SeoService {
    private readonly titleService = inject(Title);
    private readonly metaService = inject(Meta);
    private readonly document = inject(DOCUMENT);

    /**
     * Set the document title
     */
    setTitle(title: string): void {
        const fullTitle = `${title} | SABOTAGE`;
        this.titleService.setTitle(fullTitle);
    }

    /**
     * Set the meta description
     */
    setDescription(description: string): void {
        this.metaService.updateTag({ name: 'description', content: description });
        this.metaService.updateTag({ property: 'og:description', content: description });
        this.metaService.updateTag({ name: 'twitter:description', content: description });
    }

    /**
     * Update Open Graph and generic meta tags
     */
    updateTags(tags: {
        title?: string;
        description?: string;
        image?: string;
        url?: string;
        type?: 'website' | 'article' | 'product';
    }): void {
        if (tags.title) {
            this.setTitle(tags.title);
            this.metaService.updateTag({ property: 'og:title', content: tags.title });
            this.metaService.updateTag({ name: 'twitter:title', content: tags.title });
        }

        if (tags.description) {
            this.setDescription(tags.description);
        }

        if (tags.image) {
            this.metaService.updateTag({ property: 'og:image', content: tags.image });
            this.metaService.updateTag({ name: 'twitter:image', content: tags.image });
            this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        }

        if (tags.url) {
            this.metaService.updateTag({ property: 'og:url', content: tags.url });
            this.setCanonicalUrl(tags.url);
        }

        if (tags.type) {
            this.metaService.updateTag({ property: 'og:type', content: tags.type });
        }
    }

    /**
     * Set canonical URL link tag
     */
    private setCanonicalUrl(url: string): void {
        let link: HTMLLinkElement | null = this.document.querySelector("link[rel='canonical']");
        if (!link) {
            link = this.document.createElement('link');
            link.setAttribute('rel', 'canonical');
            this.document.head.appendChild(link);
        }
        link.setAttribute('href', url);
    }
}
