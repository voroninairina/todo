import { expect } from "chai";
import { ethers } from "hardhat";
import { TodoList } from "../typechain-types";

describe("TodoList", function () {
  let todoList: TodoList;
  let owner: any;
  let user1: any;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    const TodoListFactory = await ethers.getContractFactory("TodoList");
    todoList = await TodoListFactory.deploy();
    await todoList.waitForDeployment();
  });

  describe("Todo Creation", function () {
    it("Should create a new todo", async function () {
      await expect(todoList.connect(user1).createTodo("Learn Blockchain"))
        .to.emit(todoList, "TodoCreated")
        .withArgs(user1.address, 0, "Learn Blockchain");

      const todoCount = await todoList.getTodoCount();
      expect(todoCount).to.equal(1);
    });

    it("Should not create empty todo", async function () {
      await expect(todoList.connect(user1).createTodo("")).to.be.revertedWith("Content cannot be empty");
    });
  });

  describe("Todo Management", function () {
    beforeEach(async function () {
      await todoList.connect(user1).createTodo("First task");
      await todoList.connect(user1).createTodo("Second task");
    });

    it("Should mark todo as completed", async function () {
      await expect(todoList.connect(user1).toggleTodo(0)).to.emit(todoList, "TodoCompleted").withArgs(user1.address, 0);

      const todo = await todoList.connect(user1).getTodo(0);
      expect(todo.completed).to.be.true;
    });

    it("Should get user todos", async function () {
      const todos = await todoList.connect(user1).getMyTodos();
      expect(todos.length).to.equal(2);
      expect(todos[0].content).to.equal("First task");
      expect(todos[1].content).to.equal("Second task");
    });

    it("Should delete todo", async function () {
      await expect(todoList.connect(user1).deleteTodo(0)).to.emit(todoList, "TodoDeleted").withArgs(user1.address, 0);

      const todos = await todoList.connect(user1).getMyTodos();
      expect(todos.length).to.equal(1);
      expect(todos[0].content).to.equal("Second task");
    });
  });

  describe("Statistics", function () {
    it("Should return correct stats", async function () {
      await todoList.connect(user1).createTodo("Task 1");
      await todoList.connect(user1).createTodo("Task 2");
      await todoList.connect(user1).toggleTodo(0);

      const stats = await todoList.connect(user1).getStats();
      expect(stats[0]).to.equal(2); // total
      expect(stats[1]).to.equal(1); // completed
      expect(stats[2]).to.equal(1); // pending
    });
  });
});
