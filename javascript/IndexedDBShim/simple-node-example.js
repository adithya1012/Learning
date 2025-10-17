/**
 * Simple Node.js IndexedDBShim Example
 * Works with in-memory storage, no SQLite required
 */

const { setGlobalVars } = require("indexeddbshim");

// Configure for in-memory usage (no file dependencies)
setGlobalVars(global, {
  checkOrigin: false,
  memoryDatabase: ":memory:", // Use memory storage
  databaseBasePath: "./temp-db", // Fallback path
  useSQLiteOnNode: false, // Disable SQLite requirement
});

console.log("🚀 IndexedDBShim Node.js Simple Example");
console.log("✅ IndexedDB available:", typeof global.indexedDB !== "undefined");
console.log("🔧 Using in-memory storage for demonstration");

// Simple example class
class SimpleNodeExample {
  constructor() {
    this.dbName = "SimpleNodeDB";
    this.version = 1;
  }

  async runExample() {
    console.log("\n📊 Starting simple IndexedDB operations...");

    try {
      // Open database
      const db = await this.openDatabase();
      console.log("✅ Database opened successfully");

      // Add some data
      await this.addData(db, [
        { name: "Alice", age: 25, role: "Developer" },
        { name: "Bob", age: 30, role: "Designer" },
        { name: "Charlie", age: 35, role: "Manager" },
      ]);

      // Read data
      const users = await this.readAllData(db);
      console.log(`📖 Retrieved ${users.length} users:`);
      users.forEach((user, index) => {
        console.log(
          `   ${index + 1}. ${user.name} (${user.age}) - ${user.role}`
        );
      });

      // Update data
      await this.updateUser(db, 1, {
        name: "Alice Johnson",
        age: 26,
        role: "Senior Developer",
      });
      console.log("🔄 Updated user with ID 1");

      // Query by index
      const developers = await this.getUsersByRole(db, "Developer");
      console.log(`🔍 Found ${developers.length} developers`);

      // Delete data
      await this.deleteUser(db, 3);
      console.log("🗑️  Deleted user with ID 3");

      // Final count
      const finalCount = await this.countUsers(db);
      console.log(`📊 Final user count: ${finalCount}`);

      db.close();
      console.log("🔐 Database closed");
    } catch (error) {
      console.error("❌ Error:", error.message);
    }
  }

  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = global.indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => resolve(event.target.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create users store
        const userStore = db.createObjectStore("users", {
          keyPath: "id",
          autoIncrement: true,
        });

        // Create indexes
        userStore.createIndex("name", "name", { unique: false });
        userStore.createIndex("age", "age", { unique: false });
        userStore.createIndex("role", "role", { unique: false });

        console.log("🏗️  Database schema created");
      };
    });
  }

  addData(db, users) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      users.forEach((user) => {
        store.add(user);
      });

      console.log(`➕ Added ${users.length} users`);
    });
  }

  readAllData(db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  updateUser(db, id, userData) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");

      // First get the user
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const user = getRequest.result;
        if (user) {
          // Update user data
          Object.assign(user, userData);
          const putRequest = store.put(user);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error("User not found"));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  getUsersByRole(db, role) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const index = store.index("role");
      const request = index.getAll(role);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  deleteUser(db, id) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  countUsers(db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["users"], "readonly");
      const store = transaction.objectStore("users");
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Run the example
async function main() {
  const example = new SimpleNodeExample();
  await example.runExample();

  console.log("\n🎉 Simple Node.js example completed!");
  console.log(
    "💡 This demonstrates IndexedDBShim working in Node.js environment"
  );
  console.log("🔗 The same code works in browsers with native IndexedDB");
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { SimpleNodeExample };
