import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FuseConfig, FuseConfigService } from '@fuse/services/config';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'scheme',
    templateUrl: './scheme.component.html',
    styles: [
        `
        scheme {
            display: block;
            flex: none;
            width: auto;
        }
        `
    ],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [MatIconModule],
})
export class SchemeComponent implements OnInit, OnDestroy {
    config: FuseConfig;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(private _fuseConfigService: FuseConfigService) {}

    /**
     * On init
     */
    ngOnInit(): void {
        // Detect the preferred color scheme of the device
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.applyPreferredScheme(darkModeMediaQuery.matches);

        // Listen for changes in the preferred color scheme
        darkModeMediaQuery.addEventListener('change', (event) => {
            this.applyPreferredScheme(event.matches);
        });

        // Subscribe to config changes
        this._fuseConfigService.config$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: FuseConfig) => {
                this.config = config;
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Toggle the scheme between 'light' and 'dark'
     */
    toggleScheme(): void {
        const newScheme = this.config.scheme === 'dark' ? 'light' : 'dark';
        this._fuseConfigService.config = { scheme: newScheme };
    }

    /**
     * Apply the preferred color scheme
     * @param isDarkMode Whether the preferred scheme is dark
     */
    private applyPreferredScheme(isDarkMode: boolean): void {
        const newScheme = isDarkMode ? 'dark' : 'light';
        this._fuseConfigService.config = { scheme: newScheme };
    }
}
