// import Vue from 'vue'
// import Router from 'vue-router'

// import { initCurrentUserStateMiddleware, checkAccessMiddleware, setPageTitleMiddleware } from './middlewares'
// import { routes } from './routes'

// Vue.use(Router)

// const router = new Router({
//   linkActiveClass: 'is-active',
//   mode: 'history',
//   routes
// })

// router.beforeEach(initCurrentUserStateMiddleware)
// router.beforeEach(checkAccessMiddleware)
// router.beforeEach(setPageTitleMiddleware)

// export default router

import Vue from "vue";
import VueRouter from "vue-router";
import guest from "@/middlewares/guest";
import auth from "@/middlewares/auth";
import store from "../store";

Vue.use(VueRouter);

const routes = [
  // {
  //     path: '/loading',
  //     name: 'loading',
  //     component: () =>
  //         import ( /* webpackChunkName: "loading" */ '@/views/Loading'),
  //     meta: {
  //         layout: 'external-layout',
  //     }
  // },
  {
    path: "/login",
    name: "login",
    component: () =>
      import(/* webpackChunkName: "login" */ "@/views/pages/Login"),
    meta: {
      middleware: [guest],
      layout: "external-layout"
    }
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: () =>
      import(
        /* webpackChunkName: "forgot-password" */ "@/views/pages/ForgotPassword"
      ),
    meta: {
      middleware: [guest],
      layout: "external-layout"
    }
  },
  {
    path: "/reset-password",
    name: "reset-password",
    component: () =>
      import(
        /* webpackChunkName: "forgot-password" */ "@/views/pages/ResetPassword"
      ),
    meta: {
      middleware: [guest],
      layout: "external-layout"
    }
  },
  {
    path: "/send-email-verification",
    name: "send-email-verification",
    component: () =>
      import(
        /* webpackChunkName: "email-verification" */ "@/views/pages/SendEmailVerification"
      ),
    meta: {
      middleware: [guest],
      layout: "external-layout"
    }
  },
  {
    path: "/verify-account",
    name: "verify-account",
    component: () =>
      import(
        /* webpackChunkName: "email-verification" */ "@/views/pages/VerifyAccount"
      ),
    meta: {
      middleware: [guest],
      layout: "external-layout"
    }
  },
  // {
  //     path: '/change-password',
  //     name: 'change-password',
  //     component: () =>
  //         import ( /* webpackChunkName: "email-verification" */ '@/views/pages/profile/ChangePassword'),
  //     meta: {
  //         middleware: [auth],
  //         title: 'Change password',

  //     }
  // },
  {
    path: "/profile",
    name: "my-profile",
    component: () =>
      import(/* webpackChunkName: "profile" */ "@/views/pages/profile/Index"),
    meta: {
      middleware: [auth],
      title: "Profile"
    }
  },
  {
    path: "/company",
    name: "my-company",
    component: () =>
      import(/* webpackChunkName: "profile" */ "@/views/pages/profile/Company"),
    meta: {
      middleware: [auth],
      permissions: "auth/user/edit_my_company",
      title: "Company"
    }
  },

  {
    path: "/improve",
    name: "improve",
    component: () =>
      import(/* webpackChunkName: "improve" */ "@/views/pages/improve/Index"),
    //   import ( /* webpackChunkName: "improve" */ '@/views/pages/improve/ideas/Index'),
    meta: {
      middleware: [auth],
      layout: "default-layout"
    },
    children: [
      {
        path: "ideas/:type?",
        name: "ideas",
        component: () =>
          import(
            /* webpackChunkName: "improve" */ "@/views/pages/improve/ideas/Index"
          ),
        meta: {
          middleware: [auth],
          title: "Ideas",
          permissions: "improve/idea/manage",
          layout: "default-layout",
          titleButton: () =>
            import(
              /* webpackChunkName: "improve" */ "@/views/pages/improve/ideas/TitleButton"
            ),
          // topRight: () => import(/* webpackChunkName: "improve" */'@/views/pages/manage/proccess/SearchBar'),
          topCentral: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/improve/ideas/CentralBar"
            )
        }
      },
      {
        path: "tool-ideas/:type?",
        name: "tool-ideas",
        component: () =>
          import(
            /* webpackChunkName: "improve" */ "@/views/pages/improve/tool_ideas/Index"
          ),

        meta: {
          middleware: [auth],
          title: "Tool Ideas",
          permissions: "improve/idea/manage",
          titleButton: () =>
            import(
              /* webpackChunkName: "improve" */ "@/views/pages/improve/tool_ideas/TitleButton"
            ),
          // topRight: () => import(/* webpackChunkName: "improve" */'@/views/pages/manage/proccess/SearchBar'),
          topCentral: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/improve/tool_ideas/CentralBar"
            )
        }
      }
    ]
  },
  {
    path: "/analysis",
    name: "analysis",
    component: () =>
      import(/* webpackChunkName: "improve" */ "@/views/pages/analysis/Index"),
    meta: {
      middleware: [auth]
    },
    children: [
      {
        path: "general",
        name: "analysis-general",
        component: () =>
          import(
            /* webpackChunkName: "manage" */ "@/views/pages/analysis/views/Index"
          ),
        meta: {
          middleware: [auth],
          title: "General",
          permissions: "process/process/manage",
          // titleButton: () => import(/* webpackChunkName: "manage" */'@/views/pages/anal/proccess/TitleButton'),
          // topRight: () => import(/* webpackChunkName: "manage" */'@/views/pages/manage/proccess/SearchBar'),
          topCentral: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/analysis/views/CentralBar"
            )
        }
      }
    ]
  },
  {
    path: "/support",
    name: "support",
    component: () =>
      import(/* webpackChunkName: "improve" */ "@/views/pages/support/Index"),
    meta: {
      middleware: [auth]
    },
    children: [
      {
        path: "people",
        name: "support-people",
        component: () =>
          import(
            /* webpackChunkName: "manage" */ "@/views/pages/support/people/Index"
          ),
        meta: {
          middleware: [auth],
          title: "People",
          permissions: "process/process/manage"
          // titleButton: () => import(/* webpackChunkName: "manage" */'@/views/pages/manage/proccess/TitleButton'),
          // topRight: () => import(/* webpackChunkName: "manage" */'@/views/pages/support/people/SearchBar'),
          // topCentral: () => import(/* webpackChunkName: "manage" */'@/views/pages/support/people/CentralBar'),
        }
      },
      {
        path: "issues",
        name: "support-issues",
        component: () =>
          import(
            /* webpackChunkName: "manage" */ "@/views/pages/support/issues/Index"
          ),
        meta: {
          middleware: [auth],
          title: "Issues",
          permissions: "process/process/manage",
          // titleButton: () => import(/* webpackChunkName: "manage" */'@/views/pages/manage/proccess/TitleButton'),
          topRight: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/support/issues/SearchBar"
            ),
          topCentral: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/support/issues/CentralBar"
            )
        }
      }
    ]
  },
  {
    path: "/manage",
    name: "manage",
    component: () =>
      import(/* webpackChunkName: "manage" */ "@/views/pages/manage/Index"),
    meta: {
      middleware: [auth]
    },
    children: [
      {
        path: "proccess",
        name: "proccess",
        component: () =>
          import(
            /* webpackChunkName: "manage" */ "@/views/pages/manage/proccess/Index"
          ),
        meta: {
          middleware: [auth],
          title: "Process",
          permissions: "process/process/manage",
          titleButton: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/manage/proccess/TitleButton"
            ),
          topRight: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/manage/proccess/SearchBar"
            ),
          topCentral: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/manage/proccess/CentralBar"
            )
        }
      },
      {
        path: "tool",
        name: "tool",
        component: () =>
          import(
            /* webpackChunkName: "manage" */ "@/views/pages/manage/tool/Index"
          ),
        //   import ( /* webpackChunkName: "manage" */ '@/views/pages/manage/proccess/Index'),
        children: [
          {
            path: "tools",
            name: "tool-tool",
            component: () =>
              import(
                /* webpackChunkName: "manage" */ "@/views/pages/manage/tool/tool/Index"
              ),
            meta: {
              middleware: [auth],
              title: "Tools",
              permissions: "core/companyTool/manage",
              titleButton: () =>
                import(
                  /* webpackChunkName: "manage" */ "@/views/pages/manage/tool/tool/TitleButton"
                ),
              topRight: () =>
                import(
                  /* webpackChunkName: "manage" */ "@/views/pages/manage/tool/tool/SearchBar"
                )
            }
          }
        ]
      },
      {
        path: "roles",
        name: "company-role",
        component: () =>
          import(
            /* webpackChunkName: "manage" */ "@/views/pages/manage/company_role/Index"
          ),
        meta: {
          middleware: [auth],
          title: "Employee Role",
          permissions: "core/companyRole/manage",
          titleButton: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/manage/company_role/TitleButton"
            ),
          topRight: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/manage/company_role/SearchBar"
            )
        }
      },
      {
        path: "users",
        name: "company-user",
        component: () =>
          import(
            /* webpackChunkName: "manage" */ "@/views/pages/manage/user/Index"
          ),
        meta: {
          middleware: [auth],
          title: "Users",
          permissions: "auth/user/manage",
          titleButton: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/manage/user/TitleButton"
            ),
          // topCentral: () => import(/* webpackChunkName: "manage" */'@/views/pages/manage/user/CentralBar'),
          topRight: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/manage/user/SearchBar"
            )
        }
      },
      {
        path: "companies",
        name: "super-admin-companies",
        component: () =>
          import(
            /* webpackChunkName: "manage" */ "@/views/pages/manage/company/Index"
          ),
        meta: {
          middleware: [auth],
          title: "Companies",
          permissions: "core/company/manage",
          titleButton: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/manage/company/TitleButton"
            ),
          // topCentral: () => import(/* webpackChunkName: "manage" */'@/views/pages/manage/user/CentralBar'),
          topRight: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/manage/company/SearchBar"
            )
        }
      },
      {
        path: "projects",
        name: "project",
        component: () =>
          import(
            /* webpackChunkName: "manage" */ "@/views/pages/manage/project/project/Index"
          ),
        meta: {
          middleware: [auth],
          title: "Projects",
          // permissions: "project/manage",
          titleButton: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/manage/project/TitleButton"
            ),
          topRight: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/manage/project/SearchBar"
            ),
          topCentral: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/manage/project/CentralBar"
            )
        }
      },
      {
        path: "admin-projects",
        name: "admin-project",
        component: () =>
          import(
            /* webpackChunkName: "manage" */ "@/views/pages/manage/project/admin/Index"
          ),
        meta: {
          middleware: [auth],
          title: "Admin Projects",
          // permissions: "project/manage",
          titleButton: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/manage/project/TitleButton"
            ),
          topRight: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/manage/project/SearchBar"
            ),
          topCentral: () =>
            import(
              /* webpackChunkName: "manage" */ "@/views/pages/manage/project/CentralBar"
            )
        }
      }
    ]
  },
  {
    path: "",
    redirect: "/improve/ideas",
    name: "home",
    component: () =>
      // import ( /* webpackChunkName: "home" */ '@/views/pages/manage'),

      import(
        /* webpackChunkName: "home" */ "@/views/pages/manage/proccess/Index"
      )
    // import ( /* webpackChunkName: "home" */ '@/views/Home'),
    // meta: {
    //   middleware: [auth],
    // }
  }

  // {
  //     path: '/about',
  //     name: 'about',
  //     // route level code-splitting
  //     // this generates a separate chunk (about.[hash].js) for this route
  //     // which is lazy-loaded when the route is visited.
  //     component: () =>
  //         import ( /* webpackChunkName: "about" */ '../views/About')
  // },
  // {
  //     path: "*",
  //     name: "404",
  //     component: () =>
  //         import ( /* webpackChunkName: "404" */ '../views/pages/404')
  // }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  store.dispatch("app/setRouteMeta", to);
  // This goes through the matched routes from last to first, finding the closest route with a title.
  // eg. if we have /some/deep/nested/route and /some, /deep, and /nested have titles, nested's will be chosen.
  const nearestWithTitle = to.matched
    .slice()
    .reverse()
    .find(r => r.meta && r.meta.title);
  // Find the nearest route element with meta tags.
  const nearestWithMeta = to.matched
    .slice()
    .reverse()
    .find(r => r.meta && r.meta.metaTags);

  // If a route with a title was found, set the document (page) title to that value.
  if (nearestWithTitle) {
    document.title = `${nearestWithTitle.meta.title} :: ${process.env.VUE_APP_NAME}`;
  } else {
    document.title = process.env.VUE_APP_NAME;
  }

  // Remove any stale meta tags from the document using the key attribute we set below.
  Array.from(
    document.querySelectorAll("[data-vue-router-controlled]")
  ).map(el => el.parentNode.removeChild(el));

  // Skip rendering meta tags if there are none.
  if (!nearestWithMeta) {
    return next();
  }

  // Turn the meta tag definitions into actual elements in the head.
  nearestWithMeta.meta.metaTags
    .map(tagDef => {
      const tag = document.createElement("meta");

      Object.keys(tagDef).forEach(key => {
        tag.setAttribute(key, tagDef[key]);
      });

      // We use this to track which meta tags we create, so we don't interfere with other ones.
      tag.setAttribute("data-vue-router-controlled", "");

      return tag;
    })
    // Add the meta tags to the document head.
    .forEach(tag => document.head.appendChild(tag));
  next();
});

export default router;
