import { describe, it, expect } from "vitest";

// Extraemos la logica de validacion para poder probarla
const users = {
  admin: { username: "admin", password: "admin123" },
  seller: { username: "vendedor", password: "venta123" },
  technician: { username: "tecnico", password: "repara123" },
};

function validateLogin(role, username, password) {
  const selectedUser = users[role];
  if (!selectedUser) return false;
  return (
    username.trim() === selectedUser.username &&
    password === selectedUser.password
  );
}

describe("Login - Pruebas de autenticacion", () => {
  it("Admin con credenciales correctas debe ingresar", () => {
    expect(validateLogin("admin", "admin", "admin123")).toBe(true);
  });

  it("Vendedor con credenciales correctas debe ingresar", () => {
    expect(validateLogin("seller", "vendedor", "venta123")).toBe(true);
  });

  it("Tecnico con credenciales correctas debe ingresar", () => {
    expect(validateLogin("technician", "tecnico", "repara123")).toBe(true);
  });

  it("Contrasena incorrecta debe rechazar el acceso", () => {
    expect(validateLogin("admin", "admin", "wrongpassword")).toBe(false);
  });

  it("Usuario incorrecto debe rechazar el acceso", () => {
    expect(validateLogin("admin", "usuariofalso", "admin123")).toBe(false);
  });

  it("Rol inexistente debe rechazar el acceso", () => {
    expect(validateLogin("hacker", "admin", "admin123")).toBe(false);
  });

  it("Campos vacios deben rechazar el acceso", () => {
    expect(validateLogin("admin", "", "")).toBe(false);
  });

  it("Espacios en blanco en usuario deben ser ignorados", () => {
    expect(validateLogin("admin", "  admin  ", "admin123")).toBe(true);
  });
});