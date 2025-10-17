/**
 * Performance Testing for IndexedDBShim
 * Benchmarks and performance analysis
 */

class IndexedDBPerformanceTester {
  constructor() {
    this.results = [];
    this.currentTest = null;
  }

  /**
   * Start a performance test
   */
  startTest(testName) {
    this.currentTest = {
      name: testName,
      startTime: performance.now(),
      operations: 0,
      memory: this.getMemoryUsage(),
    };
    console.log(`🏁 Starting test: ${testName}`);
  }

  /**
   * End a performance test
   */
  endTest() {
    if (!this.currentTest) return;

    const endTime = performance.now();
    const duration = endTime - this.currentTest.startTime;
    const memoryAfter = this.getMemoryUsage();

    const result = {
      ...this.currentTest,
      endTime,
      duration,
      memoryAfter,
      memoryDelta: memoryAfter - this.currentTest.memory,
      operationsPerSecond: this.currentTest.operations / (duration / 1000),
    };

    this.results.push(result);
    console.log(`✅ Completed: ${result.name} in ${duration.toFixed(2)}ms`);
    console.log(
      `   Operations: ${
        result.operations
      }, Rate: ${result.operationsPerSecond.toFixed(2)} ops/sec`
    );

    this.currentTest = null;
    return result;
  }

  /**
   * Record an operation
   */
  recordOperation() {
    if (this.currentTest) {
      this.currentTest.operations++;
    }
  }

  /**
   * Get memory usage (if available)
   */
  getMemoryUsage() {
    if (typeof performance !== "undefined" && performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Run comprehensive performance tests
   */
  async runAllTests() {
    console.log("🚀 Starting IndexedDBShim Performance Tests");
    console.log("=".repeat(60));

    // Initialize database
    const db = await this.initTestDatabase();

    try {
      // Test 1: Bulk Insert Performance
      await this.testBulkInsert(db, 1000);
      await this.testBulkInsert(db, 5000);
      await this.testBulkInsert(db, 10000);

      // Test 2: Individual Insert Performance
      await this.testIndividualInserts(db, 1000);

      // Test 3: Bulk Read Performance
      await this.testBulkRead(db);

      // Test 4: Index Query Performance
      await this.testIndexQueries(db);

      // Test 5: Cursor Performance
      await this.testCursorIteration(db);

      // Test 6: Update Performance
      await this.testBulkUpdates(db, 1000);

      // Test 7: Delete Performance
      await this.testBulkDeletes(db, 1000);

      // Test 8: Transaction Performance
      await this.testTransactionPerformance(db);

      // Test 9: Concurrent Operations
      await this.testConcurrentOperations(db);
    } finally {
      db.close();
      await this.cleanupDatabase();
    }

    this.printResults();
  }

  async initTestDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("PerformanceTestDB", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => resolve(event.target.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Large dataset store
        const dataStore = db.createObjectStore("data", {
          keyPath: "id",
          autoIncrement: true,
        });
        dataStore.createIndex("category", "category", { unique: false });
        dataStore.createIndex("timestamp", "timestamp", { unique: false });
        dataStore.createIndex("value", "value", { unique: false });
        dataStore.createIndex("tags", "tags", {
          unique: false,
          multiEntry: true,
        });

        // User store
        const userStore = db.createObjectStore("users", {
          keyPath: "id",
          autoIncrement: true,
        });
        userStore.createIndex("email", "email", { unique: true });
        userStore.createIndex("age", "age", { unique: false });
        userStore.createIndex("department", "department", { unique: false });
      };
    });
  }

  async testBulkInsert(db, count) {
    this.startTest(`Bulk Insert (${count} items)`);

    const transaction = db.transaction(["data"], "readwrite");
    const store = transaction.objectStore("data");

    const data = this.generateTestData(count);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        this.endTest();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);

      data.forEach((item) => {
        store.add(item);
        this.recordOperation();
      });
    });
  }

  async testIndividualInserts(db, count) {
    this.startTest(`Individual Inserts (${count} items)`);

    const data = this.generateTestData(count);

    for (const item of data) {
      await new Promise((resolve, reject) => {
        const transaction = db.transaction(["data"], "readwrite");
        const store = transaction.objectStore("data");
        const request = store.add(item);

        request.onsuccess = () => {
          this.recordOperation();
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    }

    this.endTest();
  }

  async testBulkRead(db) {
    this.startTest("Bulk Read (All Data)");

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["data"], "readonly");
      const store = transaction.objectStore("data");
      const request = store.getAll();

      request.onsuccess = (event) => {
        const results = event.target.result;
        this.currentTest.operations = results.length;
        this.endTest();
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async testIndexQueries(db) {
    this.startTest("Index Queries");

    const categories = ["A", "B", "C", "D", "E"];

    for (const category of categories) {
      await new Promise((resolve, reject) => {
        const transaction = db.transaction(["data"], "readonly");
        const store = transaction.objectStore("data");
        const index = store.index("category");
        const request = index.getAll(category);

        request.onsuccess = (event) => {
          this.recordOperation();
          resolve(event.target.result);
        };
        request.onerror = () => reject(request.error);
      });
    }

    this.endTest();
  }

  async testCursorIteration(db) {
    this.startTest("Cursor Iteration");

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["data"], "readonly");
      const store = transaction.objectStore("data");
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          this.recordOperation();
          cursor.continue();
        } else {
          this.endTest();
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async testBulkUpdates(db, count) {
    this.startTest(`Bulk Updates (${count} items)`);

    // First, get some items to update
    const itemsToUpdate = await new Promise((resolve, reject) => {
      const transaction = db.transaction(["data"], "readonly");
      const store = transaction.objectStore("data");
      const request = store.getAll(null, count);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Update them
    const transaction = db.transaction(["data"], "readwrite");
    const store = transaction.objectStore("data");

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        this.endTest();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);

      itemsToUpdate.forEach((item) => {
        item.updated = new Date();
        item.value = Math.random() * 1000;
        store.put(item);
        this.recordOperation();
      });
    });
  }

  async testBulkDeletes(db, count) {
    this.startTest(`Bulk Deletes (${count} items)`);

    // Get items to delete
    const itemsToDelete = await new Promise((resolve, reject) => {
      const transaction = db.transaction(["data"], "readonly");
      const store = transaction.objectStore("data");
      const request = store.getAll(null, count);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Delete them
    const transaction = db.transaction(["data"], "readwrite");
    const store = transaction.objectStore("data");

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        this.endTest();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);

      itemsToDelete.forEach((item) => {
        store.delete(item.id);
        this.recordOperation();
      });
    });
  }

  async testTransactionPerformance(db) {
    this.startTest("Transaction Performance (Multiple Operations)");

    const transaction = db.transaction(["data", "users"], "readwrite");
    const dataStore = transaction.objectStore("data");
    const userStore = transaction.objectStore("users");

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        this.endTest();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);

      // Mix different operations in one transaction
      for (let i = 0; i < 100; i++) {
        // Add data
        dataStore.add({
          category: "TX",
          value: Math.random() * 1000,
          timestamp: Date.now(),
          tags: ["transaction", "test"],
        });

        // Add user
        userStore.add({
          email: `txuser${i}@example.com`,
          age: 20 + Math.floor(Math.random() * 40),
          department: "Testing",
        });

        this.recordOperation();
        this.recordOperation();
      }
    });
  }

  async testConcurrentOperations(db) {
    this.startTest("Concurrent Operations");

    const promises = [];

    // Create multiple concurrent transactions
    for (let i = 0; i < 10; i++) {
      const promise = new Promise((resolve, reject) => {
        const transaction = db.transaction(["data"], "readwrite");
        const store = transaction.objectStore("data");

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);

        // Add 10 items per transaction
        for (let j = 0; j < 10; j++) {
          store.add({
            category: `CONCURRENT_${i}`,
            value: Math.random() * 1000,
            timestamp: Date.now(),
            tags: ["concurrent", `batch_${i}`],
          });
          this.recordOperation();
        }
      });

      promises.push(promise);
    }

    await Promise.all(promises);
    this.endTest();
  }

  generateTestData(count) {
    const categories = ["A", "B", "C", "D", "E"];
    const tags = ["tag1", "tag2", "tag3", "tag4", "tag5"];
    const data = [];

    for (let i = 0; i < count; i++) {
      data.push({
        category: categories[i % categories.length],
        value: Math.random() * 1000,
        timestamp: Date.now() + i,
        data: `Sample data item ${i}`,
        tags: [tags[i % tags.length], tags[(i + 1) % tags.length]],
      });
    }

    return data;
  }

  async cleanupDatabase() {
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase("PerformanceTestDB");
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  }

  printResults() {
    console.log("\n📊 Performance Test Results");
    console.log("=".repeat(80));

    // Sort results by duration
    const sortedResults = [...this.results].sort(
      (a, b) => b.duration - a.duration
    );

    console.log(
      "| Test Name".padEnd(35) +
        "| Duration (ms)".padEnd(15) +
        "| Ops/sec".padEnd(12) +
        "| Operations |"
    );
    console.log(
      "|" +
        "-".repeat(34) +
        "|" +
        "-".repeat(14) +
        "|" +
        "-".repeat(11) +
        "|" +
        "-".repeat(11) +
        "|"
    );

    sortedResults.forEach((result) => {
      const name = result.name.padEnd(34);
      const duration = result.duration.toFixed(2).padStart(10);
      const opsPerSec = result.operationsPerSecond.toFixed(0).padStart(8);
      const operations = result.operations.toString().padStart(8);

      console.log(
        `| ${name}| ${duration}   | ${opsPerSec}   | ${operations}   |`
      );
    });

    console.log("\n📈 Performance Analysis:");

    // Find fastest and slowest operations
    const fastest = sortedResults[sortedResults.length - 1];
    const slowest = sortedResults[0];

    console.log(
      `🏆 Fastest: ${fastest.name} (${fastest.operationsPerSecond.toFixed(
        0
      )} ops/sec)`
    );
    console.log(
      `🐌 Slowest: ${slowest.name} (${slowest.operationsPerSecond.toFixed(
        0
      )} ops/sec)`
    );

    // Calculate totals
    const totalDuration = this.results.reduce(
      (sum, result) => sum + result.duration,
      0
    );
    const totalOperations = this.results.reduce(
      (sum, result) => sum + result.operations,
      0
    );

    console.log(`📊 Total Duration: ${totalDuration.toFixed(2)}ms`);
    console.log(`📊 Total Operations: ${totalOperations}`);
    console.log(
      `📊 Average Rate: ${(totalOperations / (totalDuration / 1000)).toFixed(
        0
      )} ops/sec`
    );

    // Memory analysis (if available)
    if (this.results.some((r) => r.memoryDelta !== 0)) {
      console.log("\n💾 Memory Usage:");
      this.results.forEach((result) => {
        if (result.memoryDelta !== 0) {
          const delta = (result.memoryDelta / 1024 / 1024).toFixed(2);
          console.log(`   ${result.name}: ${delta} MB`);
        }
      });
    }

    // Recommendations
    console.log("\n💡 Performance Recommendations:");
    console.log("• Use bulk operations (transactions) for better performance");
    console.log(
      "• Index queries are faster than cursor iteration for simple lookups"
    );
    console.log(
      "• Concurrent transactions may have overhead - batch when possible"
    );
    console.log(
      "• Consider the trade-off between memory usage and performance"
    );
  }
}

// Comparison test between different scenarios
async function runComparisonTest() {
  console.log("\n🔄 Running IndexedDB vs WebSQL vs LocalStorage Comparison");
  console.log("(Note: This requires browser support for legacy APIs)");

  const tester = new IndexedDBPerformanceTester();

  // Test IndexedDB performance
  console.log("\n📊 IndexedDBShim Performance:");
  await tester.runAllTests();

  // Note: WebSQL and localStorage tests would be implemented here
  // but are omitted as they're deprecated/limited
}

// Memory leak detection
function detectMemoryLeaks() {
  console.log("\n🔍 Memory Leak Detection");

  if (typeof performance !== "undefined" && performance.memory) {
    const initial = performance.memory.usedJSHeapSize;
    console.log(`Initial memory: ${(initial / 1024 / 1024).toFixed(2)} MB`);

    // Return a function to check memory after operations
    return () => {
      const current = performance.memory.usedJSHeapSize;
      const delta = current - initial;
      console.log(`Current memory: ${(current / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Memory delta: ${(delta / 1024 / 1024).toFixed(2)} MB`);

      if (delta > 10 * 1024 * 1024) {
        // 10MB threshold
        console.log("⚠️  Potential memory leak detected!");
      } else {
        console.log("✅ Memory usage looks normal");
      }
    };
  } else {
    console.log("Memory API not available");
    return () => {};
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    IndexedDBPerformanceTester,
    runComparisonTest,
    detectMemoryLeaks,
  };
}

// Auto-run in browser
if (typeof window !== "undefined") {
  window.IndexedDBPerformanceTester = IndexedDBPerformanceTester;
  window.runComparisonTest = runComparisonTest;
  window.detectMemoryLeaks = detectMemoryLeaks;

  window.addEventListener("load", () => {
    console.log("⚡ IndexedDBShim Performance Testing loaded.");
    console.log("Run new IndexedDBPerformanceTester().runAllTests() to start");
    console.log("Run runComparisonTest() for comprehensive comparison");
  });
}
