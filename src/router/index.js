import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export const routes = [
  ,
  {
    path: "/",
    component: () =>
      import(
        /* webpackChunkName: "layout-default" */ "@/layouts/DefaultLayout.vue"
      ),
    children: [
      {
        path: "/",
        name: "/",
        component: () =>
          import(/* webpackChunkName: "Paintings" */ "@/pages/Paintings.vue")
      },
      {
        path: "/my-paintings",
        name: "/my-paintings",
        beforeEnter() {
          window.location.replace('https://appv2.algopainter.art/my-gallery')
        },
      },
      {
        path: "/paintings/new",
        name: "/new",
        component: () =>
          import(
            /* webpackChunkName: "NewPainting" */ "@/pages/NewPainting.vue"
          )
      },
      {
        path: "/paintings/:tokenId",
        name: "/",
        component: () =>
          import(/* webpackChunkName: "Painting" */ "@/pages/Painting.vue")
      },
      {
        path: "/collections/:id/new",
        name: "/collections/:id/new",
        component: () =>
          import(
            /* webpackChunkName: "NewCollectionItem" */ "@/pages/collections/NewItem.vue"
          )
      },
      {
        path: "/collections/:id/:tokenId",
        name: "/",
        component: () =>
          import(
            /* webpackChunkName: "CollectionItem" */ "@/pages/collections/Item.vue"
          )
      }
    ]
  }
];

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL || "/",
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 };
  },
  routes
});

/**
 * Before each route update
 */
router.beforeEach((to, from, next) => {
  return next();
});

/**
 * After each route update
 */
router.afterEach((to, from) => {});

export default router;
