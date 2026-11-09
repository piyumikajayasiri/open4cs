import assert from "node:assert/strict";
import test from "node:test";
import User, { USER_CATEGORIES } from "../src/models/User.ts";

const account = {
  name: "Test User", email: "test@example.com", passwordHash: "hashed-password",
  category: "STUDENT", role: "USER", status: "ACTIVE",
};

test("registration and admin account values pass schema validation", () => {
  for (const category of USER_CATEGORIES) {
    for (const role of ["USER", "ADMIN"]) {
      assert.equal(new User({ ...account, category, role }).validateSync(), undefined);
    }
  }
});

test("normalizes categories and email and preserves inactive status", () => {
  const user = new User({ ...account, email: " TEST@EXAMPLE.COM ", category: "Student", status: "INACTIVE" });
  assert.equal(user.email, "test@example.com");
  assert.equal(user.category, "STUDENT");
  assert.equal(user.status, "INACTIVE");
  assert.equal(user.validateSync(), undefined);
});

test("legacy inactive accounts are never defaulted to active", () => {
  const user = User.hydrate({ ...account, status: undefined, isActive: false });
  assert.equal(user.status, "INACTIVE");
});

test("rejects unknown roles, categories and statuses", () => {
  for (const field of ["role", "category", "status"]) {
    assert.ok(new User({ ...account, [field]: "INVALID" }).validateSync()?.errors[field]);
  }
});

test("password hashes are excluded from default database queries", () => {
  assert.equal(User.schema.path("passwordHash").options.select, false);
});
