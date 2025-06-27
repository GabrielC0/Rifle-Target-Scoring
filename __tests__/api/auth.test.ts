import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/login/route";

// Mock NextRequest
const createMockRequest = (body: any): NextRequest => {
  const request = new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return request;
};

describe("/api/auth/login", () => {
  describe("POST", () => {
    it("should return success with valid credentials (root/admin)", async () => {
      const request = createMockRequest({
        username: "root",
        password: "admin",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.token).toBeDefined();
      expect(data.user).toEqual({
        username: "root",
        id: "root",
      });
    });

    it("should return error with invalid credentials", async () => {
      const request = createMockRequest({
        username: "wrong",
        password: "wrong",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Identifiants invalides");
    });

    it("should return error with missing username", async () => {
      const request = createMockRequest({
        password: "admin",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Nom d'utilisateur et mot de passe requis");
    });

    it("should return error with missing password", async () => {
      const request = createMockRequest({
        username: "root",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Nom d'utilisateur et mot de passe requis");
    });

    it("should return error with empty body", async () => {
      const request = createMockRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Nom d'utilisateur et mot de passe requis");
    });
  });
});
