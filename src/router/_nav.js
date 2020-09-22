import i18n from '@/i18n'

export default function getItems(user) {
    if (!user) {
        return [];
    }


    const items = [
        // {
        //     title: i18n.t('Dashboard'),
        //     name: 'home',
        //     url: {
        //         name: 'home'
        //     },
        //     icon: 'mdi-view-dashboard',

        // },
        {
            title: i18n.t('Improve'),
            name: 'improve',
            icon: 'mdi-rocket',
            header: true,
            children: [{
                    title: i18n.t('Ideas'),
                    name: 'ideas',
                    icon: 'mdi-lightbulb-on',
                    url: {
                        name: 'ideas'
                    },
                    //permissions: 'process/process/manage',
                },
                {
                    title: i18n.t('Tool Ideas'),
                    name: 'tool-ideas',
                    icon: 'mdi-lightbulb-on',
                    url: {
                        name: 'tool-ideas'
                    },
                    //permissions: 'process/process/manage',
                }
            ]
        },
        {
            title: i18n.t('Support'),
            name: 'support',
            icon: 'mdi-account-convert',
            header: true,
            children: [{
                    title: i18n.t('People'),
                    name: 'support-people',
                    icon: 'mdi-settings',
                    url: {
                        name: 'support-people'
                    },
                    permissions: 'process/process/manage',
                },
                {
                    title: i18n.t('Issues'),
                    name: 'support-issues',
                    icon: 'mdi-settings',
                    url: {
                        name: 'support-issues'
                    },
                    permissions: 'process/process/manage',
                },
            ]
        },
        {
            title: i18n.t('Analysis'),
            name: 'analysis',
            icon: 'mdi-chart-areaspline',
            header: true,
            children: [{
                title: i18n.t('General'),
                name: 'analysis',
                url: {
                    name: 'analysis-general'
                },
                //permissions: 'process/process/manage',
            },
        ]
        },
        {
            title: i18n.t('Manage'),
            name: 'manage',
            icon: 'mdi-tools',
            header: true,
            children: [{
                    title: i18n.t('Process management'),
                    name: 'proccess',
                    icon: 'mdi-settings',
                    url: {
                        name: 'proccess'
                    },
                    permissions: 'process/process/manage',
                },
                // {
                //     title: i18n.t('Project management'),
                //     name: 'admin-project',
                //     icon: 'mdi-briefcase-account',
                //     permissions: 'core/project/manage',
                //     url: {
                //         name: 'admin-project'
                //     },
                // },
                {
                    title: i18n.t('Projects management'),
                    name: 'project',
                    icon: 'mdi-briefcase-account',
                    permissions: 'core/project/manage',
                    url: {
                        name: 'project'
                    },
                },
                {
                    title: i18n.t('Tools management'),
                    name: 'tool-tool',
                    icon: 'mdi-tools',
                    url: {
                        name: 'tool-tool'
                    },
                    permissions: 'core/companyTool/manage',
                },
                {
                    title: i18n.t('Tool areas'),
                    name: 'tool-area',
                    icon: 'mdi-tools',
                    permissions: 'tool/toolArea/manage',
                    url: {
                        name: 'tool-area'
                    },
                },
                // {
                //     title: i18n.t('Price models'),
                //     name: 'tool-pricemodel',
                //     icon: 'mdi-tools',
                //     permissions: 'tool/priceModel/manage',
                //     url: {
                //         name: 'tool-pricemodel'
                //     },
                // },
                {
                    title: i18n.t('Product categories'),
                    name: 'tool-productcategory',
                    icon: 'mdi-tools',
                    permissions: 'tool/productCategory/manage',
                    url: {
                        name: 'tool-productcategory'
                    },
                },
                {
                    title: i18n.t('Company management'),
                    name: 'company-c',
                    icon: 'mdi-account',
                    permissions: 'core/company/manage',
                    url: {
                        name: 'super-admin-companies'
                    },
                },
                {
                    title: i18n.t('User management'),
                    name: 'company-user',
                    icon: 'mdi-account',
                    permissions: 'auth/user/manage',
                    url: {
                        name: 'company-user'
                    },
                },
                {
                    title: i18n.t('Employee roles'),
                    name: 'company-role',
                    icon: 'mdi-briefcase-account',
                    permissions: 'core/companyRole/manage',
                    url: {
                        name: 'company-role'
                    },
                },

            ]
        }
    ];

    return items;
}