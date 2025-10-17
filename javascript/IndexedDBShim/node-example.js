/**
 * Node.js IndexedDBShim Example
 * Demonstrates how to use IndexedDBShim in a Node.js environment
 */

// Install: npm install indexeddbshim
const { setGlobalVars } = require("indexeddbshim");

// Set up the shim with optional configuration
setGlobalVars(null, {
  // Use memory storage (doesn't persist between runs)
  memoryDatabase: ":memory:",
  // Or use file-based storage
  // databaseBasePath: './db-files'
});

class NodeIndexedDBExample {
  constructor() {
    this.db = null;
    this.dbName = "NodeTestDB";
    this.version = 1;
  }

  async initDatabase() {
    return new Promise((resolve, reject) => {
      console.log("Initializing IndexedDB in Node.js...");

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = (event) => {
        console.error("Database error:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log("✅ Database opened successfully in Node.js");
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        this.db = event.target.result;
        console.log("🔄 Setting up database schema...");

        // Create object stores
        this.createStores();
      };
    });
  }

  createStores() {
    // Tasks store
    if (!this.db.objectStoreNames.contains("tasks")) {
      const taskStore = this.db.createObjectStore("tasks", {
        keyPath: "id",
        autoIncrement: true,
      });

      taskStore.createIndex("status", "status", { unique: false });
      taskStore.createIndex("priority", "priority", { unique: false });
      taskStore.createIndex("dueDate", "dueDate", { unique: false });
      taskStore.createIndex("tags", "tags", {
        unique: false,
        multiEntry: true,
      });

      console.log("📋 Tasks store created");
    }

    // Users store
    if (!this.db.objectStoreNames.contains("users")) {
      const userStore = this.db.createObjectStore("users", {
        keyPath: "userId",
      });

      userStore.createIndex("email", "email", { unique: true });
      userStore.createIndex("role", "role", { unique: false });

      console.log("👥 Users store created");
    }
  }

  async addSampleData() {
    console.log("🌱 Adding sample data...");

    const users = [
      { userId: 1, name: "John Doe", email: "john@example.com", role: "admin" },
      {
        userId: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        role: "user",
      },
      {
        userId: 3,
        name: "Mike Johnson",
        email: "mike@example.com",
        role: "user",
      },
    ];

    const tasks = [
      {
        title: "Complete project documentation",
        description: "Write comprehensive docs for the new feature",
        status: "pending",
        priority: "high",
        assigneeId: 1,
        dueDate: new Date("2024-12-31"),
        tags: ["documentation", "urgent"],
      },
      {
        title: "Code review for PR #123",
        description: "Review the authentication module changes",
        status: "in-progress",
        priority: "medium",
        assigneeId: 2,
        dueDate: new Date("2024-11-15"),
        tags: ["code-review", "authentication"],
      },
      {
        title: "Update dependencies",
        description: "Update all npm packages to latest versions",
        status: "completed",
        priority: "low",
        assigneeId: 3,
        dueDate: new Date("2024-10-30"),
        tags: ["maintenance", "dependencies"],
      },
    ];

    // Add users
    await this.bulkAdd("users", users);

    // Add tasks
    await this.bulkAdd("tasks", tasks);

    console.log("✅ Sample data added successfully");
  }

  async bulkAdd(storeName, items) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      let completed = 0;
      const results = [];

      transaction.oncomplete = () => resolve(results);
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

  async queryTasks(options = {}) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["tasks"], "readonly");
      const store = transaction.objectStore(storeName);

      let source = store;
      let request;

      if (options.index) {
        source = store.index(options.index);
        request = source.getAll(options.value);
      } else {
        request = source.getAll();
      }

      request.onsuccess = (event) => {
        let results = event.target.result;

        // Apply filters
        if (options.filter) {
          results = results.filter(options.filter);
        }

        // Sort results
        if (options.sort) {
          results.sort(options.sort);
        }

        resolve(results);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async generateReport() {
    console.log("\n📊 Generating Task Report...");
    console.log("=".repeat(50));

    try {
      // Get all tasks
      const allTasks = await new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["tasks"], "readonly");
        const store = transaction.objectStore("tasks");
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      // Get all users
      const allUsers = await new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["users"], "readonly");
        const store = transaction.objectStore("users");
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      // Create user lookup
      const userLookup = allUsers.reduce((lookup, user) => {
        lookup[user.userId] = user;
        return lookup;
      }, {});

      // Statistics
      const stats = {
        total: allTasks.length,
        pending: allTasks.filter((t) => t.status === "pending").length,
        inProgress: allTasks.filter((t) => t.status === "in-progress").length,
        completed: allTasks.filter((t) => t.status === "completed").length,
        highPriority: allTasks.filter((t) => t.priority === "high").length,
        overdue: allTasks.filter(
          (t) => t.dueDate < new Date() && t.status !== "completed"
        ).length,
      };

      console.log("📈 Task Statistics:");
      console.log(`   Total Tasks: ${stats.total}`);
      console.log(`   Pending: ${stats.pending}`);
      console.log(`   In Progress: ${stats.inProgress}`);
      console.log(`   Completed: ${stats.completed}`);
      console.log(`   High Priority: ${stats.highPriority}`);
      console.log(`   Overdue: ${stats.overdue}`);

      console.log("\n📋 Task Details:");
      allTasks.forEach((task) => {
        const assignee = userLookup[task.assigneeId];
        const dueDateStr = task.dueDate.toISOString().split("T")[0];
        const statusIcon = {
          pending: "⏳",
          "in-progress": "🔄",
          completed: "✅",
        }[task.status];

        console.log(`   ${statusIcon} ${task.title}`);
        console.log(
          `      Assigned to: ${assignee ? assignee.name : "Unknown"}`
        );
        console.log(`      Priority: ${task.priority} | Due: ${dueDateStr}`);
        console.log(`      Tags: ${task.tags.join(", ")}`);
        console.log("");
      });

      console.log("=".repeat(50));
    } catch (error) {
      console.error("Error generating report:", error);
    }
  }

  async performComplexQueries() {
    console.log("\n🔍 Performing Complex Queries...");

    try {
      // Query 1: Get high priority pending tasks
      const highPriorityPending = await new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["tasks"], "readonly");
        const store = transaction.objectStore("tasks");
        const results = [];

        const request = store.openCursor();
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const task = cursor.value;
            if (task.priority === "high" && task.status === "pending") {
              results.push(task);
            }
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        request.onerror = () => reject(request.error);
      });

      console.log(
        "🔥 High Priority Pending Tasks:",
        highPriorityPending.length
      );

      // Query 2: Get tasks by tag using multiEntry index
      const documentationTasks = await new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["tasks"], "readonly");
        const store = transaction.objectStore("tasks");
        const index = store.index("tags");
        const request = index.getAll("documentation");

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      console.log("📝 Documentation Tasks:", documentationTasks.length);

      // Query 3: Get tasks due in next 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const upcomingTasks = await new Promise((resolve, reject) => {
        const transaction = this.db.transaction(["tasks"], "readonly");
        const store = transaction.objectStore("tasks");
        const index = store.index("dueDate");
        const range = IDBKeyRange.upperBound(thirtyDaysFromNow);
        const request = index.getAll(range);

        request.onsuccess = () => {
          const tasks = request.result.filter(
            (task) => task.status !== "completed" && task.dueDate >= new Date()
          );
          resolve(tasks);
        };
        request.onerror = () => reject(request.error);
      });

      console.log("📅 Upcoming Tasks (30 days):", upcomingTasks.length);
    } catch (error) {
      console.error("Error in complex queries:", error);
    }
  }

  async cleanup() {
    if (this.db) {
      this.db.close();
      console.log("🔐 Database connection closed");
    }
  }
}

// Main execution function
async function runNodeExample() {
  console.log("🚀 Starting Node.js IndexedDBShim Example");
  console.log("IndexedDB available:", typeof indexedDB !== "undefined");

  const example = new NodeIndexedDBExample();

  try {
    await example.initDatabase();
    await example.addSampleData();
    await example.generateReport();
    await example.performComplexQueries();

    console.log("\n✅ Node.js example completed successfully!");
  } catch (error) {
    console.error("❌ Error in Node.js example:", error);
  } finally {
    await example.cleanup();
  }
}

// Export for use in other modules
module.exports = {
  NodeIndexedDBExample,
  runNodeExample,
};

// Run if this file is executed directly
if (require.main === module) {
  runNodeExample()
    .then(() => {
      console.log("🏁 Example finished, exiting...");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Fatal error:", error);
      process.exit(1);
    });
}
