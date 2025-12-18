"use client";

import { useAccount } from "wagmi";
import { TodoComponent } from "~~/components/scaffold-eth/TodoComponent";

export default function Home() {
  const { address, isConnected } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 w-full">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">Блокчейн TODO-лист</span>
            <span className="block text-2xl mb-2">Децентрализованное приложение для управления задачами</span>
          </h1>

          {!isConnected ? (
            <div className="alert alert-warning max-w-2xl mx-auto">
              <span>🔗 Пожалуйста, подключите кошелек для использования TODO-листа</span>
            </div>
          ) : (
            <div className="alert alert-success max-w-md mx-auto mb-8 text-center">
              <span>
                ✅ Подключен: {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
              </span>
            </div>
          )}

          <TodoComponent />
        </div>
      </div>
    </>
  );
}
