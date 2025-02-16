import { authenticate, authorize } from "../../middleware/authMiddleware";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

describe("Auth Middleware", () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = { header: jest.fn() };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("authenticate", () => {
    it("должен вернуть 401, если токен отсутствует", () => {
      req.header.mockReturnValue(null);

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Нет доступа" });
      expect(next).not.toHaveBeenCalled();
    });

    it("должен вернуть 403, если токен невалидный", () => {
      req.header.mockReturnValue("Bearer invalidToken");
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Неверный токен" });
      expect(next).not.toHaveBeenCalled();
    });

    it("должен вызывать next() при валидном токене", () => {
      req.header.mockReturnValue("Bearer validToken");
      (jwt.verify as jest.Mock).mockReturnValue({ id: 1, role: "admin" });

      authenticate(req, res, next);

      expect(req.user).toEqual({ id: 1, role: "admin" });
      expect(next).toHaveBeenCalled();
    });
  });

  describe("authorize", () => {
    it("должен вернуть 403, если у пользователя нет нужной роли", () => {
      req.user = { id: 1, role: "user" };
      const middleware = authorize(["admin"]);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Нет прав доступа" });
      expect(next).not.toHaveBeenCalled();
    });

    it("должен вызывать next(), если у пользователя есть нужная роль", () => {
      req.user = { id: 1, role: "admin" };
      const middleware = authorize(["admin"]);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
