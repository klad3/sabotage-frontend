import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';

export interface HasUnsavedChanges {
    hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
    if (component.hasUnsavedChanges && component.hasUnsavedChanges()) {
        return confirm('Tienes cambios sin guardar. ¿Seguro que deseas salir?');
    }
    return true;
};
