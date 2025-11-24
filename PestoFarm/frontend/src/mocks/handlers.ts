
/* @ts-ignore */
import { rest } from 'msw';

const BASE_URL = 'http://localhost:5454';

export const handlers = [
  rest.get(`${BASE_URL}/products`, (req: any, res: any, ctx: any) => {
    return res(
      ctx.status(200),
      ctx.json({
        content: [
          {
            id: 1,
            title: "Example Product 1",
            description: "Description for product 1",
            mrp_price: 100,
            selling_price: 80,
            sizes: ["S", "M", "L"],
          },
          {
            id: 2,
            title: "Example Product 2",
            description: "Description for product 2",
            mrp_price: 200,
            selling_price: 180,
            sizes: ["M", "L"],
          }
        ]
      })
    );
  }),

  rest.post(`${BASE_URL}/api/cart/add`, (req: any, res: any, ctx: any) => {
    return res(ctx.status(202));
  }),

  rest.get(`${BASE_URL}/api/cart`, (req: any, res: any, ctx: any) => {
    return res(
      ctx.status(200),
      ctx.json({
        items: [
          {
            productId: 1,
            quantity: 1,
            size: "M",
          }
        ]
      })
    );
  }),

  rest.post(`${BASE_URL}/api/orders`, (req: any, res: any, ctx: any) => {
    return res(ctx.status(201));
  }),

  rest.get(`${BASE_URL}/api/orders`, (req: any, res: any, ctx: any) => {
    return res(
      ctx.status(200),
      ctx.json({
        orders: [
          {
            id: 1,
            address: "Test Address",
            paymentMethod: "COD",
            status: "Pending",
          }
        ]
      })
    );
  }),

  rest.post(`${BASE_URL}/auth/sent/login-signup-otp`, (req: any, res: any, ctx: any) => {
    return res(ctx.status(200));
  }),

  rest.post(`${BASE_URL}/auth/signing`, (req: any, res: any, ctx: any) => {
    return res(
      ctx.status(200),
      ctx.json({ jwt: "dummy-jwt-token" })
    );
  }),

  rest.get(`${BASE_URL}/api/admin/users`, (req: any, res: any, ctx: any) => {
    return res(
      ctx.status(200),
      ctx.json({
        users: [
          { id: 1, email: "user1@example.com" },
          { id: 2, email: "user2@example.com" },
        ],
      })
    );
  }),
];
