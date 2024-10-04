/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id      : 'apps.help-center',
        title   : 'Centro de Ayuda',
        subtitle: 'Guía para el Funcionario',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id        : 'apps.help-center.home',
                title     : 'Inicio',
                type      : 'basic',
                link      : '/apps/help-center',
                exactMatch: true,
            },
            {
                id   : 'apps.help-center.faqs',
                title: 'Preguntas Frecuentes',
                type : 'basic',
                link : '/apps/help-center/faqs',
            },
            {
                id   : 'apps.help-center.guides',
                title: 'Guides',
                type : 'basic',
                link : '/apps/help-center/guides',
            },
            {
                id   : 'apps.help-center.support',
                title: 'Support',
                type : 'basic',
                link : '/apps/help-center/support',
            },
        ],
    },
    {
        id      : 'apps.help-center',
        title   : 'Departamento de Soporte Técnico',
        subtitle: 'Registro ',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id      : 'apps.ecommerce',
                title   : 'Equipos',
                type    : 'collapsable',
                icon    : 'heroicons_outline:shopping-cart',
                children: [
                    {
                        id   : 'apps.ecommerce.inventory',
                        title: 'Inventario',
                        type : 'basic',
                        link : '/apps/ecommerce/inventory',
                    },
                ],
            },
            {
                id   : 'apps.scrumboard',
                title: 'Recepción de Tareas',
                type : 'basic',
                icon : 'heroicons_outline:check-circle',
                link : '/apps/scrumboard',
            },
            {
                id   : 'apps.scrumboard',
                title: 'Mis Asignaciones',
                type : 'basic',
                icon : 'heroicons_outline:view-columns',
                link : '/apps/scrumboard',
            },
            {
                id   : 'reportes',
                title: 'Reportes',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/dashboards/project',
            },
            
            {
                id   : 'pages.profile',
                title: 'Perfil',
                type : 'basic',
                icon : 'heroicons_outline:user-circle',
                link : '/pages/profile',
            }
        ]
    }
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id      : 'apps.help-center',
        title   : 'Centro de Ayuda',
        subtitle: 'Guía para el Funcionario',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id        : 'apps.help-center.home',
                title     : 'Inicio',
                type      : 'basic',
                link      : '/apps/help-center',
                exactMatch: true,
            },
            {
                id   : 'apps.help-center.faqs',
                title: 'Preguntas Frecuentes',
                type : 'basic',
                link : '/apps/help-center/faqs',
            },
            {
                id   : 'apps.help-center.guides',
                title: 'Guides',
                type : 'basic',
                link : '/apps/help-center/guides',
            },
            {
                id   : 'apps.help-center.support',
                title: 'Support',
                type : 'basic',
                link : '/apps/help-center/support',
            },
        ],
    },
    {
        id      : 'apps.help-center',
        title   : 'Departamento de Soporte Técnico',
        subtitle: 'Registro ',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id      : 'apps.ecommerce',
                title   : 'Equipos',
                type    : 'collapsable',
                icon    : 'heroicons_outline:shopping-cart',
                children: [
                    {
                        id   : 'apps.ecommerce.inventory',
                        title: 'Inventario',
                        type : 'basic',
                        link : '/apps/ecommerce/inventory',
                    },
                ],
            },
            {
                id   : 'apps.scrumboard',
                title: 'Recepción de Tareas',
                type : 'basic',
                icon : 'heroicons_outline:check-circle',
                link : '/apps/scrumboard',
            },
            {
                id   : 'apps.scrumboard',
                title: 'Mis Asignaciones',
                type : 'basic',
                icon : 'heroicons_outline:view-columns',
                link : '/apps/scrumboard',
            },
            
            {
                id   : 'pages.profile',
                title: 'Perfil',
                type : 'basic',
                icon : 'heroicons_outline:user-circle',
                link : '/pages/profile',
            }
        ]
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id      : 'apps.help-center',
        title   : 'Centro de Ayuda',
        subtitle: 'Guía para el Funcionario',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id        : 'apps.help-center.home',
                title     : 'Inicio',
                type      : 'basic',
                link      : '/apps/help-center',
                exactMatch: true,
            },
            {
                id   : 'apps.help-center.faqs',
                title: 'Preguntas Frecuentes',
                type : 'basic',
                link : '/apps/help-center/faqs',
            },
            {
                id   : 'apps.help-center.guides',
                title: 'Guias',
                type : 'basic',
                link : '/apps/help-center/guides',
            },
            {
                id   : 'reportes',
                title: 'Reportes',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/dashboards/project',
            },
            {
                id   : 'apps.help-center.support',
                title: 'Soporte',
                type : 'basic',
                link : '/apps/help-center/support',
            },
        ],
    },
    {
        id      : 'apps.help-center',
        title   : 'Departamento de Soporte Técnico',
        subtitle: 'Registro ',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id      : 'apps.ecommerce',
                title   : 'Equipos',
                type    : 'collapsable',
                icon    : 'heroicons_outline:shopping-cart',
                children: [
                    {
                        id   : 'apps.ecommerce.inventory',
                        title: 'Inventario',
                        type : 'basic',
                        link : '/apps/ecommerce/inventory',
                    },
                ],
            },
            {
                id   : 'apps.scrumboard',
                title: 'Recepción de Tareas',
                type : 'basic',
                icon : 'heroicons_outline:check-circle',
                link : '/apps/scrumboard',
            },
            {
                id   : 'apps.scrumboard',
                title: 'Mis Asignaciones',
                type : 'basic',
                icon : 'heroicons_outline:view-columns',
                link : '/apps/scrumboard',
            },
            {
                id   : 'reportes',
                title: 'Reportes',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/dashboards/project',
            },
            
            {
                id   : 'pages.profile',
                title: 'Perfil',
                type : 'basic',
                icon : 'heroicons_outline:user-circle',
                link : '/pages/profile',
            }
        ]
    }

];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id      : 'apps.help-center',
        title   : 'Centro de Ayuda',
        subtitle: 'Guía para el Funcionario',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id        : 'apps.help-center.home',
                title     : 'Inicio',
                type      : 'basic',
                link      : '/apps/help-center',
                exactMatch: true,
            },
            {
                id   : 'apps.help-center.faqs',
                title: 'Preguntas Frecuentes',
                type : 'basic',
                link : '/apps/help-center/faqs',
            },
            {
                id   : 'apps.help-center.guides',
                title: 'Guides',
                type : 'basic',
                link : '/apps/help-center/guides',
            },
            {
                id   : 'apps.help-center.support',
                title: 'Support',
                type : 'basic',
                link : '/apps/help-center/support',
            },
        ],
    },
    {
        id      : 'apps.help-center',
        title   : 'Departamento de Soporte Técnico',
        subtitle: 'Registro ',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id      : 'apps.ecommerce',
                title   : 'Equipos',
                type    : 'collapsable',
                icon    : 'heroicons_outline:shopping-cart',
                children: [
                    {
                        id   : 'apps.ecommerce.inventory',
                        title: 'Inventario',
                        type : 'basic',
                        link : '/apps/ecommerce/inventory',
                    },
                ],
            },
            {
                id   : 'apps.scrumboard',
                title: 'Recepción de Tareas',
                type : 'basic',
                icon : 'heroicons_outline:check-circle',
                link : '/apps/scrumboard',
            },
            {
                id   : 'apps.scrumboard',
                title: 'Mis Asignaciones',
                type : 'basic',
                icon : 'heroicons_outline:view-columns',
                link : '/apps/scrumboard',
            },
            {
                id   : 'reportes',
                title: 'Reportes',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/dashboards/project',
            },
            {
                id   : 'pages.profile',
                title: 'Perfil',
                type : 'basic',
                icon : 'heroicons_outline:user-circle',
                link : '/pages/profile',
            }
        ]
    }
];