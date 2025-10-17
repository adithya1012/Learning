/**
 * Testing IndexedDBShim - Unit Testing Examples
 * Demonstrates how to write tests for IndexedDB code using IndexedDBShim
 */

// Mock testing framework (in real project, use Jest, Mocha, etc.)
class SimpleTestFramework {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  describe(description, testFunction) {
    console.log(`\n📦 ${description}`);
    console.log("-".repeat(50));
    testFunction.call(this);
  }

  async it(description, testFunction) {
    try {
      await testFunction();
      console.log(`✅ ${description}`);
      this.passed++;
    } catch (error) {
      console.log(`❌ ${description}`);
      console.log(`   Error: ${error.message}`);
      this.failed++;
    }
  }

  async expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected ${expected}, but got ${actual}`);
        }
      },
      toEqual: (expected) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(
            `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(
              actual
            )}`
          );
        }
      },
      toBeGreaterThan: (expected) => {
        if (actual <= expected) {
          throw new Error(`Expected ${actual} to be greater than ${expected}`);
        }
      },
      toBeTruthy: () => {
        if (!actual) {
          throw new Error(`Expected ${actual} to be truthy`);
        }
      },
      toBeFalsy: () => {
        if (actual) {
          throw new Error(`Expected ${actual} to be falsy`);
        }
      },
      toContain: (expected) => {
        if (!actual.includes(expected)) {
          throw new Error(`Expected ${actual} to contain ${expected}`);
        }
      },
      toBeInstanceOf: (expectedClass) => {
        if (!(actual instanceof expectedClass)) {
          throw new Error(
            `Expected ${actual} to be instance of ${expectedClass.name}`
          );
        }
      },
    };
  }

  printResults() {
    console.log("\n" + "=".repeat(60));
    console.log(
      `📊 Test Results: ${this.passed} passed, ${this.failed} failed`
    );
    if (this.failed === 0) {
      console.log("🎉 All tests passed!");
    } else {
      console.log("⚠️  Some tests failed");
    }
    console.log("=".repeat(60));
  }
}

// Database wrapper class for testing
class TestDatabaseWrapper {
  constructor(dbName = "TestDB") {
    this.dbName = dbName;
    this.db = null;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Users store
        const userStore = db.createObjectStore("users", {
          keyPath: "id",
          autoIncrement: true,
        });
        userStore.createIndex("email", "email", { unique: true });
        userStore.createIndex("age", "age", { unique: false });

        // Posts store
        const postStore = db.createObjectStore("posts", {
          keyPath: "id",
          autoIncrement: true,
        });
        postStore.createIndex("userId", "userId", { unique: false });
        postStore.createIndex("category", "category", { unique: false });
      };
    });
  }

  async addUser(userData) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");
      const request = store.add(userData);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUser(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const index = store.index("email");
      const request = index.get(email);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllUsers() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateUser(userData) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");
      const request = store.put(userData);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteUser(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUsersByAgeRange(minAge, maxAge) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const index = store.index("age");
      const range = IDBKeyRange.bound(minAge, maxAge);
      const request = index.getAll(range);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async cleanup() {
    await this.close();

    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(this.dbName);
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  }
}

// Test Suite
async function runTests() {
  console.log("🧪 Starting IndexedDBShim Unit Tests");
  console.log(
    "Using IndexedDB implementation:",
    typeof shimIndexedDB !== "undefined" ? "Shimmed" : "Native or Shimmed"
  );

  const test = new SimpleTestFramework();
  let dbWrapper;

  test.describe("IndexedDBShim Basic Functionality", function () {
    this.it("should have IndexedDB available", async () => {
      await test.expect(typeof indexedDB).toBe("object");
      await test.expect(typeof indexedDB.open).toBe("function");
    });

    this.it("should create and initialize database", async () => {
      dbWrapper = new TestDatabaseWrapper("TestDB_" + Date.now());
      const db = await dbWrapper.initialize();
      await test.expect(db).toBeTruthy();
      await test.expect(db.objectStoreNames.contains("users")).toBeTruthy();
      await test.expect(db.objectStoreNames.contains("posts")).toBeTruthy();
    });
  });

  test.describe("CRUD Operations", function () {
    this.it("should add a user", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        age: 30,
      };

      const userId = await dbWrapper.addUser(userData);
      await test.expect(typeof userId).toBe("number");
      await test.expect(userId).toBeGreaterThan(0);
    });

    this.it("should retrieve a user by ID", async () => {
      const user = await dbWrapper.getUser(1);
      await test.expect(user).toBeTruthy();
      await test.expect(user.name).toBe("John Doe");
      await test.expect(user.email).toBe("john@example.com");
    });

    this.it("should retrieve a user by email index", async () => {
      const user = await dbWrapper.getUserByEmail("john@example.com");
      await test.expect(user).toBeTruthy();
      await test.expect(user.name).toBe("John Doe");
    });

    this.it("should update a user", async () => {
      const updatedUser = {
        id: 1,
        name: "John Smith",
        email: "john@example.com",
        age: 31,
      };

      await dbWrapper.updateUser(updatedUser);
      const user = await dbWrapper.getUser(1);
      await test.expect(user.name).toBe("John Smith");
      await test.expect(user.age).toBe(31);
    });

    this.it("should add multiple users", async () => {
      const users = [
        { name: "Alice", email: "alice@example.com", age: 25 },
        { name: "Bob", email: "bob@example.com", age: 35 },
        { name: "Charlie", email: "charlie@example.com", age: 28 },
      ];

      for (const userData of users) {
        await dbWrapper.addUser(userData);
      }

      const allUsers = await dbWrapper.getAllUsers();
      await test.expect(allUsers.length).toBe(4); // Including the first user
    });

    this.it("should handle unique constraint violations", async () => {
      try {
        await dbWrapper.addUser({
          name: "Duplicate",
          email: "john@example.com", // Duplicate email
          age: 40,
        });
        throw new Error("Should have thrown constraint error");
      } catch (error) {
        // This should fail due to unique email constraint
        await test.expect(error.name).toContain("Constraint");
      }
    });

    this.it("should delete a user", async () => {
      await dbWrapper.deleteUser(1);
      const user = await dbWrapper.getUser(1);
      await test.expect(user).toBeFalsy();
    });
  });

  test.describe("Index Queries", function () {
    this.it("should query users by age range", async () => {
      const users = await dbWrapper.getUsersByAgeRange(25, 30);
      await test.expect(users.length).toBe(2); // Alice (25) and Charlie (28)

      const ages = users.map((user) => user.age);
      await test.expect(ages).toContain(25);
      await test.expect(ages).toContain(28);
    });

    this.it("should handle empty query results", async () => {
      const users = await dbWrapper.getUsersByAgeRange(50, 60);
      await test.expect(users.length).toBe(0);
    });
  });

  test.describe("Transaction Handling", function () {
    this.it("should handle transaction rollback on error", async () => {
      try {
        // Start a transaction that will fail
        const transaction = dbWrapper.db.transaction(["users"], "readwrite");
        const store = transaction.objectStore("users");

        // Add a user that will succeed
        store.add({ name: "Test User", email: "test@example.com", age: 25 });

        // Try to add a user with duplicate email (should fail)
        store.add({ name: "Duplicate", email: "alice@example.com", age: 30 });

        await new Promise((resolve, reject) => {
          transaction.oncomplete = resolve;
          transaction.onerror = reject;
          transaction.onabort = reject;
        });
      } catch (error) {
        // Transaction should have been rolled back
        const user = await dbWrapper.getUserByEmail("test@example.com");
        await test.expect(user).toBeFalsy();
      }
    });
  });

  test.describe("Cursor Operations", function () {
    this.it("should iterate through users with cursor", async () => {
      const users = await new Promise((resolve, reject) => {
        const transaction = dbWrapper.db.transaction(["users"], "readonly");
        const store = transaction.objectStore("users");
        const results = [];

        const request = store.openCursor();
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        request.onerror = () => reject(request.error);
      });

      await test.expect(users.length).toBeGreaterThan(0);
    });
  });

  test.describe("Cleanup", function () {
    this.it("should close database connection", async () => {
      await dbWrapper.close();
      await test.expect(dbWrapper.db).toBeFalsy();
    });

    this.it("should delete test database", async () => {
      await dbWrapper.cleanup();
      // Database should be deleted (no easy way to verify this)
    });
  });

  // Print test results
  test.printResults();

  return {
    passed: test.passed,
    failed: test.failed,
    total: test.passed + test.failed,
  };
}

// Performance testing
async function runPerformanceTests() {
  console.log("\n⚡ Running Performance Tests");
  console.log("=".repeat(50));

  const dbWrapper = new TestDatabaseWrapper("PerformanceTestDB");
  await dbWrapper.initialize();

  // Test bulk inserts
  console.log("📊 Testing bulk insert performance...");
  const startTime = performance.now();

  const promises = [];
  for (let i = 0; i < 1000; i++) {
    promises.push(
      dbWrapper.addUser({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 20 + (i % 40),
      })
    );
  }

  await Promise.all(promises);
  const endTime = performance.now();

  console.log(
    `✅ Inserted 1000 users in ${(endTime - startTime).toFixed(2)}ms`
  );
  console.log(
    `📈 Average: ${((endTime - startTime) / 1000).toFixed(2)}ms per insert`
  );

  // Test bulk read
  console.log("\n📊 Testing bulk read performance...");
  const readStartTime = performance.now();

  const allUsers = await dbWrapper.getAllUsers();
  const readEndTime = performance.now();

  console.log(
    `✅ Read ${allUsers.length} users in ${(
      readEndTime - readStartTime
    ).toFixed(2)}ms`
  );

  await dbWrapper.cleanup();
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SimpleTestFramework,
    TestDatabaseWrapper,
    runTests,
    runPerformanceTests,
  };
}

// Auto-run in browser
if (typeof window !== "undefined") {
  window.runTests = runTests;
  window.runPerformanceTests = runPerformanceTests;

  window.addEventListener("load", () => {
    console.log("🧪 IndexedDBShim Testing loaded.");
    console.log("Run runTests() to execute unit tests");
    console.log("Run runPerformanceTests() to execute performance tests");
  });
}
