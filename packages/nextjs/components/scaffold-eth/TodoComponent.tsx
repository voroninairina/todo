import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface Todo {
  id: bigint;
  content: string;
  completed: boolean;
  createdAt: bigint;
  completedAt: bigint;
}

export const TodoComponent = () => {
  const { address } = useAccount();
  const [newTodo, setNewTodo] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);

  const { data: deployedContractData } = useDeployedContractInfo("TodoList");

  const { data: todoCount } = useScaffoldReadContract({
    contractName: "TodoList",
    functionName: "getTodoCount",
  });

  const { data: stats } = useScaffoldReadContract({
    contractName: "TodoList",
    functionName: "getStats",
  });

  const { data: userTodos, refetch: refetchTodos } = useScaffoldReadContract({
    contractName: "TodoList",
    functionName: "getMyTodos",
  });

  const { writeContractAsync: createTodo, isPending: creating } = useScaffoldWriteContract("TodoList");
  const { writeContractAsync: toggleTodo, isPending: toggling } = useScaffoldWriteContract("TodoList");
  const { writeContractAsync: deleteTodo, isPending: deleting } = useScaffoldWriteContract("TodoList");

  // Загружаем todos когда они меняются
  useEffect(() => {
    if (userTodos) {
      setTodos(userTodos as Todo[]);
    }
  }, [userTodos]);

  const handleCreateTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      await createTodo({
        functionName: "createTodo",
        args: [newTodo],
      });
      setNewTodo("");
      setTimeout(() => refetchTodos(), 2000); // Ждем подтверждения транзакции
    } catch (error) {
      console.error("Error creating todo:", error);
    }
  };

  const handleToggleTodo = async (id: number) => {
    try {
      await toggleTodo({
        functionName: "toggleTodo",
        args: [BigInt(id)],
      });
      setTimeout(() => refetchTodos(), 2000);
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await deleteTodo({
        functionName: "deleteTodo",
        args: [BigInt(id)],
      });
      setTimeout(() => refetchTodos(), 2000);
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-3xl font-bold mb-6 justify-center">📝 Блокчейн TODO-лист</h2>

          {/* Статистика */}
          {stats && (
            <div className="mb-6">
              <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                <div className="stat">
                  <div className="stat-figure text-primary">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="stat-title">Всего задач</div>
                  <div className="stat-value text-primary">{stats[0]?.toString()}</div>
                </div>

                <div className="stat">
                  <div className="stat-figure text-success">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="stat-title">Выполнено</div>
                  <div className="stat-value text-success">{stats[1]?.toString()}</div>
                </div>

                <div className="stat">
                  <div className="stat-figure text-warning">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <div className="stat-title">В процессе</div>
                  <div className="stat-value text-warning">{stats[2]?.toString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* Форма добавления новой задачи */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Добавьте новую задачу..."
              className="input input-bordered flex-1"
              value={newTodo}
              onChange={e => setNewTodo(e.target.value)}
              onKeyPress={e => e.key === "Enter" && handleCreateTodo()}
            />
            <button className="btn btn-primary" onClick={handleCreateTodo} disabled={creating || !newTodo.trim()}>
              {creating ? <span className="loading loading-spinner"></span> : "➕ Добавить"}
            </button>
          </div>

          {/* Список задач */}
          <div className="space-y-4">
            {todos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg text-gray-500">Задач пока нет. Добавьте первую задачу!</p>
              </div>
            ) : (
              todos.map(todo => (
                <div
                  key={todo.id.toString()}
                  className={`card bg-base-200 shadow ${todo.completed ? "opacity-60" : ""}`}
                >
                  <div className="card-body py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleToggleTodo(Number(todo.id))}
                          className="checkbox checkbox-primary"
                          disabled={toggling || todo.completed}
                        />
                        <div className="flex-1">
                          <p className={`text-lg ${todo.completed ? "line-through text-gray-500" : ""}`}>
                            {todo.content}
                          </p>
                          <div className="text-sm text-gray-500">
                            Создано: {formatDate(todo.createdAt)}
                            {todo.completed && ` • Выполнено: ${formatDate(todo.completedAt)}`}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTodo(Number(todo.id))}
                        disabled={deleting}
                        className="btn btn-sm btn-error"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Информация о контракте */}
          <div className="text-center text-sm text-base-content/60 mt-6">
            <p>Всего задач: {todoCount?.toString() || "0"}</p>
            <p>Адрес контракта: {deployedContractData?.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
