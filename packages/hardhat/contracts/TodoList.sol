// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TodoList {
    struct Todo {
        uint256 id;
        string content;
        bool completed;
        uint256 createdAt;
        uint256 completedAt;
    }
    
    mapping(address => Todo[]) public userTodos;
    mapping(address => uint256) public todoCount;
    
    event TodoCreated(address indexed user, uint256 id, string content, uint256 timestamp);
    event TodoCompleted(address indexed user, uint256 id, uint256 timestamp);
    event TodoDeleted(address indexed user, uint256 id, uint256 timestamp);
    
    // CREATE - добавление новой задачи
    function createTodo(string memory _content) external {
        require(bytes(_content).length > 0, "Content cannot be empty");
        
        uint256 newId = todoCount[msg.sender];
        Todo memory newTodo = Todo({
            id: newId,
            content: _content,
            completed: false,
            createdAt: block.timestamp,
            completedAt: 0
        });
        
        userTodos[msg.sender].push(newTodo);
        todoCount[msg.sender]++;
        
        emit TodoCreated(msg.sender, newId, _content, block.timestamp);
    }
    
    // READ - получение всех задач пользователя
    function getMyTodos() external view returns (Todo[] memory) {
        return userTodos[msg.sender];
    }
    
    function getTodoCount() external view returns (uint256) {
        return todoCount[msg.sender];
    }
    
    function getTodo(uint256 _id) external view returns (Todo memory) {
        require(_id < todoCount[msg.sender], "Todo does not exist");
        return userTodos[msg.sender][_id];
    }
    
    // UPDATE - отметка задачи как выполненной
    function toggleTodo(uint256 _id) external {
        require(_id < todoCount[msg.sender], "Todo does not exist");
        require(!userTodos[msg.sender][_id].completed, "Todo already completed");
        
        userTodos[msg.sender][_id].completed = true;
        userTodos[msg.sender][_id].completedAt = block.timestamp;
        
        emit TodoCompleted(msg.sender, _id, block.timestamp);
    }
    
    // DELETE - удаление задачи
    function deleteTodo(uint256 _id) external {
        require(_id < todoCount[msg.sender], "Todo does not exist");
        
        // Сдвигаем элементы массива
        for (uint256 i = _id; i < userTodos[msg.sender].length - 1; i++) {
            userTodos[msg.sender][i] = userTodos[msg.sender][i + 1];
            userTodos[msg.sender][i].id = i;
        }
        
        userTodos[msg.sender].pop();
        todoCount[msg.sender]--;
        
        emit TodoDeleted(msg.sender, _id, block.timestamp);
    }
    
    // Получение статистики
    function getStats() external view returns (uint256 total, uint256 completed, uint256 pending) {
        Todo[] memory todos = userTodos[msg.sender];
        uint256 compCount = 0;
        
        for (uint256 i = 0; i < todos.length; i++) {
            if (todos[i].completed) {
                compCount++;
            }
        }
        
        return (todos.length, compCount, todos.length - compCount);
    }
}