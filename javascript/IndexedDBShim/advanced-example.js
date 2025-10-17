/**
 * Advanced IndexedDBShim Examples
 * This file demonstrates advanced features and patterns
 */

// Import IndexedDBShim for Node.js environments
// const { shimIndexedDB, setGlobalVars } = require('indexeddbshim');

class AdvancedIndexedDBManager {
  constructor(dbName, version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
    this.stores = new Map();
  }

  /**
   * Initialize database with multiple object stores
   */
  async init(storeConfigs) {
    return new Promise((resolve, reject) => {
      console.log("Initializing advanced IndexedDB...");

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log("Database initialized successfully");
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        this.db = event.target.result;
        console.log("Setting up database schema...");

        // Create object stores based on configuration
        storeConfigs.forEach((config) => {
          this.createObjectStore(config);
        });
      };
    });
  }

  /**
   * Create object store with indexes
   */
  createObjectStore(config) {
    const { name, keyPath, autoIncrement, indexes } = config;

    if (this.db.objectStoreNames.contains(name)) {
      this.db.deleteObjectStore(name);
    }

    const store = this.db.createObjectStore(name, {
      keyPath: keyPath || "id",
      autoIncrement: autoIncrement !== false,
    });

    // Create indexes
    if (indexes) {
      indexes.forEach((index) => {
        store.createIndex(index.name, index.keyPath, {
          unique: index.unique || false,
          multiEntry: index.multiEntry || false,
        });
      });
    }

    this.stores.set(name, store);
    console.log(`Created object store: ${name}`);
  }

  /**
   * Perform bulk operations efficiently
   */
  async bulkInsert(storeName, items) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const results = [];
      let completed = 0;

      transaction.oncomplete = () => {
        console.log(`Bulk insert completed: ${items.length} items`);
        resolve(results);
      };

      transaction.onerror = () => reject(transaction.error);

      items.forEach((item, index) => {
        const request = store.add(item);
        request.onsuccess = (event) => {
          results[index] = event.target.result;
          completed++;
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  /**
   * Advanced cursor operations
   */
  async cursorIteration(storeName, options = {}) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const results = [];

      // Use index if specified
      const source = options.index ? store.index(options.index) : store;

      const cursorRequest = source.openCursor(options.range, options.direction);

      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
          // Apply filter if provided
          if (!options.filter || options.filter(cursor.value)) {
            results.push({
              key: cursor.key,
              primaryKey: cursor.primaryKey,
              value: cursor.value,
            });
          }

          // Skip records if specified
          if (options.skip && options.skip > 0) {
            cursor.advance(options.skip);
            options.skip = 0;
          } else {
            cursor.continue();
          }
        } else {
          console.log(`Cursor iteration completed: ${results.length} items`);
          resolve(results);
        }
      };

      cursorRequest.onerror = () => reject(cursorRequest.error);
    });
  }

  /**
   * Complex queries using indexes
   */
  async queryByIndex(storeName, indexName, value, options = {}) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);

      let request;

      if (options.range) {
        request = index.getAll(options.range, options.count);
      } else if (options.getAllKeys) {
        request = index.getAllKeys(value, options.count);
      } else {
        request = index.getAll(value, options.count);
      }

      request.onsuccess = (event) => {
        console.log(`Query by index '${indexName}' completed`);
        resolve(event.target.result);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Transaction with rollback capability
   */
  async transactionWithRollback(storeNames, operations) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeNames, "readwrite");
      const results = [];
      let operationIndex = 0;

      transaction.oncomplete = () => {
        console.log("Transaction completed successfully");
        resolve(results);
      };

      transaction.onabort = () => {
        console.log("Transaction aborted");
        reject(new Error("Transaction was aborted"));
      };

      transaction.onerror = () => {
        console.log("Transaction error:", transaction.error);
        reject(transaction.error);
      };

      // Execute operations
      operations.forEach((operation, index) => {
        try {
          const store = transaction.objectStore(operation.storeName);
          let request;

          switch (operation.type) {
            case "add":
              request = store.add(operation.data);
              break;
            case "put":
              request = store.put(operation.data);
              break;
            case "delete":
              request = store.delete(operation.key);
              break;
            default:
              throw new Error(`Unknown operation type: ${operation.type}`);
          }

          request.onsuccess = (event) => {
            results[index] = event.target.result;
          };

          request.onerror = () => {
            console.log(`Operation ${index} failed, aborting transaction`);
            transaction.abort();
          };
        } catch (error) {
          console.log("Error in operation:", error);
          transaction.abort();
        }
      });
    });
  }

  /**
   * Database schema migration
   */
  async migrate(newVersion, migrationSteps) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, newVersion);

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.version = newVersion;
        resolve(this.db);
      };

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (event) => {
        this.db = event.target.result;
        const oldVersion = event.oldVersion;

        console.log(`Migrating from version ${oldVersion} to ${newVersion}`);

        migrationSteps.forEach((step) => {
          if (step.fromVersion <= oldVersion && step.toVersion <= newVersion) {
            console.log(`Executing migration step: ${step.description}`);
            step.execute(this.db, event.target.transaction);
          }
        });
      };
    });
  }

  /**
   * Export data for backup
   */
  async exportData(storeNames = null) {
    const stores = storeNames || Array.from(this.db.objectStoreNames);
    const exportData = {};

    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);

      exportData[storeName] = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    console.log("Data export completed");
    return exportData;
  }

  /**
   * Import data for restore
   */
  async importData(data) {
    const storeNames = Object.keys(data);
    const transaction = this.db.transaction(storeNames, "readwrite");

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log("Data import completed");
        resolve();
      };

      transaction.onerror = () => reject(transaction.error);

      storeNames.forEach((storeName) => {
        const store = transaction.objectStore(storeName);

        // Clear existing data
        store.clear();

        // Import new data
        data[storeName].forEach((item) => {
          store.add(item);
        });
      });
    });
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log("Database connection closed");
    }
  }
}

// Example usage
async function advancedExample() {
  try {
    // Initialize the shim if in browser
    if (typeof setGlobalVars === "function") {
      setGlobalVars();
    }

    const dbManager = new AdvancedIndexedDBManager("AdvancedDB", 1);

    // Define store configurations
    const storeConfigs = [
      {
        name: "users",
        keyPath: "id",
        autoIncrement: true,
        indexes: [
          { name: "email", keyPath: "email", unique: true },
          { name: "age", keyPath: "age" },
          { name: "department", keyPath: "department" },
          { name: "skills", keyPath: "skills", multiEntry: true },
        ],
      },
      {
        name: "projects",
        keyPath: "projectId",
        indexes: [
          { name: "status", keyPath: "status" },
          { name: "priority", keyPath: "priority" },
          { name: "assignees", keyPath: "assignees", multiEntry: true },
        ],
      },
    ];

    // Initialize database
    await dbManager.init(storeConfigs);

    // Bulk insert users
    const users = [
      {
        email: "alice@example.com",
        name: "Alice",
        age: 25,
        department: "Engineering",
        skills: ["JavaScript", "React", "Node.js"],
      },
      {
        email: "bob@example.com",
        name: "Bob",
        age: 30,
        department: "Design",
        skills: ["Photoshop", "Figma"],
      },
      {
        email: "charlie@example.com",
        name: "Charlie",
        age: 35,
        department: "Engineering",
        skills: ["Python", "Django", "JavaScript"],
      },
    ];

    await dbManager.bulkInsert("users", users);

    // Query by index
    const engineeringUsers = await dbManager.queryByIndex(
      "users",
      "department",
      "Engineering"
    );
    console.log("Engineering users:", engineeringUsers);

    // Complex cursor iteration with filtering
    const seniorUsers = await dbManager.cursorIteration("users", {
      filter: (user) => user.age >= 30,
      direction: "next",
    });
    console.log("Senior users:", seniorUsers);

    // Transaction with multiple operations
    const operations = [
      {
        type: "add",
        storeName: "projects",
        data: {
          projectId: "P001",
          name: "Website Redesign",
          status: "active",
          priority: "high",
          assignees: [1, 2],
        },
      },
      {
        type: "add",
        storeName: "projects",
        data: {
          projectId: "P002",
          name: "Mobile App",
          status: "planning",
          priority: "medium",
          assignees: [1, 3],
        },
      },
    ];

    await dbManager.transactionWithRollback(["projects"], operations);

    // Export data
    const exportedData = await dbManager.exportData();
    console.log("Exported data structure:", Object.keys(exportedData));

    // Migration example (to version 2)
    const migrationSteps = [
      {
        fromVersion: 1,
        toVersion: 2,
        description: "Add timestamps to users",
        execute: (db, transaction) => {
          // Add new fields or modify schema
          console.log("Migration step executed");
        },
      },
    ];

    // await dbManager.migrate(2, migrationSteps);

    console.log("Advanced example completed successfully!");
  } catch (error) {
    console.error("Error in advanced example:", error);
  }
}

// Run example if in browser
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    console.log(
      "Advanced IndexedDBShim example loaded. Check console for output."
    );
    // Uncomment to run automatically
    // advancedExample();
  });
}

// Export for Node.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = { AdvancedIndexedDBManager, advancedExample };
}
