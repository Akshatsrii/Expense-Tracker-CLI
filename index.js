#!/usr/bin/env node

const { program } = require("commander");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "expenses.json");

function readExpenses() {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
}

function writeExpenses(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function generateId(expenses) {
  return expenses.length ? expenses[expenses.length - 1].id + 1 : 1;
}

program
  .command("add")
  .requiredOption("--description <desc>")
  .requiredOption("--amount <amount>")
  .action((options) => {
    const expenses = readExpenses();

    if (options.amount <= 0) {
      console.log("Amount must be positive");
      return;
    }

    const newExpense = {
      id: generateId(expenses),
      date: new Date().toISOString().split("T")[0],
      description: options.description,
      amount: Number(options.amount)
    };

    expenses.push(newExpense);
    writeExpenses(expenses);

    console.log(`Expense added successfully (ID: ${newExpense.id})`);
  });

program
  .command("list")
  .action(() => {
    const expenses = readExpenses();

    if (!expenses.length) {
      console.log("No expenses found");
      return;
    }

    console.log("ID  Date       Description  Amount");

    expenses.forEach((e) => {
      console.log(
        `${e.id}   ${e.date}  ${e.description}   $${e.amount}`
      );
    });
  });

program
  .command("delete")
  .requiredOption("--id <id>")
  .action((options) => {
    let expenses = readExpenses();
    const id = Number(options.id);

    const updated = expenses.filter((e) => e.id !== id);

    if (expenses.length === updated.length) {
      console.log("Expense not found");
      return;
    }

    writeExpenses(updated);
    console.log("Expense deleted successfully");
  });

program
  .command("update")
  .requiredOption("--id <id>")
  .option("--description <desc>")
  .option("--amount <amount>")
  .action((options) => {
    const expenses = readExpenses();
    const id = Number(options.id);

    const expense = expenses.find((e) => e.id === id);

    if (!expense) {
      console.log("Expense not found");
      return;
    }

    if (options.description) expense.description = options.description;
    if (options.amount) {
      if (options.amount <= 0) {
        console.log("Amount must be positive");
        return;
      }
      expense.amount = Number(options.amount);
    }

    writeExpenses(expenses);
    console.log("Expense updated successfully");
  });

program
  .command("summary")
  .option("--month <month>")
  .action((options) => {
    const expenses = readExpenses();

    if (!expenses.length) {
      console.log("No expenses found");
      return;
    }

    if (options.month) {
      const month = Number(options.month);

      const filtered = expenses.filter((e) => {
        const expenseMonth = new Date(e.date).getMonth() + 1;
        return expenseMonth === month;
      });

      const total = filtered.reduce((sum, e) => sum + e.amount, 0);

      console.log(`Total expenses for month ${month}: $${total}`);
    } else {
      const total = expenses.reduce((sum, e) => sum + e.amount, 0);
      console.log(`Total expenses: $${total}`);
    }
  });

program.parse(process.argv);
