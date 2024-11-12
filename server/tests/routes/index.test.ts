import request from "supertest";
import app from "../../src/app";

describe("GET /", () => {
  it("should return a greeting message", async () => {
    const response = await request(app).get("/");

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Welcome to Offering Bowl!" });
  });
});
