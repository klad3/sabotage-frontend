import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { SiteConfigService } from '../../core/services/site-config.service';

@Component({
    selector: 'app-about',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="min-h-screen">
            <!-- Banner Section -->
            <section class="relative">
                @if (siteConfig.aboutPage().banner.image_url) {
                    <img 
                        [src]="siteConfig.aboutPage().banner.image_url" 
                        alt="Banner"
                        class="w-full h-auto object-cover"
                    />
                } @else {
                    <div class="w-full h-64 md:h-80 bg-gradient-to-r from-sabotage-gray via-sabotage-dark to-sabotage-gray bg-[length:200%_100%] animate-pulse"></div>
                }
            </section>

            <!-- Intro Section: ¿Quiénes somos? -->
            <section class="py-12 md:py-20 px-5 md:px-10 bg-sabotage-black">
                <div class="max-w-[1400px] mx-auto text-center">
                    <h2 class="text-3xl md:text-5xl font-extrabold mb-10 md:mb-16 text-sabotage-light tracking-wide uppercase">
                        {{ siteConfig.aboutPage().intro.title }}
                    </h2>
                    <div class="max-w-4xl mx-auto space-y-6 text-sabotage-muted text-base md:text-lg leading-relaxed">
                        @for (paragraph of siteConfig.aboutPage().intro.paragraphs; track $index) {
                            <p>{{ paragraph }}</p>
                        }
                    </div>
                </div>
            </section>

            <!-- History Section: Nuestra Historia -->
            <section class="py-12 md:py-20 px-5 md:px-10 bg-sabotage-black border-t border-sabotage-border">
                <div class="max-w-[1400px] mx-auto text-center">
                    <h2 class="text-3xl md:text-5xl font-extrabold mb-10 md:mb-16 text-sabotage-light tracking-wide uppercase">
                        {{ siteConfig.aboutPage().history.title }}
                    </h2>
                    <div class="max-w-4xl mx-auto space-y-6 text-sabotage-muted text-base md:text-lg leading-relaxed">
                        @for (paragraph of siteConfig.aboutPage().history.paragraphs; track $index) {
                            <p>{{ paragraph }}</p>
                        }
                    </div>
                </div>
            </section>

            <!-- Mission & Vision Section -->
            <section 
                class="relative py-12 md:py-20 px-5 md:px-10 bg-sabotage-dark border-y border-sabotage-border"
                [style.background-image]="siteConfig.aboutPage().mission_vision.background_image ? 'url(' + siteConfig.aboutPage().mission_vision.background_image + ')' : 'none'"
                [class.bg-cover]="siteConfig.aboutPage().mission_vision.background_image"
                [class.bg-center]="siteConfig.aboutPage().mission_vision.background_image"
            >
                @if (siteConfig.aboutPage().mission_vision.background_image) {
                    <div class="absolute inset-0 bg-black/60"></div>
                }
                <div class="relative z-10 max-w-[1400px] mx-auto">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
                        <!-- Mission -->
                        <div class="text-center">
                            <h3 class="text-3xl md:text-4xl font-extrabold mb-8 text-sabotage-light tracking-wide uppercase">
                                {{ siteConfig.aboutPage().mission_vision.mission_title }}
                            </h3>
                            <p class="text-sabotage-muted text-base md:text-lg leading-relaxed">
                                {{ siteConfig.aboutPage().mission_vision.mission_text }}
                            </p>
                        </div>
                        <!-- Vision -->
                        <div class="text-center">
                            <h3 class="text-3xl md:text-4xl font-extrabold mb-8 text-sabotage-light tracking-wide uppercase">
                                {{ siteConfig.aboutPage().mission_vision.vision_title }}
                            </h3>
                            <p class="text-sabotage-muted text-base md:text-lg leading-relaxed">
                                {{ siteConfig.aboutPage().mission_vision.vision_text }}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Values Section -->
            <section class="py-12 md:py-20 px-5 md:px-10 bg-sabotage-black border-b border-sabotage-border">
                <div class="max-w-[1400px] mx-auto">
                    <h2 class="text-3xl md:text-5xl font-extrabold text-center mb-10 md:mb-16 text-sabotage-light tracking-wide uppercase">
                        {{ siteConfig.aboutPage().values.title }}
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        @for (value of siteConfig.aboutPage().values.items; track $index) {
                            <div class="value-card group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer">
                                <!-- Default Image + Title -->
                                <div class="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0">
                                    @if (value.image_url) {
                                        <img 
                                            [src]="value.image_url" 
                                            [alt]="value.title"
                                            class="w-full h-full object-cover"
                                        />
                                    } @else {
                                        <div class="w-full h-full bg-sabotage-gray"></div>
                                    }
                                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span class="text-white text-2xl md:text-3xl font-bold tracking-widest uppercase">{{ value.title }}</span>
                                    </div>
                                </div>
                                <!-- Hover Image + Text -->
                                <div class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    @if (value.hover_image_url) {
                                        <img 
                                            [src]="value.hover_image_url" 
                                            [alt]="value.title"
                                            class="w-full h-full object-cover"
                                        />
                                    } @else if (value.image_url) {
                                        <img 
                                            [src]="value.image_url" 
                                            [alt]="value.title"
                                            class="w-full h-full object-cover grayscale"
                                        />
                                    } @else {
                                        <div class="w-full h-full bg-sabotage-dark"></div>
                                    }
                                    <div class="absolute inset-0 bg-black/70 flex items-center justify-center p-4">
                                        <p class="text-white text-sm md:text-base text-center leading-relaxed">{{ value.text }}</p>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </section>

            <!-- Models Section: Nuestras estrellas de la camara -->
            @if (siteConfig.aboutPage().models.items.length > 0) {
                <section class="py-12 md:py-20 px-5 md:px-10 bg-sabotage-black">
                    <div class="max-w-[1400px] mx-auto">
                        <h2 class="text-3xl md:text-5xl font-extrabold text-center mb-10 md:mb-16 text-sabotage-light tracking-wide uppercase">
                            {{ siteConfig.aboutPage().models.title }}
                        </h2>
                        <div class="flex flex-wrap justify-center gap-8 md:gap-12">
                            @for (model of siteConfig.aboutPage().models.items; track model.name) {
                                <div class="text-center w-[300px] md:w-[420px]">
                                    <div class="aspect-[3/4] bg-sabotage-gray rounded-lg overflow-hidden mb-4">
                                        @if (model.image_url) {
                                            <img 
                                                [src]="model.image_url" 
                                                [alt]="model.name"
                                                class="w-full h-full object-cover"
                                            />
                                        } @else {
                                            <div class="w-full h-full flex items-center justify-center text-5xl text-sabotage-muted">
                                                📷
                                            </div>
                                        }
                                    </div>
                                    @if (model.name) {
                                        <p class="text-sabotage-light font-semibold text-lg md:text-xl">{{ model.name }}</p>
                                    }
                                </div>
                            }
                        </div>
                    </div>
                </section>
            }
        </div>
    `,
    host: {
        class: 'block'
    }
})
export class AboutComponent implements OnInit {
    readonly siteConfig = inject(SiteConfigService);

    async ngOnInit(): Promise<void> {
        await this.siteConfig.loadConfigs();
    }
}
