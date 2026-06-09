import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { productRouter } from "./routers/product-router";
import { categoryRouter } from "./routers/category-router";
import { cartRouter } from "./routers/cart-router";
import { wishlistRouter } from "./routers/wishlist-router";
import { orderRouter } from "./routers/order-router";
import { addressRouter } from "./routers/address-router";
import { reviewRouter } from "./routers/review-router";
import { couponRouter } from "./routers/coupon-router";
import { bannerRouter } from "./routers/banner-router";
import { contactRouter } from "./routers/contact-router";
import { adminRouter } from "./routers/admin-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  product: productRouter,
  category: categoryRouter,
  cart: cartRouter,
  wishlist: wishlistRouter,
  order: orderRouter,
  address: addressRouter,
  review: reviewRouter,
  coupon: couponRouter,
  banner: bannerRouter,
  contact: contactRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
