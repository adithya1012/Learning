/**
 * Comparison: Native IndexedDB vs IndexedDBShim
 * This file demonstrates the differences and similarities
 */

class IndexedDBComparison {
  constructor() {
    this.nativeDB = null;
    this.shimDB = null;
    this.results = {
      native: {},
      shim: {},
    };
  }

  /**
   * Test both native and shimmed IndexedDB
   */
  async runComparison() {
    console.log("🔬 Starting IndexedDB Comparison Test");
    console.log("=".repeat(60));

    // Test native IndexedDB (if available)
    await this.testNativeIndexedDB();

    // Test shimmed IndexedDB
    await this.testShimmedIndexedDB();

    // Compare results
    this.compareResults();
  }

  async testNativeIndexedDB() {
    console.log("\n🏠 Testing Native IndexedDB...");

    try {
      // Store original indexedDB reference
      const originalIndexedDB = window.indexedDB;

      // Check if native IndexedDB is available
      if (!originalIndexedDB || originalIndexedDB.toString().includes("shim")) {
        console.log("❌ Native IndexedDB not available or already shimmed");
        this.results.native.available = false;
        return;
      }

      this.results.native.available = true;

      // Performance test
      const startTime = performance.now();

      await this.performBasicOperations("native", originalIndexedDB);

      const endTime = performance.now();
      this.results.native.performanceMs = endTime - startTime;

      console.log(
        `✅ Native IndexedDB test completed in ${this.results.native.performanceMs.toFixed(
          2
        )}ms`
      );
    } catch (error) {
      console.error("❌ Native IndexedDB test failed:", error);
      this.results.native.error = error.message;
    }
  }

  async testShimmedIndexedDB() {
    console.log("\n🔧 Testing Shimmed IndexedDB...");

    try {
      // Initialize shim
      if (typeof setGlobalVars === "function") {
        setGlobalVars();
      }

      this.results.shim.available = true;
      this.results.shim.isShimmed =
        window.indexedDB.toString().includes("shim") ||
        typeof shimIndexedDB !== "undefined";

      // Performance test
      const startTime = performance.now();

      await this.performBasicOperations("shim", window.indexedDB);

      const endTime = performance.now();
      this.results.shim.performanceMs = endTime - startTime;

      console.log(
        `✅ Shimmed IndexedDB test completed in ${this.results.shim.performanceMs.toFixed(
          2
        )}ms`
      );
    } catch (error) {
      console.error("❌ Shimmed IndexedDB test failed:", error);
      this.results.shim.error = error.message;
    }
  }

  async performBasicOperations(type, idbInstance) {
    const dbName = `TestDB_${type}`;
    const storeName = "testStore";

    return new Promise((resolve, reject) => {
      const request = idbInstance.open(dbName, 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = async (event) => {
        const db = event.target.result;

        try {
          // Test basic CRUD operations
          const testData = [
            { id: 1, name: "Test Item 1", value: Math.random() },
            { id: 2, name: "Test Item 2", value: Math.random() },
            { id: 3, name: "Test Item 3", value: Math.random() },
          ];

          // Add items
          await this.addItems(db, storeName, testData);
          this.results[type].addSuccess = true;

          // Read items
          const readItems = await this.readAllItems(db, storeName);
          this.results[type].readSuccess = readItems.length === testData.length;
          this.results[type].itemCount = readItems.length;

          // Update item
          await this.updateItem(db, storeName, {
            id: 1,
            name: "Updated Item 1",
            value: 999,
          });
          this.results[type].updateSuccess = true;

          // Delete item
          await this.deleteItem(db, storeName, 3);
          this.results[type].deleteSuccess = true;

          // Test cursors
          const cursorItems = await this.testCursor(db, storeName);
          this.results[type].cursorSuccess = cursorItems.length > 0;

          db.close();
          resolve();
        } catch (error) {
          db.close();
          reject(error);
        }
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: "id" });
          store.createIndex("name", "name", { unique: false });
        }
      };
    });
  }

  async addItems(db, storeName, items) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      let completed = 0;

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      items.forEach((item) => {
        const request = store.add(item);
        request.onsuccess = () => {
          completed++;
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  async readAllItems(db, storeName) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateItem(db, storeName, item) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteItem(db, storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async testCursor(db, storeName) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
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
  }

  compareResults() {
    console.log("\n📊 Comparison Results");
    console.log("=".repeat(60));

    const comparison = [
      ["Feature", "Native IndexedDB", "IndexedDBShim"],
      [
        "Available",
        this.results.native.available ? "✅" : "❌",
        this.results.shim.available ? "✅" : "❌",
      ],
      ["Is Shimmed", "❌", this.results.shim.isShimmed ? "✅" : "❌"],
      [
        "Add Operation",
        this.results.native.addSuccess ? "✅" : "❌",
        this.results.shim.addSuccess ? "✅" : "❌",
      ],
      [
        "Read Operation",
        this.results.native.readSuccess ? "✅" : "❌",
        this.results.shim.readSuccess ? "✅" : "❌",
      ],
      [
        "Update Operation",
        this.results.native.updateSuccess ? "✅" : "❌",
        this.results.shim.updateSuccess ? "✅" : "❌",
      ],
      [
        "Delete Operation",
        this.results.native.deleteSuccess ? "✅" : "❌",
        this.results.shim.deleteSuccess ? "✅" : "❌",
      ],
      [
        "Cursor Support",
        this.results.native.cursorSuccess ? "✅" : "❌",
        this.results.shim.cursorSuccess ? "✅" : "❌",
      ],
      [
        "Performance (ms)",
        this.results.native.performanceMs
          ? this.results.native.performanceMs.toFixed(2)
          : "N/A",
        this.results.shim.performanceMs
          ? this.results.shim.performanceMs.toFixed(2)
          : "N/A",
      ],
    ];

    // Print table
    comparison.forEach((row, index) => {
      if (index === 0) {
        console.log(
          `| ${row[0].padEnd(20)} | ${row[1].padEnd(15)} | ${row[2].padEnd(
            15
          )} |`
        );
        console.log(
          "|" +
            "-".repeat(22) +
            "|" +
            "-".repeat(17) +
            "|" +
            "-".repeat(17) +
            "|"
        );
      } else {
        console.log(
          `| ${row[0].padEnd(20)} | ${row[1].padEnd(15)} | ${row[2].padEnd(
            15
          )} |`
        );
      }
    });

    console.log("\n📝 Analysis:");

    if (this.results.native.available && this.results.shim.available) {
      const performanceDiff =
        this.results.shim.performanceMs - this.results.native.performanceMs;
      if (performanceDiff > 0) {
        console.log(
          `⚠️  Shim is ${performanceDiff.toFixed(2)}ms slower than native`
        );
      } else {
        console.log(`✅ Shim performance is comparable to native`);
      }
    }

    if (this.results.shim.isShimmed) {
      console.log("🔧 IndexedDBShim is active and providing compatibility");
    }

    console.log("💡 IndexedDBShim provides the same API as native IndexedDB");
    console.log("🎯 Use IndexedDBShim for consistent cross-browser support");

    // Feature compatibility
    const nativeFeatures = Object.keys(this.results.native).filter(
      (key) => key.endsWith("Success") && this.results.native[key]
    ).length;

    const shimFeatures = Object.keys(this.results.shim).filter(
      (key) => key.endsWith("Success") && this.results.shim[key]
    ).length;

    console.log(
      `📈 Feature compatibility: Native(${nativeFeatures}/5), Shim(${shimFeatures}/5)`
    );
  }

  /**
   * Test specific IndexedDBShim features
   */
  async testShimSpecificFeatures() {
    console.log("\n🔍 Testing Shim-Specific Features...");

    try {
      // Test with different storage backends
      if (typeof setGlobalVars === "function") {
        // Test with localStorage fallback
        setGlobalVars(window, {
          checkOrigin: false,
          useSQLiteOnNode: false,
        });

        console.log("✅ Configured shim with custom options");
      }

      // Test transaction ordering (important for shim)
      await this.testTransactionOrdering();

      console.log("✅ Shim-specific features tested");
    } catch (error) {
      console.error("❌ Shim-specific feature test failed:", error);
    }
  }

  async testTransactionOrdering() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("TransactionTest", 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore("test", { keyPath: "id" });
      };

      request.onsuccess = (event) => {
        const db = event.target.result;

        // Start multiple transactions in sequence
        const tx1 = db.transaction(["test"], "readwrite");
        const tx2 = db.transaction(["test"], "readwrite");

        let tx1Complete = false;
        let tx2Complete = false;

        tx1.oncomplete = () => {
          tx1Complete = true;
          if (tx2Complete) {
            db.close();
            resolve();
          }
        };

        tx2.oncomplete = () => {
          tx2Complete = true;
          if (tx1Complete) {
            db.close();
            resolve();
          }
        };

        tx1.onerror = tx2.onerror = () => {
          db.close();
          reject(new Error("Transaction failed"));
        };

        // Add data in both transactions
        tx1.objectStore("test").add({ id: 1, data: "tx1" });
        tx2.objectStore("test").add({ id: 2, data: "tx2" });
      };

      request.onerror = () => reject(request.error);
    });
  }
}

// Usage example
async function runComparison() {
  const comparison = new IndexedDBComparison();
  await comparison.runComparison();
  await comparison.testShimSpecificFeatures();

  console.log("\n🏁 Comparison completed!");
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { IndexedDBComparison, runComparison };
}

// Auto-run in browser
if (typeof window !== "undefined") {
  window.IndexedDBComparison = IndexedDBComparison;
  window.runComparison = runComparison;

  // Add to global scope for easy testing
  window.addEventListener("load", () => {
    console.log("🔬 IndexedDB Comparison loaded. Run runComparison() to test.");
  });
}
